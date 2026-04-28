import React from 'react';
import { TrendingUp, TrendingDown, Zap, Target, AlertCircle } from 'lucide-react';

/**
 * Quick Performance Analysis Component
 * Exibe métricas críticas do bot em formato compacto
 */
export default function QuickAnalysis({ data }) {
  if (!data) return null;

  const metrics = [
    {
      label: 'Taxa de Vitória',
      value: `${Number(data.adaptation?.win_rate || 0).toFixed(2)}%`,
      icon: TrendingUp,
      color: 'emerald',
      target: 50,
    },
    {
      label: 'Trades Hoje',
      value: data.trades_today || 0,
      icon: Target,
      color: 'cyan',
      trend: null,
    },
    {
      label: 'Geração IA',
      value: `GEN ${data.adaptation?.generation || 1}`,
      icon: Zap,
      color: 'purple',
      trend: null,
    },
    {
      label: 'Acurácia',
      value: `${Number(data.adaptation?.accuracy || 0).toFixed(1)}%`,
      icon: AlertCircle,
      color: 'amber',
      target: 70,
    },
  ];

  const getColorClasses = (colorName) => {
    const colors = {
      emerald: 'text-emerald-400 bg-emerald-500/10',
      cyan: 'text-cyan-400 bg-cyan-500/10',
      purple: 'text-purple-400 bg-purple-500/10',
      amber: 'text-amber-400 bg-amber-500/10',
      blue: 'text-blue-400 bg-blue-500/10',
    };
    return colors[colorName] || colors.cyan;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        const colorClasses = getColorClasses(metric.color);

        return (
          <div
            key={idx}
            className="p-4 rounded-lg border border-slate-700/20 bg-slate-900/30 backdrop-blur-sm hover:border-slate-600/40 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${colorClasses}`}>
                <Icon size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {metric.value}
            </div>
            <div className="text-xs text-slate-400 font-medium">
              {metric.label}
            </div>
            {metric.target && (
              <div className="mt-2 text-xs text-slate-500">
                Target: {metric.target}%
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
