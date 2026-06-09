import os
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
TABLE_NAME = "recalculated_aquaculture"

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

CSV_PATH = "data/raw/Recalculated_Aquaculture_Water_Suitability_Signals_WQI_Derived.csv"

def main():
    print(f"Loading data from {CSV_PATH}...")
    try:
        df = pd.read_csv(CSV_PATH)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return
    
    # Define mapping from CSV columns to Database columns
    # Keys must match exactly what the frontend expects
    column_mapping = {
        "Temperature": "temperature",
        "Turbidity (cm)": "turbidity_cm",
        "Dissolved Oxygen (mg L-1)": "dissolved_oxygen_mg_l",
        "Biochemical Oxygen Demand (mg L-1)": "biochemical_oxygen_demand_mg_l",
        "Carbon Dioxide (mg L-1)": "carbon_dioxide_mg_l",
        "pH": "ph",
        "Total Alkalinity (mg L-1 as CaCO3)": "total_alkalinity_mg_l_1",
        "Total Hardness (mg L-1 as CaCO3)": "total_hardness_mg_l_1",
        "Calcium (mg L-1)": "calcium_mg_l_1",
        "Estimated Magnesium (mg L-1)": "estimated_magnesium_mg_l_1",
        "Ammonia (mg L-1)": "ammonia_mg_l_1",
        "Nitrite (mg L-1)": "nitrite_mg_l_1",
        "Phosphorus (mg L-1)": "phosphorus_mg_l_1",
        "Hydrogen Sulphide (mg L-1)": "hydrogen_sulphide_mg_l_1",
        "Plankton Abundance (No. L-1)": "plankton_abundance_no_l_1",
        "Water Quality Index (WQI)": "water_quality_index_wqi",
        "WQI-Derived Quality Label": "wqi_derived_quality_label",
        "WQI-Derived Quality Category": "wqi_derived_quality_category",
        "WQI-Derived Aquaculture Suitability Classification": "wqi_derived_aquaculture_suitability_classification",
        "WQI-Derived Aquaculture Suitability Description": "wqi_derived_aquaculture_suitability_description",
    }
    
    # Select columns that exist in the CSV and map their names
    available_cols = [col for col in column_mapping.keys() if col in df.columns]
    missing_csv_cols = [col for col in column_mapping.keys() if col not in df.columns]
    if missing_csv_cols:
        print(f"WARNING: These CSV columns were not found: {missing_csv_cols}")
    
    df_subset = df[available_cols].copy()
    df_subset = df_subset.rename(columns=column_mapping)
    
    # Replace Pandas NaN with None (Python null) so Supabase accepts it correctly
    df_subset = df_subset.where(pd.notnull(df_subset), None)
    
    records = df_subset.to_dict(orient="records")
    total_records = len(records)
    print(f"Total records to upload: {total_records}")
    print(f"Columns: {list(df_subset.columns)}")
    
    # Step 1: Delete all existing rows first to avoid duplicates
    print("\nDeleting existing data from table...")
    try:
        # Delete all rows (neq id 0 matches everything since ids are auto-incremented from 1)
        supabase.table(TABLE_NAME).delete().neq("id", 0).execute()
        print("Existing data deleted successfully.")
    except Exception as e:
        print(f"Warning: Could not delete existing data: {e}")
        print("Proceeding with insert (may result in duplicates)...")
    
    # Step 2: Insert in chunks of 500 rows
    chunk_size = 500
    for i in range(0, total_records, chunk_size):
        chunk = records[i:i + chunk_size]
        print(f"Uploading rows {i+1} to {min(i + chunk_size, total_records)}...")
        try:
            supabase.table(TABLE_NAME).insert(chunk).execute()
        except Exception as e:
            print(f"Error inserting chunk at index {i}: {e}")
            
    print("\nData upload to Supabase completed successfully!")

if __name__ == "__main__":
    main()
