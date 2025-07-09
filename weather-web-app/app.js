// Visual Crossing API configuration
const API_KEY = '32FZNMH2XD8TG39HG3HM8KVPS'; // Replace with your actual API key
const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

// DOM elements (same as before)
const form = document.getElementById('weather-form');
const locationInput = document.getElementById('location-input');
const loadingDiv = document.getElementById('loading');
const weatherDisplay = document.getElementById('weather-display');
const errorMessage = document.getElementById('error-message');

// Weather data elements (same as before)
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temp');
const description = document.getElementById('description');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const weatherIcon = document.getElementById('weather-icon');

// Function to fetch weather data from Visual Crossing API
async function fetchWeatherData(location) {
    try {
        // Visual Crossing Timeline API URL structure
        const url = `${BASE_URL}/${encodeURIComponent(location)}?unitGroup=metric&key=${API_KEY}&contentType=json`;
        console.log('Fetching weather data for:', location);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Raw API response:', data);
        
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

// Function to process Visual Crossing API response
function processWeatherData(rawData) {
    // Visual Crossing returns current conditions and forecast data
    const currentConditions = rawData.currentConditions;
    const todayData = rawData.days[0]; // Today's data
    
    const processedData = {
        city: rawData.resolvedAddress, // Visual Crossing provides resolved address
        temperature: Math.round(currentConditions.temp),
        feelsLike: Math.round(currentConditions.feelslike),
        description: currentConditions.conditions,
        humidity: currentConditions.humidity,
        windSpeed: currentConditions.windspeed,
        icon: currentConditions.icon,
        // Additional data available from Visual Crossing
        visibility: currentConditions.visibility,
        uvIndex: currentConditions.uvindex,
        pressure: currentConditions.pressure
    };
    
    console.log('Processed weather data:', processedData);
    return processedData;
}

// Function to display weather information
function displayWeatherInfo(weatherData) {
    cityName.textContent = weatherData.city;
    temperature.textContent = weatherData.temperature;
    description.textContent = weatherData.description;
    feelsLike.textContent = weatherData.feelsLike;
    humidity.textContent = weatherData.humidity;
    windSpeed.textContent = weatherData.windSpeed;
    
    // Load weather icon
    loadWeatherIcon(weatherData.icon);
    
    // Show weather display and hide other elements
    weatherDisplay.classList.remove('hidden');
    errorMessage.classList.add('hidden');
}

// Visual Crossing icon mapping function
async function loadWeatherIcon(iconCode) {
    try {
        // Visual Crossing uses descriptive icon names like 'clear-day', 'rain', etc.
        const iconMap = {
            'clear-day': '☀️',
            'clear-night': '🌙',
            'partly-cloudy-day': '⛅',
            'partly-cloudy-night': '☁️',
            'cloudy': '☁️',
            'rain': '🌧️',
            'snow': '❄️',
            'sleet': '🌨️',
            'wind': '💨',
            'fog': '🌫️',
            'thunder': '⛈️',
            'thunderstorms': '⛈️',
            'hail': '🌨️'
        };
        
        const emoji = iconMap[iconCode] || '🌤️';
        weatherIcon.innerHTML = `<span class="weather-emoji">${emoji}</span>`;
    } catch (error) {
        console.error('Error loading weather icon:', error);
        weatherIcon.innerHTML = '🌤️'; // Fallback emoji
    }
}

// Show/hide loading functions (same as before)
function showLoading() {
    loadingDiv.classList.remove('hidden');
    weatherDisplay.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

function hideLoading() {
    loadingDiv.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    weatherDisplay.classList.add('hidden');
}

// Main function to handle weather fetching
async function getWeather(location) {
    try {
        showLoading();
        
        const rawData = await fetchWeatherData(location);
        const processedData = processWeatherData(rawData);
        
        hideLoading();
        displayWeatherInfo(processedData);
        
    } catch (error) {
        hideLoading();
        console.error('Error getting weather:', error);
        
        if (error.message.includes('400')) {
            showError('Invalid location. Please check the spelling and try again.');
        } else if (error.message.includes('401')) {
            showError('API key error. Please check your API configuration.');
        } else {
            showError('Failed to fetch weather data. Please try again later.');
        }
    }
}

// Form submission handler (same as before)
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const location = locationInput.value.trim();
    
    if (!location) {
        showError('Please enter a location.');
        return;
    }
    
    await getWeather(location);
});
