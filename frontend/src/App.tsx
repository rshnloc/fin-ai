import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AccountsPage } from './pages/AccountsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { GoalsPage } from './pages/GoalsPage';
import { TransactionModal } from './components/TransactionModal';
import { AccountModal } from './components/AccountModal';
import { BudgetModal } from './components/BudgetModal';
import { GoalModal } from './components/GoalModal';
import { DashboardStats, Account, Budget, Goal } from './types/finance';
import { api } from './api/client';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isBackendHealthy, setIsBackendHealthy] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Modals
  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const fetchCoreData = async () => {
    try {
      const [health, dashboardData, accs, cats, bgs, gls] = await Promise.all([
        api.getHealth().catch(() => ({ status: 'down' })),
        api.getDashboard().catch(() => null),
        api.getAccounts().catch(() => []),
        api.getCategories().catch(() => []),
        api.getBudgets().catch(() => []),
        api.getGoals().catch(() => []),
      ]);

      setIsBackendHealthy(health.status === 'healthy');
      if (dashboardData) setStats(dashboardData);
      setAccounts(accs);
      setCategories(cats);
      setBudgets(bgs);
      setGoals(gls);
    } catch (err) {
      console.error('Failed to load application data', err);
    }
  };

  useEffect(() => {
    fetchCoreData();
    // Poll backend health gently every 30 seconds
    const interval = setInterval(fetchCoreData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleResetData = async () => {
    if (!confirm('Reset local SQLite database to fresh synthetic demo state?')) return;
    setIsResetting(true);
    try {
      await api.resetSeedData();
      await fetchCoreData();
    } catch (err: any) {
      alert(err.message || 'Failed to reset seed data');
    } finally {
      setIsResetting(false);
    }
  };

  const getPageInfo = () => {
    switch (activeTab) {
      case 'transactions':
        return { title: 'Ledger Transactions', subtitle: 'Search, audit, and log ledger operations' };
      case 'accounts':
        return { title: 'Financial Accounts', subtitle: 'Custody balance allocations and transfers' };
      case 'budgets':
        return { title: 'Monthly Budget Envelopes', subtitle: 'Category spending caps and guardrails' };
      case 'analytics':
        return { title: 'Insights & Subscriptions', subtitle: 'Cash flow dynamics and recurring overhead' };
      case 'goals':
        return { title: 'Financial Targets', subtitle: 'Progress towards long-term wealth milestones' };
      default:
        return { title: 'Financial Intelligence', subtitle: 'Real-time overview of net assets and cash flows' };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetData={handleResetData}
        isResetting={isResetting}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onOpenNewTransaction={() => setIsTxnModalOpen(true)}
          onOpenNewAccount={() => setIsAccModalOpen(true)}
          isBackendHealthy={isBackendHealthy}
        />

        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              stats={stats}
              accounts={accounts}
              onNavigate={setActiveTab}
              onOpenNewTransaction={() => setIsTxnModalOpen(true)}
              onRefresh={fetchCoreData}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsPage
              accounts={accounts}
              categories={categories}
              onOpenNewTransaction={() => setIsTxnModalOpen(true)}
              onRefreshStats={fetchCoreData}
            />
          )}

          {activeTab === 'accounts' && (
            <AccountsPage
              accounts={accounts}
              onOpenNewAccount={() => setIsAccModalOpen(true)}
              onOpenNewTransaction={() => setIsTxnModalOpen(true)}
              onRefresh={fetchCoreData}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsPage
              budgets={budgets}
              categories={categories}
              onOpenNewBudget={() => setIsBudgetModalOpen(true)}
              onRefresh={fetchCoreData}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage
              stats={stats}
              onRefresh={fetchCoreData}
            />
          )}

          {activeTab === 'goals' && (
            <GoalsPage
              goals={goals}
              onOpenNewGoal={() => setIsGoalModalOpen(true)}
              onRefresh={fetchCoreData}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxnModalOpen}
        onClose={() => setIsTxnModalOpen(false)}
        accounts={accounts}
        categories={categories}
        onSuccess={fetchCoreData}
      />

      <AccountModal
        isOpen={isAccModalOpen}
        onClose={() => setIsAccModalOpen(false)}
        onSuccess={fetchCoreData}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        categories={categories}
        onSuccess={fetchCoreData}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSuccess={fetchCoreData}
      />
    </div>
  );
};
export default App;
