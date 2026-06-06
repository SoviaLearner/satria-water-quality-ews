import logging
from fastapi import APIRouter, Depends, status
from app.core.security import get_current_user
from app.schemas.profile_schema import Profile, ProfileUpdate
from app.services.data_client import data_client

logger = logging.getLogger("api-service.profile")
router = APIRouter(prefix="/profiles", tags=["Profiles"])

@router.get("", response_model=Profile)
async def get_profile(user: dict = Depends(get_current_user)):
    """
    Get the profile of the current authenticated user.
    If the profile does not exist in the database yet, it will be automatically initialized
    with the metadata present in the user's JWT token.
    """
    user_id = user["sub"]
    email = user.get("email")
    
    # Extract metadata if available
    user_metadata = user.get("raw_user_meta_data", {})
    full_name = user_metadata.get("full_name") or user_metadata.get("name")
    
    profile_data = await data_client.get_profile(
        user_id=user_id,
        email=email,
        full_name=full_name
    )
    return profile_data

@router.put("", response_model=Profile)
async def update_profile(
    updates: ProfileUpdate,
    user: dict = Depends(get_current_user)
):
    """
    Update the profile of the current authenticated user.
    """
    user_id = user["sub"]
    update_data = updates.model_dump(exclude_unset=True)
    profile_data = await data_client.update_profile(user_id=user_id, updates=update_data)
    return profile_data
