import React, { useState } from 'react';
import { PieChart, PlusCircle, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { Budget } from '../types/finance';
import { api } from '../api/client';

interface BudgetsPageProps {
  budgets: Budget[];
  categories: string[];
  onOpenNewBudget: () => void;
  onRefresh: () => void;
}

export const BudgetsPage: React.FC<BudgetsPageProps> = ({
  budgets,
  categories,
  onOpenNewBudget,
  onRefresh,
}) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const totalBudget = budgets.reduce((sum, b) => sum + b.monthly_limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = Math.max(0, totalBudget - totalSpent);
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this category budget?')) return;
    setDeletingId(id);
    try {
      await api.deleteBudget(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete budget');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Monthly Budgets</h2>
          <p className="text-xs text-slate-400">
            Set discipline thresholds per expense category
          </p>
        </div>
        <button
          onClick={onOpenNewBudget}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition shadow-lg shadow-emerald-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Category Budget</span>
        </button>
      </div>

      {/* Aggregate Overview Card */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Monthly Allocation
            </span>
            <div className="text-2xl font-bold text-white font-mono mt-1">
              ${totalBudget.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Planned Cap</span>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Current Spent
            </span>
            <div className="text-2xl font-bold text-rose-400 font-mono mt-1">
              ${totalSpent.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Actual Outflow</span>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Remaining Buffer
            </span>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              ${totalRemaining.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Unused Limit</span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-slate-300">Total Envelope Used</span>
              <span className="font-mono text-emerald-400">{overallPercentage}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  overallPercentage > 100
                    ? 'bg-rose-500'
                    : overallPercentage > 85
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgets.map((b) => {
          const isOver = b.spent > b.monthly_limit;
          const isWarning = b.percentage >= 80 && !isOver;
          const remaining = Math.max(0, b.monthly_limit - b.spent);

          return (
            <div
              key={b.id}
              className="glass-panel rounded-2xl p-6 relative flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: b.color }}
                    />
                    <h3 className="font-bold text-sm text-white">{b.category}</h3>
                  </div>

                  <button
                    onClick={() => handleDelete(b.id)}
                    disabled={deletingId === b.id}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Delete Budget"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Numbers */}
                <div className="mt-5 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">Spent</span>
                    <span className={`text-xl font-bold font-mono ${isOver ? 'text-rose-400' : 'text-white'}`}>
                      ${b.spent.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Monthly Cap</span>
                    <span className="text-sm font-mono text-slate-400">
                      ${b.monthly_limit.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Status footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between text-xs">
                {isOver ? (
                  <div className="flex items-center space-x-1.5 text-rose-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Over budget by ${(b.spent - b.monthly_limit).toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>${remaining.toFixed(2)} remaining</span>
                  </div>
                )}
                <span className="font-mono text-slate-400 font-semibold">{b.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
