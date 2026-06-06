from pydantic import BaseModel
from typing import Dict, List, Optional

class PredictionRequest(BaseModel):
    data: Dict[str, float]
    save_to_supabase: Optional[bool] = False

class BatchPredictionRequest(BaseModel):
    data: List[Dict[str, float]]
    save_to_supabase: Optional[bool] = False

class PredictionResponse(BaseModel):
    predicted_class_id: int
    predicted_suitability_tier: str
    probabilities: Dict[str, float]
