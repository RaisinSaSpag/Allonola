/**
 * js/app.js
 * Core application initialization: theme controller, responsive navigation,
 * breadcrumbs generator, scroll-in reveal animations, and page orchestrator.
 */
"use strict";

(function () {
  window.Allonola = window.Allonola || {};
  window.Allonola.ui = window.Allonola.ui || {};

  // Theme Management (Dark by default, respects prefers-color-scheme on first visit)
  const THEME_STORAGE_KEY = "allonola_theme_preference";

  function getInitialTheme() {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch (e) {
      // localStorage unavailable or restricted
    }

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "dark";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      // ignore storage write errors
    }

    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
      const isLight = theme === "light";
      toggleBtn.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
      toggleBtn.setAttribute("title", isLight ? "Switch to dark theme" : "Switch to light theme");
      const sunIcon = toggleBtn.querySelector(".theme-icon-sun");
      const moonIcon = toggleBtn.querySelector(".theme-icon-moon");
      if (sunIcon && moonIcon) {
        sunIcon.style.display = isLight ? "none" : "block";
        moonIcon.style.display = isLight ? "block" : "none";
      }
    }

    // Trigger chart theme recalculation if charts exist
    if (window.Allonola.charts && typeof window.Allonola.charts.rebuildAll === "function") {
      window.Allonola.charts.rebuildAll();
    }
  }

  function initTheme() {
    const currentTheme = getInitialTheme();
    applyTheme(currentTheme);

    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const active = document.documentElement.getAttribute("data-theme") || "dark";
        const next = active === "dark" ? "light" : "dark";
        applyTheme(next);
      });
    }

    // Listen for OS scheme adjustments if user has not set explicit manual preference
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
        try {
          if (!localStorage.getItem(THEME_STORAGE_KEY)) {
            applyTheme(e.matches ? "light" : "dark");
          }
        } catch (err) {}
      });
    }
  }

  // Mobile Navigation and Hamburger Toggle
  function initNavigation() {
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const navDrawer = document.getElementById("nav-drawer");
    const mobileBackdrop = document.getElementById("nav-backdrop");

    if (hamburgerBtn && navDrawer) {
      function openMenu() {
        navDrawer.classList.add("nav-drawer--open");
        hamburgerBtn.setAttribute("aria-expanded", "true");
        if (mobileBackdrop) mobileBackdrop.classList.add("nav-backdrop--visible");
        document.body.classList.add("menu-open");
      }

      function closeMenu() {
        navDrawer.classList.remove("nav-drawer--open");
        hamburgerBtn.setAttribute("aria-expanded", "false");
        if (mobileBackdrop) mobileBackdrop.classList.remove("nav-backdrop--visible");
        document.body.classList.remove("menu-open");
      }

      hamburgerBtn.addEventListener("click", () => {
        const isOpen = navDrawer.classList.contains("nav-drawer--open");
        if (isOpen) closeMenu();
        else openMenu();
      });

      if (mobileBackdrop) {
        mobileBackdrop.addEventListener("click", closeMenu);
      }

      // Close when pressing Escape
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && navDrawer.classList.contains("nav-drawer--open")) {
          closeMenu();
          hamburgerBtn.focus();
        }
      });
    }

    // Algorithms Mobile Accordion Toggle
    const algoAccordionBtn = document.getElementById("algo-accordion-btn");
    const algoAccordionMenu = document.getElementById("algo-accordion-menu");
    if (algoAccordionBtn && algoAccordionMenu) {
      algoAccordionBtn.addEventListener("click", () => {
        const isExpanded = algoAccordionBtn.getAttribute("aria-expanded") === "true";
        algoAccordionBtn.setAttribute("aria-expanded", String(!isExpanded));
        algoAccordionMenu.hidden = isExpanded;
      });
    }

    // Algorithms Desktop Dropdown Hover/Focus Management
    const desktopDropdown = document.querySelector(".nav-dropdown");
    const dropdownToggle = document.querySelector(".nav-dropdown-toggle");
    if (desktopDropdown && dropdownToggle) {
      dropdownToggle.addEventListener("click", (e) => {
        e.preventDefault();
        const isOpen = desktopDropdown.classList.contains("nav-dropdown--open");
        if (isOpen) {
          desktopDropdown.classList.remove("nav-dropdown--open");
          dropdownToggle.setAttribute("aria-expanded", "false");
        } else {
          desktopDropdown.classList.add("nav-dropdown--open");
          dropdownToggle.setAttribute("aria-expanded", "true");
        }
      });

      // Close on outside click
      document.addEventListener("click", (e) => {
        if (!desktopDropdown.contains(e.target)) {
          desktopDropdown.classList.remove("nav-dropdown--open");
          dropdownToggle.setAttribute("aria-expanded", "false");
        }
      });
    }
  }

  // Scroll-in Fade-Up Observer (Disabled under prefers-reduced-motion)
  function initScrollAnimation() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const sections = document.querySelectorAll(".reveal-on-scroll");
    if (!sections.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0.1 }
    );

    sections.forEach((s) => observer.observe(s));
  }

  // Accessible Skip Link focus handler
  function initSkipLink() {
    const skipLink = document.querySelector(".skip-link");
    if (skipLink) {
      skipLink.addEventListener("click", (e) => {
        const target = document.getElementById("main-content");
        if (target) {
          target.setAttribute("tabindex", "-1");
          target.focus();
        }
      });
    }
  }

  // Wrap wide tables in a scrollable container so they scroll inside the card, not the page
  function initTableScroll() {
    document.querySelectorAll("table").forEach((table) => {
      const parent = table.parentElement;
      if (!parent || parent.classList.contains("table-scroll")) return;
      const wrap = document.createElement("div");
      wrap.className = "table-scroll";
      wrap.setAttribute("role", "region");
      wrap.setAttribute("tabindex", "0");
      wrap.setAttribute("aria-label", "Scrollable table");
      parent.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  // Global Page Lifecycle Dispatcher
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initNavigation();
    initScrollAnimation();
    initSkipLink();
    initTableScroll();
  });

  window.Allonola.ui = {
    applyTheme,
    getInitialTheme,
  };
})();
