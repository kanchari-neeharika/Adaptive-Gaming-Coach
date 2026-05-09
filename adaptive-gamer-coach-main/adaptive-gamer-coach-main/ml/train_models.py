"""
Adaptive Gamer Coaching System — Model Training Pipeline
Run from ml/ directory: python train_models.py
"""

import pandas as pd
import numpy as np
import joblib
import json
import os
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')

print("=" * 60)
print("ADAPTIVE GAMER COACH — MODEL TRAINING PIPELINE")
print("=" * 60)

# ─────────────────────────────────────────────
# 1. LOAD DATA
# ─────────────────────────────────────────────
print("\n[1/6] Loading dataset...")
DATASET_PATH = "gaming_mental_health_10M_40features.csv"
SAMPLE_SIZE = 200_000
RANDOM_STATE = 42

if not os.path.exists(DATASET_PATH):
    print(f"\n[ERROR] Dataset '{DATASET_PATH}' not found in ml/ folder.")
    print("GitHub ignores large CSV files (>100MB).")
    print("To train models, place the dataset in the ml/ directory.")
    print("NOTE: Pregenerated models (.pkl) are already included in this repository.")
    exit(1)

df = pd.read_csv(DATASET_PATH, nrows=None)
print(f"  Full dataset shape: {df.shape}")

# Sample 200k rows for training speed
df = df.sample(n=min(SAMPLE_SIZE, len(df)), random_state=RANDOM_STATE).reset_index(drop=True)
print(f"  Working sample shape: {df.shape}")
print(f"  Columns: {list(df.columns)}")

# ─────────────────────────────────────────────
# 2. LABEL ENGINEERING (CRITICAL — DO NOT CHANGE)
# ─────────────────────────────────────────────
print("\n[2/6] Engineering labels...")

# Rage-quit binary label
df['rage_quit'] = ((df['aggression_score'] > 6.0) & (df['stress_level'] >= 7)).astype(int)
rage_rate = df['rage_quit'].mean()
print(f"  Rage-quit positive rate: {rage_rate:.2%} (expected 20-25%)")

# Addiction category label
df['addiction_category'] = pd.cut(
    df['addiction_level'],
    bins=[-1, 3.33, 6.66, 10],
    labels=['Low', 'Medium', 'High']
)
print(f"  Addiction distribution:\n{df['addiction_category'].value_counts()}")

# ─────────────────────────────────────────────
# 3. FEATURE DEFINITIONS
# ─────────────────────────────────────────────
# NOTE ON LABEL INTEGRITY:
# rage_quit label = (aggression_score > 6.0) AND (stress_level >= 7)
# aggression_score is intentionally EXCLUDED from features below.
# Including it would be a tautology — the model would just learn the threshold
# we wrote, not a real correlation. Instead, the model must infer rage risk
# from 8 independent behavioral proxy signals. stress_level is kept because
# it is a self-reported general state, not a direct label component.
RAGE_FEATURES = [
    'stress_level', 'anxiety_score', 'daily_gaming_hours', 'toxic_exposure',
    'night_gaming_ratio', 'weekly_sessions', 'sleep_hours', 'loneliness_score'
]

ADDICTION_FEATURES = [
    'daily_gaming_hours', 'weekly_sessions', 'night_gaming_ratio', 'sleep_hours',
    'loneliness_score', 'social_interaction_score', 'microtransactions_spending',
    'years_gaming', 'happiness_score', 'depression_score'
]

# Save feature lists for backend to use
with open('rage_features.json', 'w') as f:
    json.dump(RAGE_FEATURES, f)
with open('addiction_features.json', 'w') as f:
    json.dump(ADDICTION_FEATURES, f)
print(f"\n  Rage features ({len(RAGE_FEATURES)}): {RAGE_FEATURES}")
print(f"  Addiction features ({len(ADDICTION_FEATURES)}): {ADDICTION_FEATURES}")

# ─────────────────────────────────────────────
# 4. TRAIN RAGE-QUIT MODEL (Random Forest)
# ─────────────────────────────────────────────
print("\n[3/6] Training Rage-Quit Model (Random Forest)...")

X_rage = df[RAGE_FEATURES].copy()
y_rage = df['rage_quit'].copy()

# Handle any NaN
X_rage = X_rage.fillna(X_rage.median())

X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
    X_rage, y_rage, test_size=0.2, random_state=RANDOM_STATE, stratify=y_rage
)

rage_model = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    min_samples_leaf=5,
    n_jobs=-1,
    random_state=RANDOM_STATE,
    class_weight='balanced'
)

rage_model.fit(X_train_r, y_train_r)

# Evaluation
y_pred_r = rage_model.predict(X_test_r)
y_prob_r = rage_model.predict_proba(X_test_r)[:, 1]

print("\n  === RAGE-QUIT MODEL RESULTS ===")
print(classification_report(y_test_r, y_pred_r, target_names=['No Rage', 'Rage Quit']))
print(f"  ROC-AUC: {roc_auc_score(y_test_r, y_prob_r):.4f}")

# Feature importances
importances = pd.Series(rage_model.feature_importances_, index=RAGE_FEATURES)
print(f"\n  Top feature importances:\n{importances.sort_values(ascending=False).to_string()}")

# Cross-validation
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
cv_scores = cross_val_score(rage_model, X_rage, y_rage, cv=cv, scoring='roc_auc', n_jobs=-1)
print(f"\n  5-Fold CV ROC-AUC: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

# Save model
joblib.dump(rage_model, 'rage_model.pkl')
print("  [OK] rage_model.pkl saved")

# ─────────────────────────────────────────────
# 5. TRAIN ADDICTION MODEL (Gradient Boosting)
# ─────────────────────────────────────────────
print("\n[4/6] Training Addiction Model (Gradient Boosting)...")

# Drop rows where addiction_category is NaN (edge of bins)
mask = df['addiction_category'].notna()
X_add = df.loc[mask, ADDICTION_FEATURES].copy()
y_add_raw = df.loc[mask, 'addiction_category'].copy()

X_add = X_add.fillna(X_add.median())

# Encode labels
le = LabelEncoder()
y_add = le.fit_transform(y_add_raw)
print(f"  Label encoding: {dict(zip(le.classes_, le.transform(le.classes_)))}")

X_train_a, X_test_a, y_train_a, y_test_a = train_test_split(
    X_add, y_add, test_size=0.2, random_state=RANDOM_STATE, stratify=y_add
)

addiction_model = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    min_samples_leaf=5,
    n_jobs=-1,
    random_state=RANDOM_STATE,
    class_weight='balanced'
)

addiction_model.fit(X_train_a, y_train_a)

# Evaluation
y_pred_a = addiction_model.predict(X_test_a)
print("\n  === ADDICTION MODEL RESULTS ===")
print(classification_report(y_test_a, y_pred_a, target_names=le.classes_))

# Save model + label encoder
joblib.dump(addiction_model, 'addiction_model.pkl')
joblib.dump(le, 'addiction_label_encoder.pkl')
print("  [OK] addiction_model.pkl saved")
print("  [OK] addiction_label_encoder.pkl saved")

# ─────────────────────────────────────────────
# 6. QUICK SANITY CHECK — test a prediction
# ─────────────────────────────────────────────
print("\n[5/6] Sanity check — running a test prediction...")

test_input_rage = pd.DataFrame([{
    'stress_level': 8,
    'anxiety_score': 7.5,
    'daily_gaming_hours': 6.0,
    'toxic_exposure': 0.8,
    'night_gaming_ratio': 0.7,
    'weekly_sessions': 25,
    'sleep_hours': 5.0,
    'loneliness_score': 7.0
    # aggression_score intentionally excluded — not a model feature
}])

test_input_add = pd.DataFrame([{
    'daily_gaming_hours': 6.0,
    'weekly_sessions': 25,
    'night_gaming_ratio': 0.7,
    'sleep_hours': 5.0,
    'loneliness_score': 7.0,
    'social_interaction_score': 3.0,
    'microtransactions_spending': 50.0,
    'years_gaming': 5,
    'happiness_score': 4.0,
    'depression_score': 6.0
}])

rage_prob = rage_model.predict_proba(test_input_rage)[0][1]
rage_pred = rage_model.predict(test_input_rage)[0]
add_pred_encoded = addiction_model.predict(test_input_add)[0]
add_probs = addiction_model.predict_proba(test_input_add)[0]
add_category = le.inverse_transform([add_pred_encoded])[0]

print(f"  Test rage probability: {rage_prob:.4f} | Prediction: {'RAGE' if rage_pred else 'SAFE'}")
print(f"  Test addiction category: {add_category}")
print(f"  Addiction probabilities: {dict(zip(le.classes_, add_probs.round(3)))}")

print("\n[6/6] All models trained and saved successfully!")
print("=" * 60)
print("Files created:")
for f in ['rage_model.pkl', 'addiction_model.pkl', 'addiction_label_encoder.pkl',
          'rage_features.json', 'addiction_features.json']:
    size = os.path.getsize(f) / 1024 if os.path.exists(f) else 0
    print(f"  {f}: {size:.1f} KB")
print("=" * 60)
print("Next step: Start the FastAPI backend (backend/main.py)")
