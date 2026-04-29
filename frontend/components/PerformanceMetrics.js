import React from 'react';
import { BarChart3, TrendingUp, Award, Activity } from 'lucide-react';

export default function PerformanceMetrics({ data }) {
  if (!data) return null;

  const metrics = [
    {
      title: 'Taxa de Acerto',
      value: `${data.adaptation?.win_rate || 0}%`,
      change: '+2.4%',
      icon: Award,
      color: 'from-emerald-500/20 to-emerald-600/20',
      borderColor: 'border-emerald-500/30',
    },
    {
      title: 'Trades Hoje',
      value: data.trades_today || '0',
      change: 'Real-time',
      icon: Activity,
      color: 'from-cyan-500/20 to-blue-600/20',
      borderColor: 'border-cyan-500/30',
    },
    {
      title: 'Ganho Acumulado',
      value: `$${data.total_pnl || '0'}`,
      change: data.total_pnl > 0 ? '↑' : '↓',
      icon: TrendingUp,
      color: 'from-purple-500/20 to-pink-600/20',
      borderColor: 'border-purple-500/30',
    },
    {
      title: 'Proteção Ativa',
      value: data.status?.includes('PROTEÇÃO') ? 'SIM' : 'NÃO',
      change: data.status?.includes('PROTEÇÃO') ? '🔒' : '🟢',
      icon: BarChart3,
      color: 'from-blue-500/20 to-cyan-600/20',
      borderColor: 'border-blue-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <div key={idx} className={`card-premium p-5 border-t-2 ${metric.borderColor} group`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{metric.title}</p>
              </div>
              <Icon size={18} className="text-slate-400 group-hover:text-slate-300" />
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <div className="text-2xl font-black text-white">{metric.value}</div>
              <div className="text-xs text-slate-500">{metric.change}</div>
            </div>

            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div 
            className={`h-full bg-linear-to-r ${metric.color}`}
                style={{ width: '65%' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
