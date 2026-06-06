import logging
from typing import List, Dict
from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_user
from app.schemas.logs_schema import PredictionLog
from app.services.data_client import data_client

logger = logging.getLogger("api-service.logs")
router = APIRouter(prefix="/logs", tags=["Prediction Logs"])

@router.get("", response_model=List[PredictionLog])
async def get_prediction_logs(
    limit: int = Query(100, ge=1, le=1000, description="Max logs to return"),
    user: dict = Depends(get_current_user)
):
    """
    Get prediction history logs of the current authenticated user.
    """
    user_id = user["sub"]
    logs = await data_client.get_prediction_logs(user_id=user_id, limit=limit)
    return logs

@router.get("/risk-count", response_model=Dict[str, int])
async def get_user_risk_count(user: dict = Depends(get_current_user)):
    """
    Get the total count of reduced suitability warnings for the current user.
    """
    user_id = user["sub"]
    count_data = await data_client.get_user_risk_count(user_id=user_id)
    return count_data
