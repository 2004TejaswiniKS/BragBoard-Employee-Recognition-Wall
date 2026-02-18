from fastapi import Depends, HTTPException
from app.routers.auth import get_current_user
from app.models import RoleEnum

def admin_only(user=Depends(get_current_user)):
    if user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Admin access only")
    return user
