# RunFuel — AI Calories Tracker for Runners

**Fuel smarter. Run stronger.**

RunFuel is an AI-powered nutrition companion for runners that helps you fuel with intent, not just count calories.

## Features

- **Goal-Based Calorie Strategy**: Choose between Deficit, Performance, or Bulking with runner-specific calculations
- **AI Photo Food Logging**: Snap a photo and let OpenAI Vision identify food items, portions, and calories
- **Manual Food Logging**: Quick manual entry with macro tracking
- **Smart Daily Dashboard**: Visual progress ring showing target, consumed, and remaining calories
- **Progress Tracking**: Weekly summaries, streak tracking, and consistency scores
- **Safety Rules**: Automatic adjustments on long-run days and high-mileage weeks

## Tech Stack

- **Backend**: Python 3.12 + FastAPI (async)
- **Database**: MySQL with async SQLAlchemy + Alembic migrations
- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS v4
- **State**: Zustand | **Forms**: react-hook-form + Zod | **Charts**: Recharts
- **AI**: OpenAI Vision API (gpt-4o)
- **Deployment**: Vercel (frontend) + Railway (backend + MySQL)

## Project Structure

```
calories/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py      # FastAPI app entry point
│   │   ├── models/      # SQLAlchemy ORM models
│   │   ├── schemas/     # Pydantic request/response schemas
│   │   ├── routers/     # API route handlers
│   │   ├── services/    # Business logic
│   │   ├── core/        # Security, rate limiting, exceptions
│   │   └── utils/       # Calorie calculation engine
│   ├── alembic/         # Database migrations
│   └── tests/
│
└── frontend/            # React frontend
    └── src/
        ├── api/         # Axios client with JWT refresh
        ├── components/  # Reusable UI components
        ├── features/    # Feature-based modules
        ├── store/       # Zustand stores
        └── types/       # TypeScript interfaces
```

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- MySQL 8.0+

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:
   - `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` (your MySQL credentials)
   - `JWT_SECRET_KEY` (generate with: `python -c "import secrets; print(secrets.token_hex(32))"`)
   - `OPENAI_API_KEY` (your OpenAI API key)
   - `FRONTEND_URL` (default: `http://localhost:5173`)

5. **Create database:**
   ```bash
   mysql -u root -p
   CREATE DATABASE runfuel;
   ```

6. **Run migrations:**
   ```bash
   alembic upgrade head
   ```

7. **Start backend server:**
   ```bash
   uvicorn app.main:app --reload
   ```

   Backend will run at `http://localhost:8000`
   API docs at `http://localhost:8000/api/docs`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:
   - `VITE_API_URL=http://localhost:8000`

4. **Start frontend dev server:**
   ```bash
   npm run dev
   ```

   Frontend will run at `http://localhost:5173`

## Usage

1. **Register**: Create an account at `/register`
2. **Onboarding**: Complete 3-step profile setup (body metrics → running profile → goal)
3. **Dashboard**: View daily calorie target, consumed, and remaining
4. **Log Food**:
   - Photo: Take/upload a photo → AI analyzes → review & confirm
   - Manual: Enter food name, portion, calories, and macros
5. **Progress**: Track weekly summaries, streaks, and consistency

## Calorie Calculation

### BMR (Basal Metabolic Rate)
Uses Mifflin-St Jeor equation:
- **Male**: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
- **Female**: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161

### TDEE (Total Daily Energy Expenditure)
BMR × Activity Multiplier (based on running frequency + intensity)

### Goal Modifiers
- **Deficit**: TDEE - 400 kcal
- **Performance**: TDEE ± 0 kcal
- **Bulking**: TDEE + 400 kcal

### Safety Rules
1. No aggressive deficit on long-run days (cap at -200 kcal)
2. Reduce deficit by half on high-mileage weeks (>60km)
3. Never go below intake floor (Male: 1500, Female: 1200)

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` — Create account
- `POST /api/v1/auth/login` — Login (get tokens)
- `POST /api/v1/auth/refresh` — Refresh access token
- `POST /api/v1/auth/logout` — Logout (revoke token)

### Users
- `GET /api/v1/users/me` — Get current user + profile
- `PUT /api/v1/users/me/profile` — Create/update profile
- `PATCH /api/v1/users/me/goal` — Change goal

### Food
- `POST /api/v1/food/analyze-photo` — Upload photo for AI analysis
- `POST /api/v1/food/confirm-analysis` — Confirm AI results
- `POST /api/v1/food/manual` — Manual food entry
- `GET /api/v1/food/search?q=` — Search past foods
- `GET /api/v1/food/favorites` — Get favorites
- `POST /api/v1/food/favorites/{id}` — Toggle favorite

### Calories
- `GET /api/v1/calories/today` — Get today's log
- `GET /api/v1/calories/date/{date}` — Get specific date
- `GET /api/v1/calories/range?start=&end=` — Get date range
- `PUT /api/v1/calories/entry/{id}` — Update entry
- `DELETE /api/v1/calories/entry/{id}` — Delete entry

### Progress
- `GET /api/v1/progress/weekly` — Weekly summary
- `GET /api/v1/progress/monthly` — Monthly summary
- `GET /api/v1/progress/streak` — Current & longest streak
- `GET /api/v1/progress/consistency` — Consistency score

## Deployment

### Backend (Railway)

1. Connect GitHub repo
2. Add MySQL service
3. Set environment variables (see `.env.example`)
4. Deploy — Railway will use `Procfile`
5. Run migrations: `alembic upgrade head`

### Frontend (Vercel)

1. Connect GitHub repo
2. Set root directory: `frontend/`
3. Set environment variable: `VITE_API_URL=https://your-backend.up.railway.app`
4. Deploy — Vercel will use `vercel.json` for routing

## Security

- ✅ Passwords hashed with Argon2
- ✅ JWT access tokens (15min) + refresh tokens (7 days)
- ✅ Refresh token rotation with reuse detection
- ✅ OpenAI API key backend-only (never exposed to frontend)
- ✅ CORS restricted to frontend origin only
- ✅ Rate limiting on auth endpoints

## Contributing

This is a product demonstration project built for the RunFuel app concept.

## License

MIT

---

**Built with Claude Code** 🤖
