from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import date
from database import get_db
from models import Transaction, Account
from schemas import TransactionCreate, TransactionUpdate, TransactionResponse

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

def _update_balance_on_create(db: Session, txn: Transaction):
    account = db.query(Account).filter(Account.id == txn.account_id).first()
    if not account:
        return
    if txn.type == "income":
        account.balance += txn.amount
    elif txn.type == "expense":
        account.balance -= txn.amount
    elif txn.type == "transfer" and txn.transfer_target_account_id:
        target = db.query(Account).filter(Account.id == txn.transfer_target_account_id).first()
        account.balance -= txn.amount
        if target:
            target.balance += txn.amount

def _revert_balance(db: Session, txn: Transaction):
    account = db.query(Account).filter(Account.id == txn.account_id).first()
    if not account:
        return
    if txn.type == "income":
        account.balance -= txn.amount
    elif txn.type == "expense":
        account.balance += txn.amount
    elif txn.type == "transfer" and txn.transfer_target_account_id:
        target = db.query(Account).filter(Account.id == txn.transfer_target_account_id).first()
        account.balance += txn.amount
        if target:
            target.balance -= txn.amount

def _enrich_txn(txn: Transaction) -> dict:
    data = {
        "id": txn.id,
        "account_id": txn.account_id,
        "type": txn.type,
        "amount": txn.amount,
        "category": txn.category,
        "merchant": txn.merchant,
        "date": txn.date,
        "notes": txn.notes,
        "status": txn.status,
        "transfer_target_account_id": txn.transfer_target_account_id,
        "account_name": txn.account.name if txn.account else None,
        "target_account_name": txn.target_account.name if txn.target_account else None
    }
    return data

@router.get("", response_model=List[TransactionResponse])
def get_transactions(
    account_id: Optional[int] = None,
    category: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    
    if account_id:
        query = query.filter(or_(Transaction.account_id == account_id, Transaction.transfer_target_account_id == account_id))
    if category:
        query = query.filter(Transaction.category == category)
    if type:
        query = query.filter(Transaction.type == type)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(or_(
            Transaction.merchant.ilike(search_filter),
            Transaction.notes.ilike(search_filter),
            Transaction.category.ilike(search_filter)
        ))

    txns = query.order_by(Transaction.date.desc(), Transaction.id.desc()).offset(offset).limit(limit).all()
    return [_enrich_txn(t) for t in txns]

@router.get("/categories", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Transaction.category).distinct().all()
    cats = [c[0] for c in categories if c[0]]
    defaults = ["Groceries", "Dining Out", "Housing", "Transport", "Utilities", "Entertainment", "Healthcare", "Shopping", "Salary", "Investments", "Subscriptions", "Education"]
    for d in defaults:
        if d not in cats:
            cats.append(d)
    return sorted(cats)

@router.post("", response_model=TransactionResponse, status_code=201)
def create_transaction(txn_in: TransactionCreate, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == txn_in.account_id).first()
    if not account:
        raise HTTPException(status_code=400, detail="Specified account does not exist")
    
    if txn_in.type == "transfer":
        if not txn_in.transfer_target_account_id:
            raise HTTPException(status_code=400, detail="Target account required for transfers")
        if txn_in.transfer_target_account_id == txn_in.account_id:
            raise HTTPException(status_code=400, detail="Cannot transfer to the same account")

    txn = Transaction(**txn_in.model_dump())
    db.add(txn)
    _update_balance_on_create(db, txn)
    db.commit()
    db.refresh(txn)
    return _enrich_txn(txn)

@router.put("/{txn_id}", response_model=TransactionResponse)
def update_transaction(txn_id: int, update_data: TransactionUpdate, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.id == txn_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Revert balance with old values
    _revert_balance(db, txn)

    # Apply changes
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(txn, field, value)

    # Re-apply balance with new values
    _update_balance_on_create(db, txn)
    db.commit()
    db.refresh(txn)
    return _enrich_txn(txn)

@router.delete("/{txn_id}", status_code=204)
def delete_transaction(txn_id: int, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.id == txn_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    _revert_balance(db, txn)
    db.delete(txn)
    db.commit()
    return None
