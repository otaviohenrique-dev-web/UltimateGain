import asyncio
import time

async def trading_loop(data_service, trading_engine, state_manager, feature_cols, symbol='BTC/USDT', timeframe='15m'):
    """Core do bot: Busca dados -> Pensa -> Executa -> Atualiza."""
    print(">>> 🟢 [Loop] Trading Loop iniciado...")
    
    while True:
        try:
            current_state = state_manager.get()
            if current_state['status'] not in ['OPERANDO', 'INICIALIZANDO']:
                await asyncio.sleep(1)
                continue
            
            # 1. Dados (Com Cache automático do DataService)
            df = await data_service.fetch_and_process(symbol, timeframe)
            if df is None or len(df) < 2:
                await asyncio.sleep(1)
                continue
            
            # 2. IA Pensa
            action = await trading_engine.predict_action(df, feature_cols)
            
            # 3. Execução
            last_candle = df.iloc[-1]
            current_price = float(last_candle['close'])
            trading_engine.execute_trade(action, current_price)
            
            # 4. Atualiza estado
            stats = trading_engine.get_stats()
            state_manager.update(
                status='OPERANDO',
                balance=round(trading_engine.balance, 2),
                position=trading_engine.position,
                entry_price=round(trading_engine.entry_price, 2),
                current_price=round(current_price, 2),
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
            print(f">>> ❌ [Loop] Erro: {e}")
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
    """Monitor de Notícias."""
    while True:
        try:
            headlines = await news_service.fetch_news()
            state_manager.update(news=headlines)
            await asyncio.sleep(300)
        except:
            await asyncio.sleep(300)