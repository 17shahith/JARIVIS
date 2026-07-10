# J.A.R.V.I.S. AI Assistant - Full-Stack Neural Interface

J.A.R.V.I.S. (Just A Rather Very Intelligent System) v5.0 is an advanced, modular personal assistant featuring a futuristic, dynamic glassmorphic frontend HUD and a robust Node.js/Express backend integrated with local AI services (Ollama Qwen/Gemma/Phi-3), Spotify Web API controls, weather feeds, and system diagnostics.

---

## Folder Structure

```
JARVIS/
├── frontend/
│   ├── index.html          # Landing Redirect Portal
│   ├── login.html          # Secure Identity Auth UI
│   ├── dashboard.html      # Neural Interface HUD Page
│   ├── css/
│   │   ├── style.css       # Core variables & shared layouts
│   │   ├── dashboard.css   # Floating panels & widgets spacing
│   │   ├── animations.css  # Orbital ring & core pulses
│   │   └── responsive.css  # Scaling configurations
│   └── js/
│       ├── api.js          # Centralized apiRequest helper
│       ├── auth.js         # Active session guards
│       ├── ui.js           # 3D canvas backdrop & reminders
│       ├── animations.js   # Sine diagnostics wave graph
│       ├── speech.js       # Speech synthesis & recognition
│       ├── weather.js      # Weather synchronized widget
│       ├── spotify.js      # Spotify web player mappings
│       └── app.js          # Command processor & AI portal
├── backend/
│   ├── server.js           # Server runner & database connector
│   ├── app.js              # Express app routing & middlewares
│   ├── config/             # Database connection setups
│   ├── models/             # Database Schemas (User, Memory)
│   ├── routes/             # Sub-routing endpoints (Auth, AI, Spotify, etc.)
│   ├── controllers/        # Route controllers
│   ├── services/           # Backend Business logic
│   ├── middleware/         # Security & error verification
│   └── python/             # Python background services
├── backup_old/             # Temporary folder housing original files
├── .env                    # System parameters & secrets
├── requirements.txt        # Python package dependencies
├── package.json            # Node modules configuration
└── README.md               # User documentation
```

---

## Installation & Setup

### 1. Environment Configurations
Rename `.env` or fill out the placeholder values:
- Set up a strong `JWT_SECRET` and `SESSION_SECRET`.
- Fill in your `SPOTIPY_CLIENT_ID` and `SPOTIPY_CLIENT_SECRET` (if not preconfigured).
- Ensure your MongoDB Atlas URL is populated in `MONGODB_URI`.

### 2. Install Node.js Dependencies
Navigate to the project root and run:
```bash
npm install
```

### 3. Install Python Dependencies
Activate your virtual environment and install the required modules:
```bash
.\.venv\Scripts\activate
pip install -r requirements.txt
```

---

## How to Run

### 1. Run Ollama
Make sure your local Ollama is running and has Qwen 2.5 downloaded:
```bash
ollama run qwen2.5:1.5b
```

### 2. Start the Backend Server
Run the following script to boot Node.js:
```bash
npm run dev
```
The server will bind to `http://localhost:8888/`.

### 3. Access the Frontend
Open your browser and navigate to **[http://localhost:8888/](http://localhost:8888/)**. 
It will redirect you to the login screen. You can log in using:
- **Username**: `jarvis`
- **Passcode**: `admin`
*(Note: If MongoDB is connected, you can register a new custom account using the registry button!)*

---

## Supported AI Models
By default, the J.A.R.V.I.S. neural network searches for:
- **Qwen 2.5 (1.5B)** - Default concise language model.
- **Phi-3 (3.8B)** - For complex local reasoning tasks.
- **Gemma 3 (1B)** - Light, high-performance CPU inference.
*(These models can be easily toggled on the fly from the System Configuration widget on the sidebar).*

---

## Python Sub-Services
The backend Python modules reside in `backend/python/` and can be run independently:
- **Speech recognition and TTS**: `python backend/python/speech.py --speak "Sir, I am listening."`
- **Wake Word detection**: `python backend/python/wakeword.py`
- **OpenCV Face Tracking**: `python backend/python/vision.py`
- **PyAutoGUI Automation list**: `python backend/python/automation.py`
