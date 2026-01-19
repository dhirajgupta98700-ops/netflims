# Netflims - Recommendation Engine Setup

## Overview
This Netflims website now includes a Python-powered recommendation engine that suggests movies based on user ratings and viewing history.

## Features

### Recommendation Engine
- **Collaborative Filtering**: Recommends movies based on similar users' preferences
- **Content-Based Filtering**: Recommends movies similar to ones the user rated highly
- **Hybrid Approach**: Combines both methods for better recommendations
- **User Rating System**: Users can rate movies to improve recommendations
- **Trending Genres**: Analyzes popular genres across all users

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd "c:\Users\dhira\OneDrive\Desktop\Netflims"
pip install -r requirements.txt
```

### 2. Start the Python Backend Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

You should see:
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

### 3. Open the Website

Keep the Python server running in the terminal, then open `index.html` in your browser as usual.

## How It Works

### User Registration & Login
- Users register with email, name, and password
- Python backend stores user data securely
- Users can log in with their credentials

### Rating Movies
- After watching a movie, users can rate it (0-10)
- Ratings are sent to the Python backend
- Used to improve future recommendations

### Getting Recommendations
- After logging in, users see a "Recommended For You" section
- Shows 10 personalized movie recommendations
- Updates as users rate more movies

### Recommendation Methods

#### Collaborative Filtering
- Finds users with similar movie tastes
- Recommends movies those similar users liked
- Best for discovering new genres

#### Content-Based Filtering
- Analyzes genres and ratings of movies user liked
- Recommends similar movies
- Good for consistent preferences

#### Hybrid (Default)
- Combines both methods
- Better overall recommendations

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/register` | POST | Register new user |
| `/api/login` | POST | User login |
| `/api/rate-movie` | POST | Rate a movie |
| `/api/recommendations/<email>/<method>` | GET | Get recommendations |
| `/api/user-ratings/<email>` | GET | Get user's ratings |
| `/api/trending-genres` | GET | Get trending genres |
| `/api/health` | GET | Health check |

## Database Files

The backend creates three JSON files for data storage:

- `users_db.json` - User accounts and credentials
- `ratings_db.json` - Movie ratings by users
- `recommendations_db.json` - Cached recommendations

These are local files and persist between server restarts.

## Troubleshooting

### "Connection refused" Error
- Make sure Python backend is running: `python app.py`
- Server should be on `http://localhost:5000`
- Check if port 5000 is available

### No Recommendations Showing
- User must have rated at least a few movies first
- Wait 1-2 seconds after movies load for recommendations to appear
- Check browser console for errors (F12)

### Movies Not Loading
- Verify TMDB API key is valid
- Check internet connection
- Check browser console for API errors

## Future Enhancements

- [ ] Machine learning recommendations with scikit-learn
- [ ] Advanced user profiling
- [ ] Movie similarity matrix
- [ ] Real database (PostgreSQL/MongoDB)
- [ ] Authentication with JWT tokens
- [ ] User watchlist persistence
- [ ] Social recommendations
- [ ] Recommendation explanations

## Dependencies

- **Flask**: Web framework for Python backend
- **Flask-CORS**: Cross-origin support for frontend-backend communication
- **NumPy**: Mathematical operations for recommendation algorithms

## Notes

- The recommendation engine works best after users rate multiple movies
- Initial recommendations will be limited until more ratings are collected
- All data is stored locally in JSON files (suitable for development)
- For production, consider migrating to a real database
