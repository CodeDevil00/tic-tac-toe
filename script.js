/* =========
   Utilities
   ========= */
function setCookie(name, value, days = 180) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; SameSite=Lax`;
}
function getCookie(name) {
  return document.cookie
    .split("; ")
    .find(row => row.startsWith(name + "="))
    ?.split("=")[1];
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => el.classList.remove("show"), 2400);
}

/* =========
   Theme toggle (stored in localStorage)
   ========= */
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  const icon = themeToggle?.querySelector(".icon");
  if (icon) icon.textContent = theme === "light" ? "🌞" : "🌙";
}
const savedTheme = localStorage.getItem("theme");
applyTheme(savedTheme || "dark");

themeToggle?.addEventListener("click", () => {
  const current = root.getAttribute("data-theme") || "dark";
  applyTheme(current === "dark" ? "light" : "dark");
  toast("Theme updated");
});

/* =========
   Mobile nav
   ========= */
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
navToggle?.addEventListener("click", () => {
  const open = navMenu.classList.toggle("show");
  navToggle.setAttribute("aria-expanded", String(open));
});

/* =========
   Cookie consent banner
   ========= */
const banner = document.getElementById("cookieBanner");
const consent = getCookie("mw_consent");
if (!consent) banner.classList.add("show");

document.getElementById("cookieAccept")?.addEventListener("click", () => {
  setCookie("mw_consent", "accepted");
  banner.classList.remove("show");
  toast("Cookies accepted");
});

document.getElementById("cookieDecline")?.addEventListener("click", () => {
  setCookie("mw_consent", "declined");
  banner.classList.remove("show");
  toast("Cookies declined");
});

/* =========
   Tips (fetch local JSON)
   ========= */
let tips = [];
let tipIndex = 0;

function renderTip() {
  const el = document.getElementById("tipText");
  if (!el) return;
  if (!tips.length) {
    el.textContent = "No tips available.";
    return;
  }
  el.textContent = tips[tipIndex % tips.length];
}

async function loadTips() {
  try {
    const res = await fetch("./data/tips.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load tips");
    tips = await res.json();
    tipIndex = Number(localStorage.getItem("tipIndex") || 0);
    renderTip();
  } catch (err) {
    document.getElementById("tipText").textContent =
      "Tip loader failed. (This can happen if you open the file directly without a local server.)";
  }
}
loadTips();

document.getElementById("nextTip")?.addEventListener("click", () => {
  tipIndex += 1;
  localStorage.setItem("tipIndex", String(tipIndex));
  renderTip();
});

document.getElementById("copyTip")?.addEventListener("click", async () => {
  const text = document.getElementById("tipText")?.textContent || "";
  try{
    await navigator.clipboard.writeText(text);
    toast("Copied tip to clipboard");
  }catch{
    toast("Copy failed (clipboard permission).");
  }
});

/* =========
   Form validation + preference ("remember me")
   ========= */
const remember = document.getElementById("rememberMe");
const remembered = localStorage.getItem("rememberMe");
if (remember) remember.checked = remembered === "true";

function setStatus(msg, ok) {
  const el = document.getElementById("formStatus");
  el.textContent = msg;
  el.className = "form-status " + (ok ? "ok" : "err");
}

document.getElementById("contactForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.currentTarget;

  const name = form.elements.namedItem("name").value.trim();
  const email = form.elements.namedItem("email").value.trim();
  const message = form.elements.namedItem("message").value.trim();

  const errors = [];
  if (name.length < 2) errors.push("Name must be at least 2 characters.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Enter a valid email.");
  if (message.length < 10) errors.push("Message must be at least 10 characters.");

  if (remember) localStorage.setItem("rememberMe", String(remember.checked));

  if (errors.length) {
    setStatus(errors.join(" "), false);
    toast("Please fix the form errors");
    return;
  }

  // No backend in this assignment: simulate submission
  setStatus("Submitted! (Simulated) Your input was validated on the client.", true);
  toast("Form submitted");
  form.reset();
  if (remember) remember.checked = localStorage.getItem("rememberMe") === "true";
});

/* =========
   Toast demo button
   ========= */
document.getElementById("toastBtn")?.addEventListener("click", () => {
  toast("This is a micro-interaction: instant feedback without page reload.");
});

/* =========
   Reset preferences
   ========= */
document.getElementById("resetPrefs")?.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("theme");
  localStorage.removeItem("tipIndex");
  localStorage.removeItem("rememberMe");
  setCookie("mw_consent", "", -1);
  toast("Preferences reset. Refresh the page.");
});
