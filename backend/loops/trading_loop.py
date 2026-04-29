import asyncio
import time

# Variável de controle de cooldown (global ao módulo para persistir entre iterações do loop)
cooldown_end_time = 0

async def trading_loop(data_service, trading_engine, state_manager, feature_cols, symbol='BTC/USDT', timeframe='15m'):
    """Core do bot com Protocolo de Emergência (Risk Enforcement)"""
    global cooldown_end_time
    print(">>> 🟢 [Loop] Trading Loop com Protocolo de Emergência iniciado...")
    
    while True:
        try:
            current_state = state_manager.get()
            risk_level = current_state.get('status_ia', 'SAFE')
            current_status = current_state.get('status', 'OPERANDO')
            
            # --- PROTOCOLO DANGER (BOTÃO DE PÂNICO) ---
            if risk_level == 'DANGER':
                if current_status != 'PROTEÇÃO':
                    print(f">>> 🚨 [RiskEnforcement] DANGER DETECTADO! Acionando fechamento de emergência...")
                    
                    # 1. Busca preço atual para fechar a mercado
                    df = await data_service.fetch_and_process(symbol, timeframe)
                    if df is not None:
                        current_price = float(df.iloc[-1]['close'])
                        # Força ação 0 (FECHAR)
                        trading_engine.execute_trade(0, current_price)
                    
                    # 2. Ativa Cooldown e muda status
                    cooldown_end_time = time.time() + 900 # 15 minutos
                    state_manager.update(status='PROTEÇÃO')
            
            # --- VERIFICAÇÃO DE COOLDOWN / PROTEÇÃO ---
            if time.time() < cooldown_end_time:
                remaining = int(cooldown_end_time - time.time())
                if remaining % 60 == 0: # Log a cada minuto de silêncio
                    print(f">>> 🛡️ [RiskEnforcement] Sistema em PROTEÇÃO. Cooldown: {remaining}s restantes.")
                await asyncio.sleep(1)
                continue
            elif current_status == 'PROTEÇÃO':
                # Sai do estado de proteção se o tempo acabou
                state_manager.update(status='OPERANDO')
            
            # --- CLÁUSULA DE GUARDA GERAL ---
            if state_manager.get()['status'] not in ['OPERANDO', 'INICIALIZANDO']:
                await asyncio.sleep(1)
                continue

            # 1. Dados
            df = await data_service.fetch_and_process(symbol, timeframe)
            if df is None or len(df) < 2:
                await asyncio.sleep(1)
                continue
            
            last_candle = df.iloc[-1]
            current_price = float(last_candle['close'])

            # 2. IA Pensa (Com filtro de CAUTION)
            action = await trading_engine.predict_action(df, feature_cols)
            
            # --- FILTRO CAUTION (ATENÇÃO) ---
            if risk_level == 'CAUTION':
                if trading_engine.position == 0:
                    # Se estiver fora do mercado, não entra
                    action = 0 
                else:
                    # Se estiver dentro, só permite FECHAR (ação 0). 
                    target_pos = 1 if action == 1 else (-1 if action == 2 else 0)
                    if target_pos != 0 and target_pos != trading_engine.position:
                        action = 0 # Força o fechamento em vez de inverter a mão

            # 3. Execução
            trading_engine.execute_trade(action, current_price)
            
            # 4. Atualiza estado
            stats = trading_engine.get_stats()
            state_manager.update(
                balance=float(round(trading_engine.balance, 2)),
                # Preserva chaves de outros loops para não serem sobrescritas
                status=current_state.get('status', 'OPERANDO'),
                status_ia=current_state.get('status_ia', 'SAFE'),
                position=int(trading_engine.position),
                entry_price=float(round(trading_engine.entry_price, 2)),
                current_price=float(round(current_price, 2)),
                last_candle={
                    'time': int(last_candle['timestamp'].timestamp()),
                    'open': float(last_candle['open']),
                    'high': float(last_candle['high']),
                    'low': float(last_candle['low']),
                    'close': current_price
                },
                adaptation={**stats}
            )
            
            await asyncio.sleep(1)
        except Exception as e:
            print(f">>> ❌ [Loop] Erro no Protocolo de Risco: {e}")
            await asyncio.sleep(5)

async def heartbeat_loop(state_manager, start_time):
    """Monitor de Uptime."""
    while True:
        try:
            elapsed = int(time.time() - start_time)
            uptime = f"{elapsed // 3600:02d}:{(elapsed % 3600) // 60:02d}:{elapsed % 60:02d}"
            state_manager.update(uptime=uptime)
            await asyncio.sleep(1)
        except:
            await asyncio.sleep(1)

async def news_loop(news_service, state_manager):
    """Monitor de Notícias com Cérebro Analista."""
    while True:
        try:
            # Recebemos as manchetes e o veredito da IA
            headlines, risk_level = await news_service.fetch_news()
            
            state_manager.update(
                news=headlines,
                status_ia=risk_level # Injeção direta para o Escudo do Frontend
            )
            print(f">>> 🧠 [NewsLoop] Sentimento do Mercado: {risk_level}")
            await asyncio.sleep(600) # 10 minutos de intervalo para poupar quota
        except Exception as e:
            print(f">>> ❌ [NewsLoop] Erro: {e}")
            await asyncio.sleep(60)