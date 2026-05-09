# 📋 PROJECT DECISIONS & TECHNICAL DESIGN
## Adaptive Gamer Coaching System — Comprehensive Context

> **This document details every major technical choice made during development, justifying the "Why" behind the architecture.**

---

## 1. DATASET & PROBLEM DEFINITION

### The Dataset
We utilized the **Global Gaming Mental Health Survey (1.0M rows)**. This dataset is unique because it links session behavior (time played, night gaming) with psychological self-reports (anxiety, stress).
- **Decision**: We trained on a stratified sample of **200,000 rows**.
- **Rationale**: Training on the full 1.0M rows provided < 0.5% gain in ROC-AUC but increased training time by 400%. 200k rows hit the "sweet spot" of statistical significance and performance.

### The Label Logic
Since "Rage-Quitting" and "Addiction" are subjective, we had to engineer the ground-truth labels:
- **Rage-Quit (Binary)**: `stress_level >= 7` AND `aggression_score > 6.0`. 
- **Addiction (3-Class)**: Binned using the survey's pre-computed `addiction_level`.
- **Decision**: We **excluded** the `aggression_score` from the model's features.
- **Rationale**: Including it created a "tautological model" (the AI just learns to check the score against 6.0). Removing it forced the AI to learn correlation from independent signals like toxic exposure and sleep hours.

---

## 2. MACHINE LEARNING ARCHITECTURE

### Moving from Riot API to Behavioral Modeling
- **Decision**: We pivoted from a "Live Riot API Match Tracker" to a "Behavioral Risk Predictor."
- **Rationale**: Riot Game's Production API approval takes weeks. By focusing on behavioral modeling, we created a tool that is **game-agnostic** (works for Valorant, LoL, or CS) and provides deeper psychological insight than simple win/loss ratios.

### Algorithm Selection
- **Random Forest (Rage-Quit)**: Chosen for its ability to handle imbalanced classes (using `class_weight='balanced'`) and provide clear feature importance rankings.
- **Gradient Boosting (Addiction)**: Chosen for its superior handling of multi-class boundaries, effectively distinguishing between "Medium" and "High" risk levels.

---

## 3. DEPLOYMENT & THE ONNX EXPERIMENT

### The Scikit-Learn ↔ ONNX Pivot
- **Decision**: We initially migrated to **ONNX Runtime** for Vercel deployment but ultimately **reverted to Standard Scikit-Learn**.
- **Initial Choice (ONNX)**: Attempted to solve Vercel's 250MB Lambda limit.
- **Final Choice (Scikit-Learn/Local)**: 
    - **Rationale**: For this phase of the project, **Localhost performance and easy extensibility** are priorities. ONNX adds a complex conversion layer every time the model is retrained. 
    - **Outcome**: By prioritizing standard `.pkl` files, we ensure that students and researchers can easily retrain the models and inspect their internal trees using standard Python tools.

---

## 4. FRONTEND & UX INNOVATIONS

### 100+ Player Dummy Database
- **Decision**: Created a "Riot ID Search" system with a hardcoded database of 100+ players.
- **Rationale**: To demonstrate how the app would scale with a live database. 
- **The "Seeded Random" Trick**: We implemented a deterministic randomization hash based on the username. 
    - **Why?** A purely random generator would show different results every time you searched "TenZ#NA1". By seeding the randomizer with the username string, the app **simulates real caching**. It looks like it's fetching data from a real server because the stats for a specific user are always consistent.

### Visual Language
- **Theme**: Cyberpunk / High-Contrast Dark Mode.
- **Why?**: To match the high-performance "Gaming HUD" aesthetic. We used **Recharts (SVG-based)** instead of Canvas-based charts to ensure all data visualizations (Stats Radar, Addiction Meter) remain sharp and readable on high-refresh-rate monitors.

### CORS & Security
- **Decision**: Implemented `allow_origins=["*"]`.
- **Rationale**: To ensure seamless connectivity between the Vite frontend and FastAPI backend during local development across different ports (5173 vs 8000).

---

## 5. SUMMARY OF TECHNICAL STACK

| Component | Choice | Reason |
| :--- | :--- | :--- |
| **Backend** | FastAPI | High performance, async-ready, Pydantic validation. |
| **ML Engine**| Scikit-Learn | Standard industry library with robust `.pkl` support. |
| **Frontend** | React (Vite) | Fastest HMR for UI polishing; component-based architecture. |
| **Styling** | Tailwind CSS | Utility-first approach for custom Cyberpunk design tokens. |
| **Charts** | Recharts | React-native component API for responsive SVG charts. |
