import React from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { DashboardStats, Account } from '../types/finance';
import { StatCard } from '../components/StatCard';
import { MonthlyTrendChart, CategoryDonutChart } from '../components/Charts';

interface DashboardPageProps {
  stats: DashboardStats | null;
  accounts: Account[];
  onNavigate: (tab: string) => void;
  onOpenNewTransaction: () => void;
  onRefresh: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  accounts,
  onNavigate,
  onOpenNewTransaction,
}) => {
  if (!stats) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-slate-400">Loading financial intelligence...</span>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Privacy & Security Guarantee */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-slate-900 to-slate-900">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Zero Credential & Local Privacy Architecture</h4>
            <p className="text-[11px] text-slate-400">
              No live or stored credentials, tokens, or personal identifiers. 100% locally evaluated with SQLite.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
            {accounts.length} Active Accounts
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {stats.recent_transactions.length}+ Tracked Entries
          </span>
        </div>
      </div>

      {/* Top 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Net Worth"
          value={formatCurrency(stats.total_net_worth)}
          subtext={`Assets: ${formatCurrency(stats.total_assets)}`}
          icon={DollarSign}
          badge={`Debt: ${formatCurrency(stats.total_liabilities)}`}
          badgeType="neutral"
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(stats.monthly_income)}
          subtext="Current Month Inflow"
          icon={TrendingUp}
          badge="+ Inflow"
          badgeType="positive"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(stats.monthly_expenses)}
          subtext="Current Month Outflow"
          icon={CreditCard}
          badge="Live Outflow"
          badgeType="negative"
        />
        <StatCard
          title="Savings Rate"
          value={`${stats.savings_rate}%`}
          subtext={`Saved: ${formatCurrency(stats.monthly_savings)}`}
          icon={Percent}
          badge={stats.savings_rate >= 20 ? 'Target Met (>20%)' : 'Under Target'}
          badgeType={stats.savings_rate >= 20 ? 'positive' : 'negative'}
        />
      </div>

      {/* Visual Charts Grid: Monthly Trends + Spending Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Bar Chart (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Cash Flow Trajectory</h3>
              <p className="text-xs text-slate-400">Comparing income, expenses, and savings over time</p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
            >
              <span>Detailed Analytics</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
          <MonthlyTrendChart data={stats.monthly_trends} />
        </div>

        {/* Category Expense Donut Chart (1 col) */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Monthly Allocation</h3>
                <p className="text-xs text-slate-400">Expenses by category</p>
              </div>
              <button
                onClick={() => onNavigate('budgets')}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
              >
                <span>Budgets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
            <CategoryDonutChart
              categories={stats.category_breakdown}
              totalExpense={stats.monthly_expenses}
            />
          </div>
        </div>
      </div>

      {/* Middle Grid: Budget Progress & Savings Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Utilization Meter */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Category Budget Limits</h3>
              <p className="text-xs text-slate-400">Current month limit vs real spending</p>
            </div>
            <button
              onClick={() => onNavigate('budgets')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Manage Budgets &rarr;
            </button>
          </div>

          <div className="space-y-4">
            {stats.budget_progress.slice(0, 4).map((b) => {
              const isOver = b.spent > b.monthly_limit;
              return (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                      {b.category}
                    </span>
                    <span className="font-mono text-slate-400">
                      <span className={isOver ? 'text-rose-400 font-bold' : 'text-white'}>
                        ${b.spent.toFixed(2)}
                      </span>{' '}
                      / ${b.monthly_limit.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver ? 'bg-rose-500' : b.percentage > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goals Progress */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Financial Milestones</h3>
              <p className="text-xs text-slate-400">Track progress toward savings targets</p>
            </div>
            <button
              onClick={() => onNavigate('goals')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              All Goals &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {stats.goals.slice(0, 4).map((g) => (
              <div
                key={g.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{g.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {g.percentage}%
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-bold text-slate-200 font-mono">
                    ${g.current_amount.toLocaleString()}
                    <span className="text-xs text-slate-500 font-normal"> / ${g.target_amount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-3 w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${Math.min(g.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Feed */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-white">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Latest recorded ledger entries</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenNewTransaction}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
            >
              + Quick Record
            </button>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition border border-slate-700"
            >
              View All Entries &rarr;
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Merchant / Payee</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Account</th>
                <th className="pb-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stats.recent_transactions.map((txn) => {
                const isExpense = txn.type === 'expense';
                const isIncome = txn.type === 'income';
                return (
                  <tr key={txn.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 text-slate-400 font-mono whitespace-nowrap">{txn.date}</td>
                    <td className="py-3 font-semibold text-white flex items-center space-x-2">
                      <span className={`p-1 rounded-md ${
                        isIncome ? 'bg-emerald-500/10 text-emerald-400' : isExpense ? 'bg-rose-500/10 text-rose-400' : 'bg-sky-500/10 text-sky-400'
                      }`}>
                        {isIncome && <ArrowUpRight className="w-3.5 h-3.5" />}
                        {isExpense && <ArrowDownRight className="w-3.5 h-3.5" />}
                        {!isIncome && !isExpense && <ArrowLeftRight className="w-3.5 h-3.5" />}
                      </span>
                      <span>{txn.merchant}</span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-300 border border-slate-700/60">
                        {txn.category}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {txn.account_name || 'Main Account'}
                      {txn.target_account_name && ` → ${txn.target_account_name}`}
                    </td>
                    <td className="py-3 text-right font-mono font-bold whitespace-nowrap">
                      <span
                        className={
                          isIncome
                            ? 'text-emerald-400'
                            : isExpense
                            ? 'text-rose-400'
                            : 'text-sky-400'
                        }
                      >
                        {isIncome ? '+' : isExpense ? '-' : ''}${txn.amount.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
