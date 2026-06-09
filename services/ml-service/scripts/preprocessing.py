from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Iterable

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder


PROJECT_ROOT = Path(__file__).resolve().parents[3]
RAW_DATA_PATH = PROJECT_ROOT / "data" / "raw" / "Recalculated_Aquaculture_Water_Suitability_Signals_WQI_Derived.csv"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"

TARGET_COLUMN = "WQI-Derived Aquaculture Suitability Classification"
DROP_COLUMNS = [
    "Record ID", 
    "Water Quality Index (WQI)", 
    "WQI-Derived Quality Label", 
    "WQI-Derived Quality Category", 
    "WQI-Derived Aquaculture Suitability Description"
]
RANDOM_STATE = 42

def read_raw_data(path: Path = RAW_DATA_PATH) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Dataset tidak ditemukan: {path}")

    df = pd.read_csv(path, encoding="utf-8-sig")
    if df.shape[1] == 1:
        raise ValueError(
            "Dataset hanya terbaca 1 kolom. Pastikan CSV dibaca dengan separator yang benar."
        )
    return df


def _parse_number(value: object) -> float:
    if pd.isna(value):
        return np.nan
    if isinstance(value, (int, float, np.number)):
        return float(value)

    text = str(value).strip().replace(",", ".")
    if text == "":
        return np.nan

    if text.count(".") > 1:
        head, tail = text.rsplit(".", 1)
        text = head.replace(".", "") + "." + tail

    return pd.to_numeric(text, errors="coerce")


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    cleaned = df.copy()
    cleaned.columns = cleaned.columns.str.strip()
    cleaned = cleaned.drop_duplicates().reset_index(drop=True)

    # Pastikan target dan kolom drop tidak diproses numeric parsing
    numeric_candidates = [
        col
        for col in cleaned.columns
        if col not in [TARGET_COLUMN] + list(DROP_COLUMNS)
    ]
    for col in numeric_candidates:
        cleaned[col] = cleaned[col].map(_parse_number)

    return cleaned


def build_feature_target(
    df: pd.DataFrame,
    target_column: str = TARGET_COLUMN,
    drop_columns: Iterable[str] = DROP_COLUMNS,
) -> tuple[pd.DataFrame, pd.Series, LabelEncoder]:
    if target_column not in df.columns:
        raise KeyError(f"Kolom target '{target_column}' tidak ditemukan.")

    feature_df = df.drop(columns=[target_column, *drop_columns], errors="ignore")
    target = df[target_column].astype(str).str.strip()

    numeric_features = feature_df.select_dtypes(include=[np.number]).columns.tolist()
    feature_df = feature_df[numeric_features].copy()

    label_encoder = LabelEncoder()
    encoded_target = pd.Series(
        label_encoder.fit_transform(target),
        name=target_column,
        index=df.index,
    )
    return feature_df, encoded_target, label_encoder


def get_training_data(test_size: float = 0.2) -> tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, list[str], list[str], LabelEncoder]:
    """
    Fungsi utilitas untuk load data, clean, extract features, dan split train/test.
    """
    raw = read_raw_data()
    cleaned = clean_data(raw)
    X, y, label_encoder = build_feature_target(cleaned)
    
    # Mencegah data leakage (label masuk ke features)
    if "Water Quality Label" in X.columns:
        X = X.drop(columns=["Water Quality Label"])

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=RANDOM_STATE,
        stratify=y,
    )
    
    return X_train, X_test, y_train, y_test, X.columns.tolist(), label_encoder.classes_.tolist(), label_encoder
