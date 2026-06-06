import logging
from fastapi import APIRouter, Query
from app.schemas.eda_schema import EdaRecordResponse, EdaCountResponse
from app.services.data_client import data_client

logger = logging.getLogger("api-service.eda")
router = APIRouter(prefix="/eda", tags=["EDA Statistics"])

@router.get("/rows", response_model=EdaRecordResponse)
async def get_eda_rows(
    limit: int = Query(1000, ge=1, le=5000, description="Max rows of EDA data to return")
):
    """
    Fetch raw water quality records for global EDA display (open public access).
    """
    data = await data_client.get_eda_rows(limit=limit)
    return data

@router.get("/count", response_model=EdaCountResponse)
async def get_eda_count():
    """
    Get the total row count of the clean water quality dataset (open public access).
    """
    count_data = await data_client.get_eda_count()
    return count_data
