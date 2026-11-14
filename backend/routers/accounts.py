from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Account, Transaction
from schemas import AccountCreate, AccountUpdate, AccountResponse

router = APIRouter(prefix="/api/accounts", tags=["Accounts"])

@router.get("", response_model=List[AccountResponse])
def get_accounts(db: Session = Depends(get_db)):
    return db.query(Account).order_by(Account.id.asc()).all()

@router.post("", response_model=AccountResponse, status_code=201)
def create_account(account_in: AccountCreate, db: Session = Depends(get_db)):
    account = Account(**account_in.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)
    return account

@router.get("/{account_id}", response_model=AccountResponse)
def get_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.put("/{account_id}", response_model=AccountResponse)
def update_account(account_id: int, update_data: AccountUpdate, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(account, field, value)
        
    db.commit()
    db.refresh(account)
    return account

@router.delete("/{account_id}", status_code=204)
def delete_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(account)
    db.commit()
    return None
