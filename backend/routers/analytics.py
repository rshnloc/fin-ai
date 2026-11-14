from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List
from datetime import date, timedelta
from database import get_db
from models import Account, Transaction, Budget, Goal, RecurringBill
from schemas import (
    DashboardStats, CategoryExpense, MonthlyDataPoint,
    RecurringBillCreate, RecurringBillResponse
)
from routers.transactions import _enrich_txn
from routers.goals import _enrich_goal

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

CATEGORY_COLOR_PALETTE = {
    "Housing": "#6366F1",
    "Groceries": "#10B981",
    "Dining Out": "#F59E0B",
    "Transport": "#3B82F6",
    "Utilities": "#EC4899",
    "Entertainment": "#8B5CF6",
    "Healthcare": "#EF4444",
    "Shopping": "#14B8A6",
    "Subscriptions": "#F97316",
    "Salary": "#22C55E",
    "Investments": "#06B6D4",
    "Education": "#84CC16",
    "Other": "#64748B"
}

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db)):
    accounts = db.query(Account).all()
    
    # Net worth calculation
    assets = sum(a.balance for a in accounts if a.balance > 0)
    liabilities = abs(sum(a.balance for a in accounts if a.balance < 0))
    net_worth = assets - liabilities

    today = date.today()
    curr_year = today.year
    curr_month = today.month

    # Current month income & expenses
    monthly_income = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
        Transaction.type == "income",
        extract("year", Transaction.date) == curr_year,
        extract("month", Transaction.date) == curr_month
    ).scalar() or 0.0

    monthly_expenses = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
        Transaction.type == "expense",
        extract("year", Transaction.date) == curr_year,
        extract("month", Transaction.date) == curr_month
    ).scalar() or 0.0

    monthly_savings = monthly_income - monthly_expenses
    savings_rate = round((monthly_savings / monthly_income * 100), 1) if monthly_income > 0 else 0.0

    # Category breakdown for expenses in current month
    cat_expenses_query = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.type == "expense",
        extract("year", Transaction.date) == curr_year,
        extract("month", Transaction.date) == curr_month
    ).group_by(Transaction.category).order_by(func.sum(Transaction.amount).desc()).all()

    category_breakdown = []
    for cat, total in cat_expenses_query:
        total_flt = float(total)
        pct = round((total_flt / monthly_expenses * 100), 1) if monthly_expenses > 0 else 0.0
        category_breakdown.append(CategoryExpense(
            category=cat,
            amount=round(total_flt, 2),
            percentage=pct,
            color=CATEGORY_COLOR_PALETTE.get(cat, "#64748B")
        ))

    # Last 6 months trend
    monthly_trends = []
    # Build list of (year, month) for past 6 months
    months_list = []
    for i in range(5, -1, -1):
        target_date = today.replace(day=1) - timedelta(days=i * 28)
        months_list.append((target_date.year, target_date.month, target_date.strftime("%b %Y")))
    
    # Remove duplicates preserving order
    seen = set()
    ordered_months = []
    for y, m, name in months_list:
        if (y, m) not in seen:
            seen.add((y, m))
            ordered_months.append((y, m, name))

    for y, m, name in ordered_months:
        inc = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
            Transaction.type == "income",
            extract("year", Transaction.date) == y,
            extract("month", Transaction.date) == m
        ).scalar() or 0.0

        exp = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
            Transaction.type == "expense",
            extract("year", Transaction.date) == y,
            extract("month", Transaction.date) == m
        ).scalar() or 0.0

        monthly_trends.append(MonthlyDataPoint(
            month=name,
            income=round(float(inc), 2),
            expense=round(float(exp), 2),
            savings=round(float(inc - exp), 2)
        ))

    # Recent 6 transactions
    recent_txns = db.query(Transaction).order_by(Transaction.date.desc(), Transaction.id.desc()).limit(6).all()
    recent_formatted = [_enrich_txn(t) for t in recent_txns]

    # Budgets for current month
    curr_month_str = today.strftime("%Y-%m")
    budgets = db.query(Budget).filter(Budget.period_month == curr_month_str).all()
    if not budgets:
        budgets = db.query(Budget).all()

    spending_map = {item.category: item.amount for item in category_breakdown}
    budget_progress = []
    for b in budgets:
        spent = spending_map.get(b.category, 0.0)
        pct = round((spent / b.monthly_limit * 100), 1) if b.monthly_limit > 0 else 0.0
        budget_progress.append({
            "id": b.id,
            "category": b.category,
            "monthly_limit": b.monthly_limit,
            "period_month": b.period_month,
            "color": b.color,
            "spent": round(spent, 2),
            "percentage": pct
        })

    # Goals
    goals = db.query(Goal).order_by(Goal.target_date.asc()).limit(4).all()
    goals_progress = [_enrich_goal(g) for g in goals]

    # Recurring bills summary
    bills = db.query(RecurringBill).filter(RecurringBill.is_active == True).all()
    bills_total = sum(b.amount for b in bills if b.frequency == "monthly")

    return DashboardStats(
        total_net_worth=round(net_worth, 2),
        total_assets=round(assets, 2),
        total_liabilities=round(liabilities, 2),
        monthly_income=round(float(monthly_income), 2),
        monthly_expenses=round(float(monthly_expenses), 2),
        monthly_savings=round(float(monthly_savings), 2),
        savings_rate=savings_rate,
        category_breakdown=category_breakdown,
        monthly_trends=monthly_trends,
        recent_transactions=recent_formatted,
        budget_progress=budget_progress,
        goals=goals_progress,
        active_bills_count=len(bills),
        monthly_bills_total=round(bills_total, 2)
    )

@router.get("/recurring", response_model=List[RecurringBillResponse])
def get_recurring_bills(db: Session = Depends(get_db)):
    return db.query(RecurringBill).order_by(RecurringBill.due_day.asc()).all()

@router.post("/recurring", response_model=RecurringBillResponse, status_code=201)
def create_recurring_bill(bill_in: RecurringBillCreate, db: Session = Depends(get_db)):
    bill = RecurringBill(**bill_in.model_dump())
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill

@router.delete("/recurring/{bill_id}", status_code=204)
def delete_recurring_bill(bill_id: int, db: Session = Depends(get_db)):
    bill = db.query(RecurringBill).filter(RecurringBill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    db.delete(bill)
    db.commit()
    return None
