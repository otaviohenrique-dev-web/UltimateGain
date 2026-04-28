import React from 'react';
import { TrendingUp, TrendingDown, Zap, Volume2 } from 'lucide-react';

export default function PremiumStats({ data }) {
  if (!data) return null;

  const stats = [
    {
      label: 'Posição',
      value: data.position === 1 ? '🟢 LONG' : data.position === -1 ? '🔴 SHORT' : '⚪ HOLD',
      icon: data.position === 1 ? <TrendingUp size={16} className="text-emerald-400" /> : <TrendingDown size={16} className="text-red-400" />,
      color: data.position === 1 ? 'border-emerald-500/30' : data.position === -1 ? 'border-red-500/30' : 'border-slate-500/30'
    },
    {
      label: 'P&L Flutuante',
      value: `$${Math.abs(data.floating_pnl || 0).toFixed(2)}`,
      icon: <Zap size={16} className={data.floating_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'} />,
      color: data.floating_pnl >= 0 ? 'border-emerald-500/30' : 'border-red-500/30'
    },
    {
      label: 'Volume 24h',
      value: `${(Math.random() * 1000).toFixed(0)} BTC`,
      icon: <Volume2 size={16} className="text-cyan-400" />,
      color: 'border-cyan-500/30'
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, idx) => (
        <div key={idx} className={`card-premium p-4 border-l-2 ${stat.color}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase font-bold">{stat.label}</span>
            {stat.icon}
          </div>
          <div className="text-lg font-bold text-white">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
