import React, { useState } from 'react';
import { X, PieChart } from 'lucide-react';
import { api } from '../api/client';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onSuccess: () => void;
}

const BUDGET_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EC4899',
  '#8B5CF6', '#14B8A6', '#6366F1', '#F97316'
];

export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, categories, onSuccess }) => {
  const [category, setCategory] = useState(categories[0] || 'Groceries');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [color, setColor] = useState('#10B981');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const limit = parseFloat(monthlyLimit);
    if (isNaN(limit) || limit <= 0) {
      setError('Please enter a valid monthly limit greater than $0.');
      return;
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    setIsSubmitting(true);
    try {
      await api.createBudget({
        category,
        monthly_limit: limit,
        period_month: currentMonth,
        color,
      });
      onSuccess();
      onClose();
      setMonthlyLimit('');
    } catch (err: any) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-slate-800 text-emerald-400">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Create Category Budget</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-slate-900">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Monthly Limit ($)</label>
            <input
              type="number"
              step="10"
              required
              placeholder="e.g. 500"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Category Color Indicator</label>
            <div className="flex items-center space-x-2">
              {BUDGET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
