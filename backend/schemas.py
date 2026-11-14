import datetime as dt
from typing import Optional, List
from pydantic import BaseModel, Field

# Account Schemas
class AccountBase(BaseModel):
    name: str
    account_type: str = Field(default="checking", description="checking, savings, investment, credit")
    balance: float = 0.0
    currency: str = "USD"
    color: str = "#4F46E5"
    is_active: bool = True

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    account_type: Optional[str] = None
    balance: Optional[float] = None
    currency: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None

class AccountResponse(AccountBase):
    id: int
    created_at: dt.datetime

    class Config:
        from_attributes = True


# Transaction Schemas
class TransactionBase(BaseModel):
    account_id: int
    type: str = Field(description="income, expense, transfer")
    amount: float
    category: str
    merchant: str
    date: dt.date = Field(default_factory=dt.date.today)
    notes: Optional[str] = None
    status: str = "completed"
    transfer_target_account_id: Optional[int] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    account_id: Optional[int] = None
    type: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    merchant: Optional[str] = None
    date: Optional[dt.date] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    transfer_target_account_id: Optional[int] = None

class TransactionResponse(TransactionBase):
    id: int
    account_name: Optional[str] = None
    target_account_name: Optional[str] = None

    class Config:
        from_attributes = True


# Budget Schemas
class BudgetBase(BaseModel):
    category: str
    monthly_limit: float
    period_month: str # YYYY-MM
    color: str = "#0EA5E9"

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    monthly_limit: Optional[float] = None
    color: Optional[str] = None

class BudgetResponse(BudgetBase):
    id: int
    spent: float = 0.0
    percentage: float = 0.0

    class Config:
        from_attributes = True


# Goal Schemas
class GoalBase(BaseModel):
    title: str
    target_amount: float
    current_amount: float = 0.0
    target_date: dt.date
    category: str = "Savings"
    color: str = "#10B981"

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    target_date: Optional[dt.date] = None
    category: Optional[str] = None
    color: Optional[str] = None

class GoalResponse(GoalBase):
    id: int
    percentage: float = 0.0

    class Config:
        from_attributes = True


# Recurring Bill Schemas
class RecurringBillBase(BaseModel):
    name: str
    amount: float
    frequency: str = "monthly"
    due_day: int = 1
    category: str = "Subscriptions"
    is_active: bool = True

class RecurringBillCreate(RecurringBillBase):
    pass

class RecurringBillResponse(RecurringBillBase):
    id: int

    class Config:
        from_attributes = True


# Analytics & Dashboard Stats
class CategoryExpense(BaseModel):
    category: str
    amount: float
    percentage: float
    color: str

class MonthlyDataPoint(BaseModel):
    month: str # e.g. "Jun 2026"
    income: float
    expense: float
    savings: float

class DashboardStats(BaseModel):
    total_net_worth: float
    total_assets: float
    total_liabilities: float
    monthly_income: float
    monthly_expenses: float
    monthly_savings: float
    savings_rate: float
    category_breakdown: List[CategoryExpense]
    monthly_trends: List[MonthlyDataPoint]
    recent_transactions: List[TransactionResponse]
    budget_progress: List[BudgetResponse]
    goals: List[GoalResponse]
    active_bills_count: int
    monthly_bills_total: float
