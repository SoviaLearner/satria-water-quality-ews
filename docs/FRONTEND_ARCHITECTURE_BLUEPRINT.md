# Frontend Architecture Blueprint

Dokumen ini menjadi catatan target arsitektur frontend SATRIA jika aplikasi dikembangkan ke React TypeScript + Tailwind CSS. Implementasi saat ini memakai Vite TypeScript native, tetapi prinsip layer, kontrak data, dan flow guard di bawah bisa dijadikan standar revisi lanjutan.

## Architecture Goal

Frontend SATRIA diarahkan ke three-tier architecture:

```text
Presentation Layer
  -> Business Logic Layer
  -> Data Layer
  -> API Gateway / Microservices
```

Tujuan pemisahan ini:

- UI tidak bercampur dengan aturan validasi, auth guard, dan transformasi data.
- Business logic bisa dites tanpa bergantung pada DOM.
- Data service siap diarahkan ke backend microservices seperti Auth Service, Prediction Service, Analytics Service, dan Reporting Service.

## Layer 1: Presentation Layer

Presentation layer hanya bertugas merender UI dan menangkap input user.

Contoh folder:

```text
frontend/src/presentation/
|-- components/
|   |-- AppShell.tsx
|   |-- FormField.tsx
|   |-- ParameterInput.tsx
|   |-- StatusAlert.tsx
|   `-- charts/
|-- pages/
|   |-- HomePage.tsx
|   |-- LoginPage.tsx
|   |-- EditProfilePage.tsx
|   |-- PredictionPage.tsx
|   |-- AnalyticsPage.tsx
|   |-- ReportsPage.tsx
|   `-- EdaPage.tsx
`-- layouts/
    `-- ProtectedLayout.tsx
```

Rules:

- Komponen `.tsx` harus menerima props dengan `type` atau `interface`.
- Komponen tidak memanggil Supabase/API secara langsung.
- Komponen tidak menyimpan aturan redirect dan auth guard.
- Tailwind class mengikuti spacing kelipatan 4 seperti `p-6`, `gap-6`, `space-y-4`.
- Area input tidak memakai `font-bold`; gunakan `font-normal` atau `font-medium`.

## Layer 2: Business Logic Layer

Business logic layer mengatur state, validasi, routing guard, dan flow setelah login.

Contoh folder:

```text
frontend/src/application/
|-- auth/
|   |-- authStore.ts
|   |-- useRequireProfile.ts
|   `-- routeGuards.tsx
|-- prediction/
|   |-- predictionFormRules.ts
|   |-- usePrediction.ts
|   `-- recommendationRules.ts
|-- analytics/
|   |-- useUserAnalytics.ts
|   `-- chartTransforms.ts
`-- profile/
    |-- profileRules.ts
    `-- useProfileCompletion.ts
```

Responsibilities:

- Validasi form real-time.
- Disable submit jika input tidak valid.
- Force redirect ke `EditProfilePage` jika profile belum lengkap.
- Menentukan alert rekomendasi untuk hasil `Optimal`, `Moderate`, atau `Reduced`.
- Memisahkan analytics user-specific dan EDA global dataset.

## Layer 3: Data Layer

Data layer menjadi satu-satunya tempat untuk memanggil backend API dan Supabase.

Contoh folder:

```text
frontend/src/data/
|-- apiClient.ts
|-- authService.ts
|-- profileService.ts
|-- predictionService.ts
|-- analyticsService.ts
|-- reportsService.ts
`-- types/
    |-- auth.ts
    |-- profile.ts
    |-- prediction.ts
    `-- analytics.ts
```

Rules:

- Service mengembalikan response yang sudah typed.
- Endpoint diarahkan ke API Gateway atau service URL.
- Error backend dinormalisasi agar UI cukup membaca satu format error.

## Microservices Alignment

Target service boundary:

```text
Auth Service
  - register
  - login
  - update password
  - session validation

Profile Service
  - get profile
  - update profile
  - check profile completion

Prediction Service
  - single prediction
  - batch prediction JSON
  - model metadata

Analytics Service
  - user-specific prediction logs
  - user chart data

EDA Service
  - global clean dataset stats
  - distribution data
  - outlier data

Reporting Service
  - historical logs
  - CSV export
```

## Auth and Profile Completion Flow

```text
User opens Home
  -> Home is public
  -> User clicks Login
  -> Login success
  -> Frontend loads profile
  -> If role or bio is null/empty:
       redirect to /profile/edit
       block prediction, analytics, reports, EDA
     Else:
       redirect to dashboard/prediction
```

Protected routes:

- `/prediction`
- `/analytics`
- `/reports`
- `/eda`
- `/settings`

Public routes:

- `/`
- `/login`
- `/register`

Profile completion route:

- `/profile/edit`

## Analytics vs EDA Rule

Analytics:

- Menampilkan data milik user aktif.
- Sumber data: prediction logs dan input history milik user.
- Chart berubah sesuai aktivitas user.

EDA:

- Menampilkan dataset global yang sudah clean.
- Sumber data: `water_quality_clean`.
- Chart bersifat agregat untuk edukasi pola data dan distribusi.

## Visual System Notes

Typography:

- Page title: `font-semibold text-slate-900`.
- Card heading: `font-medium text-slate-900`.
- Label input: `font-normal text-slate-700`.
- Helper text: `font-normal text-xs text-slate-500`.
- Error text: `font-normal text-xs text-red-600`.

Colors:

- Primary: soft teal / blue.
- Optimal: soft green.
- Moderate: soft amber.
- Reduced / danger: soft red.

Layout:

```text
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```
