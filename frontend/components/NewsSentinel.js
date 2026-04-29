import { Newspaper, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

export default function NewsSentinel({ news, riskLevel }) {
  // Tradução e Reatividade de Sentimento do Gemini
  const getRiskStatus = (level) => {
    switch (level?.toLowerCase()) {
      case 'seguro':
        return { label: 'SEGURO', color: 'text-emerald-400', icon: <ShieldCheck size={14} /> };
      case 'alerta':
        return { label: 'ALERTA', color: 'text-yellow-400', icon: <AlertTriangle size={14} /> };
      case 'perigo':
        return { label: 'PERIGO', color: 'text-red-400', icon: <Flame size={14} /> };
      default:
        return { label: 'ANALISANDO', color: 'text-slate-400', icon: null };
    }
  };

  const status = getRiskStatus(riskLevel);

  return (
    <div className="w-full bg-slate-900/60 border-y border-slate-700/30 backdrop-blur-md overflow-hidden py-2 flex items-center">
      {/* Indicador de Risco Gemini */}
      <div className={`flex items-center gap-2 px-4 border-r border-slate-700/50 font-bold text-xs ${status.color} z-10 bg-slate-900`}>
        {status.icon}
        {status.label}
      </div>
      
      {/* Letreiro Marquee */}
      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee py-1">
          {news && news.length > 0 ? (
            news.map((item, idx) => (
              <span key={idx} className="mx-8 text-sm text-slate-300 font-medium">
                {item} •
              </span>
            ))
          ) : (
            <span className="mx-8 text-sm text-slate-500">Aguardando fluxo de notícias via Sentinel...</span>
          )}
        </div>
      </div>
    </div>
  );
}