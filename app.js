(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  const toast = $("#toast");
  const toastText = $("#toastText");

  const contactModal = $("#contactModal");
  const detailModal = $("#detailModal");
  const detailTitle = $("#detailTitle");
  const detailBody = $("#detailBody");
  const closeDetail = $("#closeDetail");
  const detailCloseBtn = $("#detailCloseBtn");
  const detailContactBtn = $("#detailContactBtn");

  const openContactBtn = $("#openContact");
  const closeContactBtn = $("#closeContact");
  const scrollHint = $("#scrollHint");

  const burger = $("#burger");
  const mobileMenu = $("#mobileMenu");

  const themeToggle = $("#toggleTheme");
  const soundToggle = $("#soundToggle"); // remove if still present
  const bgParticles = $(".bg__particles");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Remove sound control entirely
  if (soundToggle) soundToggle.remove();

  // -----------------------------
  // Toast
  // -----------------------------
  function showToast(msg) {
    if (!toast || !toastText) return;
    toastText.textContent = msg;

    toast.hidden = false;
    toast.style.opacity = "0";
    void toast.offsetHeight;
    toast.style.opacity = "1";

    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toast.style.opacity = "0";
      clearTimeout(showToast._t2);
      showToast._t2 = setTimeout(() => (toast.hidden = true), 160);
    }, 1100);
  }

  // -----------------------------
  // Copy buttons
  // -----------------------------
  async function copyFromSelector(sel) {
    const el = $(sel);
    if (!el) return false;
    const text = (el.innerText || el.textContent || "").trim();
    if (!text) return false;

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        return true;
      } catch {
        return false;
      }
    }
  }

  $$("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const sel = btn.getAttribute("data-copy");
      const ok = await copyFromSelector(sel);
      showToast(ok ? "Copied." : "Copy failed.");
    });
  });

  // -----------------------------
  // Contact modal
  // -----------------------------
  function openContact() {
    if (!contactModal) return;
    if (typeof contactModal.showModal === "function") contactModal.showModal();
    else location.hash = "#contact";
  }
  function closeContact() {
    if (!contactModal) return;
    if (contactModal.open) contactModal.close();
  }

  openContactBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    openContact();
  });
  closeContactBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    closeContact();
  });

  // -----------------------------
  // Detail modal for cards/projects
  // -----------------------------
  function openDetail(title, body) {
    if (!detailModal) return;
    if (detailTitle) detailTitle.textContent = title || "Details";
    if (detailBody) detailBody.textContent = body || "";
    if (typeof detailModal.showModal === "function") detailModal.showModal();
  }
  function closeDetailModal() {
    if (!detailModal) return;
    if (detailModal.open) detailModal.close();
  }

  closeDetail?.addEventListener("click", (e) => { e.preventDefault(); closeDetailModal(); });
  detailCloseBtn?.addEventListener("click", (e) => { e.preventDefault(); closeDetailModal(); });
  detailContactBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    closeDetailModal();
    openContact();
  });

  $$("[data-open-card]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const t = e.target;
      if (t && (t.closest("a") || t.closest("button") || t.classList.contains("copyBtn"))) return;

      const title = el.getAttribute("data-title") || el.querySelector("h3")?.textContent || "Details";
      const body = el.getAttribute("data-body") || "";
      openDetail(title, body);
    });
  });

  // -----------------------------
  // Buttons with data-open
  // -----------------------------
  $$("[data-open]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const target = btn.getAttribute("data-open");
      if (target === "contact") openContact();
      else if (target === "projects") scrollToHash("#projects");
    });
  });

  // -----------------------------
  // Project filters
  // -----------------------------
  const filters = $$(".filter");
  const projectGrid = $("#projectGrid");
  const emptyState = $("#emptyState");
  const projects = projectGrid ? $$(".project", projectGrid).filter((p) => !p.classList.contains("project--empty")) : [];

  function setFilter(tag) {
    filters.forEach((b) => b.classList.toggle("is-active", b.dataset.filter === tag));

    let shown = 0;
    projects.forEach((p) => {
      const tags = (p.dataset.tags || "").split(/\s+/).filter(Boolean);
      const match = tag === "all" ? true : tags.includes(tag);
      p.style.display = match ? "" : "none";
      if (match) shown++;
    });

    if (emptyState) emptyState.hidden = shown !== 0;
    showToast(`Filter: ${tag === "all" ? "All" : tag}`);
  }

  filters.forEach((b) => b.addEventListener("click", () => setFilter(b.dataset.filter)));

  // -----------------------------
  // Mobile menu
  // -----------------------------
  function openMobileMenu() {
    if (!mobileMenu || !burger) return;
    mobileMenu.style.display = "flex";
    mobileMenu.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
  }
  function closeMobileMenu() {
    if (!mobileMenu || !burger) return;
    mobileMenu.style.display = "";
    mobileMenu.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
  }

  burger?.addEventListener("click", () => {
    const expanded = burger.getAttribute("aria-expanded") === "true";
    expanded ? closeMobileMenu() : openMobileMenu();
  });
  $$(".nav__mLink").forEach((a) => a.addEventListener("click", () => closeMobileMenu()));

  // -----------------------------
  // Scroll hint
  // -----------------------------
  scrollHint?.addEventListener("click", () => {
    const sections = $$("[data-section]");
    if (!sections.length) return;

    const y = window.scrollY || 0;
    let next = null;
    for (const s of sections) {
      const top = s.getBoundingClientRect().top + (window.scrollY || 0);
      if (top > y + 30) { next = s; break; }
    }
    if (!next) next = sections[0];
    next.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // -----------------------------
  // Anchor navigation with offset
  // -----------------------------
  function scrollToHash(hash) {
    const el = $(hash);
    if (!el) return;
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--navH") || "76", 10);
    const y = el.getBoundingClientRect().top + (window.scrollY || 0) - navH - 14;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const el = $(href);
      if (!el) return;
      e.preventDefault();
      closeMobileMenu();
      scrollToHash(href);
      history.pushState(null, "", href);
    });
  });

  window.addEventListener("load", () => {
    if (location.hash) setTimeout(() => scrollToHash(location.hash), 50);
  });

  // -----------------------------
  // Theme toggle (kept)
  // -----------------------------
  let theme = localStorage.getItem("theme") || "dark";
  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);

    if (theme === "neon") {
      document.documentElement.style.setProperty("--accent", "#ff5a1f");
      document.documentElement.style.setProperty("--accent2", "#ffb000");
      showToast("Theme: Neon");
    } else {
      document.documentElement.style.setProperty("--accent", "#ffb000");
      document.documentElement.style.setProperty("--accent2", "#ff5a1f");
      showToast("Theme: Dark");
    }
  }
  themeToggle?.addEventListener("click", () => {
    theme = theme === "dark" ? "neon" : "dark";
    applyTheme();
  });
  applyTheme();

  // -----------------------------
  // Particles (same as before)
  // -----------------------------
  function makeParticles() {
    if (!bgParticles || reduceMotion) return;
    const count = Math.min(34, Math.floor(window.innerWidth / 28));
    bgParticles.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "spark";
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 100}%`;
      p.style.opacity = `${0.16 + Math.random() * 0.45}`;
      p.style.transform = `scale(${1 + Math.random() * 2.2})`;
      p.style.animationDuration = `${7 + Math.random() * 11}s`;
      p.style.animationDelay = `${Math.random() * -(7 + Math.random() * 11)}s`;
      bgParticles.appendChild(p);
    }
  }
  makeParticles();
  window.addEventListener("resize", makeParticles, { passive: true });

  // -----------------------------
  // Global key handling
  // -----------------------------
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeMobileMenu();
    if (detailModal?.open) detailModal.close();
    if (contactModal?.open) contactModal.close();
  });
})();
