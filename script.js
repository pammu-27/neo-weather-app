const apiKey = 'ec7f7d5d778697df846d43ad1c4f40ab'; // Replace with your OpenWeatherMap API key
const apiBase = 'https://api.openweathermap.org/data/2.5/weather';

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const gpsBtn = document.getElementById("gps-btn");
const weatherInfo = document.getElementById("weather-info");
const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const loader = document.getElementById("loader");
const error = document.getElementById("error");
const themeToggle = document.getElementById("theme-toggle");
const unitToggle = document.getElementById("unit-toggle");
const addFavorite = document.getElementById("add-favorite");
const favoriteList = document.getElementById("favorite-list");

let isCelsius = true;
let currentCity = '';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function showLoader() {
  loader.classList.remove('hidden');
  weatherInfo.classList.add('hidden');
  error.classList.add('hidden');
}

function hideLoader() {
  loader.classList.add('hidden');
}

function showError(message) {
  error.textContent = message;
  error.classList.remove('hidden');
  weatherInfo.classList.add('hidden');
}

function updateBackground(condition) {
  const body = document.body;
  body.classList.remove('clear', 'rain', 'snow', 'night');
  if (condition.includes('clear')) body.classList.add('clear');
  else if (condition.includes('rain') || condition.includes('drizzle')) body.classList.add('rain');
  else if (condition.includes('snow')) body.classList.add('snow');
  else if (condition.includes('night')) body.classList.add('night');
}

function displayWeather(data) {
  const temp = isCelsius ? Math.round(data.main.temp - 273.15) : Math.round((data.main.temp - 273.15) * 9/5 + 32);
  const unit = isCelsius ? '°C' : '°F';
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  temperature.textContent = `${temp}${unit}`;
  condition.textContent = `${data.weather[0].description}`;
  humidity.textContent = `${data.main.humidity}%`;
  wind.textContent = `${data.wind.speed} m/s`;
  sunrise.textContent = `${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}`;
  sunset.textContent = `${new Date(data.sys.sunset * 1000).toLocaleTimeString()}`;
  weatherInfo.classList.remove('hidden');
  updateBackground(data.weather[0].description.toLowerCase());
}

async function fetchWeatherByCity(city) {
  showLoader();
  try {
    const response = await fetch(`${apiBase}?q=${city}&appid=${apiKey}`);
    if (!response.ok) throw new Error('City not found');
    const data = await response.json();
    currentCity = city;
    displayWeather(data);
    localStorage.setItem('lastCity', city);
  } catch (err) {
    showError(err.message);
  } finally {
    hideLoader();
  }
}

async function fetchWeatherByCoords(lat, lon) {
  showLoader();
  try {
    const response = await fetch(`${apiBase}?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    if (!response.ok) throw new Error('Unable to fetch weather');
    const data = await response.json();
    currentCity = data.name;
    displayWeather(data);
    localStorage.setItem('lastCity', data.name);
  } catch (err) {
    showError(err.message);
  } finally {
    hideLoader();
  }
}

function updateFavorites() {
  favoriteList.innerHTML = '';
  favorites.forEach(city => {
    const li = document.createElement('li');
    li.textContent = city;
    li.addEventListener('click', () => fetchWeatherByCity(city));
    favoriteList.appendChild(li);
  });
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) fetchWeatherByCity(city);
});

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const city = cityInput.value.trim();
    if (city) fetchWeatherByCity(city);
  }
});

gpsBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      () => showError('Unable to access location')
    );
  } else {
    showError('Geolocation not supported');
  }
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  const cyberpunkIcon = themeToggle.querySelector('.cyberpunk-icon');
  const lightIcon = themeToggle.querySelector('.light-icon');
  if (document.body.classList.contains('light-mode')) {
    cyberpunkIcon.classList.add('hidden');
    lightIcon.classList.remove('hidden');
  } else {
    cyberpunkIcon.classList.remove('hidden');
    lightIcon.classList.add('hidden');
  }
});

unitToggle.addEventListener('click', () => {
  isCelsius = !isCelsius;
  unitToggle.textContent = isCelsius ? '°C' : '°F';
  if (currentCity) fetchWeatherByCity(currentCity);
});

addFavorite.addEventListener('click', () => {
  if (currentCity && !favorites.includes(currentCity)) {
    favorites.push(currentCity);
    updateFavorites();
  }
});

window.addEventListener('load', () => {
  updateFavorites();
  const lastCity = localStorage.getItem('lastCity');
  if (lastCity) fetchWeatherByCity(lastCity);
});

document.querySelectorAll('.ripple').forEach(button => {
  button.addEventListener('click', (e) => {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});