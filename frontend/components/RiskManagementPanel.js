import React from 'react';
import { AlertTriangle, Shield } from 'lucide-react';

/**
 * Risk Management Panel - Versão 3.0.2 (DETERMINÍSTICA)
 * Reage aos estados críticos do Sentinela e calcula o Drawdown real.
 */
export default function RiskManagementPanel({ data }) {
  // Se não houver dados do WebSocket, não renderizamos lixo na tela
  if (!data) return null;

  // 1. CAPTURA DO SENTIMENTO DETERMINÍSTICO (SAFE, CAUTION, DANGER)
  // O backend agora envia em status_ia. Convertemos para Upper para evitar erros de case.
  const backendSentiment = (data.status_ia || data.risk_level || 'SAFE').toString().toUpperCase();

  // 2. CÁLCULO DINÂMICO DE DRAWDOWN REAL
  // Evita o valor estático de 0.10% usando os valores de banca do state_manager.
  const initialBalance = Number(data.initial_balance) || 100.00;
  const currentBalance = Number(data.balance) || 100.00;
  
  // O drawdown só existe se o saldo atual for menor que o inicial
  const drawdownValue = initialBalance > currentBalance 
    ? ((initialBalance - currentBalance) / initialBalance) * 100 
    : 0;

  // 3. MAPEAMENTO DE ESTADOS V3 (Alinhado com a Ordem de Serviço)
  let riskState = 'low'; // Padrão SAFE
  
  if (backendSentiment === 'DANGER' || drawdownValue >= 5) {
    riskState = 'high';
  } else if (backendSentiment === 'CAUTION' || drawdownValue >= 2) {
    riskState = 'medium';
  }

  // 4. CONFIGURAÇÃO VISUAL REATIVA
  const config = {
    high: {
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/30',
      bar: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]',
      label: 'ALTO / DANGER',
      container: 'border-red-500/20 bg-gradient-to-b from-red-500/5 to-transparent'
    },
    medium: {
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      bar: 'bg-amber-500',
      label: 'MÉDIO / CAUTION',
      container: 'border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent'
    },
    low: {
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      bar: 'bg-emerald-500',
      label: 'BAIXO / SAFE',
      container: 'border-slate-700/30 bg-slate-900/40'
    }
  };

  const style = config[riskState];
  const isLocked = data.status === 'PROTEÇÃO' || data.status?.includes('PROTEÇÃO');

  return (
    <div className={`p-6 rounded-xl border transition-all duration-700 backdrop-blur-sm ${style.container}`}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/20">
        <div className="flex items-center gap-2">
          <Shield size={18} className={style.color} />
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">Gestão de Risco</h3>
        </div>
        <div className={`px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest transition-colors duration-500 ${style.bg} ${style.color}`}>
          {style.label}
        </div>
      </div>

      <div className="space-y-5">
        {/* Drawdown Reativo */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Drawdown Real-Time</span>
            <span className={`text-sm font-bold font-mono ${style.color}`}>
              {drawdownValue.toFixed(2)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-out ${style.bar}`}
              style={{ width: `${Math.min(drawdownValue * 20, 100)}%` }} // Escala visual 0-5%
            />
          </div>
        </div>

        {/* Status do Escudo (Proteção de 15min) */}
        <div className={`p-3.5 rounded-lg border transition-all ${
          isLocked ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-900/50 border-slate-700/10'
        }`}>
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className={`${isLocked ? 'text-blue-400 animate-pulse' : 'text-slate-600'} mt-0.5 shrink-0`} />
            <div className="flex-1 text-[11px]">
              <p className={`font-bold tracking-wide ${isLocked ? 'text-blue-400' : 'text-slate-500'}`}>
                {isLocked ? '🛡️ PROTOCOLO DE EMERGÊNCIA ATIVO' : '🟢 ESCUDO EM STANDBY'}
              </p>
              {isLocked && (
                <p className="text-blue-300/60 mt-1 font-mono uppercase">
                  IA Desativada por Segurança
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 space-y-1 pt-2 border-t border-slate-700/20">
          <p>• Sentimento IA: <span className="text-slate-300">{backendSentiment}</span></p>
          <p>• Corte em 5% de Drawdown ou Gatilho DANGER.</p>
        </div>
      </div>
    </div>
  );
}