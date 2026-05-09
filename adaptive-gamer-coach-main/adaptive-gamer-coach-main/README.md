# ⚡ Adaptive Gamer Coaching System
### Behavioral Intelligence for Gamers | Review 3 submission

A high-tech dashboard that predicts **Rage-Quit Risk** and **Gaming Addiction** using Artificial Intelligence.

---

## 🚀 Easy Setup Guide (Beginner Friendly)

To run this project, you need to open **TWO terminal windows** side-by-side.

### 1. Clone the Project
Open your first terminal and paste this:
```bash
git clone https://github.com/Butcherboy7/adaptive-gamer-coach.git
cd adaptive-gamer-coach
```

---

### 2. Start the Backend (The AI Engine)
**In Terminal 1**, run these commands:

1. **Install the tools:**
   ```bash
   pip install -r requirements.txt
   ```
2. **Start the server:**
   ```bash
   python backend/main.py
   ```
*✅ **What to look for:** You should see a message saying `SUCCESS: All models loaded successfully`.*

---

### 3. Start the Frontend (The Visual Dashboard)
**Open a NEW terminal (Terminal 2)**, go to the project folder, and run:

1. **Enter the frontend folder:**
   ```bash
   cd frontend
   ```
2. **Install the visual tools:**
   ```bash
   npm install
   ```
3. **Launch the dashboard:**
   ```bash
   npm run dev
   ```
*✅ **What to look for:** A link will appear (e.g., http://localhost:5173). **Ctrl + Click** that link to open your dashboard!*

---

## 🎮 How to use the Dashboard

1.  **Manual Mode**: Use the sliders to adjust your stats (Stress, Sleep, etc.).
2.  **Riot Search**: Click the toggle at the top and type a name like `TenZ#NA1` or `Shroud#EUW`. 
3.  **Analyze**: Hit the big neon **ANALYZE PLAYER** button at the bottom to see your AI-generated coaching tips!

---

## 🛠️ It's Not Working? (Quick Fixes)

-   **"Command not found: pip"**: Try typing `pip3` or `python -m pip` instead.
-   **"Port 8000 is in use"**: This means the server is already running! You can just refresh your browser.
-   **"Models not loaded"**: If you see an error about missing files, make sure you are in the `adaptive-gamer-coach` root folder.

---

## 🎓 Academic Attribution
**Course**: GRIET Data Science - Review 3  
**Research**: Predicting Gamer Burnout via Behavioral Modeling  
**Project Lead**: Butcherboy7  
