# SATRIA Water Quality EWS

[![React](https://img.shields.io/badge/React-18%2B-20232A?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-007ACC?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.95%2B-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![MLflow](https://img.shields.io/badge/MLflow-Tracking-0194E2?style=flat-square&logo=mlflow)](https://mlflow.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Docker](https://img.shields.io/badge/Docker-Orchestration-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![Google Cloud](https://img.shields.io/badge/Google%20Cloud%20Run-Backend-4285F4?style=flat-square&logo=google-cloud)](https://cloud.google.com/run)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?style=flat-square&logo=vercel)](https://vercel.com/)

SATRIA adalah aplikasi *Early Warning System* untuk klasifikasi kelayakan kualitas air akuakultur. Sistem ini dibangun dengan arsitektur **Microservices** yang menggabungkan model Machine Learning (dengan MLOps/MLflow), ekosistem backend terdistribusi (API Gateway, ML Service, Data Service) berbasis FastAPI, Supabase (Database & Auth terpusat), serta *dashboard* interaktif frontend React (Vite) untuk memantau metrik kualitas air, menjalankan prediksi EWS secara otomatis maupun manual, visualisasi analitik, *Exploratory Data Analysis* (EDA), dan merekam log prediksi waktu nyata.

## 🚀 Arsitektur Sistem (Microservices)

Project ini telah berevolusi dari arsitektur monolitik menjadi microservices untuk stabilitas, skalabilitas, dan kemudahan pengembangan (MLOps):

1. **API Gateway (`api-service` | Port: 8000)**  
   Titik masuk tunggal (single entry point) untuk aplikasi frontend. Bertugas memvalidasi JWT (menggunakan skema *asymmetric* modern Supabase) dan meneruskan rute (*routing*) ke ML Service atau Data Service.
2. **Machine Learning Service (`ml-service` | Port: 8001)**  
   Menangani inferensi model prediksi. Disertai dengan siklus MLOps (menggunakan MLflow Tracking) untuk pelatihan model, hyperparameter tuning, dan pengemasan model (`.pkl`) secara *baked offline* demi latensi inferensi 0ms.
3. **Data Service (`data-service` | Port: 8002)**  
   *Gatekeeper* yang berinteraksi langsung dengan database Supabase PostgreSQL. Berfungsi melayani operasi CRUD profil, mencatat riwayat prediksi, dan agregasi data *Exploratory Data Analysis* (EDA) dengan akses *service role* secara aman.
4. **Frontend Dashboard (`frontend` | Port: 5173)**  
   Antarmuka klien kaya fitur yang dibangun dengan React (Vite) + TypeScript. Menyajikan dashboard metrik real-time, grafik kualitas air, histori pengguna, dan keamanan otentikasi.

## Tech Stack

Frontend:
- Vite
- React & TypeScript
- Supabase JS Client
- Native HTML/CSS rendering
- SVG/CSS chart components

Backend:
- FastAPI & Uvicorn
- HTTPX (Internal Microservices Routing)
- Pydantic
- Pandas
- LightGBM & Scikit-learn
- MLflow (Tracking & Registry)

Database and Auth:
- Supabase Auth (ECC P-256)
- Supabase PostgreSQL
- Row Level Security policies
- Tables: `profiles`, `prediction_results`, `water_quality_clean`

Deployment:
- Vercel for frontend
- Docker / Docker Compose for full local stack
- `run.bat` local runner for quick initialization

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

## 🌍 Live Deployment (Akses Publik)

Aplikasi SATRIA telah di-*deploy* ke lingkungan produksi dan dapat diakses secara publik:

| Layanan | URL |
|---|---|
| **Frontend Dashboard (Vercel)** | https://satria-water-quality-ews-sage.vercel.app/ |
| **API Gateway (Cloud Run)** | https://api-service-aqrtlknopq-et.a.run.app |
| **Data Service (Cloud Run)** | https://data-service-aqrtlknopq-et.a.run.app |
| **ML Service (Cloud Run)** | https://ml-service-aqrtlknopq-et.a.run.app |

### 🐳 Docker Hub Registry (Public Images)

Seluruh microservices telah dikemas menjadi Docker image resmi dan dapat diakses secara publik di Docker Hub:

| Layanan | Image & Repository | Tautan Langsung |
|---|---|---|
| **API Gateway** | `arfiadi/satria-api-service` | [Docker Hub](https://hub.docker.com/r/arfiadi/satria-api-service) |
| **ML Service** | `arfiadi/satria-ml-service` | [Docker Hub](https://hub.docker.com/r/arfiadi/satria-ml-service) |
| **Data Service** | `arfiadi/satria-data-service` | [Docker Hub](https://hub.docker.com/r/arfiadi/satria-data-service) |
| **Frontend** | `arfiadi/satria-frontend` | [Docker Hub](https://hub.docker.com/r/arfiadi/satria-frontend) |

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
|-- frontend/                  # Source code UI/UX (React + Vite)
|   |-- src/                   # Kode utama aplikasi
|   `-- vercel.json            # Konfigurasi deploy frontend ke Vercel
|
|-- services/                  # Microservices backend
|   |-- api-service/           # FastAPI Gateway (Port: 8000)
|   |-- ml-service/            # ML inference API & skrip MLOps training (Port: 8001)
|   `-- data-service/          # Operasi basis data Supabase (Port: 8002)
|
|-- models/                    # Diregistrasi oleh MLflow & diunduh otomatis
|
|-- notebooks/                 # Eksperimen data & pemodelan
|   |-- Data_Understanding_dan_EDA.ipynb
|   |-- modelling.ipynb        # Eksperimen model machine learning
|   |-- manual_mlops_pipeline.ipynb
|   `-- pycaret_aqua_water_suitability_.ipynb
|
|-- supabase/                  # Skrip SQL untuk setup database
|   |-- create_profiles_table.sql
|   |-- create_prediction_results_table.sql
|   |-- create_water_quality_clean_table.sql
|   |-- update_realtime_eda_and_prediction_policies.sql
|   `-- ready_safe_migration.sql
|
|-- docs/                      # Dokumentasi teknis proyek
|   |-- BACKEND_SYSTEM_DESIGN.md
|   |-- FRONTEND_ARCHITECTURE_BLUEPRINT.md
|   |-- DEPLOYMENT_CHECKLIST.md
|   |-- deployment_steps.md
|   `-- model_selection_justification.md
|
|-- docker-compose.yml         # Orkestrasi container Docker
|-- run.bat                    # Skrip launcher interaktif (Windows)
|-- run.sh                     # Skrip launcher interaktif (Linux/macOS)
|-- .env.example
|-- .dockerignore
`-- README.md
```

## Environment Variables

Root `.env` untuk backend dan `run.bat` launcher:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_TABLE=water_quality_clean
SUPABASE_PREDICTION_TABLE=prediction_results
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://127.0.0.1:8000
```

> **Catatan Penting:** Skrip `run.bat` kami akan secara otomatis menyalin berkas `.env` ini ke dalam setiap folder *microservices* dan juga ke folder `frontend/.env` saat inisialisasi awal.

## Local Development (Microservices)

Cara paling mudah untuk menjalankan secara lokal adalah menggunakan `run.bat`:

```bash
.\run.bat
```

Anda dapat memilih:
1. **Docker**: `docker-compose up --build`
2. **Native**: Membuat venv, menginstall library Python & Node, lalu menjalankan kelima layanan (MLflow, ML-Service, Data-Service, API Gateway, dan Frontend) secara konkuren menggunakan `npx concurrently`.

Open:
- Frontend: `http://127.0.0.1:5173`
- API Gateway health: `http://127.0.0.1:8000/health`
- MLflow Dashboard: `http://127.0.0.1:5000`

Untuk manual run setiap service, baca `README.md` pada masing-masing folder komponen.

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
- Backend FastAPI microservices should be deployed separately to a backend host or run through Docker.
- After backend is deployed, update `VITE_API_BASE_URL` in Vercel.

## Supabase Setup

Run SQL files in this order from Supabase SQL editor:

1. `supabase/create_profiles_table.sql`
2. `supabase/create_prediction_results_table.sql`
3. `supabase/create_water_quality_clean_table.sql`
4. `supabase/update_realtime_eda_and_prediction_policies.sql`

If `water_quality_clean` is empty, you can populate it using the Data Service logic or Supabase UI.

## API Endpoints

API Gateway (Single Entry Point) base URL:

```text
http://127.0.0.1:8000
```

Endpoints (Gateway):
- `GET /health` checks backend availability and forwards to other microservices.
- `GET /model-info` returns model metadata (routed to ml-service).
- `POST /predict` predicts water quality (routed to ml-service & data-service).
- `GET /profiles/...`, `GET /eda/...` (routed to data-service).

Example prediction payload:

```json
{
  "data": {
    "temperature": 28,
    "turbidity_cm": 45,
    "dissolved_oxygen_mg_l": 6.8,
    "biochemical_oxygen_demand_mg_l": 3.2,
    "carbon_dioxide_mg_l": 8.4,
    "ph": 7.4,
    "total_alkalinity_mg_l_1": 120,
    "total_hardness_mg_l_1": 180,
    "calcium_mg_l_1": 70,
    "ammonia_mg_l_1": 0.05,
    "nitrite_mg_l_1": 0.02,
    "phosphorus_mg_l_1": 0.3,
    "hydrogen_sulphide_mg_l_1": 0.01,
    "estimated_magnesium_mg_l_1": 40,
    "plankton_abundance_no_l_1": 2500
  },
  "save_to_supabase": false
}
```

## Production Smoke Test

Before final submission or demo:

- Register or login a user.
- Save profile in Settings (role, organization, and bio).
- Update display name or password in Security & Privacy.
- Run Prediction (submit a prediction request).
- Check Reports and refresh logs (confirm prediction is successfully saved to Supabase).
- Open Analytics and verify Dissolved Oxygen, Nitrite, and Correlation visuals.
- Open EDA and verify Parameter Distribution, Class Distribution, and Outlier Analysis.
- Check API Gateway `/health` endpoint status.
- Check Vercel environment variables and Supabase RLS policies.

## Notes

Dokumentasi detail mengenai desain sistem, deployment, dan pemodelan dapat diakses di:

- [BACKEND_SYSTEM_DESIGN.md](file:///d:/ARFI/Kuliah/Project/satria-water-quality-ews/docs/BACKEND_SYSTEM_DESIGN.md)
- [FRONTEND_ARCHITECTURE_BLUEPRINT.md](file:///d:/ARFI/Kuliah/Project/satria-water-quality-ews/docs/FRONTEND_ARCHITECTURE_BLUEPRINT.md)
- [DEPLOYMENT_CHECKLIST.md](file:///d:/ARFI/Kuliah/Project/satria-water-quality-ews/docs/DEPLOYMENT_CHECKLIST.md)
- [deployment_steps.md](file:///d:/ARFI/Kuliah/Project/satria-water-quality-ews/docs/deployment_steps.md)
- [model_selection_justification.md](file:///d:/ARFI/Kuliah/Project/satria-water-quality-ews/docs/model_selection_justification.md)

Lihat juga `README.md` terpisah yang berada di setiap direktori (misalnya [frontend/README.md](file:///d:/ARFI/Kuliah/Project/satria-water-quality-ews/frontend/README.md) atau [services/ml-service/README.md](file:///d:/ARFI/Kuliah/Project/satria-water-quality-ews/services/ml-service/README.md)).

## Authors

PBL Web Service, MLOps, and Data Mining  
Politeknik Elektronika Negeri Surabaya (PENS)
