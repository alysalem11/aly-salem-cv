/* ==========================================================
   Aly Salem – Personal CV
   Assignment 3: API layer

   This file only talks to the network. It fetches data from
   three public APIs and returns clean JavaScript objects.
   widgets.js is responsible for showing that data on the page.

   APIs used (all free, no API key needed):
   - Open-Meteo   https://open-meteo.com          (weather)
   - DummyJSON    https://dummyjson.com/docs/quotes (quotes)
   - GitHub REST  https://docs.github.com/rest     (repositories)
   ========================================================== */

"use strict";

const Api = (() => {
  const TIMEOUT_MS = 10000; // give up on a request after 10 seconds

  /**
   * Fetch a URL and return the parsed JSON.
   * Throws an Error (with a .status property) if the request
   * fails, times out, or the server answers with an error code.
   */
  async function getJson(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        const error = new Error("Request failed with status " + response.status);
        error.status = response.status;
        throw error;
      }
      return await response.json();
    } catch (error) {
      if (error.name === "AbortError") {
        const timeout = new Error("The request timed out.");
        timeout.status = 0;
        throw timeout;
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  /** Current weather for a latitude / longitude (Open-Meteo). */
  async function getWeather(latitude, longitude) {
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=" + encodeURIComponent(latitude) +
      "&longitude=" + encodeURIComponent(longitude) +
      "&current=temperature_2m,apparent_temperature,relative_humidity_2m," +
      "wind_speed_10m,weather_code,is_day&timezone=auto";

    const data = await getJson(url);
    const current = data.current;

    return {
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
      isDay: current.is_day === 1,
    };
  }

  /** One random quote (DummyJSON). */
  async function getQuote() {
    const data = await getJson("https://dummyjson.com/quotes/random");
    return { text: data.quote, author: data.author };
  }

  /** Public repositories of a GitHub user, most recently updated first. */
  async function getRepos(username) {
    const url =
      "https://api.github.com/users/" +
      encodeURIComponent(username) +
      "/repos?sort=updated&per_page=6";

    const repos = await getJson(url);

    return repos.map((repo) => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      url: repo.html_url,
    }));
  }

  return { getWeather, getQuote, getRepos };
})();
