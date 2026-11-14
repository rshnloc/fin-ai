from datetime import date, timedelta
import random
from sqlalchemy.orm import Session
from models import Account, Transaction, Budget, Goal, RecurringBill

CATEGORY_COLORS = {
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
}

def seed_database(db: Session, force: bool = False):
    # Check if accounts already exist
    existing_count = db.query(Account).count()
    if existing_count > 0 and not force:
        return {"message": "Database already populated", "accounts": existing_count}

    if force:
        db.query(Transaction).delete()
        db.query(Budget).delete()
        db.query(Goal).delete()
        db.query(RecurringBill).delete()
        db.query(Account).delete()
        db.commit()

    # 1. Create Synthetic Accounts (Zero PII, no real bank details or account numbers)
    accounts = [
        Account(name="Everyday Checking", account_type="checking", balance=4250.75, currency="USD", color="#3B82F6"),
        Account(name="High-Yield Vault", account_type="savings", balance=18500.00, currency="USD", color="#10B981"),
        Account(name="Index Fund Portfolio", account_type="investment", balance=34200.50, currency="USD", color="#8B5CF6"),
        Account(name="Rewards Card", account_type="credit", balance=-842.30, currency="USD", color="#EF4444"),
    ]
    db.add_all(accounts)
    db.commit()

    for acc in accounts:
        db.refresh(acc)

    checking = accounts[0]
    savings = accounts[1]
    investment = accounts[2]
    credit = accounts[3]

    # Current month prefix
    today = date.today()
    curr_month_str = today.strftime("%Y-%m")

    # 2. Create Budgets
    budgets = [
        Budget(category="Groceries", monthly_limit=600.00, period_month=curr_month_str, color="#10B981"),
        Budget(category="Dining Out", monthly_limit=350.00, period_month=curr_month_str, color="#F59E0B"),
        Budget(category="Housing", monthly_limit=1500.00, period_month=curr_month_str, color="#6366F1"),
        Budget(category="Transport", monthly_limit=250.00, period_month=curr_month_str, color="#3B82F6"),
        Budget(category="Utilities", monthly_limit=200.00, period_month=curr_month_str, color="#EC4899"),
        Budget(category="Entertainment", monthly_limit=200.00, period_month=curr_month_str, color="#8B5CF6"),
        Budget(category="Shopping", monthly_limit=300.00, period_month=curr_month_str, color="#14B8A6"),
    ]
    db.add_all(budgets)

    # 3. Create Goals
    goals = [
        Goal(title="Emergency Safety Fund", target_amount=25000.00, current_amount=18500.00, target_date=today + timedelta(days=180), category="Savings", color="#10B981"),
        Goal(title="House Down Payment", target_amount=60000.00, current_amount=34200.50, target_date=today + timedelta(days=540), category="Real Estate", color="#6366F1"),
        Goal(title="Tech Equipment Upgrade", target_amount=3000.00, current_amount=2150.00, target_date=today + timedelta(days=60), category="Electronics", color="#3B82F6"),
        Goal(title="Vacation Trip", target_amount=4000.00, current_amount=1200.00, target_date=today + timedelta(days=120), category="Travel", color="#F59E0B"),
    ]
    db.add_all(goals)

    # 4. Create Recurring Subscriptions / Bills
    bills = [
        RecurringBill(name="Cloud Storage & Backup", amount=14.99, frequency="monthly", due_day=5, category="Subscriptions"),
        RecurringBill(name="Fiber Broadband Internet", amount=69.99, frequency="monthly", due_day=12, category="Utilities"),
        RecurringBill(name="Fitness Center Pass", amount=45.00, frequency="monthly", due_day=1, category="Healthcare"),
        RecurringBill(name="Music Streaming Service", amount=10.99, frequency="monthly", due_day=18, category="Entertainment"),
        RecurringBill(name="Streaming Video Bundle", amount=19.99, frequency="monthly", due_day=22, category="Entertainment"),
    ]
    db.add_all(bills)
    db.commit()

    # 5. Generate Past 60 Days of Realistic Transactions (100% synthetic)
    sample_merchants = {
        "Groceries": ["Organic Market", "Metro Grocery", "Fresh Foods Hub", "Community Market"],
        "Dining Out": ["Artisan Bistro", "Green Salad Cafe", "Downtown Noodle Bar", "Espresso Corner", "Taco Cantina"],
        "Housing": ["Residential Lease Management", "Home Owners Association"],
        "Transport": ["Metro Transit Card", "Rideshare Service", "City Bike Share", "EcoFuel Station"],
        "Utilities": ["City Electric Utility", "Municipal Water Service", "District Gas & Power"],
        "Entertainment": ["Starlight Cinema", "Concert Hall", "Independent Bookstore", "Gaming Platform"],
        "Shopping": ["Everyday Essentials Store", "Apparel & Co", "Home Goods Outlet"],
        "Healthcare": ["Wellness Pharmacy", "Dental Hygiene Clinic"],
        "Subscriptions": ["Cloud Storage", "Music Pass", "Video Hub"],
    }

    transactions = []
    # Add regular monthly salary deposits for the last 3 months
    for i in range(3):
        salary_date = today - timedelta(days=i * 30 + 1)
        transactions.append(
            Transaction(
                account_id=checking.id,
                type="income",
                amount=4800.00,
                category="Salary",
                merchant="Enterprise Payroll Direct Deposit",
                date=salary_date,
                notes="Bi-weekly professional compensation",
                status="completed"
            )
        )
        # Mid-month paycheck
        mid_salary_date = today - timedelta(days=i * 30 + 15)
        transactions.append(
            Transaction(
                account_id=checking.id,
                type="income",
                amount=4800.00,
                category="Salary",
                merchant="Enterprise Payroll Direct Deposit",
                date=mid_salary_date,
                notes="Bi-weekly professional compensation",
                status="completed"
            )
        )
        # Side consulting or dividend income
        div_date = today - timedelta(days=i * 30 + 20)
        transactions.append(
            Transaction(
                account_id=investment.id,
                type="income",
                amount=320.50,
                category="Investments",
                merchant="Index Portfolio Dividend Distribution",
                date=div_date,
                notes="Quarterly dividend distribution",
                status="completed"
            )
        )

    # Add housing expense on the 1st of each month
    for i in range(3):
        rent_date = today.replace(day=1) - timedelta(days=i * 30)
        transactions.append(
            Transaction(
                account_id=checking.id,
                type="expense",
                amount=1450.00,
                category="Housing",
                merchant="Residential Lease Management",
                date=rent_date,
                notes="Monthly rent payment",
                status="completed"
            )
        )

    # Random expense transactions over the last 60 days
    random.seed(42) # Deterministic synthetic generation
    for days_ago in range(60):
        txn_date = today - timedelta(days=days_ago)
        # 1-3 transactions per day
        daily_txns = random.randint(1, 3)
        for _ in range(daily_txns):
            cat = random.choice(list(sample_merchants.keys()))
            merchant = random.choice(sample_merchants[cat])
            
            if cat == "Groceries":
                amount = round(random.uniform(25.0, 140.0), 2)
                acc = random.choice([checking, credit])
            elif cat == "Dining Out":
                amount = round(random.uniform(12.0, 65.0), 2)
                acc = credit
            elif cat == "Transport":
                amount = round(random.uniform(5.50, 45.0), 2)
                acc = credit
            elif cat == "Utilities":
                amount = round(random.uniform(40.0, 110.0), 2)
                acc = checking
            elif cat == "Entertainment":
                amount = round(random.uniform(15.0, 85.0), 2)
                acc = credit
            elif cat == "Shopping":
                amount = round(random.uniform(20.0, 160.0), 2)
                acc = credit
            elif cat == "Healthcare":
                amount = round(random.uniform(15.0, 50.0), 2)
                acc = checking
            else:
                amount = round(random.uniform(9.99, 29.99), 2)
                acc = credit

            transactions.append(
                Transaction(
                    account_id=acc.id,
                    type="expense",
                    amount=amount,
                    category=cat,
                    merchant=merchant,
                    date=txn_date,
                    notes=f"Synthetic transaction for {cat.lower()}",
                    status="completed"
                )
            )

    # Add a few internal transfers
    transactions.append(
        Transaction(
            account_id=checking.id,
            type="transfer",
            amount=500.00,
            category="Savings",
            merchant="Transfer to High-Yield Vault",
            date=today - timedelta(days=5),
            notes="Automatic monthly savings allocation",
            status="completed",
            transfer_target_account_id=savings.id
        )
    )
    transactions.append(
        Transaction(
            account_id=checking.id,
            type="transfer",
            amount=750.00,
            category="Investments",
            merchant="Transfer to Index Fund Portfolio",
            date=today - timedelta(days=12),
            notes="Monthly dollar-cost averaging",
            status="completed",
            transfer_target_account_id=investment.id
        )
    )

    db.add_all(transactions)
    db.commit()

    return {
        "message": "Synthetic demo data generated successfully",
        "accounts": len(accounts),
        "transactions": len(transactions),
        "budgets": len(budgets),
        "goals": len(goals),
        "bills": len(bills)
    }
