import React from 'react';
import { Activity, TrendingUp, Zap, Brain, Wallet, BarChart3, ArrowUpRight, ArrowDownLeft, Radio, Bitcoin } from 'lucide-react';
import NewsSentinel from './NewsSentinel';
import DojoPanel from './DojoPanel';
import TradingChart from './Chart';

export default function Dashboard({ data, connected }) {
  const remainingSeconds = parseInt(data?.status?.match(/\d+/)?.[0] || 0);
  const isPositive = data?.floating_pnl >= 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] text-slate-100">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-700/30 bg-slate-900/50 backdrop-blur-md py-6">
        <div className="max-w-8xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-75"></div>
                <div className="relative bg-slate-900 px-4 py-2 rounded-lg">
                  <Activity className="text-cyan-400 inline" size={24} />
                  <span className="ml-2 font-black text-2xl gradient-text">ULTIMATE GAIN</span>
                  <span className="ml-2 text-xs bg-linear-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 px-2 py-1 rounded text-cyan-300">V3.0.1 PRO</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 glass-panel px-4 py-2">
                <div className={`status-online ${connected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className="text-xs font-mono">{connected ? 'Sincronizado' : 'Desconectado'}</span>
              </div>
              <div className="text-sm font-mono text-slate-400">⏱️ {data.uptime}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-8xl mx-auto px-6 py-8">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          
          {/* Ativo */}
          <div className="card-premium p-6 group">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={14} className="text-cyan-400" /> Ativo
            </div>
            <div className="text-4xl font-black text-white mono">BTC</div>
            <div className="text-xs text-slate-500 mt-2">/USDT • Spot • 15m</div>
          </div>

          {/* Saldo */}
          <div className="card-premium p-6 group relative overflow-hidden md:col-span-2 lg:col-span-2">
            {isPositive ? (
              <div className="absolute top-0 right-0 w-1 h-full bg-linear-to-b from-emerald-500 to-transparent"></div>
            ) : (
              <div className="absolute top-0 right-0 w-1 h-full bg-linear-to-b from-red-500 to-transparent"></div>
            )}
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Wallet size={14} className="text-purple-400" /> Patrimônio
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="p-3 bg-orange-500/10 rounded-full border border-orange-500/20">
                <Bitcoin size={32} className="text-orange-400" />
              </div>
              <div>
                <div className={`text-4xl font-black font-mono tracking-tight ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${(data.display_balance || data.balance || 0).toFixed(2)}
                </div>
                {data.floating_pnl !== undefined && (
                  <div className={`text-sm font-mono mt-1 flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                    ${Math.abs(data.floating_pnl || 0).toFixed(2)} P&L
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="card-premium p-6">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap size={14} className={data.status.includes("PROTEÇÃO") ? "text-blue-400 animate-pulse" : "text-yellow-400"} /> Status
            </div>
            <div className="text-lg font-bold uppercase tracking-tight text-white">
              {data?.status?.includes("PROTEÇÃO") ? "🔒 Trava" : data?.status}
            </div>
            {data?.status?.includes("PROTEÇÃO") && (
              <div className="mt-3 space-y-1">
                <div className="text-xs text-blue-400 font-mono">{remainingSeconds}s / 900s</div>
                <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-blue-500 to-cyan-400 transition-all" 
                    style={{ width: `${(remainingSeconds / 900) * 100}%` }} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notícias */}
          <NewsSentinel data={data.news} />

          {/* Protocolo */}
          <div className="card-premium p-6 bg-linear-to-br from-purple-900/40 to-slate-900/40">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Brain size={14} className="text-purple-400" /> Protocolo
            </div>
            <div className="text-3xl font-black text-white">GEN {data.adaptation?.generation || 1}</div>
            <div className="text-sm text-emerald-400 font-mono font-bold mt-2">
              ✓ {data.adaptation?.current_win_rate || 0}% Acertos
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-3">
            <div className="card-premium p-6 h-96">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <BarChart3 size={14} className="text-cyan-400" /> Análise de Mercado
              </div>
              <TradingChart data={data} />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Mini Stats */}
            <div className="card-premium p-6">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-400" /> Estatísticas
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Trades Hoje:</span>
                  <span className="font-mono font-bold text-cyan-400">{data.trades_today || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Taxa Vitória:</span>
                  <span className="font-mono font-bold text-emerald-400">{data.adaptation?.win_rate || 0}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Prêmio Total:</span>
                  <span className="font-mono font-bold text-purple-400">${data.total_pnl || 0}</span>
                </div>
                <hr className="border-slate-700/30 my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Posição:</span>
                  <span className={`font-mono font-bold ${data.position === 1 ? 'text-emerald-400' : data.position === -1 ? 'text-red-400' : 'text-slate-400'}`}>
                    {data.position === 1 ? '🟢 LONG' : data.position === -1 ? '🔴 SHORT' : '⚪ HOLD'}
                  </span>
                </div>
              </div>
            </div>

            {/* Dojo Panel */}
            <DojoPanel data={data} />
          </div>
        </div>
      </main>
    </div>
  );
}