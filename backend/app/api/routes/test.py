"""Test endpoint to verify authentication is working."""

from fastapi import APIRouter, Depends
from ...core.dependencies import CurrentIdentity, get_current_identity

router = APIRouter(prefix="/test")

@router.get("/auth-check")
async def auth_check(identity: CurrentIdentity = Depends(get_current_identity)):
    """Test endpoint to verify authentication is working."""
    return {
        "message": "Authentication is working!",
        "tenant_id": identity.tenant_id,
        "user_id": identity.user_id,
        "role": identity.role
    }
