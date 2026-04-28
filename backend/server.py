import asyncio
import time
import json
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import ccxt.async_support as ccxt
from sb3_contrib import RecurrentPPO

# Importando nossos novos módulos limpos
from services.data_service import DataService
from services.trading_engine import TradingEngine
from services.state_manager import StateManager
from services.news_service import NewsService
from loops.trading_loop import trading_loop, heartbeat_loop, news_loop

# Configs
FEATURE_COLS = ['log_ret', 'rsi', 'rsi_slope', 'macd_diff', 'bb_pband', 'bb_width', 'dist_ema50', 'dist_ema200', 'atr_pct']
SYMBOL = 'BTC/USDT'
TIMEFRAME = '15m'
MODEL_PATH = "models/sniper_pro_gen_6.zip"

state_manager = StateManager()
startup_time = time.time()
connected_clients = []

@asynccontextmanager
async def lifespan(app: FastAPI):
    global state_manager
    print(">>> 🚀 Iniciando Ultimate Gain v3.0.1...")
    
    try:
        exchange = ccxt.kraken({'enableRateLimit': True, 'timeout': 30000})
        data_service = DataService(exchange)
        news_service = NewsService(os.environ.get("CRYPTOCOMPARE_API_KEY", ""))
        
        print(f">>> 📍 Carregando cérebro neural em thread oculta...")
        model = await asyncio.to_thread(RecurrentPPO.load, MODEL_PATH, device="cpu") if os.path.exists(MODEL_PATH) else None
        
        trading_engine = TradingEngine(model=model, balance=100.0)
        
        # Dispara os Loops em Background
        asyncio.create_task(heartbeat_loop(state_manager, startup_time))
        asyncio.create_task(trading_loop(data_service, trading_engine, state_manager, FEATURE_COLS, SYMBOL, TIMEFRAME))
        asyncio.create_task(news_loop(news_service, state_manager))
        
        state_manager.update(status='OPERANDO')
        print(">>> 🟢 Tudo online. Aguardando conexões.")
    except Exception as e:
        print(f">>> ❌ Erro Fatal no Boot: {e}")
    
    yield

app = FastAPI(title="Ultimate Gain API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])

@app.get("/api/state")
async def get_state():
    return Response(content=json.dumps(state_manager.get()), media_type="application/json")

@app.post("/api/control/pause")
async def pause():
    state_manager.update(status='PAUSADO')
    return {"status": "pausado"}

@app.post("/api/control/resume")
async def resume():
    state_manager.update(status='OPERANDO')
    return {"status": "operando"}

@app.get("/api/historico")
async def get_historico():
    """Retorna histórico de velas para o gráfico"""
    return []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            # Padrão Push em tempo real (Sem polling pesado no frontend)
            await websocket.send_text(json.dumps(state_manager.get()))
            await asyncio.sleep(0.5)
    except WebSocketDisconnect:
        connected_clients.remove(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=10000)