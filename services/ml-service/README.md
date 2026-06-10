# Machine Learning Service (MLOps)

## Peran
Service independen yang bertanggung jawab penuh terhadap **siklus Machine Learning**, mulai dari eksperimentasi (*training*), manajemen model (MLOps), hingga fase inferensi (prediksi REST API). Servis ini berjalan pada port **8001**.

## Mekanisme & Desain Sistem

### 1. Model Inference (FastAPI)
- **Endpoint Internal:** Menyediakan endpoint utama `/predict`, `/model-info`, dan `/health`.
- **In-Memory Offline Prediction:** Saat *startup*, *service* memuat artefak model (`water_quality_pipeline.pkl`) dan metadatanya (`model_metadata.json`) ke dalam memori RAM melalui kelas `WaterQualityPredictor`. Hal ini menjamin proses inferensi dapat dilakukan secara *offline* dengan latensi nyaris 0ms (tanpa ketergantungan pada jaringan eksternal maupun *database* tambahan).
- **Dynamic Feature Mapping:** Kelas *predictor* secara otomatis memetakan dan mengurutkan *payload* dari masukan pengguna (*JSON*) agar selalu cocok dengan ekspektasi urutan fitur model (berdasarkan metadata). Hal ini membuat inferensi kebal dari galat akibat urutan kolom yang tidak disengaja tertukar.
- **Scikit-Learn Pipeline:** Artefak model yang disajikan bukanlah model mentah semata, melainkan sebuah `Pipeline` terintegrasi yang mencakup tahapan pra-pemrosesan: `SimpleImputer` (strategi median) dan `RobustScaler` (tahan ekstrem/outlier), lalu diakhiri dengan eksekusi dari algoritma klasifikasi terbaik (misal: `LGBMClassifier` atau `RandomForestClassifier`). Meskipun algoritma seperti LightGBM (yang digunakan di *project* ini) secara bawaan sudah mampu menangani nilai kosong (*missing values*) dan tidak terpengaruh oleh skala data, tahapan imputasi dan *scaling* ini tetap disertakan secara eksplisit. Tujuannya adalah sebagai antisipasi kedepannya jika kita menggunakan model algoritma lain di masa depan (intinya ini adalah kode versi *production* yang siap pakai).

### 2. MLOps Pipeline & Training (`scripts/train_water.py`)
- **Multi-Algorithm Evaluation:** Skrip `train_water.py` mengevaluasi berbagai variasi algoritma klasik dan ensemble (*LightGBM, Random Forest, Gradient Boosting, Decision Tree, Logistic Regression, Baseline Dummy*) untuk mencari model dengan landasan performa terbaik.
- **Two-Stage Auto-Tuning:** Sistem memilih algoritma dasar dengan skor prioritas parameter **F1-Macro** dan **Recall** tertinggi. Algoritma terpilih kemudian dioptimasi ulang menggunakan Hyperparameter Tuning yang ada (*Optuna pre-calculated* untuk LGBM dari eksperimen di notebook, atau `RandomizedSearchCV` untuk algoritma lain).
- **MLflow Tracking & Registry:** Seluruh aktivitas, konfigurasi hiperparameter eksperimen, dan evaluasi akan direkam secara *Parent-Nested Run* di MLflow server lokal (`localhost:5000`). Sistem juga akan menyimpan parameter visualisasi pendukung sebagai artefak (*Confusion Matrix*, *Learning Curve*, *Classification Report*). Proses diakhiri dengan meregistrasi obyek *pipeline* akhir ke dalam **MLflow Model Registry** sebagai `EWS_Water_Quality_Classifier`.

## Cara Menjalankan API Manual
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

## Menjalankan Ulang Training (Retraining)
Pastikan server MLflow lokal sudah berjalan, lalu jalankan:
```bash
python scripts/train_water.py
```

Setelah *training* selesai dan model terdaftar di MLflow, Anda perlu menugaskan **alias** `@champion` pada versi model yang baru di dalam MLflow UI (`http://localhost:5000`).

Setelah memberikan alias, unduh model tersebut untuk digunakan oleh *service* dengan menjalankan:
```bash
python scripts/download_model.py
```
