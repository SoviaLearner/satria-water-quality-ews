import type { AppState } from "./types";

export const state: AppState = {
  language: "id",
  authMode: "login",
  currentPage: "home",
  loading: false,
  message: "",
  session: null,
  profile: null,
  latestPrediction: null,
  modelInfo: null,
  predictionLogs: [],
  edaRows: [],
  edaTotalRows: 0,
  userRiskCount: 0,
  realtimeConnected: false,
  edaMetric: "ph",
  analyticsMetric: "dissolved_oxygen_mg_l",
  settingsTab: "profile",
  reportSearch: "",
};
