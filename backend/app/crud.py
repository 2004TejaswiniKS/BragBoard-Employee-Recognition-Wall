from sqlalchemy.orm import Session, joinedload
from .auth import hash_password, verify_password
from . import models


# ---------- USERS ----------

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_all_users(db: Session):
    return db.query(models.User).all()


def create_user(db: Session, user_in):
    """
    Creates user with role (employee/admin)
    """
    user = models.User(
        full_name=user_in.full_name,
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        department=user_in.department,
        role=user_in.role              # ✅ FIX
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


# ---------- SHOUTOUTS ----------

def create_shoutout(db: Session, sender_id: int, shout_in):
    shout = models.Shoutout(
        message=shout_in.message,
        sender_id=sender_id,
        department=shout_in.department
    )
    db.add(shout)
    db.commit()
    db.refresh(shout)

    for rid in shout_in.recipient_ids:
        db.add(
            models.ShoutoutRecipient(
                shoutout_id=shout.id,
                user_id=rid
            )
        )

    db.commit()
    return shout


def get_shoutouts(db: Session, skip=0, limit=50):
    return (
        db.query(models.Shoutout)
        .options(
            joinedload(models.Shoutout.sender),
            joinedload(models.Shoutout.recipients)
            .joinedload(models.ShoutoutRecipient.user)
        )
        .order_by(models.Shoutout.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
# ---------- REACTIONS ----------

def add_reaction(db: Session, shoutout_id: int, user_id: int, reaction: str):
    db.query(models.ShoutoutReaction).filter(
        models.ShoutoutReaction.shoutout_id == shoutout_id,
        models.ShoutoutReaction.user_id == user_id
    ).delete()

    react = models.ShoutoutReaction(
        shoutout_id=shoutout_id,
        user_id=user_id,
        reaction=reaction
    )
    db.add(react)
    db.commit()
    return react


def remove_reaction(db: Session, shoutout_id: int, user_id: int):
    db.query(models.ShoutoutReaction).filter(
        models.ShoutoutReaction.shoutout_id == shoutout_id,
        models.ShoutoutReaction.user_id == user_id
    ).delete()
    db.commit()


def get_reactions(db: Session, shoutout_id: int):
    return (
        db.query(models.ShoutoutReaction)
        .options(joinedload(models.ShoutoutReaction.user))
        .filter(models.ShoutoutReaction.shoutout_id == shoutout_id)
        .all()
    )


# ---------- COMMENTS ----------

def add_comment(db: Session, shoutout_id: int, user_id: int, text: str):
    comment = models.ShoutoutComment(
        shoutout_id=shoutout_id,
        user_id=user_id,
        comment=text
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def get_comments(db: Session, shoutout_id: int):
    return (
        db.query(models.ShoutoutComment)
        .options(joinedload(models.ShoutoutComment.user))
        .filter(models.ShoutoutComment.shoutout_id == shoutout_id)
        .order_by(models.ShoutoutComment.created_at)
        .all()
    )

def create_report(db: Session, shoutout_id: int, user_id: int, reason: str):
    report = models.ShoutoutReport(
        shoutout_id=shoutout_id,
        reported_by=user_id,
        reason=reason
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def get_all_reports(db: Session):
    return (
        db.query(models.ShoutoutReport)
        .options(
            joinedload(models.ShoutoutReport.reporter),
            joinedload(models.ShoutoutReport.shoutout)
        )
        .order_by(models.ShoutoutReport.created_at.desc())
        .all()
)
