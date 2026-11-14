import React, { useState } from 'react';
import { X, Wallet } from 'lucide-react';
import { api } from '../api/client';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PALETTE = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B',
  '#EC4899', '#06B6D4', '#6366F1', '#EF4444'
];

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<'checking' | 'savings' | 'investment' | 'credit'>('checking');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter an account name.');
      return;
    }

    const parsedBalance = parseFloat(balance || '0');
    if (isNaN(parsedBalance)) {
      setError('Please enter a valid numeric initial balance.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createAccount({
        name: name.trim(),
        account_type: accountType,
        balance: accountType === 'credit' && parsedBalance > 0 ? -parsedBalance : parsedBalance,
        currency: 'USD',
        color,
        is_active: true,
      });
      onSuccess();
      onClose();
      setName('');
      setBalance('');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
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
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Add Financial Account</h3>
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
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Account Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Daily Cash Checking, Growth Vault"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Account Type</label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="checking">Checking (Daily expenses & operations)</option>
              <option value="savings">Savings (Emergency / reserve vault)</option>
              <option value="investment">Investment (Index funds / portfolio)</option>
              <option value="credit">Credit Card (Liability / lines of credit)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Initial Balance ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Color Tag</label>
            <div className="flex items-center space-x-2">
              {PALETTE.map((c) => (
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
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
