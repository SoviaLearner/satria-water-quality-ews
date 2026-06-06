import httpx
import logging
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from app.core.config import settings

logger = logging.getLogger("api-service.data_client")

class DataClient:
    def __init__(self):
        self.base_url = settings.DATA_SERVICE_URL

    async def get_profile(self, user_id: str, email: Optional[str] = None, full_name: Optional[str] = None) -> dict:
        params = {}
        if email:
            params["email"] = email
        if full_name:
            params["full_name"] = full_name
            
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/internal/profiles/{user_id}",
                    params=params,
                    timeout=5.0
                )
                if response.status_code != 200:
                    logger.error(f"Data service profile fetch failed ({response.status_code}): {response.text}")
                    raise HTTPException(status_code=response.status_code, detail=response.text)
                return response.json()
        except httpx.RequestError as e:
            logger.error(f"Failed to connect to Data service: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Data Service is unavailable: {str(e)}"
            )

    async def update_profile(self, user_id: str, updates: dict) -> dict:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.put(
                    f"{self.base_url}/internal/profiles/{user_id}",
                    json=updates,
                    timeout=5.0
                )
                if response.status_code != 200:
                    logger.error(f"Data service profile update failed ({response.status_code}): {response.text}")
                    raise HTTPException(status_code=response.status_code, detail=response.text)
                return response.json()
        except httpx.RequestError as e:
            logger.error(f"Failed to connect to Data service: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Data Service is unavailable: {str(e)}"
            )

    async def save_prediction_log(self, log_data: dict) -> dict:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/internal/logs",
                    json=log_data,
                    timeout=5.0
                )
                if response.status_code != 201:
                    logger.error(f"Data service save log failed ({response.status_code}): {response.text}")
                    raise HTTPException(status_code=response.status_code, detail=response.text)
                return response.json()
        except httpx.RequestError as e:
            logger.error(f"Failed to connect to Data service: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Data Service is unavailable: {str(e)}"
            )

    async def get_prediction_logs(self, user_id: str, limit: int = 100) -> List[dict]:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/internal/logs/{user_id}",
                    params={"limit": limit},
                    timeout=5.0
                )
                if response.status_code != 200:
                    logger.error(f"Data service log fetch failed ({response.status_code}): {response.text}")
                    raise HTTPException(status_code=response.status_code, detail=response.text)
                return response.json()
        except httpx.RequestError as e:
            logger.error(f"Failed to connect to Data service: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Data Service is unavailable: {str(e)}"
            )

    async def get_user_risk_count(self, user_id: str) -> dict:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/internal/logs/risk-count/{user_id}",
                    timeout=5.0
                )
                if response.status_code != 200:
                    logger.error(f"Data service risk count fetch failed ({response.status_code}): {response.text}")
                    raise HTTPException(status_code=response.status_code, detail=response.text)
                return response.json()
        except httpx.RequestError as e:
            logger.error(f"Failed to connect to Data service: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Data Service is unavailable: {str(e)}"
            )

    async def get_eda_rows(self, limit: int = 1000) -> dict:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/internal/eda/rows",
                    params={"limit": limit},
                    timeout=10.0
                )
                if response.status_code != 200:
                    logger.error(f"Data service EDA rows fetch failed ({response.status_code}): {response.text}")
                    raise HTTPException(status_code=response.status_code, detail=response.text)
                return response.json()
        except httpx.RequestError as e:
            logger.error(f"Failed to connect to Data service: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Data Service is unavailable: {str(e)}"
            )

    async def get_eda_count(self) -> dict:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/internal/eda/count",
                    timeout=5.0
                )
                if response.status_code != 200:
                    logger.error(f"Data service EDA count fetch failed ({response.status_code}): {response.text}")
                    raise HTTPException(status_code=response.status_code, detail=response.text)
                return response.json()
        except httpx.RequestError as e:
            logger.error(f"Failed to connect to Data service: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Data Service is unavailable: {str(e)}"
            )

data_client = DataClient()
