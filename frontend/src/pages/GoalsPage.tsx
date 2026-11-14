import React, { useState } from 'react';
import { Target, PlusCircle, Calendar, Trash2, CheckCircle2, TrendingUp } from 'lucide-react';
import { Goal } from '../types/finance';
import { api } from '../api/client';

interface GoalsPageProps {
  goals: Goal[];
  onOpenNewGoal: () => void;
  onRefresh: () => void;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({ goals, onOpenNewGoal, onRefresh }) => {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [contributeAmount, setContributeAmount] = useState<{ [id: number]: string }>({});

  const handleQuickContribute = async (goal: Goal) => {
    const inputVal = contributeAmount[goal.id];
    const addVal = parseFloat(inputVal || '0');
    if (isNaN(addVal) || addVal <= 0) return;

    setUpdatingId(goal.id);
    try {
      await api.updateGoal(goal.id, {
        current_amount: goal.current_amount + addVal,
      });
      setContributeAmount((prev) => ({ ...prev, [goal.id]: '' }));
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update goal');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.deleteGoal(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete goal');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Savings Targets & Goals</h2>
          <p className="text-xs text-slate-400">
            Define forward milestones and monitor compound capital accumulation
          </p>
        </div>
        <button
          onClick={onOpenNewGoal}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition shadow-lg shadow-emerald-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Financial Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((g) => {
          const isDone = g.current_amount >= g.target_amount;
          const remaining = Math.max(0, g.target_amount - g.current_amount);
          const targetDateObj = new Date(g.target_date);
          const daysLeft = Math.ceil(
            (targetDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={g.id}
              className="glass-panel rounded-2xl p-6 relative flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-300">
                      {g.category}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">{g.title}</h3>
                  </div>

                  <button
                    onClick={() => handleDelete(g.id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress figures */}
                <div className="mt-5 flex items-baseline justify-between font-mono">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5 font-sans">Accumulated</span>
                    <span className="text-2xl font-bold text-emerald-400">
                      ${g.current_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block mb-0.5 font-sans">Target Objective</span>
                    <span className="text-sm font-semibold text-slate-300">
                      ${g.target_amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(g.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Dates & Time remaining */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5 font-sans">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Target: {g.target_date}
                  </span>
                  <span>
                    {isDone ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Goal Achieved!
                      </span>
                    ) : daysLeft > 0 ? (
                      `${daysLeft} days remaining`
                    ) : (
                      'Past deadline'
                    )}
                  </span>
                </div>
              </div>

              {/* Quick contribute toolbar */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Add funds ($)..."
                  value={contributeAmount[g.id] || ''}
                  onChange={(e) =>
                    setContributeAmount((prev) => ({ ...prev, [g.id]: e.target.value }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleQuickContribute(g)}
                  disabled={updatingId === g.id || !contributeAmount[g.id]}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition shrink-0 disabled:opacity-40"
                >
                  Deposit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
