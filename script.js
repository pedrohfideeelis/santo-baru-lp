document.addEventListener("DOMContentLoaded", () => {
  const ACCORDION_SELECTOR = ".faq-item";
  const QUESTION_SELECTOR = ".faq-question";
  const ANSWER_SELECTOR = ".faq-answer";
  const CLOSE_OTHERS = true; // abre um por vez dentro do mesmo .faq

  const items = document.querySelectorAll(ACCORDION_SELECTOR);
  if (!items.length) return;

  items.forEach((item, idx) => {
    const btn = item.querySelector(QUESTION_SELECTOR);
    const panel = item.querySelector(ANSWER_SELECTOR);
    if (!btn || !panel) return;

    // Acessibilidade básica
    const panelId =
      panel.id || `faq-panel-${idx}-${Math.random().toString(36).slice(2)}`;
    panel.id = panelId;
    btn.type = "button";
    btn.setAttribute("aria-controls", panelId);
    btn.setAttribute("aria-expanded", "false");

    // Estado inicial (fechado) – permite transição
    panel.style.display = "block"; // garante medição de altura
    panel.style.height = "0px";
    panel.style.opacity = "0";
    panel.style.overflow = "hidden";
    panel.style.padding = "0 6px"; // mesmo padding “colapsado” do CSS

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      // Fecha outros dentro do mesmo .faq (se existir um .faq pai)
      if (CLOSE_OTHERS && !isOpen) {
        const group = item.closest(".faq") || document;
        group
          .querySelectorAll(`${ACCORDION_SELECTOR}.open`)
          .forEach((other) => {
            if (other !== item) collapse(other);
          });
      }

      isOpen ? collapse(item) : expand(item);
    });
  });

  function expand(item) {
    const panel = item.querySelector(ANSWER_SELECTOR);
    const btn = item.querySelector(QUESTION_SELECTOR);

    item.classList.add("open");
    btn.setAttribute("aria-expanded", "true");

    // mede a altura final natural
    const finalHeight = panel.scrollHeight;

    // anima de 0 -> altura final
    panel.style.opacity = "1";
    panel.style.height = "0px";
    panel.getBoundingClientRect(); // força reflow
    panel.style.height = finalHeight + "px";

    const end = (e) => {
      if (e.propertyName !== "height") return;
      panel.style.height = "auto"; // deixa livre para conteúdo dinâmico
      panel.removeEventListener("transitionend", end);
    };
    panel.addEventListener("transitionend", end);
  }

  function collapse(item) {
    const panel = item.querySelector(ANSWER_SELECTOR);
    const btn = item.querySelector(QUESTION_SELECTOR);

    item.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");

    // anima de altura atual -> 0
    const currentHeight = panel.scrollHeight;
    panel.style.height = currentHeight + "px";
    panel.getBoundingClientRect(); // reflow
    panel.style.height = "0px";
    panel.style.opacity = "0";
    panel.style.padding = "0 6px"; // garante padding “fechado”

    const end = (e) => {
      if (e.propertyName !== "height") return;
      // mantemos display:block para próximas medições
      panel.removeEventListener("transitionend", end);
    };
    panel.addEventListener("transitionend", end);
  }
});

/* =========================
   SMOOTH SCROLL PARA ÂNCORAS
   ========================= */
(() => {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // só links com hash válido (#algo), ignorando "#"
  const links = document.querySelectorAll(
    'a.btn-laranja[href^="#"]:not([href="#"])'
  );

  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      const hash = a.getAttribute("href");
      const target = document.querySelector(hash);
      if (!target) return; // se não existir, deixa o comportamento padrão

      e.preventDefault();

      // rolar suavemente até a seção
      target.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start",
      });

      // acessibilidade: dá foco no destino
      target.setAttribute("tabindex", "-1");
      setTimeout(() => target.focus({ preventScroll: true }), 400);

      // mantém a âncora na URL (sem recarregar)
      history.replaceState(null, "", hash);
    });
  });
})();

(function () {
  var links = document.querySelectorAll('a[href^="#"]');
  if (!links.length) return;

  function onClick(e) {
    var hash = this.getAttribute("href");
    if (!hash || hash.length < 2) return;
    var id = hash.slice(1);
    var target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    var prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Usa a geometria real do elemento (independe de transform no wrapper)
    if (target.scrollIntoView) {
      target.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start",
        inline: "nearest",
      });
    } else {
      // fallback bem antigo
      var y = 0,
        el = target;
      while (el) {
        y += el.offsetTop || 0;
        el = el.offsetParent;
      }
      window.scrollTo(0, y - 12);
    }

    try {
      history.replaceState(null, "", "#" + id);
    } catch (_) {}
  }

  links.forEach(function (a) {
    a.addEventListener("click", onClick, { passive: false });
  });
})();
