/* Kidphone · tienda (dashboard) */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ======================================================================
   Productos relacionados. EDITA ESTA LISTA con tus productos reales.
   Si el arreglo queda vacío, la sección se oculta sola.
   (Estos cuatro son marcadores de posición, no productos reales.)
   ====================================================================== */
const RELATED = [
  { title: "Producto relacionado 1", price: null, oldPrice: null, image: "", href: "#" },
  { title: "Producto relacionado 2", price: null, oldPrice: null, image: "", href: "#" },
  { title: "Producto relacionado 3", price: null, oldPrice: null, image: "", href: "#" },
  { title: "Producto relacionado 4", price: null, oldPrice: null, image: "", href: "#" },
];

/* ---------- Sesión: muestra el usuario si hay token ---------- */
(function session() {
  const link = document.getElementById("session-link");
  let usuario = null;
  try { usuario = JSON.parse(localStorage.getItem("usuario") || "null"); } catch (_) {}
  if (!localStorage.getItem("token") || !usuario) return;

  const nombre = usuario.name || usuario.email || "cuenta";
  link.textContent = `Salir (${nombre})`;
  link.href = "index.html";
  link.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  });
})();

/* ---------- Cupón: copiar con confirmación ---------- */
(function coupon() {
  const btn = document.getElementById("coupon");
  const text = document.getElementById("coupon-text");
  const live = document.getElementById("coupon-live");
  let timer;

  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.code);
    } catch (_) { /* sin permiso de portapapeles: el código sigue visible */ return; }
    clearTimeout(timer);
    btn.dataset.copied = "true";
    text.textContent = "¡Copiado!";
    live.textContent = "Cupón copiado";
    timer = setTimeout(() => {
      btn.dataset.copied = "false";
      text.textContent = btn.dataset.code;
      live.textContent = "";
    }, 1600);
  });
})();

/* ---------- Sombra de la barra al hacer scroll ---------- */
(function stickyShadow() {
  const nav = document.getElementById("nav");
  const sentinel = document.getElementById("sentinel");
  if (!("IntersectionObserver" in window)) return;
  new IntersectionObserver(([entry]) => {
    nav.classList.toggle("is-stuck", !entry.isIntersecting);
  }).observe(sentinel);
})();

/* ---------- Descuento calculado a partir de los precios ---------- */
(function discount() {
  const now = parseFloat(document.querySelector(".price__now").textContent.replace(/[^0-9.]/g, ""));
  const old = parseFloat(document.querySelector(".price__old").textContent.replace(/[^0-9.]/g, ""));
  const el = document.getElementById("off");
  if (old > now) el.textContent = `-${Math.round((1 - now / old) * 100)}%`;
  else el.remove();
})();

/* ---------- Galería: cambio de imagen con fundido + blur ---------- */
(function gallery() {
  const stage = document.getElementById("stage");
  const main = document.getElementById("main-image");
  const thumbs = [...document.querySelectorAll(".thumb")];

  main.addEventListener("error", () => stage.classList.add("is-missing"));
  main.addEventListener("load", () => stage.classList.remove("is-missing"));
  thumbs.forEach((t) => t.querySelector("img").addEventListener("error", () => { t.hidden = true; }));

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", async (e) => {
      if (thumb.getAttribute("aria-current") === "true") return;
      thumbs.forEach((t) => t.setAttribute("aria-current", String(t === thumb)));

      const swap = () => { main.src = thumb.dataset.src; main.alt = thumb.dataset.alt; };
      if (reduceMotion.matches || e.detail === 0 || !main.animate) { swap(); return; }

      // El blur oculta que se ven dos imágenes superpuestas durante el cambio
      await main.animate(
        [{ opacity: 1, filter: "blur(0)" }, { opacity: 0, filter: "blur(2px)" }],
        { duration: 110, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "forwards" }
      ).finished;
      swap();
      main.animate(
        [{ opacity: 0, filter: "blur(2px)" }, { opacity: 1, filter: "blur(0)" }],
        { duration: 160, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "forwards" }
      );
    });
  });
})();

/* ---------- Pestañas con indicador deslizante ---------- */
(function tabs() {
  const list = document.getElementById("tabs");
  const bar = document.getElementById("tabs-bar");
  const tabEls = [...list.querySelectorAll(".tab")];

  function moveBar(tab) {
    // Se anima solo transform: el ancho base es 100px y se escala
    const w = tab.offsetWidth;
    bar.style.setProperty("--x", `${tab.offsetLeft}px`);
    bar.style.setProperty("--w", String(w / 100));
  }

  function select(tab, { instant = false } = {}) {
    list.classList.toggle("is-instant", instant);
    tabEls.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      panel.hidden = !on;
      panel.classList.remove("is-entering");
      if (on && !instant && !reduceMotion.matches) {
        void panel.offsetWidth;
        panel.classList.add("is-entering");
      }
    });
    moveBar(tab);
  }

  tabEls.forEach((t) => t.addEventListener("click", (e) => select(t, { instant: e.detail === 0 })));

  list.addEventListener("keydown", (e) => {
    const i = tabEls.findIndex((t) => t.getAttribute("aria-selected") === "true");
    let next = null;
    if (e.key === "ArrowRight") next = tabEls[(i + 1) % tabEls.length];
    if (e.key === "ArrowLeft") next = tabEls[(i - 1 + tabEls.length) % tabEls.length];
    if (e.key === "Home") next = tabEls[0];
    if (e.key === "End") next = tabEls[tabEls.length - 1];
    if (!next) return;
    e.preventDefault();
    select(next, { instant: true }); // teclado: sin animación
    next.focus();
  });

  const current = tabEls.find((t) => t.getAttribute("aria-selected") === "true");
  list.classList.add("is-instant");
  moveBar(current);
  requestAnimationFrame(() => list.classList.remove("is-instant"));
  window.addEventListener("resize", () => {
    list.classList.add("is-instant");
    moveBar(tabEls.find((t) => t.getAttribute("aria-selected") === "true"));
    requestAnimationFrame(() => list.classList.remove("is-instant"));
  });
  document.fonts?.ready.then(() => moveBar(tabEls.find((t) => t.getAttribute("aria-selected") === "true")));
})();

/* ---------- Relacionados ---------- */
(function related() {
  const section = document.getElementById("related");
  const grid = document.getElementById("related-grid");
  if (!RELATED.length) return;

  const phone =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">' +
    '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 19h2"/></svg>';

  for (const p of RELATED) {
    const a = document.createElement("a");
    a.className = "card-p";
    a.href = p.href || "#";
    a.dataset.reveal = "";

    const img = document.createElement("div");
    img.className = "card-p__img";
    if (p.image) {
      const i = document.createElement("img");
      i.src = p.image; i.alt = ""; i.loading = "lazy";
      i.addEventListener("error", () => { img.innerHTML = phone; });
      img.append(i);
    } else {
      img.innerHTML = phone;
    }

    const body = document.createElement("div");
    body.className = "card-p__body";
    const title = document.createElement("h3");
    title.className = "card-p__title";
    title.textContent = p.title;
    const price = document.createElement("p");
    price.className = "card-p__price";
    price.textContent = p.price ?? "Consultar precio";
    if (p.oldPrice) {
      const old = document.createElement("del");
      old.className = "card-p__old";
      old.textContent = p.oldPrice;
      price.append(old);
    }
    body.append(title, price);
    a.append(img, body);
    grid.append(a);
  }
  section.hidden = false;
})();

/* ---------- Entrada al hacer scroll, en cascada de 60 ms ---------- */
(function reveal() {
  const items = [...document.querySelectorAll("[data-reveal]")];
  if (!items.length) return;

  const show = (el, i = 0) => {
    el.style.setProperty("--d", `${Math.min(i, 6) * 60}ms`);
    el.classList.add("is-in");
  };

  if (!("IntersectionObserver" in window)) { items.forEach((el) => show(el)); return; }

  const io = new IntersectionObserver((entries) => {
    const visible = entries.filter((e) => e.isIntersecting);
    visible.forEach((entry, i) => { show(entry.target, i); io.unobserve(entry.target); });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  items.forEach((el) => io.observe(el));
})();
