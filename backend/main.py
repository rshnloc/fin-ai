from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from seed_data import seed_database
from routers import accounts, transactions, budgets, goals, analytics, seed

# Initialize Database tables
Base.metadata.create_all(bind=engine)

# Auto-seed synthetic demo data on first start
db = SessionLocal()
try:
    seed_database(db, force=False)
finally:
    db.close()

app = FastAPI(
    title="FinAI - Modern Financial Management Platform",
    description="Privacy-first, zero-credential personal and business finance tracking engine.",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(budgets.router)
app.include_router(goals.router)
app.include_router(analytics.router)
app.include_router(seed.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FinAI Backend Engine",
        "storage": "Local SQLite Database (Zero credentials required)",
        "privacy": "100% Local Execution, Zero External Tracking, Zero PII"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
