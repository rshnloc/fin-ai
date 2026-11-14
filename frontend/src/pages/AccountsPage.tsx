import React, { useState } from 'react';
import {
  Wallet,
  PlusCircle,
  TrendingUp,
  CreditCard,
  Building,
  PiggyBank,
  Trash2,
  ArrowLeftRight
} from 'lucide-react';
import { Account } from '../types/finance';
import { api } from '../api/client';

interface AccountsPageProps {
  accounts: Account[];
  onOpenNewAccount: () => void;
  onOpenNewTransaction: () => void;
  onRefresh: () => void;
}

export const AccountsPage: React.FC<AccountsPageProps> = ({
  accounts,
  onOpenNewAccount,
  onOpenNewTransaction,
  onRefresh,
}) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const totalAssets = accounts
    .filter((a) => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = Math.abs(
    accounts.filter((a) => a.balance < 0).reduce((sum, a) => sum + a.balance, 0)
  );

  const netWorth = totalAssets - totalLiabilities;

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this account? All associated transactions will also be deleted.')) {
      return;
    }
    setDeletingId(id);
    try {
      await api.deleteAccount(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
    } finally {
      setDeletingId(null);
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'savings':
        return PiggyBank;
      case 'investment':
        return TrendingUp;
      case 'credit':
        return CreditCard;
      default:
        return Building;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Accounts & Wallets</h2>
          <p className="text-xs text-slate-400">
            Multi-account custody with real-time balance propagation
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Transfer Funds</span>
          </button>
          <button
            onClick={onOpenNewAccount}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition shadow-lg shadow-emerald-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Aggregate Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Total Net Worth
          </span>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-400 mt-2 block font-medium">
            Consolidated Balance
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-sky-500">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Total Assets
          </span>
          <div className="text-2xl font-bold text-sky-400 font-mono mt-1">
            ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Checking, Savings & Investments
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-rose-500">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Total Liabilities
          </span>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">
            ${totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Credit Cards & Lines of Credit
          </span>
        </div>
      </div>

      {/* Accounts Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => {
          const Icon = getAccountIcon(acc.account_type);
          const isNegative = acc.balance < 0;

          return (
            <div
              key={acc.id}
              className="glass-panel-interactive rounded-2xl p-6 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: acc.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{acc.name}</h3>
                      <span className="text-[11px] font-medium text-slate-400 capitalize">
                        {acc.account_type} Account
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(acc.id)}
                    disabled={deletingId === acc.id}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Delete Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-6">
                  <span className="text-xs text-slate-400 block mb-1">Available Balance</span>
                  <div className="text-2xl font-mono font-bold tracking-tight">
                    <span className={isNegative ? 'text-rose-400' : 'text-white'}>
                      ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>{' '}
                    <span className="text-xs font-normal text-slate-500">{acc.currency}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[11px]">ID: #{acc.id}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-slate-900 border border-slate-700 text-emerald-400">
                  Active
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
