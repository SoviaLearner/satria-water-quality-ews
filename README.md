# SATRIA Water Quality EWS

SATRIA adalah aplikasi Early Warning System untuk klasifikasi kualitas air akuakultur. Sistem ini menggabungkan dataset kualitas air, model machine learning, FastAPI backend, Supabase, dan dashboard frontend untuk membantu membaca kondisi air, menjalankan prediksi, melihat analytics, EDA, serta riwayat prediction logs.

## Ringkasan

Project ini dibangun untuk workflow PBL Web Service, MLOps, dan Data Mining:

```text
Dataset aquaculture
  -> preprocessing dan EDA
  -> model training
  -> model artifact
  -> FastAPI prediction service
  -> Supabase storage
  -> Vite TypeScript dashboard
  -> Vercel / Docker deployment
```

## Tech Stack

Frontend:
- Vite
- TypeScript
- Supabase JS Client
- Native HTML/CSS rendering
- SVG/CSS chart components

Backend:
- FastAPI
- Uvicorn
- Pydantic
- Pandas
- LightGBM
- Scikit-learn
- Joblib

Machine Learning:
- LightGBM classifier
- Model artifact: `models/water_quality_classifier.joblib`
- Metadata: `models/water_quality_classifier_metadata.json`
- Current recorded model accuracy: around `99.77%`

Database and Auth:
- Supabase Auth
- Supabase PostgreSQL
- Row Level Security policies
- Tables: `profiles`, `prediction_results`, `water_quality_clean`

Deployment:
- Vercel for frontend
- Docker / Docker Compose for full local stack
- Nginx for static frontend Docker image

## Main Features

- User login and register with Supabase Auth.
- Profile settings saved to Supabase `profiles`.
- Security and Privacy page for display name and password update.
- Manual prediction form using the trained backend model.
- Prediction logs saved to Supabase.
- Reports page with refresh and search.
- Analytics dashboard using Supabase EDA data.
- Nitrite, dissolved oxygen, pH, ammonia, phosphorus, and other parameter charts.
- EDA page with descriptive statistics, distribution chart, and outlier analysis.
- Deployment files for Vercel and Docker.

## Dataset

Dataset:
- Title: Refined Aquaculture Water Suitability Signals
- Theme: Aquaculture water suitability
- Shape: 4,300 rows and 17 columns
- Source: Kaggle

Core input parameters:
- Temperature
- Turbidity
- Dissolved Oxygen
- Biochemical Oxygen Demand
- Carbon Dioxide
- pH
- Total Alkalinity
- Total Hardness
- Calcium
- Ammonia
- Nitrite
- Phosphorus
- Hydrogen Sulfide
- Plankton Count

Prediction output:
- `predicted_class_id`
- `predicted_suitability_tier`
- probability per class

## Project Structure

```text
satria-water-quality-ews/
|-- backend/
|   |-- app/
|   |   `-- main.py                  # FastAPI app and prediction API
|   |-- model/
|   |   |-- preprocessing.py          # Dataset cleaning utilities
|   |   |-- train.py                  # Model training pipeline
|   |   |-- predict.py                # Model loading and prediction helper
|   |   |-- eda.py                    # EDA helper
|   |   `-- upload_clean_dataset_to_supabase.py
|   |-- requirements.txt
|   `-- Dockerfile
|
|-- frontend/
|   |-- public/
|   |   `-- assets/
|   |-- src/
|   |   |-- main.ts                   # App lifecycle and event handlers
|   |   |-- state.ts                  # Global app state
|   |   |-- constants.ts              # API URL, fields, parameter labels
|   |   |-- styles.css                # App styling
|   |   |-- services/
|   |   |   |-- api.ts                # Backend API calls
|   |   |   |-- supabase.ts           # Supabase client
|   |   |   `-- supabaseData.ts       # Profile, logs, EDA data calls
|   |   |-- views/
|   |   |   |-- appView.ts            # Page rendering
|   |   |   `-- charts.ts             # Chart rendering
|   |   `-- utils/
|   |-- package.json
|   |-- Dockerfile
|   `-- nginx.conf
|
|-- models/
|   |-- water_quality_classifier.joblib
|   |-- water_quality_classifier_metadata.json
|   `-- preprocessing/
|
|-- notebooks/
|   |-- eda_aquaculture.ipynb
|   |-- preprocessing_aquaculture.ipynb
|   |-- manual_mlops_pipeline.ipynb
|   `-- pycaret_aqua_water_suitability_.ipynb
|
|-- supabase/
|   |-- create_profiles_table.sql
|   |-- create_prediction_results_table.sql
|   |-- create_water_quality_clean_table.sql
|   `-- update_realtime_eda_and_prediction_policies.sql
|
|-- docs/
|   `-- DEPLOYMENT_CHECKLIST.md
|
|-- docker-compose.yml
|-- vercel.json
|-- .env.example
|-- .dockerignore
`-- README.md
```

## Environment Variables

Root `.env` for backend and Docker Compose:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_TABLE=water_quality_clean
SUPABASE_PREDICTION_TABLE=prediction_results
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Frontend `.env` for local Vite development:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Important:
- Use Supabase anon key only in frontend.
- Use Supabase service role key only in backend/server environment.
- Do not commit real `.env` secrets.

## Local Development

Backend:

```bash
venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev -- --port 5173
```

Open:
- Frontend: `http://127.0.0.1:5173`
- Backend health: `http://127.0.0.1:8000/health`
- Backend docs: `http://127.0.0.1:8000/docs`

## Build

Frontend production build:

```bash
cd frontend
npm run build
```

Output:

```text
frontend/dist/
```

Backend model prediction test:

```bash
venv\Scripts\python.exe backend\model\predict.py --sample
```

## Docker

Run full stack locally:

```bash
docker-compose up --build
```

If your Docker installation supports Compose v2:

```bash
docker compose up --build
```

Ports:
- Frontend Docker: `http://127.0.0.1:5173`
- Backend Docker: `http://127.0.0.1:8000`

## Vercel Deployment

This repository includes `vercel.json`, so Vercel can deploy the frontend from the repository root.

Vercel settings:
- Install command: `cd frontend && npm ci`
- Build command: `cd frontend && npm run build`
- Output directory: `frontend/dist`

Required Vercel environment variables:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=https://your-backend-production-url
```

Note:
- Vercel deploys the frontend.
- Backend FastAPI should be deployed separately to a backend host or run through Docker.
- After backend is deployed, update `VITE_API_BASE_URL` in Vercel.

## Supabase Setup

Run SQL files in this order from Supabase SQL editor:

1. `supabase/create_profiles_table.sql`
2. `supabase/create_prediction_results_table.sql`
3. `supabase/create_water_quality_clean_table.sql`
4. `supabase/update_realtime_eda_and_prediction_policies.sql`

If `water_quality_clean` is empty, upload cleaned dataset:

```bash
venv\Scripts\python.exe backend\model\upload_clean_dataset_to_supabase.py
```

## API Endpoints

Backend base URL:

```text
http://127.0.0.1:8000
```

Endpoints:
- `GET /health` checks backend and model availability.
- `GET /model-info` returns model metadata.
- `POST /predict` predicts one water quality record.
- `POST /predict/batch` predicts multiple records.

Example prediction payload:

```json
{
  "data": {
    "temperature": 28,
    "turbidity_cm": 45,
    "dissolved_oxygen_mg_l": 6.8,
    "biochemical_oxygen_demand_mg_l": 3.2,
    "carbon_dioxide_co2": 8.4,
    "ph": 7.4,
    "total_alkalinity_mg_l_1": 120,
    "total_hardness_mg_l_1": 180,
    "calcium_mg_l_1": 70,
    "ammonia_mg_l_1": 0.05,
    "nitrite_mg_l_1": 0.02,
    "phosphorus_mg_l_1": 0.3,
    "hydrogen_sulfide_mg_l_1": 0.01,
    "plankton_count_no_l_1": 2500
  },
  "save_to_supabase": false
}
```

## Production Smoke Test

Before final submission or demo:

- Login/register user.
- Save profile in Settings.
- Update display name or password in Security and Privacy.
- Run Prediction.
- Check Reports and refresh logs.
- Open Analytics and verify Dissolved Oxygen, Nitrite, and Correlation visuals.
- Open EDA and verify Distribution and Outlier Analysis.
- Check backend `/health`.
- Check Vercel env vars and Supabase RLS policies.

## Notes

More detailed deployment notes are available in:

```text
docs/DEPLOYMENT_CHECKLIST.md
```

## Authors

PBL Web Service, MLOps, and Data Mining  
Politeknik Elektronika Negeri Surabaya (PENS)
