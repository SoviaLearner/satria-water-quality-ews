# Langkah-Langkah Deployment SATRIA Water Quality EWS

Dokumen ini menjelaskan secara detail, terstruktur, dan sistematis langkah-langkah yang dilakukan untuk mendeploy aplikasi SATRIA Water Quality EWS. Deployment backend menggunakan Google Cloud Run dan frontend menggunakan Vercel.

---

## Tahap 1: Persiapan Google Cloud Platform (Backend)

Langkah ini mencakup pembuatan project dan pengaturan awal di Google Cloud Console untuk mempersiapkan infrastruktur deployment backend (Cloud Run).

1.  **Membuat Project di Google Cloud Console**
    *   Buka [Google Cloud Console](https://console.cloud.google.com/).
    *   Klik menu dropdown project di bagian atas dan pilih **New Project**.
    *   Beri nama project (misalnya: `satria-water-quality-ews`) dan klik **Create**.
    *   Setelah project berhasil dibuat, catat **Project ID** (contoh: `gen-lang-client-0098092986`).
2.  **Mengaktifkan Billing (Penagihan)**
    *   Masuk ke menu **Billing**.
    *   Tautkan project yang baru dibuat ke akun penagihan (Billing Account) yang aktif. Cloud Run memerlukan billing yang aktif untuk bisa digunakan.
3.  **Mengaktifkan Google Cloud APIs**
    *   Masuk ke menu **APIs & Services** > **Library**.
    *   Cari dan aktifkan tiga API utama berikut yang dibutuhkan untuk deployment serverless dari source code:
        *   **Cloud Run API**: Untuk menjalankan container secara serverless.
        *   **Cloud Build API**: Untuk membuild image container dari source code secara otomatis.
        *   **Artifact Registry API**: Untuk menyimpan image container hasil build.

---

## Tahap 2: Deployment Layanan Backend (Cloud Run)

Pada tahap ini, kita mendeploy dua layanan backend (`data-service` dan `ml-service`) menggunakan command-line interface `gcloud` (Google Cloud CLI) langsung dari source code lokal.

### 2.1 Konfigurasi Lokal
1.  Buka terminal/Command Prompt di direktori utama project.
2.  Pastikan sudah login ke Google Cloud menggunakan perintah:
    ```bash
    gcloud auth login
    ```
3.  Set project aktif ke Project ID yang telah dibuat pada Tahap 1:
    ```bash
    gcloud config set project [PROJECT_ID]
    ```

### 2.2 Deployment `data-service` (FastAPI)
Layanan ini mengelola koneksi database dan API utama.

1.  Jalankan perintah deployment Cloud Run yang mengarah ke folder `services/data-service`.
2.  Sertakan Environment Variables (variabel lingkungan) yang diperlukan seperti koneksi database (Supabase).
3.  Perintah yang digunakan:
    ```bash
    gcloud run deploy data-service \
      --source services/data-service \
      --region asia-southeast2 \
      --allow-unauthenticated \
      --port 8002 \
      --set-env-vars "^:^SUPABASE_URL=https://[ID_SUPABASE].supabase.co:SUPABASE_SERVICE_ROLE_KEY=[KUNCI_RAHASIA]"
    ```
    *Keterangan parameter:*
    *   `--source`: Lokasi kode sumber. Cloud Build akan otomatis membaca `Dockerfile` atau menggunakan *buildpacks* jika tidak ada.
    *   `--region`: Lokasi server fisik (Jakarta).
    *   `--allow-unauthenticated`: Mengizinkan akses publik (internet) ke API.
    *   `--set-env-vars`: Mengatur *environment variables* rahasia agar aman.

4.  Tunggu hingga proses *build* dan *deploy* selesai. Catat **URL Cloud Run** dari `data-service` yang dihasilkan.

### 2.3 Deployment `ml-service` (FastAPI)
Layanan ini menangani prediksi *Machine Learning*.

1.  Jalankan perintah deployment untuk `services/ml-service`.
2.  Sertakan URL dari `data-service` yang didapatkan pada langkah sebelumnya sebagai *Environment Variable* agar layanan ML dapat berkomunikasi dengan data service.
3.  Perintah yang digunakan:
    ```bash
    gcloud run deploy ml-service \
      --source services/ml-service \
      --region asia-southeast2 \
      --allow-unauthenticated \
      --port 8001 \
      --set-env-vars DATA_SERVICE_URL=[URL_DATA_SERVICE_CLOUD_RUN]
    ```
4.  Tunggu hingga selesai dan catat **URL Cloud Run** dari `ml-service`.

### 2.4 Deployment `api-service` (API Gateway)
Layanan ini bertindak sebagai pintu gerbang utama (Gateway) yang mengarahkan lalu lintas dari frontend ke `data-service` dan `ml-service`.

1.  Jalankan perintah deployment untuk `services/api-service`.
2.  Masukkan URL dari `ml-service` dan `data-service` yang telah dideploy sebelumnya, serta variabel kredensial Supabase.
3.  Perintah yang digunakan:
    ```bash
    gcloud run deploy api-service \
      --source services/api-service \
      --region asia-southeast2 \
      --allow-unauthenticated \
      --port 8000 \
      --set-env-vars "^:^ML_SERVICE_URL=[URL_ML_SERVICE_CLOUD_RUN]:DATA_SERVICE_URL=[URL_DATA_SERVICE_CLOUD_RUN]:SUPABASE_URL=https://[ID_SUPABASE].supabase.co:SUPABASE_ANON_KEY=[KUNCI_ANON]:SUPABASE_SERVICE_ROLE_KEY=[KUNCI_RAHASIA]"
    ```
4.  Tunggu hingga selesai dan catat **URL Cloud Run** dari `api-service` (Gateway). URL inilah yang akan digunakan oleh frontend Vercel.

---


## Tahap 3: Persiapan Repository Kode (GitHub)

Vercel membutuhkan akses ke repository kode (biasanya GitHub, GitLab, atau Bitbucket) untuk melakukan *Continuous Integration / Continuous Deployment* (CI/CD) secara otomatis.

1.  Pastikan tidak ada file rahasia yang masuk ke dalam Git dengan memeriksa file `.gitignore`. File konfigurasi seperti `.env` dan folder `node_modules` atau lingkungan virtual (`venv`) **wajib** dimasukkan ke dalam `.gitignore`.
2.  Lakukan inisialisasi Git (jika belum):
    ```bash
    git init
    ```
3.  Tambahkan seluruh kode dan *commit*:
    ```bash
    git add .
    git commit -m "Initial commit for deployment"
    ```
4.  Buat repository baru di GitHub.
5.  *Push* (unggah) kode lokal ke repository GitHub tersebut:
    ```bash
    git branch -M main
    git remote add origin https://github.com/[USERNAME]/[NAMA_REPO].git
    git push -u origin main
    ```

---

## Tahap 4: Deployment Frontend (Vercel)

Vercel sangat optimal untuk mendeploy aplikasi web modern berbasis framework JavaScript seperti React atau Vite.

1.  **Membuat Project di Vercel**
    *   Buka [Vercel](https://vercel.com/) dan login menggunakan akun GitHub Anda.
    *   Klik **Add New...** > **Project**.
2.  **Impor Repository GitHub**
    *   Cari repository GitHub yang telah di-*push* pada Tahap 3, lalu klik **Import**.
3.  **Konfigurasi Project Vercel**
    *   **Framework Preset**: Biasanya Vercel akan otomatis mendeteksi "Vite".
    *   **Root Directory**: Karena struktur aplikasi berbentuk *monorepo* (ada folder backend dan frontend), **ubah Root Directory ke `frontend`**. Klik *Edit* dan pilih folder `frontend`.
4.  **Mengatur Environment Variables (PENTING)**
    *   Di bagian "Environment Variables", tambahkan semua variabel lingkungan yang dibutuhkan oleh frontend agar dapat terhubung dengan Supabase dan backend di Cloud Run.
    *   Tambahkan *Key-Value* berikut:
        *   `VITE_SUPABASE_URL`: `[URL_Supabase_Anda]`
        *   `VITE_SUPABASE_ANON_KEY`: `[Anon_Key_Supabase_Anda]`
        *   `VITE_API_BASE_URL`: `[URL_API_Service_Cloud_Run_yang_didapat_di_Tahap_2.4]`
5.  **Proses Deploy**
    *   Klik tombol **Deploy**.
    *   Vercel akan secara otomatis mengunduh *dependency* (`npm install`), melakukan proses *build* (`npm run build`), dan menayangkan hasilnya ke sebuah domain publik (misal: `https://satria-water-quality-ews-sage.vercel.app`).
6.  **Penyelesaian**
    *   Aplikasi Frontend kini dapat diakses melalui internet dan akan berkomunikasi secara aman dengan Backend yang berada di Google Cloud Run. Setiap ada *push* baru ke *branch* `main` di GitHub, Vercel akan otomatis mendeploy versi terbaru aplikasi Anda.
