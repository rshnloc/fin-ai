import {
  Account,
  Transaction,
  Budget,
  Goal,
  RecurringBill,
  DashboardStats,
} from '../types/finance';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.detail) {
        errorMessage = typeof parsed.detail === 'string' ? parsed.detail : JSON.stringify(parsed.detail);
      }
    } catch {
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

export const api = {
  // Health
  getHealth: () =>
    fetch(`${BASE_URL}/health`).then((r) => handleResponse<{ status: string; service: string }>(r)),

  // Analytics & Dashboard
  getDashboard: () =>
    fetch(`${BASE_URL}/analytics/dashboard`).then((r) => handleResponse<DashboardStats>(r)),

  // Accounts
  getAccounts: () =>
    fetch(`${BASE_URL}/accounts`).then((r) => handleResponse<Account[]>(r)),

  createAccount: (data: Omit<Account, 'id' | 'created_at'>) =>
    fetch(`${BASE_URL}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<Account>(r)),

  updateAccount: (id: number, data: Partial<Account>) =>
    fetch(`${BASE_URL}/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<Account>(r)),

  deleteAccount: (id: number) =>
    fetch(`${BASE_URL}/accounts/${id}`, { method: 'DELETE' }).then((r) => handleResponse<void>(r)),

  // Transactions
  getTransactions: (params?: {
    account_id?: number;
    category?: string;
    type?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      });
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetch(`${BASE_URL}/transactions${qs}`).then((r) => handleResponse<Transaction[]>(r));
  },

  getCategories: () =>
    fetch(`${BASE_URL}/transactions/categories`).then((r) => handleResponse<string[]>(r)),

  createTransaction: (data: Omit<Transaction, 'id' | 'account_name' | 'target_account_name'>) =>
    fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<Transaction>(r)),

  deleteTransaction: (id: number) =>
    fetch(`${BASE_URL}/transactions/${id}`, { method: 'DELETE' }).then((r) => handleResponse<void>(r)),

  // Budgets
  getBudgets: (month?: string) => {
    const qs = month ? `?month=${encodeURIComponent(month)}` : '';
    return fetch(`${BASE_URL}/budgets${qs}`).then((r) => handleResponse<Budget[]>(r));
  },

  createBudget: (data: Omit<Budget, 'id' | 'spent' | 'percentage'>) =>
    fetch(`${BASE_URL}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<Budget>(r)),

  deleteBudget: (id: number) =>
    fetch(`${BASE_URL}/budgets/${id}`, { method: 'DELETE' }).then((r) => handleResponse<void>(r)),

  // Goals
  getGoals: () =>
    fetch(`${BASE_URL}/goals`).then((r) => handleResponse<Goal[]>(r)),

  createGoal: (data: Omit<Goal, 'id' | 'percentage'>) =>
    fetch(`${BASE_URL}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<Goal>(r)),

  updateGoal: (id: number, data: Partial<Goal>) =>
    fetch(`${BASE_URL}/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<Goal>(r)),

  deleteGoal: (id: number) =>
    fetch(`${BASE_URL}/goals/${id}`, { method: 'DELETE' }).then((r) => handleResponse<void>(r)),

  // Recurring Bills
  getRecurringBills: () =>
    fetch(`${BASE_URL}/analytics/recurring`).then((r) => handleResponse<RecurringBill[]>(r)),

  createRecurringBill: (data: Omit<RecurringBill, 'id'>) =>
    fetch(`${BASE_URL}/analytics/recurring`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<RecurringBill>(r)),

  deleteRecurringBill: (id: number) =>
    fetch(`${BASE_URL}/analytics/recurring/${id}`, { method: 'DELETE' }).then((r) => handleResponse<void>(r)),

  // Seed / Reset
  resetSeedData: () =>
    fetch(`${BASE_URL}/seed/reset`, { method: 'POST' }).then((r) => handleResponse<{ message: string }>(r)),
};
