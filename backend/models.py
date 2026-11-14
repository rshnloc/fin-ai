from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    account_type = Column(String(50), nullable=False, default="checking") # checking, savings, investment, credit
    balance = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), default="USD")
    color = Column(String(20), default="#4F46E5")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan", foreign_keys="[Transaction.account_id]")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    type = Column(String(20), nullable=False) # income, expense, transfer
    amount = Column(Float, nullable=False)
    category = Column(String(50), nullable=False)
    merchant = Column(String(120), nullable=False)
    date = Column(Date, nullable=False, default=date.today)
    notes = Column(Text, nullable=True)
    status = Column(String(20), default="completed") # completed, pending
    transfer_target_account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)

    account = relationship("Account", foreign_keys=[account_id], back_populates="transactions")
    target_account = relationship("Account", foreign_keys=[transfer_target_account_id])


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False)
    monthly_limit = Column(Float, nullable=False)
    period_month = Column(String(7), nullable=False) # format YYYY-MM
    color = Column(String(20), default="#0EA5E9")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    target_date = Column(Date, nullable=False)
    category = Column(String(50), default="Savings")
    color = Column(String(20), default="#10B981")


class RecurringBill(Base):
    __tablename__ = "recurring_bills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    frequency = Column(String(20), default="monthly") # monthly, yearly
    due_day = Column(Integer, default=1)
    category = Column(String(50), default="Subscriptions")
    is_active = Column(Boolean, default=True)
