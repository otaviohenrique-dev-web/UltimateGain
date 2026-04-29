import React, { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Wallet,
  BarChart3,
  ArrowUpRight,
  ArrowDownLeft,
  Radio,
  AlertCircle,
  CheckCircle2,
  Clock,
  Brain,
  Newspaper,
  Target,
  Percent,
  DollarSign,
  Eye,
  EyeOff,
} from 'lucide-react';
import TradingChart from './Chart';
import DojoPanel from './DojoPanel';
import NewsSentinel from './NewsSentinel';
import RiskManagementPanel from './RiskManagementPanel';

export default function PremiumDashboardV2({ data, connected }) {
  const [hideBalance, setHideBalance] = useState(false);
  const [translatedNews, setTranslatedNews] = useState([]);
  
  const isPositive = data?.floating_pnl >= 0;
  // O frontend reage puramente à string do backend
  const isLocked = data?.status === 'PROTEÇÃO' || data?.status?.includes('PROTEÇÃO');
  const remainingSeconds = parseInt(data?.status?.match(/\d+/)?.[0] || 0);
  

  // Efeito para traduzir as notícias automaticamente para PT-BR
  useEffect(() => {
    const translateNews = async () => {
      if (Array.isArray(data?.news) && data.news.length > 0) {
        try {
          const translated = await Promise.all(data.news.map(async (text) => {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(text)}`);
            const json = await res.json();
            return json[0].map(item => item[0]).join(''); // Junta as partes traduzidas
          }));
          setTranslatedNews(translated);
        } catch (error) {
          console.error("Erro ao traduzir notícias:", error);
          setTranslatedNews(data.news); // Fallback para o idioma original caso falhe
        }
      }
    };
    translateNews();
  }, [data?.news]);

  // Helpers
  const formatValue = (val, decimals = 2) => {
    const num = Number(val) || 0;
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatPercent = (val) => {
    const num = Number(val) || 0;
    return num.toFixed(2);
  };

  const formatPnl = (val) => {
    const num = Number(val) || 0;
    return num >= 0 ? `+${formatValue(val)}` : `-${formatValue(Math.abs(val))}`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* ============ HEADER ============ */}
      <header className="relative z-20 border-b border-slate-700/20 bg-slate-900/40 backdrop-blur-sm">
        <div className="max-w-8xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Activity size={20} className="text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  ULTIMATE GAIN
                </h1>
                <p className="text-xs text-slate-400">Pro Trading Bot v3.0.1</p>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div
                className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium ${
                  connected
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    connected ? 'bg-emerald-400' : 'bg-red-400'
                  }`}
                />
                {connected ? 'Conectado' : 'Desconectado'}
              </div>

              {/* Uptime */}
              <div className="px-3 py-1.5 rounded-lg bg-slate-800/40 text-slate-300 flex items-center gap-2 text-xs font-mono">
                <Clock size={14} />
                {data?.uptime || '00:00:00'}
              </div>

              {/* Hide Balance Toggle */}
              <button
                onClick={() => setHideBalance(!hideBalance)}
                className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-colors"
                title="Ocultar saldo"
              >
                {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-8xl mx-auto px-6 py-8">
        
        {/* ============ KPI ROW ============ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          
          {/* 1. Asset */}
          <div className="p-6 rounded-xl border border-slate-700/30 bg-slate-900/40 backdrop-blur-sm hover:border-slate-600/50 transition-colors">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Ativo
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold text-white">{data?.asset || 'BTC'}</h2>
              <span className="text-xs text-slate-500">/USDT</span>
            </div>
            <div className="text-xs text-slate-500 mt-2">Spot • Timeframe 15m</div>
          </div>


          {/* 2. Balance (Main) - Reatividade de PnL Garantida */}
          <div className="lg:col-span-2 p-6 rounded-xl border border-slate-700/30 bg-linear-to-br from-slate-900/60 to-slate-900/30 backdrop-blur-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Patrimônio Disponível
            </div>
            <div>
              {hideBalance ? (
                <div className="text-2xl font-bold text-slate-400">••••••••</div>
              ) : (
                <>
                  {/* O saldo reage diretamente ao data.balance enviado pelo backend (que já deve incluir o PnL fechado) */}
                  <div className={`text-3xl font-bold font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${formatValue(data?.balance || 100.00, 2)}
                  </div>
                  {/* O floating_pnl reage às flutuações das posições abertas */}
                  {data?.floating_pnl !== undefined && (
                    <div className={`text-sm font-mono mt-2 flex items-center gap-2 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? (
                        <ArrowUpRight size={16} />
                      ) : (
                        <ArrowDownLeft size={16} />
                      )}
                      {formatPnl(data.floating_pnl)} ({formatPercent(data.floating_pnl)}%)
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

         {/* 3. Status e Cooldown */}
          <div className={`p-6 rounded-xl border transition-all duration-500 backdrop-blur-sm ${
            isLocked ? 'border-red-500/50 bg-red-500/10 shadow-[inset_0_0_20px_rgba(239,68,68,0.15)]' : 'border-slate-700/30 bg-slate-900/40'
          }`}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 text-slate-400">
              <Zap size={14} className={isLocked ? 'text-red-400' : 'text-yellow-400'} />
              Motor de Operações
            </div>
            
            <div className="flex flex-col justify-between h-[calc(100%-28px)]">
              <div>
                <div className={`text-lg font-bold flex items-center gap-2 ${isLocked ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                  {isLocked ? '🛡️ PROTEÇÃO ATIVA' : '🟢 OPERANDO LIVRE'}
                </div>
              </div>
              
              {/* Feedback Visual de Cooldown exigido pelo Backend */}
              {isLocked && (
                <div className="mt-3 py-1.5 px-3 bg-red-950/50 border border-red-500/30 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] font-bold text-red-300 uppercase tracking-widest text-center">
                    Cooldown de Segurança Ativo<br/>(Bloqueio Manual)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 4. Position */}
          <div className="p-6 rounded-xl border border-slate-700/30 bg-slate-900/40 backdrop-blur-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Target size={14} className="text-purple-400" />
              Posição
            </div>
            <div className="text-2xl font-bold">
              {data?.position === 1 ? (
                <span className="text-emerald-400">🟢 LONG</span>
              ) : data?.position === -1 ? (
                <span className="text-red-400">🔴 SHORT</span>
              ) : (
                <span className="text-slate-400">⚪ HOLD</span>
              )}
            </div>
          </div>
        </div>

        {/* ============ MAIN GRID ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Section: Chart - Sincronização em Tempo Real Resolvida */}
          <div className="lg:col-span-2">
            {/* Chart Card */}
            <div className="p-6 rounded-xl border border-slate-700/30 bg-slate-900/40 backdrop-blur-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-blue-400" />
                  <h3 className="text-sm font-semibold text-slate-100">Análise de Mercado</h3>
                </div>
                <div className="text-xs text-slate-500">Atualização em tempo real (0.5s)</div>
              </div>
              <div className="h-130 w-full bg-slate-800/30 rounded-lg border border-slate-700/20">
                {/* Aqui está o pulo do gato: desestruturar o objeto data do WebSocket para as props que o Chart.js entende */}
                <TradingChart 
                  liveCandle={data?.last_candle} 
                  markersData={data?.markers} 
                  inPosition={data?.position !== 0 && data?.position !== undefined} 
                  entryPrice={data?.entry_price} 
                  currentPosition={data?.position} 
                />
              </div>
            </div>
        </div>

        {/* Right Section: Status & Controls */}
          <div className="space-y-6">
            
            {/* Risk Management Panel */}
            <RiskManagementPanel data={data} />

            {/* Total P&L Card */}
            <div className="p-6 rounded-xl border border-slate-700/30 bg-slate-900/40 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Ganho Total
                </span>
                <DollarSign size={16} className="text-purple-400" />
              </div>
              <div className={`text-2xl font-bold font-mono ${data?.total_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${formatValue(data?.total_pnl || 0)}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Resultado acumulado da sessão
              </div>
            </div>

            {/* Generation Card */}
            <div className="p-6 rounded-xl border bg-linear-to-br from-purple-900/30 to-slate-900/40 backdrop-blur-sm border-purple-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Protocolo IA
                </span>
                <Brain size={16} className="text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-400">
                GEN {data?.adaptation?.generation || 1}
              </div>
              <div className="text-xs text-purple-300/70 mt-2 flex items-center gap-1">
                <CheckCircle2 size={12} />
                Acurácia {formatPercent(data?.adaptation?.accuracy || 0)}%
              </div>
            </div>
{/* News Card */}
            <div className="p-6 rounded-xl border border-slate-700/30 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
              <style>{`
                @keyframes newsMarquee {
                  /* Começa no zero (já visível) e vai até -50% (exatamente onde a cópia começa) */
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .news-scroll {
                  display: flex;
                  width: max-content;
                  /* Aumentado para 150s para leitura confortável */
                  animation: newsMarquee 250s linear infinite; 
                }
                .news-scroll:hover {
                  animation-play-state: paused;
                }
              `}</style>
              
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700/20">
                <Newspaper size={16} className="text-amber-400" />
                <h4 className="text-sm font-semibold text-slate-100">Agente de Notícias Gemini</h4>
                {translatedNews.length > 0 && (
                  <div className="w-2 h-2 rounded-full bg-amber-400 ml-auto animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]"></div>
                )}
              </div>
              
              <div className="relative w-full h-6 overflow-hidden flex items-center mask-fade-edges">
                <div className="news-scroll absolute text-xs text-slate-300 font-medium tracking-wide">
                  {(() => {
                    // Prepara as notícias ou o texto padrão
                    const newsItems = translatedNews.length > 0 
                      ? translatedNews 
                      : ['Aguardando fluxo de notícias do mercado...'];
                    
                    // O Pulo do Gato: Duplica o array para colar o fim no começo!
                    const infiniteLoopArray = [...newsItems, ...newsItems];

                    return infiniteLoopArray.map((item, idx) => (
                      <span key={idx} className="mr-8 flex items-center shrink-0">
                        <span className="text-amber-500 mr-2 text-[10px] animate-pulse">♦</span> 
                        {item}
                      </span>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-6 rounded-xl border border-slate-700/30 bg-slate-900/40 backdrop-blur-sm">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Resumo
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Saldo Inicial:</span>
                  <span className="font-mono text-slate-200">
                    ${formatValue(data?.initial_balance || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-slate-700/20 pt-3">
                  <span className="text-slate-400">ROI Session:</span>
                  <span className={`font-mono font-bold ${data?.total_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPercent(((data?.total_pnl || 0) / (data?.initial_balance || 1)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============ DOJO PANEL ============ */}
        <div className="mt-8">
          <DojoPanel state={data} />
        </div>
      </main>
    </div>
  );
}
