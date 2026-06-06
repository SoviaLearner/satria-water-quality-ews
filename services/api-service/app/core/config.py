import os
from dotenv import load_dotenv

# Load .env file if it exists (for local running outside docker)
load_dotenv()

class Settings:
    PROJECT_NAME: str = "SATRIA Water Quality EWS - API Gateway"
    
    # Microservice URLs
    ML_SERVICE_URL: str = os.getenv("ML_SERVICE_URL", "http://localhost:8001")
    DATA_SERVICE_URL: str = os.getenv("DATA_SERVICE_URL", "http://localhost:8002")
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")

settings = Settings()
