import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "./services/supabase";
import "./styles.css";

type AuthMode = "login" | "register";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Root app element tidak ditemukan.");
}

let mode: AuthMode = "login";
let loading = false;
let message = "";
let session: Session | null = null;

const fieldLabels = {
  fullName: "Full name",
  email: "Email",
  password: "Password",
};

function render() {
  app.innerHTML = session ? renderDashboard() : renderAuthPage();
  bindEvents();
}

function renderAuthPage() {
  const isRegister = mode === "register";

  return `
    <main class="auth-shell">
      <nav class="topbar">
        <div class="brand">
          <span class="brand-mark">S</span>
          <span>SATRIA</span>
        </div>
        <button class="nav-link" id="toggleModeTop" type="button">
          ${isRegister ? "User Login" : "Create Account"}
        </button>
      </nav>

      <section class="auth-stage">
        <div class="device-scene" aria-hidden="true">
          <div class="monitor">
            <span class="camera"></span>
            <div class="screen"></div>
            <span class="stand"></span>
            <span class="base"></span>
          </div>
          <div class="laptop">
            <span class="camera"></span>
            <div class="screen"></div>
            <span class="keyboard"></span>
          </div>
          <div class="tablet">
            <span class="camera"></span>
            <div class="screen"></div>
            <span class="home"></span>
          </div>
          <div class="phone">
            <span class="camera"></span>
            <div class="screen"></div>
            <span class="home"></span>
          </div>
        </div>

        <form class="auth-card" id="authForm">
          <h1>${isRegister ? "CREATE ACCOUNT" : "USER LOGIN"}</h1>
          <p class="subtitle">${isRegister ? "Daftar user baru untuk sistem SATRIA" : "Masuk ke akun SATRIA kamu"}</p>

          ${isRegister ? renderInput("fullName", fieldLabels.fullName, "text", "Nama lengkap") : ""}
          ${renderInput("email", fieldLabels.email, "email", "nama@email.com")}
          ${renderInput("password", fieldLabels.password, "password", "Minimal 6 karakter")}

          <label class="remember-row">
            <input id="remember" type="checkbox" checked />
            <span>Remember</span>
          </label>

          <button class="primary-button" type="submit" ${loading ? "disabled" : ""}>
            ${loading ? "Processing..." : isRegister ? "Register" : "Login"}
          </button>

          <div class="auth-links">
            <button id="toggleModeBottom" type="button">${isRegister ? "Login" : "Register"}</button>
            <button id="forgotPassword" type="button">Forget password</button>
          </div>

          ${message ? `<div class="message">${message}</div>` : ""}
        </form>
      </section>
    </main>
  `;
}

function renderInput(id: string, label: string, type: string, placeholder: string) {
  const icon = type === "password" ? "lock" : "user";

  return `
    <label class="input-group" for="${id}">
      <span class="input-icon">${icon === "lock" ? "L" : "U"}</span>
      <input id="${id}" name="${id}" type="${type}" placeholder="${placeholder}" aria-label="${label}" required />
    </label>
  `;
}

function renderDashboard() {
  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || "SATRIA User";

  return `
    <main class="auth-shell">
      <nav class="topbar">
        <div class="brand">
          <span class="brand-mark">S</span>
          <span>SATRIA</span>
        </div>
        <button class="nav-link" id="logoutButton" type="button">Logout</button>
      </nav>

      <section class="dashboard">
        <div class="welcome-panel">
          <p class="eyebrow">Active Session</p>
          <h1>${escapeHtml(fullName)}</h1>
          <p>${escapeHtml(user?.email || "")}</p>
          <dl>
            <div>
              <dt>User ID</dt>
              <dd>${escapeHtml(user?.id || "")}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>Authenticated</dd>
            </div>
          </dl>
          <a class="primary-link" href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer">
            Open Prediction API
          </a>
        </div>
      </section>
    </main>
  `;
}

function bindEvents() {
  document.querySelector("#toggleModeTop")?.addEventListener("click", toggleMode);
  document.querySelector("#toggleModeBottom")?.addEventListener("click", toggleMode);
  document.querySelector("#forgotPassword")?.addEventListener("click", handleForgotPassword);
  document.querySelector("#logoutButton")?.addEventListener("click", handleLogout);
  document.querySelector("#authForm")?.addEventListener("submit", handleSubmit);
}

function toggleMode() {
  mode = mode === "login" ? "register" : "login";
  message = "";
  render();
}

async function handleSubmit(event: Event) {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const formData = new FormData(form);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "").trim();

  if (!email || !password || (mode === "register" && !fullName)) {
    message = "Semua field wajib diisi.";
    render();
    return;
  }

  loading = true;
  message = "";
  render();

  const response =
    mode === "register"
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        })
      : await supabase.auth.signInWithPassword({ email, password });

  loading = false;

  if (response.error) {
    message = response.error.message;
    render();
    return;
  }

  if (mode === "register" && !response.data.session) {
    message = "Register berhasil. Cek email kamu untuk konfirmasi akun.";
    render();
    return;
  }

  message = mode === "register" ? "Register berhasil." : "Login berhasil.";
  session = response.data.session;
  render();
}

async function handleForgotPassword() {
  const emailInput = document.querySelector<HTMLInputElement>("#email");
  const email = emailInput?.value.trim();
  if (!email) {
    message = "Isi email dulu untuk reset password.";
    render();
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email);
  message = error ? error.message : "Link reset password dikirim ke email kamu.";
  render();
}

async function handleLogout() {
  await supabase.auth.signOut();
  session = null;
  mode = "login";
  message = "";
  render();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

supabase.auth.getSession().then(({ data }) => {
  session = data.session;
  render();
});

supabase.auth.onAuthStateChange((_event: AuthChangeEvent, nextSession: Session | null) => {
  session = nextSession;
  render();
});
