from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
import numpy as np
from collections import defaultdict

app = Flask(__name__)
CORS(app)

# Database file paths
USERS_DB = 'users_db.json'
RATINGS_DB = 'ratings_db.json'
RECOMMENDATIONS_DB = 'recommendations_db.json'

# Initialize databases
def init_databases():
    if not os.path.exists(USERS_DB):
        with open(USERS_DB, 'w') as f:
            json.dump({}, f)
    
    if not os.path.exists(RATINGS_DB):
        with open(RATINGS_DB, 'w') as f:
            json.dump({}, f)
    
    if not os.path.exists(RECOMMENDATIONS_DB):
        with open(RECOMMENDATIONS_DB, 'w') as f:
            json.dump({}, f)

# Load data from JSON files
def load_json(filename):
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except:
        return {}

# Save data to JSON files
def save_json(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

# Calculate similarity between two movies based on genres and ratings
def calculate_movie_similarity(movie1, movie2, all_movies):
    if str(movie1) not in all_movies or str(movie2) not in all_movies:
        return 0
    
    m1 = all_movies[str(movie1)]
    m2 = all_movies[str(movie2)]
    
    # Genre similarity
    genres1 = set(m1.get('genres', []))
    genres2 = set(m2.get('genres', []))
    
    if not genres1 or not genres2:
        return 0
    
    genre_similarity = len(genres1 & genres2) / len(genres1 | genres2)
    
    # Rating similarity (normalized)
    rating1 = m1.get('rating', 5) / 10
    rating2 = m2.get('rating', 5) / 10
    rating_diff = 1 - abs(rating1 - rating2)
    
    # Combined similarity
    return (genre_similarity * 0.7) + (rating_diff * 0.3)

# Get user-based recommendations
def get_user_based_recommendations(user_email, limit=10):
    ratings_db = load_json(RATINGS_DB)
    users_db = load_json(USERS_DB)
    
    if user_email not in ratings_db:
        return []
    
    user_ratings = ratings_db[user_email]
    user_rated_movies = set(user_ratings.keys())
    
    # Find similar users (users who rated same movies)
    similar_users = []
    for other_user, other_ratings in ratings_db.items():
        if other_user == user_email:
            continue
        
        common_movies = set(other_ratings.keys()) & user_rated_movies
        if len(common_movies) > 0:
            # Calculate similarity based on rating overlap
            avg_diff = np.mean([abs(user_ratings[m] - other_ratings[m]) for m in common_movies])
            similarity = 1 - (avg_diff / 10)
            similar_users.append((other_user, similarity))
    
    similar_users.sort(key=lambda x: x[1], reverse=True)
    
    # Get recommendations from similar users
    recommendations = defaultdict(float)
    for similar_user, similarity in similar_users[:5]:
        similar_user_ratings = ratings_db[similar_user]
        for movie_id, rating in similar_user_ratings.items():
            if movie_id not in user_rated_movies:
                recommendations[movie_id] += similarity * rating
    
    # Sort and return top recommendations
    sorted_recs = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)
    return [movie_id for movie_id, score in sorted_recs[:limit]]

# Get content-based recommendations
def get_content_based_recommendations(user_email, all_movies, limit=10):
    ratings_db = load_json(RATINGS_DB)
    
    if user_email not in ratings_db:
        return []
    
    user_ratings = ratings_db[user_email]
    user_rated_movies = set(user_ratings.keys())
    
    # Find highly rated movies by user
    high_rated = [m for m, r in user_ratings.items() if r >= 7]
    
    if not high_rated:
        return []
    
    # Calculate similarity with all other movies
    movie_scores = defaultdict(float)
    for rated_movie in high_rated:
        for candidate_movie in all_movies.keys():
            if candidate_movie not in user_rated_movies:
                similarity = calculate_movie_similarity(rated_movie, candidate_movie, all_movies)
                movie_scores[candidate_movie] += similarity * user_ratings.get(rated_movie, 5)
    
    # Sort and return top recommendations
    sorted_recs = sorted(movie_scores.items(), key=lambda x: x[1], reverse=True)
    return [movie_id for movie_id, score in sorted_recs[:limit]]

# API Endpoints

@app.route('/api/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.json
    email = data.get('email')
    name = data.get('name')
    password = data.get('password')
    
    if not email or not name or not password:
        return jsonify({'success': False, 'message': 'Missing fields'}), 400
    
    users_db = load_json(USERS_DB)
    
    if email in users_db:
        return jsonify({'success': False, 'message': 'User already exists'}), 400
    
    users_db[email] = {
        'name': name,
        'password': password,
        'created_at': datetime.now().isoformat()
    }
    
    save_json(USERS_DB, users_db)
    ratings_db = load_json(RATINGS_DB)
    ratings_db[email] = {}
    save_json(RATINGS_DB, ratings_db)
    
    return jsonify({'success': True, 'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    """Verify user login"""
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    users_db = load_json(USERS_DB)
    
    if email not in users_db or users_db[email]['password'] != password:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
    
    return jsonify({
        'success': True,
        'user': {
            'email': email,
            'name': users_db[email]['name']
        }
    }), 200

@app.route('/api/rate-movie', methods=['POST'])
def rate_movie():
    """Rate a movie"""
    data = request.json
    user_email = data.get('email')
    movie_id = data.get('movie_id')
    rating = data.get('rating')
    
    if not user_email or not movie_id or rating is None:
        return jsonify({'success': False, 'message': 'Missing fields'}), 400
    
    if not (0 <= rating <= 10):
        return jsonify({'success': False, 'message': 'Rating must be 0-10'}), 400
    
    ratings_db = load_json(RATINGS_DB)
    
    if user_email not in ratings_db:
        ratings_db[user_email] = {}
    
    ratings_db[user_email][str(movie_id)] = rating
    save_json(RATINGS_DB, ratings_db)
    
    return jsonify({'success': True, 'message': 'Rating saved'}), 200

@app.route('/api/recommendations/<user_email>/<method>', methods=['GET'])
def get_recommendations(user_email, method='hybrid'):
    """Get recommendations for a user"""
    all_movies = request.args.get('movies', '{}')
    try:
        all_movies = json.loads(all_movies)
    except:
        all_movies = {}
    
    limit = int(request.args.get('limit', 10))
    
    if method == 'collaborative':
        recommendations = get_user_based_recommendations(user_email, limit)
    elif method == 'content':
        recommendations = get_content_based_recommendations(user_email, all_movies, limit)
    else:  # hybrid
        collab_recs = get_user_based_recommendations(user_email, limit // 2)
        content_recs = get_content_based_recommendations(user_email, all_movies, limit // 2)
        recommendations = collab_recs + content_recs
    
    return jsonify({
        'success': True,
        'recommendations': recommendations,
        'method': method
    }), 200

@app.route('/api/user-ratings/<user_email>', methods=['GET'])
def get_user_ratings(user_email):
    """Get all ratings for a user"""
    ratings_db = load_json(RATINGS_DB)
    
    if user_email not in ratings_db:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    return jsonify({
        'success': True,
        'ratings': ratings_db[user_email]
    }), 200

@app.route('/api/trending-genres', methods=['GET'])
def get_trending_genres():
    """Get trending genres based on ratings"""
    ratings_db = load_json(RATINGS_DB)
    all_movies = request.args.get('movies', '{}')
    
    try:
        all_movies = json.loads(all_movies)
    except:
        all_movies = {}
    
    genre_scores = defaultdict(list)
    
    for user_email, ratings in ratings_db.items():
        for movie_id, rating in ratings.items():
            if str(movie_id) in all_movies:
                genres = all_movies[str(movie_id)].get('genres', [])
                for genre in genres:
                    genre_scores[genre].append(rating)
    
    # Calculate average rating per genre
    genre_avg = {genre: np.mean(ratings) for genre, ratings in genre_scores.items()}
    sorted_genres = sorted(genre_avg.items(), key=lambda x: x[1], reverse=True)
    
    return jsonify({
        'success': True,
        'genres': [{'name': g, 'score': s} for g, s in sorted_genres]
    }), 200

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'alive', 'service': 'Netflims Recommendation Engine'}), 200

if __name__ == '__main__':
    init_databases()
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
