/**
 * Quail Digital ISM - Lightweight Native SVG & CSS Chart Helpers
 * Zero external dependencies, crisp high-DPI rendering, instant responsive updates.
 */

const ChartHelper = {
  // Renders a Bar Chart for Jobs by Status
  renderJobsByStatusBar(container, jobs) {
    if (!container) return;
    
    // Group jobs by status
    const statusCounts = {
      "Created": 0,
      "Assigned": 0,
      "Scheduled": 0,
      "In Progress": 0,
      "Completed by Subcontractor": 0,
      "Verified/Closed": 0,
      "Rejected – Sent Back": 0
    };

    jobs.forEach(j => {
      if (statusCounts[j.status] !== undefined) {
        statusCounts[j.status]++;
      } else {
        statusCounts[j.status] = 1;
      }
    });

    const maxVal = Math.max(...Object.values(statusCounts), 5);

    const colors = {
      "Created": "#64748b",
      "Assigned": "#3b82f6",
      "Scheduled": "#8b5cf6",
      "In Progress": "#f59e0b",
      "Completed by Subcontractor": "#0ea5e9",
      "Verified/Closed": "#10b981",
      "Rejected – Sent Back": "#ef4444"
    };

    const shortLabels = {
      "Created": "Created",
      "Assigned": "Assigned",
      "Scheduled": "Scheduled",
      "In Progress": "In Progress",
      "Completed by Subcontractor": "Completed",
      "Verified/Closed": "Verified",
      "Rejected – Sent Back": "Rejected"
    };

    let html = `<div class="custom-bar-chart">`;
    Object.keys(statusCounts).forEach(st => {
      const count = statusCounts[st];
      const heightPercent = Math.max((count / maxVal) * 100, count > 0 ? 12 : 2);
      const color = colors[st] || "#0284c7";
      const shortLabel = shortLabels[st] || st;

      html += `
        <div class="bar-column" title="${st}: ${count} jobs">
          <div class="bar-pillar" style="height: ${heightPercent}%; background: ${color};">
            <span class="bar-pillar-value">${count}</span>
          </div>
          <span class="bar-label">${shortLabel}</span>
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
  },

  // Renders a Donut Chart for Installation vs Service Split
  renderInstallVsServiceDonut(container, jobs, tickets) {
    if (!container) return;

    const installCount = jobs.length;
    const ticketCount = tickets.length;
    const total = installCount + ticketCount;

    const installPct = total > 0 ? Math.round((installCount / total) * 100) : 50;
    const ticketPct = total > 0 ? 100 - installPct : 50;

    // SVG donut calculation: radius 70, circumference = 2 * PI * 70 ≈ 439.8
    const radius = 70;
    const circum = 2 * Math.PI * radius;
    const installStroke = (installPct / 100) * circum;
    const ticketStroke = circum - installStroke;

    const svg = `
      <div class="donut-wrapper">
        <div class="donut-svg-container">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <!-- Background circle -->
            <circle cx="90" cy="90" r="${radius}" fill="none" stroke="#f1f5f9" stroke-width="22" />
            <!-- Installation Segment (Cyan) -->
            <circle cx="90" cy="90" r="${radius}" fill="none" stroke="#0ea5e9" stroke-width="22"
                    stroke-dasharray="${installStroke} ${circum}" stroke-dashoffset="0"
                    transform="rotate(-90 90 90)" stroke-linecap="round" />
            <!-- Service Segment (Purple) -->
            <circle cx="90" cy="90" r="${radius}" fill="none" stroke="#8b5cf6" stroke-width="22"
                    stroke-dasharray="${ticketStroke} ${circum}" stroke-dashoffset="-${installStroke}"
                    transform="rotate(-90 90 90)" stroke-linecap="round" />
          </svg>
          <div class="donut-center-text">
            <div class="donut-total-number">${total}</div>
            <div class="donut-total-label">Total Volume</div>
          </div>
        </div>
        <div class="donut-legend">
          <div class="legend-item">
            <div class="legend-color-dot" style="background: #0ea5e9;"></div>
            <div>
              <strong>Installations (${installPct}%)</strong>
              <div style="font-size: 0.72rem; color: #64748b;">${installCount} field projects</div>
            </div>
          </div>
          <div class="legend-item">
            <div class="legend-color-dot" style="background: #8b5cf6;"></div>
            <div>
              <strong>Service Support (${ticketPct}%)</strong>
              <div style="font-size: 0.72rem; color: #64748b;">${ticketCount} active tickets</div>
            </div>
          </div>
        </div>
      </div>
    `;
    container.innerHTML = svg;
  },

  // Renders Customer Service Priority Heat Map
  renderPriorityHeatMap(container, tickets) {
    if (!container) return;

    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    tickets.forEach(t => {
      if (counts[t.priority] !== undefined) counts[t.priority]++;
    });

    const html = `
      <div class="heat-map-grid">
        <div class="heat-map-cell crit">
          <div class="heat-cell-title">Critical</div>
          <div class="heat-cell-count">${counts.Critical}</div>
          <div class="heat-cell-sla">SLA: 4h Resolution</div>
        </div>
        <div class="heat-map-cell high">
          <div class="heat-cell-title">High</div>
          <div class="heat-cell-count">${counts.High}</div>
          <div class="heat-cell-sla">SLA: 12h Resolution</div>
        </div>
        <div class="heat-map-cell med">
          <div class="heat-cell-title">Medium</div>
          <div class="heat-cell-count">${counts.Medium}</div>
          <div class="heat-cell-sla">SLA: 24h Resolution</div>
        </div>
        <div class="heat-map-cell low">
          <div class="heat-cell-title">Low</div>
          <div class="heat-cell-count">${counts.Low}</div>
          <div class="heat-cell-sla">SLA: 48h Resolution</div>
        </div>
      </div>
    `;
    container.innerHTML = html;
  }
};

window.ChartHelper = ChartHelper;
