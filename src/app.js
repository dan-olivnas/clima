import { geocodeCity, getCurrentWeather, getWeatherDescription, getWeatherEmoji } from "./api/openMeteoClient.js";

const form = document.getElementById("city-form");
const input = document.getElementById("city-input");
const output = document.getElementById("output");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = input.value.trim();
  if (!city) return;

  setUIState({ loading: true });

  try {
    const { latitude, longitude, label } = await geocodeCity(city);
    const weather = await getCurrentWeather(latitude, longitude);

    const msg = `Temperatura atual em ${label}: ${weather.temperatureC} °C`;
    console.log(msg);
    renderWeather(label, weather);
  } catch (err) {
    console.error(err);
    renderError(err.message);
  } finally {
    setUIState({ loading: false });
  }
});

function renderWeather(cityLabel, weather) {
  const emoji = getWeatherEmoji(weather.weatherCode);
  const description = getWeatherDescription(weather.weatherCode);
  
  output.innerHTML = `
    <div class="weather-card">
      <div class="weather-header">
        <div class="weather-emoji">${emoji}</div>
        <div class="weather-info">
          <h2 class="city-name">${cityLabel}</h2>
          <p class="weather-description">${description}</p>
        </div>
      </div>
      
      <div class="temperature-main">
        <span class="temp-value">${Math.round(weather.temperatureC)}</span>
        <span class="temp-unit">°C</span>
      </div>
      
      <div class="weather-details">
        <div class="detail-item">
          <span class="detail-label">Sensação térmica</span>
          <span class="detail-value">${Math.round(weather.apparentTemperatureC)}°C</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Umidade</span>
          <span class="detail-value">${weather.humidity}%</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Vento</span>
          <span class="detail-value">${Math.round(weather.windSpeed)} m/s</span>
        </div>
      </div>
    </div>
  `;
  output.classList.remove("error");
  output.classList.add("success");
}

function renderError(message) {
  output.innerHTML = `
    <div class="error-message">
      <span class="error-icon">⚠️</span>
      <span class="error-text">${message}</span>
    </div>
  `;
  output.classList.remove("success");
  output.classList.add("error");
}

function setUIState({ loading }) {
  const btn = form.querySelector("button[type=submit]");
  btn.disabled = !!loading;
  if (loading) {
    output.innerHTML = '<div class="loading">Buscando clima...</div>';
    output.classList.remove("error", "success");
  }
}
