import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  CreditCard,
  PlusCircle,
  Trash2,
  Calendar,
  Layers,
  PieChart,
  Repeat
} from 'lucide-react';
import { DashboardStats, RecurringBill } from '../types/finance';
import { api } from '../api/client';
import { MonthlyTrendChart, CategoryDonutChart } from '../components/Charts';

interface AnalyticsPageProps {
  stats: DashboardStats | null;
  onRefresh: () => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ stats, onRefresh }) => {
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [loadingBills, setLoadingBills] = useState(true);
  const [showAddBill, setShowAddBill] = useState(false);
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDay, setBillDueDay] = useState('1');
  const [billCategory, setBillCategory] = useState('Subscriptions');

  const fetchBills = async () => {
    try {
      const data = await api.getRecurringBills();
      setBills(data);
    } catch (err) {
      console.error('Failed to load bills', err);
    } finally {
      setLoadingBills(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(billAmount);
    if (!billName.trim() || isNaN(amount) || amount <= 0) return;

    try {
      await api.createRecurringBill({
        name: billName.trim(),
        amount,
        frequency: 'monthly',
        due_day: parseInt(billDueDay, 10),
        category: billCategory,
        is_active: true,
      });
      setBillName('');
      setBillAmount('');
      setShowAddBill(false);
      await fetchBills();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to add bill');
    }
  };

  const handleDeleteBill = async (id: number) => {
    if (!confirm('Remove this recurring subscription?')) return;
    try {
      await api.deleteRecurringBill(id);
      await fetchBills();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to remove bill');
    }
  };

  if (!stats) return null;

  const totalMonthlyBills = bills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-white">Financial Analytics & Recurring Outflows</h2>
        <p className="text-xs text-slate-400">
          In-depth cash flow trends, recurring subscriptions, and category spending allocations
        </p>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-1">6-Month Trend Dynamics</h3>
          <p className="text-xs text-slate-400 mb-4">Historical comparison of inflow against outflows</p>
          <MonthlyTrendChart data={stats.monthly_trends} />
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-1">Outflow Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Current month percentage weights</p>
          <CategoryDonutChart
            categories={stats.category_breakdown}
            totalExpense={stats.monthly_expenses}
          />
        </div>
      </div>

      {/* Monthly Trajectory Breakdown Table */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4">Historical Cash Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-sans">
                <th className="pb-3 font-semibold">Period</th>
                <th className="pb-3 font-semibold">Total Inflow</th>
                <th className="pb-3 font-semibold">Total Outflow</th>
                <th className="pb-3 font-semibold">Net Savings</th>
                <th className="pb-3 font-semibold text-right">Savings Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stats.monthly_trends.map((item) => {
                const rate = item.income > 0 ? Math.round((item.savings / item.income) * 100) : 0;
                return (
                  <tr key={item.month} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 text-slate-200 font-sans font-medium">{item.month}</td>
                    <td className="py-3 text-emerald-400">+${item.income.toLocaleString()}</td>
                    <td className="py-3 text-rose-400">-${item.expense.toLocaleString()}</td>
                    <td className="py-3 font-bold text-sky-400">
                      {item.savings >= 0 ? '+' : '-'}${Math.abs(item.savings).toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        rate >= 20 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscriptions & Recurring Bills Section */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <Repeat className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Recurring Subscriptions & Bills</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Fixed monthly baseline commitments: <span className="text-white font-mono font-bold">${totalMonthlyBills.toFixed(2)} / month</span>
            </p>
          </div>

          <button
            onClick={() => setShowAddBill(!showAddBill)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition shadow-lg shadow-emerald-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{showAddBill ? 'Cancel' : 'Add Subscription'}</span>
          </button>
        </div>

        {/* Add Bill Form */}
        {showAddBill && (
          <form
            onSubmit={handleAddBill}
            className="p-4 mb-6 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 animate-in fade-in"
          >
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Service / Bill Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Cloud Storage, Gym"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Monthly Cost ($)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="15.00"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Due Day of Month</label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={billDueDay}
                onChange={(e) => setBillDueDay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition"
              >
                Save Subscription
              </button>
            </div>
          </form>
        )}

        {/* Bills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-sm text-white block">{bill.name}</span>
                <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-slate-500" /> Due on the {bill.due_day}
                  {bill.due_day === 1 ? 'st' : bill.due_day === 2 ? 'nd' : bill.due_day === 3 ? 'rd' : 'th'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-mono font-bold text-white text-sm">
                  ${bill.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleDeleteBill(bill.id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Remove Subscription"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
