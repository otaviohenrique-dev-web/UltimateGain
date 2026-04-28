import asyncio
import time
import pandas as pd
import numpy as np
import pandas_ta_classic as ta

# As mesmas colunas que o modelo RL espera no server.py original
FEATURE_COLS = ['log_ret', 'rsi', 'rsi_slope', 'macd_diff', 'bb_pband', 'bb_width', 'dist_ema50', 'dist_ema200', 'atr_pct']

class DataService:
    """Serviço responsável por buscar e processar dados de mercado isoladamente."""
    
    def __init__(self, exchange):
        self.exchange = exchange
        self.last_fetch_ts = 0
        self.cached_df = None
    
    async def fetch_and_process(self, symbol, timeframe, limit=250):
        """
        Busca OHLCV da API e calcula indicadores.
        Retorna None se o cache de 60s ainda for válido ou se houver erro.
        """
        now = time.time()
        
        # Cache de 60 segundos para poupar cota da API
        if self.last_fetch_ts > 0 and (now - self.last_fetch_ts) < 60:
            return self.cached_df
        
        try:
            print(f">>> 📊 [DataService] Buscando OHLCV ({symbol} {timeframe})...")
            ohlcv = await asyncio.wait_for(
                self.exchange.fetch_ohlcv(symbol, timeframe, limit=limit),
                timeout=15.0
            )
            
            self.last_fetch_ts = now
            print(f">>> ✅ [DataService] Recebido {len(ohlcv)} velas")
            
            # Delega o cálculo pesado do Pandas para uma thread separada (não trava o bot)
            df, df_clean = await asyncio.to_thread(self._process_indicators, ohlcv)
            self.cached_df = df_clean
            
            return df_clean
        
        except asyncio.TimeoutError:
            print(f">>> ⚠️ [DataService] Timeout ao buscar OHLCV")
            return None
        except Exception as e:
            print(f">>> ❌ [DataService] Erro ao buscar OHLCV: {type(e).__name__}: {e}")
            return None
    
    def _process_indicators(self, ohlcv):
        """Cálculo bruto de indicadores extraído do antigo sniper_loop."""
        try:
            df = pd.DataFrame(
                ohlcv,
                columns=['timestamp', 'open', 'high', 'low', 'close', 'volume']
            )
            
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            df['log_ret'] = np.log(df['close'] / df['close'].shift(1))
            
            df['rsi'] = ta.rsi(df['close'], length=14)
            df['rsi_slope'] = df['rsi'].diff()
            
            macd = ta.macd(df['close'])
            if macd is not None and not macd.empty:
                macd_col = [c for c in macd.columns if c.startswith('MACDh') or c.startswith('MACDH')][0]
                df['macd_diff'] = macd[macd_col]
            else:
                df['macd_diff'] = 0.0
            
            bb = ta.bbands(df['close'], length=20, std=2)
            if bb is not None and not bb.empty:
                upper_col = [c for c in bb.columns if c.startswith('BBU')][0]
                lower_col = [c for c in bb.columns if c.startswith('BBL')][0]
                width_col = [c for c in bb.columns if c.startswith('BBB')][0]
                df['bb_pband'] = (df['close'] - bb[lower_col]) / (bb[upper_col] - bb[lower_col])
                df['bb_width'] = bb[width_col]
            else:
                df['bb_pband'], df['bb_width'] = 0.0, 0.0
            
            df['ema50'] = ta.ema(df['close'], length=50)
            df['ema200'] = ta.ema(df['close'], length=200)
            df['dist_ema50'] = (df['close'] - df['ema50']) / df['ema50']
            df['dist_ema200'] = (df['close'] - df['ema200']) / df['ema200']
            
            df['atr'] = ta.atr(df['high'], df['low'], df['close'], length=14)
            df['atr_pct'] = df['atr'] / df['close']
            
            return df, df.dropna().copy()
        
        except Exception as e:
            print(f">>> ❌ [DataService] Erro ao processar indicadores: {e}")
            return None, None