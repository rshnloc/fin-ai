from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Account, Transaction
from seed_data import seed_database

router = APIRouter(prefix="/api/seed", tags=["Seed Data"])

@router.get("/status")
def seed_status(db: Session = Depends(get_db)):
    account_count = db.query(Account).count()
    txn_count = db.query(Transaction).count()
    return {
        "populated": account_count > 0,
        "accounts": account_count,
        "transactions": txn_count
    }

@router.post("/reset")
def reset_and_seed(db: Session = Depends(get_db)):
    result = seed_database(db, force=True)
    return result
