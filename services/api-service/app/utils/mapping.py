FRONTEND_TO_ML_MAP = {
    "temperature": "Temperature",
    "turbidity_cm": "Turbidity (cm)",
    "dissolved_oxygen_mg_l": "Dissolved Oxygen (mg/L)",
    "biochemical_oxygen_demand_mg_l": "Biochemical Oxygen Demand (mg/L)",
    "carbon_dioxide_co2": "Carbon Dioxide (CO2)",
    "ph": "pH",
    "total_alkalinity_mg_l_1": "Total Alkalinity (mg L-1)",
    "total_hardness_mg_l_1": "Total Hardness (mg L-1)",
    "calcium_mg_l_1": "Calcium (mg L-1)",
    "ammonia_mg_l_1": "Ammonia (mg L-1)",
    "nitrite_mg_l_1": "Nitrite (mg L-1)",
    "phosphorus_mg_l_1": "Phosphorus (mg L-1)",
    "hydrogen_sulfide_mg_l_1": "Hydrogen Sulfide (mg L-1)",
    "plankton_count_no_l_1": "Plankton Count (No. L-1)"
}

def map_frontend_to_ml(data: dict) -> dict:
    """
    Translate dictionary keys from Frontend names to ML Service alias names.
    """
    return {FRONTEND_TO_ML_MAP.get(k, k): v for k, v in data.items()}
