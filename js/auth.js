/* Kidphone · login / registro
   Misma lógica y mismos endpoints que la versión original; solo cambia la
   presentación (sin alert(), con estado de carga y selector animado). */

const API_BASE = "https://symphonic-majesty-ruse.ngrok-free.dev";

const seg = document.getElementById("seg");
const tabs = {
  login: document.getElementById("tab-login"),
  register: document.getElementById("tab-register"),
};
const form = document.getElementById("auth-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const peek = document.getElementById("peek");
const submitBtn = document.getElementById("submit");
const msg = document.getElementById("msg");

let modo = "login";

/* ---------- Sesión existente: si el token sigue válido, directo al dashboard ---------- */
window.addEventListener("load", async () => {
  const token = localStorage.getItem("token");
  const usuario = localStorage.getItem("usuario");
  if (!token || !usuario) return;

  try {
    const response = await fetch(`${API_BASE}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      window.location.href = "dashboard.html";
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
    }
  } catch (err) {
    console.error("Error verificando token:", err);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  }
});

/* ---------- Selector Iniciar sesión / Registrarse ---------- */
function setMode(next, { instant = false } = {}) {
  modo = next;
  // Un cambio hecho con teclado no se anima (acción repetible, sin movimiento)
  seg.classList.toggle("is-instant", instant);
  seg.dataset.mode = next;

  for (const [key, el] of Object.entries(tabs)) {
    const active = key === next;
    el.setAttribute("aria-selected", String(active));
    el.tabIndex = active ? 0 : -1;
  }
  form.setAttribute("aria-labelledby", `tab-${next}`);
  passwordInput.autocomplete = next === "login" ? "current-password" : "new-password";
  hideMsg();
}

tabs.login.addEventListener("click", (e) => setMode("login", { instant: e.detail === 0 }));
tabs.register.addEventListener("click", (e) => setMode("register", { instant: e.detail === 0 }));

seg.addEventListener("keydown", (e) => {
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
  const next = modo === "login" ? "register" : "login";
  setMode(next, { instant: true });
  tabs[next].focus();
  e.preventDefault();
});

/* ---------- Mostrar / ocultar contraseña ---------- */
peek.addEventListener("click", () => {
  const show = passwordInput.type === "password";
  passwordInput.type = show ? "text" : "password";
  peek.setAttribute("aria-pressed", String(show));
  peek.setAttribute("aria-label", show ? "Ocultar contraseña" : "Mostrar contraseña");
});

/* ---------- Mensajes de estado ---------- */
function showMsg(text, kind) {
  msg.hidden = true;           // reinicia @starting-style para que vuelva a animar
  msg.className = `msg msg--${kind}`;
  msg.textContent = text;
  void msg.offsetWidth;
  msg.hidden = false;
}
function hideMsg() {
  msg.hidden = true;
}

function setBusy(busy) {
  submitBtn.setAttribute("aria-busy", String(busy));
  submitBtn.disabled = busy;
}

/* ---------- Login / registro ---------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showMsg("Por favor, completa todos los campos.", "error");
    (email ? passwordInput : emailInput).focus();
    return;
  }

  const endpoint = modo === "login" ? "login" : "register";
  hideMsg();
  setBusy(true);

  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Usuario Web", email, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      showMsg("Error: " + (data.error || "Error desconocido"), "error");
      return;
    }

    if (modo === "login") {
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.user));
      window.location.href = "dashboard.html";
    } else {
      setMode("login");
      showMsg((data.message || "Registro exitoso") + " ✅ Ahora inicia sesión.", "ok");
      passwordInput.value = "";
      passwordInput.focus();
    }
  } catch (error) {
    console.error(error);
    showMsg("No se pudo conectar al servidor.", "error");
  } finally {
    setBusy(false);
  }
});
