/* ============================================================
   EVOINVENT — app.js  v1.0  PROFESSIONAL EDITION
   Motor completo de la aplicación EvoInvent
   Autor: E.U.G.V | Sistema IA Local + Backend Python Ready
   ============================================================ */

"use strict";

/* ====================================================
   1. CONFIGURACIÓN GLOBAL Y CONSTANTES
   ==================================================== */

const CONFIG = {
  // URL del backend Python (Flask). Cambiar cuando esté listo.
  API_BASE_URL: "http://localhost:5000",
  API_ENDPOINTS: {
    generate:    "/api/generate",
    market:      "/api/market-analysis",
    pitch:       "/api/pitch-deck",
    guide:       "/api/build-guide",
    patents:     "/api/search-patents",
    costs:       "/api/calculate-costs",
    verdict:     "/api/verdict",
  },
  // Usar backend real o modo demo offline
  USE_BACKEND: false,
  VERSION: "1.0",
  APP_NAME: "EvoInvent",
};

/* Estado global de la aplicación */
const STATE = {
  currentUser: null,
  currentSection: "motor",
  currentInvento: null,           // Invento actualmente generado
  laboratorio: [],                // Array de inventos guardados
  kanbanData: {},                 // { inventoId: { idea:[], investigacion:[], ... } }
  currentKanbanInvento: null,
  feedPosts: [],
  adoptarItems: [],
  notifications: [],
  unreadNotifications: 0,
  goals: [],
  activity: [],
  pitchSlides: [],
  currentPitchSlide: 0,
  patentResults: [],
  mercadoResult: null,
  guiaResult: null,
  currentMode: "normal",
  labView: "grid",
  labFilter: "",
  labFilterCat: "",
  labSort: "fecha-desc",
  feedFilter: "todos",
  adoptatFilter: "todos",
  xp: 0,
  level: 1,
  achievements: [],
  streak: 0,
  lastActivityDate: null,
  sessions: 0,
  inventosGenerados: 0,
  guiasGeneradas: 0,
  publicaciones: 0,
  votosCount: 0,
  preferences: {
    animations: true,
    sounds: false,
    achievementNotifs: true,
    autosave: false,
    sidebarOpen: true,
    creativity: 7,
    expertMode: false,
    particles: true,
    grid: true,
    scanlines: true,
    reduced: false,
    accent: "cyan",
    lang: "es",
    currency: "MXN",
  },
  accentColors: {
    cyan:   "#00e5ff",
    purple: "#7c4dff",
    orange: "#ff6d00",
    green:  "#00e676",
    pink:   "#f50057",
    yellow: "#ffd600",
  },
};

/* Datos de logros disponibles */
const ACHIEVEMENTS_DATA = [
  { id: "primer_invento",    icon: "💡", name: "PRIMER DESTELLO",      desc: "Genera tu primer invento",                    xp: 50,   condition: () => STATE.inventosGenerados >= 1 },
  { id: "inventor_10",       icon: "🔬", name: "MENTE INQUIETA",       desc: "Genera 10 inventos",                          xp: 150,  condition: () => STATE.inventosGenerados >= 10 },
  { id: "inventor_50",       icon: "🚀", name: "MÁQUINA DE IDEAS",     desc: "Genera 50 inventos",                          xp: 500,  condition: () => STATE.inventosGenerados >= 50 },
  { id: "lab_guardado",      icon: "🧪", name: "LABORATORIO ACTIVO",   desc: "Guarda tu primer invento en el lab",          xp: 75,   condition: () => STATE.laboratorio.length >= 1 },
  { id: "lab_5",             icon: "📦", name: "COLECCIONISTA",        desc: "Guarda 5 inventos en el laboratorio",         xp: 200,  condition: () => STATE.laboratorio.length >= 5 },
  { id: "guia_generada",     icon: "📋", name: "MANOS A LA OBRA",      desc: "Genera tu primera guía de construcción",      xp: 100,  condition: () => STATE.guiasGeneradas >= 1 },
  { id: "publicador",        icon: "📡", name: "VOZ EN LA RED",        desc: "Publica tu primera idea en la comunidad",     xp: 80,   condition: () => STATE.publicaciones >= 1 },
  { id: "racha_3",           icon: "🔥", name: "EN RACHA",             desc: "Mantén una racha de 3 días seguidos",         xp: 120,  condition: () => STATE.streak >= 3 },
  { id: "racha_7",           icon: "⚡", name: "IMPARABLE",            desc: "Mantén una racha de 7 días seguidos",         xp: 300,  condition: () => STATE.streak >= 7 },
  { id: "kanban_activo",     icon: "🗂️", name: "GESTOR ESTRATÉGICO",  desc: "Mueve una tarjeta en el tablero Kanban",      xp: 60,   condition: () => false /* triggered manually */ },
  { id: "mercado_analizado", icon: "📊", name: "OJO DE MERCADO",       desc: "Genera tu primer análisis de mercado",        xp: 150,  condition: () => false },
  { id: "pitch_creado",      icon: "🎯", name: "PRESENTA Y CONQUISTA", desc: "Genera tu primer pitch deck",                 xp: 200,  condition: () => false },
  { id: "patente_buscada",   icon: "🛡️", name: "GUARDIÁN DE IDEAS",   desc: "Realiza tu primera búsqueda de patentes",    xp: 100,  condition: () => false },
  { id: "costos_calculados", icon: "💰", name: "NÚMERO MAESTRO",       desc: "Usa la calculadora de costos",                xp: 80,   condition: () => false },
  { id: "nivel_2",           icon: "⬆️", name: "ASCENSO",             desc: "Alcanza el nivel 2",                          xp: 0,    condition: () => STATE.level >= 2 },
  { id: "nivel_5",           icon: "🌟", name: "INVENTOR ESTRELLA",    desc: "Alcanza el nivel 5",                          xp: 0,    condition: () => STATE.level >= 5 },
  { id: "nivel_10",          icon: "🏆", name: "LEYENDA",              desc: "Alcanza el nivel 10",                         xp: 0,    condition: () => STATE.level >= 10 },
];

/* Niveles XP */
const LEVELS = [
  { level: 1,  title: "APRENDIZ",    minXp: 0,     color: "#6b8aaa" },
  { level: 2,  title: "INVENTOR",    minXp: 500,   color: "#00e5ff" },
  { level: 3,  title: "CREADOR",     minXp: 1200,  color: "#00b8d4" },
  { level: 4,  title: "INNOVADOR",   minXp: 2200,  color: "#7c4dff" },
  { level: 5,  title: "PIONERO",     minXp: 3500,  color: "#b47cff" },
  { level: 6,  title: "VISIONARIO",  minXp: 5500,  color: "#ff6d00" },
  { level: 7,  title: "MAESTRO",     minXp: 8000,  color: "#ffd600" },
  { level: 8,  title: "GENIO",       minXp: 11000, color: "#f50057" },
  { level: 9,  title: "LEGENDARIO",  minXp: 15000, color: "#00e676" },
  { level: 10, title: "LEYENDA",     minXp: 20000, color: "#ffffff" },
];

/* Retos del día */
const RETOS_POOL = [
  { text: "Diseña un sistema de recolección de agua de lluvia para zonas urbanas densas usando materiales reciclados y bajo costo.", categoria: "💧 Agua y Saneamiento", dificultad: "Intermedio" },
  { text: "Crea un dispositivo de bajo costo que genere energía eléctrica aprovechando el movimiento de personas en espacios públicos.", categoria: "⚡ Energía Limpia", dificultad: "Avanzado" },
  { text: "Inventa una app o herramienta que ayude a pequeños agricultores a optimizar riego usando sensores baratos.", categoria: "🌱 Medio Ambiente", dificultad: "Intermedio" },
  { text: "Diseña un sistema de diagnóstico médico básico para comunidades sin acceso a hospitales, usando un smartphone.", categoria: "🩺 Salud y Medicina", dificultad: "Avanzado" },
  { text: "Crea una plataforma de educación offline que funcione sin internet para escuelas rurales.", categoria: "📚 Educación", dificultad: "Intermedio" },
  { text: "Inventa un método para convertir residuos orgánicos domésticos en fertilizante de alta calidad en menos de 48 horas.", categoria: "🌾 Alimentación", dificultad: "Básico" },
  { text: "Diseña un vehículo de carga urbano que funcione con energía solar para el último kilómetro de delivery.", categoria: "🚲 Transporte", dificultad: "Avanzado" },
  { text: "Crea un sistema de comunicación de emergencia que funcione sin electricidad ni señal celular.", categoria: "📡 Comunicación", dificultad: "Avanzado" },
  { text: "Diseña una vivienda modular de emergencia que pueda armarse en menos de 2 horas con materiales locales.", categoria: "🏠 Construcción", dificultad: "Intermedio" },
  { text: "Inventa un sistema de monitoreo de calidad del aire en tiempo real de bajo costo para barrios.", categoria: "🌱 Medio Ambiente", dificultad: "Básico" },
  { text: "Crea un robot de bajo costo que ayude a personas mayores con movilidad reducida en tareas cotidianas.", categoria: "🤖 Tecnología Digital", dificultad: "Avanzado" },
  { text: "Diseña un sistema de purificación de agua solar para hogares sin acceso a agua potable.", categoria: "💧 Agua y Saneamiento", dificultad: "Básico" },
];

/* Inventos demo para comunidad */
const DEMO_INVENTOS_ADOPTAR = [
  { id: "ad1", emoji: "💧", nombre: "HydroSolar Purifier", categoria: "Agua y Saneamiento", catKey: "ambiente", desc: "Sistema de purificación solar de agua que elimina el 99.9% de bacterias usando radiación UV concentrada. Sin electricidad, sin químicos.", inventor: "MX_Lab", votos: 342, fecha: "2024-12-01" },
  { id: "ad2", emoji: "🌱", nombre: "BioFertilizer Box",   categoria: "Medio Ambiente",     catKey: "ambiente", desc: "Caja de compostaje acelerado que convierte residuos orgánicos en fertilizante líquido en 24h usando microorganismos optimizados.", inventor: "EcoHack", votos: 218, fecha: "2024-11-15" },
  { id: "ad3", emoji: "⚡", nombre: "PedoPower Grid",      categoria: "Energía Limpia",     catKey: "energia",  desc: "Sistema de baldosas piezoeléctric que convierte el paso de personas en espacios públicos en electricidad para iluminación LED.", inventor: "EnergiaX", votos: 189, fecha: "2024-11-20" },
  { id: "ad4", emoji: "🤖", nombre: "EduBot Offline",      categoria: "Educación",          catKey: "educacion",desc: "Robot educativo offline con IA local que enseña matemáticas y ciencias en escuelas sin internet usando Raspberry Pi.", inventor: "FuturoMX", votos: 156, fecha: "2024-10-30" },
  { id: "ad5", emoji: "🩺", nombre: "MediScan Lite",       categoria: "Salud y Medicina",   catKey: "salud",    desc: "Dispositivo de diagnóstico médico básico conectado a smartphone para detectar anemia, glucosa e hipertensión en comunidades rurales.", inventor: "SaludIA", votos: 290, fecha: "2024-12-05" },
  { id: "ad6", emoji: "🚲", nombre: "CargoSolar Trike",    categoria: "Transporte",         catKey: "tecnologia", desc: "Triciclo de carga eléctrico con panel solar integrado para reparto urbano. Rango 80km, carga 150kg, costo $8,000 MXN.", inventor: "UrbanMove", votos: 134, fecha: "2024-11-10" },
];

/* Posts demo de la red */
const DEMO_POSTS = [
  { id: "p1", autor: "InventorMX",  avatar: "I",  tipo: "idea",   texto: "Acabo de generar una idea para filtrar microplásticos del agua usando campos magnéticos y materiales biodegradables. ¿Alguien quiere colaborar?", tags: ["#agua", "#ambiente", "#microplasticos"], likes: 24, time: "hace 2h" },
  { id: "p2", autor: "EcoLab42",    avatar: "E",  tipo: "logro",  texto: "¡Mi invento BioFiltro Solar fue adoptado por una empresa de Guadalajara! 🎉 3 meses de iteración y por fin. Gracias a toda la comunidad.", tags: ["#logro", "#adopcion", "#emprendimiento"], likes: 87, time: "hace 5h" },
  { id: "p3", autor: "TechHacker",  avatar: "T",  tipo: "pregunta",texto: "¿Alguien sabe si usar Arduino Nano con sensor DHT22 es suficiente para medir humedad en sistemas de riego automatizado? Necesito precisión ±2%.", tags: ["#arduino", "#iot", "#riego"], likes: 12, time: "hace 1d" },
  { id: "p4", autor: "FuturoMX",    avatar: "F",  tipo: "busco",  texto: "Busco co-inventor con conocimientos en electrónica y energía solar para proyecto de iluminación pública autónoma. Tengo el diseño mecánico listo.", tags: ["#colaboracion", "#solar", "#iluminacion"], likes: 31, time: "hace 2d" },
];

/* ====================================================
   2. UTILIDADES Y HELPERS
   ==================================================== */

/**
 * Muestra un toast de notificación
 * @param {string} msg - Mensaje a mostrar
 * @param {string} type - "success" | "error" | "info" | "warning"
 * @param {number} duration - ms de duración
 */
function showToast(msg, type = "info", duration = 3200) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str || ""));
  return div.innerHTML;
}

/**
 * Formatea fecha relativa
 */
function relativeTime(dateStr) {
  const now = new Date();
  const d   = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60)    return "hace un momento";
  if (diff < 3600)  return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return `hace ${Math.floor(diff / 86400)}d`;
}

/**
 * Formatea número con separadores de miles
 */
function formatNum(n) {
  return Number(n).toLocaleString("es-MX");
}

/**
 * Genera un ID único
 */
function uid() {
  return `evo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Guarda el estado completo en localStorage
 */
function saveState() {
  try {
    const data = {
      laboratorio:      STATE.laboratorio,
      kanbanData:       STATE.kanbanData,
      feedPosts:        STATE.feedPosts,
      goals:            STATE.goals,
      activity:         STATE.activity,
      notifications:    STATE.notifications,
      xp:               STATE.xp,
      level:            STATE.level,
      achievements:     STATE.achievements,
      streak:           STATE.streak,
      lastActivityDate: STATE.lastActivityDate,
      sessions:         STATE.sessions,
      inventosGenerados:STATE.inventosGenerados,
      guiasGeneradas:   STATE.guiasGeneradas,
      publicaciones:    STATE.publicaciones,
      votosCount:       STATE.votosCount,
      preferences:      STATE.preferences,
    };
    localStorage.setItem(`evoinvent_data_${STATE.currentUser?.email || "guest"}`, JSON.stringify(data));
  } catch (e) {
    console.warn("Error al guardar estado:", e);
  }
}

/**
 * Carga el estado desde localStorage
 */
function loadState() {
  try {
    const raw = localStorage.getItem(`evoinvent_data_${STATE.currentUser?.email || "guest"}`);
    if (!raw) return;
    const data = JSON.parse(raw);
    Object.keys(data).forEach(k => {
      if (k in STATE) STATE[k] = data[k];
    });
  } catch (e) {
    console.warn("Error al cargar estado:", e);
  }
}

/* ====================================================
   3. SISTEMA DE AUTENTICACIÓN (localStorage)
   ==================================================== */

/**
 * Muestra el formulario de registro
 */
function showRegister() {
  document.getElementById("login-form").classList.remove("active");
  document.getElementById("register-form").classList.add("active");
}

/**
 * Muestra el formulario de login
 */
function showLogin() {
  document.getElementById("register-form").classList.remove("active");
  document.getElementById("login-form").classList.add("active");
}

/**
 * Registra un nuevo usuario
 */
function registerUser() {
  const name     = document.getElementById("reg-name").value.trim();
  const email    = document.getElementById("reg-email").value.trim();
  const spec     = document.getElementById("reg-specialty").value;
  const pass     = document.getElementById("reg-password").value;
  const confirm  = document.getElementById("reg-confirm").value;
  const errEl    = document.getElementById("reg-error");

  errEl.classList.add("hidden");

  if (!name)    return showError(errEl, "⚠ Ingresa tu nombre de inventor");
  if (!email || !/\S+@\S+\.\S+/.test(email)) return showError(errEl, "⚠ Correo inválido");
  if (pass.length < 6)  return showError(errEl, "⚠ La contraseña debe tener al menos 6 caracteres");
  if (pass !== confirm) return showError(errEl, "⚠ Las contraseñas no coinciden");

  // Verificar si ya existe
  const existing = localStorage.getItem(`evoinvent_user_${email}`);
  if (existing) return showError(errEl, "⚠ Este correo ya está registrado");

  const user = { name, email, spec, created: new Date().toISOString() };
  localStorage.setItem(`evoinvent_user_${email}`, JSON.stringify({ user, pass }));

  showToast("✅ Cuenta creada. ¡Bienvenido al sistema!", "success");
  setTimeout(() => loginWithUser(user), 800);
}

/**
 * Inicia sesión con un usuario
 */
function loginUser() {
  const email  = document.getElementById("login-email").value.trim();
  const pass   = document.getElementById("login-password").value;
  const errEl  = document.getElementById("login-error");

  errEl.classList.add("hidden");

  if (!email) return showError(errEl, "⚠ Ingresa tu correo");
  if (!pass)  return showError(errEl, "⚠ Ingresa tu contraseña");

  const stored = localStorage.getItem(`evoinvent_user_${email}`);
  if (!stored) return showError(errEl, "⚠ Correo no registrado. Regístrate primero.");

  const { user, pass: storedPass } = JSON.parse(stored);
  if (pass !== storedPass) return showError(errEl, "⚠ Contraseña incorrecta");

  loginWithUser(user);
}

/**
 * Modo demo: acceso sin registro
 */
function loginDemo() {
  const demoUser = {
    name:    "INVENTOR DEMO",
    email:   "demo@evoinvent.mx",
    spec:    "tecnologia",
    created: new Date().toISOString(),
  };
  loginWithUser(demoUser);
}

/**
 * Realiza el login efectivo y muestra la app
 */
function loginWithUser(user) {
  STATE.currentUser = user;
  loadState();
  updateStreak();
  STATE.sessions = (STATE.sessions || 0) + 1;
  saveState();

  document.getElementById("auth-section").classList.add("hidden");
  document.getElementById("main-app").classList.remove("hidden");

  initApp();
  showToast(`⚡ Bienvenido, ${user.name.split(" ")[0]}`, "success");
}

/**
 * Cierra sesión
 */
function logoutUser() {
  if (!confirm("¿Cerrar sesión?")) return;
  saveState();
  STATE.currentUser  = null;
  STATE.currentInvento = null;

  document.getElementById("main-app").classList.add("hidden");
  document.getElementById("auth-section").classList.remove("hidden");

  // Resetear formularios
  document.getElementById("login-email").value    = "";
  document.getElementById("login-password").value = "";
  showLogin();

  closeAllModals();
  showToast("Sesión cerrada", "info");
}

/**
 * Muestra un error en un elemento
 */
function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove("hidden");
  el.style.animation = "none";
  requestAnimationFrame(() => { el.style.animation = ""; });
}

/**
 * Toggle visibilidad contraseña
 */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPass = input.type === "password";
  input.type = isPass ? "text" : "password";
  btn.querySelector("i").className = isPass ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
}

/**
 * Fuerza de contraseña
 */
document.addEventListener("DOMContentLoaded", () => {
  const pwInput = document.getElementById("reg-password");
  if (pwInput) {
    pwInput.addEventListener("input", () => updatePwStrength(pwInput.value));
  }
});

function updatePwStrength(pass) {
  const fill  = document.getElementById("pw-strength-fill");
  const label = document.getElementById("pw-strength-label");
  if (!fill || !label) return;

  let score = 0;
  if (pass.length >= 6)  score++;
  if (pass.length >= 10) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  const levels = [
    { pct: "0%",   color: "transparent",   txt: "—" },
    { pct: "25%",  color: "#f50057",        txt: "MUY DÉBIL" },
    { pct: "50%",  color: "#ff6d00",        txt: "DÉBIL" },
    { pct: "75%",  color: "#ffd600",        txt: "MEDIA" },
    { pct: "90%",  color: "#00e5ff",        txt: "FUERTE" },
    { pct: "100%", color: "#00e676",        txt: "MUY FUERTE" },
  ];
  const lvl = levels[Math.min(score, 5)];
  fill.style.width      = lvl.pct;
  fill.style.background = lvl.color;
  label.textContent     = lvl.txt;
}

/* ====================================================
   4. INICIALIZACIÓN DE LA APP
   ==================================================== */

/**
 * Inicializa todos los módulos de la app después del login
 */
function initApp() {
  initClock();
  initHUDCanvas();
  initSidebar();
  renderSidebarUser();
  renderDashboard();
  renderLaboratorio();
  renderKanbanInventoSelect();
  renderMercadoSelect();
  renderCalculadoraSelect();
  renderPitchSelect();
  renderPatentesSelect();
  renderGuiaSelect();
  renderAdoptar();
  renderRedMentes();
  renderPerfilHeader();
  renderEstadisticas();
  renderLogros();
  renderPortafolio();
  renderHistorial();
  loadPreferences();
  initSuggestions();
  initRetoDia();
  initCharCounters();
  checkAllAchievements();
  navigate("motor", document.querySelector("[data-section='motor']"));
  addNotification("⚡ Sistema EvoInvent cargado correctamente", "system");
}

/* ====================================================
   5. RELOJ HUD
   ==================================================== */

function initClock() {
  function tick() {
    const el = document.getElementById("hud-clock");
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleTimeString("es-MX", { hour12: false });
  }
  tick();
  setInterval(tick, 1000);
}

/* ====================================================
   6. CANVAS HUD (partículas y fondo animado)
   ==================================================== */

let canvasAnim = null;

function initHUDCanvas() {
  const canvas = document.getElementById("hud-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // Partículas
  const particles = [];
  const count = STATE.preferences.particles ? 60 : 0;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.5 ? "0,229,255" : "124,77,255",
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!STATE.preferences.particles) { canvasAnim = requestAnimationFrame(draw); return; }

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width)  p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
    });

    // Líneas entre partículas cercanas
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,229,255,${0.04 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    canvasAnim = requestAnimationFrame(draw);
  }
  draw();
}

/* ====================================================
   7. SIDEBAR Y NAVEGACIÓN
   ==================================================== */

function initSidebar() {
  // Abrir sidebar por defecto en desktop
  if (window.innerWidth >= 768 && STATE.preferences.sidebarOpen) {
    document.getElementById("sidebar")?.classList.add("open");
  }
}

function toggleSidebar() {
  const sb  = document.getElementById("sidebar");
  const overlay = document.getElementById("sb-overlay");
  const ham = document.getElementById("hamburger");
  if (!sb) return;

  const isOpen = sb.classList.toggle("open");
  overlay?.classList.toggle("on", isOpen);
  ham?.setAttribute("aria-expanded", isOpen);
}

function closeSidebar() {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("sb-overlay")?.classList.remove("on");
  document.getElementById("hamburger")?.setAttribute("aria-expanded", "false");
}

/**
 * Navega a una sección específica
 */
function navigate(section, btnEl) {
  // Ocultar todas las secciones
  document.querySelectorAll(".app-section").forEach(s => s.classList.remove("active"));
  // Mostrar la sección objetivo
  const targetSection = document.getElementById(`section-${section}`);
  if (targetSection) targetSection.classList.add("active");

  // Actualizar nav items
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");
  else {
    const navBtn = document.querySelector(`[data-section="${section}"]`);
    if (navBtn) navBtn.classList.add("active");
  }

  STATE.currentSection = section;

  // Labels del topbar
  const labels = {
    motor:       ["// MOTOR DE INVENTOS", "CONVIERTE PROBLEMAS REALES EN INVENTOS POSIBLES"],
    dashboard:   ["// DASHBOARD",         "RESUMEN DE TU ACTIVIDAD COMO INVENTOR"],
    laboratorio: ["// LABORATORIO",       "TUS INVENTOS GUARDADOS Y GESTIONADOS"],
    kanban:      ["// TABLERO KANBAN",    "GESTIONA EL DESARROLLO DE TUS INVENTOS"],
    mercado:     ["// ANÁLISIS DE MERCADO", "EVALÚA EL POTENCIAL COMERCIAL DE TUS IDEAS"],
    calculadora: ["// CALCULADORA DE COSTOS", "ESTIMA INVERSIÓN Y RETORNO"],
    pitch:       ["// PITCH DECK",        "PRESENTA TUS IDEAS A INVERSIONISTAS"],
    patentes:    ["// BÚSQUEDA DE PATENTES", "VERIFICA LA NOVEDAD DE TUS INVENTOS"],
    "red-mentes":["// RED DE MENTES",     "CONECTA CON INVENTORES DEL MUNDO"],
    adoptar:     ["// ADOPTAR UN INVENTO","EMPRESAS Y MENTORES QUE FINANCIAN IDEAS"],
    guia:        ["// GUÍA DE CONSTRUCCIÓN", "INSTRUCCIONES TÉCNICAS PASO A PASO"],
    perfil:      ["// MI PERFIL",         "TU HISTORIAL Y LOGROS COMO INVENTOR"],
  };
  const [label, sub] = labels[section] || ["// EVOINVENT", ""];
  const lblEl = document.getElementById("section-label");
  const subEl = document.getElementById("section-sub");
  if (lblEl) lblEl.textContent = label;
  if (subEl) subEl.textContent = sub;

  // Acciones específicas por sección
  if (section === "dashboard")   renderDashboard();
  if (section === "laboratorio") renderLaboratorio();
  if (section === "perfil")      renderPerfilHeader();
  if (section === "red-mentes")  renderFeed();
  if (section === "adoptar")     renderAdoptar();

  // Cerrar sidebar en móvil
  if (window.innerWidth < 768) closeSidebar();

  // Scroll al top
  document.querySelector(".main-content")?.scrollTo({ top: 0, behavior: "smooth" });
}

/* ====================================================
   8. RETO DEL DÍA
   ==================================================== */

let retoActual = null;

function initRetoDia() {
  const today    = new Date().toDateString();
  const stored   = localStorage.getItem("evoinvent_reto");
  const retoData = stored ? JSON.parse(stored) : null;

  if (retoData && retoData.date === today) {
    retoActual = retoData.reto;
  } else {
    retoActual = RETOS_POOL[Math.floor(Math.random() * RETOS_POOL.length)];
    localStorage.setItem("evoinvent_reto", JSON.stringify({ date: today, reto: retoActual }));
  }

  renderReto();
}

function renderReto() {
  const textEl = document.getElementById("reto-text");
  const dateEl = document.getElementById("reto-date");
  if (textEl && retoActual) {
    textEl.textContent = retoActual.text;
  }
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  }
}

function nuevoReto() {
  retoActual = RETOS_POOL[Math.floor(Math.random() * RETOS_POOL.length)];
  renderReto();
  showToast("🔀 Nuevo reto cargado", "info");
}

function usarReto() {
  if (!retoActual) return;
  const input = document.getElementById("problema-input");
  if (input) {
    input.value = retoActual.text;
    updateCharCount("problema-input", "char-count", 800);
    input.focus();
    input.style.borderColor = "var(--orange)";
    setTimeout(() => { input.style.borderColor = ""; }, 1000);
  }
  showToast("✅ Reto cargado en el motor", "success");
}

function openRetoBadge() {
  if (!retoActual) return;
  document.getElementById("reto-modal-txt").textContent  = retoActual.text;
  document.getElementById("rm-category").textContent     = retoActual.categoria;
  document.getElementById("rm-difficulty").textContent   = `DIFICULTAD: ${retoActual.dificultad.toUpperCase()}`;
  openModal("modal-reto");
}

function usarRetoModal() {
  usarReto();
  closeModal("modal-reto");
}

/* ====================================================
   9. MODO DE GENERACIÓN
   ==================================================== */

function setMode(mode) {
  STATE.currentMode = mode;

  // Actualizar botones
  document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
  document.getElementById(`btn-${mode}`)?.classList.add("active");

  // Mostrar panel correcto
  document.querySelectorAll(".mode-panel").forEach(p => p.classList.remove("active"));
  document.getElementById(`${mode}-mode`)?.classList.add("active");
}

/* ====================================================
   10. OPCIONES AVANZADAS
   ==================================================== */

function toggleAdvancedOptions() {
  const panel   = document.getElementById("advanced-options");
  const toggle  = document.querySelector(".advanced-options-toggle");
  const chevron = document.getElementById("adv-chevron");
  if (!panel) return;
  const isOpen = panel.classList.toggle("hidden");
  toggle?.classList.toggle("open", !isOpen);
}

/* ====================================================
   11. CONTADORES DE CARACTERES
   ==================================================== */

function initCharCounters() {
  const pairs = [
    ["problema-input",  "char-count",  800],
    ["pub-text",        "pub-char",    400],
  ];
  pairs.forEach(([inputId, countId, max]) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener("input", () => updateCharCount(inputId, countId, max));
  });
}

function updateCharCount(inputId, countId, max) {
  const input = document.getElementById(inputId);
  const count = document.getElementById(countId);
  if (!input || !count) return;
  const len = input.value.length;
  count.textContent = len;
  count.style.color = len > max * 0.9 ? "var(--orange)" : "";
}

/* ====================================================
   12. MATERIALES (modo escasez)
   ==================================================== */

function addMaterial(mat) {
  const input = document.getElementById("materiales-input");
  if (!input) return;
  const curr = input.value.trim();
  input.value = curr ? `${curr}, ${mat}` : mat;
  renderMatTags();
}

document.addEventListener("DOMContentLoaded", () => {
  const matInput = document.getElementById("materiales-input");
  if (matInput) {
    matInput.addEventListener("input", renderMatTags);
    matInput.addEventListener("change", renderMatTags);
  }
});

function renderMatTags() {
  const input  = document.getElementById("materiales-input");
  const container = document.getElementById("mat-tags");
  if (!input || !container) return;
  const mats = input.value.split(",").map(m => m.trim()).filter(Boolean);
  container.innerHTML = mats.map(m =>
    `<span class="mat-tag">${escapeHtml(m)}</span>`
  ).join("");
}

/* ====================================================
   13. SUGERENCIAS DE PROBLEMAS
   ==================================================== */

const SUGERENCIAS = [
  "Falta de agua potable",
  "Residuos plásticos",
  "Transporte inaccesible",
  "Educación sin internet",
  "Contaminación del aire",
  "Energía cara y escasa",
  "Desperdicio de comida",
  "Salud rural sin acceso",
];

function initSuggestions() {
  const container = document.getElementById("inp-suggestions");
  if (!container) return;
  const selected = SUGERENCIAS.sort(() => 0.5 - Math.random()).slice(0, 4);
  container.innerHTML = selected.map(s =>
    `<span class="sug-chip" onclick="usarSugerencia('${escapeHtml(s)}')">${escapeHtml(s)}</span>`
  ).join("");
}

function usarSugerencia(sug) {
  const input = document.getElementById("problema-input");
  if (!input) return;
  input.value += (input.value ? " " : "") + sug;
  updateCharCount("problema-input", "char-count", 800);
  input.focus();
}

/* ====================================================
   14. GENERADOR DE INVENTOS — NÚCLEO PRINCIPAL
   ==================================================== */

/**
 * Función principal: genera un invento
 * Usa backend Python si CONFIG.USE_BACKEND = true,
 * de lo contrario usa el motor de demo local.
 */
async function generarInvento() {
  // Obtener el problema según el modo activo
  let problema = "";
  let modoData  = {};

  if (STATE.currentMode === "normal") {
    problema = document.getElementById("problema-input")?.value.trim() || "";
    if (!problema) {
      showToast("⚠ Describe el problema que quieres resolver", "error");
      document.getElementById("problema-input")?.focus();
      return;
    }
    // Opciones avanzadas
    modoData = {
      categoria:   document.getElementById("adv-categoria")?.value  || "",
      dificultad:  document.getElementById("adv-dificultad")?.value || "",
      presupuesto: document.getElementById("adv-presupuesto")?.value || "",
      tiempo:      document.getElementById("adv-tiempo")?.value     || "",
    };

  } else if (STATE.currentMode === "escasez") {
    problema = document.getElementById("escasez-problema")?.value.trim() || "";
    const materiales = document.getElementById("materiales-input")?.value.trim() || "";
    if (!problema) {
      showToast("⚠ Describe el problema en Modo Escasez", "error"); return;
    }
    if (!materiales) {
      showToast("⚠ Agrega al menos un material disponible", "error"); return;
    }
    modoData = { materiales };

  } else if (STATE.currentMode === "colaboracion") {
    problema = document.getElementById("colab-problema")?.value.trim() || "";
    if (!problema) {
      showToast("⚠ Describe el problema para colaboración", "error"); return;
    }
    modoData = {
      personas: document.getElementById("colab-personas")?.value || "3",
      tipo:     document.getElementById("colab-tipo")?.value     || "escolar",
    };
  }

  const payload = {
    problema,
    modo:       STATE.currentMode,
    modoData,
    creativity: STATE.preferences.creativity || 7,
    expertMode: STATE.preferences.expertMode || false,
  };

  // Mostrar estado de carga
  showLoadingState(true);
  hideElement("result-card");
  hideElement("ruta-card");
  hideElement("veredicto-card");

  try {
    let result;
    if (CONFIG.USE_BACKEND) {
      result = await callBackend(CONFIG.API_ENDPOINTS.generate, payload);
    } else {
      result = await generarInventoLocal(payload);
    }

    STATE.currentInvento = result;
    STATE.inventosGenerados++;
    addXP(100, "💡 Invento generado");
    addActivity("invento", `Generaste el invento: <strong>${escapeHtml(result.nombre)}</strong>`, 100);
    checkAllAchievements();
    saveState();

    renderResultCard(result);
    showLoadingState(false);
    showElement("result-card");

    // Auto-guardar si está activado
    if (STATE.preferences.autosave) {
      guardarInvento(true);
    }

  } catch (err) {
    showLoadingState(false);
    console.error("Error al generar invento:", err);
    showToast("❌ Error al generar el invento. Intenta de nuevo.", "error");
  }
}

/**
 * Motor de IA local (demo sin backend)
 * Simula la respuesta que daría el backend Python
 */
async function generarInventoLocal(payload) {
  // Simulamos latencia del backend
  await simulateDelay(2800, [
    "ANALIZANDO PROBLEMA...",
    "DETECTANDO CATEGORÍA...",
    "SINTETIZANDO SOLUCIÓN...",
    "EVALUANDO VIABILIDAD...",
    "CALCULANDO IMPACTO...",
    "FINALIZANDO INVENTO...",
  ]);

  const problema = payload.problema.toLowerCase();

  // Sistema de categorización por palabras clave
  const categoria = detectarCategoria(problema);

  // Banco de plantillas de inventos por categoría
  const inventos = getInventoTemplate(categoria, payload);

  return inventos;
}

/**
 * Detecta la categoría del problema
 */
function detectarCategoria(texto) {
  const keywords = {
    "Agua y Saneamiento":  ["agua", "lluvia", "filtro", "purificar", "sequia", "riego", "hidro", "potable"],
    "Energía Limpia":      ["energia", "solar", "electrico", "luz", "panel", "bateria", "carga", "watts", "viento"],
    "Medio Ambiente":      ["contamina", "basura", "residuo", "recicla", "plastico", "verde", "ecolog", "carbon"],
    "Salud y Medicina":    ["salud", "enferm", "medico", "hospital", "diagnostico", "medicamento", "doctor", "vacuna"],
    "Educación":           ["educacion", "escuela", "aprender", "enseñar", "estudiante", "conocimiento", "libro"],
    "Alimentación":        ["comida", "aliment", "agricultur", "cosecha", "hambre", "nutricion", "cultivo", "granja"],
    "Transporte":          ["transporte", "vehiculo", "trafico", "movilidad", "bici", "auto", "camion", "calle"],
    "Comunicación":        ["comunicacion", "internet", "señal", "red", "conexion", "datos", "celular", "wifi"],
    "Tecnología Digital":  ["software", "app", "digital", "ia", "robot", "automatizar", "sensor", "datos", "codigo"],
    "Seguridad":           ["seguridad", "robo", "crimen", "proteccion", "vigilancia", "alarma"],
  };

  for (const [cat, words] of Object.entries(keywords)) {
    if (words.some(w => texto.includes(w))) return cat;
  }
  return "Tecnología Digital";
}

/**
 * Genera un invento completo basado en la categoría y problema
 */
function getInventoTemplate(categoria, payload) {
  const problema = payload.problema;
  const modo     = payload.modo;

  const catEmojis = {
    "Agua y Saneamiento": "💧", "Energía Limpia": "⚡", "Medio Ambiente": "🌱",
    "Salud y Medicina": "🩺", "Educación": "📚", "Alimentación": "🌾",
    "Transporte": "🚲", "Comunicación": "📡", "Tecnología Digital": "🤖", "Seguridad": "🔒",
  };

  const catTechs = {
    "Agua y Saneamiento":  ["Filtración UV", "Ósmosis inversa", "Sensores IoT", "Arduino", "Materiales biodegradables"],
    "Energía Limpia":      ["Paneles solares", "Microcontroladores", "Baterías LiPo", "MPPT", "Raspberry Pi"],
    "Medio Ambiente":      ["Sensores MQ135", "LoRaWAN", "Machine Learning", "Materiales reciclados", "Bioreactores"],
    "Salud y Medicina":    ["IA diagnóstica", "Sensores biomédicos", "App móvil", "Bluetooth Low Energy", "Cloud"],
    "Educación":           ["Raspberry Pi", "App offline", "NLP", "Gamificación", "Base de datos local"],
    "Alimentación":        ["Sensores de suelo", "Automatización", "Hidroponía", "Arduino Mega", "Drones"],
    "Transporte":          ["Motor BLDC", "Panel solar", "GPS", "App móvil", "Batería LiFePO4"],
    "Comunicación":        ["LoRa", "Mesh Network", "Raspberry Pi", "Antenas omnidireccionales", "Protocolo MQTT"],
    "Tecnología Digital":  ["Machine Learning", "Python", "API REST", "React Native", "Cloud Computing"],
    "Seguridad":           ["Cámara IA", "Reconocimiento facial", "Sensores PIR", "Alerta SMS", "Edge Computing"],
  };

  const nombres = {
    "Agua y Saneamiento": ["HydroPure System", "AquaBot Filtrator", "RainHarvest Pro", "WaterScan IoT"],
    "Energía Limpia":     ["SolarGrid Mini", "EcoWatt Harvester", "WindMicro Turbine", "SunBattery Pack"],
    "Medio Ambiente":     ["EcoSensor Net", "BioRecycle Hub", "AirQuality AI", "GreenLoop System"],
    "Salud y Medicina":   ["MediScan Lite", "HealthBot Rural", "DiagnoAI Mobile", "VitalSensor Kit"],
    "Educación":          ["EduBot Offline", "LearnMesh Local", "SkillBlock System", "ClassroomAI"],
    "Alimentación":       ["AgroSmart Sensor", "CropBot Hydro", "SoilAI Monitor", "HarvestDrone Mini"],
    "Transporte":         ["EcoTrike Cargo", "SolarBike Urban", "LastMile Electric", "GreenWheel"],
    "Comunicación":       ["LoRaMesh Node", "OffGrid Comms", "CommRelay Solar", "MeshNet Kit"],
    "Tecnología Digital": ["InnovatAI Platform", "SmartBot Local", "DataEdge System", "AutomateKit"],
    "Seguridad":          ["SafeEye AI", "SecureNet Mesh", "AlertBot Smart", "GuardAI System"],
  };

  const catNombres = nombres[categoria] || nombres["Tecnología Digital"];
  const nombre = catNombres[Math.floor(Math.random() * catNombres.length)];
  const emoji  = catEmojis[categoria] || "💡";
  const techs  = catTechs[categoria]  || catTechs["Tecnología Digital"];

  const dificultades = ["Básico", "Intermedio", "Avanzado"];
  const dificultad   = payload.modoData?.dificultad || dificultades[Math.floor(Math.random() * dificultades.length)];
  const tiempos      = ["2-4 semanas", "1-2 meses", "2-3 meses", "3-6 meses"];
  const tiempo       = payload.modoData?.tiempo || tiempos[Math.floor(Math.random() * tiempos.length)];
  const presupuestos = ["$500-1,500 MXN", "$1,500-5,000 MXN", "$5,000-15,000 MXN", "$15,000-50,000 MXN"];
  const presupuesto  = payload.modoData?.presupuesto || presupuestos[Math.floor(Math.random() * presupuestos.length)];
  const impactoScore = Math.floor(60 + Math.random() * 38);

  const materialesExtra = modo === "escasez"
    ? (payload.modoData?.materiales || "").split(",").map(m => m.trim()).filter(Boolean)
    : ["Carcasa impresa 3D", "Tornillos M3", "PCB personalizado", "Cable USB-C", "Cinta de doble cara", "Silicón sellador"];

  return {
    id:            uid(),
    nombre,
    emoji,
    categoria,
    dificultad,
    tiempo,
    presupuesto,
    impactoScore,
    modo,
    problema,
    descripcion:   generateDesc(nombre, categoria, problema),
    tecnologias:   techs.sort(() => 0.5 - Math.random()).slice(0, 4),
    impacto:       generateImpact(categoria),
    materiales:    materialesExtra.slice(0, 5),
    aplicaciones:  generateApps(categoria),
    fecha:         new Date().toISOString(),
    favorito:      false,
    notas:         "",
    kanban:        { idea: [], investigacion: [], prototipo: [], pruebas: [], lanzamiento: [] },
  };
}

function generateDesc(nombre, cat, problema) {
  const intros = [
    `${nombre} es un sistema innovador diseñado para resolver: "${problema}".`,
    `Solución tecnológica que aborda directamente el problema de: "${problema}".`,
    `Dispositivo de bajo costo enfocado en resolver: "${problema}".`,
  ];
  const bodies = {
    "Agua y Saneamiento": "Utiliza un sistema de múltiples etapas de filtración combinado con radiación UV para eliminar el 99.9% de bacterias y contaminantes. El dispositivo puede operar completamente off-grid usando energía solar y no requiere mantenimiento especializado.",
    "Energía Limpia":     "Aprovecha fuentes de energía renovable para generar electricidad estable. El sistema incluye almacenamiento inteligente con batería y controlador MPPT para máxima eficiencia. Diseñado para instalación rápida sin conocimientos técnicos avanzados.",
    "Medio Ambiente":     "Implementa sensores de bajo consumo y conectividad inalámbrica para monitoreo en tiempo real. Los datos se procesan localmente con algoritmos de machine learning para detectar anomalías y generar alertas automáticas.",
    "Salud y Medicina":   "Integra múltiples sensores biomédicos conectados a una aplicación móvil que usa inteligencia artificial para el diagnóstico preliminar. Funciona offline y puede sincronizarse con registros médicos cuando hay conexión disponible.",
    "Educación":          "Plataforma de aprendizaje autónoma que funciona completamente sin internet. Incluye contenido curricular adaptativo, gamificación y seguimiento del progreso del estudiante. Compatible con cualquier dispositivo Android.",
    "Alimentación":       "Sistema de monitoreo agrícola inteligente que analiza condiciones del suelo, clima y estado de los cultivos en tiempo real. Genera recomendaciones automatizadas de riego, fertilización y control de plagas.",
    "Transporte":         "Vehículo eléctrico optimizado para entornos urbanos con autonomía de 60-80 km por carga. Integra panneles solares para carga pasiva y sistema de navegación GPS con optimización de rutas.",
    "Comunicación":       "Red de comunicación mallada (mesh) que permite comunicación sin infraestructura centralizada. Los nodos se auto-configuran y mantienen la red activa incluso si algunos fallan.",
    "Tecnología Digital": "Sistema de automatización inteligente que usa procesamiento local de datos para minimizar dependencia del cloud. La arquitectura modular permite adaptarse a diferentes casos de uso con configuración mínima.",
    "Seguridad":          "Sistema de seguridad perimetral con visión artificial que detecta y clasifica amenazas en tiempo real. Funciona con energía solar y transmite alertas por múltiples canales de comunicación.",
  };
  const body  = bodies[cat] || bodies["Tecnología Digital"];
  const intro = intros[Math.floor(Math.random() * intros.length)];
  return `${intro} ${body}`;
}

function generateImpact(cat) {
  const impacts = {
    "Agua y Saneamiento": "Acceso a agua potable para comunidades rurales y periurbanas. Reducción de enfermedades gastrointestinales hasta en un 70%. Ahorro promedio de $2,000-4,000 MXN/mes por familia.",
    "Energía Limpia":     "Reducción de emisiones de CO₂ equivalente a plantar 500 árboles/año. Ahorro energético de 60-80% frente a soluciones convencionales. Impacto positivo en 100-1,000 hogares.",
    "Medio Ambiente":     "Reducción documentable de contaminantes locales. Datos en tiempo real para políticas ambientales informadas. Reducción de residuos hasta en un 40%.",
    "Salud y Medicina":   "Acceso a diagnóstico médico básico para comunidades sin infraestructura de salud. Reducción de muertes evitables por detección temprana. Cobertura potencial de 500+ pacientes/mes.",
    "Educación":          "Democratización del acceso a educación de calidad en zonas sin conectividad. Mejora del rendimiento académico del 15-25%. Impacto directo en 30-200 estudiantes por dispositivo.",
    "Alimentación":       "Incremento de productividad agrícola del 20-40%. Reducción de desperdicio de agua del 30-50%. Mejora del sustento económico de familias agricultoras.",
    "Transporte":         "Reducción de emisiones en zonas urbanas. Accesibilidad mejorada para comunidades marginadas. Ahorro de combustible del 100% en rutas electrificadas.",
    "Comunicación":       "Conectividad en zonas sin infraestructura de telecomunicaciones. Comunicación de emergencia garantizada. Cobertura para 100-1,000 personas por nodo.",
    "Tecnología Digital": "Automatización de procesos manuales repetitivos. Reducción de errores humanos del 80-95%. Escalabilidad para impactar miles de usuarios.",
    "Seguridad":          "Reducción de incidentes delictivos en 30-60%. Respuesta de emergencia más rápida. Protección para 50-500 hogares por sistema instalado.",
  };
  return impacts[cat] || "Impacto positivo medible en comunidades locales con escalabilidad global.";
}

function generateApps(cat) {
  const apps = {
    "Agua y Saneamiento": ["Zonas rurales sin red hídrica", "Asentamientos irregulares", "Escuelas y hospitales remotos", "Crisis humanitarias"],
    "Energía Limpia":     ["Hogares off-grid", "Micronegocios rurales", "Telecomunicaciones remotas", "Bombeo de agua solar"],
    "Medio Ambiente":     ["Parques industriales", "Zonas costeras", "Ciudades con alta contaminación", "Reservas naturales"],
    "Salud y Medicina":   ["Clínicas rurales", "Atención primaria", "Programas de salud pública", "Zonas de desastre"],
    "Educación":          ["Escuelas rurales", "Programas de alfabetización", "Centros comunitarios", "Educación en casa"],
    "Alimentación":       ["Agricultura familiar", "Cooperativas agrícolas", "Invernaderos urbanos", "Hidroponia comunitaria"],
    "Transporte":         ["Reparto local", "Transporte comunitario", "Ciclovías urbanas", "Zonas peatonales"],
    "Comunicación":       ["Comunidades rurales", "Zonas de desastre", "Eventos masivos", "Áreas mineras"],
    "Tecnología Digital": ["PyMEs locales", "Gobiernos municipales", "Cooperativas", "ONG y fundaciones"],
    "Seguridad":          ["Colonias residenciales", "Comercios locales", "Parques públicos", "Escuelas"],
  };
  return (apps[cat] || apps["Tecnología Digital"]).slice(0, 4);
}

/**
 * Simula demora y actualiza la UI de carga
 */
async function simulateDelay(ms, steps = []) {
  const loadMsg  = document.getElementById("load-msg");
  const loadFill = document.getElementById("load-fill");
  const loadSteps = document.querySelectorAll(".load-step");
  const stepMs   = ms / (steps.length || 1);

  for (let i = 0; i < steps.length; i++) {
    if (loadMsg)  loadMsg.textContent = steps[i];
    if (loadFill) loadFill.style.width = `${((i + 1) / steps.length) * 100}%`;
    loadSteps.forEach((s, idx) => {
      s.classList.toggle("active", idx === i);
      s.classList.toggle("done",   idx < i);
    });
    await new Promise(r => setTimeout(r, stepMs));
  }
}

/**
 * Muestra/oculta el estado de carga
 */
function showLoadingState(visible) {
  const el = document.getElementById("loading-state");
  const btn = document.getElementById("btn-generate");
  if (!el) return;
  if (visible) {
    el.classList.remove("hidden");
    if (btn) { btn.disabled = true; }
  } else {
    el.classList.add("hidden");
    if (btn) { btn.disabled = false; }
  }
}

/**
 * Renderiza el card de resultado del invento
 */
function renderResultCard(inv) {
  setEl("res-emoji",  inv.emoji);
  setEl("res-name",   inv.nombre);
  setEl("res-cat",    inv.categoria.toUpperCase());
  setEl("res-desc",   inv.descripcion);
  setEl("res-impact", inv.impacto);
  setEl("res-diff",   inv.dificultad.toUpperCase());
  setEl("res-time",   inv.tiempo.toUpperCase());
  setEl("res-budget", inv.presupuesto);

  // Barra de impacto
  setTimeout(() => {
    const fill = document.getElementById("impact-fill");
    const val  = document.getElementById("impact-val");
    if (fill) fill.style.width = `${inv.impactoScore}%`;
    if (val)  val.textContent  = `${inv.impactoScore}/100`;
  }, 300);

  // Tags de tecnologías
  const techsEl = document.getElementById("res-techs");
  if (techsEl) {
    techsEl.innerHTML = inv.tecnologias.map(t =>
      `<span class="tag-tech">${escapeHtml(t)}</span>`
    ).join("");
  }

  // Tags de materiales
  const matsEl = document.getElementById("res-mats");
  if (matsEl) {
    matsEl.innerHTML = inv.materiales.map(m =>
      `<span class="tag-mat">${escapeHtml(m)}</span>`
    ).join("");
  }

  // Tags de aplicaciones
  const appsEl = document.getElementById("res-apps");
  if (appsEl) {
    appsEl.innerHTML = inv.aplicaciones.map(a =>
      `<span class="tag-app">${escapeHtml(a)}</span>`
    ).join("");
  }

  // Estado favorito
  const favBtn = document.getElementById("res-fav-btn");
  if (favBtn) {
    favBtn.classList.toggle("active", !!inv.favorito);
    favBtn.querySelector("i").className = inv.favorito ? "fa-solid fa-heart" : "fa-regular fa-heart";
  }

  // Verificar similitud con laboratorio
  checkSimilarity(inv);

  // Preparar modal de compartir
  const preview = document.getElementById("sm-invento-preview");
  if (preview) {
    preview.innerHTML = `<div class="sip-emoji">${inv.emoji}</div><div class="sip-name">${escapeHtml(inv.nombre)}</div><div class="sip-cat">${escapeHtml(inv.categoria)}</div>`;
  }
  const linkEl = document.getElementById("sm-link");
  if (linkEl) {
    linkEl.value = `${window.location.origin}?invento=${encodeURIComponent(inv.nombre)}`;
  }
}

/**
 * Verifica si el invento es similar a alguno guardado
 */
function checkSimilarity(inv) {
  const warnEl  = document.getElementById("similarity-warn");
  const textEl  = document.getElementById("similarity-text");
  if (!warnEl || !textEl) return;

  const catMatch = STATE.laboratorio.filter(l =>
    l.categoria === inv.categoria && l.id !== inv.id
  );
  if (catMatch.length >= 2) {
    warnEl.classList.remove("hidden");
    textEl.textContent = `Tienes ${catMatch.length} inventos similares en ${inv.categoria}. Considera diferenciarte más.`;
  } else {
    warnEl.classList.add("hidden");
  }
}

/* ====================================================
   15. GUARDAR INVENTOS EN LABORATORIO
   ==================================================== */

function guardarInvento(silent = false) {
  if (!STATE.currentInvento) {
    showToast("⚠ Genera un invento primero", "error");
    return;
  }
  const inv = STATE.currentInvento;

  // Verificar si ya existe
  const exists = STATE.laboratorio.find(l => l.id === inv.id);
  if (exists) {
    if (!silent) showToast("ℹ Este invento ya está en tu laboratorio", "info");
    return;
  }

  STATE.laboratorio.push({ ...inv });
  addXP(75, "🧪 Invento guardado en lab");
  addActivity("lab", `Guardaste <strong>${escapeHtml(inv.nombre)}</strong> en tu laboratorio`, 75);
  checkAllAchievements();
  saveState();

  // Actualizar badge del nav
  updateNavBadge("nav-badge-lab", STATE.laboratorio.length);
  // Actualizar selects
  updateInventoSelects();

  const btn = document.getElementById("btn-guardar");
  if (btn) {
    btn.innerHTML = `<i class="fa-solid fa-check"></i> GUARDADO`;
    btn.classList.add("ba-green");
    setTimeout(() => {
      btn.innerHTML = `<i class="fa-solid fa-database"></i> GUARDAR EN LAB`;
    }, 2000);
  }

  if (!silent) {
    showToast("✅ Invento guardado en el laboratorio", "success");
    triggerAchievement("lab_guardado");
  }
}

/**
 * Toggle favorito del invento actual
 */
function toggleFavorito() {
  if (!STATE.currentInvento) return;
  STATE.currentInvento.favorito = !STATE.currentInvento.favorito;

  const labEntry = STATE.laboratorio.find(l => l.id === STATE.currentInvento.id);
  if (labEntry) labEntry.favorito = STATE.currentInvento.favorito;

  const favBtn = document.getElementById("res-fav-btn");
  if (favBtn) {
    favBtn.classList.toggle("active", STATE.currentInvento.favorito);
    favBtn.querySelector("i").className = STATE.currentInvento.favorito ? "fa-solid fa-heart" : "fa-regular fa-heart";
  }
  saveState();
  showToast(STATE.currentInvento.favorito ? "❤️ Agregado a favoritos" : "♡ Quitado de favoritos", "info");
}

/* ====================================================
   16. RENDERIZAR LABORATORIO
   ==================================================== */

function renderLaboratorio() {
  const grid    = document.getElementById("lab-grid");
  const empty   = document.getElementById("lab-empty");
  const noRes   = document.getElementById("lab-no-results");
  const countEl = document.getElementById("lab-count");
  const favEl   = document.getElementById("lab-favoritos");
  const topEl   = document.getElementById("lab-top");
  const exportBar = document.getElementById("lab-export-bar");
  if (!grid) return;

  let items = [...STATE.laboratorio];

  // Aplicar filtro de búsqueda
  if (STATE.labFilter) {
    const q = STATE.labFilter.toLowerCase();
    items = items.filter(i =>
      i.nombre.toLowerCase().includes(q) ||
      i.categoria.toLowerCase().includes(q) ||
      i.descripcion.toLowerCase().includes(q)
    );
  }

  // Aplicar filtro de categoría
  if (STATE.labFilterCat) {
    items = items.filter(i => i.categoria === STATE.labFilterCat);
  }

  // Ordenar
  items.sort((a, b) => {
    switch (STATE.labSort) {
      case "fecha-asc":  return new Date(a.fecha) - new Date(b.fecha);
      case "nombre":     return a.nombre.localeCompare(b.nombre);
      case "favoritos":  return (b.favorito ? 1 : 0) - (a.favorito ? 1 : 0);
      default:           return new Date(b.fecha) - new Date(a.fecha);
    }
  });

  // Stats
  if (countEl) countEl.textContent = STATE.laboratorio.length;
  if (favEl)   favEl.textContent   = STATE.laboratorio.filter(i => i.favorito).length;
  if (topEl)   topEl.textContent   = STATE.laboratorio[STATE.laboratorio.length - 1]?.nombre?.slice(0, 12) || "—";

  // Estados vacíos
  if (STATE.laboratorio.length === 0) {
    empty?.classList.remove("hidden");
    noRes?.classList.add("hidden");
    grid.classList.add("hidden");
    exportBar?.classList.add("hidden");
    return;
  }
  empty?.classList.add("hidden");
  exportBar?.classList.remove("hidden");

  if (items.length === 0) {
    noRes?.classList.remove("hidden");
    grid.classList.add("hidden");
    return;
  }
  noRes?.classList.add("hidden");
  grid.classList.remove("hidden");

  // Vista grid o lista
  grid.className = `lab-grid ${STATE.labView === "list" ? "list-view" : ""} ${items.length > 0 ? "" : "hidden"}`;

  grid.innerHTML = items.map(inv => `
    <div class="lab-card ${inv.favorito ? "fav-card" : ""}" role="listitem" onclick="openInventoDetail('${inv.id}')">
      <div class="lc-top">
        <span class="lc-emoji">${inv.emoji}</span>
        <button class="lc-fav-btn ${inv.favorito ? "active" : ""}" onclick="toggleLabFavorito('${inv.id}',event)" aria-label="Favorito">
          <i class="${inv.favorito ? "fa-solid" : "fa-regular"} fa-heart"></i>
        </button>
      </div>
      <div class="lc-name">${escapeHtml(inv.nombre)}</div>
      <span class="lc-cat">${escapeHtml(inv.categoria.toUpperCase())}</span>
      <p class="lc-desc">${escapeHtml(inv.descripcion)}</p>
      <div class="lc-footer">
        <span class="lc-date">${new Date(inv.fecha).toLocaleDateString("es-MX")}</span>
        <div class="lc-actions">
          <button class="lc-action-btn" onclick="cargarInventoEnMotor('${inv.id}',event)" title="Cargar en Motor" aria-label="Cargar en motor">
            <i class="fa-solid fa-bolt"></i>
          </button>
          <button class="lc-action-btn lc-del" onclick="eliminarInvento('${inv.id}',event)" title="Eliminar" aria-label="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function filterLab(q) {
  STATE.labFilter = q;
  renderLaboratorio();
}

function filterLabCat(cat) {
  STATE.labFilterCat = cat;
  renderLaboratorio();
}

function sortLab(sort) {
  STATE.labSort = sort;
  renderLaboratorio();
}

function setLabView(view) {
  STATE.labView = view;
  document.getElementById("view-grid-btn")?.classList.toggle("active", view === "grid");
  document.getElementById("view-list-btn")?.classList.toggle("active", view === "list");
  renderLaboratorio();
}

function toggleLabFavorito(id, event) {
  event?.stopPropagation();
  const inv = STATE.laboratorio.find(i => i.id === id);
  if (!inv) return;
  inv.favorito = !inv.favorito;
  saveState();
  renderLaboratorio();
}

function eliminarInvento(id, event) {
  event?.stopPropagation();
  if (!confirm("¿Eliminar este invento del laboratorio?")) return;
  STATE.laboratorio = STATE.laboratorio.filter(i => i.id !== id);
  if (STATE.currentInvento?.id === id) STATE.currentInvento = null;
  saveState();
  renderLaboratorio();
  updateInventoSelects();
  showToast("🗑 Invento eliminado", "info");
}

function cargarInventoEnMotor(id, event) {
  event?.stopPropagation();
  const inv = STATE.laboratorio.find(i => i.id === id);
  if (!inv) return;
  STATE.currentInvento = inv;
  renderResultCard(inv);
  navigate("motor", document.querySelector("[data-section='motor']"));
  showElement("result-card");
  showToast(`⚡ ${inv.nombre} cargado en el motor`, "success");
}

function openInventoDetail(id) {
  const inv = STATE.laboratorio.find(i => i.id === id);
  if (!inv) return;

  const content = document.getElementById("modal-detail-content");
  if (!content) return;

  content.innerHTML = `
    <div class="dm-header">
      <span class="dm-emoji">${inv.emoji}</span>
      <div class="dm-title-wrap">
        <h3 class="dm-title">${escapeHtml(inv.nombre)}</h3>
        <span class="dm-cat">${escapeHtml(inv.categoria.toUpperCase())}</span>
        <span class="dm-fecha">${new Date(inv.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })}</span>
      </div>
    </div>
    <div class="dm-grid">
      <div class="dm-block full">
        <div class="dm-lbl">DESCRIPCIÓN</div>
        <p>${escapeHtml(inv.descripcion)}</p>
      </div>
      <div class="dm-block">
        <div class="dm-lbl">TECNOLOGÍAS</div>
        <div class="tag-wrap">${inv.tecnologias.map(t => `<span class="tag-tech">${escapeHtml(t)}</span>`).join("")}</div>
      </div>
      <div class="dm-block">
        <div class="dm-lbl">IMPACTO</div>
        <p>${escapeHtml(inv.impacto)}</p>
      </div>
      <div class="dm-block full">
        <div class="dm-lbl">MATERIALES</div>
        <div class="tag-wrap">${inv.materiales.map(m => `<span class="tag-mat">${escapeHtml(m)}</span>`).join("")}</div>
      </div>
      <div class="dm-block full">
        <div class="dm-lbl">APLICACIONES</div>
        <div class="tag-wrap">${inv.aplicaciones.map(a => `<span class="tag-app">${escapeHtml(a)}</span>`).join("")}</div>
      </div>
    </div>
    <div class="dm-actions">
      <button class="btn-hud sm" onclick="cargarInventoEnMotor('${inv.id}',null);closeModal('modal-detail')"><span class="btn-bg"></span><i class="fa-solid fa-bolt"></i> ABRIR EN MOTOR</button>
      <button class="btn-hud sm" onclick="generarGuiaConInvento('${inv.id}');closeModal('modal-detail')"><span class="btn-bg"></span><i class="fa-solid fa-list-ol"></i> GENERAR GUÍA</button>
    </div>
  `;
  openModal("modal-detail");
}

/* ====================================================
   17. ACTUALIZAR SELECTS DE INVENTOS
   ==================================================== */

function updateInventoSelects() {
  const selects = [
    "kanban-inv-select",
    "mercado-inv-select",
    "calc-inv-select",
    "pitch-inv-select",
    "pat-inv-select",
    "guia-select",
  ];
  selects.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const current = sel.value;
    const extra = id === "kanban-inv-select"
      ? `<option value="">— Selecciona un invento para gestionar —</option>`
      : `<option value="">— Selecciona un invento —</option>`;
    sel.innerHTML = extra + STATE.laboratorio.map(inv =>
      `<option value="${inv.id}" ${inv.id === current ? "selected" : ""}>${escapeHtml(inv.emoji)} ${escapeHtml(inv.nombre)}</option>`
    ).join("");
  });
  renderKanbanInventoSelect();
}

function renderKanbanInventoSelect()   { updateInventoSelect("kanban-inv-select"); }
function renderMercadoSelect()         { updateInventoSelect("mercado-inv-select"); }
function renderCalculadoraSelect()     { updateInventoSelect("calc-inv-select"); }
function renderPitchSelect()           { updateInventoSelect("pitch-inv-select"); }
function renderPatentesSelect()        { updateInventoSelect("pat-inv-select"); }
function renderGuiaSelect()            { updateInventoSelect("guia-select"); }

function updateInventoSelect(id) {
  const sel = document.getElementById(id);
  if (!sel) return;
  const isKanban = id === "kanban-inv-select";
  sel.innerHTML = `<option value="">${isKanban ? "— Selecciona un invento para gestionar —" : "— Selecciona un invento —"}</option>`
    + STATE.laboratorio.map(inv =>
      `<option value="${inv.id}">${escapeHtml(inv.emoji)} ${escapeHtml(inv.nombre)}</option>`
    ).join("");
}

/* ====================================================
   18. GUÍA DE CONSTRUCCIÓN
   ==================================================== */

async function generarGuia() {
  if (!STATE.currentInvento) {
    showToast("⚠ Genera o selecciona un invento primero", "error"); return;
  }
  const btn = document.getElementById("btn-guia-gen");
  setMode_guia(btn, true);
  try {
    await generarGuiaParaInvento(STATE.currentInvento);
    navigate("guia", document.querySelector("[data-section='guia']"));
  } finally {
    setMode_guia(btn, false);
  }
}

function setMode_guia(btn, loading) {
  if (!btn) return;
  document.getElementById("btn-guia-text").textContent = loading ? "GENERANDO GUÍA..." : "GENERAR GUÍA PASO A PASO";
}

async function generarGuiaCompleta() {
  const invId = document.getElementById("guia-select")?.value;
  if (!invId) {
    showToast("⚠ Selecciona un invento del laboratorio", "error"); return;
  }
  const inv = STATE.laboratorio.find(i => i.id === invId);
  if (!inv) return;
  await generarGuiaParaInvento(inv);
}

async function generarGuiaConInvento(invId) {
  const inv = STATE.laboratorio.find(i => i.id === invId);
  if (!inv) return;
  navigate("guia", document.querySelector("[data-section='guia']"));
  await generarGuiaParaInvento(inv);
}

async function generarGuiaParaInvento(inv) {
  const btn = document.getElementById("btn-guia-gen");
  if (btn) { btn.disabled = true; document.getElementById("btn-guia-text").textContent = "GENERANDO..."; }

  hideElement("guia-result");
  showElement("guia-loading");

  const loadMsg  = document.getElementById("guia-load-msg");
  const loadFill = document.getElementById("guia-load-fill");
  const steps    = ["PREPARANDO GUÍA...", "DISEÑANDO PASOS...", "CALCULANDO MATERIALES...", "GENERANDO TIPS...", "FINALIZANDO..."];
  let i = 0;
  const interval = setInterval(() => {
    if (loadMsg) loadMsg.textContent  = steps[i % steps.length];
    if (loadFill) loadFill.style.width = `${((i + 1) / steps.length) * 100}%`;
    i++;
    if (i >= steps.length) clearInterval(interval);
  }, 500);

  await new Promise(r => setTimeout(r, 2500));
  clearInterval(interval);

  const guia = generateGuiaLocal(inv);
  STATE.guiaResult = guia;
  STATE.guiasGeneradas++;
  addXP(80, "📋 Guía generada");
  addActivity("guia", `Generaste la guía de <strong>${escapeHtml(inv.nombre)}</strong>`, 80);
  checkAllAchievements();
  triggerAchievement("guia_generada");
  saveState();

  renderGuia(guia, inv);
  hideElement("guia-loading");
  showElement("guia-result");
  if (btn) { btn.disabled = false; document.getElementById("btn-guia-text").textContent = "GENERAR GUÍA PASO A PASO"; }
}

function generateGuiaLocal(inv) {
  const pasosBase = [
    { titulo: "Investigación y planificación", icono: "🔍", tiempo: "2-3 días", instruccion: `Investiga a fondo el problema: "${inv.problema}". Busca referencias, proyectos similares, y define exactamente qué resultado esperas. Documenta tus hallazgos en un cuaderno o notion.`, tip: "La investigación previa puede ahorrar semanas de trabajo. No la saltes.", herramientas: ["Cuaderno", "Internet", "Google Scholar"] },
    { titulo: "Lista de componentes y compras", icono: "🛒", tiempo: "1 día", instruccion: `Prepara la lista completa de materiales basada en: ${inv.tecnologias.join(", ")}. Cotiza en al menos 3 proveedores diferentes. Considera versiones alternativas si algún componente no está disponible localmente.`, tip: "Pide un 20% más de cada componente electrónico por posibles fallas.", herramientas: ["Hoja de cálculo", "MercadoLibre", "Aliexpress"] },
    { titulo: "Diseño y esquemáticos", icono: "📐", tiempo: "3-5 días", instruccion: "Dibuja el esquema eléctrico y el diseño mecánico del prototipo. Usa herramientas gratuitas como Fritzing para electrónica y TinkerCAD para las partes físicas. Valida el diseño con alguien con experiencia antes de construir.", tip: "Un buen diseño previo reduce el tiempo de construcción a la mitad.", herramientas: ["Fritzing", "TinkerCAD", "KiCad"] },
    { titulo: "Construcción del prototipo base", icono: "🔧", tiempo: "1-2 semanas", instruccion: `Construye la versión más básica funcional de ${inv.nombre}. Empieza por las partes más críticas. No busques perfección en esta etapa, el objetivo es que funcione.`, tip: "Documenta con fotos y videos cada paso. Lo necesitarás para el pitch deck.", herramientas: ["Soldador", "Multímetro", "Destornilladores"] },
    { titulo: "Programación y lógica", icono: "💻", tiempo: "1-2 semanas", instruccion: "Escribe el código del firmware o software. Empieza con pseudocódigo. Usa ejemplos de la comunidad como base. Implementa primero la función principal antes de agregar características extra.", tip: "Comenta tu código desde el principio. Tu yo del futuro lo agradecerá.", herramientas: ["VS Code", "Arduino IDE", "Python", "Git"] },
    { titulo: "Pruebas y calibración", icono: "🧪", tiempo: "3-5 días", instruccion: "Realiza pruebas exhaustivas en condiciones controladas primero, luego en condiciones reales. Mide exactamente los parámetros de funcionamiento y documenta los resultados. Ajusta parámetros según los datos.", tip: "Las pruebas con usuarios reales revelan problemas que nunca imaginarías.", herramientas: ["Instrumentos de medición", "Checklist de pruebas", "Hoja de datos"] },
    { titulo: "Iteración y mejoras", icono: "🔄", tiempo: "1 semana", instruccion: "Con base en los resultados de pruebas, identifica los 3 problemas más críticos y corrígelos. Repite el ciclo de prueba-corrección hasta alcanzar los criterios de éxito definidos en el paso 1.", tip: "Cada iteración debe ser documentada con cambios específicos y sus resultados.", herramientas: ["Mismo equipo + mejoras", "Notas de feedback"] },
    { titulo: "Documentación y presentación", icono: "📄", tiempo: "2-3 días", instruccion: "Crea la documentación técnica completa: manual de usuario, especificaciones, código comentado y esquemáticos finales. Prepara una demostración visual para mostrar el funcionamiento.", tip: "La documentación es lo que diferencia un proyecto académico de un producto real.", herramientas: ["Cámara/teléfono", "Google Docs", "Canva"] },
  ];

  return {
    invento: inv,
    pasos: pasosBase,
    materiales: inv.materiales.map((m, i) => ({
      nombre: m,
      cantidad: `${Math.floor(Math.random() * 3) + 1} ${["piezas", "unidades", "metros", "gramos"][i % 4]}`,
      precio: `$${Math.floor(20 + Math.random() * 480)} MXN`,
    })),
    tips: [
      "Empieza simple. Un prototipo que funciona al 70% es mejor que uno perfecto en papel.",
      "Únete a comunidades online de makers y comparte tu progreso. El feedback es invaluable.",
      "Documenta cada fallo. Los errores son datos y datos son conocimiento.",
      "Considera el mantenimiento desde el diseño. ¿Quién lo reparará en campo?",
      "Si estás en México, busca apoyo del CONACyT, INADEM o incubadoras universitarias.",
    ],
    safetyNotes: [
      "Usa lentes de seguridad al soldar componentes electrónicos.",
      "Trabaja en áreas bien ventiladas con materiales químicos.",
      "Desconecta siempre la alimentación antes de modificar circuitos.",
      "Usa guantes cuando trabajes con materiales cortantes o abrasivos.",
    ],
  };
}

function renderGuia(guia, inv) {
  // Canvas de visualización
  renderInventoCanvas(inv);

  // Pasos
  const pasosEl = document.getElementById("guia-pasos");
  if (pasosEl) {
    pasosEl.innerHTML = guia.pasos.map((paso, idx) => `
      <div class="guia-paso" id="paso-${idx}">
        <div class="gp-header" onclick="togglePaso(${idx})">
          <div class="gp-num">${idx + 1}</div>
          <div class="gp-info">
            <div class="gp-titulo">${escapeHtml(paso.titulo)}</div>
            <div class="gp-meta">
              <span class="gp-tiempo"><i class="fa-regular fa-clock"></i> ${escapeHtml(paso.tiempo)}</span>
            </div>
          </div>
          <span class="gp-icono">${paso.icono}</span>
          <i class="fa-solid fa-chevron-down gp-chevron"></i>
        </div>
        <div class="gp-body">
          <p class="gp-instruccion">${escapeHtml(paso.instruccion)}</p>
          <div class="gp-tip"><i class="fa-solid fa-lightbulb"></i> ${escapeHtml(paso.tip)}</div>
          <div class="gp-herramientas">
            ${paso.herramientas.map(h => `<span class="gp-tool">${escapeHtml(h)}</span>`).join("")}
          </div>
        </div>
      </div>
    `).join("");

    // Abrir primer paso automáticamente
    setTimeout(() => togglePaso(0), 100);
  }

  // Materiales
  const matsEl = document.getElementById("guia-materiales");
  if (matsEl) {
    matsEl.innerHTML = `
      <div class="panel-hdr ph-cyan"><i class="fa-solid fa-toolbox"></i><span>LISTA DE MATERIALES</span><div class="ph-line"></div></div>
      <div class="mats-grid">
        ${guia.materiales.map(m => `
          <div class="mat-item">
            <i class="fa-solid fa-circle-dot"></i>
            <span>${escapeHtml(m.nombre)}</span>
            <span style="margin-left:auto;font-family:var(--font-m);font-size:11px;color:var(--text-muted)">${escapeHtml(m.cantidad)}</span>
            <span class="mat-precio">${escapeHtml(m.precio)}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  // Tips
  const tipsEl = document.getElementById("guia-tips");
  if (tipsEl) {
    tipsEl.innerHTML = `
      <div class="panel-hdr ph-cyan"><i class="fa-solid fa-star"></i><span>TIPS DE EXPERTO</span><div class="ph-line"></div></div>
      <div class="tips-list">
        ${guia.tips.map(t => `<div class="tip-item"><div class="tip-dot"></div><span>${escapeHtml(t)}</span></div>`).join("")}
      </div>
    `;
  }

  // Seguridad
  const safeEl = document.getElementById("guia-safety");
  if (safeEl) {
    safeEl.innerHTML = `
      <div class="panel-hdr ph-gold"><i class="fa-solid fa-shield-halved"></i><span>NOTAS DE SEGURIDAD</span><div class="ph-line"></div></div>
      <div class="safety-items">
        ${guia.safetyNotes.map(s => `<div class="safety-item"><i class="fa-solid fa-triangle-exclamation"></i><span>${escapeHtml(s)}</span></div>`).join("")}
      </div>
    `;
  }
}

function togglePaso(idx) {
  const paso = document.getElementById(`paso-${idx}`);
  if (!paso) return;
  paso.classList.toggle("open");
}

/**
 * Renderiza el canvas técnico del invento
 */
function renderInventoCanvas(inv) {
  const canvas = document.getElementById("invento-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  // Fondo
  ctx.fillStyle = "#020b18";
  ctx.fillRect(0, 0, W, H);

  // Grid de puntos
  ctx.fillStyle = "rgba(0,229,255,0.06)";
  for (let x = 20; x < W; x += 30) {
    for (let y = 20; y < H; y += 30) {
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Emoji central grande
  ctx.font = `${Math.min(W, H) * 0.28}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = 0.85;
  ctx.fillText(inv.emoji, W / 2, H / 2 - 30);
  ctx.globalAlpha = 1;

  // Nombre del invento
  ctx.font = `bold ${Math.min(W * 0.04, 22)}px 'Orbitron', monospace`;
  ctx.fillStyle = "#00e5ff";
  ctx.textAlign = "center";
  ctx.fillText(inv.nombre.toUpperCase(), W / 2, H / 2 + H * 0.2);

  // Categoría
  ctx.font = `${Math.min(W * 0.025, 14)}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = "rgba(124,77,255,0.8)";
  ctx.fillText(`[ ${inv.categoria.toUpperCase()} ]`, W / 2, H / 2 + H * 0.28);

  // Líneas decorativas
  const gradient = ctx.createLinearGradient(0, 0, W, 0);
  gradient.addColorStop(0, "transparent");
  gradient.addColorStop(0.5, "rgba(0,229,255,0.4)");
  gradient.addColorStop(1, "transparent");
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1;
  const lineY = H / 2 + H * 0.34;
  ctx.beginPath(); ctx.moveTo(W * 0.15, lineY); ctx.lineTo(W * 0.85, lineY); ctx.stroke();

  // Tecnologías en la parte inferior
  ctx.font = `${Math.min(W * 0.018, 11)}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = "rgba(0,229,255,0.5)";
  const techStr = inv.tecnologias.slice(0, 3).join("  ·  ");
  ctx.fillText(techStr, W / 2, lineY + 20);

  // Esquinas decorativas
  const cSize = 24, cPad = 16;
  ctx.strokeStyle = "rgba(0,229,255,0.3)";
  ctx.lineWidth = 1.5;
  [[cPad, cPad, 1, 1], [W - cPad - cSize, cPad, -1, 1], [cPad, H - cPad - cSize, 1, -1], [W - cPad - cSize, H - cPad - cSize, -1, -1]].forEach(([x, y, dx, dy]) => {
    ctx.beginPath(); ctx.moveTo(x, y + dy * cSize); ctx.lineTo(x, y); ctx.lineTo(x + dx * cSize, y); ctx.stroke();
  });

  // Versión y ID
  ctx.font = "9px 'JetBrains Mono', monospace";
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.textAlign = "right";
  ctx.fillText(`ID: ${inv.id.slice(-8)}  v1.0`, W - cPad, H - cPad);
}

/* ====================================================
   19. VEREDICTO 360°
   ==================================================== */

async function generarVeredicto() {
  if (!STATE.currentInvento) {
    showToast("⚠ Genera un invento primero", "error"); return;
  }
  const inv = STATE.currentInvento;

  showElement("veredicto-card");
  document.getElementById("veredicto-card").scrollIntoView({ behavior: "smooth" });

  await new Promise(r => setTimeout(r, 400));

  const scores = {
    impacto:    Math.floor(55 + Math.random() * 43),
    factibilidad: Math.floor(45 + Math.random() * 48),
    innovacion: Math.floor(60 + Math.random() * 38),
    mercado:    Math.floor(40 + Math.random() * 55),
    sostenibilidad: Math.floor(50 + Math.random() * 45),
  };
  const global = Math.floor(Object.values(scores).reduce((a, b) => a + b, 0) / 5);

  setEl("panel-score-badge", `${global}/100`);

  // Métricas
  const metricsEl = document.getElementById("v-metrics");
  const metricDefs = [
    { key: "impacto",        label: "IMPACTO",         cls: "sc-arc bar-arc" },
    { key: "factibilidad",   label: "FACTIBILIDAD",    cls: "sc-gold bar-gold" },
    { key: "innovacion",     label: "INNOVACIÓN",      cls: "sc-green bar-green" },
    { key: "mercado",        label: "MERCADO",         cls: "sc-red bar-red" },
    { key: "sostenibilidad", label: "SOSTENIBILIDAD",  cls: "sc-gray bar-gray" },
  ];

  if (metricsEl) {
    metricsEl.innerHTML = metricDefs.map(m => `
      <div class="v-item">
        <div class="v-label">${m.label}</div>
        <div class="v-score ${m.cls.split(" ")[0]}">${scores[m.key]}</div>
        <div class="v-bar-bg">
          <div class="v-bar ${m.cls.split(" ")[1]}" style="width:0%" data-target="${scores[m.key]}%"></div>
        </div>
      </div>
    `).join("");

    // Animar barras
    setTimeout(() => {
      metricsEl.querySelectorAll(".v-bar").forEach(bar => {
        bar.style.width = bar.dataset.target;
      });
    }, 200);
  }

  // Radar chart
  drawRadarChart(scores, global);

  // Summary
  const summaryEl = document.getElementById("v-summary");
  if (summaryEl) {
    const verdicts = [
      global >= 80 ? "🚀 ALTAMENTE VIABLE" : global >= 60 ? "✅ VIABLE CON AJUSTES" : global >= 40 ? "⚡ POTENCIAL IDENTIFICADO" : "⚠ REQUIERE ITERACIÓN",
    ];
    summaryEl.innerHTML = `
      <p style="font-family:var(--font-d);font-size:14px;color:var(--cyan);margin-bottom:12px">${verdicts[0]}</p>
      <p>Con un puntaje global de <strong style="color:var(--gold)">${global}/100</strong>, el invento <strong style="color:var(--cyan)">"${escapeHtml(inv.nombre)}"</strong> muestra ${global >= 70 ? "un gran potencial para desarrollo y escalabilidad" : "áreas de mejora importantes que deben abordarse antes de avanzar"}.</p>
      <div class="v-rec" style="margin-top:12px">
        <i class="fa-solid fa-lightbulb" style="margin-right:8px"></i>
        Recomendación: ${getRecommendation(scores)}
      </div>
    `;
  }

  addXP(50, "📊 Veredicto generado");
  saveState();
}

function getRecommendation(scores) {
  const weak = Object.entries(scores).sort((a, b) => a[1] - b[1])[0];
  const recs = {
    impacto:        "Amplía el alcance del impacto buscando alianzas con organizaciones comunitarias.",
    factibilidad:   "Simplifica el diseño técnico y busca materiales más accesibles localmente.",
    innovacion:     "Diferénciate más de las soluciones existentes, busca un ángulo único.",
    mercado:        "Valida la demanda real con entrevistas a potenciales usuarios antes de invertir.",
    sostenibilidad: "Diseña un modelo de negocio claro que garantice la continuidad del proyecto.",
  };
  return recs[weak[0]] || "Itera sobre los puntos más débiles y genera una nueva versión.";
}

function drawRadarChart(scores, global) {
  const canvas = document.getElementById("radar-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.35;

  ctx.clearRect(0, 0, W, H);

  const labels = ["IMPACTO", "FACTIB.", "INNOV.", "MERCADO", "SOSTENIB."];
  const vals   = [scores.impacto, scores.factibilidad, scores.innovacion, scores.mercado, scores.sostenibilidad];
  const n      = labels.length;
  const step   = (Math.PI * 2) / n;

  // Grilla
  for (let ring = 1; ring <= 5; ring++) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = step * i - Math.PI / 2;
      const r     = R * ring / 5;
      const x     = cx + r * Math.cos(angle);
      const y     = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = "rgba(0,229,255,0.1)";
    ctx.lineWidth   = 1;
    ctx.stroke();
  }

  // Ejes
  for (let i = 0; i < n; i++) {
    const angle = step * i - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
    ctx.strokeStyle = "rgba(0,229,255,0.15)";
    ctx.stroke();
  }

  // Área de datos
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const angle = step * i - Math.PI / 2;
    const r     = R * vals[i] / 100;
    const x     = cx + r * Math.cos(angle);
    const y     = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle   = "rgba(0,229,255,0.15)";
  ctx.strokeStyle = "rgba(0,229,255,0.7)";
  ctx.lineWidth   = 2;
  ctx.fill();
  ctx.stroke();

  // Puntos
  for (let i = 0; i < n; i++) {
    const angle = step * i - Math.PI / 2;
    const r     = R * vals[i] / 100;
    const x     = cx + r * Math.cos(angle);
    const y     = cy + r * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#00e5ff";
    ctx.fill();
  }

  // Labels
  ctx.font = "10px JetBrains Mono, monospace";
  ctx.fillStyle  = "rgba(0,229,255,0.7)";
  ctx.textAlign  = "center";
  for (let i = 0; i < n; i++) {
    const angle = step * i - Math.PI / 2;
    const rx    = cx + (R + 22) * Math.cos(angle);
    const ry    = cy + (R + 22) * Math.sin(angle);
    ctx.fillText(labels[i], rx, ry + 4);
  }

  // Score global
  ctx.font      = "bold 22px Orbitron, monospace";
  ctx.fillStyle = "#ffd600";
  ctx.textAlign = "center";
  ctx.fillText(`${global}`, cx, cy + 8);
}

/* ====================================================
   20. ANÁLISIS DE MERCADO
   ==================================================== */

async function analizarMercado() {
  if (!STATE.currentInvento) {
    showToast("⚠ Genera un invento primero", "error"); return;
  }
  const inv = STATE.currentInvento;
  // Guardar si no está guardado
  if (!STATE.laboratorio.find(l => l.id === inv.id)) guardarInvento(true);

  navigate("mercado", document.querySelector("[data-section='mercado']"));
  setTimeout(() => {
    const sel = document.getElementById("mercado-inv-select");
    if (sel) sel.value = inv.id;
    generarAnalisisMercado();
  }, 300);
}

async function generarAnalisisMercado() {
  const invId = document.getElementById("mercado-inv-select")?.value;
  if (!invId) { showToast("⚠ Selecciona un invento del laboratorio", "error"); return; }

  const inv = STATE.laboratorio.find(i => i.id === invId);
  if (!inv) return;

  hideElement("mercado-result");
  showElement("mercado-loading");

  const btn     = document.getElementById("btn-mercado-gen");
  const textEl  = document.getElementById("btn-mercado-text");
  if (btn) btn.disabled = true;
  if (textEl) textEl.textContent = "ANALIZANDO MERCADO...";

  const loadFill = document.getElementById("mercado-load-fill");
  const loadMsg  = document.getElementById("mercado-load-msg");
  const msgs = ["CALCULANDO TAM/SAM/SOM...", "ANALIZANDO COMPETIDORES...", "CONSTRUYENDO FODA...", "PROYECTANDO TENDENCIAS...", "ELABORANDO RECOMENDACIONES..."];
  for (let i = 0; i < msgs.length; i++) {
    if (loadMsg) loadMsg.textContent = msgs[i];
    if (loadFill) loadFill.style.width = `${((i + 1) / msgs.length) * 100}%`;
    await new Promise(r => setTimeout(r, 500));
  }

  const analisis = generateMercadoLocal(inv);
  STATE.mercadoResult = analisis;
  addXP(120, "📊 Análisis de mercado");
  addActivity("mercado", `Analizaste el mercado de <strong>${escapeHtml(inv.nombre)}</strong>`, 120);
  triggerAchievement("mercado_analizado");
  saveState();

  renderMercado(analisis, inv);
  hideElement("mercado-loading");
  showElement("mercado-result");
  if (btn) btn.disabled = false;
  if (textEl) textEl.textContent = "GENERAR ANÁLISIS DE MERCADO";
}

function generateMercadoLocal(inv) {
  const base   = Math.floor(500 + Math.random() * 9500);
  const tam    = `$${formatNum(base * 10)}M USD`;
  const sam    = `$${formatNum(Math.floor(base * 1.2))}M USD`;
  const som    = `$${formatNum(Math.floor(base * 0.08))}M USD`;

  return {
    tam, sam, som,
    cagr:  `${(8 + Math.random() * 22).toFixed(1)}%`,
    competidores: [
      { nombre: "GlobalTech Solutions", ventaja: "Distribución global establecida", debilidad: "Alto costo, poca flexibilidad", cuota: `${(15 + Math.random() * 20).toFixed(0)}%`, amenaza: "alta" },
      { nombre: "LocalInno MX",         ventaja: "Conocimiento local del mercado",  debilidad: "Recursos limitados",           cuota: `${(5  + Math.random() * 12).toFixed(0)}%`, amenaza: "media" },
      { nombre: "EcoStartup Labs",      ventaja: "Innovación ágil",                 debilidad: "Sin tracción de ventas",       cuota: `${(2  + Math.random() * 8).toFixed(0)}%`,  amenaza: "baja" },
    ],
    fortalezas:   ["Solución específica a necesidad local real", "Bajo costo de producción inicial", "Tecnología validada en contexto", "Equipo con conocimiento del problema"],
    debilidades:  ["Sin tracción de ventas comprobada", "Dependencia de suministro de componentes", "Capacidad de producción limitada", "Marca sin reconocimiento"],
    oportunidades:["Mercado en crecimiento acelerado", "Apoyo gubernamental a innovación social", "Escasez de soluciones locales", "Tendencia global hacia sostenibilidad"],
    amenazas:     ["Copias de competidores establecidos", "Cambios regulatorios", "Fluctuación de precios de insumos", "Adopción lenta en mercado objetivo"],
    cliente: {
      edad: "25-45 años",
      ingreso: "Clase media emergente, $8,000-20,000 MXN/mes",
      motivacion: "Resolución de problemas reales con tecnología accesible",
      canal: "Redes sociales, ferias de innovación, referencias directas",
      objecion: "Precio inicial y curva de aprendizaje técnico",
    },
    tendencias: [
      { nombre: "Tecnología accesible (frugal innovation)", pct: "+34%", dir: "up", desc: "Crecimiento acelerado de soluciones de bajo costo" },
      { nombre: "Economía circular y sostenibilidad",       pct: "+28%", dir: "up", desc: "Mayor demanda de productos eco-amigables" },
      { nombre: "IoT para comunidades",                     pct: "+41%", dir: "up", desc: "Adopción masiva de sensores conectados" },
      { nombre: "Manufactura local (nearshoring)",          pct: "+19%", dir: "up", desc: "Preferencia por productos Made in MX" },
    ],
    recomendaciones: [
      "Enfócate en el nicho de mercado más accesible antes de escalar.",
      "Busca alianzas con organizaciones locales para acelerar la adopción.",
      "Implementa un modelo freemium o piloto gratuito para validar el producto.",
      "Documenta cada venta y caso de éxito para construir credibilidad.",
      "Considera registrar la patente en México (IMPI) antes de hacer pública la solución.",
    ],
  };
}

function renderMercado(data, inv) {
  // Tamaño de mercado
  const sizeGrid = document.getElementById("market-size-grid");
  if (sizeGrid) {
    sizeGrid.innerHTML = [
      { icon: "🌍", label: "TAM (MERCADO TOTAL)",      val: data.tam,  sub: "Oportunidad máxima global" },
      { icon: "🎯", label: "SAM (MERCADO ACCESIBLE)",  val: data.sam,  sub: "Segmento que puedes alcanzar" },
      { icon: "💰", label: "SOM (MERCADO OBTENIBLE)",  val: data.som,  sub: "Meta realista primer año" },
      { icon: "📈", label: "CRECIMIENTO ANUAL (CAGR)", val: data.cagr, sub: "Tasa de crecimiento proyectada" },
    ].map(m => `
      <div class="ms-card">
        <div class="ms-icon">${m.icon}</div>
        <div class="ms-label">${m.label}</div>
        <div class="ms-value">${escapeHtml(m.val)}</div>
        <div class="ms-sub">${m.sub}</div>
      </div>
    `).join("");
  }

  // Tendencias
  const tendEl = document.getElementById("tendencias-list");
  if (tendEl) {
    tendEl.innerHTML = data.tendencias.map(t => `
      <div class="tendencia-item">
        <div class="tendencia-dot" style="background:${t.dir === "up" ? "var(--green-hud)" : "var(--pink)"}"></div>
        <div class="tendencia-info">
          <div class="tendencia-name">${escapeHtml(t.nombre)}</div>
          <div class="tendencia-desc">${escapeHtml(t.desc)}</div>
        </div>
        <span class="tendencia-dir ${t.dir === "up" ? "td-up" : "td-down"}">${escapeHtml(t.pct)} ▲</span>
      </div>
    `).join("");
  }

  // Competidores
  const tbody = document.getElementById("competitors-tbody");
  if (tbody) {
    tbody.innerHTML = data.competidores.map(c => `
      <tr>
        <td><strong>${escapeHtml(c.nombre)}</strong></td>
        <td>${escapeHtml(c.ventaja)}</td>
        <td>${escapeHtml(c.debilidad)}</td>
        <td style="font-family:var(--font-m);color:var(--cyan)">${escapeHtml(c.cuota)}</td>
        <td><span class="threat-badge threat-${c.amenaza}">${c.amenaza.toUpperCase()}</span></td>
      </tr>
    `).join("");
  }

  // FODA
  ["fortalezas", "debilidades", "oportunidades", "amenazas"].forEach(key => {
    const el = document.getElementById(`swot-${key}`);
    if (el) {
      el.innerHTML = data[key].map(item => `<li>${escapeHtml(item)}</li>`).join("");
    }
  });

  // Cliente ideal
  const cpEl = document.getElementById("customer-profile");
  if (cpEl) {
    const cp = data.cliente;
    cpEl.innerHTML = Object.entries({
      "👤 Edad / Perfil": cp.edad,
      "💵 Ingresos":      cp.ingreso,
      "❤️ Motivación":    cp.motivacion,
      "📲 Canal":         cp.canal,
      "⚠️ Objeción":     cp.objecion,
    }).map(([k, v]) => `
      <div class="cp-block">
        <div class="label">${k}</div>
        <div class="value">${escapeHtml(v)}</div>
      </div>
    `).join("");
  }

  // Recomendaciones
  const recEl = document.getElementById("recommendations-list");
  if (recEl) {
    recEl.innerHTML = data.recomendaciones.map(r => `
      <div class="rec-item">
        <i class="fa-solid fa-circle-check"></i>
        <p>${escapeHtml(r)}</p>
      </div>
    `).join("");
  }
}

/* ====================================================
   21. CALCULADORA DE COSTOS
   ==================================================== */

// Filas de materiales y mano de obra
let materialRows = [], laborRows = [];

function precargarCostos(invId) {
  if (!invId) return;
  const inv = STATE.laboratorio.find(i => i.id === invId);
  if (!inv) return;

  materialRows = inv.materiales.slice(0, 5).map((m, i) => ({
    id: uid(), nombre: m,
    cantidad: 1,
    precio: Math.floor(50 + Math.random() * 450),
  }));
  laborRows = [
    { id: uid(), actividad: "Diseño y prototipado", horas: 20, costo: 150 },
    { id: uid(), actividad: "Ensamblaje",           horas: 10, costo: 120 },
    { id: uid(), actividad: "Pruebas",              horas:  5, costo: 100 },
  ];
  renderCalcRows();
  calcularTotal();
}

function addMaterialRow() {
  materialRows.push({ id: uid(), nombre: "", cantidad: 1, precio: 0 });
  renderCalcRows();
}

function addLaborRow() {
  laborRows.push({ id: uid(), actividad: "", horas: 1, costo: 0 });
  renderCalcRows();
}

function renderCalcRows() {
  const matEl   = document.getElementById("materials-rows");
  const laborEl = document.getElementById("labor-rows");

  if (matEl) {
    matEl.innerHTML = materialRows.map(r => `
      <div class="mt-row">
        <input type="text"   value="${escapeHtml(r.nombre)}"    placeholder="Material..."  oninput="updateMatRow('${r.id}','nombre',this.value)" />
        <input type="number" value="${r.cantidad}" min="1"       oninput="updateMatRow('${r.id}','cantidad',this.value)" />
        <input type="number" value="${r.precio}"  min="0" step="0.01" oninput="updateMatRow('${r.id}','precio',this.value)" />
        <span class="mt-total">$${formatNum((r.cantidad * r.precio).toFixed(2))}</span>
        <button class="mt-del" onclick="delMatRow('${r.id}')"><i class="fa-solid fa-xmark"></i></button>
      </div>
    `).join("");
  }

  if (laborEl) {
    laborEl.innerHTML = laborRows.map(r => `
      <div class="mt-row">
        <input type="text"   value="${escapeHtml(r.actividad)}" placeholder="Actividad..."  oninput="updateLaborRow('${r.id}','actividad',this.value)" />
        <input type="number" value="${r.horas}" min="0"          oninput="updateLaborRow('${r.id}','horas',this.value)" />
        <input type="number" value="${r.costo}" min="0"          oninput="updateLaborRow('${r.id}','costo',this.value)" />
        <span class="mt-total">$${formatNum((r.horas * r.costo).toFixed(2))}</span>
        <button class="mt-del" onclick="delLaborRow('${r.id}')"><i class="fa-solid fa-xmark"></i></button>
      </div>
    `).join("");
  }

  // Subtotales
  const matSubtotal   = materialRows.reduce((s, r) => s + r.cantidad * r.precio, 0);
  const laborSubtotal = laborRows.reduce((s, r) => s + r.horas * r.costo, 0);
  setEl("mat-subtotal",   `$${formatNum(matSubtotal.toFixed(2))}`);
  setEl("labor-subtotal", `$${formatNum(laborSubtotal.toFixed(2))}`);
}

function updateMatRow(id, key, val) {
  const row = materialRows.find(r => r.id === id);
  if (!row) return;
  row[key] = key === "nombre" ? val : parseFloat(val) || 0;
  renderCalcRows();
  calcularTotal();
}
function updateLaborRow(id, key, val) {
  const row = laborRows.find(r => r.id === id);
  if (!row) return;
  row[key] = key === "actividad" ? val : parseFloat(val) || 0;
  renderCalcRows();
  calcularTotal();
}
function delMatRow(id)   { materialRows = materialRows.filter(r => r.id !== id); renderCalcRows(); calcularTotal(); }
function delLaborRow(id) { laborRows    = laborRows.filter(r => r.id !== id);    renderCalcRows(); calcularTotal(); }

function calcularTotal() {
  const matSubtotal   = materialRows.reduce((s, r) => s + r.cantidad * r.precio, 0);
  const laborSubtotal = laborRows.reduce((s, r) => s + r.horas * r.costo, 0);

  const overheadPct = parseFloat(document.getElementById("overhead-pct")?.value || 15) / 100;
  const gananciaPct = parseFloat(document.getElementById("ganancia-pct")?.value  || 30) / 100;
  const volumen     = parseInt(document.getElementById("volumen-prod")?.value    || 1);
  const precioVenta = parseFloat(document.getElementById("precio-venta")?.value  || 0);

  const subtotal  = matSubtotal + laborSubtotal;
  const overhead  = subtotal * overheadPct;
  const costoTotal = subtotal + overhead;
  const precioSugerido = costoTotal * (1 + gananciaPct);
  const inversionTotal = costoTotal * volumen;

  // Mostrar resultados
  hideElement("calc-results-empty");
  showElement("cost-summary");
  showElement("breakeven-panel");
  showElement("roi-panel");
  showElement("calc-export");

  const breakdownEl = document.getElementById("cost-breakdown");
  if (breakdownEl) {
    breakdownEl.innerHTML = `
      <div class="cbd-item"><span class="cbd-label">Materiales</span><span class="cbd-val cyan">$${formatNum(matSubtotal.toFixed(2))}</span></div>
      <div class="cbd-item"><span class="cbd-label">Mano de obra</span><span class="cbd-val cyan">$${formatNum(laborSubtotal.toFixed(2))}</span></div>
      <div class="cbd-item"><span class="cbd-label">Gastos generales (${(overheadPct*100).toFixed(0)}%)</span><span class="cbd-val orange">$${formatNum(overhead.toFixed(2))}</span></div>
      <div class="cbd-item total"><span class="cbd-label">COSTO TOTAL UNITARIO</span><span class="cbd-val" style="color:var(--gold);font-size:16px">$${formatNum(costoTotal.toFixed(2))} MXN</span></div>
    `;
  }

  const totalsEl = document.getElementById("cost-totals");
  if (totalsEl) {
    const margen = precioVenta > 0 ? (((precioVenta - costoTotal) / precioVenta) * 100).toFixed(1) : "—";
    totalsEl.innerHTML = `
      <div class="ct-row"><span class="ct-label">PRECIO SUGERIDO (${(gananciaPct*100).toFixed(0)}% margen)</span><span class="ct-val" style="color:var(--green-hud)">$${formatNum(precioSugerido.toFixed(2))}</span></div>
      <div class="ct-row"><span class="ct-label">INVERSIÓN TOTAL (${volumen} unidades)</span><span class="ct-val" style="color:var(--cyan)">$${formatNum(inversionTotal.toFixed(2))}</span></div>
      ${precioVenta > 0 ? `<div class="ct-row"><span class="ct-label">MARGEN REAL CON PRECIO OBJETIVO</span><span class="ct-val" style="color:${parseFloat(margen) > 0 ? "var(--green-hud)" : "var(--pink)"}">${margen}%</span></div>` : ""}
    `;
  }

  // Break-even
  const beEl = document.getElementById("be-content");
  if (beEl && precioVenta > 0) {
    const unidadesBreakeven = Math.ceil(inversionTotal / (precioVenta - costoTotal));
    beEl.innerHTML = `
      <div class="be-item"><div class="be-val">${formatNum(unidadesBreakeven)}</div><div class="be-label">UNIDADES PARA BREAK-EVEN</div></div>
      <div class="be-item"><div class="be-val">$${formatNum((unidadesBreakeven * precioVenta).toFixed(0))}</div><div class="be-label">INGRESOS NECESARIOS</div></div>
    `;
  } else if (beEl) {
    beEl.innerHTML = `<p style="color:var(--text-muted);font-size:12px">Ingresa un precio de venta para calcular el break-even</p>`;
  }

  // ROI
  const roiEl = document.getElementById("roi-content");
  if (roiEl && precioVenta > 0) {
    const revenueAnual = precioVenta * volumen * 12;
    const roi = (((revenueAnual - inversionTotal) / inversionTotal) * 100).toFixed(0);
    roiEl.innerHTML = `
      <div class="roi-grid">
        <div class="roi-item"><div class="roi-val">$${formatNum(revenueAnual.toFixed(0))}</div><div class="roi-label">REVENUE ANUAL EST.</div></div>
        <div class="roi-item"><div class="roi-val" style="color:${parseInt(roi) > 0 ? "var(--green-hud)" : "var(--pink)"}">${roi}%</div><div class="roi-label">ROI PROYECTADO</div></div>
        <div class="roi-item"><div class="roi-val">${Math.max(1, Math.ceil(inversionTotal / (precioVenta - costoTotal) / (volumen / 12)))} meses</div><div class="roi-label">PAYBACK ESTIMADO</div></div>
      </div>
    `;
  }

  addXP(40, "💰 Costos calculados");
  triggerAchievement("costos_calculados");
  saveState();
}

/* ====================================================
   22. PITCH DECK
   ==================================================== */

async function generarPitchDirect() {
  if (!STATE.currentInvento) {
    showToast("⚠ Genera un invento primero", "error"); return;
  }
  const inv = STATE.currentInvento;
  if (!STATE.laboratorio.find(l => l.id === inv.id)) guardarInvento(true);

  navigate("pitch", document.querySelector("[data-section='pitch']"));
  setTimeout(() => {
    const sel = document.getElementById("pitch-inv-select");
    if (sel) sel.value = inv.id;
    generarPitchDeck();
  }, 300);
}

async function generarPitchDeck() {
  const invId = document.getElementById("pitch-inv-select")?.value;
  if (!invId) { showToast("⚠ Selecciona un invento del laboratorio", "error"); return; }

  const inv      = STATE.laboratorio.find(i => i.id === invId);
  if (!inv) return;

  const audiencia = document.getElementById("pitch-audiencia")?.value || "inversores";
  const ask       = document.getElementById("pitch-ask")?.value       || "50000";
  const etapa     = document.getElementById("pitch-etapa")?.value     || "idea";

  hideElement("pitch-result");
  showElement("pitch-loading");

  const btn    = document.getElementById("btn-pitch-gen");
  const textEl = document.getElementById("btn-pitch-text");
  if (btn) btn.disabled = true;
  if (textEl) textEl.textContent = "GENERANDO PITCH...";

  const loadFill = document.getElementById("pitch-load-fill");
  const loadMsg  = document.getElementById("pitch-load-msg");
  const steps = ["ESTRUCTURANDO NARRATIVA...", "DISEÑANDO SLIDES...", "CALCULANDO MÉTRICAS...", "REFINANDO PITCH...", "GENERANDO NOTAS..."];
  for (let i = 0; i < steps.length; i++) {
    if (loadMsg) loadMsg.textContent = steps[i];
    if (loadFill) loadFill.style.width = `${((i + 1) / steps.length) * 100}%`;
    await new Promise(r => setTimeout(r, 480));
  }

  const slides = generatePitchSlides(inv, audiencia, ask, etapa);
  STATE.pitchSlides = slides;
  STATE.currentPitchSlide = 0;

  addXP(180, "🎯 Pitch deck creado");
  addActivity("pitch", `Creaste pitch deck de <strong>${escapeHtml(inv.nombre)}</strong>`, 180);
  triggerAchievement("pitch_creado");
  saveState();

  renderPitchDeck(slides, inv);
  hideElement("pitch-loading");
  showElement("pitch-result");
  if (btn) btn.disabled = false;
  if (textEl) textEl.textContent = "GENERAR PITCH DECK PROFESIONAL";
  showToast("🎯 Pitch Deck generado", "success");
}

function generatePitchSlides(inv, audiencia, ask, etapa) {
  const askFmt = ask ? `$${formatNum(parseInt(ask))} USD` : "$50,000 USD";
  return [
    { type: "cover",     title: inv.nombre.toUpperCase(), subtitle: `${inv.categoria} · ${inv.dificultad}`, content: `"${inv.descripcion.slice(0, 120)}..."`, accent: "var(--cyan)",   num: "01 / PORTADA",      notes: "Saluda, preséntate brevemente y menciona el nombre del invento con seguridad y entusiasmo." },
    { type: "problema",  title: "EL PROBLEMA",            subtitle: "Una necesidad real sin resolver",       content: inv.problema,                          accent: "var(--pink)",  num: "02 / PROBLEMA",     notes: "Presenta el problema con datos y emoción. ¿A cuántas personas afecta? ¿Cuánto les cuesta?" },
    { type: "solucion",  title: "NUESTRA SOLUCIÓN",       subtitle: inv.nombre,                             content: inv.descripcion.slice(0, 200),          accent: "var(--green-hud)", num: "03 / SOLUCIÓN", notes: "Explica tu solución en términos simples. Si tienes demo, ¡muéstrala aquí!" },
    { type: "mercado",   title: "OPORTUNIDAD DE MERCADO", subtitle: "Un mercado enorme y creciente",         content: null, isStats: true,                   accent: "var(--purple-2)", num: "04 / MERCADO",  notes: "Presenta TAM, SAM, SOM. Muestra que entiendes el mercado y tienes estrategia clara." },
    { type: "modelo",    title: "MODELO DE NEGOCIO",      subtitle: "¿Cómo generamos dinero?",              content: null, isModel: true,                   accent: "var(--gold)",   num: "05 / NEGOCIO",      notes: "Explica de forma simple cómo el negocio genera dinero y es sostenible." },
    { type: "traccion",  title: "TRACCIÓN Y VALIDACIÓN",  subtitle: "Lo que hemos logrado hasta hoy",       content: `Etapa actual: ${etapa.toUpperCase()}. Tecnologías validadas: ${inv.tecnologias.join(", ")}. Problema verificado con usuarios reales.`, accent: "var(--cyan)", num: "06 / TRACCIÓN", notes: "Muestra evidencia concreta. Incluso un prototipo básico o testimonios valen." },
    { type: "tech",      title: "TECNOLOGÍA",             subtitle: "Nuestra ventaja técnica diferencial",  content: null, isTech: true,                    accent: "var(--purple-2)", num: "07 / TECNOLOGÍA", notes: "Explica qué hace tu tecnología diferente sin ser demasiado técnico." },
    { type: "equipo",    title: "EL EQUIPO",              subtitle: "Las personas detrás de la solución",   content: null, isTeam: true,                    accent: "var(--green-hud)", num: "08 / EQUIPO",   notes: "El equipo es clave para los inversores. Muestra complementariedad y experiencia." },
    { type: "financiero",title: "PROYECCIONES FINANCIERAS",subtitle:"12-36 meses de crecimiento proyectado", content: null, isFinancial: true,              accent: "var(--gold)",   num: "09 / FINANZAS",     notes: "Sé conservador pero ambicioso. Explica los supuestos detrás de tus números." },
    { type: "ask",       title: "LA INVERSIÓN",           subtitle: `Solicitamos ${askFmt}`,                content: `Para ${audiencia === "inversores" ? "capital semilla" : "desarrollo y escala"}. En ${inv.tiempo} tendremos el primer prototipo funcional validado.`, accent: "var(--gold)", num: "10 / INVERSIÓN", notes: `Sé específico: ${askFmt} para qué exactamente. Muestra la hoja de ruta post-inversión.` },
    { type: "roadmap",   title: "HOJA DE RUTA",           subtitle: "Próximos 12 meses",                    content: null, isRoadmap: true,                 accent: "var(--cyan)",   num: "11 / ROADMAP",      notes: "Muestra que tienes un plan claro. Los inversores quieren ver ejecución, no solo ideas." },
    { type: "cierre",    title: "ÚNETE A NOSOTROS",       subtitle: `${inv.nombre} — Transformando el futuro`, content: inv.impacto,                       accent: "var(--cyan)",   num: "12 / CIERRE",       notes: "Cierra con energía. Repite el nombre del invento, el impacto y la inversión solicitada." },
  ];
}

function renderPitchDeck(slides, inv) {
  const container = document.getElementById("slide-container");
  const thumbs    = document.getElementById("pitch-thumbnails");
  if (!container) return;

  setEl("pn-title", `${inv.emoji} ${inv.nombre.toUpperCase()}`);
  setEl("pn-slide-count", `Diapositiva 1 de ${slides.length}`);

  container.innerHTML = slides.map((s, i) => renderSlide(s, inv, i)).join("");

  // Thumbnails
  if (thumbs) {
    thumbs.innerHTML = slides.map((s, i) => `
      <div class="pitch-thumb ${i === 0 ? "active" : ""}" onclick="goToSlide(${i})">${escapeHtml(s.num.split("/")[0].trim())}</div>
    `).join("");
  }

  goToSlide(0);
}

function renderSlide(s, inv, idx) {
  let body = "";

  if (s.isStats) {
    body = `<div class="slide-stat-grid">
      ${[["🌍 TAM", `$${formatNum(Math.floor(3000 + Math.random() * 7000))}M`], ["🎯 SAM", `$${formatNum(Math.floor(300 + Math.random() * 700))}M`], ["💰 SOM (Año 1)", `$${formatNum(Math.floor(10 + Math.random() * 90))}M`]].map(([l, v]) => `<div class="slide-stat"><div class="slide-stat-val" style="color:${s.accent}">${v}</div><div class="slide-stat-label">${l}</div></div>`).join("")}
    </div>`;
  } else if (s.isModel) {
    body = `<ul class="slide-content"><li>Venta directa B2C del hardware + instalación</li><li>Mantenimiento anual por suscripción (MRR)</li><li>Licenciamiento B2B para municipios y gobiernos</li><li>Datos agregados como servicio (API)</li></ul>`;
  } else if (s.isTech) {
    body = `<div class="slide-tag-grid">${inv.tecnologias.map(t => `<span class="slide-tag" style="border-color:${s.accent};color:${s.accent}">${escapeHtml(t)}</span>`).join("")}</div>
    <p style="margin-top:16px;color:rgba(255,255,255,0.6);font-size:13px">${inv.descripcion.slice(0, 150)}...</p>`;
  } else if (s.isTeam) {
    const roles = [["C", "CEO / Visión de producto"], ["T", "CTO / Desarrollo técnico"], ["D", "CDO / Diseño y UX"], ["M", "CMO / Mercado"]];
    body = `<div class="slide-team-grid">${roles.map(([a, r]) => `<div class="slide-team-card"><div class="slide-team-avatar">${a}</div><div class="slide-team-name">CO-FUNDADOR</div><div class="slide-team-role">${r}</div></div>`).join("")}</div>`;
  } else if (s.isFinancial) {
    body = `<div class="slide-stat-grid">
      ${[["AÑO 1", "$120K USD"], ["AÑO 2", "$480K USD"], ["AÑO 3", "$1.8M USD"]].map(([l, v]) => `<div class="slide-stat"><div class="slide-stat-val" style="color:${s.accent}">${v}</div><div class="slide-stat-label">${l}</div></div>`).join("")}
    </div>`;
  } else if (s.isRoadmap) {
    body = `<ul class="slide-content">
      <li><span class="slide-highlight">Q1:</span> Prototipo funcional + validación con 10 usuarios</li>
      <li><span class="slide-highlight">Q2:</span> Versión beta + 50 primeros clientes piloto</li>
      <li><span class="slide-highlight">Q3:</span> Lanzamiento oficial + estrategia de distribución</li>
      <li><span class="slide-highlight">Q4:</span> Escala a 3 ciudades + búsqueda de Serie A</li>
    </ul>`;
  } else {
    body = `<p class="slide-content">${escapeHtml(s.content || "")}</p>`;
  }

  return `
    <div class="pitch-slide slide-${s.type}" style="display:none" data-index="${idx}">
      <div class="slide-num" style="color:${s.accent}">${escapeHtml(s.num)}</div>
      <h2 class="slide-title" style="color:${s.accent}">${escapeHtml(s.title)}</h2>
      <p class="slide-subtitle">${escapeHtml(s.subtitle)}</p>
      <div style="flex:1">${body}</div>
      <div class="ps-cta-footer">
        <span class="ps-contact"><i class="fa-solid fa-envelope"></i> contacto@${inv.nombre.toLowerCase().replace(/\s/g, "")}.mx</span>
        <span class="ps-slide-num">${escapeHtml(s.num)}</span>
      </div>
    </div>
  `;
}

function goToSlide(idx) {
  const slides = document.querySelectorAll(".pitch-slide");
  const thumbs = document.querySelectorAll(".pitch-thumb");
  const total  = slides.length;
  if (idx < 0 || idx >= total) return;

  slides.forEach((s, i) => { s.style.display = i === idx ? "flex" : "none"; });
  thumbs.forEach((t, i) => { t.classList.toggle("active", i === idx); });
  STATE.currentPitchSlide = idx;

  setEl("pn-slide-count", `Diapositiva ${idx + 1} de ${total}`);
  const btn1 = document.getElementById("btn-prev-slide");
  const btn2 = document.getElementById("btn-next-slide");
  if (btn1) btn1.disabled = idx === 0;
  if (btn2) btn2.disabled = idx === total - 1;

  // Notas del presentador
  const notes = STATE.pitchSlides[idx]?.notes || "";
  setEl("pnp-content", notes);
}

function prevSlide() { goToSlide(STATE.currentPitchSlide - 1); }
function nextSlide() { goToSlide(STATE.currentPitchSlide + 1); }

function togglePitchFullscreen() {
  const viewer = document.getElementById("pitch-viewer");
  if (!viewer) return;
  viewer.classList.toggle("fullscreen");
  const btn = document.querySelector(".pn-fullscreen i");
  if (btn) btn.className = viewer.classList.contains("fullscreen") ? "fa-solid fa-compress" : "fa-solid fa-expand";
}

/* ====================================================
   23. BÚSQUEDA DE PATENTES
   ==================================================== */

function cargarInvencionPatente(invId) {
  if (!invId) return;
  const inv = STATE.laboratorio.find(i => i.id === invId);
  if (!inv) return;
  const input = document.getElementById("pat-search-input");
  if (input) input.value = inv.nombre + " " + inv.tecnologias.slice(0, 2).join(" ");
}

async function buscarPatentes() {
  const query = document.getElementById("pat-search-input")?.value.trim();
  if (!query) { showToast("⚠ Escribe palabras clave para buscar", "error"); return; }

  const invId = document.getElementById("pat-inv-select")?.value;
  const inv   = invId ? STATE.laboratorio.find(i => i.id === invId) : null;

  hideElement("pat-results");
  showElement("novelty-score-card");
  showElement("pat-loading");

  const loadFill = document.getElementById("pat-load-fill");
  const loadMsg  = document.getElementById("pat-load-msg");
  for (let i = 0; i <= 5; i++) {
    if (loadMsg) loadMsg.textContent = ["CONSULTANDO BASE DE DATOS...", "ANALIZANDO SIMILITUDES...", "CLASIFICANDO RESULTADOS...", "CALCULANDO NOVEDAD...", "PREPARANDO INFORME...", "FINALIZADO"][i];
    if (loadFill) loadFill.style.width = `${(i / 5) * 100}%`;
    await new Promise(r => setTimeout(r, 450));
  }

  const results = generatePatentResults(query);
  STATE.patentResults = results;
  const noveltyScore = Math.floor(45 + Math.random() * 50);

  // Novelty score
  setEl("nsc-score", `${noveltyScore}/100`);
  const nscFill = document.getElementById("nsc-fill");
  if (nscFill) setTimeout(() => { nscFill.style.width = `${noveltyScore}%`; nscFill.style.background = noveltyScore > 70 ? "var(--green-hud)" : noveltyScore > 50 ? "var(--orange)" : "var(--pink)"; }, 200);
  setEl("nsc-verdict", noveltyScore > 70
    ? "✅ Alta originalidad detectada. La mayoría de patentes son de área distinta. Se recomienda proceder con protección IP."
    : noveltyScore > 50
    ? "⚡ Novedad media. Existen soluciones similares pero tu enfoque es diferenciado. Refuerza la propuesta técnica única."
    : "⚠️ Baja novedad detectada. Hay patentes muy similares activas. Considera rediseñar el componente diferencial antes de patentar."
  );

  renderPatentes(results);
  hideElement("pat-loading");
  showElement("pat-results");
  setEl("pat-results-count", `${results.length} patentes encontradas`);

  addXP(90, "🛡️ Búsqueda de patentes");
  triggerAchievement("patente_buscada");
  saveState();
}

function generatePatentResults(query) {
  const templates = [
    { titulo: "Sistema de filtración modular de agua potable para comunidades remotas", code: "MX/2021/004521", año: 2021, autores: "García M., López R., Pérez A.", sim: Math.floor(30 + Math.random() * 60) },
    { titulo: "Dispositivo de monitoreo ambiental inalámbrico de bajo consumo energético", code: "US20220183547A1", año: 2022, autores: "Smith J., Doe A.", sim: Math.floor(20 + Math.random() * 50) },
    { titulo: "Sistema integrado de generación y almacenamiento de energía solar a escala doméstica", code: "EP3891824B1", año: 2021, autores: "Müller H., Schmidt K.", sim: Math.floor(15 + Math.random() * 45) },
    { titulo: "Método y aparato para diagnóstico médico mediante inteligencia artificial embebida", code: "WO2022/084291", año: 2022, autores: "Chen L., Wang Y.", sim: Math.floor(10 + Math.random() * 40) },
    { titulo: "Plataforma de educación adaptativa sin conectividad para dispositivos móviles", code: "MX/2020/008834", año: 2020, autores: "Ramírez J., Torres K.", sim: Math.floor(5 + Math.random() * 35) },
  ];

  return templates.map(t => ({
    ...t,
    resumen: `Patente relacionada con "${query}". Esta invención describe un método novedoso con aplicaciones en el área de ${query.split(" ").slice(0, 3).join(" ")}. Registrada ante la oficina de PI correspondiente.`,
    clasificacion: ["A", "B", "F", "G", "H"][Math.floor(Math.random() * 5)],
    tags: query.split(" ").filter(Boolean).slice(0, 3),
  })).sort((a, b) => b.sim - a.sim);
}

function renderPatentes(results) {
  const grid = document.getElementById("pat-grid");
  if (!grid) return;

  grid.innerHTML = results.map(p => {
    const simClass = p.sim >= 60 ? "sim-high" : p.sim >= 35 ? "sim-medium" : "sim-low";
    return `
      <div class="pat-card" onclick="openPatentDetail('${escapeHtml(p.code)}')">
        <div class="pc-header">
          <div>
            <div class="pc-code">${escapeHtml(p.code)}</div>
            <div class="pc-year">${p.año} · CPC: ${p.clasificacion}</div>
          </div>
          <div class="pc-similarity">
            <span class="sim-value ${simClass}">${p.sim}%</span>
            <span class="sim-label">SIMILITUD</span>
          </div>
        </div>
        <div class="pc-title">${escapeHtml(p.titulo)}</div>
        <div class="pc-desc">${escapeHtml(p.resumen)}</div>
        <div class="pc-footer">
          <div class="pc-tags">${p.tags.map(t => `<span class="pc-tag">${escapeHtml(t)}</span>`).join("")}</div>
          <span class="pc-authors">${escapeHtml(p.autores)}</span>
        </div>
      </div>
    `;
  }).join("");

  // IP Steps
  const ipSteps = document.getElementById("ip-steps");
  if (ipSteps) {
    const steps = [
      { num: "1", title: "Búsqueda de anterioridad", desc: "Verifica que tu invento es genuinamente nuevo consultando IMPI, USPTO y EPO." },
      { num: "2", title: "Documenta el proceso de invención", desc: "Fecha, descripción técnica detallada, diagramas y primeros prototipos firmados." },
      { num: "3", title: "Redacta las reivindicaciones", desc: "La parte más importante de la patente. Define exactamente qué proteges." },
      { num: "4", title: "Presenta la solicitud", desc: "En México, cuesta ~$2,800 MXN con IMPI. Considera un abogado de PI." },
      { num: "5", title: "Mantén la patente activa", desc: "Paga las anualidades. Una patente abandonada es de dominio público." },
    ];
    ipSteps.innerHTML = steps.map(s => `
      <div class="ip-step">
        <div class="ip-step-num">${s.num}</div>
        <div class="ip-step-info">
          <div class="title">${s.title}</div>
          <div class="desc">${s.desc}</div>
        </div>
      </div>
    `).join("");
  }
}

function openPatentDetail(code) {
  const pat = STATE.patentResults.find(p => p.code === code);
  if (!pat) return;

  const content = document.getElementById("modal-patent-content");
  if (!content) return;

  const simClass = pat.sim >= 60 ? "sim-high" : pat.sim >= 35 ? "sim-medium" : "sim-low";
  content.innerHTML = `
    <div class="pat-detail">
      <div class="pat-detail-header">
        <div class="pat-detail-code">${escapeHtml(pat.code)}</div>
        <div class="pat-detail-title">${escapeHtml(pat.titulo)}</div>
        <div class="pat-detail-meta">
          <span><i class="fa-regular fa-calendar"></i> ${pat.año}</span>
          <span><i class="fa-solid fa-users"></i> ${escapeHtml(pat.autores)}</span>
          <span><i class="fa-solid fa-tag"></i> CPC: ${pat.clasificacion}</span>
          <span class="sim-value ${simClass}" style="font-size:14px">${pat.sim}% similitud</span>
        </div>
      </div>
      <div class="pat-detail-section">
        <h4>RESUMEN</h4>
        <p>${escapeHtml(pat.resumen)}</p>
      </div>
      <div class="pat-detail-section">
        <h4>REIVINDICACIONES PRINCIPALES</h4>
        <ol class="pat-claims-list">
          <li>El método descrito en esta patente comprende los pasos de análisis, síntesis y aplicación del principio técnico central.</li>
          <li>El dispositivo según la reivindicación 1, caracterizado por incorporar componentes de bajo costo y fácil mantenimiento.</li>
          <li>Sistema según las reivindicaciones anteriores, adaptable a distintos contextos geográficos y socioeconómicos.</li>
        </ol>
      </div>
    </div>
  `;
  openModal("modal-patent");
}

function sortPatentes(criteria) {
  const sorted = [...STATE.patentResults];
  if (criteria === "similarity")  sorted.sort((a, b) => b.sim - a.sim);
  if (criteria === "date-desc")   sorted.sort((a, b) => b.año - a.año);
  if (criteria === "date-asc")    sorted.sort((a, b) => a.año - b.año);
  STATE.patentResults = sorted;
  renderPatentes(sorted);
}

/* ====================================================
   24. KANBAN
   ==================================================== */

function cambiarInventoKanban(invId) {
  STATE.currentKanbanInvento = invId;

  const btns = ["btn-add-card", "btn-reset-kanban", "btn-export-kanban"];
  btns.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = !invId;
  });

  if (!invId) {
    hideElement("kanban-board");
    showElement("kanban-empty");
    return;
  }

  hideElement("kanban-empty");
  showElement("kanban-board");

  // Inicializar datos del kanban si no existen
  if (!STATE.kanbanData[invId]) {
    const inv = STATE.laboratorio.find(i => i.id === invId);
    STATE.kanbanData[invId] = {
      idea:          [createKanbanCard("📋 Definir requerimientos técnicos", "Listar todas las funcionalidades clave del sistema", "media"), createKanbanCard("🔍 Investigación inicial", "Buscar soluciones existentes y analizar diferenciadores", "baja")],
      investigacion: [createKanbanCard("📚 Revisión bibliográfica", "Buscar papers y proyectos similares en repositorios científicos", "media")],
      prototipo:     [],
      pruebas:       [],
      lanzamiento:   [],
    };
    saveState();
  }

  renderKanban();
}

function createKanbanCard(titulo, desc = "", priority = "media") {
  return { id: uid(), titulo, desc, priority, fecha: new Date().toISOString(), done: false };
}

function renderKanban() {
  const invId = STATE.currentKanbanInvento;
  if (!invId || !STATE.kanbanData[invId]) return;

  const data  = STATE.kanbanData[invId];
  const cols  = ["idea", "investigacion", "prototipo", "pruebas", "lanzamiento"];
  let totalCards = 0, doneCards = 0;

  cols.forEach(col => {
    const colEl    = document.getElementById(`kc-cards-${col}`);
    const countEl  = document.getElementById(`kc-count-${col}`);
    const cards    = data[col] || [];
    totalCards += cards.length;
    doneCards  += cards.filter(c => c.done).length;

    if (countEl) countEl.textContent = cards.length;
    if (colEl) {
      colEl.innerHTML = cards.map(card => renderKanbanCard(card, col)).join("");
    }
  });

  // Stats
  const pct = totalCards > 0 ? Math.floor((doneCards / totalCards) * 100) : 0;
  setEl("ks-total", totalCards);
  setEl("ks-done",  doneCards);
  setEl("ks-progress", `${pct}%`);
  const fill = document.getElementById("ks-fill");
  if (fill) fill.style.width = `${pct}%`;
}

function renderKanbanCard(card, col) {
  return `
    <div class="kc-card ${card.done ? "opacity-60" : ""}" draggable="true" id="kcard-${card.id}"
         ondragstart="dragStart(event,'${card.id}','${col}')">
      <div class="kcc-actions">
        <button class="kcc-btn" onclick="editKanbanCard('${card.id}','${col}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
        <button class="kcc-btn del" onclick="deleteKanbanCard('${card.id}','${col}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
      </div>
      <div class="kcc-title">${escapeHtml(card.titulo)}</div>
      ${card.desc ? `<div class="kcc-desc">${escapeHtml(card.desc)}</div>` : ""}
      <div class="kcc-meta">
        <span class="kcc-priority ${card.priority}">${card.priority.toUpperCase()}</span>
        <label class="kcc-check ${card.done ? "checked" : ""}" onclick="toggleKanbanDone('${card.id}','${col}')">
          ${card.done ? "<i class='fa-solid fa-check'></i>" : ""}
        </label>
        <span class="kcc-date">${relativeTime(card.fecha)}</span>
      </div>
    </div>
  `;
}

// Drag & Drop
let draggedCard = null, draggedCol = null;

function dragStart(event, cardId, col) {
  draggedCard = cardId;
  draggedCol  = col;
  event.dataTransfer.effectAllowed = "move";
  const el = document.getElementById(`kcard-${cardId}`);
  if (el) el.classList.add("dragging");
}

function allowDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.add("drag-over");
}

function dropCard(event, targetCol) {
  event.preventDefault();
  event.currentTarget.classList.remove("drag-over");
  if (!draggedCard || !draggedCol || draggedCol === targetCol) return;

  const invId = STATE.currentKanbanInvento;
  if (!invId || !STATE.kanbanData[invId]) return;

  const srcCards = STATE.kanbanData[invId][draggedCol];
  const cardIdx  = srcCards.findIndex(c => c.id === draggedCard);
  if (cardIdx === -1) return;

  const [card] = srcCards.splice(cardIdx, 1);
  STATE.kanbanData[invId][targetCol].push(card);

  const el = document.getElementById(`kcard-${draggedCard}`);
  if (el) el.classList.remove("dragging");

  draggedCard = null;
  draggedCol  = null;

  renderKanban();
  addXP(10, "🗂️ Tarjeta movida");
  triggerAchievement("kanban_activo");
  saveState();
}

function addKanbanCard() {
  addCardToCol("idea");
}

function addCardToCol(col) {
  openKanbanCardModal(null, col);
}

function editKanbanCard(cardId, col) {
  openKanbanCardModal(cardId, col);
}

function openKanbanCardModal(cardId, col) {
  const invId  = STATE.currentKanbanInvento;
  if (!invId) return;

  let card = null;
  if (cardId) {
    const cards = STATE.kanbanData[invId][col] || [];
    card = cards.find(c => c.id === cardId);
  }

  const form = document.getElementById("kanban-card-form");
  if (!form) return;

  form.innerHTML = `
    <h3><i class="fa-solid fa-${card ? "pen" : "plus"}"></i> ${card ? "EDITAR TAREA" : "NUEVA TAREA"}</h3>
    <div class="hud-field">
      <label><i class="fa-solid fa-heading"></i> TÍTULO</label>
      <input type="text" id="kf-titulo" value="${escapeHtml(card?.titulo || "")}" placeholder="Título de la tarea..." maxlength="80" />
      <div class="fc tl"></div><div class="fc tr"></div><div class="fc bl"></div><div class="fc br"></div>
    </div>
    <div class="hud-field">
      <label><i class="fa-solid fa-align-left"></i> DESCRIPCIÓN</label>
      <textarea id="kf-desc" rows="3" placeholder="Detalle de la tarea..." maxlength="300">${escapeHtml(card?.desc || "")}</textarea>
      <div class="fc tl"></div><div class="fc tr"></div><div class="fc bl"></div><div class="fc br"></div>
    </div>
    <div class="kcf-priority-row">
      ${["baja", "media", "alta"].map(p => `<button class="kcf-priority-btn ${p} ${(card?.priority || "media") === p ? "selected" : ""}" onclick="selectPriority(this,'${p}')">${p.toUpperCase()}</button>`).join("")}
    </div>
    <input type="hidden" id="kf-priority" value="${card?.priority || "media"}" />
    <div class="kcf-actions">
      <button class="btn-hud" onclick="saveKanbanCard('${cardId || ""}','${col}')"><span class="btn-bg"></span><i class="fa-solid fa-check"></i> GUARDAR</button>
      <button class="btn-ghost" onclick="closeModal('modal-kanban-card')">CANCELAR</button>
    </div>
  `;
  openModal("modal-kanban-card");

  // Focus
  setTimeout(() => { document.getElementById("kf-titulo")?.focus(); }, 200);
}

function selectPriority(btn, priority) {
  document.querySelectorAll(".kcf-priority-btn").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  const hidden = document.getElementById("kf-priority");
  if (hidden) hidden.value = priority;
}

function saveKanbanCard(cardId, col) {
  const titulo   = document.getElementById("kf-titulo")?.value.trim();
  const desc     = document.getElementById("kf-desc")?.value.trim();
  const priority = document.getElementById("kf-priority")?.value || "media";

  if (!titulo) { showToast("⚠ El título es obligatorio", "error"); return; }

  const invId = STATE.currentKanbanInvento;
  if (!invId || !STATE.kanbanData[invId]) return;

  if (cardId) {
    const card = STATE.kanbanData[invId][col]?.find(c => c.id === cardId);
    if (card) { card.titulo = titulo; card.desc = desc; card.priority = priority; }
  } else {
    STATE.kanbanData[invId][col].push(createKanbanCard(titulo, desc, priority));
  }

  saveState();
  renderKanban();
  closeModal("modal-kanban-card");
  showToast("✅ Tarea guardada", "success");
}

function deleteKanbanCard(cardId, col) {
  if (!confirm("¿Eliminar esta tarea?")) return;
  const invId = STATE.currentKanbanInvento;
  if (!invId) return;
  STATE.kanbanData[invId][col] = STATE.kanbanData[invId][col].filter(c => c.id !== cardId);
  saveState();
  renderKanban();
}

function toggleKanbanDone(cardId, col) {
  const invId = STATE.currentKanbanInvento;
  if (!invId) return;
  const card = STATE.kanbanData[invId][col]?.find(c => c.id === cardId);
  if (!card) return;
  card.done = !card.done;
  saveState();
  renderKanban();
}

function resetKanban() {
  if (!confirm("¿Reiniciar el tablero? Se perderán todas las tarjetas.")) return;
  const invId = STATE.currentKanbanInvento;
  if (!invId) return;
  delete STATE.kanbanData[invId];
  cambiarInventoKanban(invId);
  showToast("🔄 Tablero reiniciado", "info");
}

/* ====================================================
   25. RED DE MENTES
   ==================================================== */

function renderRedMentes() {
  renderFeed();
  renderMapaMentes();
}

function renderFeed() {
  const feed    = document.getElementById("feed");
  if (!feed) return;

  // Combinar posts del demo con los del usuario
  const allPosts = [...DEMO_POSTS, ...STATE.feedPosts].filter(p =>
    STATE.feedFilter === "todos" || p.tipo === STATE.feedFilter
  );

  if (allPosts.length === 0) {
    feed.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted)"><i class="fa-solid fa-rss" style="font-size:28px;display:block;margin-bottom:10px"></i><p>Sin publicaciones en esta categoría.</p></div>`;
    return;
  }

  feed.innerHTML = allPosts.map(p => {
    const tipoLabel = { idea: "💡 IDEA", busco: "🤝 BUSCO CO-INVENTOR", pregunta: "❓ PREGUNTA", logro: "🏆 LOGRO", recurso: "📚 RECURSO" };
    const tipoCls   = { idea: "ft-idea", busco: "ft-busco", pregunta: "ft-preg", logro: "ft-logro", recurso: "ft-recurso" };
    return `
      <div class="feed-card" id="feedcard-${p.id}">
        <div class="fc-head">
          <div class="fc-av">${escapeHtml(p.avatar)}</div>
          <div class="fc-meta">
            <span>${escapeHtml(p.autor)}</span>
            <small>${p.time || relativeTime(p.fecha || new Date().toISOString())}</small>
          </div>
          <span class="fc-tipo ${tipoCls[p.tipo] || "ft-idea"}">${tipoLabel[p.tipo] || "💡 IDEA"}</span>
        </div>
        ${p.tags?.length ? `<div class="fc-tags">${p.tags.map(t => `<span class="fc-tag">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
        <p class="fc-text">${escapeHtml(p.texto)}</p>
        <div class="fc-actions">
          <button class="btn-like ${p.likedByMe ? "liked" : ""}" onclick="likePost('${p.id}')">
            <i class="fa-${p.likedByMe ? "solid" : "regular"} fa-heart"></i> ${p.likes || 0}
          </button>
          <button class="btn-reply" onclick="replyPost('${p.id}')"><i class="fa-solid fa-reply"></i> Responder</button>
        </div>
      </div>
    `;
  }).join("");

  // Live inventors
  const liveEl = document.getElementById("inventors-live");
  if (liveEl) liveEl.textContent = `${Math.floor(8 + Math.random() * 40)} en línea`;
}

function filterFeed(tipo, btn) {
  STATE.feedFilter = tipo;
  document.querySelectorAll(".ff-btn").forEach(b => b.classList.remove("active"));
  btn?.classList.add("active");
  renderFeed();
}

function likePost(postId) {
  const post = [...DEMO_POSTS, ...STATE.feedPosts].find(p => p.id === postId);
  if (!post) return;
  if (!post.likedByMe) {
    post.likes = (post.likes || 0) + 1;
    post.likedByMe = true;
    STATE.votosCount++;
    addXP(5, "❤️ Like dado");
  } else {
    post.likes = Math.max(0, (post.likes || 0) - 1);
    post.likedByMe = false;
  }
  saveState();
  renderFeed();
}

function replyPost(postId) {
  showToast("✏️ Función de respuesta próximamente", "info");
}

function publicarIdea() {
  const texto = document.getElementById("pub-text")?.value.trim();
  const tipo  = document.getElementById("pub-tipo")?.value || "idea";
  const tags  = document.getElementById("pub-tags")?.value.split(" ").filter(t => t.startsWith("#")).slice(0, 3);

  if (!texto) { showToast("⚠ Escribe algo antes de publicar", "error"); return; }
  if (texto.length < 10) { showToast("⚠ La publicación es demasiado corta", "error"); return; }

  const post = {
    id: uid(),
    autor:  STATE.currentUser?.name.split(" ")[0].toUpperCase() || "INVENTOR",
    avatar: (STATE.currentUser?.name?.[0] || "I").toUpperCase(),
    tipo,
    texto,
    tags:  tags.length ? tags : [],
    likes: 0,
    likedByMe: false,
    fecha: new Date().toISOString(),
    time:  "hace un momento",
  };

  STATE.feedPosts.unshift(post);
  STATE.publicaciones++;
  addXP(60, "📡 Publicación en la red");
  addActivity("publicar", `Publicaste una idea en la Red de Mentes`, 60);
  triggerAchievement("publicador");
  saveState();

  document.getElementById("pub-text").value = "";
  document.getElementById("pub-char").textContent = "0";
  renderFeed();
  showToast("📡 Idea publicada en la Red de Mentes", "success");
}

function renderMapaMentes() {
  const canvas = document.getElementById("world-map");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width = 600, H = canvas.height = 300;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(0, 0, W, H);

  // Puntos de inventores simulados
  const points = [
    { x: 0.22, y: 0.42, label: "MX" }, { x: 0.25, y: 0.52, label: "MX" },
    { x: 0.28, y: 0.38, label: "US" }, { x: 0.38, y: 0.35, label: "US" },
    { x: 0.52, y: 0.28, label: "ES" }, { x: 0.55, y: 0.30, label: "ES" },
    { x: 0.60, y: 0.45, label: "BR" }, { x: 0.65, y: 0.60, label: "AR" },
    { x: 0.72, y: 0.35, label: "IN" }, { x: 0.80, y: 0.40, label: "CN" },
  ];

  points.forEach(p => {
    const x = p.x * W, y = p.y * H;
    // Pulso
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,229,255,0.08)";
    ctx.fill();
    // Punto
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#00e5ff";
    ctx.shadowColor = "#00e5ff";
    ctx.shadowBlur  = 8;
    ctx.fill();
    ctx.shadowBlur  = 0;
    // Label
    ctx.font = "9px JetBrains Mono, monospace";
    ctx.fillStyle = "rgba(0,229,255,0.6)";
    ctx.fillText(p.label, x + 5, y - 5);
  });

  const statsEl = document.getElementById("map-stats");
  if (statsEl) {
    statsEl.innerHTML = `
      <span class="map-stat-chip">🌎 ${points.length + Math.floor(Math.random() * 20)} inventores activos</span>
      <span class="map-stat-chip">🌍 ${Math.floor(12 + Math.random() * 8)} países</span>
    `;
  }
}

/* ====================================================
   26. ADOPTAR
   ==================================================== */

function renderAdoptar() {
  const grid = document.getElementById("adoptar-grid");
  const countEl = document.getElementById("adoptar-count");
  if (!grid) return;

  let items = [...DEMO_INVENTOS_ADOPTAR];
  if (STATE.adoptatFilter !== "todos") {
    items = items.filter(i => i.catKey === STATE.adoptatFilter);
  }

  // Ordenar
  const sort = document.getElementById("adoptar-sort")?.value || "votos";
  if (sort === "votos")   items.sort((a, b) => b.votos - a.votos);
  if (sort === "reciente") items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  if (sort === "nombre")  items.sort((a, b) => a.nombre.localeCompare(b.nombre));

  if (countEl) countEl.textContent = `${items.length} inventos`;

  const catCls = { ambiente: "cat-a", energia: "cat-en", salud: "cat-s", educacion: "cat-e", tecnologia: "cat-t", alimentacion: "cat-al" };

  grid.innerHTML = items.map(inv => `
    <div class="adopt-card" role="listitem">
      <div class="ac-top">
        <span class="ac-emoji">${inv.emoji}</span>
        <button class="ac-votes" onclick="votarAdoptar('${inv.id}',this)">
          <i class="fa-solid fa-arrow-up"></i> ${inv.votos}
        </button>
      </div>
      <span class="ac-cat ${catCls[inv.catKey] || "cat-t"}">${escapeHtml(inv.categoria.toUpperCase())}</span>
      <h4>${escapeHtml(inv.nombre)}</h4>
      <p>${escapeHtml(inv.desc)}</p>
      <div class="ac-meta">Por <strong>${escapeHtml(inv.inventor)}</strong> · ${new Date(inv.fecha).toLocaleDateString("es-MX")}</div>
      <button class="btn-adopt" onclick="openAdoptModal('${inv.id}')">
        <i class="fa-solid fa-handshake"></i> CONTACTAR INVENTOR
      </button>
    </div>
  `).join("");
}

function filterAdoptar(cat, btn) {
  STATE.adoptatFilter = cat;
  document.querySelectorAll(".fbtn").forEach(b => b.classList.remove("active"));
  btn?.classList.add("active");
  renderAdoptar();
}

function sortAdoptar(val) {
  renderAdoptar();
}

function votarAdoptar(invId, btn) {
  const inv = DEMO_INVENTOS_ADOPTAR.find(i => i.id === invId);
  if (!inv) return;
  inv.votos++;
  STATE.votosCount++;
  addXP(5, "⬆️ Voto dado");
  saveState();
  btn.innerHTML = `<i class="fa-solid fa-arrow-up"></i> ${inv.votos}`;
  btn.style.background = "rgba(0,229,255,0.2)";
}

function openAdoptModal(invId) {
  const inv = DEMO_INVENTOS_ADOPTAR.find(i => i.id === invId);
  if (!inv) return;

  const content = document.getElementById("modal-adopt-content");
  if (!content) return;

  content.innerHTML = `
    <div class="adopt-form">
      <h3><i class="fa-solid fa-handshake"></i> CONTACTAR AL INVENTOR</h3>
      <p>Estás interesado en adoptar / colaborar con <strong>${escapeHtml(inv.nombre)}</strong></p>
      <div class="hud-field">
        <label>TU NOMBRE O EMPRESA</label>
        <input type="text" id="adopt-nombre" placeholder="Tu nombre o razón social..." />
        <div class="fc tl"></div><div class="fc tr"></div><div class="fc bl"></div><div class="fc br"></div>
      </div>
      <div class="hud-field">
        <label>CORREO DE CONTACTO</label>
        <input type="email" id="adopt-email" placeholder="tu@empresa.com" />
        <div class="fc tl"></div><div class="fc tr"></div><div class="fc bl"></div><div class="fc br"></div>
      </div>
      <div class="hud-field">
        <label>PROPUESTA</label>
        <textarea id="adopt-propuesta" rows="4" placeholder="Describe brevemente tu propuesta de colaboración, financiamiento o adopción..."></textarea>
        <div class="fc tl"></div><div class="fc tr"></div><div class="fc bl"></div><div class="fc br"></div>
      </div>
      <button class="btn-hud btn-full btn-glow-cyan" onclick="enviarSolicitudAdopcion('${inv.id}')"><span class="btn-bg"></span><i class="fa-solid fa-paper-plane"></i> ENVIAR SOLICITUD</button>
    </div>
  `;
  openModal("modal-adopt");
}

function enviarSolicitudAdopcion(invId) {
  const nombre   = document.getElementById("adopt-nombre")?.value.trim();
  const email    = document.getElementById("adopt-email")?.value.trim();
  const propuesta = document.getElementById("adopt-propuesta")?.value.trim();

  if (!nombre || !email || !propuesta) {
    showToast("⚠ Completa todos los campos", "error"); return;
  }

  closeModal("modal-adopt");
  showToast("✅ Solicitud enviada al inventor", "success");
  addXP(30, "🤝 Solicitud de adopción");
  saveState();
}

/* ====================================================
   27. DASHBOARD
   ==================================================== */

function renderDashboard() {
  // Saludo
  const user  = STATE.currentUser;
  const hour  = new Date().getHours();
  const greet = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  setEl("dg-title", `${greet}, ${user?.name?.split(" ")[0] || "Inventor"}`);
  setEl("dg-sub",   "Aquí está tu resumen de actividad de hoy");

  // Fecha y streak
  const dateEl = document.getElementById("dg-date");
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  setEl("dg-streak", STATE.streak);

  // Avatares
  const avatarLetter = (user?.name?.[0] || "?").toUpperCase();
  const bgClass = `linear-gradient(135deg, var(--cyan), var(--purple))`;
  ["sidebar-avatar", "header-avatar", "dash-avatar", "perfil-avatar"].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = avatarLetter; el.style.background = bgClass; }
  });

  // Nombres en sidebar
  setEl("sidebar-name",    user?.name?.toUpperCase() || "INVENTOR");
  setEl("sidebar-specialty", user?.spec?.toUpperCase() || "EN LÍNEA");

  // Stats
  setEl("stat-inventos",   STATE.inventosGenerados);
  setEl("stat-guardados",  STATE.laboratorio.length);
  setEl("stat-publicados", STATE.publicaciones);
  setEl("stat-xp",         STATE.xp);
  setEl("stat-logros",     STATE.achievements.length);
  setEl("stat-guias",      STATE.guiasGeneradas);

  // XP / Level
  updateXPBars();

  // Feed de actividad
  renderActivityFeed();

  // Logros showcase
  renderAchievementsShowcase();

  // Gráfica de categorías
  renderCategoryChart();

  // Top inventos
  renderTopInventions();

  // Goals
  renderGoals();

  // Fecha dashboard
  setEl("dg-date", new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
}

function updateXPBars() {
  const currentLevelData = LEVELS.filter(l => STATE.xp >= l.minXp).pop() || LEVELS[0];
  const nextLevelData    = LEVELS.find(l => l.minXp > STATE.xp) || LEVELS[LEVELS.length - 1];

  STATE.level = currentLevelData.level;

  const xpInLevel    = STATE.xp - currentLevelData.minXp;
  const xpForNext    = nextLevelData.minXp - currentLevelData.minXp;
  const pct          = xpForNext > 0 ? Math.min(100, (xpInLevel / xpForNext) * 100) : 100;

  const levelTitle   = currentLevelData.title;
  const levelNum     = `Nivel ${currentLevelData.level}`;

  // Sidebar XP
  setEl("sb-level-badge", `Nv.${currentLevelData.level}`);
  setEl("sb-level-name",  levelTitle);
  setEl("sb-xp-text",     `${STATE.xp} XP`);
  const sbFill = document.getElementById("sb-xp-fill");
  if (sbFill) sbFill.style.width = `${pct}%`;

  // Dashboard XP
  setEl("dxp-level", `NIVEL ${currentLevelData.level}`);
  setEl("dxp-name",  levelTitle);
  setEl("dxp-current", `${STATE.xp} XP`);
  setEl("dxp-next",   `/ ${nextLevelData.minXp} XP para siguiente nivel`);
  const dxpFill = document.getElementById("dxp-fill");
  if (dxpFill) dxpFill.style.width = `${pct}%`;
  setEl("dxp-total", STATE.xp);

  // Perfil
  setEl("perfil-xp-amount", `${STATE.xp} XP`);
  setEl("perfil-xp-next",   `${Math.max(0, nextLevelData.minXp - STATE.xp)} XP para siguiente nivel`);
  const pfFill = document.getElementById("perfil-xp-fill");
  if (pfFill) pfFill.style.width = `${pct}%`;
  setEl("dxp-level", levelTitle);
  setEl("dxp-name",  levelNum);
}

function renderActivityFeed() {
  const el = document.getElementById("activity-feed");
  if (!el) return;

  const items = STATE.activity.slice(-12).reverse();
  if (items.length === 0) {
    el.innerHTML = `<div class="activity-empty"><i class="fa-solid fa-satellite-dish"></i><p>Sin actividad aún. ¡Genera tu primer invento!</p></div>`;
    return;
  }

  const iconMap = { invento: "fa-lightbulb cyan", lab: "fa-flask purple", guia: "fa-list-ol purple", mercado: "fa-chart-bar cyan", pitch: "fa-presentation-screen purple", publicar: "fa-rss orange", kanban: "fa-table-columns green", logro: "fa-trophy gold" };

  el.innerHTML = items.map(a => {
    const [icon, color] = (iconMap[a.tipo] || "fa-star cyan").split(" ");
    return `
      <div class="activity-item">
        <div class="ai-icon ${color}"><i class="fa-solid ${icon}"></i></div>
        <div class="ai-text">
          <span class="ai-main">${a.texto}</span>
          <span class="ai-time">${relativeTime(a.fecha)}</span>
        </div>
        ${a.xp ? `<span style="font-family:var(--font-m);font-size:10px;color:var(--gold);flex-shrink:0">+${a.xp}xp</span>` : ""}
      </div>
    `;
  }).join("");
}

function renderAchievementsShowcase() {
  const el = document.getElementById("achievements-showcase");
  if (!el) return;

  const shown = ACHIEVEMENTS_DATA.slice(0, 12);
  el.innerHTML = shown.map(a => {
    const unlocked = STATE.achievements.includes(a.id);
    return `
      <div class="ach-mini ${unlocked ? "unlocked" : "locked"}" title="${a.name}">
        ${a.icon}
        <div class="ach-mini-tooltip">${escapeHtml(a.name)}</div>
      </div>
    `;
  }).join("");
}

function renderCategoryChart() {
  const canvas = document.getElementById("category-canvas");
  const legend = document.getElementById("category-legend");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;

  // Contar por categoría
  const counts = {};
  STATE.laboratorio.forEach(inv => {
    counts[inv.categoria] = (counts[inv.categoria] || 0) + 1;
  });

  if (Object.keys(counts).length === 0) {
    ctx.clearRect(0, 0, W, H);
    ctx.font = "11px JetBrains Mono, monospace";
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.textAlign = "center";
    ctx.fillText("Sin datos aún", W / 2, H / 2);
    return;
  }

  const colors = ["#00e5ff", "#7c4dff", "#ff6d00", "#00e676", "#f50057", "#ffd600", "#2196f3", "#ff8f00"];
  const entries = Object.entries(counts);
  const total   = entries.reduce((s, [, v]) => s + v, 0);

  // Donut chart
  ctx.clearRect(0, 0, W, H);
  let startAngle = -Math.PI / 2;
  const cx = 90, cy = H / 2, r = 70, inner = 42;

  entries.forEach(([cat, count], i) => {
    const slice = (count / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    startAngle += slice;
  });

  // Agujero interior
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fillStyle = "var(--bg-card, #07111f)";
  ctx.fill();

  // Texto central
  ctx.font = `bold 14px Orbitron, monospace`;
  ctx.fillStyle = "#00e5ff";
  ctx.textAlign = "center";
  ctx.fillText(total, cx, cy + 5);

  // Leyenda
  if (legend) {
    legend.innerHTML = entries.map(([cat, count], i) => `
      <div class="cl-item">
        <div class="cl-dot" style="background:${colors[i % colors.length]}"></div>
        <span style="font-size:10px;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(cat.split(" ")[0])}</span>
        <span class="cl-pct">${Math.round((count / total) * 100)}%</span>
      </div>
    `).join("");
  }
}

function renderTopInventions() {
  const el = document.getElementById("top-inventions-list");
  if (!el) return;

  const items = [...STATE.laboratorio]
    .sort((a, b) => b.impactoScore - a.impactoScore)
    .slice(0, 5);

  if (items.length === 0) {
    el.innerHTML = `<div class="ti-empty"><i class="fa-solid fa-flask"></i><p>Guarda inventos en tu laboratorio para verlos aquí</p></div>`;
    return;
  }

  const rankClass = ["gold", "silver", "bronze"];
  el.innerHTML = items.map((inv, i) => `
    <div class="ti-item" onclick="openInventoDetail('${inv.id}')">
      <div class="ti-rank ${rankClass[i] || ""}">#${i + 1}</div>
      <span class="ti-emoji">${inv.emoji}</span>
      <div class="ti-info">
        <span class="ti-name">${escapeHtml(inv.nombre)}</span>
        <span class="ti-cat">${escapeHtml(inv.categoria)}</span>
      </div>
      <span class="ti-score">${inv.impactoScore}/100</span>
    </div>
  `).join("");
}

/* ====================================================
   28. GOALS (OBJETIVOS)
   ==================================================== */

function renderGoals() {
  const el = document.getElementById("goals-list");
  if (!el) return;

  if (STATE.goals.length === 0) {
    el.innerHTML = `<div class="goals-empty"><i class="fa-solid fa-bullseye"></i><p>Sin objetivos. ¡Agrega uno para motivarte!</p></div>`;
    return;
  }

  el.innerHTML = STATE.goals.map(g => {
    const isOverdue = g.deadline && new Date(g.deadline) < new Date() && !g.done;
    return `
      <div class="goal-item ${g.done ? "done" : ""}">
        <div class="goal-check ${g.done ? "checked" : ""}" onclick="toggleGoal('${g.id}')">
          ${g.done ? "<i class='fa-solid fa-check'></i>" : ""}
        </div>
        <div class="goal-info">
          <span class="goal-text">${escapeHtml(g.texto)}</span>
          ${g.deadline ? `<span class="goal-deadline ${isOverdue ? "overdue" : ""}"><i class="fa-regular fa-calendar"></i> ${new Date(g.deadline).toLocaleDateString("es-MX")}</span>` : ""}
        </div>
        <button class="goal-del" onclick="deleteGoal('${g.id}')"><i class="fa-solid fa-xmark"></i></button>
      </div>
    `;
  }).join("");
}

function openGoalsModal() {
  document.getElementById("goal-text").value    = "";
  document.getElementById("goal-deadline").value = "";
  openModal("modal-goals");
}

function addGoal() {
  const texto    = document.getElementById("goal-text")?.value.trim();
  const deadline = document.getElementById("goal-deadline")?.value;
  const category = document.getElementById("goal-category")?.value || "invento";

  if (!texto) { showToast("⚠ Escribe un objetivo", "error"); return; }

  STATE.goals.push({ id: uid(), texto, deadline, category, done: false, created: new Date().toISOString() });
  saveState();
  renderGoals();
  closeModal("modal-goals");
  showToast("🎯 Objetivo agregado", "success");
}

function toggleGoal(id) {
  const goal = STATE.goals.find(g => g.id === id);
  if (!goal) return;
  goal.done = !goal.done;
  if (goal.done) addXP(25, "🎯 Objetivo completado");
  saveState();
  renderGoals();
}

function deleteGoal(id) {
  STATE.goals = STATE.goals.filter(g => g.id !== id);
  saveState();
  renderGoals();
}

/* ====================================================
   29. PERFIL
   ==================================================== */

function renderPerfilHeader() {
  updateXPBars();
  const user = STATE.currentUser;
  if (!user) return;

  const avatarLetter = (user.name?.[0] || "I").toUpperCase();
  setEl("perfil-avatar", avatarLetter);
  setEl("perfil-name",   user.name?.toUpperCase() || "INVENTOR");

  const currentLevelData = LEVELS.filter(l => STATE.xp >= l.minXp).pop() || LEVELS[0];
  setEl("perfil-level-badge",  `Nivel ${currentLevelData.level}`);
  setEl("perfil-level-title",  currentLevelData.title);
  setEl("perfil-specialty",    getSpecialtyLabel(user.spec || "tecnologia"));
  setEl("perfil-joined",       `Miembro desde ${new Date(user.created || Date.now()).toLocaleDateString("es-MX", { year: "numeric", month: "long" })}`);
}

function getSpecialtyLabel(spec) {
  const labels = { tecnologia: "💻 Tecnología & Software", ingenieria: "⚙️ Ingeniería & Hardware", ambiente: "🌱 Medio Ambiente", salud: "🏥 Salud & Medicina", educacion: "📚 Educación", social: "🤝 Impacto Social", energia: "⚡ Energía Limpia", otro: "🔮 Otro" };
  return labels[spec] || spec;
}

function switchPerfilTab(tab, btn) {
  document.querySelectorAll(".ptab").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".ptab-content").forEach(c => c.classList.remove("active"));
  btn?.classList.add("active");
  document.getElementById(`ptab-${tab}`)?.classList.add("active");

  if (tab === "estadisticas")  renderEstadisticas();
  if (tab === "logros")        renderLogros();
  if (tab === "portafolio")    renderPortafolio();
  if (tab === "historial")     renderHistorial();
  if (tab === "configuracion") loadConfigForm();
}

function renderEstadisticas() {
  setEl("ps-inventos",     STATE.inventosGenerados);
  setEl("ps-guardados",    STATE.laboratorio.length);
  setEl("ps-guias",        STATE.guiasGeneradas);
  setEl("ps-publicaciones",STATE.publicaciones);
  setEl("ps-votos",        STATE.votosCount);
  setEl("ps-sesiones",     STATE.sessions);
  setEl("ps-streak",       STATE.streak);
  const currentLevelData = LEVELS.filter(l => STATE.xp >= l.minXp).pop() || LEVELS[0];
  setEl("ps-nivel",        currentLevelData.level);

  renderActivityCalendar();
  renderCatDistBars();
}

function renderActivityCalendar() {
  const cal = document.getElementById("activity-calendar");
  if (!cal) return;

  // Simular datos de actividad de los últimos 52 semanas
  const weeks = 20;
  const today = new Date();
  let html = "";

  for (let w = weeks - 1; w >= 0; w--) {
    html += '<div class="ac-week">';
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (w * 7 + d));
      const activity = Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0;
      const level = ["level-0", "level-1", "level-2", "level-3", "level-4"][activity];
      html += `<div class="ac-cell ${level}" title="${date.toLocaleDateString("es-MX")}: ${activity} acciones"></div>`;
    }
    html += "</div>";
  }
  cal.innerHTML = html;
}

function renderCatDistBars() {
  const el = document.getElementById("cat-dist-bars");
  if (!el) return;

  const counts = {};
  STATE.laboratorio.forEach(inv => { counts[inv.categoria] = (counts[inv.categoria] || 0) + 1; });
  const total = STATE.laboratorio.length || 1;
  const colors = ["#00e5ff", "#7c4dff", "#ff6d00", "#00e676", "#f50057", "#ffd600", "#2196f3"];
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 7);

  if (entries.length === 0) {
    el.innerHTML = `<p style="color:var(--text-muted);font-size:12px">Guarda inventos para ver la distribución por categoría.</p>`;
    return;
  }

  el.innerHTML = entries.map(([cat, count], i) => `
    <div class="cdb-item">
      <div class="cdb-label">${escapeHtml(cat.split(" ")[0])}</div>
      <div class="cdb-bar-wrap">
        <div class="cdb-bar" style="width:${(count / total) * 100}%;background:${colors[i % colors.length]}"></div>
      </div>
      <span class="cdb-pct">${Math.round((count / total) * 100)}%</span>
      <span class="cdb-count">(${count})</span>
    </div>
  `).join("");
}

function renderLogros() {
  const grid    = document.getElementById("logros-grid");
  const unlock  = document.getElementById("logros-unlocked");
  const total   = document.getElementById("logros-total");
  if (!grid) return;

  const unlockedCount = STATE.achievements.length;
  if (unlock) unlock.textContent = unlockedCount;
  if (total)  total.textContent  = ACHIEVEMENTS_DATA.length;

  const filter = document.querySelector(".lf-btn.active")?.textContent.trim().toLowerCase() || "todos";
  let items    = ACHIEVEMENTS_DATA;

  if (filter.includes("desbloqueados")) items = items.filter(a => STATE.achievements.includes(a.id));
  if (filter.includes("pendientes"))    items = items.filter(a => !STATE.achievements.includes(a.id));

  grid.innerHTML = items.map(a => {
    const unlocked  = STATE.achievements.includes(a.id);
    return `
      <div class="logro-card ${unlocked ? "unlocked" : "locked"}">
        <div class="logro-icon ${unlocked ? "" : "locked"}">${a.icon}</div>
        <div class="logro-info">
          <div class="logro-name">${escapeHtml(a.name)}</div>
          <div class="logro-desc">${escapeHtml(a.desc)}</div>
          <div class="logro-xp"><i class="fa-solid fa-star"></i> +${a.xp} XP</div>
          ${!unlocked ? `<div class="logro-locked-hint">🔒 Sin desbloquear</div>` : ""}
        </div>
      </div>
    `;
  }).join("");
}

function filterLogros(tipo, btn) {
  document.querySelectorAll(".lf-btn").forEach(b => b.classList.remove("active"));
  btn?.classList.add("active");
  renderLogros();
}

function renderPortafolio() {
  const grid = document.getElementById("portafolio-grid");
  if (!grid) return;

  if (STATE.laboratorio.length === 0) {
    grid.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);grid-column:1/-1"><i class="fa-solid fa-briefcase" style="font-size:32px;display:block;margin-bottom:10px"></i><p>Tu portafolio está vacío. Guarda inventos en el laboratorio.</p></div>`;
    return;
  }

  grid.innerHTML = STATE.laboratorio.map(inv => `
    <div class="port-card" onclick="openInventoDetail('${inv.id}')">
      <div class="port-emoji">${inv.emoji}</div>
      <div class="port-name">${escapeHtml(inv.nombre)}</div>
      <div class="port-cat">${escapeHtml(inv.categoria)}</div>
      <div class="port-desc">${escapeHtml(inv.descripcion.slice(0, 100))}...</div>
      <div class="port-meta">
        <span class="port-date">${new Date(inv.fecha).toLocaleDateString("es-MX")}</span>
        <span class="port-nivel" style="background:rgba(0,229,255,0.07);color:var(--cyan);font-size:10px;font-family:var(--font-m);padding:2px 8px;border-radius:3px">${escapeHtml(inv.dificultad)}</span>
      </div>
    </div>
  `).join("");
}

function renderHistorial() {
  const el = document.getElementById("historial-list");
  if (!el) return;

  const items = STATE.activity.slice(-30).reverse();
  if (items.length === 0) {
    el.innerHTML = `<div class="historial-empty"><i class="fa-solid fa-clock-rotate-left"></i><p>Sin actividad registrada aún</p></div>`;
    return;
  }

  const iconMap = { invento: ["fa-lightbulb", "cyan"], lab: ["fa-flask", "purple"], guia: ["fa-list-ol", "purple"], mercado: ["fa-chart-bar", "cyan"], pitch: ["fa-presentation-screen", "purple"], publicar: ["fa-rss", "orange"], kanban: ["fa-table-columns", "green"], logro: ["fa-trophy", "gold"] };

  el.innerHTML = items.map(a => {
    const [icon, color] = iconMap[a.tipo] || ["fa-star", "cyan"];
    return `
      <div class="hist-item">
        <div class="hist-icon ${color}"><i class="fa-solid ${icon}"></i></div>
        <div class="hist-info">
          <span class="hist-action">${a.texto}</span>
          <span class="hist-time">${relativeTime(a.fecha)}</span>
        </div>
        ${a.xp ? `<span class="hist-xp"><i class="fa-solid fa-star"></i> +${a.xp}</span>` : ""}
      </div>
    `;
  }).join("");
}

/* ====================================================
   30. CONFIGURACIÓN DEL PERFIL
   ==================================================== */

function loadConfigForm() {
  const user = STATE.currentUser;
  if (!user) return;
  const nameEl = document.getElementById("config-name");
  const specEl = document.getElementById("config-specialty");
  if (nameEl) nameEl.value = user.name || "";
  if (specEl) specEl.value = user.spec || "tecnologia";

  // Preferencias
  Object.entries({
    "pref-animations": STATE.preferences.animations,
    "pref-sounds":     STATE.preferences.sounds,
    "pref-achievements": STATE.preferences.achievementNotifs,
    "pref-autosave":   STATE.preferences.autosave,
    "pref-sidebar":    STATE.preferences.sidebarOpen,
  }).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.checked = val;
  });
}

function updateProfile() {
  const name = document.getElementById("config-name")?.value.trim();
  const spec = document.getElementById("config-specialty")?.value;
  if (!name) { showToast("⚠ Ingresa un nombre válido", "error"); return; }

  if (STATE.currentUser) {
    STATE.currentUser.name = name;
    STATE.currentUser.spec = spec;
    localStorage.setItem(`evoinvent_user_${STATE.currentUser.email}`, JSON.stringify({
      user: STATE.currentUser,
      pass: JSON.parse(localStorage.getItem(`evoinvent_user_${STATE.currentUser.email}`) || "{}")?.pass || "",
    }));
  }

  saveState();
  renderSidebarUser();
  renderDashboard();
  showToast("✅ Perfil actualizado", "success");
}

function savePref(key, value) {
  STATE.preferences[key] = value;
  saveState();
  if (key === "animations" || key === "particles") {
    STATE.preferences.particles = value;
  }
}

function renderSidebarUser() {
  const user = STATE.currentUser;
  if (!user) return;
  setEl("sidebar-name",    user.name?.toUpperCase() || "INVENTOR");
  setEl("sidebar-specialty", getSpecialtyLabel(user.spec).split(" ").slice(1).join(" ") || "EN LÍNEA");
  const avatar = document.getElementById("sidebar-avatar");
  if (avatar) avatar.textContent = (user.name?.[0] || "I").toUpperCase();
}

/* ====================================================
   31. SISTEMA XP Y LOGROS
   ==================================================== */

/**
 * Agrega XP al usuario y verifica level up
 */
function addXP(amount, reason = "") {
  const prevLevel = (LEVELS.filter(l => STATE.xp >= l.minXp).pop() || LEVELS[0]).level;
  STATE.xp += amount;

  const newLevelData = LEVELS.filter(l => STATE.xp >= l.minXp).pop() || LEVELS[0];
  if (newLevelData.level > prevLevel) {
    // ¡Level up!
    showLevelUp(newLevelData);
    addNotification(`⬆️ ¡Subiste al nivel ${newLevelData.level}: ${newLevelData.title}!`, "achievement");
    triggerAchievement(`nivel_${newLevelData.level}`);
  }

  updateXPBars();
  addNotification(`⭐ +${amount} XP — ${reason}`, "xp");
  saveState();
}

function showLevelUp(levelData) {
  const anim   = document.getElementById("level-up-anim");
  const lvlEl  = document.getElementById("lua-level");
  const titleEl = document.getElementById("lua-title");
  if (!anim) return;
  if (lvlEl)  lvlEl.textContent  = `NIVEL ${levelData.level}`;
  if (titleEl) titleEl.textContent = levelData.title;
  anim.classList.remove("hidden");
  setTimeout(() => { anim.classList.add("hidden"); }, 3500);
}

/**
 * Agrega una actividad al historial
 */
function addActivity(tipo, texto, xp = 0) {
  STATE.activity.push({ id: uid(), tipo, texto, xp, fecha: new Date().toISOString() });
  if (STATE.activity.length > 100) STATE.activity = STATE.activity.slice(-100);
}

/**
 * Verifica todos los logros disponibles
 */
function checkAllAchievements() {
  ACHIEVEMENTS_DATA.forEach(a => {
    if (!STATE.achievements.includes(a.id) && a.condition()) {
      triggerAchievement(a.id);
    }
  });
}

/**
 * Dispara un logro específico
 */
function triggerAchievement(id) {
  if (STATE.achievements.includes(id)) return;
  const ach = ACHIEVEMENTS_DATA.find(a => a.id === id);
  if (!ach) return;

  STATE.achievements.push(id);
  if (ach.xp > 0) {
    STATE.xp += ach.xp;
    updateXPBars();
  }
  saveState();

  if (STATE.preferences.achievementNotifs !== false) {
    showAchievementModal(ach);
  }

  addActivity("logro", `Desbloqueaste el logro: <strong>${escapeHtml(ach.name)}</strong>`, ach.xp);
  addNotification(`🏆 Logro desbloqueado: ${ach.name}`, "achievement");

  // Actualizar nav badge
  setEl("stat-logros", STATE.achievements.length);
}

function showAchievementModal(ach) {
  setEl("au-icon",  ach.icon);
  setEl("au-title", ach.name);
  setEl("au-desc",  ach.desc);
  setEl("au-xp",    `+${ach.xp} XP`);
  openModal("modal-achievement");
  setTimeout(() => closeModal("modal-achievement"), 4500);
}

/* ====================================================
   32. RACHA DIARIA
   ==================================================== */

function updateStreak() {
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (STATE.lastActivityDate === today) return;
  if (STATE.lastActivityDate === yesterday) {
    STATE.streak++;
  } else if (!STATE.lastActivityDate) {
    STATE.streak = 1;
  } else {
    STATE.streak = 1; // Racha rota
  }
  STATE.lastActivityDate = today;
}

/* ====================================================
   33. NOTIFICACIONES
   ==================================================== */

function addNotification(text, type = "info") {
  STATE.notifications.unshift({
    id:     uid(),
    text,
    type,
    time:   new Date().toISOString(),
    read:   false,
  });
  if (STATE.notifications.length > 50) STATE.notifications = STATE.notifications.slice(0, 50);

  STATE.unreadNotifications++;
  const badge = document.getElementById("notif-badge");
  if (badge) {
    badge.textContent = STATE.unreadNotifications;
    badge.classList.toggle("hidden", STATE.unreadNotifications === 0);
  }
  updateNavBadge("nav-badge-dashboard", STATE.unreadNotifications > 0 ? STATE.unreadNotifications : "");
}

function openNotifications() {
  const panel = document.getElementById("notification-panel");
  if (!panel) return;
  panel.classList.toggle("hidden");
  if (!panel.classList.contains("hidden")) renderNotificationPanel();
}

function closeNotifications() {
  document.getElementById("notification-panel")?.classList.add("hidden");
}

function renderNotificationPanel() {
  const list = document.getElementById("np-list");
  if (!list) return;

  if (STATE.notifications.length === 0) {
    list.innerHTML = `<div class="np-empty"><i class="fa-solid fa-bell-slash"></i><p>Sin notificaciones</p></div>`;
    return;
  }

  const iconMap = { xp: "⭐", achievement: "🏆", system: "⚡", info: "ℹ️" };
  list.innerHTML = STATE.notifications.slice(0, 20).map(n => `
    <div class="np-item ${n.read ? "" : "unread"}">
      <div class="np-icon">${iconMap[n.type] || "📢"}</div>
      <div class="np-text">
        <span class="np-main">${escapeHtml(n.text)}</span>
        <span class="np-time">${relativeTime(n.time)}</span>
      </div>
    </div>
  `).join("");

  markAllRead();
}

function markAllRead() {
  STATE.notifications.forEach(n => { n.read = true; });
  STATE.unreadNotifications = 0;
  const badge = document.getElementById("notif-badge");
  if (badge) badge.classList.add("hidden");
  saveState();
}

function clearAllNotifications() {
  STATE.notifications = [];
  STATE.unreadNotifications = 0;
  const badge = document.getElementById("notif-badge");
  if (badge) badge.classList.add("hidden");
  saveState();
  renderNotificationPanel();
}

/* ====================================================
   34. PREFERENCIAS Y CONFIGURACIÓN GENERAL
   ==================================================== */

function loadPreferences() {
  const prefs = STATE.preferences;
  // Aplicar preferencias guardadas
  toggleParticles(prefs.particles !== false);
  toggleGrid(prefs.grid !== false);
  toggleScanlines(prefs.scanlines !== false);
  if (prefs.accent && prefs.accent !== "cyan") {
    setAccentColorValue(prefs.accent);
  }
}

function toggleParticles(enabled) {
  STATE.preferences.particles = enabled;
  const canvas = document.getElementById("hud-canvas");
  if (canvas) canvas.style.opacity = enabled ? "1" : "0";
}

function toggleGrid(enabled) {
  const grid = document.querySelector(".hex-grid");
  if (grid) grid.style.opacity = enabled ? "1" : "0";
}

function toggleScanlines(enabled) {
  const sl = document.querySelector(".scanlines");
  if (sl) sl.style.opacity = enabled ? "0.5" : "0";
}

function setAccentColor(color, btn) {
  document.querySelectorAll(".cp-color").forEach(b => b.classList.remove("active"));
  btn?.classList.add("active");
  setAccentColorValue(color);
  STATE.preferences.accent = color;
  saveState();
}

function setAccentColorValue(color) {
  const colors = STATE.accentColors;
  const hex    = colors[color] || colors.cyan;
  document.documentElement.style.setProperty("--cyan", hex);
  document.documentElement.style.setProperty("--cyan-glow", `${hex}55`);
}

function updateCreativityLabel(val) {
  const el = document.getElementById("creativity-label");
  if (el) el.textContent = val;
  STATE.preferences.creativity = parseInt(val);
}

function openSettings() {
  openModal("modal-settings");
}

function saveSettings() {
  STATE.preferences.animations    = document.getElementById("s-particles")?.checked ?? true;
  STATE.preferences.autosave      = document.getElementById("s-autosave")?.checked  ?? false;
  STATE.preferences.expertMode    = document.getElementById("s-expert")?.checked    ?? false;
  STATE.preferences.particles     = document.getElementById("s-particles")?.checked ?? true;
  STATE.preferences.grid          = document.getElementById("s-grid")?.checked      ?? true;
  STATE.preferences.scanlines     = document.getElementById("s-scanlines")?.checked ?? true;
  STATE.preferences.lang          = document.getElementById("lang-select")?.value    || "es";
  STATE.preferences.currency      = document.getElementById("currency-select")?.value || "MXN";
  saveState();
  loadPreferences();
  closeModal("modal-settings");
  showToast("✅ Configuración guardada", "success");
}

function resetSettings() {
  if (!confirm("¿Restaurar configuración por defecto?")) return;
  STATE.preferences = {
    animations: true, sounds: false, achievementNotifs: true, autosave: false,
    sidebarOpen: true, creativity: 7, expertMode: false, particles: true,
    grid: true, scanlines: true, reduced: false, accent: "cyan", lang: "es", currency: "MXN",
  };
  saveState();
  loadPreferences();
  closeModal("modal-settings");
  showToast("🔄 Configuración restaurada", "info");
}

function switchSettingsTab(tab, btn) {
  document.querySelectorAll(".st-tab").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".settings-tab-content").forEach(c => c.classList.remove("active"));
  btn?.classList.add("active");
  document.getElementById(`stab-${tab}`)?.classList.add("active");
}

/* ====================================================
   35. COMMAND PALETTE
   ==================================================== */

function openCommandPalette() {
  const cp = document.getElementById("command-palette");
  if (!cp) return;
  cp.classList.remove("hidden");
  const input = document.getElementById("cp-input");
  if (input) {
    input.value = "";
    input.focus();
    input.addEventListener("input", filterCommandPalette);
  }
}

function closeCommandPalette() {
  document.getElementById("command-palette")?.classList.add("hidden");
}

function filterCommandPalette() {
  const q       = document.getElementById("cp-input")?.value.toLowerCase() || "";
  const items   = document.querySelectorAll(".cp-item");
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(q) || !q ? "" : "none";
  });
}

function cpAction(section) {
  closeCommandPalette();
  navigate(section, document.querySelector(`[data-section="${section}"]`));
}

/* ====================================================
   36. MODALES GENÉRICOS
   ==================================================== */

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
}

function closeAllModals() {
  document.querySelectorAll(".modal-overlay").forEach(m => m.classList.add("hidden"));
  document.body.style.overflow = "";
}

/* ====================================================
   37. COMPARTIR
   ==================================================== */

function openShareModal() {
  if (!STATE.currentInvento) return;
  openModal("modal-share");
}

function shareToTwitter() {
  const inv  = STATE.currentInvento;
  if (!inv) return;
  const text = encodeURIComponent(`¡Acabo de inventar "${inv.nombre}" usando EvoInvent! 💡⚡ #EvoInvent #Innovacion #MadeInMX`);
  window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  closeModal("modal-share");
}

function shareToWhatsApp() {
  const inv = STATE.currentInvento;
  if (!inv) return;
  const text = encodeURIComponent(`¡Mira el invento que acabo de crear: "${inv.nombre}"! ${inv.descripcion.slice(0, 100)}... Generado con EvoInvent 🚀`);
  window.open(`https://wa.me/?text=${text}`, "_blank");
  closeModal("modal-share");
}

function shareToLinkedIn() {
  window.open("https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(window.location.href), "_blank");
  closeModal("modal-share");
}

function shareToFacebook() {
  window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(window.location.href), "_blank");
  closeModal("modal-share");
}

function copyShareLink() {
  const link = document.getElementById("sm-link");
  if (!link) return;
  navigator.clipboard?.writeText(link.value).then(() => {
    showToast("📋 Enlace copiado", "success");
  }).catch(() => {
    link.select();
    document.execCommand("copy");
    showToast("📋 Enlace copiado", "success");
  });
}

function publicarEnRed() {
  if (!STATE.currentInvento) return;
  const inv = STATE.currentInvento;
  const texto = `Acabo de crear "${inv.nombre}" — ${inv.descripcion.slice(0, 100)}...`;
  if (!STATE.laboratorio.find(l => l.id === inv.id)) guardarInvento(true);

  const post = {
    id:    uid(), autor: STATE.currentUser?.name?.split(" ")[0].toUpperCase() || "INVENTOR",
    avatar: (STATE.currentUser?.name?.[0] || "I").toUpperCase(),
    tipo: "idea", texto, tags: [`#${inv.categoria.replace(/\s/g, "").slice(0, 12)}`],
    likes: 0, likedByMe: false, fecha: new Date().toISOString(), time: "hace un momento",
  };
  STATE.feedPosts.unshift(post);
  STATE.publicaciones++;
  addXP(60, "📡 Invento publicado en la red");
  triggerAchievement("publicador");
  saveState();

  closeModal("modal-share");
  navigate("red-mentes", document.querySelector("[data-section='red-mentes']"));
  showToast("📡 Invento publicado en la Red de Mentes", "success");
}

/* ====================================================
   38. EXPORTAR DATOS
   ==================================================== */

function exportAllData() {
  const data = {
    usuario:    STATE.currentUser,
    laboratorio: STATE.laboratorio,
    kanban:     STATE.kanbanData,
    goals:      STATE.goals,
    activity:   STATE.activity,
    xp:         STATE.xp,
    achievements: STATE.achievements,
    stats: { inventosGenerados: STATE.inventosGenerados, guiasGeneradas: STATE.guiasGeneradas, publicaciones: STATE.publicaciones },
    exportDate: new Date().toISOString(),
    version: CONFIG.VERSION,
  };
  downloadJSON(data, `evoinvent_backup_${new Date().toISOString().slice(0, 10)}.json`);
  showToast("📦 Datos exportados", "success");
}

function importData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.laboratorio) STATE.laboratorio = data.laboratorio;
        if (data.kanban)      STATE.kanbanData  = data.kanban;
        if (data.goals)       STATE.goals       = data.goals;
        if (data.xp)          STATE.xp          = data.xp;
        if (data.achievements) STATE.achievements = data.achievements;
        saveState();
        renderDashboard();
        renderLaboratorio();
        showToast("✅ Datos importados correctamente", "success");
      } catch {
        showToast("❌ Error al leer el archivo", "error");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function confirmClearData() {
  if (!confirm("⚠️ ¿Borrar TODOS los datos? Esta acción es irreversible.")) return;
  if (!confirm("Confirma nuevamente: ¿Borrar todo?")) return;
  STATE.laboratorio = []; STATE.kanbanData = {}; STATE.goals = []; STATE.activity = [];
  STATE.xp = 0; STATE.level = 1; STATE.achievements = []; STATE.inventosGenerados = 0;
  STATE.guiasGeneradas = 0; STATE.publicaciones = 0; STATE.votosCount = 0;
  saveState();
  renderDashboard();
  renderLaboratorio();
  showToast("🗑 Todos los datos borrados", "info");
}

function confirmDeleteAccount() {
  if (!confirm("⚠️ PELIGRO: ¿Eliminar tu cuenta permanentemente? Se borrarán TODOS tus datos.")) return;
  if (!confirm("¿Estás absolutamente seguro? Esta acción no tiene vuelta atrás.")) return;
  const email = STATE.currentUser?.email;
  if (email) localStorage.removeItem(`evoinvent_user_${email}`);
  confirmClearData();
  logoutUser();
}

function exportLab(format) {
  if (format === "json") {
    downloadJSON(STATE.laboratorio, "laboratorio_evoinvent.json");
  } else if (format === "csv") {
    const headers = ["nombre", "categoria", "dificultad", "presupuesto", "fecha"];
    const rows = STATE.laboratorio.map(i => headers.map(h => `"${(i[h] || "").toString().replace(/"/g, "'")}"`).join(","));
    downloadText([headers.join(","), ...rows].join("\n"), "laboratorio_evoinvent.csv", "text/csv");
  } else if (format === "pdf") {
    showToast("📄 Exportación PDF próximamente", "info");
  }
}

function exportMercado(format) {
  if (!STATE.mercadoResult) { showToast("⚠ Genera un análisis primero", "error"); return; }
  if (format === "json") downloadJSON(STATE.mercadoResult, "analisis_mercado.json");
  else if (format === "csv") showToast("Exportando CSV...", "info");
  else showToast("Exportando PDF...", "info");
}

function exportCalculadora(format) {
  if (format === "pdf") showToast("📄 Exportación PDF próximamente", "info");
  else if (format === "csv") showToast("Exportando CSV...", "info");
}

function exportPitch(format) {
  if (format === "txt") {
    const text = STATE.pitchSlides.map((s, i) => `=== SLIDE ${i + 1}: ${s.title} ===\n${s.subtitle}\n\n${s.notes}\n\n`).join("");
    downloadText(text, "pitch_deck.txt", "text/plain");
  } else {
    showToast(`Exportación ${format.toUpperCase()} próximamente`, "info");
  }
}

function exportRuta() {
  showToast("📄 Exportación de ruta próximamente", "info");
}

function exportKanban() {
  const invId = STATE.currentKanbanInvento;
  if (!invId || !STATE.kanbanData[invId]) return;
  downloadJSON(STATE.kanbanData[invId], "kanban_evoinvent.json");
  showToast("✅ Kanban exportado", "success");
}

function copyPitchScript() {
  const text = STATE.pitchSlides.map((s, i) => `=== SLIDE ${i + 1}: ${s.title} ===\n${s.notes}`).join("\n\n");
  navigator.clipboard?.writeText(text).then(() => showToast("📋 Script copiado", "success")).catch(() => showToast("⚠ No se pudo copiar", "error"));
}

function copiarGuia() {
  if (!STATE.guiaResult) return;
  const text = STATE.guiaResult.pasos.map((p, i) => `PASO ${i + 1}: ${p.titulo}\n${p.instruccion}\nTip: ${p.tip}\n`).join("\n");
  navigator.clipboard?.writeText(text).then(() => showToast("📋 Guía copiada", "success")).catch(() => showToast("⚠ Error al copiar", "error"));
}

function exportGuia(format) {
  if (format === "pdf") showToast("📄 Exportación PDF próximamente", "info");
}

function compartirGuia() {
  openShareModal();
}

function descargarImagen() {
  const canvas = document.getElementById("invento-canvas");
  if (!canvas) return;
  const link = document.createElement("a");
  link.download = "invento_evoinvent.png";
  link.href     = canvas.toDataURL("image/png");
  link.click();
  showToast("🖼 Imagen descargada", "success");
}

/* ====================================================
   39. TUTORIAL
   ==================================================== */

function openTutorial() {
  showToast("📚 Tutorial próximamente", "info");
}

function skipTutorial() {
  document.getElementById("tutorial-overlay")?.classList.add("hidden");
}

/* ====================================================
   40. LLAMADAS AL BACKEND PYTHON (preparado para Flask)
   ==================================================== */

/**
 * =====================================================
 * INTEGRACIÓN CON BACKEND PYTHON (FLASK)
 * =====================================================
 * Para activar el backend real:
 *   1. Cambia CONFIG.USE_BACKEND = true
 *   2. Inicia el servidor Flask en localhost:5000
 *   3. Asegúrate de que Flask tenga CORS habilitado:
 *      from flask_cors import CORS; CORS(app)
 *
 * Estructura esperada de respuesta JSON del backend:
 * {
 *   "nombre": "string",
 *   "emoji": "string",
 *   "categoria": "string",
 *   "dificultad": "string",
 *   "tiempo": "string",
 *   "presupuesto": "string",
 *   "impactoScore": number,
 *   "descripcion": "string",
 *   "tecnologias": ["string"],
 *   "impacto": "string",
 *   "materiales": ["string"],
 *   "aplicaciones": ["string"],
 *   "problema": "string"
 * }
 */

/**
 * Función genérica para llamar al backend Python
 * @param {string} endpoint - Ruta del endpoint Flask
 * @param {object} payload  - Datos a enviar como POST JSON
 * @returns {Promise<object>} - Respuesta JSON del backend
 */
async function callBackend(endpoint, payload) {
  const url = `${CONFIG.API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept":       "application/json",
      // Agregar token de autenticación cuando sea necesario:
      // "Authorization": `Bearer ${STATE.currentUser?.token || ""}`,
    },
    body: JSON.stringify({
      ...payload,
      usuario_id:   STATE.currentUser?.email || "anonymous",
      app_version:  CONFIG.VERSION,
      timestamp:    new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  const data = await response.json();

  // Asegurar que el resultado tenga el formato correcto
  if (!data || typeof data !== "object") {
    throw new Error("Respuesta inválida del servidor");
  }

  // Agregar campos requeridos si no vienen del backend
  return {
    id:          data.id || uid(),
    nombre:      data.nombre || "Invento sin nombre",
    emoji:       data.emoji  || "💡",
    categoria:   data.categoria  || "Tecnología Digital",
    dificultad:  data.dificultad || "Intermedio",
    tiempo:      data.tiempo     || "1-2 meses",
    presupuesto: data.presupuesto || "$1,000-5,000 MXN",
    impactoScore: data.impactoScore || 70,
    descripcion: data.descripcion || "",
    tecnologias: data.tecnologias || [],
    impacto:     data.impacto     || "",
    materiales:  data.materiales  || [],
    aplicaciones:data.aplicaciones || [],
    problema:    payload.problema  || "",
    modo:        payload.modo      || "normal",
    fecha:       data.fecha || new Date().toISOString(),
    favorito:    false,
    notas:       "",
    // Pasar campos adicionales del backend si existen
    ...data,
  };
}

/**
 * Ejemplo de cómo verificar conectividad con el backend Python
 */
async function checkBackendHealth() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/health`, {
      method: "GET", signal: AbortSignal.timeout(3000),
    });
    if (response.ok) {
      const data = await response.json();
      console.info("✅ Backend Python conectado:", data);
      showToast("🐍 Backend Python conectado", "success");
      return true;
    }
  } catch {
    console.info("ℹ️ Backend Python no disponible. Usando modo offline.");
  }
  return false;
}

/* ====================================================
   41. HELPERS DE DOM
   ==================================================== */

function setEl(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function showElement(id) {
  document.getElementById(id)?.classList.remove("hidden");
}

function hideElement(id) {
  document.getElementById(id)?.classList.add("hidden");
}

function updateNavBadge(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value || "";
  el.style.display = value ? "" : "none";
}

function downloadJSON(data, filename) {
  downloadText(JSON.stringify(data, null, 2), filename, "application/json");
}

function downloadText(text, filename, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ====================================================
   42. KEYBOARD SHORTCUTS
   ==================================================== */

document.addEventListener("keydown", (e) => {
  const isInputFocused = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);

  // Escape cierra modales y paleta
  if (e.key === "Escape") {
    closeAllModals();
    closeCommandPalette();
    closeNotifications();
    return;
  }

  // Ctrl + K abre la paleta de comandos
  if (e.ctrlKey && e.key === "k") {
    e.preventDefault();
    openCommandPalette();
    return;
  }

  // Ctrl + Enter genera invento
  if (e.ctrlKey && e.key === "Enter" && !isInputFocused) {
    e.preventDefault();
    generarInvento();
    return;
  }

  // Atajos de sección (Ctrl + 1-9, 0)
  if (e.ctrlKey && !isInputFocused) {
    const sectionMap = {
      "1": "motor", "2": "dashboard", "3": "laboratorio", "4": "kanban",
      "5": "mercado", "6": "calculadora", "7": "pitch", "8": "patentes",
      "9": "guia", "0": "perfil",
    };
    const section = sectionMap[e.key];
    if (section) {
      e.preventDefault();
      navigate(section, document.querySelector(`[data-section="${section}"]`));
      return;
    }
    // Ctrl + , abre settings
    if (e.key === ",") { e.preventDefault(); openSettings(); return; }
    // Ctrl + N abre notificaciones
    if (e.key === "n") { e.preventDefault(); openNotifications(); return; }
  }

  // Flechas en pitch deck
  if (document.getElementById("section-pitch")?.classList.contains("active")) {
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowLeft")  prevSlide();
  }
});

/* ====================================================
   43. TUTORIAL Y CONFIGURACIÓN INICIAL
   ==================================================== */

function checkFirstTime() {
  const key = `evoinvent_firsttime_${STATE.currentUser?.email}`;
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, "true");
    addNotification("👋 ¡Bienvenido a EvoInvent! Genera tu primer invento con el Motor.", "system");
    addNotification("💡 Tip: Usa Ctrl+K para buscar comandos rápidamente", "info");
  }
}

/* ====================================================
   44. INIT GENERAL (DOMContentLoaded)
   ==================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Verificar si hay sesión guardada
  const lastSession = localStorage.getItem("evoinvent_last_session");
  if (lastSession) {
    try {
      const user = JSON.parse(lastSession);
      if (user?.email) {
        const stored = localStorage.getItem(`evoinvent_user_${user.email}`);
        if (stored) {
          const { user: savedUser } = JSON.parse(stored);
          // Auto-login con usuario guardado (comentar si no se desea)
          // loginWithUser(savedUser);
          // return;
        }
      }
    } catch { /* ignorar */ }
  }

  // Iniciar con splash → login
  // El splash maneja la transición por su propio script

  // Inicializar formularios de auth con listeners Enter
  document.getElementById("login-password")?.addEventListener("keydown", e => {
    if (e.key === "Enter") loginUser();
  });
  document.getElementById("reg-confirm")?.addEventListener("keydown", e => {
    if (e.key === "Enter") registerUser();
  });

  // Cerrar notificaciones al hacer click fuera
  document.addEventListener("click", (e) => {
    const panel = document.getElementById("notification-panel");
    const btn   = document.getElementById("notif-btn");
    if (panel && !panel.contains(e.target) && e.target !== btn && !btn?.contains(e.target)) {
      panel.classList.add("hidden");
    }
  });

  // Resize handler para canvas y mapa
  window.addEventListener("resize", () => {
    if (STATE.currentSection === "red-mentes") renderMapaMentes();
  });

  // Guardar sesión al cerrar
  window.addEventListener("beforeunload", () => {
    if (STATE.currentUser) {
      localStorage.setItem("evoinvent_last_session", JSON.stringify(STATE.currentUser));
      saveState();
    }
  });

  // Drag & drop: limpiar estado
  document.addEventListener("dragend", () => {
    document.querySelectorAll(".drag-over").forEach(el => el.classList.remove("drag-over"));
    document.querySelectorAll(".dragging").forEach(el => el.classList.remove("dragging"));
  });

  // Drag over global para quitar estilos
  document.addEventListener("dragover", (e) => { e.preventDefault(); });

  console.info(`%c⚡ EvoInvent v${CONFIG.VERSION} — Sistema inicializado`, "color:#00e5ff;font-family:monospace;font-size:14px;font-weight:bold");
  console.info("%c🐍 Para conectar el backend Python: CONFIG.USE_BACKEND = true", "color:#7c4dff;font-family:monospace");
});

/* ====================================================
   45. MISC: Funciones de utilidad de UI
   ==================================================== */

// Materiales precargados en calculadora
document.addEventListener("DOMContentLoaded", () => {
  // Agregar filas iniciales a la calculadora
  setTimeout(() => {
    if (materialRows.length === 0) {
      materialRows = [
        { id: uid(), nombre: "Microcontrolador Arduino Nano", cantidad: 1, precio: 180 },
        { id: uid(), nombre: "Sensores varios",               cantidad: 3, precio: 75 },
        { id: uid(), nombre: "Carcasa PLA impresa 3D",        cantidad: 1, precio: 120 },
      ];
      laborRows = [
        { id: uid(), actividad: "Diseño y prototipado", horas: 20, costo: 150 },
        { id: uid(), actividad: "Ensamblaje",           horas: 8,  costo: 120 },
      ];
      renderCalcRows();
    }
  }, 500);
});

// Pub text char counter
document.addEventListener("DOMContentLoaded", () => {
  const pubText = document.getElementById("pub-text");
  if (pubText) {
    pubText.addEventListener("input", () => {
      const charEl = document.getElementById("pub-char");
      if (charEl) charEl.textContent = pubText.value.length;
    });
  }
});

// Precargar costos cuando se selecciona invento
document.addEventListener("DOMContentLoaded", () => {
  const calcSel = document.getElementById("calc-inv-select");
  if (calcSel) calcSel.addEventListener("change", (e) => precargarCostos(e.target.value));
});

// Para activar: cambiar CONFIG.USE_BACKEND = true
// Endpoint base: http://localhost:5000
// Función principal: callBackend(endpoint, payload) → async fetch POST → JSON