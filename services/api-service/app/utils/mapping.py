FRONTEND_TO_ML_MAP = {
    "temperature": "Temperature",
    "turbidity_cm": "Turbidity (cm)",
    "dissolved_oxygen_mg_l": "Dissolved Oxygen (mg L-1)",
    "biochemical_oxygen_demand_mg_l": "Biochemical Oxygen Demand (mg L-1)",
    "carbon_dioxide_mg_l": "Carbon Dioxide (mg L-1)",
    "ph": "pH",
    "total_alkalinity_mg_l_1": "Total Alkalinity (mg L-1 as CaCO3)",
    "total_hardness_mg_l_1": "Total Hardness (mg L-1 as CaCO3)",
    "calcium_mg_l_1": "Calcium (mg L-1)",
    "ammonia_mg_l_1": "Ammonia (mg L-1)",
    "nitrite_mg_l_1": "Nitrite (mg L-1)",
    "phosphorus_mg_l_1": "Phosphorus (mg L-1)",
    "hydrogen_sulphide_mg_l_1": "Hydrogen Sulphide (mg L-1)",
    "estimated_magnesium_mg_l_1": "Estimated Magnesium (mg L-1)",
    "plankton_abundance_no_l_1": "Plankton Abundance (No. L-1)"
}

def map_frontend_to_ml(data: dict) -> dict:
    """
    Translate dictionary keys from Frontend names to ML Service alias names.
    """
    return {FRONTEND_TO_ML_MAP.get(k, k): v for k, v in data.items()}
