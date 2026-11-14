# FinAI - Privacy-First Financial Intelligence Platform

FinAI is a modern, high-performance financial management web application built with **Python (FastAPI + SQLite)** on the backend and **TypeScript (React + Vite + Tailwind CSS)** on the frontend.

It is designed to run entirely locally with **zero external credentials**, **zero live/expired API keys**, **zero session tokens**, and **no Docker containers required**.

---

## 🔒 Security & Privacy Compliance

FinAI strictly adheres to the following privacy standards:
- **No Credentials**: No live, expired, or rotated API keys, secrets, private keys, passwords, or session tokens are used, required, or stored in any configuration file or database.
- **No Personal Identifiable Information (PII)**: All seeded and sample data uses 100% synthetic, anonymized records (generic mock merchants like "Metro Grocery", fictional salaries, and abstract accounts).
- **No Confidential Data**: Contains no proprietary third-party code, client information, or internal employee materials.
- **100% Local Execution**: Operates completely within your local environment using an embedded SQLite database (`backend/finance.db`).

---

## 🚀 Key Features

1. **Executive Financial Dashboard**:
   - Real-time consolidation of **Total Net Worth**, **Monthly Inflows**, **Monthly Outflows**, and **Savings Rate %**.
   - Interactive SVG-based monthly trend charts comparing cash flow over time.
   - Dynamic Category Allocation Donut chart with live hover metrics.
   - Quick-access Recent Transactions feed with instant status tags.

2. **Full Financial Ledger & Transaction Engine**:
   - Filter transactions dynamically by type (*Expense*, *Income*, *Transfer*), category, financial account, and date range.
   - Real-time keyword search across merchants and notes.
   - One-click **Export to CSV**.
   - Instant double-entry balance adjustment upon recording or deleting transactions.

3. **Multi-Account Custody**:
   - Manage checking, high-yield savings vaults, investment portfolios, and credit accounts.
   - Transfer funds directly between internal accounts with atomic balance updates.
   - Real-time asset vs liability balance breakdown.

4. **Monthly Budget Envelopes**:
   - Set monthly spending limits per category (Groceries, Dining Out, Housing, Transport, etc.).
   - Visual progress gauges with automatic color thresholds:
     - 🟢 Safe: `< 80%`
     - 🟡 Warning: `80% - 100%`
     - 🔴 Exceeded: `> 100%` with exact over-budget difference.

5. **Financial Goals & Wealth Targets**:
   - Plan targets like Emergency Funds, Down Payments, and Equipment Upgrades.
   - Live progress bars with completion percentages and countdown of days remaining.
   - Inline "+ Deposit" toolbar to directly allocate funds toward goals.

6. **Analytics & Recurring Subscriptions**:
   - Historical cash flow performance tables with monthly savings rates.
   - Fixed recurring subscriptions and bills tracker with monthly baseline overhead calculation.
   - One-click database reset button to re-seed clean synthetic demo data.

---

## 🛠️ Tech Stack

- **Backend**:
  - Python 3.10+
  - FastAPI (REST API with automatic Swagger docs)
  - SQLAlchemy 2.0 (ORM)
  - Pydantic v2 (Strict Schema Validation)
  - SQLite (Local zero-config embedded database)
  - Uvicorn (ASGI web server)

- **Frontend**:
  - TypeScript
  - React 18
  - Vite (Instant HMR bundler)
  - Tailwind CSS (Modern dark-mode financial UI)
  - Lucide React (Icons)

---

## 🏃 Quickstart Guide (No Docker Needed)

### Option 1: One-Step Launch (Recommended)

Simply run the included startup script from the project root:

```bash
./run.sh
```

This will automatically configure the Python virtual environment, install requirements, and spin up both servers concurrently:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Option 2: Running Services Separately

#### 1. Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend (Vite + TypeScript)
In a second terminal window:
```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
fin-ai/
├── backend/
│   ├── main.py             # FastAPI application entrypoint & CORS setup
│   ├── database.py         # SQLite database engine & session dependency
│   ├── models.py           # SQLAlchemy database schema models
│   ├── schemas.py          # Pydantic request and response schemas
│   ├── seed_data.py        # 100% synthetic, anonymized demo data generator
│   ├── requirements.txt    # Python dependencies
│   └── routers/
│       ├── accounts.py     # Account CRUD & balance endpoints
│       ├── transactions.py # Transaction ledger & balance auto-adjust
│       ├── budgets.py      # Category budget tracker & status calculation
│       ├── goals.py        # Wealth goals and milestone endpoints
│       ├── analytics.py    # Aggregate dashboard metrics & recurring bills
│       └── seed.py         # Database reset & sample re-population
├── frontend/
│   ├── src/
│   │   ├── api/client.ts   # Strongly typed API client
│   │   ├── types/finance.ts# TypeScript domain interfaces
│   │   ├── components/     # UI components (Sidebar, Navbar, StatCard, Charts, Modals)
│   │   ├── pages/          # Full page views (Dashboard, Ledger, Accounts, Budgets, Goals, Analytics)
│   │   ├── App.tsx         # Root application controller
│   │   └── main.tsx        # React entrypoint
│   ├── package.json
│   ├── vite.config.ts      # Vite dev server & proxy configuration
│   └── tailwind.config.js
├── run.sh                  # One-click startup script for both servers
└── README.md
```
