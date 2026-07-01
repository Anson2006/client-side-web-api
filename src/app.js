// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherDisplay = document.getElementById('weather-display');
const cityNameEl = document.getElementById('city-name');
const tempEl = document.getElementById('temperature');
const descEl = document.getElementById('description');
const moodInput = document.getElementById('mood-input');
const saveLogBtn = document.getElementById('save-log-btn');
const logsList = document.getElementById('logs-list');
const clearLogsBtn = document.getElementById('clear-logs-btn');
const themeToggle = document.getElementById('theme-toggle');

let currentWeatherData = null;

// --- 1. INITIALIZE APP (Load from Client-side Storage) ---
document.addEventListener('DOMContentLoaded', () => {
    // Load Saved Theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    // Load Saved Logs
    renderLogs();
});

// --- 2. THEME TOGGLE INTERACTION ---
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light'); // Client-side storage
});

// --- 3. FETCH DATA FROM THIRD-PARTY APIs ---
searchBtn.addEventListener('click', async () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return alert('Please enter a city name');

    try {
        // Step A: Geocode city name to get Latitude and Longitude
        const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (geoData.length === 0) throw new Error('City not found');

        const { lat, lon, display_name } = geoData[0];
        const shortName = display_name.split(',')[0];

        // Step B: Fetch Weather data using coordinates
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        // Step C: Update UI
        currentWeatherData = {
            city: shortName,
            temp: weatherData.current_weather.temperature,
            windspeed: weatherData.current_weather.windspeed
        };

        displayWeather(currentWeatherData);
    } catch (error) {
        alert('Error fetching weather data: ' + error.message);
    }
});

function displayWeather(data) {
    cityNameEl.textContent = data.city;
    tempEl.textContent = `Temperature: ${data.temp}°C`;
    descEl.textContent = `Wind Speed: ${data.windspeed} km/h`;
    weatherDisplay.classList.remove('hidden');
    moodInput.value = ''; // Reset input
}

// --- 4. USER INTERACTION & STORAGE (Save Logs) ---
saveLogBtn.addEventListener('click', () => {
    const mood = moodInput.value.trim();
    if (!mood) return alert('Please type how you feel first!');

    const newLog = {
        id: Date.now(),
        city: currentWeatherData.city,
        temp: currentWeatherData.temp,
        mood: mood,
        date: new Date().toLocaleDateString()
    };

    // Get existing logs or initialize empty array
    const existingLogs = JSON.parse(localStorage.getItem('weatherLogs')) || [];
    existingLogs.push(newLog);
    
    // Save back to LocalStorage
    localStorage.setItem('weatherLogs', JSON.stringify(existingLogs));
    
    renderLogs();
    moodInput.value = ''; 
});

// Render list items from LocalStorage
function renderLogs() {
    logsList.innerHTML = '';
    const logs = JSON.parse(localStorage.getItem('weatherLogs')) || [];
    
    logs.reverse().forEach(log => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${log.date} - ${log.city}</strong>: ${log.temp}°C | <em>Feeling: ${log.mood}</em>`;
        logsList.appendChild(li);
    });
}

// Clear Storage
clearLogsBtn.addEventListener('click', () => {
    localStorage.removeItem('weatherLogs');
    renderLogs();
});