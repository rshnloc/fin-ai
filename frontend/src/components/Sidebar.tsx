import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PieChart,
  TrendingUp,
  Target,
  ShieldCheck,
  RefreshCw,
  HardDrive
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onResetData: () => void;
  isResetting: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onResetData,
  isResetting,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'goals', label: 'Goals', icon: Target },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 shrink-0 z-20 backdrop-blur-md">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="font-extrabold text-slate-950 text-xl tracking-tight">F</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
              FinAI <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Zero-Auth</span>
            </h1>
            <p className="text-xs text-slate-400">Privacy Financial Engine</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Security & Privacy Banner */}
      <div className="p-4 space-y-3 border-t border-slate-800/80">
        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Zero Credentials Policy</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            No live API keys, session tokens, or personal identifiers stored or transmitted.
          </p>
          <div className="flex items-center space-x-1.5 text-slate-400 text-[10px]">
            <HardDrive className="w-3 h-3 text-slate-400" />
            <span>Local SQLite Engine</span>
          </div>
        </div>

        <button
          onClick={onResetData}
          disabled={isResetting}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg border border-slate-800 transition"
          title="Reset sample database to fresh synthetic state"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-emerald-400' : ''}`} />
          <span>{isResetting ? 'Resetting Data...' : 'Reset Synthetic Data'}</span>
        </button>
      </div>
    </aside>
  );
};
