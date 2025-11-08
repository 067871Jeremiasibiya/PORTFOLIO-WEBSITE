// API Configuration
const API_KEY = '097cefb3f29fb7bc887a2402a0e6e01f'; // OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const ICON_URL = 'https://openweathermap.org/img/wn/';

// Debug mode
const DEBUG = true; // Set to false in production

// DOM Elements
let cityInput, searchBtn, weatherCard, forecast, errorMessage;

// Weather data cache
let weatherCache = {};
const CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes in milliseconds

// Initialize cache from localStorage
function initCache() {
    try {
        const cached = localStorage.getItem('weatherCache');
        if (cached) {
            weatherCache = JSON.parse(cached);
        }
    } catch (e) {
        console.error('Failed to load cache from localStorage', e);
        weatherCache = {};
    }
}

// Initialize cache on load
initCache();

// ======================
// Helper Functions
// ======================

// Safely update element text content
function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    } else if (DEBUG) {
        console.warn(`Element not found: #${id}`);
    }
}

// Safely update element HTML
function updateElementHTML(id, html) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = html;
    } else if (DEBUG) {
        console.warn(`Element not found: #${id}`);
    }
}

// Safely update element attribute
function updateElementAttribute(id, attr, value) {
    const element = document.getElementById(id);
    if (element) {
        element[attr] = value;
    } else if (DEBUG) {
        console.warn(`Element not found: #${id}`);
    }
}

// Safely update element class
function updateElementClass(id, action, className) {
    const element = document.getElementById(id);
    if (!element || !element.classList) return;

    if (action === 'add') {
        element.classList.add(className);
    } else if (action === 'remove') {
        element.classList.remove(className);
    }
}

// Show error message
function showError(message) {
    console.error('Show Error:', message);

    // Make sure errorMessage is defined
    if (typeof errorMessage === 'undefined') {
        errorMessage = document.getElementById('error-message');
    }

    // Safely update error message if element exists
    if (errorMessage) {
        errorMessage.textContent = message;
        if (errorMessage.classList) {
            errorMessage.classList.remove('d-none');
        } else if (errorMessage.className) {
            // Fallback for older browsers
            errorMessage.className = errorMessage.className.replace(/\bd-none\b/g, '');
        }
    }

    // Safely hide weather card if it exists
    if (weatherCard && weatherCard.classList) {
        weatherCard.classList.add('d-none');
    }

    // Safely hide forecast if it exists
    if (forecast && forecast.classList) {
        forecast.classList.add('d-none');
    }

    // Hide error after 5 seconds if error message element exists
    if (errorMessage) {
        setTimeout(() => {
            if (errorMessage && errorMessage.classList) {
                errorMessage.classList.add('d-none');
            }
        }, 5000);
    }
}

// Show/hide loading state
function showLoading(isLoading) {
    if (!searchBtn) return;
    
    if (isLoading) {
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
    } else {
        searchBtn.disabled = false;
        searchBtn.innerHTML = '<i class="fas fa-search"></i> Search';
    }
}
// Initialize DOM elements
function initElements() {
    cityInput = document.getElementById('city-input');
    searchBtn = document.getElementById('search-btn');
    weatherCard = document.getElementById('weather-card');
    forecast = document.getElementById('forecast');
    errorMessage = document.getElementById('error-message');

    // Check if all required elements exist
    const elements = { cityInput, searchBtn, weatherCard, forecast, errorMessage };
    for (const [name, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Element not found: ${name}`);
        }
    }

    return elements;
}

// Weather data cache

// Initialize the application
function initApp() {
    // Initialize cache first
    initCache();

    const elements = initElements();

    // Only proceed if we have the essential elements
    if (!elements.cityInput || !elements.searchBtn) {
        console.error('Essential elements not found. Cannot initialize app.');
        return;
    }

    // Load weather for default city on page load
    fetchWeatherData('Johannesburg');

    // Update time every second
    setInterval(updateCurrentTime, 1000);
    updateCurrentTime();

    // Search button click event
    elements.searchBtn.addEventListener('click', () => {
        const city = elements.cityInput.value.trim();
        if (city) {
            fetchWeatherData(city);
        } else {
            showError('Please enter a city name');
        }
    });

    // Enter key in search input
    elements.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = elements.cityInput.value.trim();
            if (city) {
                fetchWeatherData(city);
            } else {
                showError('Please enter a city name');
            }
        }
    });

    // Location-based weather functionality has been removed
}

// Start the application when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Fetch weather data by city name
async function fetchWeatherData(city) {
    if (!city || typeof city !== 'string' || city.trim() === '') {
        showError('Please enter a valid city name');
        return;
    }

    // Check cache first
    const cachedData = getCachedWeather(city);
    if (cachedData) {
        if (DEBUG) console.log('Using cached data for:', city);
        updateUI(cachedData);
        return;
    }

    showLoading(true);

    try {
        if (DEBUG) console.log('Fetching weather for:', city);

        // Fetch current weather
        const currentUrl = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        if (DEBUG) console.log('Current weather URL:', currentUrl);

        const currentResponse = await fetch(currentUrl);
        const currentData = await currentResponse.json();

        if (!currentResponse.ok) {
            const errorMsg = currentData.message || 'Failed to fetch weather data';
            if (DEBUG) console.error('API Error:', currentData);
            throw new Error(`Weather data error: ${errorMsg}`);
        }

        if (DEBUG) console.log('Current weather data:', currentData);

        // Fetch forecast
        const forecastUrl = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        if (DEBUG) console.log('Forecast URL:', forecastUrl);

        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        if (!forecastResponse.ok) {
            const errorMsg = forecastData.message || 'Failed to fetch forecast data';
            if (DEBUG) console.error('Forecast API Error:', forecastData);
            throw new Error(`Forecast error: ${errorMsg}`);
        }

        // Combine data
        const weatherData = {
            current: currentData,
            forecast: forecastData,
            timestamp: Date.now()
        };

        if (DEBUG) console.log('Weather data combined:', weatherData);

        // Update UI and cache
        updateUI(weatherData);
        cacheWeather(city, weatherData);

    } catch (error) {
        console.error('Error in fetchWeatherData:', error);
        showError(error.message || 'Unable to fetch weather data. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Location-based weather functionality has been removed

// Safely update element text content
function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    } else if (DEBUG) {
        console.warn(`Element not found: #${id}`);
    }
}

// Safely update element HTML
function updateElementHTML(id, html) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = html;
    } else if (DEBUG) {
        console.warn(`Element not found: #${id}`);
    }
}

// Safely update element attribute
function updateElementAttribute(id, attr, value) {
    const element = document.getElementById(id);
    if (element) {
        element[attr] = value;
    } else if (DEBUG) {
        console.warn(`Element not found: #${id}`);
    }
}

// Safely update element class
function updateElementClass(id, action, className) {
    const element = document.getElementById(id);
    if (!element || !element.classList) return;

    if (action === 'add') {
        element.classList.add(className);
    } else if (action === 'remove') {
        element.classList.remove(className);
    }
}

// Update UI with weather data
function updateUI(data) {
    if (!data || !data.current) {
        showError('Invalid weather data received');
        return;
    }

    // Make sure required elements exist
    if (!weatherCard || !forecast) {
        console.error('Required elements not found');
        return;
    }

    // Rename destructured forecast to avoid naming conflict
    const { current, forecast: forecastData } = data;

    try {
        // Update current weather
        updateElementText('city-name', `${current.name || 'N/A'}, ${current.sys?.country || ''}`);
        updateElementHTML('temperature', `${Math.round(current.main?.temp || 0)}<small>°C</small>`);
        updateElementText('weather-description', current.weather?.[0]?.description || 'N/A');

        // Set weather icon
        const iconCode = current.weather?.[0]?.icon;
        if (iconCode) {
            updateElementAttribute('weather-icon', 'src', `${ICON_URL}${iconCode}@2x.png`);
            updateElementAttribute('weather-icon', 'alt', current.weather[0].main || 'Weather icon');
        }

        // Update weather details with null checks
        updateElementText('feels-like', `${Math.round(current.main?.feels_like || 0)}°C`);
        updateElementText('humidity', `${current.main?.humidity || 0}%`);
        updateElementText('wind-speed', `${((current.wind?.speed || 0) * 3.6).toFixed(1)} km/h`);
        updateElementText('pressure', `${current.main?.pressure || 0} hPa`);
        updateElementText('visibility', current.visibility ? `${(current.visibility / 1000).toFixed(1)} km` : 'N/A');
        updateElementText('cloudiness', `${current.clouds?.all || 0}%`);

        // Update forecast if available
        if (forecastData) {
            updateForecast(forecastData);
        }

        // Show weather card and forecast if they exist
        if (weatherCard) {
            weatherCard.classList.remove('d-none');
            weatherCard.style.animation = 'fadeIn 0.6s ease-out';
            setTimeout(() => {
                if (weatherCard) weatherCard.style.animation = '';
            }, 1000);
        }

        if (forecast) {
            forecast.classList.remove('d-none');
            forecast.style.animation = 'fadeIn 0.6s ease-out 0.2s';
            setTimeout(() => {
                if (forecast) forecast.style.animation = '';
            }, 1000);
        }

        // Hide error message if it exists
        if (errorMessage) {
            errorMessage.classList.add('d-none');
        }

    } catch (error) {
        console.error('Error updating UI:', error);
        showError('Error displaying weather data');
    }
}

// Update forecast data
function updateForecast(forecastData) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';

    // Group forecast by day
    const dailyForecast = {};

    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });

        if (!dailyForecast[day]) {
            dailyForecast[day] = [];
        }

        dailyForecast[day].push({
            temp: item.main.temp,
            icon: item.weather[0].icon,
            description: item.weather[0].description
        });
    });

    // Get next 5 days
    const days = Object.keys(dailyForecast).slice(0, 5);

    days.forEach((day, index) => {
        const dayForecast = dailyForecast[day];
        const temps = dayForecast.map(f => f.temp);
        const maxTemp = Math.round(Math.max(...temps));
        const minTemp = Math.round(Math.min(...temps));

        // Get most common weather condition for the day
        const conditions = dayForecast.map(f => ({
            icon: f.icon,
            description: f.description
        }));

        const mostCommon = getMostFrequent(conditions, 'description');
        const conditionIcon = conditions.find(c => c.description === mostCommon)?.icon || dayForecast[0].icon;

        // Create forecast card
        const card = document.createElement('div');
        card.className = 'forecast-card fade-in';
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="forecast-day">${index === 0 ? 'Today' : day}</div>
            <div class="forecast-icon">
                <img src="${ICON_URL}${conditionIcon}@2x.png" alt="${mostCommon}">
            </div>
            <div class="forecast-temp">
                ${maxTemp}° <span class="min-temp">${minTemp}°</span>
            </div>
            <div class="forecast-desc">${mostCommon}</div>
        `;

        forecastContainer.appendChild(card);
    });
}

// Helper function to get most frequent item in array
function getMostFrequent(arr, key) {
    const counts = {};
    let maxCount = 0;
    let mostFrequent;

    arr.forEach(item => {
        const value = key ? item[key] : item;
        counts[value] = (counts[value] || 0) + 1;

        if (counts[value] > maxCount) {
            maxCount = counts[value];
            mostFrequent = value;
        }
    });

    return mostFrequent;
}

// Update current time
function updateCurrentTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };

    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

// Show error message
function showError(message) {
    console.error('Show Error:', message);

    // Safely update error message if element exists
    if (errorMessage) {
        errorMessage.textContent = message;
        if (errorMessage.classList) {
            errorMessage.classList.remove('d-none');
        } else if (errorMessage.className) {
            // Fallback for older browsers
            errorMessage.className = errorMessage.className.replace(/\bd-none\b/g, '');
        }
    }

    // Safely hide weather card if it exists
    if (weatherCard && weatherCard.classList) {
        weatherCard.classList.add('d-none');
    }

    // Safely hide forecast if it exists
    if (forecast && forecast.classList) {
        forecast.classList.add('d-none');
    }

    // Hide error after 5 seconds if error message element exists
    if (errorMessage) {
        setTimeout(() => {
            if (errorMessage && errorMessage.classList) {
                errorMessage.classList.add('d-none');
            }
        }, 5000);
    }
}


// Cache management
function cacheWeather(city, data) {
    weatherCache[city.toLowerCase()] = {
        data: data,
        timestamp: Date.now()
    };

    // Save to localStorage
    localStorage.setItem('weatherCache', JSON.stringify(weatherCache));
}

function getCachedWeather(city) {
    const cachedData = weatherCache[city.toLowerCase()];

    if (!cachedData) return null;

    // Check if cache is expired
    const isExpired = Date.now() - cachedData.timestamp > CACHE_EXPIRY;

    if (isExpired) {
        // Remove expired cache
        delete weatherCache[city.toLowerCase()];
        localStorage.setItem('weatherCache', JSON.stringify(weatherCache));
        return null;
    }

    return cachedData.data;
}

// Initialize cache from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    const storedCache = localStorage.getItem('weatherCache');
    if (storedCache) {
        try {
            weatherCache = JSON.parse(storedCache);
        } catch (e) {
            console.error('Error parsing cache from localStorage', e);
            localStorage.removeItem('weatherCache');
        }
    }
});
