import json
import asyncio
from typing import Callable, List

class StateManager:
    """Gerenciador centralizado, imutável e reativo do estado do bot."""
    
    def __init__(self):
        self._state = {
            'asset': 'BTC/USDT',
            'is_online': True,
            'uptime': '00:00:00',
            'status': 'INICIALIZANDO',
            'balance': 100.0,
            'position': 0,
            'entry_price': 0.0,
            'current_price': 0.0,
            'last_candle': {},
            'markers': [],
            'trades': [],
            'news': [],
            'adaptation': {
                'wins': 0,
                'losses': 0,
                'win_rate': 0.0,
                'total_trades': 0
            }
        }
        self._subscribers: List[Callable] = []
    
    def get(self):
        """Retorna cópia completa do estado."""
        return json.loads(json.dumps(self._state))
    
    def update(self, **kwargs):
        """Atualiza variáveis de estado e notifica listeners se houver mudança."""
        changed = False
        for key, value in kwargs.items():
            if key in self._state:
                if self._state[key] != value:
                    self._state[key] = value
                    changed = True
        
        if changed:
            self._notify_subscribers()
    
    def subscribe(self, callback: Callable):
        """Registra funções (como o broadcast de WebSocket) para ouvir mudanças."""
        self._subscribers.append(callback)
    
    def _notify_subscribers(self):
        state_copy = self.get()
        for callback in self._subscribers:
            try:
                if asyncio.iscoroutinefunction(callback):
                    asyncio.create_task(callback(state_copy))
                else:
                    callback(state_copy)
            except Exception as e:
                print(f">>> ❌ [StateManager] Erro ao notificar: {e}")