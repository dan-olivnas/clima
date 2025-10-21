import { fetchWithTimeout } from "../utils/fetchWithTimeout.js";

const GEO_BASE = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_BASE = "https://api.open-meteo.com/v1/forecast";

export async function geocodeCity(name) {
  const url = new URL(GEO_BASE);
  url.searchParams.set("name", name);
  url.searchParams.set("count", 1);
  url.searchParams.set("language", "pt");
  url.searchParams.set("format", "json");
  url.searchParams.set("country_code", "BR");

  const res = await fetchWithTimeout(url.toString());
  if (!res.ok) throw new Error(`Falha no geocoding: ${res.status}`);
  const data = await res.json();
  const results = (data?.results || []).filter(r => r.country_code === "BR");
  if (!results.length) throw new Error("Cidade não encontrada no Brasil");
  const { latitude, longitude, name: cityName, country, admin1 } = results[0];
  return { latitude, longitude, label: [cityName, admin1, country].filter(Boolean).join(", ") };
}

export async function getCurrentWeather(lat, lon) {
  const url = new URL(FORECAST_BASE);
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m");
  url.searchParams.set("timezone", "auto");

  const res = await fetchWithTimeout(url.toString());
  if (!res.ok) throw new Error(`Falha no forecast: ${res.status}`);
  const data = await res.json();
  const current = data?.current;
  if (!current) throw new Error("Dados indisponíveis");
  
  return {
    temperatureC: current.temperature_2m,
    apparentTemperatureC: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    weatherCode: current.weather_code,
  };
}

export function getWeatherDescription(code) {
  const descriptions = {
    0: "Céu limpo",
    1: "Principalmente claro",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Nevoeiro",
    48: "Nevoeiro com geada",
    51: "Garoa leve",
    53: "Garoa moderada",
    55: "Garoa densa",
    61: "Chuva leve",
    63: "Chuva moderada",
    65: "Chuva forte",
    71: "Neve leve",
    73: "Neve moderada",
    75: "Neve forte",
    77: "Grãos de neve",
    80: "Pancadas de chuva leve",
    81: "Pancadas de chuva moderada",
    82: "Pancadas de chuva forte",
    85: "Pancadas de neve leve",
    86: "Pancadas de neve forte",
    95: "Tempestade",
    96: "Tempestade com granizo leve",
    99: "Tempestade com granizo forte",
  };
  return descriptions[code] || "Desconhecido";
}

export function getWeatherEmoji(code) {
  if (code === 0) return "☀️";
  if (code === 1 || code === 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if ([51, 53, 55].includes(code)) return "🌧️";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌡️";
}
