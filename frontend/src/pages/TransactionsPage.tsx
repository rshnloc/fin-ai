import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Download,
  Calendar
} from 'lucide-react';
import { Transaction, Account } from '../types/finance';
import { api } from '../api/client';

interface TransactionsPageProps {
  accounts: Account[];
  categories: string[];
  onOpenNewTransaction: () => void;
  onRefreshStats: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  accounts,
  categories,
  onOpenNewTransaction,
  onRefreshStats,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [accountFilter, setAccountFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await api.getTransactions({
        search: search || undefined,
        type: typeFilter || undefined,
        category: categoryFilter || undefined,
        account_id: accountFilter ? Number(accountFilter) : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        limit: 150,
      });
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, typeFilter, categoryFilter, accountFilter, startDate, endDate]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction? Account balance will be restored.')) return;
    setDeletingId(id);
    try {
      await api.deleteTransaction(id);
      await fetchTransactions();
      onRefreshStats();
    } catch (err: any) {
      alert(err.message || 'Failed to delete transaction');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Date', 'Type', 'Merchant', 'Category', 'Amount', 'Account', 'Notes'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.type,
      `"${t.merchant.replace(/"/g, '""')}"`,
      t.category,
      t.amount,
      `"${(t.account_name || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fin-ai-transactions-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Financial Ledger</h2>
          <p className="text-xs text-slate-400">
            {transactions.length} transactions recorded (100% synthetic, zero real personal data)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition shadow-lg shadow-emerald-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search merchant, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Types (Expense/Income/Transfer)</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
              <option value="transfer">Transfers Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/60 text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Date Range:
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
          />
          <span className="text-slate-500">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
          />
          {(search || typeFilter || categoryFilter || accountFilter || startDate || endDate) && (
            <button
              onClick={() => {
                setSearch('');
                setTypeFilter('');
                setCategoryFilter('');
                setAccountFilter('');
                setStartDate('');
                setEndDate('');
              }}
              className="text-emerald-400 hover:text-emerald-300 font-medium ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400">
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold">Merchant / Description</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Account</th>
                <th className="py-3.5 px-4 font-semibold">Notes</th>
                <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
                <th className="py-3.5 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs">Loading ledger...</p>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No transactions match the current filters.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const isExpense = t.type === 'expense';
                  const isIncome = t.type === 'income';

                  return (
                    <tr key={t.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3.5 px-4 text-slate-400 font-mono whitespace-nowrap">
                        {t.date}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center space-x-2.5">
                          <span
                            className={`p-1.5 rounded-lg shrink-0 ${
                              isIncome
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : isExpense
                                ? 'bg-rose-500/15 text-rose-400'
                                : 'bg-sky-500/15 text-sky-400'
                            }`}
                          >
                            {isIncome && <ArrowUpRight className="w-3.5 h-3.5" />}
                            {isExpense && <ArrowDownRight className="w-3.5 h-3.5" />}
                            {!isIncome && !isExpense && <ArrowLeftRight className="w-3.5 h-3.5" />}
                          </span>
                          <span className="truncate max-w-[200px]">{t.merchant}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900 border border-slate-700 text-slate-300">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {t.account_name || 'Account'}
                        {t.target_account_name && (
                          <span className="text-slate-400 text-[11px]"> → {t.target_account_name}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate text-[11px]">
                        {t.notes || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span
                          className={
                            isIncome
                              ? 'text-emerald-400'
                              : isExpense
                              ? 'text-rose-400'
                              : 'text-sky-400'
                          }
                        >
                          {isIncome ? '+' : isExpense ? '-' : ''}${t.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Delete transaction and revert balance"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
