import React from 'react';
import { PlusCircle, Activity, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  title: string;
  subtitle: string;
  onOpenNewTransaction: () => void;
  onOpenNewAccount: () => void;
  isBackendHealthy: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  subtitle,
  onOpenNewTransaction,
  onOpenNewAccount,
  isBackendHealthy,
}) => {
  return (
    <header className="h-20 border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center space-x-3">
        {/* Backend status pill */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            {isBackendHealthy ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            )}
          </span>
          <span className="font-mono text-[11px]">
            {isBackendHealthy ? 'Local Engine Connected' : 'Connecting Engine...'}
          </span>
        </div>

        {/* Action Buttons */}
        <button
          onClick={onOpenNewAccount}
          className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition shadow-sm"
        >
          + Add Account
        </button>

        <button
          onClick={onOpenNewTransaction}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Transaction</span>
        </button>
      </div>
    </header>
  );
};
