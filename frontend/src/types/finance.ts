export interface Account {
  id: number;
  name: string;
  account_type: 'checking' | 'savings' | 'investment' | 'credit';
  balance: number;
  currency: string;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: number;
  account_id: number;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string;
  merchant: string;
  date: string;
  notes?: string;
  status: 'completed' | 'pending';
  transfer_target_account_id?: number | null;
  account_name?: string;
  target_account_name?: string;
}

export interface Budget {
  id: number;
  category: string;
  monthly_limit: number;
  period_month: string;
  color: string;
  spent: number;
  percentage: number;
}

export interface Goal {
  id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
  color: string;
  percentage: number;
}

export interface RecurringBill {
  id: number;
  name: string;
  amount: number;
  frequency: string;
  due_day: number;
  category: string;
  is_active: boolean;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyDataPoint {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

export interface DashboardStats {
  total_net_worth: number;
  total_assets: number;
  total_liabilities: number;
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings: number;
  savings_rate: number;
  category_breakdown: CategoryExpense[];
  monthly_trends: MonthlyDataPoint[];
  recent_transactions: Transaction[];
  budget_progress: Budget[];
  goals: Goal[];
  active_bills_count: number;
  monthly_bills_total: number;
}
