**PROJECT DECISIONS AND TECHNICAL DESIGN**
**Adaptive Gamer Coaching System – Comprehensive Development Context**

This document presents the major technical decisions made during the development of the Adaptive Gamer Coaching System and provides the rationale behind the chosen architecture, machine learning models, deployment strategy, and user interface design.

---------------------------------------------------------------------

**1. DATASET SELECTION AND PROBLEM DEFINITION**

**1.1 Dataset Selection**

The proposed system is built using the Global Gaming Mental Health Survey (GGMHS) consisting of approximately 1,000,000 records. This dataset was selected because it combines traditional gaming behavior metrics such as session duration, gaming frequency, and night-time gaming patterns with psychological self-assessment indicators such as stress, anxiety, and depression scores. This combination enables the development of behavioral prediction models rather than simple gameplay analytics.

**Technical Decision:**

Instead of training on the complete dataset, a stratified sample of 200,000 records was selected for model development.

**Rationale:**

Initial experimentation showed that training on the full dataset improved model performance by less than 0.5% in ROC-AUC score, while increasing computational cost and training time significantly. The 200,000-record stratified sample provided an optimal balance between statistical reliability, model performance, and computational efficiency.

---------------------------------------------------------------------

**1.2 Label Engineering**

Since behavioral states such as rage quitting and gaming addiction are not directly available as labels, custom ground-truth labels were created.

**Rage-Quit Label (Binary Classification):**

A player is classified as a rage-quit candidate when:

• Stress Level ≥ 7  
• Behavioral frustration indicators exceed predefined thresholds

**Addiction Label (Multi-Class Classification):**

Addiction levels are categorized into:

• Low Risk  
• Medium Risk  
• High Risk

based on long-term behavioral indicators available in the survey.

**Technical Decision:**

Certain directly correlated variables were excluded during training to avoid biased learning.

**Rationale:**

Including highly correlated behavioral indicators as input features could lead to a tautological model where predictions simply replicate predefined thresholds. By excluding such features, the machine learning models are forced to identify independent behavioral correlations from factors such as sleep quality, gaming duration, emotional consistency, and recovery behavior.

---------------------------------------------------------------------

**2. MACHINE LEARNING ARCHITECTURE**

**2.1 Transition from API-Based Tracking to Behavioral Modeling**

The initial project concept focused on live gameplay analysis using gaming APIs. However, the implementation was later shifted toward behavioral prediction using static datasets.

**Technical Decision:**

The project was redesigned from a real-time Riot API tracker to a game-independent behavioral intelligence system.

**Rationale:**

Production access for gaming APIs requires approval and may introduce development delays. By using behavioral modeling, the system becomes independent of specific games and can be applied across multiple competitive gaming environments such as Valorant, League of Legends, and Counter-Strike. This approach also enables deeper psychological analysis beyond win/loss statistics.

---------------------------------------------------------------------

**2.2 Algorithm Selection**

**Random Forest for Rage-Quit Prediction**

**Technical Decision:**

The Random Forest Classifier was selected for rage-quit prediction.

**Rationale:**

Rage quitting is typically influenced by short-term emotional triggers such as:

• Consecutive losses  
• Performance decline  
• Impulsive retry behavior  
• Stress spikes

Random Forest effectively captures non-linear behavioral patterns and handles imbalanced emotional event data while also providing feature importance rankings for model interpretability.

**Gradient Boosting for Addiction Prediction**

**Technical Decision:**

The Gradient Boosting Classifier was selected for addiction risk classification.

**Rationale:**

Gaming addiction is influenced by long-term behavioral dependencies involving multiple interacting factors such as:

• Daily gaming hours  
• Night-time gaming habits  
• Sleep irregularity  
• Recovery behavior

Gradient Boosting performs well on multi-class classification and can accurately distinguish between medium-risk and high-risk behavioral patterns.

---------------------------------------------------------------------

**3. DEPLOYMENT STRATEGY**

**3.1 Model Deployment Approach**

**Technical Decision:**

The project initially explored lightweight deployment formats but was ultimately deployed using standard Scikit-Learn serialized .pkl models.

**Rationale:**

Although lightweight model formats offered deployment advantages, they introduced additional conversion complexity during retraining. For academic development and research purposes, using .pkl models provides:

• Easier model retraining  
• Transparent inspection of model structure  
• Better compatibility with Python-based research tools  
• Simplified backend integration

This approach prioritizes extensibility, reproducibility, and educational accessibility.

---------------------------------------------------------------------

**4. FRONTEND DESIGN AND USER EXPERIENCE**

**4.1 Simulated Player Database**

**Technical Decision:**

A simulated player search system containing over 100 behavioral profiles was implemented.

**Rationale:**

Since live API integration is not yet available, a simulated player database was created to demonstrate how the platform would function in real-world deployment. A deterministic seed-based generation approach ensures that the same player identifier always produces consistent behavioral statistics, simulating real database caching.

---------------------------------------------------------------------

**4.2 Visual Design Language**

**Technical Decision:**

A high-contrast gaming-inspired user interface was designed.

**Rationale:**

The visual design was intentionally aligned with modern gaming dashboards to improve user engagement and familiarity. The interface uses:

• Dark theme layouts  
• Interactive radar charts  
• Behavioral trend graphs  
• Responsive analytics panels

This design improves readability and aligns with the performance-oriented gaming environment.

---------------------------------------------------------------------

**4.3 Cross-Origin Communication**

**Technical Decision:**

Cross-Origin Resource Sharing (CORS) was enabled during development.

**Rationale:**

The frontend and backend operate on different local ports during development. Enabling CORS ensures smooth communication between the React frontend and FastAPI backend without connectivity restrictions.

---------------------------------------------------------------------

**5. SUMMARY OF TECHNICAL STACK**

**Component: Backend**  
Technology Used: FastAPI  
Reason for Selection: High performance, asynchronous support, strong data validation

**Component: Machine Learning**  
Technology Used: Scikit-Learn  
Reason for Selection: Standardized training, model interpretability, easy serialization

**Component: Frontend**  
Technology Used: React with Vite  
Reason for Selection: Fast development, modular architecture, responsive UI

**Component: Styling**  
Technology Used: Tailwind CSS  
Reason for Selection: Flexible custom design and responsive layouts

**Component: Visualization**  
Technology Used: Recharts  
Reason for Selection: Interactive and scalable behavioral charts

**Component: Data Processing**  
Technology Used: Pandas, NumPy  
Reason for Selection: Efficient data manipulation and preprocessing

**Component: Model Storage**  
Technology Used: Pickle (.pkl)  
Reason for Selection: Easy deployment and retraining

---------------------------------------------------------------------

The above technical decisions collectively ensure that the Adaptive Gamer Coaching System remains scalable, interpretable, academically reproducible, and capable of evolving into a real-time behavioral intelligence platform for future gaming environments.
