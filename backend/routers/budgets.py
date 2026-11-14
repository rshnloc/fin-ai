from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import date
from database import get_db
from models import Budget, Transaction
from schemas import BudgetCreate, BudgetUpdate, BudgetResponse

router = APIRouter(prefix="/api/budgets", tags=["Budgets"])

@router.get("", response_model=List[BudgetResponse])
def get_budgets(month: Optional[str] = None, db: Session = Depends(get_db)):
    if not month:
        month = date.today().strftime("%Y-%m")
    
    budgets = db.query(Budget).filter(Budget.period_month == month).all()
    if not budgets:
        # Fallback to any latest month or generic
        budgets = db.query(Budget).all()

    year_val, month_val = int(month.split("-")[0]), int(month.split("-")[1])

    # Calculate actual spending per category for this month
    spending_query = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label("total_spent")
    ).filter(
        Transaction.type == "expense",
        extract("year", Transaction.date) == year_val,
        extract("month", Transaction.date) == month_val
    ).group_by(Transaction.category).all()

    spending_map = {cat: float(total) for cat, total in spending_query}

    results = []
    for b in budgets:
        spent = spending_map.get(b.category, 0.0)
        percentage = round((spent / b.monthly_limit * 100), 1) if b.monthly_limit > 0 else 0.0
        results.append({
            "id": b.id,
            "category": b.category,
            "monthly_limit": b.monthly_limit,
            "period_month": b.period_month,
            "color": b.color,
            "spent": round(spent, 2),
            "percentage": percentage
        })
    return results

@router.post("", response_model=BudgetResponse, status_code=201)
def create_budget(budget_in: BudgetCreate, db: Session = Depends(get_db)):
    # Check if budget for category & month already exists
    existing = db.query(Budget).filter(
        Budget.category == budget_in.category,
        Budget.period_month == budget_in.period_month
    ).first()
    if existing:
        existing.monthly_limit = budget_in.monthly_limit
        existing.color = budget_in.color
        db.commit()
        db.refresh(existing)
        return {
            "id": existing.id,
            "category": existing.category,
            "monthly_limit": existing.monthly_limit,
            "period_month": existing.period_month,
            "color": existing.color,
            "spent": 0.0,
            "percentage": 0.0
        }

    budget = Budget(**budget_in.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return {
        "id": budget.id,
        "category": budget.category,
        "monthly_limit": budget.monthly_limit,
        "period_month": budget.period_month,
        "color": budget.color,
        "spent": 0.0,
        "percentage": 0.0
    }

@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(budget_id: int, update_data: BudgetUpdate, db: Session = Depends(get_db)):
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(budget, field, value)

    db.commit()
    db.refresh(budget)
    return {
        "id": budget.id,
        "category": budget.category,
        "monthly_limit": budget.monthly_limit,
        "period_month": budget.period_month,
        "color": budget.color,
        "spent": 0.0,
        "percentage": 0.0
    }

@router.delete("/{budget_id}", status_code=204)
def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(budget)
    db.commit()
    return None
