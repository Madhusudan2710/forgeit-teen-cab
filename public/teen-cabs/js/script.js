(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer:fine)").matches;
  const teamSection = $(".team-section-refresh");

  if (teamSection && !reduceMotion) {
    const teamMotionTargets = $$(
      ".team-modern-heading > *, .team-modern-card, .team-modern-footer",
      teamSection,
    );

    if ("IntersectionObserver" in window) {
      teamSection.classList.add("is-motion-ready");
      const teamMotionObserver = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) =>
            entry.target.classList.toggle("is-in-view", entry.isIntersecting),
          ),
        { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
      );
      teamMotionTargets.forEach((target) => teamMotionObserver.observe(target));
    } else {
      teamMotionTargets.forEach((target) => target.classList.add("is-in-view"));
    }
  }
  const header = $(".site-header"),
    menu = $(".menu-toggle"),
    nav = $(".nav-links");
  const progress = $(".scroll-progress span");

  // Navigation
  if (menu && nav) {
    const closeMenu = () => {
      nav.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-label", "Open navigation");
    };
    menu.addEventListener("click", () => {
      const open = menu.getAttribute("aria-expanded") !== "true";
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute(
        "aria-label",
        open ? "Close navigation" : "Open navigation",
      );
      nav.classList.toggle("open", open);
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  let scrollQueued = false;
  const updateScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      header?.classList.toggle("is-scrolled", scrollY > 18);
      if (!window.gsap && progress) {
        const max = document.documentElement.scrollHeight - innerHeight;
        progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
      }
      scrollQueued = false;
    });
  };
  addEventListener("scroll", updateScroll, { passive: true });
  updateScroll();

  // Team image fallback
  $$(".team-photo img, .core-avatar img").forEach((img) => {
    const fallback = img.parentElement.querySelector("span");
    const loaded = () => {
      if (fallback) fallback.style.display = "none";
    };
    if (img.complete && img.naturalWidth) loaded();
    img.addEventListener("load", loaded);
    img.addEventListener("error", () =>
      img.parentElement.classList.add("photo-missing"),
    );
  });

  const navLinks = $$('.nav-links a[href^="#"]');
  if ("IntersectionObserver" in window) {
    $$("main section[id]").forEach((section) => {
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting)
              navLinks.forEach((a) =>
                a.classList.toggle("is-active", a.hash === `#${section.id}`),
              );
          }),
        { rootMargin: "-35% 0px -55% 0px" },
      );
      io.observe(section);
    });
  }

  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (hasGSAP && !reduceMotion) {
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    gsap.config({ nullTargetWarn: false });

    // HERO — cinematic staged entrance
    const heroTL = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTL
      .from(".site-header .brand", { y: -18, autoAlpha: 0, duration: 0.65 })
      .from(
        ".site-header .nav-links > *",
        { y: -12, autoAlpha: 0, duration: 0.42, stagger: 0.065 },
        "-=.35",
      )
      .from(
        ".hero-copy .eyebrow",
        { x: -28, autoAlpha: 0, duration: 0.55 },
        "-=.1",
      )
      .from(
        ".hero-copy .hero-kicker",
        { x: -22, autoAlpha: 0, duration: 0.5 },
        "-=.25",
      )
      .from(
        ".hero-copy h1",
        {
          y: 42,
          rotateX: -12,
          transformPerspective: 800,
          autoAlpha: 0,
          duration: 0.9,
        },
        "-=.2",
      )
      .from(
        ".hero-copy .hero-description",
        { y: 22, autoAlpha: 0, duration: 0.6 },
        "-=.4",
      )
      .from(
        ".hero-actions > *",
        { y: 16, autoAlpha: 0, duration: 0.45, stagger: 0.12 },
        "-=.3",
      )
      .from(
        ".trust-row span, .availability",
        { y: 12, autoAlpha: 0, duration: 0.4, stagger: 0.055 },
        "-=.2",
      )
      .from(
        ".hero-stage",
        {
          scale: 0.86,
          rotateY: -12,
          autoAlpha: 0,
          duration: 1.1,
          ease: "power4.out",
        },
        "-=1.05",
      )
      .from(
        ".route-line",
        { scale: 0.5, autoAlpha: 0, duration: 0.8, transformOrigin: "center" },
        "-=.65",
      )
      .from(
        ".car-wrap",
        { x: 90, rotateZ: 4, autoAlpha: 0, duration: 0.9 },
        "-=.55",
      )
      .from(
        ".floating-ui",
        { y: 25, scale: 0.88, autoAlpha: 0, duration: 0.55, stagger: 0.16 },
        "-=.45",
      );

    // PROBLEM — alternating directional editorial reveals + stat emphasis
    const problemRows = $$(".problem-row");
    problemRows.forEach((row, i) => {
      gsap.fromTo(
        row,
        { x: i % 2 ? 65 : -65, autoAlpha: 0, clipPath: "inset(0 0 0 0)" },
        {
          x: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 84%", once: true },
          onStart: () => row.classList.add("is-active"),
        },
      );
    });
    gsap.from(".stats-panel", {
      y: 65,
      rotateY: -9,
      rotateX: 5,
      transformPerspective: 1000,
      autoAlpha: 0,
      duration: 1,
      scrollTrigger: { trigger: ".stats-panel", start: "top 82%", once: true },
    });
    gsap.from(".stat-feature strong, .stat-grid strong", {
      scale: 0.65,
      y: 16,
      autoAlpha: 0,
      duration: 0.65,
      stagger: 0.1,
      ease: "back.out(1.7)",
      scrollTrigger: { trigger: ".stats-panel", start: "top 70%", once: true },
    });

    // SOLUTION — left title pins; each benefit sweeps into view
    gsap.from(".solution-heading", {
      x: -75,
      autoAlpha: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: ".solution", start: "top 72%", once: true },
    });
    $$(".solution-point").forEach((row, i) => {
      gsap.fromTo(
        row,
        { x: 90, autoAlpha: 0, rotateY: -5 },
        {
          x: 0,
          autoAlpha: 1,
          rotateY: 0,
          duration: 0.8,
          delay: i * 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 86%", once: true },
          onStart: () => row.classList.add("is-active"),
        },
      );
    });

    // FEATURES — card-specific reveals; visual graphics animate with distinct motion
    const featureCards = $$(".feature-card");
    gsap.from(featureCards, {
      y: 75,
      scale: 0.94,
      autoAlpha: 0,
      duration: 0.9,
      stagger: 0.14,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".feature-bento",
        start: "top 78%",
        once: true,
      },
    });
    const shield = $(".shield-ring");
    if (shield)
      gsap.from(shield, {
        scale: 0.3,
        rotate: -100,
        autoAlpha: 0,
        duration: 1.2,
        ease: "elastic.out(1,.65)",
        scrollTrigger: { trigger: shield, start: "top 85%", once: true },
      });
    $$(".graphic-dashboard .dash-line").forEach((line, i) =>
      gsap.from(line, {
        scaleX: 0,
        transformOrigin: "left",
        duration: 0.65,
        delay: i * 0.13,
        ease: "power2.out",
        scrollTrigger: { trigger: line, start: "top 88%", once: true },
      }),
    );
    $$(".graphic-sound span").forEach((bar, i) =>
      gsap.to(bar, {
        y: i % 2 ? -12 : 12,
        rotate: i % 2 ? 8 : -8,
        repeat: -1,
        yoyo: true,
        duration: 0.65 + (i % 3) * 0.16,
        ease: "sine.inOut",
        delay: i * 0.09,
      }),
    );
    $$(".feature-graphic").forEach((graphic) =>
      gsap.to(graphic, {
        y: -18,
        ease: "none",
        scrollTrigger: {
          trigger: graphic,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.7,
        },
      }),
    );

    // JOURNEY — horizontal route draw + sequential waypoint activation
    const track = $(".journey-track");
    if (track) {
      gsap.fromTo(
        track,
        { "--journey-progress": 0 },
        {
          "--journey-progress": 1,
          ease: "none",
          scrollTrigger: {
            trigger: track,
            start: "top 72%",
            end: "bottom 58%",
            scrub: 0.8,
          },
        },
      );
      $$(".journey-step").forEach((step, i) =>
        gsap.fromTo(
          step,
          {
            y: 55,
            autoAlpha: 0,
            rotateX: -8,
            transformPerspective: 800,
          },
          {
            y: 0,
            autoAlpha: 1,
            rotateX: 0,
            duration: 0.75,
            delay: i * 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: step, start: "top 86%", once: true },
            onStart: () => step.classList.add("is-active"),
          },
        ),
      );
    }


    // BETA — layered spotlight entrance and CTA sheen
    const beta = $(".beta-inner");
    if (beta) {
      const betaTL = gsap.timeline({
        scrollTrigger: {
          trigger: ".beta-section",
          start: "top 78%",
          once: true,
        },
      });
      betaTL
        .from(".beta-inner .section-index", {
          y: 20,
          autoAlpha: 0,
          duration: 0.5,
        })
        .from(
          ".beta-inner h2",
          {
            y: 55,
            scale: 0.94,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power3.out",
          },
          "-=.2",
        )
        .from(
          ".beta-inner > p",
          { y: 24, autoAlpha: 0, duration: 0.6 },
          "-=.45",
        )
        .from(
          ".beta-inner .button, .beta-inner small",
          { y: 18, autoAlpha: 0, duration: 0.55, stagger: 0.13 },
          "-=.25",
        );
    }

    // FOOTER — columns rise in sequence; links animate individually
    gsap.from(".footer-brand-block", {
      x: -35,
      autoAlpha: 0,
      duration: 0.7,
      scrollTrigger: { trigger: ".site-footer", start: "top 88%", once: true },
    });
    gsap.from(".footer-column", {
      y: 35,
      autoAlpha: 0,
      duration: 0.65,
      stagger: 0.12,
      scrollTrigger: { trigger: ".footer-main", start: "top 88%", once: true },
    });
    gsap.from(".footer-bottom > *", {
      y: 12,
      autoAlpha: 0,
      duration: 0.45,
      stagger: 0.1,
      scrollTrigger: {
        trigger: ".footer-bottom",
        start: "bottom 100%",
        once: true,
      },
    });

    if (progress)
      gsap.to(progress, {
        width: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.15,
        },
      });
  } else {
    // No-GSAP and reduced-motion fallbacks
    const revealEls = $$(".reveal");
    if (!reduceMotion && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries, obs) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          }),
        { threshold: 0.12, rootMargin: "0px 0px -35px 0px" },
      );
      revealEls.forEach((el) => io.observe(el));
    } else revealEls.forEach((el) => el.classList.add("is-visible"));
    $$(".problem-row,.solution-point,.journey-step").forEach((el) =>
      el.classList.add("is-active"),
    );
  }

  // Hero 3D-like pointer response; no effect on touch or reduced-motion devices.
  const hero = $(".hero"),
    stage = $(".hero-stage"),
    car = $(".car-wrap");
  if (hero && stage && car && finePointer && !reduceMotion) {
    let pointerFrame = 0,
      pointer = null;
    hero.addEventListener("pointermove", (e) => {
      pointer = e;
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        const r = stage.getBoundingClientRect();
        const x = (pointer.clientX - r.left) / r.width - 0.5;
        const y = (pointer.clientY - r.top) / r.height - 0.5;
        car.style.transform = `translate(calc(-50% + ${x * 13}px),calc(-50% + ${y * 10}px)) rotateX(${8 - y * 5}deg) rotateZ(${-8 + x * 4}deg)`;
        stage.style.setProperty("--glow-x", `${(x + 0.5) * 100}%`);
        stage.style.setProperty("--glow-y", `${(y + 0.5) * 100}%`);
      });
    });
    hero.addEventListener("pointerleave", () => {
      car.style.transform = "";
      stage.style.removeProperty("--glow-x");
      stage.style.removeProperty("--glow-y");
    });
  }

  // Feature cards: cursor light and restrained tilt
  if (finePointer && !reduceMotion)
    $$(".feature-card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left,
          y = e.clientY - r.top;
        card.style.setProperty("--spot-x", `${x}px`);
        card.style.setProperty("--spot-y", `${y}px`);
        if (!card.classList.contains("feature-large")) {
          card.style.transform = `perspective(1000px) rotateX(${(y / r.height - 0.5) * -2.5}deg) rotateY(${(x / r.width - 0.5) * 2.5}deg) translateY(-3px)`;
        }
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });

  // Magnetic-style CTA response on mouse only; intentionally restrained.
  if (finePointer && !reduceMotion)
    $$(".button,.nav-cta").forEach((button) => {
      button.addEventListener("pointermove", (e) => {
        const r = button.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / r.width;
        const dy = (e.clientY - r.top - r.height / 2) / r.height;
        button.style.translate = `${dx * 5}px ${dy * 4}px`;
      });
      button.addEventListener("pointerleave", () => {
        button.style.translate = "";
      });
    });
})();


/* =========================================================
   EXPERIENCE SECTION — selectors matched to index.html
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("#features.experience-section");
  if (!section) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cards = [...section.querySelectorAll(".feature-showcase")];

  // Keep content visible if GSAP is unavailable or reduced motion is enabled.
  if (reduceMotion) return;

  if (window.gsap && window.ScrollTrigger) {
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    // Intro: title rises with a slight 3D perspective.
    gsap.from(section.querySelectorAll(".experience-intro > *"), {
      y: 34,
      rotateX: -7,
      transformPerspective: 800,
      autoAlpha: 0,
      duration: 0.8,
      stagger: 0.13,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".experience-intro",
        start: "top 82%",
        once: true
      }
    });

    // Safety: text enters from left; orbit and check have separate choreography.
    const safety = section.querySelector(".safety-showcase");
    if (safety) {
      gsap.from(safety.querySelector(".feature-copy"), {
        x: -55, autoAlpha: 0, duration: 0.85, ease: "power3.out",
        scrollTrigger: { trigger: safety, start: "top 78%", once: true }
      });
      gsap.from(safety.querySelector(".safety-visual"), {
        clipPath: "inset(12% 12% 12% 12% round 18px)",
        scale: 0.92, autoAlpha: 0, duration: 1.05, ease: "power3.out",
        scrollTrigger: { trigger: safety, start: "top 78%", once: true }
      });
      gsap.from(safety.querySelector(".safety-check"), {
        scale: 0.45, rotate: -24, autoAlpha: 0,
        duration: 1, ease: "back.out(1.7)",
        scrollTrigger: { trigger: safety, start: "top 70%", once: true }
      });
    }

    // Dashboard: card unfolds from a slight tilt; map route draws in.
    const dashboard = section.querySelector(".dashboard-showcase");
    if (dashboard) {
      gsap.from(dashboard.querySelector(".feature-copy"), {
        x: 48, autoAlpha: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: dashboard, start: "top 78%", once: true }
      });
      gsap.from(dashboard.querySelector(".dashboard-window"), {
        y: 48, rotate: 4, scale: 0.94, autoAlpha: 0,
        duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: dashboard, start: "top 78%", once: true }
      });
      gsap.from(dashboard.querySelector(".map-route"), {
        scaleX: 0, transformOrigin: "left center",
        duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: dashboard, start: "top 68%", once: true }
      });
    }

    // Gen Z: music disc spins into place; equalizer keeps its CSS motion.
    const genz = section.querySelector(".genz-showcase");
    if (genz) {
      gsap.from(genz.querySelector(".feature-copy"), {
        x: -42, autoAlpha: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: genz, start: "top 78%", once: true }
      });
      gsap.from(genz.querySelector(".music-disc"), {
        scale: 0.5, rotate: -55, autoAlpha: 0,
        duration: 1.15, ease: "back.out(1.35)",
        scrollTrigger: { trigger: genz, start: "top 78%", once: true }
      });
    }

    // Access: rows cascade in from alternating sides.
    const access = section.querySelector(".access-showcase");
    if (access) {
      gsap.from(access.querySelector(".feature-copy"), {
        x: 48, autoAlpha: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: access, start: "top 78%", once: true }
      });
      gsap.from(access.querySelectorAll(".permission-row"), {
        x: (i) => i % 2 ? 28 : -28,
        autoAlpha: 0, duration: 0.65, stagger: 0.13,
        ease: "power2.out",
        scrollTrigger: { trigger: access, start: "top 78%", once: true }
      });
    }

    window.addEventListener("load", () => window.ScrollTrigger.refresh(), { once: true });
  } else {
    // Native fallback: each panel reveals once, with a slight directional variation.
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("experience-visible");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.14, rootMargin: "0px 0px -35px 0px" });

      [section.querySelector(".experience-intro"), ...cards].filter(Boolean).forEach((el) => {
        el.classList.add("experience-motion-ready");
        io.observe(el);
      });
    }
  }
});
