/* ==========================================================
   Aly Salem – Personal CV
   Assignment 2: JavaScript interactivity

   Features:
   1. Welcome message on page load
   2. Dark mode / light mode toggle
   3. Show / hide sections
   4. Dynamic skills list
   5. Contact form with validation
   ========================================================== */

"use strict";

/* ----------------------------------------------------------
   1. WELCOME MESSAGE
   Shows a greeting banner when the page loads.
   ---------------------------------------------------------- */
function initWelcomeMessage() {
  const banner = document.getElementById("welcome");
  const text = document.getElementById("welcome-text");
  const closeBtn = document.getElementById("welcome-close");

  // Pick a greeting based on the visitor's local time
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  text.textContent = greeting + "! Welcome to my portfolio page!";
  banner.hidden = false;

  // Hide the banner when the visitor clicks the close button
  closeBtn.addEventListener("click", () => {
    banner.hidden = true;
  });

  // Hide it automatically after 7 seconds
  setTimeout(() => {
    banner.hidden = true;
  }, 7000);
}

/* ----------------------------------------------------------
   2. DARK MODE / LIGHT MODE
   Sets data-theme="dark" or "light" on <html>. The CSS changes
   its colour variables based on that attribute. The choice is
   remembered with localStorage.
   ---------------------------------------------------------- */
function initThemeToggle() {
  const button = document.getElementById("theme-toggle");
  const root = document.documentElement;

  // Apply a theme and update the button text
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    const isDark = theme === "dark";
    button.textContent = isDark ? "Light mode" : "Dark mode";
    button.setAttribute("aria-pressed", String(isDark));
  }

  // Start with the saved theme, or the visitor's system preference
  let saved = null;
  try {
    saved = localStorage.getItem("theme");
  } catch (e) {
    // localStorage may be unavailable; ignore
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));

  // Switch theme on click
  button.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      // ignore
    }
  });
}

/* ----------------------------------------------------------
   3. SHOW / HIDE SECTIONS
   Every button with a data-toggle attribute shows or hides the
   element whose id matches that attribute.
   ---------------------------------------------------------- */
function initSectionToggles() {
  const buttons = document.querySelectorAll("[data-toggle]");

  buttons.forEach((button) => {
    const target = document.getElementById(button.dataset.toggle);
    const label = button.dataset.label;

    button.addEventListener("click", () => {
      const willHide = !target.hidden;
      target.hidden = willHide;
      button.setAttribute("aria-expanded", String(!willHide));
      button.textContent = (willHide ? "Show " : "Hide ") + label;
    });
  });
}

/* ----------------------------------------------------------
   4. DYNAMIC SKILLS LIST
   Lets the visitor type a skill and add it to the page instantly.
   ---------------------------------------------------------- */
function initSkillForm() {
  const form = document.getElementById("skill-form");
  const input = document.getElementById("skill-input");
  const feedback = document.getElementById("skill-feedback");
  const group = document.getElementById("custom-skills-group");
  const list = document.getElementById("custom-skills");

  // Collect the names of all skills already on the page (lowercase)
  function existingSkills() {
    const chips = document.querySelectorAll("#skills-content .chips li");
    return Array.from(chips).map((li) => li.textContent.trim().toLowerCase());
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // stop the page from reloading

    const skill = input.value.trim();

    // Validation
    if (skill === "") {
      feedback.textContent = "Please type a skill first.";
      feedback.className = "form-feedback is-error";
      input.focus();
      return;
    }
    if (existingSkills().includes(skill.toLowerCase())) {
      feedback.textContent = "\"" + skill + "\" is already in the list.";
      feedback.className = "form-feedback is-error";
      input.focus();
      return;
    }

    // Create the new list item and add it to the page
    const item = document.createElement("li");
    item.textContent = skill; // textContent keeps user input safe
    list.appendChild(item);
    group.hidden = false;

    feedback.textContent = "Added \"" + skill + "\" to the skills list.";
    feedback.className = "form-feedback is-success";
    form.reset();
    input.focus();
  });
}

/* ----------------------------------------------------------
   5. CONTACT FORM WITH VALIDATION
   Checks that all fields are filled in and the email format is
   valid. Shows error or success messages without reloading.
   ---------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  // Simple email pattern: text@text.text
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const fields = {
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    message: document.getElementById("message"),
  };

  // Show or clear an error for one field
  function setError(field, message) {
    const errorBox = document.getElementById(field.id + "-error");
    errorBox.textContent = message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
    field.classList.toggle("has-error", Boolean(message));
  }

  // Return an error message for a field, or "" if it is valid
  function validateField(field) {
    const value = field.value.trim();

    if (value === "") {
      return "This field is required.";
    }
    if (field === fields.email && !emailPattern.test(value)) {
      return "Please enter a valid email address (for example name@example.com).";
    }
    if (field === fields.message && value.length < 10) {
      return "Your message should be at least 10 characters long.";
    }
    return "";
  }

  // Validate every field; return true if all are valid
  function validateForm() {
    let isValid = true;
    Object.values(fields).forEach((field) => {
      const error = validateField(field);
      setError(field, error);
      if (error) isValid = false;
    });
    return isValid;
  }

  // Re-check a field as soon as the visitor leaves it or edits it
  Object.values(fields).forEach((field) => {
    field.addEventListener("blur", () => setError(field, validateField(field)));
    field.addEventListener("input", () => {
      if (field.classList.contains("has-error")) {
        setError(field, validateField(field));
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // stop the page from reloading
    status.textContent = "";
    status.className = "form-feedback";

    if (!validateForm()) {
      status.textContent = "Please fix the errors above and try again.";
      status.className = "form-feedback is-error";
      // Move focus to the first invalid field
      const firstInvalid = form.querySelector(".has-error");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // All fields are valid: show a success message and clear the form
    const name = fields.name.value.trim();
    status.textContent = "Thank you, " + name + "! Your message was sent successfully.";
    status.className = "form-feedback is-success";
    form.reset();
    Object.values(fields).forEach((field) => setError(field, ""));
  });
}

/* ----------------------------------------------------------
   Start everything once the page has loaded
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initWelcomeMessage();
  initSectionToggles();
  initSkillForm();
  initContactForm();
});
