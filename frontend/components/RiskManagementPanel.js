import React from 'react';
import { AlertTriangle, Shield, TrendingUp } from 'lucide-react';

/**
 * Risk Management Panel
 * Exibe métricas de risco e configurações de proteção
 */
export default function RiskManagementPanel({ data }) {
  if (!data) return null;

  const calculateRiskMetrics = () => {
    const balance = Number(data.balance) || 0;
    const pnl = Number(data.floating_pnl) || 0;
    const maxDrawdown = Math.abs(pnl) / (balance + Math.abs(pnl)) * 100;
    
    return {
      drawdown: maxDrawdown,
      isLocked: data.status?.includes('PROTEÇÃO'),
      lockRemainingSeconds: parseInt(data.status?.match(/\d+/)?.[0] || 0),
      riskLevel: maxDrawdown > 5 ? 'high' : maxDrawdown > 2 ? 'medium' : 'low',
    };
  };

  const metrics = calculateRiskMetrics();

  const getRiskColor = (level) => {
    switch (level) {
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'low':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getRiskLabel = (level) => {
    switch (level) {
      case 'high':
        return 'ALTO';
      case 'medium':
        return 'MÉDIO';
      case 'low':
        return 'BAIXO';
      default:
        return 'N/A';
    }
  };

  return (
    <div className="p-6 rounded-xl border border-slate-700/30 bg-slate-900/40 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/20">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-100">Gestão de Risco</h3>
        </div>
        <div className={`px-3 py-1 rounded-full border text-xs font-bold ${getRiskColor(metrics.riskLevel)}`}>
          Risco {getRiskLabel(metrics.riskLevel)}
        </div>
      </div>

      <div className="space-y-4">
        {/* Drawdown */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Máx. Drawdown</span>
            <span className={`text-sm font-bold ${metrics.drawdown > 5 ? 'text-red-400' : metrics.drawdown > 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {metrics.drawdown.toFixed(2)}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                metrics.drawdown > 5 ? 'bg-red-500' : metrics.drawdown > 2 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(metrics.drawdown * 20, 100)}%` }}
            />
          </div>
        </div>

        {/* Protection Status */}
        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1 text-xs">
              <p className="text-slate-300 font-semibold">
                {metrics.isLocked ? '🔒 Proteção Ativa' : '🟢 Sem Proteção'}
              </p>
              {metrics.isLocked && (
                <p className="text-blue-400 mt-1">
                  Recuperação em: {Math.ceil(metrics.lockRemainingSeconds / 60)} minutos
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Risk Threshold Info */}
        <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-700/20">
          <p>• Risco baixo: &lt; 2% drawdown</p>
          <p>• Risco médio: 2% - 5%</p>
          <p>• Risco alto: &gt; 5%</p>
        </div>
      </div>
    </div>
  );
}
