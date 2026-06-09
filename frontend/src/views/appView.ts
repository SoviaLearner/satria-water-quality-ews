import { HERO_LOGO_PATH, numericParameters, predictionFields } from "../constants";
import type { AppPage, AppState, EdaRecord, PredictionLog } from "../types";
import { computeEdaStats, renderOutlierAnalysis } from "../utils/eda";
import { escapeAttribute, escapeHtml, formatDate, formatNumber, getDisplayName, getInitials, statusClass } from "../utils/format";
import { t } from "../utils/translations";
import {
  renderBarChart,
  renderDonut,
  renderHeatmap,
  renderHistogram,
  renderLineChart,
  renderMetricTabs,
} from "./charts";

export function renderApp(state: AppState) {
  if (state.currentPage === "reset-password") return renderResetPasswordPage(state);
  if (!state.session && state.currentPage !== "login") return renderPublicHomePage(state);
  return state.session ? renderPlatform(state) : renderAuthPage(state);
}

function renderResetPasswordPage(state: AppState) {
  const label = (key: Parameters<typeof t>[1]) => t(state.language, key);
  return `
    <main class="auth-shell">
      <nav class="topbar">
        <button class="brand auth-brand" type="button" data-page="home"><span class="brand-mark">S</span><span>SATRIA</span></button>
        <div class="auth-nav-actions">
          <button class="nav-link" type="button" data-page="home">${label("home")}</button>
          ${renderLanguageSwitcher(state)}
        </div>
      </nav>
      <section class="auth-stage reset-stage">
        <div class="auth-info-panel">
          <div class="auth-logo-card">
            <img src="${HERO_LOGO_PATH}" alt="SATRIA aquaculture logo" />
            <span>${label("authBrandLine")}</span>
          </div>
          <span class="auth-kicker">${state.language === "en" ? "Password Recovery" : "Pemulihan Password"}</span>
          <h2>${state.language === "en" ? "Create a new password for your SATRIA account." : "Buat password baru untuk akun SATRIA kamu."}</h2>
          <p>${state.language === "en" ? "This page opens from the Supabase recovery email and does not require profile completion first." : "Halaman ini terbuka dari email recovery Supabase dan tidak perlu melengkapi profil terlebih dahulu."}</p>
        </div>
        <form class="auth-card" id="resetPasswordForm">
          <div class="auth-card-logo">
            <img src="${HERO_LOGO_PATH}" alt="SATRIA logo" />
            <span>SATRIA</span>
          </div>
          <h1>${state.language === "en" ? "Reset Password" : "Reset Password"}</h1>
          <p class="subtitle">${state.language === "en" ? "Enter and confirm your new password." : "Masukkan dan konfirmasi password baru kamu."}</p>
          ${renderInput("newPassword", "password", state.language === "en" ? "New Password" : "Password Baru", state.language === "en" ? "Minimum 6 characters" : "Minimal 6 karakter")}
          ${renderInput("confirmPassword", "password", state.language === "en" ? "Confirm Password" : "Konfirmasi Password", state.language === "en" ? "Repeat new password" : "Ulangi password baru")}
          <button class="primary-button" type="submit" ${state.loading ? "disabled" : ""}>${state.loading ? label("processing") : state.language === "en" ? "Save New Password" : "Simpan Password Baru"}</button>
          ${state.message ? `<div class="message">${state.message}</div>` : ""}
        </form>
      </section>
    </main>
  `;
}

function renderAuthPage(state: AppState) {
  const isRegister = state.authMode === "register";
  const label = (key: Parameters<typeof t>[1]) => t(state.language, key);

  return `
    <main class="auth-shell">
      <nav class="topbar">
        <button class="brand auth-brand" type="button" data-page="home"><span class="brand-mark">S</span><span>SATRIA</span></button>
        <button class="public-menu-toggle" type="button" data-menu-toggle aria-label="${label("publicNavOpen")}"><span></span><span></span><span></span></button>
        <div class="auth-nav-actions">
          <button class="nav-link" type="button" data-page="home">${label("home")}</button>
          <button class="nav-link" type="button" data-auth-mode="login">${label("monitoring")}</button>
          <button class="nav-link" type="button" data-auth-mode="login">${label("eda")}</button>
          <button class="nav-link" type="button" data-auth-mode="login">${label("predictions")}</button>
          <button class="nav-link" type="button" data-auth-mode="login">${label("reports")}</button>
          <button class="nav-link ${!isRegister ? "active" : ""}" type="button" data-auth-mode="login">${label("login")}</button>
          <button class="nav-link ${isRegister ? "active" : ""}" type="button" data-auth-mode="register">${label("register")}</button>
          ${renderLanguageSwitcher(state)}
        </div>
      </nav>
      <section class="auth-stage">
        <div class="auth-info-panel">
          <div class="auth-logo-card">
            <img src="${HERO_LOGO_PATH}" alt="SATRIA aquaculture logo" />
            <span>${label("authBrandLine")}</span>
          </div>
          <span class="auth-kicker">${isRegister ? label("authRegisterKicker") : label("authLoginKicker")}</span>
          <h2>${isRegister ? label("authRegisterPanelTitle") : label("authLoginPanelTitle")}</h2>
          <p>${label("authPanelDescription")}</p>
          <div class="auth-benefits">
            <span>${label("authBenefitRealtime")}</span>
            <span>${label("authBenefitProfile")}</span>
            <span>${label("authBenefitEda")}</span>
          </div>
        </div>
        <form class="auth-card" id="authForm">
          <div class="auth-card-logo">
            <img src="${HERO_LOGO_PATH}" alt="SATRIA logo" />
            <span>SATRIA</span>
          </div>
          <h1>${isRegister ? label("registerTitle") : label("loginTitle")}</h1>
          <p class="subtitle">${isRegister ? label("authRegisterSubtitle") : label("authLoginSubtitle")}</p>
          ${isRegister ? renderInput("fullName", "text", label("authFullName"), label("authFullNamePlaceholder")) : ""}
          ${renderInput("email", "email", label("authEmail"), label("authEmailPlaceholder"))}
          ${renderInput("password", "password", label("authPassword"), label("authPasswordPlaceholder"))}
          ${isRegister ? renderInput("confirmPassword", "password", label("authConfirmPassword"), label("authConfirmPasswordPlaceholder")) : ""}
          ${!isRegister ? `<div class="auth-helper-row"><label class="remember-row"><input type="checkbox" checked /><span>${label("remember")}</span></label><button id="forgotPassword" type="button">${label("forgotPassword")}</button></div>` : ""}
          <button class="primary-button" type="submit" ${state.loading ? "disabled" : ""}>${state.loading ? label("processing") : isRegister ? label("register") : label("login")}</button>
          <button class="auth-mode-link" id="toggleModeBottom" type="button">${isRegister ? label("switchToLogin") : label("switchToRegister")}</button>
          ${state.message ? `<div class="message">${state.message}</div>` : ""}
        </form>
      </section>
    </main>
  `;
}

function renderLanguageSwitcher(state: AppState) {
  return `<div class="language-switcher" aria-label="Language switcher"><button class="${state.language === "id" ? "active" : ""}" type="button" data-language="id">ID</button><button class="${state.language === "en" ? "active" : ""}" type="button" data-language="en">EN</button></div>`;
}

function renderInput(id: string, type: string, label: string, placeholder: string) {
  return `
    <label class="input-group" for="${id}">
      <span>${label}</span>
      <input id="${id}" name="${id}" type="${type}" placeholder="${placeholder}" required />
    </label>
  `;
}

function renderPlatform(state: AppState) {
  return `
    <main class="platform-shell">
      ${renderPlatformNav(state)}
      ${renderCurrentPage(state)}
    </main>
  `;
}

function renderPublicHomePage(state: AppState) {
  const label = (key: Parameters<typeof t>[1]) => t(state.language, key);
  return `
    <main class="platform-shell public-shell">
      <nav class="platform-nav public-nav">
        <button class="brand platform-brand" type="button" data-page="home"><span class="brand-mark">S</span><span>SATRIA</span></button>
        <button class="public-menu-toggle" type="button" data-menu-toggle aria-label="${label("publicNavOpen")}"><span></span><span></span><span></span></button>
        <div class="platform-links public-links"><button class="active" type="button" data-page="home">${label("home")}</button><button type="button" data-auth-mode="login">${label("monitoring")}</button><button type="button" data-auth-mode="login">${label("eda")}</button><button type="button" data-auth-mode="login">${label("predictions")}</button><button type="button" data-auth-mode="login">${label("reports")}</button></div>
        <div class="public-auth-actions">${renderLanguageSwitcher(state)}<button type="button" data-auth-mode="login">${label("login")}</button><button type="button" data-auth-mode="register">${label("register")}</button></div>
      </nav>
      ${renderPublicLandingPage(state)}
    </main>
  `;
}

function renderPublicLandingPage(state: AppState) {
  const label = (key: Parameters<typeof t>[1]) => t(state.language, key);
  const features = [
    [label("monitoring"), label("featureMonitoring"), state.language === "id" ? "A" : "A"],
    [label("eda"), label("featureEda"), state.language === "id" ? "A" : "E"],
    [label("predictions"), label("featurePrediction"), "P"],
    [label("reports"), label("featureReports"), state.language === "id" ? "L" : "R"],
  ];

  return `
    <section class="public-landing">
      <div class="public-hero">
        <div class="public-hero-copy">
          <span class="hero-chip">${label("authBrandLine")}</span>
          <h1>${label("publicHeroTitle")}</h1>
          <p>${label("publicHeroSubtitle")}</p>
          <div class="public-hero-actions">
            <button class="primary-button" type="button" data-auth-mode="login">${label("login")}</button>
            <button class="secondary-button" type="button" data-auth-mode="register">${label("register")}</button>
            <a href="#about-satria">${label("learnMore")}</a>
          </div>
        </div>
        <div class="public-hero-panel" aria-label="SATRIA preview">
          <img src="${HERO_LOGO_PATH}" alt="SATRIA aquaculture logo" />
        </div>
      </div>
      <section class="public-section">
        <div class="public-section-heading">
          <h2>SATRIA</h2>
          <p>${label("publicHeroSubtitle")}</p>
        </div>
        <div class="public-feature-grid">
          ${features.map(([title, body, icon]) => `<article><span>${icon}</span><h3>${title}</h3><p>${body}</p><button type="button" data-auth-mode="login">${label("login")}</button></article>`).join("")}
        </div>
      </section>
      <section class="public-about" id="about-satria">
        <div>
          <span class="hero-chip">${label("aboutTitle")}</span>
          <h2>${label("aboutTitle")}</h2>
          <p>${label("aboutBody")}</p>
        </div>
        <dl>
          <div><dt>${label("version")}</dt><dd>v0.1 (2026)</dd></div>
          <div><dt>${label("contact")}</dt><dd>satria.waterquality@example.com</dd></div>
          <div><dt>${label("githubRepository")}</dt><dd>SoviaLearner/satria-water-quality-ews</dd></div>
        </dl>
      </section>
      ${renderHomeFooter(state)}
    </section>
  `;
}

function renderCurrentPage(state: AppState) {
  if (state.currentPage === "prediction") return renderPredictionPage(state);
  if (state.currentPage === "analytics") return renderAnalyticsPage(state);
  if (state.currentPage === "reports") return renderReportsPage(state);
  if (state.currentPage === "eda") return renderEdaPage(state);
  if (state.currentPage === "settings") return renderSettingsPage(state);
  return renderHomePage(state);
}

function renderPlatformNav(state: AppState) {
  const fullName = getDisplayName(state);
  const label = (key: Parameters<typeof t>[1]) => t(state.language, key);
  const links: { page: AppPage; label: string }[] = [
    { page: "home", label: label("home") },
    { page: "analytics", label: label("monitoring") },
    { page: "eda", label: label("eda") },
    { page: "prediction", label: label("predictions") },
    { page: "reports", label: label("reports") },
    { page: "settings", label: label("profile") },
  ];

  return `
    <nav class="platform-nav app-nav">
      <button class="brand platform-brand" type="button" data-page="home"><span class="brand-mark">S</span><span>SATRIA</span></button>
      <button class="public-menu-toggle app-menu-toggle" type="button" data-menu-toggle aria-label="${label("publicNavOpen")}"><span></span><span></span><span></span></button>
      <div class="platform-links">${links.map((link) => `<button class="${state.currentPage === link.page ? "active" : ""}" type="button" data-page="${link.page}">${link.label}</button>`).join("")}</div>
      <div class="platform-user">
        ${renderLanguageSwitcher(state)}
        <button class="profile-menu ${state.currentPage === "settings" ? "active" : ""}" type="button" data-page="settings">
          <span>Welcome,<strong>${escapeHtml(fullName)}</strong></span>
          <span class="profile-dot">${escapeHtml(getInitials(fullName) || "S")}</span>
        </button>
      </div>
      <button class="mobile-nav-overlay" type="button" data-menu-overlay aria-label="Close navigation"></button>
      <aside class="mobile-sidebar" aria-label="SATRIA mobile navigation">
        <div class="mobile-sidebar-head">
          <span class="brand"><span class="brand-mark">S</span><span>SATRIA</span></span>
          <button type="button" data-menu-toggle>${label("publicNavClose")}</button>
        </div>
        <div class="mobile-sidebar-links">
          ${links.map((link) => `<button class="${state.currentPage === link.page ? "active" : ""}" type="button" data-page="${link.page}">${link.label}</button>`).join("")}
          <button class="danger" id="navLogoutButton" type="button">${label("logout")}</button>
        </div>
        ${renderLanguageSwitcher(state)}
      </aside>
    </nav>
  `;
}

function renderHomePage(state: AppState) {
  const label = (key: Parameters<typeof t>[1]) => t(state.language, key);
  const modelName = state.modelInfo?.model_name || "LightGBM";
  const featureCount = state.modelInfo?.features?.length || predictionFields.length;
  const dataPointValue = state.edaTotalRows || state.edaRows.length;
  const riskLogs = state.userRiskCount;
  return `
    <section class="platform-home">
      <div class="hero-band">
        <div class="hero-content">
          <span class="hero-chip">Active ML Engine v0.1 (2026)</span>
          <h1>${label("heroTitle")}</h1>
          <div class="hero-divider"></div>
          <p>${label("heroDescription")}</p>
          <div class="hero-actions"><button type="button" data-page="prediction">${label("startPrediction")}</button><button type="button" data-page="analytics">${label("viewAnalytics")}</button></div>
        </div>
        <div class="hero-visual">
          <div class="hero-image-frame">
            <img src="${HERO_LOGO_PATH}" alt="SATRIA aquaculture logo" onerror="this.classList.add('is-missing')" />
            <div class="image-upload-placeholder"><strong>Upload logo SATRIA</strong><span>frontend/public/assets/satria-aquaculture-logo.png</span></div>
          </div>
        </div>
      </div>
      <div class="metric-row">
        ${renderMetricCard(label("activeModel"), modelName.toUpperCase(), label("modelDetail").replace("14", String(featureCount)), "target")}
        ${renderMetricCard(label("cleanDataPoints"), formatNumber(dataPointValue), label("cleanDataDetail"), "data")}
        ${renderMetricCard(label("riskLogs"), formatNumber(riskLogs), state.session ? label("riskLogsDetail") : label("riskLoginDetail"), "shield")}
      </div>
      ${renderCapabilities(state)}
      ${renderHomeFooter(state)}
    </section>
  `;
}

function renderMetricCard(label: string, value: string, detail: string, icon: string) {
  return `<article><span class="metric-icon ${icon}">${escapeHtml(label.slice(0, 1).toUpperCase())}</span><p>${label}</p><strong>${value}</strong><small>${detail}</small></article>`;
}

function renderCapabilities(state: AppState) {
  const label = (key: Parameters<typeof t>[1]) => t(state.language, key);
  const items = [
    [label("capabilityPredictionTitle"), label("capabilityPredictionBody"), label("capabilityPredictionAction"), "prediction"],
    [label("capabilityMonitoringTitle"), label("capabilityMonitoringBody"), label("capabilityMonitoringAction"), "analytics"],
    [label("capabilityReportsTitle"), label("capabilityReportsBody"), label("capabilityReportsAction"), "reports"],
    [label("capabilityEdaTitle"), label("capabilityEdaBody"), label("capabilityEdaAction"), "eda"],
  ];

  return `<section class="capabilities"><h2>${label("capabilityTitle")}</h2><p>${label("capabilityDescription")}</p><div class="capability-grid">${items.map(([title, body, action, page]) => `<article><span>${escapeHtml(title[0])}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p><button type="button" data-page="${page}">${escapeHtml(action)} &gt;</button></article>`).join("")}</div></section>`;
}

function renderHomeFooter(state: AppState) {
  const label = (key: Parameters<typeof t>[1]) => t(state.language, key);
  return `
    <footer class="home-footer">
      <div class="footer-grid">
        <div><div class="brand footer-brand"><span class="brand-mark">S</span><span>SATRIA</span></div><p>${label("footerDescription")}</p><div class="social-row"><button disabled>f</button><button disabled>x</button><button disabled>in</button><button disabled>gh</button></div></div>
        <div><h4>${label("footerPlatform")}</h4><button data-page="home">${label("footerHomePage")}</button><button data-page="prediction">${label("footerMlPrediction")}</button><button data-page="analytics">${label("footerAnalyticsDashboard")}</button><button data-page="reports">${label("footerLogReports")}</button></div>
        <div><h4>${label("footerResources")}</h4><button data-page="eda">${label("footerDatasetEda")}</button><button disabled>${label("footerDocumentation")}</button><button disabled>${label("footerApiReference")}</button><button disabled>${label("footerCommunityForum")}</button></div>
        <div><h4>${label("footerContactSupport")}</h4><p>${label("footerContactDescription")}</p><button disabled>support@satria.local</button><small>${label("footerResponseTime")}</small></div>
      </div>
      <div class="footer-bottom"><span>${label("footerRights")}</span><span>${label("footerPolicy")}</span></div>
    </footer>
  `;
}

function renderPredictionPage(state: AppState) {
  const label = (key: Parameters<typeof t>[1]) => t(state.language, key);
  const modelName = state.modelInfo?.model_name || "LightGBM";
  const jsonExample = buildPredictionJsonExample();
  return `
    <section class="work-page prediction-page">
      <div class="page-heading"><h1>${label("predictionPageTitle")}</h1><p>${label("predictionPageSubtitle")}</p></div>
      <div class="model-strip">
        <div><span>${label("modelStripActiveModel")}</span><strong>${escapeHtml(modelName.toUpperCase())}</strong></div>
        <div><span>${label("modelStripInputFeatures")}</span><strong>${state.modelInfo?.features?.length || predictionFields.length}</strong></div>
        <div><span>${label("modelStripClasses")}</span><strong>${state.modelInfo?.classes?.length || 3}</strong></div>
      </div>
      <form class="prediction-form prediction-section" id="predictionForm">
        <div class="preset-section">
          <div class="preset-header">
            <span class="preset-title">${label("demoPresets")}</span>
            <button type="reset" class="preset-reset-btn">${label("resetForm")}</button>
          </div>
          <div class="preset-buttons">
            <button type="button" class="preset-btn highly-suitable" data-preset="highly_suitable">${label("presetHighlySuitable")}</button>
            <button type="button" class="preset-btn suitable" data-preset="suitable">${label("presetSuitable")}</button>
            <button type="button" class="preset-btn restricted-stressed" data-preset="restricted_stressed">${label("presetRestrictedStressed")}</button>
            <button type="button" class="preset-btn unsuitable-critical" data-preset="unsuitable_critical">${label("presetUnsuitableCritical")}</button>
          </div>
        </div>
        <div class="parameter-grid">${predictionFields.map(([name, , example]) => `<label><span>${escapeHtml(predictionFieldLabel(name, state.language))}</span><small>${label("inputFormatHint")}</small><input name="${name}" type="number" step="any" placeholder="${label("sample")}: ${example}" required /><em class="input-error">${label("inputFormatError")}</em></label>`).join("")}</div>
        <button class="execute-button" id="executePrediction" type="submit" disabled>${state.loading ? label("running") : label("executePrediction")}</button>
        <div class="prediction-actions">
          <label><span>${label("uploadJsonBatch")}</span><small>${label("uploadJsonHelp")}</small><span class="file-input-shell"><span>${label("chooseFile")}</span><input id="bulkPredictionFile" type="file" accept="application/json" ${state.loading ? "disabled" : ""} /></span><em>${label("noFileChosen")}</em></label>
          <details class="json-example-panel">
            <summary>${label("viewJsonExample")}</summary>
            <ul>
              <li>${label("jsonGuideDecimal")}</li>
              <li>${label("jsonGuideArray")}</li>
              <li>${label("jsonGuideFields")}</li>
              <li>${label("jsonGuideMultiple")}</li>
            </ul>
            <pre id="predictionJsonExample">${escapeHtml(jsonExample)}</pre>
            <div class="json-example-actions"><button type="button" id="copyJsonExample">${label("copyExample")}</button><button type="button" id="downloadSampleJson">${label("downloadSampleJson")}</button></div>
          </details>
        </div>
        ${state.message ? `<div class="message">${escapeHtml(state.message)}</div>` : ""}
      </form>
      <aside class="result-panel prediction-section">${state.latestPrediction ? renderPredictionResult(state) : `<div class="empty-result"><strong>${label("resultsWillAppear")}</strong><span>${label("afterCalculation")}</span></div>`}</aside>
      <article class="recent-card prediction-section"><h2>${label("recentTests")}</h2>${renderRecentList(state.predictionLogs.slice(0, 3), state)}</article>
      <article class="how-card prediction-section"><strong>${label("howItWorks")}</strong><p>${label("howItWorksBody1")}</p><p>${label("howItWorksBody2")}</p></article>
    </section>
  `;
}

function renderPredictionResult(state: AppState) {
  const label = (key: Parameters<typeof t>[1]) => t(state.language, key);
  const result = state.latestPrediction!;
  return `<div class="result-ready"><span class="result-badge">${escapeHtml(translateStatus(result.predicted_suitability_tier, state.language))}</span><h2>${label("predictionResult")}</h2><p>${label("classId")}: ${result.predicted_class_id}</p>${renderRecommendation(result.predicted_suitability_tier, state)}${Object.entries(result.probabilities).map(([key, value]) => `<div class="prob-row"><span>${escapeHtml(translateStatus(key, state.language))}</span><strong>${(value * 100).toFixed(2)}%</strong></div>`).join("")}<button class="report-link-button" type="button" data-page="reports">${label("viewFullReport")}</button></div>`;
}

function renderRecommendation(tier: string, state: AppState) {
  const label = (key: Parameters<typeof t>[1]) => t(state.language, key);
  const normalized = tier.toLowerCase();
  const tone = normalized.includes("optimal") ? "optimal" : normalized.includes("moderate") ? "moderate" : "unsafe";
  const message = normalized.includes("optimal")
    ? label("recommendationOptimal")
    : normalized.includes("moderate")
      ? label("recommendationModerate")
      : label("recommendationUnsafe");
  return `<article class="recommendation-card ${tone}"><strong>${label("recommendationTitle")}</strong><p>${escapeHtml(message)}</p></article>`;
}

function renderAnalyticsPage(state: AppState) {
  const label = (key: Parameters<typeof t>[1]) => t(state.language, key);
  const userRows = state.predictionLogs.map((log) => log.input_data || {});
  const stats = computeEdaStats(userRows);
  const active = numericParameters.find((item) => item.key === state.analyticsMetric);
  const parameterName = active ? t(state.language, parameterTranslationKey(active.key)) : "Parameter";
  const latestStatus = state.predictionLogs[0]?.predicted_suitability_tier || "N/A";
  return `<section class="work-page"><div class="page-heading row-heading"><div><h1>${label("monitoringTitle")}</h1><p>${label("monitoringSubtitle")}</p><span class="realtime-badge ${state.realtimeConnected ? "on" : ""}">${state.realtimeConnected ? label("monitoringRealtimeOn") : label("monitoringRealtimePending")}</span></div><button class="refresh-button" id="refreshData" type="button">${label("refresh")}</button></div><div class="insight-strip"><div><span>${label("userLogs")}</span><strong>${formatNumber(state.predictionLogs.length)}</strong></div><div><span>${label("avgPh")}</span><strong>${stats.avgPh.toFixed(2)}</strong></div><div><span>${label("avgNitrite")}</span><strong>${stats.nitriteMean.toFixed(3)}</strong></div><div><span>${label("latestStatus")}</span><strong>${escapeHtml(translateStatus(latestStatus, state.language))}</strong></div></div>${!state.predictionLogs.length ? `<div class="empty-analytics">${label("noDataAnalytics")}</div>` : ""}<div class="analytics-grid"><article class="chart-card wide"><div class="chart-heading"><div><h2>${label("userWaterTrends")}: ${escapeHtml(parameterName)}</h2><p>${label("trendDescription")}</p></div>${renderMetricTabs(state.analyticsMetric, "analytics", state.language)}</div>${renderLineChart(userRows, state.analyticsMetric, "temperature", state.language)}</article><article class="chart-card"><h2>${label("statusClasses")}</h2>${renderDonut(state.predictionLogs, state.language)}</article><article class="chart-card"><h2>${escapeHtml(parameterName)} ${label("levels")}</h2>${renderBarChart(userRows, state.analyticsMetric, state.language)}</article><article class="chart-card"><h2>${label("nitriteLevels")}</h2>${renderBarChart(userRows, "nitrite_mg_l_1", state.language)}</article><article class="chart-card wide"><h2>${label("userParameterCorrelation")}</h2><p class="chart-caption">${label("correlationCaption")}</p>${renderHeatmap(userRows, state.language)}</article></div></section>`;
}

function parameterTranslationKey(key: string): Parameters<typeof t>[1] {
  const map: Record<string, Parameters<typeof t>[1]> = {
    temperature: "paramTemperature",
    ph: "paramPh",
    dissolved_oxygen_mg_l: "paramDissolvedOxygen",
    ammonia_mg_l_1: "paramAmmonia",
    nitrite_mg_l_1: "paramNitrite",
    phosphorus_mg_l_1: "paramPhosphorus",
    total_hardness_mg_l_1: "paramHardness",
    total_alkalinity_mg_l_1: "paramAlkalinity",
    turbidity_cm: "paramTurbidity",
    biochemical_oxygen_demand_mg_l: "paramBod",
    carbon_dioxide_mg_l: "paramCarbonDioxide",
    calcium_mg_l_1: "paramCalcium",
    estimated_magnesium_mg_l_1: "paramEstimatedMagnesium",
    hydrogen_sulphide_mg_l_1: "paramHydrogenSulphide",
    plankton_abundance_no_l_1: "paramPlanktonAbundance",
  };
  return map[key] || "valueAxis";
}

function predictionFieldLabel(key: string, language: AppState["language"]) {
  return t(language, parameterTranslationKey(key));
}

function buildPredictionJsonExample() {
  const row = predictionFields.reduce<Record<string, number>>((acc, [name, , example]) => {
    acc[name] = example;
    return acc;
  }, {});
  return JSON.stringify([row], null, 2);
}

function translateStatus(status: string, language: AppState["language"]) {
  const normalized = status.toLowerCase();
  if (normalized.includes("highly suitable")) {
    return language === "en" ? "Highly Suitable" : "Sangat Sesuai";
  }
  if (normalized.includes("unsuitable") || normalized.includes("critical")) {
    return language === "en" ? "Unsuitable / Critical" : "Tidak Sesuai / Kritis";
  }
  if (normalized.includes("suitable")) {
    return language === "en" ? "Suitable" : "Sesuai";
  }
  if (normalized.includes("restricted") || normalized.includes("stressed")) {
    return language === "en" ? "Restricted / Stressed" : "Terbatas / Stres";
  }
  if (normalized.includes("optimal")) return t(language, "statusOptimal");
  if (normalized.includes("moderate")) return t(language, "statusModerate");
  if (normalized.includes("reduced")) return t(language, "statusReduced");
  return status || t(language, "statusUnknown");
}

function renderReportsPage(state: AppState) {
  const label = (key: Parameters<typeof t>[1]) => t(state.language, key);
  const latest = state.predictionLogs[0];
  const latestStatus = state.latestPrediction?.predicted_suitability_tier || latest?.predicted_suitability_tier || label("noPredictionYet");
  const filtered = filteredLogs(state);
  const pageSize = 10;
  const totalPages = Math.max(Math.ceil(filtered.length / pageSize), 1);
  const currentPage = Math.min(Math.max(state.reportPage, 1), totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);
  const interpretedStatus = translateStatus(latestStatus, state.language);
  const interpretation = label("finalInterpretationBody").replace("{status}", interpretedStatus);
  return `<section class="work-page reports-page"><div class="page-heading row-heading"><div><h1>${label("reportsTitle")}</h1><p>${label("reportsSubtitle")}</p></div><button class="refresh-button" id="refreshData" type="button">${label("refreshLogs")}</button></div><div class="report-summary-grid report-summary-grid-compact"><article><span>${label("monitoringSummary")}</span><strong>${formatNumber(state.predictionLogs.length)}</strong><p>${label("monitoringSummaryBody")}</p></article><article><span>${label("predictionSummary")}</span><strong>${escapeHtml(interpretedStatus)}</strong><p>${label("predictionSummaryBody")}</p></article></div><article class="final-interpretation"><h2>${label("finalInterpretation")}</h2><p>${escapeHtml(interpretation)}</p><p class="chart-caption">${label("pdfFutureNote")}</p></article><div class="report-toolbar"><div class="report-search-field"><input id="reportSearch" placeholder="${label("reportSearchPlaceholder")}" value="${escapeAttribute(state.reportSearch)}" /><button type="button" data-report-search aria-label="${label("reportSearchButton")}">⌕</button></div><button type="button" data-refresh>${label("syncSupabase")}</button><button type="button" id="downloadReportsCsv">${label("downloadCsv")}</button></div><div class="table-wrap"><table class="log-table"><thead><tr><th>${label("tableTimestamp")}</th><th>${label("tableUser")}</th><th>${label("tableParameters")}</th><th>${label("tableStatus")}</th><th>${label("tableActions")}</th></tr></thead><tbody>${renderReportRows(state, pageRows)}</tbody></table></div>${renderReportPagination(state, filtered.length, currentPage, totalPages, pageRows.length)}${state.message ? `<div class="message">${escapeHtml(state.message)}</div>` : ""}</section>`;
}

function renderReportRows(state: AppState, rows: PredictionLog[]) {
  const label = (key: Parameters<typeof t>[1]) => t(state.language, key);
  if (!rows.length) return `<tr><td colspan="5" class="empty-table">${label("noReportRows")}</td></tr>`;
  const user = state.profile?.full_name || state.session?.user.email || "Current User";
  return rows.map((row) => `<tr><td>${formatDate(row.created_at)}</td><td>${escapeHtml(user)}</td><td><span class="pill">pH ${Number(row.input_data?.ph || 0).toFixed(1)}</span><span class="pill">${Number(row.input_data?.temperature || 0).toFixed(1)} C</span><span class="pill">${Number(row.input_data?.dissolved_oxygen_mg_l || 0).toFixed(1)} mg/L</span></td><td><span class="status-pill ${statusClass(row.predicted_suitability_tier)}">${escapeHtml(translateStatus(row.predicted_suitability_tier, state.language))}</span></td><td><button type="button" title="${label("reportSynced")}">${label("reportSynced")}</button></td></tr>`).join("");
}

function renderReportPagination(state: AppState, filteredCount: number, currentPage: number, totalPages: number, currentCount: number) {
  const label = (key: Parameters<typeof t>[1]) => t(state.language, key);
  return `<footer class="reports-footer report-pagination"><span>${label("reportsShowing")} ${formatNumber(currentCount)} ${label("reportsOf")} ${formatNumber(filteredCount)} ${label("reportsEntries")} | ${label("totalData")}: ${formatNumber(state.predictionLogs.length)}</span><div><button type="button" data-report-page="prev" ${currentPage <= 1 ? "disabled" : ""}>${label("previous")}</button><strong>${label("page")} ${currentPage} / ${totalPages}</strong><button type="button" data-report-page="next" ${currentPage >= totalPages ? "disabled" : ""}>${label("next")}</button></div></footer>`;
}

function filteredLogs(state: AppState) {
  const term = state.reportSearch.trim().toLowerCase();
  if (!term) return state.predictionLogs;
  return state.predictionLogs.filter((row) => reportDateMatches(row.created_at, term));
}

function reportDateMatches(value: string, rawTerm: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const term = rawTerm.trim().toLowerCase().replace(/\s+/g, " ");
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const slash = `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
  const looseSlash = `${day}/${month}`;
  const monthNames = [
    ["jan", "januari", "january"],
    ["feb", "februari", "february"],
    ["mar", "maret", "march"],
    ["apr", "april"],
    ["mei", "may"],
    ["jun", "juni", "june"],
    ["jul", "juli", "july"],
    ["agu", "agustus", "aug", "august"],
    ["sep", "september"],
    ["okt", "oktober", "oct", "october"],
    ["nov", "november"],
    ["des", "desember", "dec", "december"],
  ];
  const monthTerms = monthNames[month - 1].flatMap((name) => [`${day} ${name}`, `${String(day).padStart(2, "0")} ${name}`]);
  return iso.includes(term) || slash.includes(term) || looseSlash === term || monthTerms.some((item) => item === term);
}

const edaReportStats = {
  variables: 21,
  observations: 4300,
  missingCells: 0,
  missingPct: "0.0%",
  duplicateRows: 0,
  numericVariables: 16,
  categoricalVariables: 4,
};

const edaClassDistribution = [
  { tier: "Highly Suitable", count: 2800, color: "#079455" },
  { tier: "Restricted / Stressed", count: 1291, color: "#d92d20" },
  { tier: "Suitable", count: 192, color: "#b26b00" },
  { tier: "Unsuitable / Critical", count: 17, color: "#ef4444" },
] as const;

const edaReportVariables = [
  { label: "Temperature", type: "Numeric", keys: ["temperature"] },
  { label: "Turbidity", type: "Numeric", keys: ["turbidity_cm"] },
  { label: "Dissolved Oxygen", type: "Numeric", keys: ["dissolved_oxygen_mg_l"] },
  { label: "Biochemical Oxygen Demand", type: "Numeric", keys: ["biochemical_oxygen_demand_mg_l"] },
  { label: "Carbon Dioxide", type: "Numeric", keys: ["carbon_dioxide_mg_l"] },
  { label: "pH", type: "Numeric", keys: ["ph"] },
  { label: "Total Alkalinity", type: "Numeric", keys: ["total_alkalinity_mg_l_1"] },
  { label: "Total Hardness", type: "Numeric", keys: ["total_hardness_mg_l_1"] },
  { label: "Calcium", type: "Numeric", keys: ["calcium_mg_l_1"] },
  { label: "Estimated Magnesium", type: "Numeric", keys: ["estimated_magnesium_mg_l_1"] },
  { label: "Ammonia", type: "Numeric", keys: ["ammonia_mg_l_1"] },
  { label: "Nitrite", type: "Numeric", keys: ["nitrite_mg_l_1"] },
  { label: "Phosphorus", type: "Numeric", keys: ["phosphorus_mg_l_1"] },
  { label: "Hydrogen Sulphide", type: "Numeric", keys: ["hydrogen_sulphide_mg_l_1"] },
  { label: "Plankton Abundance", type: "Numeric", keys: ["plankton_abundance_no_l_1"] },
  { label: "Water Quality Index", type: "Numeric", keys: ["water_quality_index_wqi"] },
  { label: "Quality Label", type: "Categorical", keys: ["wqi_derived_quality_label"] },
  { label: "Quality Category", type: "Categorical", keys: ["wqi_derived_quality_category"] },
  { label: "Suitability Classification", type: "Categorical", keys: ["wqi_derived_aquaculture_suitability_classification"] },
  { label: "Suitability Description", type: "Categorical", keys: ["wqi_derived_aquaculture_suitability_description"] },
] as const;

const edaMissingValues = [
  ["Temperature", 0, "0.0%"],
  ["Turbidity", 0, "0.0%"],
  ["Dissolved Oxygen", 0, "0.0%"],
  ["Biochemical Oxygen Demand", 0, "0.0%"],
  ["Carbon Dioxide", 0, "0.0%"],
  ["pH", 0, "0.0%"],
  ["Total Alkalinity", 0, "0.0%"],
  ["Total Hardness", 0, "0.0%"],
  ["Calcium", 0, "0.0%"],
  ["Estimated Magnesium", 0, "0.0%"],
  ["Ammonia", 0, "0.0%"],
  ["Nitrite", 0, "0.0%"],
  ["Phosphorus", 0, "0.0%"],
  ["Hydrogen Sulphide", 0, "0.0%"],
  ["Plankton Abundance", 0, "0.0%"],
  ["Water Quality Index", 0, "0.0%"],
  ["Quality Label", 0, "0.0%"],
  ["Quality Category", 0, "0.0%"],
  ["Suitability Classification", 0, "0.0%"],
  ["Suitability Description", 0, "0.0%"],
] as const;

const edaReferenceStats: Record<string, { mean: number; min: number; max: number; std: number }> = {
  temperature: { mean: 22.9491395349, min: 15.0, max: 32.0, std: 3.2465380569 },
  turbidity_cm: { mean: 43.20561, min: 10.0, max: 81.06, std: 20.1272236292 },
  dissolved_oxygen_mg_l: { mean: 4.4915225581, min: 0.2, max: 6.587, std: 2.0990797903 },
  biochemical_oxygen_demand_mg_l: { mean: 3.4215097674, min: 1.0, max: 8.0, std: 1.9060865225 },
  carbon_dioxide_mg_l: { mean: 3.5431065116, min: 1.668, max: 10.0, std: 1.7506439893 },
  ph: { mean: 7.6871353488, min: 6.0, max: 8.5, std: 0.4187242961 },
  total_alkalinity_mg_l_1: { mean: 139.7381630233, min: 100.0, max: 300.0, std: 49.4014769713 },
  total_hardness_mg_l_1: { mean: 188.7953565116, min: 25.815, max: 763.341, std: 105.4914769953 },
  calcium_mg_l_1: { mean: 44.780682093, min: 5.0, max: 180.0, std: 26.8992978878 },
  estimated_magnesium_mg_l_1: { mean: 18.6930546512, min: 2.753, max: 76.531, std: 10.7700197853 },
  ammonia_mg_l_1: { mean: 0.2667846512, min: 0.02, max: 2.0, std: 0.3265816918 },
  nitrite_mg_l_1: { mean: 0.0293513953, min: 0.001, max: 0.1, std: 0.0249862397 },
  phosphorus_mg_l_1: { mean: 0.1306497674, min: 0.01, max: 0.5, std: 0.1201951431 },
  hydrogen_sulphide_mg_l_1: { mean: 0.011535814, min: 0.001, max: 0.05, std: 0.0113580265 },
  plankton_abundance_no_l_1: { mean: 4170.2741860465, min: 500.0, max: 6596.0, std: 1889.1769223646 },
};

const variableTranslationKeys: Record<string, Parameters<typeof t>[1]> = {
  "temperature": "paramTemperature",
  "turbidity_cm": "paramTurbidity",
  "dissolved_oxygen_mg_l": "paramDissolvedOxygen",
  "biochemical_oxygen_demand_mg_l": "paramBod",
  "carbon_dioxide_mg_l": "paramCarbonDioxide",
  "ph": "paramPh",
  "total_alkalinity_mg_l_1": "paramAlkalinity",
  "total_hardness_mg_l_1": "paramHardness",
  "calcium_mg_l_1": "paramCalcium",
  "estimated_magnesium_mg_l_1": "paramEstimatedMagnesium",
  "ammonia_mg_l_1": "paramAmmonia",
  "nitrite_mg_l_1": "paramNitrite",
  "phosphorus_mg_l_1": "paramPhosphorus",
  "hydrogen_sulphide_mg_l_1": "paramHydrogenSulphide",
  "plankton_abundance_no_l_1": "paramPlanktonAbundance",
};

function getVariableLabel(label: string, keys: readonly string[], isEnglish: boolean) {
  const primaryKey = keys[0];
  const translationKey = variableTranslationKeys[primaryKey];
  if (translationKey) {
    return t(isEnglish ? "en" : "id", translationKey);
  }
  if (label === "Water Quality Index") return isEnglish ? "Water Quality Index (WQI)" : "Indeks Kualitas Air (WQI)";
  if (label === "Quality Label") return isEnglish ? "Quality Label" : "Label Kualitas";
  if (label === "Quality Category") return isEnglish ? "Quality Category" : "Kategori Kualitas";
  if (label === "Suitability Classification") return isEnglish ? "Aquaculture Suitability Classification" : "Klasifikasi Kesesuaian Akuakultur";
  if (label === "Suitability Description") return isEnglish ? "Aquaculture Suitability Description" : "Deskripsi Kesesuaian Akuakultur";
  return label;
}

function getMissingValueName(name: string, isEnglish: boolean) {
  const variable = edaReportVariables.find((item) => item.label === name);
  if (variable) return getVariableLabel(variable.label, variable.keys, isEnglish);
  return name;
}

function renderEdaPage(state: AppState) {
  const isEnglish = state.language === "en";
  const active = numericParameters.find((item) => item.key === state.edaMetric);
  return `<section class="work-page eda-native-page"><div class="page-heading row-heading"><div><h1>${isEnglish ? "Exploratory Data Analysis" : "Analisis Data Eksploratif"}</h1><p>${isEnglish ? "Statistical overview of the SATRIA water quality dataset based on the reference notebook and report." : "Ikhtisar statistik dataset kualitas air SATRIA berdasarkan notebook dan report referensi."}</p><span class="realtime-badge ${state.realtimeConnected ? "on" : ""}">${state.realtimeConnected ? (isEnglish ? "Dataset synchronized" : "Dataset tersinkron") : (isEnglish ? "Dataset pending" : "Dataset menunggu")}</span></div></div>

  <div class="eda-summary-grid">
    <article>
      <span>${isEnglish ? "Observations" : "Observasi"}</span>
      <strong>${formatNumber(edaReportStats.observations)}</strong>
      <p>${isEnglish ? "Rows listed in the cleaned reference dataset." : "Baris pada dataset bersih referensi."}</p>
    </article>
    <article>
      <span>${isEnglish ? "Variables" : "Variabel"}</span>
      <strong>${formatNumber(edaReportStats.variables)}</strong>
      <p>${isEnglish ? "Columns included in the EDA report." : "Kolom yang tercakup dalam report EDA."}</p>
    </article>
    <article>
      <span>${isEnglish ? "Missing Cells" : "Sel Kosong"}</span>
      <strong>${formatNumber(edaReportStats.missingCells)}</strong>
      <p>${isEnglish ? "Total empty cells after preprocessing." : "Total sel kosong setelah preprocessing."}</p>
    </article>
    <article>
      <span>${isEnglish ? "Missing Rate" : "Tingkat Sel Kosong"}</span>
      <strong>${edaReportStats.missingPct}</strong>
      <p>${isEnglish ? "Missing cells divided by all dataset cells." : "Sel kosong dibanding seluruh sel dataset."}</p>
    </article>
  </div>

  <div class="eda-dashboard-grid">
    <article class="chart-card wide">
      <h2>${isEnglish ? "Dataset Summary" : "Ringkasan Dataset"}</h2>
      <p class="chart-help">${isEnglish ? "Reference summary of dataset size, variable types, and completeness." : "Ringkasan referensi mengenai ukuran dataset, tipe variabel, dan kelengkapan data."}</p>
      <div class="eda-accordion">
        <details open>
          <summary>${isEnglish ? "Dataset Overview" : "Ikhtisar Dataset"}</summary>
          <div class="accordion-content">
            ${renderDatasetOverviewTable(isEnglish)}
          </div>
        </details>
        <details>
          <summary>${isEnglish ? "Variable Types" : "Tipe Variabel"}</summary>
          <div class="accordion-content">
            ${renderVariableTypesTable(isEnglish)}
          </div>
        </details>
        <details>
          <summary>${isEnglish ? "Missing Values Analysis" : "Analisis Nilai Kosong"}</summary>
          <div class="accordion-content">
            ${renderMissingValuesTable(isEnglish)}
          </div>
        </details>
      </div>
    </article>

    <article class="chart-card wide">
      <div class="chart-heading">
        <div>
          <h2>${isEnglish ? "Parameter Distribution" : "Distribusi Parameter"}: ${escapeHtml(active?.label || "pH")}</h2>
        </div>
        ${renderMetricTabs(state.edaMetric, "eda", state.language)}
      </div>
      ${renderHistogram(state.edaRows, state.edaMetric, state.language)}
    </article>

    <article class="chart-card">
      <h2>${isEnglish ? "Class Distribution" : "Distribusi Kelas"}</h2>
      ${renderEdaClassDistribution(isEnglish)}
    </article>

    <article class="chart-card">
      <h2>${isEnglish ? "Data Quality Overview" : "Ikhtisar Kualitas Data"}</h2>
      ${renderDataQualityOverview(isEnglish)}
    </article>

    <article class="chart-card wide">
      <h2>${isEnglish ? "Outlier Analysis" : "Analisis Outlier"}</h2>
      ${renderOutlierAnalysis(state.edaRows, state.language)}
    </article>

    <article class="chart-card wide">
      <div class="eda-card-heading">
        <h2>${isEnglish ? "Variable Statistics" : "Statistik Variabel"}</h2>
      </div>
      <div class="table-scroll">
        ${renderStatsTable(state)}
      </div>
    </article>

    <article class="chart-card wide">
      <h2>${isEnglish ? "Sample Dataset" : "Sampel Dataset"}</h2>
      ${renderSampleDatasetTable(state.edaRows, isEnglish)}
    </article>
  </div></section>`;
}

function renderDatasetOverviewTable(isEnglish: boolean) {
  const rows = [
    [isEnglish ? "Number of Variables" : "Jumlah Variabel", edaReportStats.variables],
    [isEnglish ? "Number of Observations" : "Jumlah Observasi", edaReportStats.observations],
    [isEnglish ? "Missing Cells" : "Sel Kosong", edaReportStats.missingCells],
    [isEnglish ? "Missing Cells (%)" : "Sel Kosong (%)", edaReportStats.missingPct],
    [isEnglish ? "Duplicate Rows" : "Baris Duplikat", edaReportStats.duplicateRows],
    [isEnglish ? "Numeric Variables" : "Variabel Numerik", edaReportStats.numericVariables],
    [isEnglish ? "Categorical Variables" : "Variabel Kategorikal", edaReportStats.categoricalVariables],
  ];
  return `<table><tbody>${rows.map(([name, value]) => `<tr><th>${escapeHtml(String(name))}</th><td>${escapeHtml(String(value))}</td></tr>`).join("")}</tbody></table>`;
}

function renderVariableTypesTable(isEnglish: boolean) {
  return `<table><thead><tr><th>${isEnglish ? "Variable" : "Variabel"}</th><th>${isEnglish ? "Type" : "Tipe"}</th></tr></thead><tbody>${edaReportVariables.map((item) => `<tr><td>${escapeHtml(getVariableLabel(item.label, item.keys, isEnglish))}</td><td><span class="badge">${escapeHtml(isEnglish ? item.type : item.type === "Numeric" ? "Numerik" : "Kategorikal")}</span></td></tr>`).join("")}</tbody></table>`;
}

function renderMissingValuesTable(isEnglish: boolean) {
  return `<table><thead><tr><th>${isEnglish ? "Variable" : "Variabel"}</th><th>${isEnglish ? "Missing Count" : "Jumlah Kosong"}</th><th>${isEnglish ? "Missing %" : "Persentase Kosong"}</th></tr></thead><tbody>${edaMissingValues.map(([name, count, pct]) => `<tr><td>${escapeHtml(getMissingValueName(name, isEnglish))}</td><td>${formatNumber(count)}</td><td>${pct}</td></tr>`).join("")}<tr><td><strong>${isEnglish ? "Total Missing Cells" : "Total Sel Kosong"}</strong></td><td><strong>${formatNumber(edaReportStats.missingCells)}</strong></td><td><strong>${edaReportStats.missingPct}</strong></td></tr></tbody></table>`;
}

function getEdaValue(row: EdaRecord, keys: readonly string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return "-";
}

function renderStatsTable(state: AppState) {
  const isEnglish = state.language === "en";
  const rows = edaReportVariables.filter((item) => item.type === "Numeric").map((item) => {
    const reference = edaReferenceStats[item.keys[0]];
    if (!reference) return [getVariableLabel(item.label, item.keys, isEnglish), "-", "-", "-", "-"];
    return [getVariableLabel(item.label, item.keys, isEnglish), formatStat(reference.mean), formatStat(reference.std), formatStat(reference.min), formatStat(reference.max)];
  });
  return `<table><thead><tr><th>${isEnglish ? "Variable" : "Variabel"}</th><th>Mean</th><th>Std</th><th>Min</th><th>Max</th></tr></thead><tbody>${rows.map(([name, mean, std, min, max]) => `<tr><td class="stats-var-name">${escapeHtml(String(name))}</td><td>${escapeHtml(String(mean))}</td><td>${escapeHtml(String(std))}</td><td>${escapeHtml(String(min))}</td><td>${escapeHtml(String(max))}</td></tr>`).join("")}</tbody></table>`;
}

function renderSampleDatasetTable(rows: EdaRecord[], isEnglish: boolean) {
  const sampleRows = rows.slice(0, 5);
  if (!sampleRows.length) return `<div class="empty-chart"><strong>${isEnglish ? "No data available" : "Data tidak tersedia"}</strong><p>${isEnglish ? "Sample rows cannot be displayed because the dataset has not been loaded." : "Sampel baris belum dapat ditampilkan karena dataset belum termuat."}</p></div>`;
  return `<div class="sample-table-note">${isEnglish ? "First five rows from the loaded dataset." : "Lima baris pertama dari dataset yang termuat."}</div><div class="table-scroll sample-dataset-scroll"><table><thead><tr>${edaReportVariables.map((item) => `<th>${escapeHtml(getVariableLabel(item.label, item.keys, isEnglish))}</th>`).join("")}</tr></thead><tbody>${sampleRows.map((row) => `<tr>${edaReportVariables.map((item) => {
    const rawVal = getEdaValue(row, item.keys);
    const isDescriptionColumn = (item.keys as readonly string[]).includes("wqi_derived_aquaculture_suitability_description");
    if (isDescriptionColumn && rawVal !== "-") {
      const truncated = String(rawVal).length > 25 ? String(rawVal).slice(0, 25) + "..." : String(rawVal);
      return `<td><div class="desc-cell-wrapper"><span class="desc-text-preview" title="${escapeAttribute(String(rawVal))}">${escapeHtml(truncated)}</span><button type="button" class="btn-view-desc" data-desc="${escapeAttribute(String(rawVal))}">${isEnglish ? "View" : "Lihat"}</button></div></td>`;
    }
    return `<td>${escapeHtml(formatCellValue(rawVal))}</td>`;
  }).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function renderEdaClassDistribution(isEnglish: boolean) {
  const total = edaClassDistribution.reduce((sum, item) => sum + item.count, 0);
  if (!total) return `<div class="empty-chart"><strong>${isEnglish ? "No data available" : "Data tidak tersedia"}</strong></div>`;
  const sorted = [...edaClassDistribution].sort((a, b) => b.count - a.count);
  return `<div class="eda-class-distribution">
    <p class="chart-help">${isEnglish ? "Class composition from the reference EDA report, sorted by count." : "Komposisi kelas dari report EDA referensi, diurutkan berdasarkan jumlah data."}</p>
    <div class="axis-label-row"><span>Y: ${isEnglish ? "Suitability class" : "Kelas kesesuaian"}</span><span>X: ${isEnglish ? "Count and percentage" : "Jumlah dan persentase"}</span></div>
    <div class="class-bars" role="img" aria-label="${isEnglish ? "Class distribution chart" : "Grafik distribusi kelas"}">
      ${sorted.map((item) => {
        const pct = (item.count / total) * 100;
        const translated = translateSuitabilityTier(item.tier, isEnglish);
        const tooltip = isEnglish
          ? `X (Class): ${item.tier}\nY (Count): ${item.count} records (${pct.toFixed(2)}%)`
          : `X (Kelas): ${translated}\nY (Jumlah): ${item.count} data (${pct.toFixed(2)}%)`;
        return `<div class="class-bar-row" title="${escapeAttribute(tooltip)}"><span>${escapeHtml(translated)}</span><strong>${formatNumber(item.count)} (${pct.toFixed(2)}%)</strong><em style="--w:${pct.toFixed(2)}%;--bar-color:${item.color}"></em></div>`;
      }).join("")}
    </div>
    <div class="table-scroll">
      <table class="distribution-table"><thead><tr><th>${isEnglish ? "Class" : "Kelas"}</th><th>${isEnglish ? "Count" : "Jumlah"}</th><th>${isEnglish ? "Percentage" : "Persentase"}</th></tr></thead><tbody>${sorted.map((item) => {
        const pct = (item.count / total) * 100;
        return `<tr><td>${escapeHtml(translateSuitabilityTier(item.tier, isEnglish))}</td><td>${formatNumber(item.count)}</td><td>${pct.toFixed(2)}%</td></tr>`;
      }).join("")}</tbody></table>
    </div>
  </div>`;
}

function renderDataQualityOverview(isEnglish: boolean) {
  const rows = [
    [isEnglish ? "Raw rows" : "Baris awal", edaReportStats.observations],
    [isEnglish ? "Cleaned rows" : "Baris bersih", edaReportStats.observations],
    [isEnglish ? "Duplicate rows" : "Baris duplikat", edaReportStats.duplicateRows],
    [isEnglish ? "Missing cells" : "Sel kosong", edaReportStats.missingCells],
  ];
  return `<p class="chart-help">${isEnglish ? "Completeness indicators from the processed EDA summary." : "Indikator kelengkapan dari ringkasan EDA hasil proses."}</p><table><tbody>${rows.map(([name, value]) => `<tr><th>${escapeHtml(String(name))}</th><td>${escapeHtml(String(value))}</td></tr>`).join("")}</tbody></table>`;
}

function translateSuitabilityTier(value: string, isEnglish: boolean) {
  if (isEnglish) return value;
  if (value === "Reduced Suitability") return "Kelayakan Berkurang";
  if (value === "Moderate Suitability") return "Kelayakan Sedang";
  if (value === "Optimal Suitability") return "Kelayakan Optimal";
  return value || "-";
}

function formatStat(value: number) {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en", { maximumFractionDigits: Math.abs(value) < 1 ? 4 : 3 }).format(value);
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "-";
  if (typeof value === "string") return value.trim() || "-";
  return "-";
}

function renderSettingsPage(state: AppState) {
  const label = (key: Parameters<typeof t>[1]) => t(state.language, key);
  const fullName = getDisplayName(state);
  const email = state.profile?.email || state.session?.user.email || "";
  const role = state.profile?.role || "";
  const organization = state.profile?.organization || "";
  const bio = state.profile?.bio || "";

  return `<section class="settings-page"><header class="profile-header"><div class="avatar profile-avatar"><span>${escapeHtml(getInitials(fullName) || "S")}</span><small>${role && bio ? label("profileReadyShort") : label("profileSetup")}</small></div><div><h1>${escapeHtml(fullName)}</h1><p>${escapeHtml(role || label("completeProfileRole"))}</p><div class="profile-tags"><span>${role && bio ? label("profileReady") : label("profileRequired")}</span><span>${escapeHtml(organization || label("organizationEmpty"))}</span></div></div></header><div class="settings-layout"><aside class="settings-sidebar"><button class="${state.settingsTab === "profile" ? "active" : ""}" type="button" data-settings-tab="profile">${label("profileDetails")}</button><button class="${state.settingsTab === "security" ? "active" : ""}" type="button" data-settings-tab="security">${label("securityPrivacy")}</button><button id="logoutButton" class="danger" type="button">${label("signOut")}</button><div class="note-card"><strong>${label("accountStorage")}</strong><p>${label("accountStorageNote")}</p></div></aside>${state.settingsTab === "security" ? renderSecurityPanel(state, fullName, email) : renderProfilePanel(state, fullName, email, role, organization, bio)}</div><footer class="settings-footer">SATRIA v0.1-STABLE | ${label("lastLoggedIn")}: ${new Date().toLocaleString()}</footer></section>`;
}

function renderProfilePanel(state: AppState, fullName: string, email: string, role: string, organization: string, bio: string) {
  const label = (key: Parameters<typeof t>[1]) => t(state.language, key);
  return `<form class="profile-card" id="profileForm"><h2>${label("profileConfiguration")}</h2><p class="profile-form-note">${label("profileFormNote")}</p><div class="profile-form-grid"><label><span>${label("fullName")}</span><input name="fullName" value="${escapeAttribute(fullName)}" required /></label><label><span>${label("emailAddress")}</span><input value="${escapeAttribute(email)}" disabled /></label><label><span>${label("roleLabel")}</span><input name="role" value="${escapeAttribute(role)}" required /></label><label><span>${label("organizationLabel")}</span><input name="organization" value="${escapeAttribute(organization)}" required /></label><label class="wide"><span>${label("bioResearchFocus")}</span><textarea name="bio" rows="5" required>${escapeHtml(bio)}</textarea></label></div><button class="save-button" type="submit" ${state.loading ? "disabled" : ""}>${state.loading ? label("saving") : label("saveProfileChanges")}</button>${state.message ? `<div class="message settings-message">${state.message}</div>` : ""}</form>`;
}

function renderSecurityPanel(state: AppState, fullName: string, email: string) {
  const label = (key: Parameters<typeof t>[1]) => t(state.language, key);
  const temporaryNotice = state.temporaryPasswordReset
    ? `<div class="message settings-message password-reset-notice">${label("temporaryPasswordNotice")}</div>`
    : "";
  return `<form class="profile-card" id="securityForm"><h2>${label("securityPrivacy")}</h2>${temporaryNotice}<div class="profile-form-grid"><label><span>${label("usernameDisplayName")}</span><input name="securityFullName" value="${escapeAttribute(fullName)}" required /></label><label><span>${label("loginEmail")}</span><input value="${escapeAttribute(email)}" disabled /></label><label><span>${label("newPassword")}</span><input name="newPassword" type="password" minlength="6" placeholder="${escapeAttribute(label("emptyPasswordPlaceholder"))}" /></label><label><span>${label("confirmPassword")}</span><input name="confirmPassword" type="password" minlength="6" placeholder="${escapeAttribute(label("repeatNewPasswordPlaceholder"))}" /></label><label class="wide privacy-check"><input type="checkbox" checked /><span>${label("allowNameReports")}</span></label></div><button class="save-button" type="submit" ${state.loading ? "disabled" : ""}>${state.loading ? label("saving") : label("changePassword")}</button>${state.message ? `<div class="message settings-message">${state.message}</div>` : ""}</form>`;
}

function renderRecentList(rows: PredictionLog[], state: AppState) {
  const label = (key: Parameters<typeof t>[1]) => t(state.language, key);
  if (!rows.length) return `<p class="empty-small">${label("noPredictionLogs")}</p>`;
  return `<div class="recent-list-header"><span>${label("dateTime")}</span><span>${label("status")}</span></div>${rows.map((row) => `<div class="recent-item"><div><strong>${formatDate(row.created_at)}</strong><span>${label("predictionHistory")}</span></div><span class="status-pill ${statusClass(row.predicted_suitability_tier)}">${escapeHtml(translateStatus(row.predicted_suitability_tier, state.language))}</span></div>`).join("")}`;
}
