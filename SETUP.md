# RunFuel Setup Guide

## Prerequisites Installation

### 1. Install MySQL

**Windows:**
- Download MySQL Community Server from [mysql.com](https://dev.mysql.com/downloads/mysql/)
- Run the installer and follow the setup wizard
- Remember your root password
- Start MySQL Server (should auto-start after installation)

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### 2. Create Database

```bash
mysql -u root -p
# Enter your password when prompted
```

```sql
CREATE DATABASE runfuel;
EXIT;
```

### 3. Update Backend .env

Edit `backend/.env` and update your MySQL credentials:

```env
MYSQL_USER=root
MYSQL_PASSWORD=your_actual_password_here
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=runfuel
```

## Backend Setup

### 1. Navigate to backend
```bash
cd backend
```

### 2. Activate virtual environment

**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 3. Run database migrations
```bash
alembic upgrade head
```

This will create all tables:
- `users`
- `user_profiles`
- `calorie_logs`
- `food_entries`
- `progress_summaries`
- `refresh_tokens`

### 4. Start backend server
```bash
uvicorn app.main:app --reload
```

Backend runs at: [http://localhost:8000](http://localhost:8000)
API docs at: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

## Frontend Setup

### 1. Open new terminal and navigate to frontend
```bash
cd frontend
```

### 2. Start dev server
```bash
npm run dev
```

Frontend runs at: [http://localhost:5173](http://localhost:5173)

## Testing the Application

### 1. Register a new user
- Go to [http://localhost:5173](http://localhost:5173)
- Click "Create account"
- Enter email and password (min 8 chars)

### 2. Complete onboarding
- **Step 1**: Enter body metrics (age, gender, height, weight)
- **Step 2**: Set running profile (frequency, intensity)
- **Step 3**: Choose goal (Deficit, Performance, or Bulking)

### 3. Use the dashboard
- View daily calorie target (auto-calculated from your profile)
- Log food with photo (requires OpenAI API key)
- Log food manually
- View progress and streaks

## OpenAI API Key Setup

The AI photo analysis feature requires an OpenAI API key:

1. Get a key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Update `backend/.env`:
   ```env
   OPENAI_API_KEY=sk-proj-your-key-here
   ```
3. Restart the backend server

## Troubleshooting

### MySQL Connection Refused
- Verify MySQL is running: `mysql -u root -p`
- Check port 3306 is open
- Verify credentials in `.env`

### Alembic Migration Fails
- Ensure database exists: `CREATE DATABASE runfuel;`
- Check MySQL user has permissions
- Try: `alembic downgrade base` then `alembic upgrade head`

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL=http://localhost:8000` in `frontend/.env`
- Check backend is running on port 8000
- Check CORS settings in `backend/app/main.py`

### OpenAI API Errors
- Verify API key is valid
- Check you have credits: [platform.openai.com/usage](https://platform.openai.com/usage)
- Model `gpt-4o` requires API access (may need to upgrade from free tier)

## Project Structure Summary

```
calories/
├── backend/               # Python FastAPI backend
│   ├── app/
│   │   ├── main.py       # App entry point
│   │   ├── config.py     # Settings (reads .env)
│   │   ├── database.py   # Async SQLAlchemy
│   │   ├── models/       # 6 database models
│   │   ├── routers/      # 5 API routers (auth, users, food, calories, progress)
│   │   ├── services/     # 6 service modules (business logic)
│   │   ├── schemas/      # Pydantic models
│   │   └── utils/        # Calorie math (BMR, TDEE, goals)
│   └── alembic/          # DB migrations
│
└── frontend/              # React TypeScript frontend
    └── src/
        ├── App.tsx        # React Router setup
        ├── api/           # Axios client + endpoints
        ├── components/    # Reusable components (ProgressRing, FoodCard, layouts)
        ├── features/      # 6 feature modules
        ├── store/         # 3 Zustand stores
        └── types/         # TypeScript interfaces
```

## Key Features to Test

1. **Authentication**
   - Register → Login → Auto-redirect to onboarding/dashboard
   - Logout → Clears tokens
   - Token refresh (automatic on API 401)

2. **Calorie Engine**
   - Profile calculates BMR (Mifflin-St Jeor)
   - TDEE based on running frequency + intensity
   - Goal modifiers: Deficit (-400), Performance (±0), Bulking (+400)
   - Safety rules prevent aggressive deficits

3. **Food Logging**
   - AI Photo: Upload → Analyze → Review → Confirm
   - Manual: Quick entry with macros
   - Dashboard updates in real-time
   - Delete entries, toggle favorites

4. **Progress Tracking**
   - Weekly summaries
   - Current & longest streaks
   - 30-day consistency score
   - Recharts visualizations

## Next Steps

### For Development
- Add unit tests (see `backend/tests/`)
- Implement forgot-password email flow
- Add food database with search
- Implement race-day fueling mode
- Add Strava/Garmin integration

### For Production
- Set up Railway for backend + MySQL
- Deploy frontend to Vercel
- Add Sentry for error tracking
- Implement photo storage (S3/Cloudinary)
- Add email service (SendGrid/Resend)

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **ReDoc**: [http://localhost:8000/api/redoc](http://localhost:8000/api/redoc)

## Support

For issues, check:
1. Backend logs (terminal where uvicorn is running)
2. Frontend console (browser DevTools)
3. Network tab (browser DevTools) for API errors
4. MySQL logs

---

**Happy fueling! 🏃‍♂️💚**
