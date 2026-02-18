from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models
from ..db import get_db
from ..routers.auth import get_current_user

router = APIRouter(prefix="/api/shoutouts", tags=["shoutouts"])

@router.post("/", status_code=201)
def create_shoutout(
    shout_in: schemas.ShoutoutCreate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    shout = crud.create_shoutout(db, user.id, shout_in)
    return {"msg": "Shoutout created"}

@router.get("/", response_model=List[schemas.ShoutoutOut])
def list_shoutouts(user=Depends(get_current_user), db: Session = Depends(get_db)):
    shoutouts = crud.get_shoutouts(db)
    return [
        {
            "id": s.id,
            "message": s.message,
            "sender_name": s.sender.full_name if s.sender else "Unknown",
            "sender_department": s.sender.department if s.sender else None,
            "recipients": [r.user.full_name for r in s.recipients if r.user],
            "department": s.department,
            "created_at": s.created_at,
        }
        for s in shoutouts
    ]


@router.post("/{shoutout_id}/comments", status_code=201)
def add_comment(
    shoutout_id: int,
    data: schemas.CommentCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    crud.add_comment(db, shoutout_id, current_user.id, data.comment)
    return {"msg": "Comment added"}


@router.get("/{shoutout_id}/comments", response_model=List[schemas.CommentOut])
def get_comments(shoutout_id: int, db: Session = Depends(get_db)):
    comments = crud.get_comments(db, shoutout_id)
    return [
        {
            "id": c.id,
            "user_name": c.user.full_name,
            "department": c.user.department,
            "comment": c.comment,
            "created_at": c.created_at
        }
        for c in comments
    ]
@router.post("/{shoutout_id}/report", status_code=201)
def report_shoutout(
    shoutout_id: int,
    data: schemas.ReportCreate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    crud.create_report(db, shoutout_id, user.id, data.reason)
    return {"msg": "Shoutout reported successfully"}

@router.get(
    "/{shoutout_id}/reactions",
    response_model=List[dict]
)
def get_reactions(
    shoutout_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    reactions = crud.get_reactions(db, shoutout_id)
    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "user_name": r.user.full_name,
            "reaction": r.reaction.value
        }
        for r in reactions
    ]


@router.post("/{shoutout_id}/reactions", status_code=201)
def add_reaction(
    shoutout_id: int,
    data: schemas.ReactionCreate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate reaction
    if data.reaction not in ["like", "clap", "love"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid reaction type"
        )

    crud.add_reaction(
        db,
        shoutout_id,
        user.id,
        data.reaction
    )
    return {"msg": "Reaction added"}
