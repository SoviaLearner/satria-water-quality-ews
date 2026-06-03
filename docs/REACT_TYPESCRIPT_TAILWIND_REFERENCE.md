# React TypeScript and Tailwind Reference

Dokumen ini berisi contoh kode target jika frontend SATRIA dipindahkan ke React `.tsx` dengan Tailwind CSS. Kode ini bersifat blueprint implementasi agar revisi UI/UX, validasi, dan routing guard konsisten.

## Route Guard

```tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

export type UserProfile = {
  id: string;
  email: string;
  fullName: string | null;
  role: string | null;
  bio: string | null;
};

export type AuthState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  profile: UserProfile | null;
};

function isProfileComplete(profile: UserProfile | null): boolean {
  return Boolean(profile?.role?.trim() && profile?.bio?.trim());
}

export function ProtectedRoute({ auth }: { auth: AuthState }) {
  const location = useLocation();

  if (auth.isLoading) {
    return <div className="p-6 text-sm font-normal text-slate-500">Loading session...</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isProfileComplete(auth.profile) && location.pathname !== "/profile/edit") {
    return <Navigate to="/profile/edit" replace />;
  }

  return <Outlet />;
}
```

## Login Page

```tsx
import { FormEvent, useState } from "react";

type LoginPageProps = {
  onLogin: (payload: LoginRequest) => Promise<void>;
  isSubmitting: boolean;
  errorMessage?: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

export function LoginPage({ onLogin, isSubmitting, errorMessage }: LoginPageProps) {
  const [form, setForm] = useState<LoginRequest>({ email: "", password: "" });
  const isValid = form.email.includes("@") && form.password.length >= 6;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;
    await onLogin(form);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto grid min-h-screen max-w-7xl place-items-center px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">Login SATRIA</h1>
            <p className="text-sm font-normal text-slate-500">Masuk untuk mengakses prediksi dan data kualitas air.</p>
          </div>

          <TextInput
            id="email"
            label="Email"
            value={form.email}
            helper="Format pengetikan: gunakan email aktif dengan tanda @."
            isInvalid={form.email.length > 0 && !form.email.includes("@")}
            onChange={(value) => setForm((current) => ({ ...current, email: value }))}
          />

          <TextInput
            id="password"
            label="Password"
            type="password"
            value={form.password}
            helper="Format pengetikan: minimal 6 karakter."
            isInvalid={form.password.length > 0 && form.password.length < 6}
            onChange={(value) => setForm((current) => ({ ...current, password: value }))}
          />

          {errorMessage ? <p className="text-xs font-normal text-red-600">{errorMessage}</p> : null}

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full rounded-md bg-teal-600 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? "Memproses..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
```

## Strict Text Input

```tsx
type TextInputProps = {
  id: string;
  label: string;
  value: string;
  helper: string;
  type?: "text" | "email" | "password" | "number";
  isInvalid: boolean;
  onChange: (value: string) => void;
};

export function TextInput({
  id,
  label,
  value,
  helper,
  type = "text",
  isInvalid,
  onChange,
}: TextInputProps) {
  return (
    <label htmlFor={id} className="block space-y-2">
      <span className="block text-sm font-normal text-slate-700">{label}</span>
      <span className="block text-xs font-normal text-slate-500">{helper}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={[
          "w-full rounded-md border bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none transition",
          isInvalid ? "border-red-500 ring-1 ring-red-100" : "border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-100",
        ].join(" ")}
      />
      {isInvalid ? (
        <span className="block text-xs font-normal text-red-600">
          Inputan yang dilakukan harus sesuai dengan format petunjuk di atas!
        </span>
      ) : null}
    </label>
  );
}
```

## Prediction Recommendation Alert

```tsx
type SuitabilityTier = "Optimal Suitability" | "Moderate Suitability" | "Reduced Suitability";

type RecommendationAlertProps = {
  tier: SuitabilityTier;
};

export function RecommendationAlert({ tier }: RecommendationAlertProps) {
  const messageByTier: Record<SuitabilityTier, string> = {
    "Optimal Suitability": "Kondisi air berada pada kategori optimal. Pertahankan monitoring rutin dan hindari perubahan parameter secara mendadak.",
    "Moderate Suitability": "Kondisi air masih dapat diterima, tetapi perlu penyesuaian ringan. Periksa pH, DO, nitrite, dan ammonia sebelum pemberian pakan berikutnya.",
    "Reduced Suitability": "Kondisi air berisiko. Segera lakukan tindakan korektif seperti aerasi, penggantian air parsial, atau pengecekan senyawa toksik.",
  };

  const toneByTier: Record<SuitabilityTier, string> = {
    "Optimal Suitability": "border-green-200 bg-green-50 text-green-800",
    "Moderate Suitability": "border-amber-200 bg-amber-50 text-amber-800",
    "Reduced Suitability": "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <article className={`rounded-lg border p-4 ${toneByTier[tier]}`}>
      <h2 className="text-base font-medium">Rekomendasi Tindakan</h2>
      <p className="mt-2 text-sm font-normal leading-6">{messageByTier[tier]}</p>
    </article>
  );
}
```

## Bulk Prediction and CSV Export Buttons

```tsx
type PredictionActionsProps = {
  onUploadJson: (file: File) => void;
  onDownloadCsv: () => void;
};

export function PredictionActions({ onUploadJson, onDownloadCsv }: PredictionActionsProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
        Upload JSON
        <input
          type="file"
          accept="application/json"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUploadJson(file);
          }}
        />
      </label>

      <button
        type="button"
        onClick={onDownloadCsv}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Download CSV
      </button>
    </div>
  );
}
```
