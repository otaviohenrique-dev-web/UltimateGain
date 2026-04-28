import { useState, useEffect, useRef } from 'react';

export function useWebSocket() {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  useEffect(() => {
    let isMounted = true;

    // Busca as URLs do .env.local (ou do painel da Vercel no deploy)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:10000/ws';

    // Busca inicial via HTTP para renderizar rápido
    fetch(`${API_URL}/api/state`)
      .then(res => {
        if (!res.ok) throw new Error('Falha na resposta HTTP');
        return res.json();
      })
      .then(json => {
        if (isMounted && !data) setData(json);
      })
      .catch(err => console.error("Erro na busca inicial:", err));

    // Conecta WebSocket para tempo real
    const connectWS = () => {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        if (isMounted) setConnected(true);
      };
      
      ws.current.onmessage = (event) => {
        if (!isMounted) return;
        try {
          setData(JSON.parse(event.data));
        } catch (e) {
          console.error("Erro ao fazer parse dos dados WS:", e);
        }
      };

      ws.current.onclose = () => {
        if (isMounted) {
          setConnected(false);
          if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
          reconnectTimeout.current = setTimeout(connectWS, 3000); // Tenta reconectar a cada 3s
        }
      };
    };

    connectWS();

    return () => {
      isMounted = false;
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (ws.current) {
        ws.current.onclose = null; // Evita ativar a reconexão automática no unmount
        ws.current.close();
      }
    };
  }, []);

  return { data, connected };
}