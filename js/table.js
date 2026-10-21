/**
 * js/table.js
 * Generates accessible HTML tables from chart or dataset structures,
 * and provides "View as table" accessible toggles for screen reader and keyboard accessibility.
 */
"use strict";

(function () {
  window.Allonola = window.Allonola || {};
  window.Allonola.table = window.Allonola.table || {};

  /**
   * Renders an accessible HTML table into a target DOM container.
   *
   * @param {Object} options
   * @param {string} options.caption - Table caption (describes dataset & notes synthetic nature)
   * @param {Array<{ key: string, label: string }>} options.columns - Column headers
   * @param {Array<Object>} options.rows - Data objects
   * @param {HTMLElement|string} options.container - DOM container element or selector
   * @returns {HTMLTableElement}
   */
  function renderTable({ caption, columns, rows, container }) {
    const parent = typeof container === "string" ? document.querySelector(container) : container;
    if (!parent) return null;

    const wrapper = document.createElement("div");
    wrapper.className = "table-responsive-wrapper";
    wrapper.setAttribute("tabindex", "0");
    wrapper.setAttribute("role", "region");
    wrapper.setAttribute("aria-label", caption + " scrollable data table");

    const table = document.createElement("table");
    table.className = "data-table";

    // Caption
    const captionEl = document.createElement("caption");
    captionEl.textContent = caption;
    table.appendChild(captionEl);

    // Thead
    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    columns.forEach((col) => {
      const th = document.createElement("th");
      th.setAttribute("scope", "col");
      th.textContent = col.label;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    // Tbody
    const tbody = document.createElement("tbody");
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      columns.forEach((col, idx) => {
        if (idx === 0) {
          const th = document.createElement("th");
          th.setAttribute("scope", "row");
          th.textContent = row[col.key] !== undefined ? row[col.key] : "";
          tr.appendChild(th);
        } else {
          const td = document.createElement("td");
          td.textContent = row[col.key] !== undefined ? row[col.key] : "";
          tr.appendChild(td);
        }
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    wrapper.appendChild(table);
    parent.innerHTML = "";
    parent.appendChild(wrapper);

    return table;
  }

  /**
   * Attaches an accessible "View as table" toggle button to a figure container containing a canvas.
   *
   * @param {string} figureId - The figure or chart card element ID
   * @param {Function} dataProvider - Function returning { caption, columns, rows }
   */
  function attachChartTableToggle(figureId, dataProvider) {
    const container = document.getElementById(figureId);
    if (!container) return;

    // Check if toggle container already exists
    let toggleBtn = container.querySelector(".chart-table-toggle-btn");
    let tableContainer = container.querySelector(".chart-table-view");

    if (!toggleBtn) {
      const controlBar = document.createElement("div");
      controlBar.className = "chart-table-controls";

      toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = "btn btn--subtle btn--small chart-table-toggle-btn";
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.innerHTML = `
        <svg class="icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="3" y1="15" x2="21" y2="15"></line>
          <line x1="9" y1="3" x2="9" y2="21"></line>
          <line x1="15" y1="3" x2="15" y2="21"></line>
        </svg>
        <span>View as table</span>
      `;

      tableContainer = document.createElement("div");
      tableContainer.className = "chart-table-view";
      tableContainer.hidden = true;

      controlBar.appendChild(toggleBtn);
      container.appendChild(controlBar);
      container.appendChild(tableContainer);

      toggleBtn.addEventListener("click", () => {
        const isHidden = tableContainer.hidden;
        tableContainer.hidden = !isHidden;
        toggleBtn.setAttribute("aria-expanded", String(isHidden));
        const btnSpan = toggleBtn.querySelector("span");

        if (isHidden) {
          if (btnSpan) btnSpan.textContent = "Hide table";
          // Render table if not already populated
          if (!tableContainer.hasChildNodes()) {
            const data = dataProvider();
            renderTable({
              caption: data.caption,
              columns: data.columns,
              rows: data.rows,
              container: tableContainer,
            });
          }
        } else {
          if (btnSpan) btnSpan.textContent = "View as table";
        }
      });
    }
  }

  window.Allonola.table = {
    renderTable,
    attachChartTableToggle,
  };
})();
