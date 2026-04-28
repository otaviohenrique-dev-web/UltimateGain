import React from 'react';
import { Newspaper, TrendingUp, AlertCircle } from 'lucide-react';

export default function NewsSentinel({ data }) {
  const headlines = Array.isArray(data) ? data : [];
  const displayHeadline = headlines.length > 0 ? headlines[0] : 'Sincronizando notícias...';
  const hasNews = headlines.length > 0;

  return (
    <div className="card-premium p-6 relative overflow-hidden group">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-2xl group-hover:from-amber-500/30 transition-all"></div>
      
      <div className="relative z-10">
        <div className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
          <Newspaper size={14} className="text-amber-400" /> 
          <span>Sentinel</span>
          {hasNews && <div className="w-2 h-2 rounded-full bg-amber-400 soft-pulse"></div>}
        </div>
        
        <div className="text-sm font-semibold text-slate-200 line-clamp-2 leading-tight mb-3">
          {displayHeadline}
        </div>
        
        {hasNews ? (
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <TrendingUp size={12} />
            <span>+{headlines.length - 1} mais notícias</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <AlertCircle size={12} />
            <span>Aguardando dados...</span>
          </div>
        )}
      </div>
    </div>
  );
}
