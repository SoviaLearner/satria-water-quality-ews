import httpx
import logging
from fastapi import HTTPException, status
from app.core.config import settings

logger = logging.getLogger("api-service.ml_client")

class MLClient:
    def __init__(self):
        self.base_url = settings.ML_SERVICE_URL

    async def get_model_info(self) -> dict:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/model-info", timeout=5.0)
                if response.status_code != 200:
                    logger.error(f"ML service returned status {response.status_code}: {response.text}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"ML Service Error: {response.text}"
                    )
                return response.json()
        except httpx.RequestError as e:
            logger.error(f"Failed to connect to ML service: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"ML Service is unavailable: {str(e)}"
            )

    async def predict(self, payload: dict) -> dict:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/predict",
                    json=payload,
                    timeout=10.0
                )
                if response.status_code != 200:
                    logger.error(f"ML service prediction returned status {response.status_code}: {response.text}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"ML Service Prediction Error: {response.text}"
                    )
                return response.json()
        except httpx.RequestError as e:
            logger.error(f"Failed to connect to ML service: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"ML Service is unavailable for prediction: {str(e)}"
            )

ml_client = MLClient()
