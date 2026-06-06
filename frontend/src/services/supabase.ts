import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY harus diisi di frontend/.env");
}

/**
 * Klien global Supabase untuk menangani otentikasi (login/register) dan status sesi (Auth State).
 * Seluruh logika akses kueri database (PostgreSQL) dipusatkan secara terpisah ke API Gateway backend.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
