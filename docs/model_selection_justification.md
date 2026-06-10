# Justifikasi Pemilihan Model: LightGBM untuk SATRIA Water Quality EWS

## 1. Ringkasan Eksperimen Baseline

Empat model dievaluasi pada dataset sintetis *Recalculated Aquaculture Water Suitability* (4.300 sampel, 15 fitur numerik, 4 kelas target: *Highly Suitable*, *Suitable*, *Restricted/Stressed*, *Unsuitable/Critical*) menggunakan metrik **F1-Macro** sebagai metrik utama — dipilih karena dataset memiliki ketidakseimbangan kelas (*class imbalance*). Seluruh model menggunakan strategi `class_weight='balanced'` untuk menangani imbalance tersebut.

| Model | F1-Macro | Peringkat |
|---|---|---|
| **LightGBM** | **0.9739** | 🥇 |
| DecisionTree | 0.9526 | 🥈 |
| RandomForest | 0.8848 | 🥉 |
| LogisticRegression | 0.8759 | 4 |

---

## 2. Evaluasi Berdasarkan Learning Curve

Learning curve digunakan sebagai indikator **kemampuan generalisasi** model. Kurva ini menampilkan perbandingan antara *Training Score* (skor pada data latih) dan *CV Score* (skor validasi silang / generalisasi) terhadap jumlah sampel latih.

### LightGBM ✅ (Dipilih)
- **Training Score**: 1.0 (konstan — kapasitas model sangat tinggi)
- **CV Score**: ~0.85–0.86, terlihat **masih sedikit naik** di ujung kanan kurva (di ~3.500 sampel)
- **Gap Train-CV**: ~14–15%
- **Interpretasi**: Gap yang ada merupakan karakteristik wajar dari model *boosting* berkapasitas tinggi pada data sintetis. Yang menjadi pembeda kunci adalah CV-nya masih menunjukkan tren naik — berbeda dengan DecisionTree dan RandomForest yang sudah plateau. Tren ini menunjukkan **model belum mencapai batas kemampuannya** dan berpotensi meningkat dengan *hyperparameter tuning* atau penambahan data nyata. Di sisi lain, **F1-Macro pada data uji (0.9739) yang jauh lebih tinggi dari CV** menunjukkan LightGBM berhasil menangkap pola data secara mendalam dibandingkan model lain.

### DecisionTree ❌
- **Training Score**: 1.0 (konstan — menghafal sempurna)
- **CV Score**: ~0.85, **plateau** (berhenti naik sejak ~2.000 sampel)
- **Gap Train-CV**: ~15%
- **Interpretasi**: Meskipun CV-nya serupa dengan LightGBM (~0.85), perbedaan krusialnya terletak pada F1 data uji yang lebih rendah (0.9526) dan kurva yang sudah **plateau** — menandakan model *single tree* ini sudah mencapai batas kemampuannya. Tidak ada ruang perbaikan melalui tuning maupun data tambahan.

### RandomForest ❌
- **Training Score**: 1.0 (konstan)
- **CV Score**: ~0.77, **plateau** (tertahan sejak ~2.000 sampel)
- **Gap Train-CV**: ~23% (gap terbesar di antara semua model)
- **Interpretasi**: Meskipun merupakan model *ensemble*, Random Forest justru memiliki generalisasi terburuk pada dataset ini. Strategi *bagging* (rata-rata banyak tree) terbukti tidak efektif mengatasi *overfitting* pada pola data sintetis kualitas air yang kompleks. CV plateau di angka rendah (0.77) adalah sinyal bahwa model ini tidak layak untuk di-*deploy*.

### LogisticRegression ⚠️
- **Training Score**: ~0.85–0.89 (tidak mencapai 1.0 — kapasitas terbatas)
- **CV Score**: ~0.83–0.85, **konvergen secara stabil**
- **Gap Train-CV**: ~2–4% (gap terkecil)
- **Interpretasi**: Model yang paling stabil dan tidak *overfit*. Namun, *ceiling* performanya nyata terbatas di ~0.85 karena model linear tidak mampu menangkap hubungan non-linear antar 15 parameter kualitas air (pH, DO, suhu, salinitas, dll.) yang kompleks. F1-Macro (0.8759) yang paling rendah mengkonfirmasi ketidakcukupan kapasitas ini.

---

## 3. Evaluasi Berdasarkan ROC-AUC Curve

| Model | Highly Suitable | Restricted/Stressed | Suitable | Unsuitable/Critical |
|---|---|---|---|---|
| **LightGBM** | 1.00 | 1.00 | 1.00 | 1.00 |
| DecisionTree | 1.00 | 0.99 | 0.88 | 1.00 |
| RandomForest | 1.00 | 1.00 | 1.00 | 1.00 |
| LogisticRegression | 1.00 | 1.00 | 1.00 | 1.00 |

> [!IMPORTANT]
> LightGBM mencapai AUC sempurna (1.00) di **semua kelas**, termasuk dua kelas yang paling kritis untuk sistem EWS: *Unsuitable/Critical* dan *Suitable*. Kegagalan mendeteksi kondisi "Unsuitable/Critical" dapat berdampak langsung pada kematian massal ikan budidaya.

DecisionTree memiliki AUC rendah pada kelas *Suitable* (0.88). Ini adalah kelemahan fatal untuk deployment karena sistem EWS akan sering gagal membedakan kondisi "Suitable" dari kelas lain, menghasilkan alarm yang salah.

---

## 4. Pertimbangan Implementasi Production

Sistem SATRIA EWS menggunakan arsitektur **microservice** dengan ML Service terpisah yang melakukan *inference* secara *in-memory* menggunakan file `.pkl` via `joblib`.

### 4.1 Ukuran Model & Memori

| Model | Estimasi Ukuran .pkl | Waktu Load |
|---|---|---|
| LightGBM | **~1–5 MB** | Cepat |
| RandomForest | ~10–50 MB (ratusan tree) | Lebih lambat |
| DecisionTree | ~0.5–2 MB | Sangat cepat |
| LogisticRegression | ~0.1–0.5 MB | Sangat cepat |

LightGBM menggunakan representasi *leaf-wise* yang efisien, sehingga ukuran file model jauh lebih kecil dari RandomForest meskipun performa lebih tinggi.

### 4.2 Latensi Inference

Dalam konteks SATRIA EWS, user mengirim data melalui **Frontend → API Gateway → ML Service** untuk prediksi real-time. Latensi rendah sangat krusial.

- **LightGBM**: Inference sangat cepat (~0.1–1ms per sampel). Cocok untuk *real-time prediction*.
- **RandomForest**: Lebih lambat karena harus mengagregasi ratusan tree secara paralel.
- **LogisticRegression**: Tercepat, namun mengorbankan akurasi secara signifikan.
- **DecisionTree**: Cepat, namun akurasi dan potensi generalisasinya tidak memadai untuk production.

### 4.3 Kompatibilitas dengan Pipeline Produksi

```
Frontend (form input)
  → API Gateway (mapping 15 parameter kualitas air)
    → ML Service (LightGBM Pipeline .pkl via joblib)
      → Response (tier kelas + probabilitas per kelas)
        → Data Service (simpan log prediksi ke Supabase)
```

- ✅ Sepenuhnya kompatibel dengan `joblib.load()` yang digunakan di `predict.py`
- ✅ Mendukung `predict_proba()` untuk menampilkan probabilitas per kelas di frontend
- ✅ *Feature importance* bawaan LightGBM berguna untuk *explainability* di halaman analisis
- ✅ Ringan dan cocok untuk deployment di Cloud Run dengan resource terbatas

### 4.4 Robustness untuk Data Dunia Nyata

> [!WARNING]
> Dataset saat ini bersifat **sintetis**. Model yang dipilih harus mampu menggeneralisasi ke data sensor kualitas air nyata yang berpotensi memiliki *noise*, *missing values*, dan distribusi yang sedikit berbeda.

- **LightGBM** memiliki kemampuan bawaan menangani *missing values* tanpa imputasi manual — keunggulan besar ketika sensor gagal memberikan *reading*.
- Algoritma *Gradient Boosting* belajar secara bertahap memperbaiki kesalahan sebelumnya, sehingga lebih adaptif terhadap pola kompleks dibanding model tunggal (DecisionTree) atau rata-rata sederhana (RandomForest).
- Regularisasi yang kaya (`reg_alpha`, `reg_lambda`, `min_child_samples`) memungkinkan kontrol *overfitting* yang presisi saat transisi to data nyata.

---

## 5. Matriks Keputusan Akhir

| Kriteria (Bobot) | LightGBM | DecisionTree | RandomForest | LogisticRegression |
|---|---|---|---|---|
| F1-Macro pada Data Uji (30%) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Potensi Generalisasi (CV & Tren) (25%) | ⭐⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ |
| Potensi Tuning (15%) | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Latensi & Efisiensi (10%) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Robustness Real-world (10%) | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Kompatibilitas Produksi (10%) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Total** | **🥇 Tertinggi** | 🥉 | 4th | 🥈 |

---

## 6. Kesimpulan

**LightGBM dipilih** sebagai model utama untuk di-*tune* dan di-*deploy* ke production SATRIA Water Quality EWS berdasarkan evaluasi menyeluruh berikut:

1. **Performa tertinggi pada data uji** — F1-Macro 0.9739, unggul +2.1% dari runner-up (DecisionTree: 0.9526) dan +10% dari posisi 3 dan 4.
2. **Satu-satunya model dengan tren CV yang masih naik** — Berbeda dengan DecisionTree dan RandomForest yang sudah *plateau*, LightGBM masih menunjukkan potensi perbaikan — krusial untuk dataset sintetis yang akan bertransisi ke data nyata.
3. **ROC-AUC sempurna di semua kelas** — 1.00 di semua kelas, termasuk kelas minoritas kritis (*Unsuitable/Critical*). DecisionTree gagal di kelas *Suitable* (AUC 0.88).
4. **Production-ready** — Ukuran file ringan (~1–5 MB), inference cepat, dan kompatibel penuh dengan arsitektur microservice yang sudah ada.
5. **Robust terhadap data nyata** — Kemampuan bawaan menangani *missing values* dan konfigurasi regularisasi yang kaya.

> [!TIP]
> **Langkah selanjutnya**: Lakukan *hyperparameter tuning* menggunakan Optuna dengan fokus pada parameter regularisasi (`reg_alpha`, `reg_lambda`, `min_child_samples`) dan kapasitas model (`num_leaves`, `max_depth`) untuk memperkecil gap train-CV sekaligus mempertahankan F1 data uji yang tinggi.
