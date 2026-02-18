from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..db import SessionLocal
import traceback

router = APIRouter(prefix='/api/users', tags=['users'])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('/')
def debug_list_users(db: Session = Depends(get_db)):
    '''Debug endpoint: return users or full traceback (development only).'''
    try:
        users = crud.get_all_users(db)
        # convert SQLAlchemy models to plain dicts if necessary
        result = []
        for u in users:
            try:
                result.append({
                    "id": getattr(u, "id", None),
                    "full_name": getattr(u, "full_name", getattr(u, "name", None)),
                    "email": getattr(u, "email", None),
                    "department": getattr(u, "department", None),
                    "role": getattr(u, "role", None),
                    "joined_at": getattr(u, "joined_at", None),
                })
            except Exception as e:
                result.append({"error_serializing_user": str(e)})
        return {"ok": True, "count": len(result), "users": result}
    except Exception as exc:
        # return full traceback to help debug (dev only)
        tb = traceback.format_exc()
        raise HTTPException(status_code=500, detail={"error": str(exc), "trace": tb})
