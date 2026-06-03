export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
export const HERO_LOGO_PATH = "/assets/satria-aquaculture-logo.jpeg";

export const predictionFields = [
  ["temperature", "Temperature", 24.94],
  ["turbidity_cm", "Turbidity", 54.38],
  ["dissolved_oxygen_mg_l", "Dissolved Oxygen", 4.01],
  ["biochemical_oxygen_demand_mg_l", "Organic Matter / BOD", 1.5],
  ["carbon_dioxide_co2", "Carbon Dioxide", 6.47],
  ["ph", "pH", 7.81],
  ["total_alkalinity_mg_l_1", "Alkalinity", 63.42],
  ["total_hardness_mg_l_1", "Hardness", 112.35],
  ["calcium_mg_l_1", "Calcium", 62.77],
  ["ammonia_mg_l_1", "Ammonia", 0.012],
  ["nitrite_mg_l_1", "Nitrite", 0.01],
  ["phosphorus_mg_l_1", "Phosphorus", 0.975],
  ["hydrogen_sulfide_mg_l_1", "Hydrogen Sulfide", 0.0195],
  ["plankton_count_no_l_1", "Plankton Count", 3728],
] as const;

export const numericParameters = [
  { key: "temperature", label: "Temperature", unit: "C" },
  { key: "ph", label: "pH", unit: "" },
  { key: "dissolved_oxygen_mg_l", label: "Dissolved Oxygen", unit: "mg/L" },
  { key: "ammonia_mg_l_1", label: "Ammonia", unit: "mg/L" },
  { key: "nitrite_mg_l_1", label: "Nitrite", unit: "mg/L" },
  { key: "phosphorus_mg_l_1", label: "Phosphorus", unit: "mg/L" },
  { key: "total_hardness_mg_l_1", label: "Hardness", unit: "mg/L" },
  { key: "total_alkalinity_mg_l_1", label: "Alkalinity", unit: "mg/L" },
] as const;
