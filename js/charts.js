/**
 * js/charts.js
 * Chart.js wrapper with CSS-token awareness, theme recalculation,
 * screen-reader accessibility summaries, and instance lifecycle management.
 */
"use strict";

(function () {
  window.Allonola = window.Allonola || {};
  window.Allonola.charts = window.Allonola.charts || {};

  // Registry holding active Chart.js instances and their rebuild parameters
  const chartRegistry = new Map();

  /**
   * Retrieves active color tokens from CSS custom properties.
   * @returns {Object}
   */
  function getTokens() {
    const root = getComputedStyle(document.documentElement);
    return {
      bg: root.getPropertyValue("--bg").trim() || "#0B1A2A",
      surface: root.getPropertyValue("--surface").trim() || "rgba(255,255,255,0.05)",
      surfaceSolid: root.getPropertyValue("--surface-solid").trim() || "#132638",
      border: root.getPropertyValue("--border").trim() || "rgba(74,159,216,0.25)",
      text: root.getPropertyValue("--text").trim() || "#F5F8FB",
      textMuted: root.getPropertyValue("--text-muted").trim() || "#A9BCCB",
      primary: root.getPropertyValue("--primary").trim() || "#4A9FD8",
      teal: root.getPropertyValue("--teal").trim() || "#2EC4B6",
      coral: root.getPropertyValue("--coral").trim() || "#F26B5B",
      success: root.getPropertyValue("--success").trim() || "#2EC4B6",
    };
  }

  /**
   * Safely destroys an existing chart instance registered to a canvas ID.
   * @param {string} canvasId
   */
  function destroyChart(canvasId) {
    if (chartRegistry.has(canvasId)) {
      const entry = chartRegistry.get(canvasId);
      if (entry.instance && typeof entry.instance.destroy === "function") {
        entry.instance.destroy();
      }
      chartRegistry.delete(canvasId);
    }
  }

  /**
   * Creates or replaces a Chart.js instance with standardized accessibility, styling, and fonts.
   *
   * @param {string} canvasId - DOM canvas ID
   * @param {Object} config - Standard Chart.js configuration
   * @param {Object} meta - Metadata { title, xLabel, yLabel, srSummary, buildFn }
   * @returns {Chart|null}
   */
  function createChart(canvasId, config, meta = {}) {
    if (typeof Chart === "undefined") {
      console.warn("Chart.js not loaded. Chart creation skipped for: " + canvasId);
      return null;
    }

    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    destroyChart(canvasId);

    const tokens = getTokens();

    // Default chart configuration overrides for accessibility and consistent aesthetics
    const mergedOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 400,
      },
      plugins: {
        legend: {
          display: config.data && config.data.datasets && config.data.datasets.length > 1,
          labels: {
            color: tokens.text,
            font: { family: "'Open Sans', sans-serif", size: 12 },
          },
        },
        title: {
          display: !!meta.title,
          text: meta.title || "",
          color: tokens.text,
          font: { family: "'Montserrat', sans-serif", size: 14, weight: "600" },
          padding: { bottom: 12 },
        },
        tooltip: {
          backgroundColor: tokens.surfaceSolid,
          titleColor: tokens.text,
          bodyColor: tokens.text,
          borderColor: tokens.border,
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          titleFont: { family: "'Montserrat', sans-serif", weight: "600" },
          bodyFont: { family: "'Open Sans', sans-serif" },
        },
        ...((config.options && config.options.plugins) || {}),
      },
      scales: {
        x: {
          ticks: {
            color: tokens.textMuted,
            font: { family: "'Open Sans', sans-serif", size: 11 },
          },
          grid: {
            color: "rgba(74,159,216,0.1)",
          },
          title: meta.xLabel
            ? {
                display: true,
                text: meta.xLabel,
                color: tokens.textMuted,
                font: { family: "'Open Sans', sans-serif", size: 12 },
              }
            : { display: false },
          ...((config.options && config.options.scales && config.options.scales.x) || {}),
        },
        y: {
          ticks: {
            color: tokens.textMuted,
            font: { family: "'Open Sans', sans-serif", size: 11 },
          },
          grid: {
            color: "rgba(74,159,216,0.1)",
          },
          title: meta.yLabel
            ? {
                display: true,
                text: meta.yLabel,
                color: tokens.textMuted,
                font: { family: "'Open Sans', sans-serif", size: 12 },
              }
            : { display: false },
          ...((config.options && config.options.scales && config.options.scales.y) || {}),
        },
        ...((config.options && config.options.scales) || {}),
      },
      ...((config.options) || {}),
    };

    // If pie or doughnut, remove Cartesian x/y scale definitions
    if (config.type === "pie" || config.type === "doughnut") {
      delete mergedOptions.scales;
    }

    const finalConfig = {
      ...config,
      options: mergedOptions,
    };

    const instance = new Chart(canvas, finalConfig);

    // Register instance and builder function for theme changes
    chartRegistry.set(canvasId, {
      instance,
      meta,
      buildFn: meta.buildFn || null,
      config: finalConfig,
    });

    // Populate or update screen-reader summary & figcaption
    ensureAccessibilityMarkup(canvas, meta);

    return instance;
  }

  /**
   * Attaches or updates visually hidden screen-reader text and figcaption.
   * @param {HTMLCanvasElement} canvas
   * @param {Object} meta
   */
  function ensureAccessibilityMarkup(canvas, meta) {
    const parent = canvas.closest("figure") || canvas.parentElement;
    if (!parent) return;

    // Check for existing screen reader text container
    let sr = parent.querySelector(".sr-only-chart-summary");
    if (!sr) {
      sr = document.createElement("div");
      sr.className = "sr-only sr-only-chart-summary";
      sr.setAttribute("aria-live", "polite");
      canvas.parentNode.insertBefore(sr, canvas);
    }
    sr.textContent = meta.srSummary || meta.title || "Illustrative chart visualization.";

    // Ensure figcaption is present with illustrative disclaimer
    let caption = parent.querySelector("figcaption");
    if (!caption) {
      caption = document.createElement("figcaption");
      caption.className = "chart-figcaption text-muted text-small";
      parent.appendChild(caption);
    }
    caption.textContent = (meta.title ? meta.title + " — " : "") + "Illustrative / synthetically generated sample data.";
  }

  /**
   * Rebuilds all registered charts when theme changes.
   */
  function rebuildAll() {
    // Iterate over a snapshot: rebuilding a chart deletes and re-adds its registry entry,
    // and a Map visits entries added during iteration, which would loop forever.
    Array.from(chartRegistry.values()).forEach((entry) => {
      if (typeof entry.buildFn === "function") {
        entry.buildFn();
      }
    });
  }

  window.Allonola.charts = {
    getTokens,
    destroyChart,
    createChart,
    rebuildAll,
  };
})();
