import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { Account } from '../types/finance';
import { api } from '../api/client';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: string[];
  onSuccess: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  accounts,
  categories,
  onSuccess,
}) => {
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [merchant, setMerchant] = useState('');
  const [accountId, setAccountId] = useState<number>(accounts[0]?.id || 1);
  const [targetAccountId, setTargetAccountId] = useState<number>(accounts[1]?.id || 2);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
      if (accounts[1]) setTargetAccountId(accounts[1].id);
    }
  }, [accounts]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than $0.');
      return;
    }
    if (!merchant.trim()) {
      setError('Please enter a merchant, payee, or description.');
      return;
    }
    if (type === 'transfer' && accountId === targetAccountId) {
      setError('Source and destination accounts must be different.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createTransaction({
        account_id: Number(accountId),
        type,
        amount: parsedAmount,
        category: type === 'transfer' ? 'Transfer' : category,
        merchant: merchant.trim(),
        date,
        notes: notes.trim() || undefined,
        status: 'completed',
        transfer_target_account_id: type === 'transfer' ? Number(targetAccountId) : null,
      });
      onSuccess();
      onClose();
      // Reset form
      setAmount('');
      setMerchant('');
      setNotes('');
    } catch (err: any) {
      setError(err.message || 'Failed to record transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">Record Transaction</h3>
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
          {/* Transaction Type Selector */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Expense</span>
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Income</span>
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                type === 'transfer'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Transfer</span>
            </button>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Merchant / Payee */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {type === 'income' ? 'Source / Payer' : type === 'transfer' ? 'Transfer Description' : 'Merchant / Payee'}
            </label>
            <input
              type="text"
              required
              placeholder={type === 'income' ? 'e.g. Salary, Client Payout' : 'e.g. Supermarket, Coffee House'}
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category (if not transfer) */}
          {type !== 'transfer' && (
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
          )}

          {/* Accounts selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {type === 'transfer' ? 'From Account' : 'Account'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id} className="bg-slate-900">
                    {acc.name} (${acc.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">To Account</label>
                <select
                  value={targetAccountId}
                  onChange={(e) => setTargetAccountId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id} className="bg-slate-900">
                      {acc.name} (${acc.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes (Optional)</label>
            <input
              type="text"
              placeholder="Add extra context or synthetic tag..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Button */}
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
              {isSubmitting ? 'Recording...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
