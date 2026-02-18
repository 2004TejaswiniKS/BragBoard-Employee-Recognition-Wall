import csv
import io
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from passlib.context import CryptContext

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..db import get_db
from .. import models, crud, schemas
from ..models import (
    User,
    Shoutout,
    ShoutoutRecipient,
    ShoutoutComment,
    RoleEnum,
    ShoutoutReport
)
from ..dependencies import admin_only
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(tags=["Admin"])


def password_hash(password: str):
    return pwd_context.hash(password)

@router.post("/users")
def create_user_by_admin(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        department=user.department,
        role=RoleEnum.employee,
        password_hash=password_hash(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # ✅ RETURN FULL USER
    return {
        "id": new_user.id,
        "full_name": new_user.full_name,
        "email": new_user.email,
        "department": new_user.department,
        "role": new_user.role
    }

# =================================================
# USERS – LIST ALL USERS
# =================================================

@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    users = (
        db.query(User)
        .filter(User.role == RoleEnum.employee)
        .order_by(User.id)
        .all()
    )

    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,          # ✅ REQUIRED
            "department": u.department,
            "joined_at": u.joined_at
        }
        for u in users
    ]

# =================================================
# USERS – DELETE USER
# =================================================

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ❗ Optional safety: prevent deleting admins
    if user.role == RoleEnum.admin:
        raise HTTPException(
            status_code=403,
            detail="Cannot delete admin user"
        )

    db.delete(user)
    db.commit()

    return {"msg": "User deleted successfully"}


# =================================================
# ANALYTICS – TOP CONTRIBUTORS
# =================================================

@router.get("/top-contributors")
def top_contributors(
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    results = (
        db.query(
            User.id,
            User.full_name,
            User.department,
            func.count(Shoutout.id).label("count")
        )
        .outerjoin(Shoutout, User.id == Shoutout.sender_id)
        .filter(User.role == RoleEnum.employee)
        .group_by(User.id)
        .order_by(func.count(Shoutout.id).desc())
        .limit(5)
        .all()
    )

    return [
        {
            "id": r.id,
            "full_name": r.full_name,
            "department": r.department,
            "count": r.count
        }
        for r in results if r.count > 0
    ]


# =================================================
# ANALYTICS – MOST TAGGED
# =================================================

@router.get("/most-tagged")
def most_tagged(
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    results = (
        db.query(
            User.id,
            User.full_name,
            User.department,
            func.count(ShoutoutRecipient.id).label("count")
        )
        .outerjoin(
            ShoutoutRecipient,
            User.id == ShoutoutRecipient.user_id
        )
        .filter(User.role == RoleEnum.employee)
        .group_by(User.id)
        .order_by(func.count(ShoutoutRecipient.id).desc())
        .limit(5)
        .all()
    )

    return [
        {
            "id": r.id,
            "full_name": r.full_name,
            "department": r.department,
            "count": r.count
        }
        for r in results if r.count > 0
    ]


# =================================================
# MODERATION – DELETE SHOUTOUT
# =================================================

@router.delete("/shoutouts/{shoutout_id}")
def delete_shoutout(
    shoutout_id: int,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    shoutout = db.query(Shoutout).filter(
        Shoutout.id == shoutout_id
    ).first()

    if not shoutout:
        raise HTTPException(status_code=404, detail="Shoutout not found")

    db.delete(shoutout)
    db.commit()
    return {"msg": "Shoutout deleted"}


# =================================================
# MODERATION – DELETE COMMENT
# =================================================

@router.delete("/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    comment = db.query(ShoutoutComment).filter(
        ShoutoutComment.id == comment_id
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    db.delete(comment)
    db.commit()
    return {"msg": "Comment deleted"}


# =================================================
# REPORTS – LIST
# =================================================

@router.get("/reports", response_model=list[schemas.ReportOut])
def list_reports(
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    reports = crud.get_all_reports(db)

    return [
        {
            "id": r.id,
            "shoutout_id": r.shoutout_id,

            "reported_by": r.reporter.full_name if r.reporter else "Unknown",
            "reported_by_email": r.reporter.email if r.reporter else None,

            "reason": r.reason,
            "created_at": r.created_at,

            "shoutout": None if not r.shoutout else {
                "content": r.shoutout.message,

                "posted_by": (
                    r.shoutout.sender.full_name
                    if r.shoutout.sender else "Unknown"
                ),
                "posted_by_email": (
                    r.shoutout.sender.email
                    if r.shoutout.sender else None
                ),
                "department": r.shoutout.department
            }
        }
        for r in reports
    ]


# =================================================
# REPORTS – RESOLVE
# =================================================

@router.delete("/reports/{report_id}")
def resolve_report(
    report_id: int,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    report = db.query(models.ShoutoutReport).filter(
        models.ShoutoutReport.id == report_id
    ).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    db.delete(report)
    db.commit()
    return {"msg": "Report resolved"}
# =================================================
# WEEK 8 – EXPORT SHOUTOUTS (CSV)
# =================================================

@router.get("/export/shoutouts/csv")
def export_shoutouts_csv(
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Shoutout ID",
        "Message",
        "Sender",
        "Department",
        "Created At"
    ])

    shoutouts = (
        db.query(
            Shoutout.id,
            Shoutout.message,
            User.full_name,
            User.department,
            Shoutout.created_at
        )
        .join(User, User.id == Shoutout.sender_id)
        .all()
    )

    for s in shoutouts:
        writer.writerow([
            s.id,
            s.message,
            s.full_name,
            s.department,
            s.created_at
        ])

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=shoutouts_report.csv"
        }
    )
# =================================================
# WEEK 8 – EXPORT SHOUTOUTS (PDF)
# =================================================

@router.get("/export/shoutouts/pdf")
def export_shoutouts_pdf(
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    text = pdf.beginText(40, 800)

    text.setFont("Helvetica", 10)
    text.textLine("BragBoard – Shoutouts Report")
    text.textLine("-" * 50)
    text.textLine(" ")

    shoutouts = (
        db.query(
            Shoutout.message,
            User.full_name,
            User.department,
            Shoutout.created_at
        )
        .join(User, User.id == Shoutout.sender_id)
        .all()
    )

    for s in shoutouts:
        text.textLine(f"Sender: {s.full_name} ({s.department})")
        text.textLine(f"Message: {s.message}")
        text.textLine(f"Date: {s.created_at}")
        text.textLine("-" * 50)

    pdf.drawText(text)
    pdf.showPage()
    pdf.save()

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=shoutouts_report.pdf"
        }
    )
# =================================================
# WEEK 8 – LEADERBOARD
# =================================================

@router.get("/leaderboard")
def leaderboard(
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    results = (
        db.query(
            User.id,
            User.full_name,
            User.department,
            func.count(ShoutoutRecipient.id).label("tags_received")
        )
        .outerjoin(
            ShoutoutRecipient,
            User.id == ShoutoutRecipient.user_id
        )
        .filter(User.role == RoleEnum.employee)
        .group_by(User.id)
        .order_by(func.count(ShoutoutRecipient.id).desc())
        .limit(10)
        .all()
    )

    return [
        {
            "id": r.id,
            "full_name": r.full_name,
            "department": r.department,
            "tags_received": r.tags_received
        }
        for r in results if r.tags_received > 0
    ]
