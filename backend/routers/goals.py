from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Goal
from schemas import GoalCreate, GoalUpdate, GoalResponse

router = APIRouter(prefix="/api/goals", tags=["Goals"])

def _enrich_goal(g: Goal) -> dict:
    pct = round((g.current_amount / g.target_amount * 100), 1) if g.target_amount > 0 else 0.0
    return {
        "id": g.id,
        "title": g.title,
        "target_amount": g.target_amount,
        "current_amount": g.current_amount,
        "target_date": g.target_date,
        "category": g.category,
        "color": g.color,
        "percentage": min(pct, 100.0)
    }

@router.get("", response_model=List[GoalResponse])
def get_goals(db: Session = Depends(get_db)):
    goals = db.query(Goal).order_by(Goal.target_date.asc()).all()
    return [_enrich_goal(g) for g in goals]

@router.post("", response_model=GoalResponse, status_code=201)
def create_goal(goal_in: GoalCreate, db: Session = Depends(get_db)):
    goal = Goal(**goal_in.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return _enrich_goal(goal)

@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(goal_id: int, update_data: GoalUpdate, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)

    db.commit()
    db.refresh(goal)
    return _enrich_goal(goal)

@router.delete("/{goal_id}", status_code=204)
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return None
