'use client';

import { useWebSocket } from '../hooks/useWebSocket';
import PremiumDashboardV2 from '../components/PremiumDashboardV2';
import { Activity, ShieldAlert } from 'lucide-react';

export default function Home() {
  const { data, connected } = useWebSocket();

  // Tela de Loading Inicial (Antes da primeira resposta HTTP/WS chegar)
  if (!data) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] flex flex-col items-center justify-center text-white font-mono">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
          <Activity className="relative animate-spin text-blue-400" size={48} />
        </div>
        <p className="text-lg font-semibold text-white mb-2">Sincronizando...</p>
        <p className="text-xs text-slate-400">Conectando ao Ultimate Gain Bot</p>
      </div>
    );
  }

  // Tela de Erro caso a API devolva algo inesperado
  if (data.error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] flex flex-col items-center justify-center text-white px-6 text-center max-w-lg mx-auto">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
          <ShieldAlert className="relative text-red-400" size={48} />
        </div>
        <p className="text-lg font-bold text-white mb-2">Conexão indisponível</p>
        <p className="text-xs text-slate-400 mt-4">Verificando disponibilidade do servidor...</p>
        <p className="text-xs text-red-400/70 mt-4 border border-red-500/20 bg-red-500/10 p-3 rounded-lg">
          {data.error}
        </p>
        <p className="text-xs text-slate-500 mt-4">⏳ Reconectando automaticamente...</p>
      </div>
    );
  }

  // Dashboard Premium V2
  return <PremiumDashboardV2 data={data} connected={connected} />;
}