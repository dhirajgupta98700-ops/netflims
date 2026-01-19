// TMDB API Configuration
const TMDB_API_KEY = '2c46251313f308e79b7251d3f0f3a72d'; // Your TMDB API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Recommendation Engine API
const RECOMMENDATION_API = 'http://localhost:5000/api';

// Application state
const movieCategories = {
    trending: [],
    upcoming: [],
    topRated: []
};

// App state for endpoint switching
const appState = {
    currentMode: 'home', // 'home', 'search', 'genre', or 'language'
    searchResults: [],
    currentSearchQuery: '',
    genreResults: [],
    currentGenreId: null,
    genreResults: [],
    currentLanguage: null,
    currentLanguageName: '',
    genres: []
};

let loadingState = false;

// DOM Elements
const trendingCarousel = document.getElementById('trendingCarousel');
const upcomingCarousel = document.getElementById('upcomingCarousel');
const topRatedCarousel = document.getElementById('topRatedCarousel');
const searchInput = document.getElementById('searchInput');

// Hero section elements
const heroSection = document.getElementById('heroSection');
const heroBackground = document.getElementById('heroBackground');
const heroTitle = document.getElementById('heroTitle');
const heroOverview = document.getElementById('heroOverview');
const heroPlayButton = document.getElementById('heroPlayButton');
const heroTrailerVideo = document.getElementById('heroTrailerVideo');
const controls = {
    trending: {
        prev: document.getElementById('trendingPrev'),
        next: document.getElementById('trendingNext')
    },
    upcoming: {
        prev: document.getElementById('upcomingPrev'),
        next: document.getElementById('upcomingNext')
    },
    topRated: {
        prev: document.getElementById('topRatedPrev'),
        next: document.getElementById('topRatedNext')
    }
};

const trailerModal = document.getElementById('trailerModal');
const closeModalBtn = document.getElementById('closeModal');
const trailerVideo = document.getElementById('trailerVideo');
const movieTitle = document.getElementById('movieTitle');
const movieRelease = document.getElementById('movieRelease');

// Genre and Indian cinema filter elements
const genreButtonsContainer = document.getElementById('genreButtons');
const indianButtonsContainer = document.getElementById('indianButtons');

// Authentication System with Auth Panel
const authPanel = document.getElementById('authPanel');
const websiteContent = document.getElementById('websiteContent');
const authPanelLoginForm = document.getElementById('authPanelLoginForm');
const authPanelSignupForm = document.getElementById('authPanelSignupForm');
const authPanelLoginTab = document.getElementById('authPanelLoginTab');
const authPanelSignupTab = document.getElementById('authPanelSignupTab');

// Login Modal Elements
const signInBtn = document.getElementById('signInBtn');
const loginModal = document.getElementById('loginModal');
const closeLoginModalBtn = document.getElementById('closeLoginModal');
const loginTabBtn = document.getElementById('loginTabBtn');
const registerTabBtn = document.getElementById('registerTabBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authTitle = document.getElementById('authTitle');
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const registerNameInput = document.getElementById('registerName');
const registerEmailInput = document.getElementById('registerEmail');
const registerPasswordInput = document.getElementById('registerPassword');
const registerConfirmPasswordInput = document.getElementById('registerConfirmPassword');
const rememberMeCheckbox = document.getElementById('rememberMe');

// Check user authentication on page load
function checkAuthentication() {
    const loggedInUser = localStorage.getItem('netflims_user');
    
    if (loggedInUser) {
        // User is already logged in
        const user = JSON.parse(loggedInUser);
        showWebsite(user);
    } else {
        // Show auth panel
        authPanel.style.display = 'flex';
        websiteContent.style.display = 'none';
        setupAuthPanel();
    }
}

// Show website content after successful login
function showWebsite(user) {
    authPanel.style.display = 'none';
    websiteContent.style.display = 'block';
    updateUIForLoggedInUser(user);
    
    // Load movies after website is displayed
    setTimeout(() => {
        fetchAllMovies();
        // Initialize recommendations after movies are loaded
        setTimeout(() => {
            initRecommendations();
        }, 1000);
    }, 100);
}

// Setup auth panel event listeners
function setupAuthPanel() {
    authPanelLoginTab.addEventListener('click', switchAuthPanelToLogin);
    authPanelSignupTab.addEventListener('click', switchAuthPanelToSignup);
    authPanelLoginForm.addEventListener('submit', handleAuthPanelLogin);
    authPanelSignupForm.addEventListener('submit', handleAuthPanelSignup);
}

function switchAuthPanelToLogin() {
    authPanelLoginTab.classList.add('active');
    authPanelSignupTab.classList.remove('active');
    authPanelLoginForm.classList.remove('hidden');
    authPanelSignupForm.classList.add('hidden');
}

function switchAuthPanelToSignup() {
    authPanelSignupTab.classList.add('active');
    authPanelLoginTab.classList.remove('active');
    authPanelSignupForm.classList.remove('hidden');
    authPanelLoginForm.classList.add('hidden');
}

function handleAuthPanelLogin(e) {
    e.preventDefault();
    const email = document.getElementById('authPanelEmail').value.trim();
    const password = document.getElementById('authPanelPassword').value;
    const rememberMe = document.getElementById('authPanelRememberMe').checked;
    const errorSpan = authPanelLoginForm.querySelector('.error-message');
    const messageSpan = authPanelLoginForm.querySelector('.auth-message');

    // Clear previous messages
    errorSpan.textContent = '';
    messageSpan.textContent = '';

    // Validation
    if (!email) {
        errorSpan.textContent = 'Email is required';
        return;
    }
    if (!isValidEmail(email)) {
        errorSpan.textContent = 'Please enter a valid email';
        return;
    }
    if (!password) {
        errorSpan.textContent = 'Password is required';
        return;
    }

    // Check credentials
    const users = getAllUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!user) {
        // Demo credentials
        if (email === 'demo@netflims.com' && password === 'Demo@123') {
            const demoUser = { name: 'Demo User', email: 'demo@netflims.com' };
            localStorage.setItem('netflims_user', JSON.stringify(demoUser));
            if (rememberMe) {
                localStorage.setItem('netflims_remember', 'true');
            }
            showWebsite(demoUser);
            return;
        }
        messageSpan.textContent = 'Invalid email or password. Demo: demo@netflims.com / Demo@123';
        messageSpan.style.color = '#e50914';
        return;
    }

    // Login success
    localStorage.setItem('netflims_user', JSON.stringify(user));
    if (rememberMe) {
        localStorage.setItem('netflims_remember', 'true');
    }
    showWebsite(user);
}

function handleAuthPanelSignup(e) {
    e.preventDefault();
    const name = document.getElementById('authPanelName').value.trim();
    const email = document.getElementById('authPanelSignupEmail').value.trim();
    const password = document.getElementById('authPanelSignupPassword').value;
    const confirmPassword = document.getElementById('authPanelConfirmPassword').value;
    const passwordStrength = authPanelSignupForm.querySelector('.password-strength');
    const messageSpan = authPanelSignupForm.querySelector('.auth-message');

    // Clear previous messages
    authPanelSignupForm.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    messageSpan.textContent = '';

    // Validation
    let hasError = false;
    const errors = authPanelSignupForm.querySelectorAll('.error-message');
    const errorArray = Array.from(errors);

    if (!name) {
        errorArray[0].textContent = 'Full name is required';
        hasError = true;
    } else if (name.length < 2) {
        errorArray[0].textContent = 'Name must be at least 2 characters';
        hasError = true;
    }

    if (!email) {
        errorArray[1].textContent = 'Email is required';
        hasError = true;
    } else if (!isValidEmail(email)) {
        errorArray[1].textContent = 'Please enter a valid email';
        hasError = true;
    } else if (emailExists(email)) {
        errorArray[1].textContent = 'This email is already registered';
        hasError = true;
    }

    if (!password) {
        errorArray[2].textContent = 'Password is required';
        hasError = true;
    } else if (password.length < 8) {
        errorArray[2].textContent = 'Password must be at least 8 characters';
        hasError = true;
    } else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
        errorArray[2].textContent = 'Password must contain uppercase, lowercase, and numbers';
        hasError = true;
    }

    if (!confirmPassword) {
        errorArray[3].textContent = 'Please confirm your password';
        hasError = true;
    } else if (password !== confirmPassword) {
        errorArray[3].textContent = 'Passwords do not match';
        hasError = true;
    }

    if (hasError) return;

    // Create new user
    const newUser = { name, email, password };
    const users = getAllUsers();
    users.push(newUser);
    saveUsers(users);

    // Auto-login after signup
    localStorage.setItem('netflims_user', JSON.stringify({ name, email }));
    messageSpan.textContent = 'Account created successfully! Welcome to Netflims.';
    messageSpan.style.color = '#90ee90';
    
    setTimeout(() => {
        showWebsite({ name, email });
    }, 1500);
}
async function fetchAllMovies() {
    try {
        loadingState = true;
        console.log('Fetching movies from TMDB...');
        
        // Check if carousel elements exist
        if (!trendingCarousel || !upcomingCarousel || !topRatedCarousel) {
            console.error('Carousel elements not found');
            return;
        }
        
        // Fetch all categories in parallel
        const [trendingRes, upcomingRes, topRatedRes, genresRes] = await Promise.all([
            fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`),
            fetch(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
            fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
            fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`)
        ]);

        if (!trendingRes.ok || !upcomingRes.ok || !topRatedRes.ok || !genresRes.ok) {
            throw new Error('Failed to fetch movies');
        }

        const [trendingData, upcomingData, topRatedData, genresData] = await Promise.all([
            trendingRes.json(),
            upcomingRes.json(),
            topRatedRes.json(),
            genresRes.json()
        ]);

        // Process and store movies
        movieCategories.trending = processMovies(trendingData.results);
        movieCategories.upcoming = processMovies(upcomingData.results);
        movieCategories.topRated = processMovies(topRatedData.results);

        // Store genres
        appState.genres = genresData.genres || [];

        // Set featured movie from upcoming movies
        if (movieCategories.upcoming.length > 0) {
            setupHeroSection(movieCategories.upcoming);
        }

        // Setup genre filter buttons
        setupGenreButtons();

        // Render all carousels
        renderCarousel('trending', trendingCarousel);
        renderCarousel('upcoming', upcomingCarousel);
        renderCarousel('topRated', topRatedCarousel);

        // Setup carousel controls
        setupCarouselControls();
        
        console.log('Movies fetched and rendered successfully');
    } catch (error) {
        console.error('Error fetching movies:', error);
        showErrorMessage('Failed to load movies. Please check your API key and try again.');
    } finally {
        loadingState = false;
    }
}

// Process movie data
function processMovies(movies) {
    return movies
        .filter(movie => movie.poster_path) // Only include movies with posters
        .slice(0, 12) // Limit to 12 movies per category
        .map(movie => ({
            id: movie.id,
            title: movie.title,
            thumbnailUrl: `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`,
            backdropUrl: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
            overview: movie.overview,
            releaseDate: movie.release_date,
            youtubeTrailerId: null // Will be fetched on demand
        }));
}

// Setup hero section with a random featured movie
function setupHeroSection(upcomingMovies) {
    if (upcomingMovies.length === 0) return;

    // Randomly select a movie from upcoming
    const featuredMovie = upcomingMovies[Math.floor(Math.random() * upcomingMovies.length)];

    // Set title
    heroTitle.textContent = featuredMovie.title;

    // Set overview (truncate to 150 characters)
    const overview = featuredMovie.overview || 'No overview available.';
    heroOverview.textContent = overview.length > 150 
        ? overview.substring(0, 150) + '...' 
        : overview;

    // Setup play button
    heroPlayButton.addEventListener('click', () => {
        openTrailerModal(featuredMovie);
    });

    // Fetch and play trailer in background
    fetchTrailerId(featuredMovie.id).then(trailerId => {
        if (trailerId) {
            // Set background image first as fallback
            if (featuredMovie.backdropUrl) {
                heroBackground.style.backgroundImage = `url('${featuredMovie.backdropUrl}')`;
            }
            
            // Play trailer in background after 1 second
            setTimeout(() => {
                heroTrailerVideo.src = `https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&rel=0`;
                heroTrailerVideo.style.display = 'block';
            }, 1000);
        } else {
            // Fallback to static background if no trailer found
            if (featuredMovie.backdropUrl) {
                heroBackground.style.backgroundImage = `url('${featuredMovie.backdropUrl}')`;
            }
        }
    }).catch(() => {
        // Fallback to static background on error
        if (featuredMovie.backdropUrl) {
            heroBackground.style.backgroundImage = `url('${featuredMovie.backdropUrl}')`;
        }
    });
}

// Fetch trailer ID for a specific movie
async function fetchTrailerId(movieId) {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        // Find YouTube trailer
        const trailer = data.results.find(
            video => video.type === 'Trailer' && video.site === 'YouTube'
        );

        return trailer ? trailer.key : null;
    } catch (error) {
        console.error(`Error fetching trailer for movie ${movieId}:`, error);
        return null;
    }
}

// Render movies on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first - show auth panel or website
    checkAuthentication();
    
    // Initialize authentication modal (for logged-in users)
    initAuth();
    
    // Setup event listeners
    setupEventListeners();
    setupSearchFunctionality();
    setupIndianCinemaFilters();
    initCineBot();
});

// Function to render carousel
function renderCarousel(category, carouselElement) {
    const movies = movieCategories[category];
    
    if (!movies || movies.length === 0) {
        carouselElement.innerHTML = '<div style="text-align: center; padding: 2rem; color: #b3b3b3;">No movies available.</div>';
        return;
    }
    
    // Reuse unified rendering function
    renderMoviesInCarousel(movies, carouselElement);
}

// Format date from TMDB format (YYYY-MM-DD)
function formatDate(dateString) {
    if (!dateString) return 'Release date TBA';
    
    const date = new Date(dateString + 'T00:00:00Z');
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Auto-scroll carousels
const carouselAutoScroll = {};

function startAutoScroll(carouselId, carouselElement, direction = 'right') {
    // Stop any existing scroll
    if (carouselAutoScroll[carouselId]) {
        clearInterval(carouselAutoScroll[carouselId]);
    }
    
    // Start auto-scroll every 2.5 seconds (faster)
    carouselAutoScroll[carouselId] = setInterval(() => {
        const scrollAmount = 300;
        const maxScroll = carouselElement.scrollWidth - carouselElement.clientWidth;
        
        // Scroll based on direction
        if (direction === 'right') {
            carouselElement.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            
            // Reset to beginning when reaching the end
            if (carouselElement.scrollLeft + carouselElement.clientWidth >= maxScroll - 10) {
                setTimeout(() => {
                    carouselElement.scrollLeft = 0;
                }, 500);
            }
        } else if (direction === 'left') {
            carouselElement.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            
            // Reset to end when reaching the beginning
            if (carouselElement.scrollLeft <= 10) {
                setTimeout(() => {
                    carouselElement.scrollLeft = maxScroll;
                }, 500);
            }
        }
    }, 2500);
}

// Setup carousel auto-scroll
function setupCarouselControls() {
    startAutoScroll('trending', trendingCarousel, 'right');      // Left to Right
    startAutoScroll('upcoming', upcomingCarousel, 'left');       // Right to Left
    startAutoScroll('topRated', topRatedCarousel, 'right');      // Left to Right
}

// Get carousel element by category
function getCarouselElement(category) {
    const carouselMap = {
        trending: trendingCarousel,
        upcoming: upcomingCarousel,
        topRated: topRatedCarousel
    };
    return carouselMap[category];
}

// Scroll carousel left or right
function scrollCarousel(carousel, direction) {
    const scrollAmount = 300;
    if (direction === 'left') {
        carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

// Function to open modal with trailer
async function openTrailerModal(movie) {
    movieTitle.textContent = movie.title;
    movieRelease.textContent = `Releasing: ${formatDate(movie.releaseDate)}`;
    
    // Show modal with loading state
    trailerModal.classList.add('active');
    trailerVideo.src = ''; // Clear previous video
    trailerVideo.style.display = 'none';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Create loading indicator
    const videoContainer = trailerVideo.parentElement;
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'trailerLoading';
    loadingDiv.style.cssText = 'text-align: center; padding: 3rem; color: #b3b3b3;';
    loadingDiv.innerHTML = 'Loading trailer...';
    
    if (!videoContainer.querySelector('#trailerLoading')) {
        videoContainer.insertBefore(loadingDiv, trailerVideo);
    }
    
    try {
        // Fetch trailer ID if not already cached
        let trailerId = movie.youtubeTrailerId;
        
        if (!trailerId) {
            trailerId = await fetchTrailerId(movie.id);
            movie.youtubeTrailerId = trailerId; // Cache for future use
        }
        
        // Remove loading indicator
        const loader = videoContainer.querySelector('#trailerLoading');
        if (loader) loader.remove();
        
        if (trailerId) {
            // Set YouTube video URL with autoplay enabled
            trailerVideo.src = `https://www.youtube.com/embed/${trailerId}?autoplay=1&controls=1`;
            trailerVideo.style.display = 'block';
        } else {
            // No trailer available
            const noTrailerDiv = document.createElement('div');
            noTrailerDiv.id = 'noTrailer';
            noTrailerDiv.style.cssText = 'text-align: center; padding: 3rem; color: #e50914; font-size: 1.1rem;';
            noTrailerDiv.innerHTML = '🎬 Trailer not available yet';
            videoContainer.insertBefore(noTrailerDiv, trailerVideo);
            trailerVideo.style.display = 'none';
        }
    } catch (error) {
        console.error('Error opening trailer:', error);
        const loader = videoContainer.querySelector('#trailerLoading');
        if (loader) loader.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.id = 'trailerError';
        errorDiv.style.cssText = 'text-align: center; padding: 3rem; color: #e50914;';
        errorDiv.innerHTML = '❌ Error loading trailer. Please try again.';
        videoContainer.insertBefore(errorDiv, trailerVideo);
        trailerVideo.style.display = 'none';
    }
}

// Function to close modal
function closeTrailer() {
    trailerModal.classList.remove('active');
    trailerVideo.src = ''; // Stop video playback
    
    // Clean up any temporary elements
    const videoContainer = trailerVideo.parentElement;
    const tempElements = videoContainer.querySelectorAll('#trailerLoading, #noTrailer, #trailerError');
    tempElements.forEach(el => el.remove());
    
    document.body.style.overflow = 'auto'; // Enable scrolling
}

// Setup event listeners
function setupEventListeners() {
    closeModalBtn.addEventListener('click', closeTrailer);
    
    // Close modal when clicking outside the content
    trailerModal.addEventListener('click', (e) => {
        if (e.target === trailerModal) {
            closeTrailer();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && trailerModal.classList.contains('active')) {
            closeTrailer();
        }
    });
}

// Setup genre filter buttons
function setupGenreButtons() {
    genreButtonsContainer.innerHTML = '';

    // Define priority genres to display first (Action, Adventure, Animation)
    const priorityGenreNames = ['Action', 'Adventure', 'Animation'];
    const priorityGenres = appState.genres.filter(g => priorityGenreNames.includes(g.name));
    
    // Add remaining genres after priority ones
    const remainingGenres = appState.genres.filter(g => !priorityGenreNames.includes(g.name));
    
    // Combine: priority genres first, then up to 3 more additional genres
    const genresToDisplay = [...priorityGenres, ...remainingGenres.slice(0, 3)];

    genresToDisplay.forEach(genre => {
        const button = document.createElement('button');
        button.className = 'genre-btn';
        button.textContent = genre.name;
        button.dataset.genreId = genre.id;

        button.addEventListener('click', () => {
            filterByGenre(genre.id, genre.name, button);
        });

        genreButtonsContainer.appendChild(button);
    });
}

// Filter movies by genre
async function filterByGenre(genreId, genreName, buttonElement) {
    try {
        // Update app state
        appState.currentMode = 'genre';
        appState.currentGenreId = genreId;

        // Update active button state
        document.querySelectorAll('.genre-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        buttonElement.classList.add('active');

        // Fetch movies by genre
        const response = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&language=en-US&sort_by=popularity.desc&page=1`
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        appState.genreResults = processMovies(data.results);

        displayGenreResults(appState.genreResults, genreName);
    } catch (error) {
        console.error('Error filtering by genre:', error);
        showSearchError('Failed to filter movies by genre. Please try again.');
    }
}

// Display genre filtered results
function displayGenreResults(movies, genreName) {
    // Show all carousel sections
    document.querySelectorAll('.carousel-section').forEach(section => {
        section.style.display = 'block';
    });

    // Create or update genre results section
    let genreResultsSection = document.getElementById('genreResults');
    if (!genreResultsSection) {
        genreResultsSection = document.createElement('section');
        genreResultsSection.id = 'genreResults';
        genreResultsSection.className = 'carousel-section';
        
        // Insert between genre filter and Indian Cinema sections
        const indianFilterSection = document.querySelector('.indian-filter-header');
        if (indianFilterSection && indianFilterSection.closest('section')) {
            const indianSection = indianFilterSection.closest('section');
            indianSection.parentNode.insertBefore(genreResultsSection, indianSection);
        } else {
            document.querySelector('main').appendChild(genreResultsSection);
        }
    }

    genreResultsSection.style.display = 'block';

    if (movies.length === 0) {
        // No matches found
        genreResultsSection.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem; color: #b3b3b3;">
                <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">🎬 No movies found in ${genreName}</p>
                <p style="font-size: 0.9rem; color: #808080;">Try another genre</p>
            </div>
        `;
    } else {
        // Display results as carousel
        genreResultsSection.innerHTML = `
            <div class="carousel-header">
                <h2>${genreName} Movies (${movies.length})</h2>
            </div>
            <div class="carousel-container">
                <button class="carousel-control prev" id="genrePrev">❮</button>
                <div class="carousel" id="genreCarousel"></div>
                <button class="carousel-control next" id="genreNext">❯</button>
            </div>
        `;

        // Render genre results
        const genreCarousel = document.getElementById('genreCarousel');
        renderMoviesInCarousel(appState.genreResults, genreCarousel);

        // Setup carousel controls
        document.getElementById('genrePrev').addEventListener('click', () => {
            scrollCarousel(genreCarousel, 'left');
        });
        document.getElementById('genreNext').addEventListener('click', () => {
            scrollCarousel(genreCarousel, 'right');
        });
    }
}
async function searchMovies(query) {
    if (!query.trim()) {
        switchToHomeMode();
        return;
    }

    try {
        // Update app state
        appState.currentMode = 'search';
        appState.currentSearchQuery = query;

        const response = await fetch(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        appState.searchResults = processMovies(data.results);

        displaySearchResults(appState.searchResults, query);
    } catch (error) {
        console.error('Error searching movies:', error);
        showSearchError('Failed to search movies. Please try again.');
    }
}

// Display search results
function displaySearchResults(movies, query) {
    // Hide all carousel sections
    document.querySelectorAll('.carousel-section').forEach(section => {
        section.style.display = 'none';
    });

    // Create or update search results section
    let searchResultsSection = document.getElementById('searchResults');
    if (!searchResultsSection) {
        searchResultsSection = document.createElement('section');
        searchResultsSection.id = 'searchResults';
        searchResultsSection.className = 'carousel-section';
        document.querySelector('main').insertBefore(
            searchResultsSection,
            document.querySelector('main').firstChild
        );
    }

    searchResultsSection.style.display = 'block';

    if (movies.length === 0) {
        // No matches found
        searchResultsSection.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem; color: #b3b3b3;">
                <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">🎬 No movies found for "${query}"</p>
                <p style="font-size: 0.9rem; color: #808080;">Try a different search term</p>
            </div>
        `;
    } else {
        // Display search results as carousel
        searchResultsSection.innerHTML = `
            <div class="carousel-header">
                <h2>Search Results for "${query}" (${movies.length})</h2>
            </div>
            <div class="carousel-container">
                <button class="carousel-control prev" id="searchPrev">❮</button>
                <div class="carousel" id="searchCarousel"></div>
                <button class="carousel-control next" id="searchNext">❯</button>
            </div>
        `;

        // Render search results (reuses same rendering logic)
        const searchCarousel = document.getElementById('searchCarousel');
        renderMoviesInCarousel(appState.searchResults, searchCarousel);

        // Setup carousel controls
        document.getElementById('searchPrev').addEventListener('click', () => {
            scrollCarousel(searchCarousel, 'left');
        });
        document.getElementById('searchNext').addEventListener('click', () => {
            scrollCarousel(searchCarousel, 'right');
        });
    }
}

// Switch back to home mode (show all carousels)
function switchToHomeMode() {
    appState.currentMode = 'home';
    appState.searchResults = [];
    appState.currentSearchQuery = '';
    appState.genreResults = [];
    appState.currentGenreId = null;
    appState.currentLanguage = null;
    appState.currentLanguageName = '';
    
    // Clear active genre button
    document.querySelectorAll('.genre-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Clear active Indian cinema button
    document.querySelectorAll('.indian-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    showAllCarousels();
}

// Render movies in a carousel container
function renderMoviesInCarousel(movies, carouselElement) {
    carouselElement.innerHTML = '';

    movies.forEach(movie => {
        const moviePoster = document.createElement('div');
        moviePoster.className = 'movie-poster-carousel';
        moviePoster.innerHTML = `
            <img src="${movie.thumbnailUrl}" alt="${movie.title}" loading="lazy">
            <div class="movie-overlay"></div>
            <div class="play-icon"></div>
        `;

        // Reuse same trailer modal logic for ALL movies (home or search)
        moviePoster.addEventListener('click', () => openTrailerModal(movie));
        carouselElement.appendChild(moviePoster);
    });
}

// Setup search functionality
function setupSearchFunctionality() {
    // Search on Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchMovies(query);
            }
        }
    });

    // Search on icon click
    const searchIcon = document.querySelector('.search-icon');
    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                searchMovies(query);
            }
        });
    }

    // Clear search on empty input
    searchInput.addEventListener('input', (e) => {
        if (e.target.value.trim() === '') {
            switchToHomeMode();
        }
    });
}

// Show all carousels
function showAllCarousels() {
    document.querySelectorAll('.carousel-section').forEach(section => {
        section.style.display = 'block';
    });

    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
}

// Show search error message
function showSearchError(message) {
    let searchResultsSection = document.getElementById('searchResults');
    if (!searchResultsSection) {
        searchResultsSection = document.createElement('section');
        searchResultsSection.id = 'searchResults';
        searchResultsSection.className = 'carousel-section';
        document.querySelector('main').insertBefore(
            searchResultsSection,
            document.querySelector('main').firstChild
        );
    }

    searchResultsSection.style.display = 'block';
    searchResultsSection.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem; color: #e50914;">
            <p style="font-size: 1.1rem;">❌ ${message}</p>
        </div>
    `;
}

// Setup Indian cinema filters
function setupIndianCinemaFilters() {
    const indianButtons = document.querySelectorAll('.indian-btn');

    indianButtons.forEach(button => {
        button.addEventListener('click', () => {
            const language = button.dataset.language;
            const languageNames = {
                'hi': 'Bollywood',
                'te': 'Tollywood',
                'ta': 'Kollywood'
            };
            const languageName = languageNames[language];

            filterByIndianLanguage(language, languageName, button);
        });
    });
}

// Filter movies by Indian cinema language
async function filterByIndianLanguage(languageCode, languageName, buttonElement) {
    try {
        // Update app state
        appState.currentMode = 'language';
        appState.currentLanguage = languageCode;
        appState.currentLanguageName = languageName;

        // Update active button state
        document.querySelectorAll('.indian-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        buttonElement.classList.add('active');

        // Fetch movies by language with region=IN
        const response = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=${languageCode}&sort_by=popularity.desc&region=IN&language=en-US&page=1`
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const languageResults = processMovies(data.results);

        displayIndianCinemaResults(languageResults, languageName);
    } catch (error) {
        console.error('Error filtering by Indian cinema language:', error);
        showSearchError('Failed to filter Indian cinema. Please try again.');
    }
}

// Display Indian cinema filtered results
function displayIndianCinemaResults(movies, languageName) {
    // Hide all carousel sections
    document.querySelectorAll('.carousel-section').forEach(section => {
        section.style.display = 'none';
    });

    // Create or update Indian cinema results section
    let indianResultsSection = document.getElementById('indianResults');
    if (!indianResultsSection) {
        indianResultsSection = document.createElement('section');
        indianResultsSection.id = 'indianResults';
        indianResultsSection.className = 'carousel-section';
        document.querySelector('main').insertBefore(
            indianResultsSection,
            document.querySelector('main').firstChild
        );
    }

    indianResultsSection.style.display = 'block';

    if (movies.length === 0) {
        // No matches found
        indianResultsSection.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem; color: #b3b3b3;">
                <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">🎬 No ${languageName} movies found</p>
                <p style="font-size: 0.9rem; color: #808080;">Try another Indian cinema category</p>
            </div>
        `;
    } else {
        // Display results as carousel
        indianResultsSection.innerHTML = `
            <div class="carousel-header">
                <h2>${languageName} Movies (${movies.length})</h2>
            </div>
            <div class="carousel-container">
                <button class="carousel-control prev" id="indianPrev">❮</button>
                <div class="carousel" id="indianCarousel"></div>
                <button class="carousel-control next" id="indianNext">❯</button>
            </div>
        `;

        // Render results
        const indianCarousel = document.getElementById('indianCarousel');
        renderMoviesInCarousel(movies, indianCarousel);

        // Setup carousel controls
        document.getElementById('indianPrev').addEventListener('click', () => {
            scrollCarousel(indianCarousel, 'left');
        });
        document.getElementById('indianNext').addEventListener('click', () => {
            scrollCarousel(indianCarousel, 'right');
        });
    }
}

// Authentication System
function initAuth() {
    // Check if user is already logged in
    const loggedInUser = localStorage.getItem('netflims_user');
    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        updateUIForLoggedInUser(user);
    }

    // Event listeners
    signInBtn.addEventListener('click', openLoginModal);
    closeLoginModalBtn.addEventListener('click', closeLoginModal);
    loginTabBtn.addEventListener('click', switchToLogin);
    registerTabBtn.addEventListener('click', switchToRegister);
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    registerPasswordInput.addEventListener('input', checkPasswordStrength);
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            closeLoginModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && loginModal.classList.contains('active')) {
            closeLoginModal();
        }
    });
}

// Switch to login tab
function switchToLogin() {
    loginTabBtn.classList.add('active');
    registerTabBtn.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    authTitle.textContent = 'Sign In';
    clearAuthErrors();
    loginForm.reset();
}

// Switch to register tab
function switchToRegister() {
    registerTabBtn.classList.add('active');
    loginTabBtn.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    authTitle.textContent = 'Sign Up';
    clearAuthErrors();
    registerForm.reset();
}

// Clear all error messages
function clearAuthErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.auth-message').forEach(el => el.textContent = '');
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
function checkPasswordStrength() {
    const password = registerPasswordInput.value;
    let strength = 0;
    let feedback = '';

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    const strengthLevels = {
        0: { text: '', color: '' },
        1: { text: 'Weak', color: '#e50914' },
        2: { text: 'Fair', color: '#ff9500' },
        3: { text: 'Good', color: '#ffd700' },
        4: { text: 'Strong', color: '#90ee90' },
        5: { text: 'Very Strong', color: '#00ff00' }
    };

    const level = strengthLevels[strength];
    passwordStrengthDiv.textContent = level.text;
    passwordStrengthDiv.style.color = level.color;
    passwordStrengthDiv.style.marginTop = '0.5rem';
}

// Get all users from localStorage
function getAllUsers() {
    const users = localStorage.getItem('netflims_users');
    return users ? JSON.parse(users) : [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('netflims_users', JSON.stringify(users));
}

// Check if email already exists
function emailExists(email) {
    const users = getAllUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
}

function openLoginModal() {
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    loginTabBtn.classList.add('active');
    registerTabBtn.classList.remove('active');
    authTitle.textContent = 'Sign In';
    clearAuthErrors();
    loginEmailInput.focus();
}

function closeLoginModal() {
    loginModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    loginForm.reset();
    registerForm.reset();
    clearAuthErrors();
    passwordStrengthDiv.textContent = '';
}

function handleLogin(e) {
    e.preventDefault();
    clearAuthErrors();
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;
    let hasError = false;

    // Validation
    if (!email) {
        showLoginError('loginEmailError', 'Email is required');
        hasError = true;
    } else if (!isValidEmail(email)) {
        showLoginError('loginEmailError', 'Please enter a valid email');
        hasError = true;
    }

    if (!password) {
        showLoginError('loginPasswordError', 'Password is required');
        hasError = true;
    }

    if (hasError) return;

    // Check credentials against registered users
    const users = getAllUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!user) {
        // For demo purposes, allow login with demo credentials
        if (email === 'demo@netflims.com' && password === 'Demo@123') {
            const demoUser = { name: 'Demo User', email: 'demo@netflims.com' };
            localStorage.setItem('netflims_user', JSON.stringify(demoUser));
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('netflims_remember', 'true');
            }
            updateUIForLoggedInUser(demoUser);
            closeLoginModal();
            return;
        }
        showLoginError('loginMessage', 'Invalid email or password. Demo: demo@netflims.com / Demo@123');
        return;
    }

    // Login success
    localStorage.setItem('netflims_user', JSON.stringify(user));
    if (rememberMeCheckbox.checked) {
        localStorage.setItem('netflims_remember', 'true');
    }
    updateUIForLoggedInUser(user);
    closeLoginModal();
}

function handleRegister(e) {
    e.preventDefault();
    clearAuthErrors();
    const name = registerNameInput.value.trim();
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value;
    const confirmPassword = registerConfirmPasswordInput.value;
    let hasError = false;

    // Validation
    if (!name) {
        showRegisterError('registerNameError', 'Full name is required');
        hasError = true;
    } else if (name.length < 2) {
        showRegisterError('registerNameError', 'Name must be at least 2 characters');
        hasError = true;
    }

    if (!email) {
        showRegisterError('registerEmailError', 'Email is required');
        hasError = true;
    } else if (!isValidEmail(email)) {
        showRegisterError('registerEmailError', 'Please enter a valid email');
        hasError = true;
    } else if (emailExists(email)) {
        showRegisterError('registerEmailError', 'This email is already registered');
        hasError = true;
    }

    if (!password) {
        showRegisterError('registerPasswordError', 'Password is required');
        hasError = true;
    } else if (password.length < 8) {
        showRegisterError('registerPasswordError', 'Password must be at least 8 characters');
        hasError = true;
    } else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
        showRegisterError('registerPasswordError', 'Password must contain uppercase, lowercase, and numbers');
        hasError = true;
    }

    if (!confirmPassword) {
        showRegisterError('registerConfirmPasswordError', 'Please confirm your password');
        hasError = true;
    } else if (password !== confirmPassword) {
        showRegisterError('registerConfirmPasswordError', 'Passwords do not match');
        hasError = true;
    }

    if (hasError) return;

    // Create new user
    const newUser = { name, email, password };
    const users = getAllUsers();
    users.push(newUser);
    saveUsers(users);

    // Auto-login after registration
    localStorage.setItem('netflims_user', JSON.stringify({ name, email }));
    updateUIForLoggedInUser({ name, email });
    showRegisterSuccess('Registration successful! Welcome to Netflims.');
    setTimeout(() => {
        closeLoginModal();
    }, 1500);
}

function showLoginError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.color = '#e50914';
    }
}

function showRegisterError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.color = '#e50914';
    }
}

function showRegisterSuccess(message) {
    const messageElement = document.getElementById('registerMessage');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.color = '#90ee90';
    }
}

function updateUIForLoggedInUser(user) {
    const userName = user.name || user.email.split('@')[0];
    signInBtn.outerHTML = `
        <div class="welcome-user" id="welcomeUser">
            <span class="user-avatar">${userName.charAt(0).toUpperCase()}</span>
            <span>${userName}</span>
            <div class="logout-menu" id="logoutMenu">
                <button id="logoutBtn" class="logout-btn">Logout</button>
            </div>
        </div>
    `;

    // Add event listener for logout
    const welcomeUser = document.getElementById('welcomeUser');
    const logoutMenu = document.getElementById('logoutMenu');
    const logoutBtn = document.getElementById('logoutBtn');

    welcomeUser.addEventListener('click', () => {
        logoutMenu.classList.toggle('active');
    });

    logoutBtn.addEventListener('click', handleLogout);

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!welcomeUser.contains(e.target)) {
            logoutMenu.classList.remove('active');
        }
    });
}

function handleLogout() {
    localStorage.removeItem('netflims_user');
    localStorage.removeItem('netflims_remember');
    authPanel.style.display = 'flex';
    websiteContent.style.display = 'none';
    setupAuthPanel();
}

// Show error message
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 2rem; color: #e50914; margin-top: 3rem;';
    errorDiv.innerHTML = message;

    // Insert after header or at the beginning of main
    document.querySelector('main').insertBefore(errorDiv, document.querySelector('.carousel-section'));
}

// CineBot Advanced AI - High Model
class CineBotAI {
    constructor() {
        this.movieDatabase = this.initializeMovieDatabase();
        this.conversationHistory = [];
        this.userPreferences = {
            genres: [],
            favoriteMovies: [],
            watchHistory: [],
            ratings: {},
            favoriteActors: [],
            favoriteDirectors: []
        };
        this.context = {
            lastGenre: null,
            lastMood: null,
            conversationTopic: null
        };
    }

    initializeMovieDatabase() {
        return {
            movies: {
                // Action Movies
                'John Wick': { genre: 'action', rating: 8.9, year: 2014, director: 'Chad Stahelski', actors: ['Keanu Reeves', 'Michael Nyqvist'], plot: 'A retired assassin comes out of retirement to take revenge.' },
                'Mission Impossible': { genre: 'action', rating: 8.4, year: 1996, director: 'Brian De Palma', actors: ['Tom Cruise', 'Jon Voight'], plot: 'An American secret agent goes rogue.' },
                'Top Gun': { genre: 'action', rating: 8.5, year: 1986, director: 'Tony Scott', actors: ['Tom Cruise', 'Anthony Edwards'], plot: 'Elite fighter pilots compete to be the best.' },
                'Deadpool': { genre: 'action', rating: 8.0, year: 2016, director: 'Tim Miller', actors: ['Ryan Reynolds', 'Morena Baccarin'], plot: 'A wisecracking mercenary becomes a superhero.' },
                'Mad Max': { genre: 'action', rating: 8.1, year: 2015, director: 'George Miller', actors: ['Tom Hardy', 'Charlize Theron'], plot: 'Post-apocalyptic desert chase thriller.' },
                
                // Comedy Movies
                'The Grand Budapest Hotel': { genre: 'comedy', rating: 8.3, year: 2014, director: 'Wes Anderson', actors: ['Ralph Fiennes', 'Tony Revolori'], plot: 'A writer becomes friends with the owner of a famous hotel.' },
                'Jumanji': { genre: 'comedy', rating: 7.0, year: 1995, director: 'Joe Johnston', actors: ['Robin Williams', 'Kirsten Dunst'], plot: 'A magical board game comes to life.' },
                'Superbad': { genre: 'comedy', rating: 7.6, year: 2007, director: 'Greg Mottola', actors: ['Michael Cera', 'Jonah Hill'], plot: 'Two socially awkward teens try to have fun.' },
                'Knives Out': { genre: 'comedy', rating: 8.3, year: 2019, director: 'Rian Johnson', actors: ['Daniel Craig', 'Ana de Armas'], plot: 'A detective investigates a wealthy family murder.' },
                'The Hangover': { genre: 'comedy', rating: 7.7, year: 2009, director: 'Todd Phillips', actors: ['Bradley Cooper', 'Ed Helms'], plot: 'Three friends search for their missing buddy in Vegas.' },
                
                // Drama Movies
                'The Shawshank Redemption': { genre: 'drama', rating: 9.3, year: 1994, director: 'Frank Darabont', actors: ['Tim Robbins', 'Morgan Freeman'], plot: 'Two imprisoned men bond over decades.' },
                'The Godfather': { genre: 'drama', rating: 9.2, year: 1972, director: 'Francis Ford Coppola', actors: ['Marlon Brando', 'Al Pacino'], plot: 'The aging patriarch of an organized crime family transfers control.' },
                'Forrest Gump': { genre: 'drama', rating: 8.8, year: 1994, director: 'Robert Zemeckis', actors: ['Tom Hanks', 'Gary Sinise'], plot: 'A man with low IQ accomplishes great things.' },
                'Parasite': { genre: 'drama', rating: 8.6, year: 2019, director: 'Bong Joon-ho', actors: ['Song Kang-ho', 'Lee Sun-kyun'], plot: 'A poor family infiltrates a wealthy household.' },
                '12 Angry Men': { genre: 'drama', rating: 9.0, year: 1957, director: 'Sidney Lumet', actors: ['Henry Fonda', 'Lee J. Cobb'], plot: 'Jury members debate a murder case.' },
                
                // Horror Movies
                'Hereditary': { genre: 'horror', rating: 8.3, year: 2018, director: 'Ari Aster', actors: ['Toni Collette', 'Gabriel Byrne'], plot: 'A family uncovers dark secrets after the mother dies.' },
                'The Ring': { genre: 'horror', rating: 7.3, year: 2002, director: 'Gore Verbinski', actors: ['Naomi Watts', 'Martin Henderson'], plot: 'A cursed videotape kills viewers in seven days.' },
                'A Quiet Place': { genre: 'horror', rating: 7.5, year: 2018, director: 'John Krasinski', actors: ['Emily Blunt', 'John Krasinski'], plot: 'Creatures hunt by sound in a silent world.' },
                'Get Out': { genre: 'horror', rating: 8.0, year: 2017, director: 'Jordan Peele', actors: ['Daniel Kaluuya', 'Allison Williams'], plot: 'A man visits his girlfriend\'s family with sinister consequences.' },
                
                // Sci-Fi Movies
                'Inception': { genre: 'sci-fi', rating: 8.8, year: 2010, director: 'Christopher Nolan', actors: ['Leonardo DiCaprio', 'Marion Cotillard'], plot: 'A thief steals secrets from dreams.' },
                'Interstellar': { genre: 'sci-fi', rating: 8.6, year: 2014, director: 'Christopher Nolan', actors: ['Matthew McConaughey', 'Anne Hathaway'], plot: 'Astronauts travel through a wormhole to save humanity.' },
                'The Matrix': { genre: 'sci-fi', rating: 8.7, year: 1999, director: 'The Wachowskis', actors: ['Keanu Reeves', 'Laurence Fishburne'], plot: 'A hacker discovers reality is a simulation.' },
                'Blade Runner': { genre: 'sci-fi', rating: 8.1, year: 1982, director: 'Ridley Scott', actors: ['Harrison Ford', 'Sean Young'], plot: 'A detective hunts artificial humanoids.' },
                'Dune': { genre: 'sci-fi', rating: 8.0, year: 2021, director: 'Denis Villeneuve', actors: ['Timothée Chalamet', 'Oscar Isaac'], plot: 'A young man must prevent a terrible future.' },
                
                // Thriller Movies
                'The Silence of the Lambs': { genre: 'thriller', rating: 8.6, year: 1991, director: 'Jonathan Demme', actors: ['Jodie Foster', 'Anthony Hopkins'], plot: 'An FBI trainee seeks help from a cannibalistic psychiatrist.' },
                'Se7en': { genre: 'thriller', rating: 8.6, year: 1995, director: 'David Fincher', actors: ['Brad Pitt', 'Morgan Freeman'], plot: 'Two detectives hunt a serial killer.' },
                'Shutter Island': { genre: 'thriller', rating: 8.2, year: 2010, director: 'Martin Scorsese', actors: ['Leonardo DiCaprio', 'Emily Mortimer'], plot: 'A detective investigates a disappearance on a mysterious island.' },
                'Gone Girl': { genre: 'thriller', rating: 8.1, year: 2014, director: 'David Fincher', actors: ['Ben Affleck', 'Rosamund Pike'], plot: 'A man is suspected of murdering his wife.' },
                'Joker': { genre: 'thriller', rating: 8.4, year: 2019, director: 'Todd Phillips', actors: ['Joaquin Phoenix', 'Robert De Niro'], plot: 'A struggling comedian becomes a killer.' },
                
                // Romance Movies
                'The Notebook': { genre: 'romance', rating: 7.8, year: 2004, director: 'Nick Cassavetes', actors: ['Ryan Gosling', 'Rachel McAdams'], plot: 'Two lovers separated by class are reunited.' },
                'Titanic': { genre: 'romance', rating: 7.8, year: 1997, director: 'James Cameron', actors: ['Leonardo DiCaprio', 'Kate Winslet'], plot: 'A love story during the Titanic disaster.' },
                'La La Land': { genre: 'romance', rating: 8.0, year: 2016, director: 'Damien Chazelle', actors: ['Ryan Gosling', 'Emma Stone'], plot: 'Two dreamers fall in love in Los Angeles.' },
                'Crazy Rich Asians': { genre: 'romance', rating: 7.3, year: 2018, director: 'Jon M. Chu', actors: ['Constance Wu', 'Henry Golding'], plot: 'A woman meets her boyfriend\'s wealthy family.' },
                
                // Animation Movies
                'Spirited Away': { genre: 'animation', rating: 8.6, year: 2001, director: 'Hayao Miyazaki', actors: ['Rumi Hiiragi', 'Miyu Irino'], plot: 'A girl must escape a magical bathhouse.' },
                'Coco': { genre: 'animation', rating: 8.4, year: 2017, director: 'Lee Unkrich', actors: ['Anthony Gonzalez', 'Gael García Bernal'], plot: 'A boy travels to the land of the dead.' },
                'Frozen': { genre: 'animation', rating: 7.4, year: 2013, director: 'Chris Buck', actors: ['Kristen Bell', 'Idina Menzel'], plot: 'Two sisters must save their frozen kingdom.' },
                'Toy Story': { genre: 'animation', rating: 8.3, year: 1995, director: 'John Lasseter', actors: ['Tom Hanks', 'Tim Allen'], plot: 'Toys come to life when humans aren\'t around.' }
            },
            genres: {
                'action': 'High-octane films with stunts, fights, and adventure',
                'comedy': 'Funny films designed to make you laugh',
                'drama': 'Emotional stories about human experiences',
                'horror': 'Scary films to test your nerves',
                'sci-fi': 'Futuristic or fantastical stories',
                'thriller': 'Suspenseful films that keep you on edge',
                'romance': 'Love stories and emotional connections',
                'animation': 'Animated films for all ages',
                'documentary': 'Real-life stories and information'
            },
            moods: {
                'funny': 'comedy',
                'laugh': 'comedy',
                'scared': 'horror',
                'scared': 'horror',
                'thrilled': 'thriller',
                'adventure': 'action',
                'thinking': 'drama',
                'emotional': 'drama',
                'relax': 'animation',
                'romantic': 'romance',
                'love': 'romance',
                'space': 'sci-fi',
                'mind-bending': 'sci-fi',
                'intelligent': 'drama',
                'smart': 'drama'
            }
        };
    }

    // Main chat function with advanced NLP
    chat(userMessage) {
        const cleanMessage = userMessage.toLowerCase().trim();
        this.conversationHistory.push({ user: userMessage, timestamp: new Date() });

        // Handle specific intents
        if (this.isGreeting(cleanMessage)) return this.getGreeting();
        if (this.isMovieQuestion(cleanMessage)) return this.answerMovieQuestion(cleanMessage);
        if (this.isRatingRequest(cleanMessage)) return this.handleRating(cleanMessage);
        if (this.isActorQuestion(cleanMessage)) return this.handleActorQuestion(cleanMessage);
        if (this.isHelpRequest(cleanMessage)) return this.getAdvancedHelp();
        if (this.isGenreList(cleanMessage)) return this.listGenres();
        if (this.isTrendingRequest(cleanMessage)) return this.getTrendings();
        if (this.isGenreRequest(cleanMessage)) return this.handleGenreRequest(cleanMessage);
        if (this.isRecommendationRequest(cleanMessage)) return this.getIntelligentRecommendation(cleanMessage);
        
        return this.getContextualResponse(cleanMessage);
    }

    isGreeting(message) {
        const greetings = ['hi', 'hello', 'hey', 'greetings', 'what\'s up', 'howdy', 'sup', 'yo'];
        return greetings.some(g => message.startsWith(g) || message.endsWith(g));
    }

    getGreeting() {
        const greetings = [
            '👋 Hey there! I\'m CineBot, your advanced movie AI! I know over 50 films across all genres. What can I help you with?',
            '🎬 Welcome back! Ready for some epic movie recommendations? Tell me a genre or mood!',
            '🍿 Hello! I can recommend movies, discuss plots, talk about actors and directors, or help you find your next favorite film!',
            '🎭 Hi! Whether you want thriller recommendations or want to know about a specific movie, I\'ve got you covered!'
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    isMovieQuestion(message) {
        const keywords = ['plot', 'actor', 'director', 'year', 'rating', 'about', 'tell me'];
        return keywords.some(k => message.includes(k)) && this.extractMovieName(message);
    }

    extractMovieName(message) {
        for (const movieTitle of Object.keys(this.movieDatabase.movies)) {
            if (message.toLowerCase().includes(movieTitle.toLowerCase())) {
                return movieTitle;
            }
        }
        return null;
    }

    answerMovieQuestion(message) {
        const movieName = this.extractMovieName(message);
        if (!movieName) return 'Which movie would you like to know about?';

        const movie = this.movieDatabase.movies[movieName];
        if (!movie) return `I don't have details about ${movieName} yet, but I can recommend similar films!`;

        let response = `🎬 **${movieName}** (${movie.year})\n`;
        response += `⭐ Rating: ${movie.rating}/10\n`;
        response += `👤 Director: ${movie.director}\n`;
        response += `🎭 Cast: ${movie.actors.join(', ')}\n`;
        response += `📖 Plot: ${movie.plot}`;
        
        this.userPreferences.favoriteDirectors.push(movie.director);
        this.userPreferences.favoriteActors.push(...movie.actors);
        
        return response;
    }

    isRatingRequest(message) {
        return message.includes('rate') || message.includes('rating') || message.includes('score');
    }

    handleRating(message) {
        const movieName = this.extractMovieName(message);
        if (!movieName) return 'Which movie would you like to know the rating for?';

        const movie = this.movieDatabase.movies[movieName];
        return movie 
            ? `⭐ **${movieName}** has a rating of **${movie.rating}/10**. ${movie.rating >= 8 ? 'Highly recommended!' : 'Worth watching!'}`
            : `I don't have rating data for that movie yet.`;
    }

    isActorQuestion(message) {
        return message.includes('actor') || message.includes('star') || message.includes('cast');
    }

    handleActorQuestion(message) {
        const actors = new Set();
        for (const movie of Object.values(this.movieDatabase.movies)) {
            actors.add(...movie.actors);
        }
        
        return '🎭 I have info about many talented actors! Which actor interests you? I can tell you about their movies!';
    }

    isHelpRequest(message) {
        return message.includes('help') || message.includes('what can you do') || message.includes('commands');
    }

    getAdvancedHelp() {
        return `📚 **CineBot Advanced Features:**
        
🎯 **Movie Recommendations**
• "Recommend a comedy" - Get genre-based picks
• "I'm in the mood for action" - Mood-based recommendations
• "What's trending?" - See popular films

📽️ **Movie Information**
• "Tell me about Inception" - Get detailed info
• "Plot of The Matrix" - Learn the story
• "Who directed Parasite?" - Director info
• "Rating of Joker" - See IMDB ratings

🎭 **Advanced Search**
• "Best drama films" - Top-rated movies
• "Movies with Keanu Reeves" - Actor search
• "List all genres" - See all available genres

💬 **Just chat with me!** I understand context and can discuss any aspect of cinema!`;
    }

    isGenreList(message) {
        return message.includes('list') && (message.includes('genre') || message.includes('all'));
    }

    listGenres() {
        let response = '🎬 **Available Genres:**\n';
        for (const [genre, desc] of Object.entries(this.movieDatabase.genres)) {
            response += `• **${genre.toUpperCase()}** - ${desc}\n`;
        }
        response += '\nWhat interests you?';
        return response;
    }

    isTrendingRequest(message) {
        return message.includes('trend') || message.includes('popular') || message.includes('best') || message.includes('top');
    }

    getTrendings() {
        const sorted = Object.entries(this.movieDatabase.movies)
            .sort((a, b) => b[1].rating - a[1].rating)
            .slice(0, 5);
        
        let response = '🏆 **Top Rated Movies:**\n';
        sorted.forEach(([title, data], i) => {
            response += `${i + 1}. **${title}** - ⭐ ${data.rating}/10 (${data.genre})\n`;
        });
        return response;
    }

    isGenreRequest(message) {
        return Object.keys(this.movieDatabase.genres).some(genre => message.includes(genre));
    }

    handleGenreRequest(message) {
        for (const genre of Object.keys(this.movieDatabase.genres)) {
            if (message.includes(genre)) {
                const genreMovies = Object.entries(this.movieDatabase.movies)
                    .filter(([_, data]) => data.genre === genre)
                    .sort((a, b) => b[1].rating - a[1].rating)
                    .slice(0, 3);
                
                this.context.lastGenre = genre;
                
                let response = `🎬 **Best ${genre.toUpperCase()} Films:**\n`;
                genreMovies.forEach(([title, data]) => {
                    response += `• **${title}** - ⭐ ${data.rating}/10\n`;
                });
                return response;
            }
        }
    }

    isRecommendationRequest(message) {
        const keywords = ['recommend', 'suggest', 'what should', 'give me', 'find me', 'show me', 'best'];
        return keywords.some(k => message.includes(k));
    }

    getIntelligentRecommendation(message) {
        for (const [mood, genre] of Object.entries(this.movieDatabase.moods)) {
            if (message.includes(mood)) {
                return this.getGenreRecommendation(genre);
            }
        }
        
        return this.getRandomRecommendation();
    }

    getGenreRecommendation(genre) {
        const genreMovies = Object.entries(this.movieDatabase.movies)
            .filter(([_, data]) => data.genre === genre)
            .sort((a, b) => b[1].rating - a[1].rating);
        
        if (genreMovies.length === 0) return 'Hmm, I don\'t have recommendations for that mood yet.';
        
        const [title, data] = genreMovies[Math.floor(Math.random() * Math.min(3, genreMovies.length))];
        return `🎯 I recommend **${title}** (${data.year})\n⭐ Rating: ${data.rating}/10\n📖 ${data.plot}`;
    }

    getRandomRecommendation() {
        const movies = Object.entries(this.movieDatabase.movies);
        const [title, data] = movies[Math.floor(Math.random() * movies.length)];
        return `🎲 Try **${title}**!\n⭐ ${data.rating}/10 | ${data.genre.toUpperCase()}\n${data.plot}`;
    }

    getContextualResponse(message) {
        const responses = [
            '🎬 That sounds interesting! Want a movie recommendation based on that?',
            '🤔 Tell me more! Are you looking for a specific genre or mood?',
            '💭 I love discussing cinema! What kind of movie are you in the mood for?',
            '🎭 Let me help you find the perfect film! What appeals to you?'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

const cineBotAI = new CineBotAI();

// CineBot Elements
const cinebotChatButton = document.getElementById('cinebotChatButton');
const cinebotChatContainer = document.getElementById('cinebotChatContainer');
const chatHistory = document.getElementById('chatHistory');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const chatCloseBtn = document.getElementById('chatCloseBtn');

let isCinebotLoading = false;

// Initialize CineBot
function initCineBot() {
    // Check if all elements exist
    if (!cinebotChatButton || !chatCloseBtn || !chatSendBtn || !chatInput || !cinebotChatContainer || !chatHistory) {
        console.warn('CineBot elements not found');
        return;
    }
    
    cinebotChatButton.addEventListener('click', toggleChatContainer);
    chatCloseBtn.addEventListener('click', closeChatContainer);
    chatSendBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isCinebotLoading) {
            sendChatMessage();
        }
    });
}

// Toggle chat container
function toggleChatContainer() {
    cinebotChatContainer.classList.toggle('active');
    if (cinebotChatContainer.classList.contains('active')) {
        chatInput.focus();
    }
}

// Close chat container
function closeChatContainer() {
    cinebotChatContainer.classList.remove('active');
}

// Send chat message
function sendChatMessage() {
    const message = chatInput.value.trim();
    
    if (!message) return;
    if (isCinebotLoading) return;
    if (!chatHistory) {
        console.error('Chat history element not found');
        return;
    }

    // Add user message to chat
    addMessageToChat(message, 'user');
    chatInput.value = '';
    chatInput.focus();
    
    // Show typing indicator
    showTypingIndicator();
    
    // Call Gemini API
    callGemini(message);
}

// Add message to chat history
function addMessageToChat(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message message-${sender}`;
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.textContent = text;
    
    messageDiv.appendChild(messageText);
    chatHistory.appendChild(messageDiv);
    
    // Auto scroll to bottom
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message message-cinebot';
    typingDiv.id = 'typingIndicator';
    
    const typingContent = document.createElement('div');
    typingContent.className = 'typing-indicator';
    typingContent.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    
    typingDiv.appendChild(typingContent);
    chatHistory.appendChild(typingDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Call CineBot AI (Local)
async function callGemini(userMessage) {
    isCinebotLoading = true;
    chatSendBtn.disabled = true;
    
    try {
        console.log('CineBot processing message:', userMessage);
        
        // Simulate typing delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get response from local AI
        const botResponse = cineBotAI.chat(userMessage);
        console.log('CineBot response:', botResponse);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add bot response to chat
        addMessageToChat(botResponse, 'cinebot');
        
    } catch (error) {
        console.error('CineBot Error:', error);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Show error message
        addMessageToChat('Oops! Something went wrong. Try asking me about movies! 🎬', 'cinebot');
    } finally {
        isCinebotLoading = false;
        chatSendBtn.disabled = false;
        if (chatInput) {
            chatInput.focus();
        }
    }
}

// Initialize CineBot when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCineBot);
} else {
    initCineBot();
}

// ============================================
// RECOMMENDATION ENGINE FUNCTIONS
// ============================================

// Rate a movie for recommendations
async function rateMovie(movieId, rating) {
    const loggedInUser = localStorage.getItem('netflims_user');
    if (!loggedInUser) {
        console.log('User not logged in');
        return;
    }

    const user = JSON.parse(loggedInUser);
    
    try {
        const response = await fetch(`${RECOMMENDATION_API}/rate-movie`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: user.email,
                movie_id: movieId,
                rating: rating
            })
        });

        if (response.ok) {
            console.log(`Movie ${movieId} rated ${rating}/10`);
        }
    } catch (error) {
        console.error('Error rating movie:', error);
    }
}

// Get personalized recommendations for logged-in user
async function getPersonalizedRecommendations(method = 'hybrid') {
    const loggedInUser = localStorage.getItem('netflims_user');
    if (!loggedInUser) {
        console.log('User not logged in');
        return [];
    }

    const user = JSON.parse(loggedInUser);
    
    try {
        // Prepare movies data for the API
        const moviesData = {
            ...movieCategories.trending.reduce((acc, m) => {
                acc[m.id] = { genres: m.genres, rating: m.rating };
                return acc;
            }, {}),
            ...movieCategories.upcoming.reduce((acc, m) => {
                acc[m.id] = { genres: m.genres, rating: m.rating };
                return acc;
            }, {}),
            ...movieCategories.topRated.reduce((acc, m) => {
                acc[m.id] = { genres: m.genres, rating: m.rating };
                return acc;
            }, {})
        };

        const response = await fetch(
            `${RECOMMENDATION_API}/recommendations/${user.email}/${method}?limit=10&movies=${encodeURIComponent(JSON.stringify(moviesData))}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.ok) {
            const data = await response.json();
            console.log(`Got ${data.recommendations.length} recommendations using ${method} method`);
            return data.recommendations;
        }
    } catch (error) {
        console.error('Error getting recommendations:', error);
    }

    return [];
}

// Display recommendations section
function displayRecommendations(movieIds) {
    if (!movieIds || movieIds.length === 0) return;

    // Find recommendation movies from our loaded data
    const recommendedMovies = [];
    const allMovies = [...movieCategories.trending, ...movieCategories.upcoming, ...movieCategories.topRated];

    movieIds.forEach(id => {
        const movie = allMovies.find(m => m.id === id || m.id === parseInt(id));
        if (movie) {
            recommendedMovies.push(movie);
        }
    });

    if (recommendedMovies.length === 0) return;

    // Create or update recommendations section
    let recsSection = document.getElementById('recommendationsSection');
    if (!recsSection) {
        recsSection = document.createElement('section');
        recsSection.id = 'recommendationsSection';
        recsSection.className = 'carousel-section';
        document.querySelector('main').appendChild(recsSection);
    }

    let html = `
        <div class="carousel-header">
            <h2>Recommended For You</h2>
        </div>
        <div class="carousel-container">
            <button class="carousel-control prev" id="recsPrev">❮</button>
            <div class="carousel" id="recommendationsCarousel">
    `;

    recommendedMovies.forEach(movie => {
        html += `
            <div class="movie-poster" onclick="openTrailerModal(${JSON.stringify(movie).replace(/"/g, '&quot;')})">
                <img src="${movie.thumbnailUrl}" alt="${movie.title}" title="${movie.title}">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <p class="rating">⭐ ${movie.rating || 'N/A'}</p>
                </div>
            </div>
        `;
    });

    html += `
            </div>
            <button class="carousel-control next" id="recsNext">❯</button>
        </div>
    `;

    recsSection.innerHTML = html;

    // Setup carousel controls
    document.getElementById('recsPrev').addEventListener('click', () => scrollCarousel('recommendations', -1));
    document.getElementById('recsNext').addEventListener('click', () => scrollCarousel('recommendations', 1));
}

// Initialize recommendations (call after user logs in)
async function initRecommendations() {
    const recommendations = await getPersonalizedRecommendations('hybrid');
    displayRecommendations(recommendations);
}


