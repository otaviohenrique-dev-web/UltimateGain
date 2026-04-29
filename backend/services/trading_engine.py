import time
from dataclasses import dataclass
from typing import List, Optional
import numpy as np

@dataclass
class Trade:
    """Registro de um trade executado."""
    action: str
    position: str
    price: float
    timestamp: float
    pnl: Optional[float] = None

class TradingEngine:
    """Engine de trading isolada - Executa ordens, calcula PnL punitivo e gerencia o modelo IA."""
    
    def __init__(self, model=None, balance=100.0):
        self.model = model
        self.balance = balance
        self.position = 0  # 0=hold, 1=long, -1=short
        self.entry_price = 0.0
        self.trades_history: List[Trade] = []
        self.lstm_state = None
        self.episode_start = np.ones((1,), dtype=bool)
    
    async def predict_action(self, df_clean, feature_cols):
        """Prediz próxima ação usando o modelo RL."""
        if self.model is None:
            return 0
        
        try:
            last_row = df_clean.iloc[-1]
            obs = last_row[feature_cols].values.astype(np.float32)
            
            action, self.lstm_state = self.model.predict(
                obs,
                state=self.lstm_state,
                episode_start=self.episode_start,
                deterministic=True
            )
            
            self.episode_start = np.zeros((1,), dtype=bool)
            return action.item()
        
        except Exception as e:
            print(f">>> ❌ [TradingEngine] Erro na predição IA: {e}")
            return 0
    
    def execute_trade(self, action, current_price, fee_rate=0.001):
        """Executa trade aplicando taxas severas de abertura e fechamento."""
        target_pos = 1 if action == 1 else (-1 if action == 2 else 0)
        
        if target_pos == self.position:
            return None
        
        # Fecha posição anterior se houver
        if self.position != 0:
            pnl_bruto = self._calculate_raw_pnl(current_price)
            # A taxa de fechamento morde o montante final (capital investido + lucro/preju)
            fee_fechamento = (self.balance + pnl_bruto) * fee_rate 
            pnl_liquido = pnl_bruto - fee_fechamento
            
            self.balance += pnl_liquido
            
            self.trades_history.append(Trade(
                action='close',
                position='long' if self.position == 1 else 'short',
                price=current_price,
                timestamp=time.time(),
                pnl=pnl_liquido
            ))
            print(f">>> 📉 [TradingEngine] Posição fechada. PnL: ${pnl_liquido:.2f} | Saldo: ${self.balance:.2f}")
        
        # Abre nova posição
        if target_pos != 0:
            fee_abertura = self.balance * fee_rate
            self.balance -= fee_abertura # Sangramento instantâneo do capital na abertura
            self.position = target_pos
            self.entry_price = current_price
            
            self.trades_history.append(Trade(
                action='open',
                position='long' if target_pos == 1 else 'short',
                price=current_price,
                timestamp=time.time()
            ))
            print(f">>> 🚀 [TradingEngine] Trade: {self.trades_history[-1].position.upper()} @ {current_price:.2f} | Fee Paga: -${fee_abertura:.4f}")
        else:
            self.position = 0
            self.entry_price = 0.0
        
        return target_pos
    
    def _calculate_raw_pnl(self, current_price):
        """Calcula o PnL puro da variação do ativo, sem as taxas."""
        if self.position == 1:
            change_pct = (current_price - self.entry_price) / self.entry_price
        else:
            change_pct = (self.entry_price - current_price) / self.entry_price
        
        return self.balance * change_pct
    
    def get_stats(self):
        closed_trades = [t for t in self.trades_history if t.pnl is not None]
        if not closed_trades:
            return {'total_trades': 0, 'wins': 0, 'losses': 0, 'win_rate': 0.0, 'total_pnl': 0.0}
        
        wins = sum(1 for t in closed_trades if t.pnl > 0)
        losses = sum(1 for t in closed_trades if t.pnl <= 0)
        
        return {
            'total_trades': len(closed_trades),
            'wins': wins,
            'losses': losses,
            'win_rate': round((wins / len(closed_trades) * 100), 2),
            'total_pnl': round(sum(t.pnl for t in closed_trades), 2)
        }