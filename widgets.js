/* ==========================================================
   Aly Salem – Personal CV
   Assignment 3: API widgets

   Uses the Api object from api.js and updates the page.
   Every widget follows the same three states:
     1. Loading  – "Loading…" while the request is running
     2. Success  – the data is drawn into the page
     3. Error    – a friendly message and a "Try again" button
   ========================================================== */

"use strict";

/* Set this to your GitHub username to show your repositories
   automatically when the page opens (for example "alysalem11").
   Visitors can also type any username into the form. */
const GITHUB_USERNAME = "alysalem11";

/* ----------------------------------------------------------
   Shared helpers for the three states
   ---------------------------------------------------------- */

// Show a "Loading…" message inside a container
function showLoading(container, message) {
  const text = document.createElement("p");
  text.className = "api-status";
  text.textContent = message;
  container.setAttribute("aria-busy", "true");
  container.replaceChildren(text);
}

// Show an error message, with an optional "Try again" button
function showError(container, message, onRetry) {
  const text = document.createElement("p");
  text.className = "api-status is-error";
  text.textContent = message;
  container.setAttribute("aria-busy", "false");
  container.replaceChildren(text);

  if (onRetry) {
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "toggle-btn";
    retry.textContent = "Try again";
    retry.addEventListener("click", onRetry);
    container.appendChild(retry);
  }
}

// Create a small element with text (keeps API data safe from HTML injection)
function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

/* ----------------------------------------------------------
   WEATHER WIDGET (Open-Meteo)
   ---------------------------------------------------------- */

// Cities the visitor can choose from
const CITIES = [
  { name: "Cairo, Egypt", latitude: 30.04, longitude: 31.24 },
  { name: "Alexandria, Egypt", latitude: 31.2, longitude: 29.92 },
  { name: "Dubai, UAE", latitude: 25.2, longitude: 55.27 },
  { name: "London, UK", latitude: 51.51, longitude: -0.13 },
  { name: "Paris, France", latitude: 48.86, longitude: 2.35 },
  { name: "New York, USA", latitude: 40.71, longitude: -74.01 },
  { name: "Tokyo, Japan", latitude: 35.68, longitude: 139.69 },
];

// Turn Open-Meteo's weather code into a text condition and an icon
function describeWeather(code, isDay) {
  if (code === 0) return { text: "Clear sky", icon: isDay ? "☀️" : "🌙" };
  if (code === 1) return { text: "Mainly clear", icon: isDay ? "🌤️" : "🌙" };
  if (code === 2) return { text: "Partly cloudy", icon: "⛅" };
  if (code === 3) return { text: "Overcast", icon: "☁️" };
  if (code === 45 || code === 48) return { text: "Fog", icon: "🌫️" };
  if (code >= 51 && code <= 57) return { text: "Drizzle", icon: "🌦️" };
  if (code >= 61 && code <= 67) return { text: "Rain", icon: "🌧️" };
  if (code >= 71 && code <= 77) return { text: "Snow", icon: "🌨️" };
  if (code >= 80 && code <= 82) return { text: "Rain showers", icon: "🌧️" };
  if (code === 85 || code === 86) return { text: "Snow showers", icon: "🌨️" };
  if (code >= 95) return { text: "Thunderstorm", icon: "⛈️" };
  return { text: "Unknown conditions", icon: "🌡️" };
}

function initWeather() {
  const select = document.getElementById("city-select");
  const refresh = document.getElementById("weather-refresh");
  const output = document.getElementById("weather-output");

  // Fill the dropdown from the CITIES list
  CITIES.forEach((city, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = city.name;
    select.appendChild(option);
  });

  // Fetch and draw the weather for the selected city
  async function loadWeather() {
    const city = CITIES[Number(select.value)];
    showLoading(output, "Loading weather for " + city.name + "…");

    try {
      const weather = await Api.getWeather(city.latitude, city.longitude);
      const condition = describeWeather(weather.weatherCode, weather.isDay);

      // Main row: icon, temperature and condition
      const main = makeElement("div", "weather-main");
      const icon = makeElement("span", "weather-icon", condition.icon);
      icon.setAttribute("aria-hidden", "true");
      const summary = makeElement("div");
      summary.appendChild(makeElement("p", "weather-temp", Math.round(weather.temperature) + "°C"));
      summary.appendChild(makeElement("p", "weather-condition", condition.text));
      main.append(icon, summary);

      // Extra details
      const details = makeElement("ul", "weather-details");
      details.appendChild(makeElement("li", "", "Feels like " + Math.round(weather.feelsLike) + "°C"));
      details.appendChild(makeElement("li", "", "Humidity " + weather.humidity + "%"));
      details.appendChild(makeElement("li", "", "Wind " + weather.windSpeed + " km/h"));

      output.setAttribute("aria-busy", "false");
      output.replaceChildren(main, details);
    } catch (error) {
      showError(output, "Could not load the weather. Please check your connection and try again.", loadWeather);
    }
  }

  select.addEventListener("change", loadWeather);
  refresh.addEventListener("click", loadWeather);
  loadWeather(); // load Cairo when the page opens
}

/* ----------------------------------------------------------
   QUOTE WIDGET (DummyJSON)
   ---------------------------------------------------------- */
function initQuote() {
  const output = document.getElementById("quote-output");
  const button = document.getElementById("quote-new");

  async function loadQuote() {
    showLoading(output, "Loading quote…");
    button.disabled = true;

    try {
      const quote = await Api.getQuote();

      const block = makeElement("blockquote", "quote-text", "\u201C" + quote.text + "\u201D");
      const author = makeElement("p", "quote-author", "\u2014 " + quote.author);

      output.setAttribute("aria-busy", "false");
      output.replaceChildren(block, author);
    } catch (error) {
      showError(output, "Could not load a quote. Please try again.", loadQuote);
    } finally {
      button.disabled = false;
    }
  }

  button.addEventListener("click", loadQuote);
  loadQuote(); // show a quote when the page opens
}

/* ----------------------------------------------------------
   GITHUB REPOSITORIES (GitHub REST API)
   ---------------------------------------------------------- */
function initGithubRepos() {
  const form = document.getElementById("github-form");
  const input = document.getElementById("github-user");
  const output = document.getElementById("repo-list");

  // Build one card for a repository
  function buildRepoCard(repo) {
    const card = makeElement("article", "card");

    const title = makeElement("h3");
    const link = makeElement("a", "", repo.name);
    link.href = repo.url;
    link.target = "_blank";
    link.rel = "noopener";
    title.appendChild(link);

    const description = makeElement("p", "", repo.description || "No description provided.");

    const meta = makeElement("ul", "tags");
    meta.appendChild(makeElement("li", "", repo.language || "No language"));
    meta.appendChild(makeElement("li", "", "★ " + repo.stars));

    card.append(title, description, meta);
    return card;
  }

  // Turn an error into a message a visitor can understand
  function describeError(error, username) {
    if (error.status === 404) return "No GitHub user named \"" + username + "\" was found.";
    if (error.status === 403) return "GitHub's request limit was reached. Please try again in a few minutes.";
    return "Could not load repositories. Please check your connection and try again.";
  }

  async function loadRepos(username) {
    showLoading(output, "Loading repositories for " + username + "…");

    try {
      const repos = await Api.getRepos(username);

      if (repos.length === 0) {
        showError(output, username + " has no public repositories yet.");
        return;
      }

      output.setAttribute("aria-busy", "false");
      output.replaceChildren(...repos.map(buildRepoCard));
    } catch (error) {
      showError(output, describeError(error, username), () => loadRepos(username));
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = input.value.trim();

    if (username === "") {
      showError(output, "Please type a GitHub username first.");
      input.focus();
      return;
    }
    loadRepos(username);
  });

  // Load the default username when the page opens, if one is set
  if (GITHUB_USERNAME) {
    input.value = GITHUB_USERNAME;
    loadRepos(GITHUB_USERNAME);
  } else {
    const hint = makeElement("p", "api-status", "Enter a GitHub username above to load its public repositories.");
    output.replaceChildren(hint);
  }
}
