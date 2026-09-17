/**
 * Quail Digital ISM - Core Application Controller
 * High-fidelity Prototype modeling Zoho Creator Enterprise (Premium Tier) with Kendo UI widgets.
 */

document.addEventListener("DOMContentLoaded", () => {
  const store = window.appStore;
  const ChartHelper = window.ChartHelper;

  // DOM Elements
  const elSidebarNav = document.getElementById("sidebar-nav");
  const elContentCanvas = document.getElementById("content-canvas");
  const elViewTitle = document.getElementById("view-title");
  const elViewDescription = document.getElementById("view-description");
  const elBreadcrumbs = document.getElementById("breadcrumbs");
  const elHeaderActions = document.getElementById("header-actions");
  const elViewBody = document.getElementById("view-body");
  
  const elRoleTabs = document.querySelectorAll(".role-tab-btn");
  const elUserAvatar = document.getElementById("user-avatar");
  const elUserName = document.getElementById("user-name");
  const elUserRoleLabel = document.getElementById("user-role-label");
  const elNotifBellBtn = document.getElementById("notif-bell-btn");
  const elNotifBadge = document.getElementById("notif-badge");
  const elNotifDropdown = document.getElementById("notif-dropdown");
  const elEmailLogBtn = document.getElementById("email-log-btn");
  const elGlobalSearch = document.getElementById("global-search-input");
  
  const elModalRoot = document.getElementById("modal-root");
  const elDrawerRoot = document.getElementById("drawer-root");

  // State subscriptions
  store.subscribe("roleChanged", () => {
    updateTopBarUser();
    renderSidebar();
    renderCurrentView();
    updateNotificationBadge();
  });

  store.subscribe("viewChanged", () => {
    renderSidebar();
    renderCurrentView();
  });

  store.subscribe("jobUpdated", () => {
    renderCurrentView();
    updateNotificationBadge();
  });

  store.subscribe("ticketUpdated", () => {
    renderCurrentView();
    updateNotificationBadge();
  });

  store.subscribe("notificationsUpdated", () => {
    updateNotificationBadge();
  });

  // Topbar Event Listeners
  elRoleTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetRole = btn.dataset.role;
      elRoleTabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      store.setRole(targetRole);
    });
  });

  elNotifBellBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleNotificationDropdown();
  });

  document.addEventListener("click", (e) => {
    if (!elNotifDropdown.contains(e.target) && e.target !== elNotifBellBtn) {
      elNotifDropdown.classList.add("hidden");
    }
  });

  elEmailLogBtn.addEventListener("click", () => {
    openEmailLogDrawer();
  });

  elGlobalSearch.addEventListener("input", (e) => {
    store.searchQuery = e.target.value.trim().toLowerCase();
    renderCurrentView();
  });

  // Update topbar user details
  function updateTopBarUser() {
    const user = store.getUser();
    elUserAvatar.textContent = user.avatar;
    elUserName.textContent = user.name;
    elUserRoleLabel.textContent = user.title;

    elRoleTabs.forEach(tab => {
      tab.classList.toggle("active", tab.dataset.role === store.activeRole);
    });
  }

  function updateNotificationBadge() {
    const count = store.getUnreadNotificationsCount();
    if (count > 0) {
      elNotifBadge.textContent = count;
      elNotifBadge.classList.remove("hidden");
    } else {
      elNotifBadge.classList.add("hidden");
    }
  }

  // Sidebar Menu Configuration per Role
  function getNavigationForRole(role) {
    const pendingVerificationCount = store.getJobs().filter(j => j.status === "Completed by Subcontractor").length;
    const rejectedJobsCount = store.getJobs().filter(j => j.status === "Rejected – Sent Back").length;
    const openTicketsCount = store.getTickets().filter(t => t.status !== "Closed" && t.status !== "Resolved").length;

    if (role === "pm") {
      return [
        { section: "Main" },
        { id: "dashboard", label: "Executive Dashboard", icon: "layout-dashboard" },
        { id: "verification_queue", label: "Verification Quality Gate", icon: "shield-check", badge: pendingVerificationCount, badgeClass: "alert" },
        { id: "jobs", label: "Installation Jobs", icon: "wrench", badge: store.getJobs().length },
        { section: "Master Records" },
        { id: "customers", label: "Customers & Stores", icon: "building-2" },
        { id: "products", label: "Product & Packages", icon: "headset" },
        { id: "subcontractors", label: "Subcontractor Master", icon: "users" },
        { section: "After-Sales Support" },
        { id: "tickets", label: "Support & RMA Tickets", icon: "ticket", badge: openTicketsCount, badgeClass: "info" },
        { section: "Data Management" },
        { id: "bulk_import", label: "Bulk Import Wizard", icon: "file-spreadsheet" }
      ];
    } else if (role === "subcontractor") {
      return [
        { section: "Field Portal" },
        { id: "dashboard", label: "Subcontractor Hub", icon: "layout-dashboard" },
        { id: "rejected_queue", label: "Urgent: Rejected Jobs", icon: "alert-triangle", badge: rejectedJobsCount, badgeClass: "alert" },
        { id: "jobs", label: "My Assigned Jobs", icon: "clipboard-list", badge: store.getJobs().filter(j => j.assignedSubcontractorId === "SUB-01").length },
        { id: "field_record", label: "Submit Install Record", icon: "file-check-2" },
        { section: "Field Support" },
        { id: "tickets", label: "Onsite Service Visits", icon: "ticket", badge: store.getTickets().filter(t => t.resolutionPath === "onsite").length }
      ];
    } else {
      // Customer Service
      return [
        { section: "Service Desk" },
        { id: "dashboard", label: "Customer Service Hub", icon: "layout-dashboard" },
        { id: "tickets", label: "Support Tickets & RMA", icon: "ticket", badge: openTicketsCount, badgeClass: "warning" },
        { section: "Lookups" },
        { id: "customers", label: "Customer Directory", icon: "building-2" },
        { id: "jobs", label: "Installation History", icon: "history" },
        { id: "products", label: "Hardware Spares Catalog", icon: "headset" }
      ];
    }
  }

  function renderSidebar() {
    const navItems = getNavigationForRole(store.activeRole);
    let html = "";

    navItems.forEach(item => {
      if (item.section) {
        html += `<div class="nav-section-title">${item.section}</div>`;
      } else {
        const isActive = store.activeView === item.id;
        const iconSvg = getIconSvg(item.icon);
        const badgeHtml = item.badge && item.badge > 0 ? `<span class="nav-badge ${item.badgeClass || 'info'}">${item.badge}</span>` : "";

        html += `
          <div class="nav-item ${isActive ? 'active' : ''}" data-view="${item.id}">
            <div class="nav-item-content">
              <span class="nav-item-icon">${iconSvg}</span>
              <span>${item.label}</span>
            </div>
            ${badgeHtml}
          </div>
        `;
      }
    });

    elSidebarNav.innerHTML = html;

    // Attach click handlers to nav items
    elSidebarNav.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", () => {
        const viewId = item.dataset.view;
        store.setView(viewId);
      });
    });
  }

  // View Dispatcher
  function renderCurrentView() {
    const role = store.activeRole;
    const view = store.activeView;

    switch (view) {
      case "dashboard":
        if (role === "pm") renderPMDashboard();
        else if (role === "subcontractor") renderSubcontractorDashboard();
        else renderCSDashboard();
        break;

      case "customers":
        renderCustomersView();
        break;

      case "products":
        renderProductsView();
        break;

      case "subcontractors":
        renderSubcontractorsView();
        break;

      case "jobs":
        renderJobsView();
        break;

      case "verification_queue":
        renderVerificationQueueView();
        break;

      case "rejected_queue":
        renderRejectedQueueView();
        break;

      case "field_record":
        renderFieldRecordView();
        break;

      case "tickets":
        renderTicketsView();
        break;

      case "bulk_import":
        openBulkImportModal();
        break;

      default:
        renderPMDashboard();
    }
  }

  /* ==========================================================================
     VIEWS: 1. Project Management Dashboard (Module 8.2.9)
     ========================================================================== */
  function renderPMDashboard() {
    elBreadcrumbs.innerHTML = `<span>Platform</span> <span>›</span> <span class="breadcrumb-active">Executive Dashboard</span>`;
    elViewTitle.innerHTML = `<span>Project Management & Quality Gate</span> <span class="brand-edition">Zoho Analytics</span>`;
    elViewDescription.textContent = "Real-time visibility across customer store onboarding, field subcontractor installations, and quality gates.";

    elHeaderActions.innerHTML = `
      <button class="btn btn-secondary" id="btn-export-report">
        ${getIconSvg("download")} Export Reports
      </button>
      <button class="btn btn-secondary" id="btn-schedule-report">
        ${getIconSvg("clock")} Schedule Email Report
      </button>
      <button class="btn btn-primary" id="btn-new-job-intake">
        ${getIconSvg("plus")} New Job Intake
      </button>
    `;

    document.getElementById("btn-new-job-intake").addEventListener("click", () => openNewJobModal());
    document.getElementById("btn-export-report").addEventListener("click", () => exportDataModal("PM Executive Report"));
    document.getElementById("btn-schedule-report").addEventListener("click", () => openScheduleReportModal());

    const jobs = store.getJobs();
    const tickets = store.getTickets();
    const pendingVerification = jobs.filter(j => j.status === "Completed by Subcontractor");
    const activeJobs = jobs.filter(j => j.status !== "Verified/Closed");
    const completedThisMonth = jobs.filter(j => j.status === "Verified/Closed");

    let html = `
      <!-- KPI Stats Grid -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Active Field Jobs</span>
            <div class="kpi-icon-box kpi-icon-blue">${getIconSvg("wrench")}</div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${activeJobs.length}</span>
            <span class="kpi-trend positive">↑ 12% vs last mo</span>
          </div>
          <span class="kpi-subtext">Across 5 retail enterprise accounts</span>
        </div>

        <div class="kpi-card kpi-attention" style="cursor: pointer;" id="kpi-card-verification">
          <div class="kpi-card-header">
            <span class="kpi-title">Pending Verification</span>
            <div class="kpi-icon-box kpi-icon-amber">${getIconSvg("shield-alert")}</div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value" style="color: #0284c7;">${pendingVerification.length}</span>
            <span class="kpi-trend ${pendingVerification.length > 0 ? 'positive' : 'neutral'}">Action Needed</span>
          </div>
          <span class="kpi-subtext" style="color: #0284c7; font-weight: 600;">Awaiting PM Quality Sign-off →</span>
        </div>

        <div class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Verified & Closed</span>
            <div class="kpi-icon-box kpi-icon-green">${getIconSvg("check-circle-2")}</div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${completedThisMonth.length}</span>
            <span class="kpi-trend positive">100% QA Passed</span>
          </div>
          <span class="kpi-subtext">Successfully deployed to stores</span>
        </div>

        <div class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Open Support Tickets</span>
            <div class="kpi-icon-box kpi-icon-purple">${getIconSvg("ticket")}</div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${tickets.filter(t => t.status !== "Closed").length}</span>
            <span class="kpi-trend neutral">Avg SLA 98.2%</span>
          </div>
          <span class="kpi-subtext">2 In-House RMA, 1 On-site Visit</span>
        </div>
      </div>

      <!-- Embedded Zoho Analytics Ribbon -->
      <div class="zoho-analytics-ribbon">
        <div class="ribbon-brand">
          <span class="ribbon-logo">ZOHO Analytics</span>
          <span class="ribbon-text">Enterprise Tier Workspace: Quail Digital UK National Rollouts (Synced Live)</span>
        </div>
        <button class="btn btn-sm btn-ghost" style="color: #38bdf8;" id="btn-refresh-analytics">
          ${getIconSvg("refresh-cw")} Refresh Pipeline
        </button>
      </div>

      <!-- Charts Row -->
      <div class="charts-grid-2">
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">
              ${getIconSvg("bar-chart-2")} Installation Jobs by Lifecycle Status
            </div>
            <span class="chart-subtitle">Live State Machine</span>
          </div>
          <div id="chart-jobs-status"></div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">
              ${getIconSvg("pie-chart")} Rollout vs Service Volume Split
            </div>
            <span class="chart-subtitle">YTD Operational Load</span>
          </div>
          <div id="chart-install-service"></div>
        </div>
      </div>

      <!-- Quick Action Table: Jobs Requiring Immediate PM Attention -->
      <div class="kendo-grid-container">
        <div class="grid-toolbar">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <strong>Jobs Awaiting Quality Gate Approval</strong>
            <span class="badge badge-status-completed">${pendingVerification.length} In Queue</span>
          </div>
          <button class="btn btn-sm btn-primary" id="btn-view-all-queue">
            Open Verification Queue
          </button>
        </div>
        <div class="kendo-table-wrapper">
          <table class="kendo-table">
            <thead>
              <tr>
                <th>Job #</th>
                <th>Customer & Location</th>
                <th>Package Deployed</th>
                <th>Subcontractor</th>
                <th>Submission Date</th>
                <th>Evidence Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${pendingVerification.length === 0 ? `
                <tr><td colspan="7" style="text-align: center; color: #64748b; padding: 2rem;">No jobs pending verification at this time.</td></tr>
              ` : pendingVerification.map(job => `
                <tr>
                  <td><strong>${job.jobNumber}</strong></td>
                  <td>
                    <div><strong>${job.customerName}</strong></div>
                    <div style="font-size: 0.74rem; color: #64748b;">${job.locationName}</div>
                  </td>
                  <td>${job.packageName}</td>
                  <td>${job.assignedSubcontractorName} (${job.technicianDetails?.techName || 'Tech'})</td>
                  <td>${job.completedDate || '2026-09-16'}</td>
                  <td>
                    <span class="badge badge-status-verified">
                      ${getIconSvg("image")} ${job.photos?.length || 2} Photos (Annotated)
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-sm btn-primary btn-inspect-job" data-id="${job.id}">
                      Inspect & Verify
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    elViewBody.innerHTML = html;

    // Render Charts
    ChartHelper.renderJobsByStatusBar(document.getElementById("chart-jobs-status"), jobs);
    ChartHelper.renderInstallVsServiceDonut(document.getElementById("chart-install-service"), jobs, tickets);

    // Click handlers
    document.getElementById("kpi-card-verification")?.addEventListener("click", () => {
      store.setView("verification_queue");
    });
    document.getElementById("btn-view-all-queue")?.addEventListener("click", () => {
      store.setView("verification_queue");
    });
    document.querySelectorAll(".btn-inspect-job").forEach(btn => {
      btn.addEventListener("click", () => {
        openVerificationDetailModal(btn.dataset.id);
      });
    });
    document.getElementById("btn-refresh-analytics")?.addEventListener("click", () => {
      renderPMDashboard();
    });
  }

  /* ==========================================================================
     VIEWS: 2. Subcontractor Workload Hub (Module 8.2.9)
     ========================================================================== */
  function renderSubcontractorDashboard() {
    elBreadcrumbs.innerHTML = `<span>Field Operations</span> <span>›</span> <span class="breadcrumb-active">Subcontractor Portal</span>`;
    elViewTitle.innerHTML = `<span>Apex Telecom Solutions Portal</span> <span class="badge badge-status-verified">Active Partner</span>`;
    elViewDescription.textContent = "View assigned store locations, schedule install dates, record field completion with photos, and resolve site fixes.";

    elHeaderActions.innerHTML = `
      <button class="btn btn-primary" id="btn-quick-field-record">
        ${getIconSvg("file-check-2")} Submit Field Record
      </button>
    `;

    document.getElementById("btn-quick-field-record").addEventListener("click", () => {
      store.setView("field_record");
    });

    const myJobs = store.getJobs().filter(j => j.assignedSubcontractorId === "SUB-01");
    const rejectedJobs = store.getJobs().filter(j => j.status === "Rejected – Sent Back");
    const pendingSchedule = myJobs.filter(j => j.status === "Assigned");
    const myTickets = store.getTickets().filter(t => t.assignedSubcontractorId === "SUB-01" && t.status !== "Closed");

    let html = `
      <!-- Urgent Rejection Callout if any -->
      ${rejectedJobs.length > 0 ? `
        <div class="alert-banner urgent-rejection">
          <div class="alert-banner-icon">${getIconSvg("alert-triangle")}</div>
          <div class="alert-banner-content">
            <div class="alert-banner-title">ACTION REQUIRED: 1 Field Installation Rejected by PM Quality Gate</div>
            <div class="alert-banner-desc">
              <strong>${rejectedJobs[0].jobNumber} - ${rejectedJobs[0].locationName}</strong><br/>
              Reason: "${rejectedJobs[0].rejectionReason}"
            </div>
            <div style="margin-top: 0.75rem;">
              <button class="btn btn-sm btn-danger btn-fix-rejected" data-id="${rejectedJobs[0].id}">
                Review PM Notes & Resubmit
              </button>
            </div>
          </div>
        </div>
      ` : ""}

      <div class="kpi-grid">
        <div class="kpi-card ${rejectedJobs.length > 0 ? 'kpi-urgent' : ''}">
          <div class="kpi-card-header">
            <span class="kpi-title">Rejected / Action Needed</span>
            <div class="kpi-icon-box kpi-icon-red">${getIconSvg("alert-circle")}</div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value" style="color: ${rejectedJobs.length > 0 ? '#ef4444' : '#0f172a'};">${rejectedJobs.length}</span>
            <span class="kpi-trend ${rejectedJobs.length > 0 ? 'negative' : 'positive'}">
              ${rejectedJobs.length > 0 ? 'Resubmission Required' : 'Clean Record'}
            </span>
          </div>
          <span class="kpi-subtext">Quality Gate feedback from PM</span>
        </div>

        <div class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Awaiting Schedule Date</span>
            <div class="kpi-icon-box kpi-icon-blue">${getIconSvg("calendar")}</div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${pendingSchedule.length}</span>
            <span class="kpi-trend neutral">Confirm with Store</span>
          </div>
          <span class="kpi-subtext">Click to pick target date</span>
        </div>

        <div class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">On-Site Service Tickets</span>
            <div class="kpi-icon-box kpi-icon-purple">${getIconSvg("ticket")}</div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${myTickets.length}</span>
            <span class="kpi-trend positive">SLA: 98.4%</span>
          </div>
          <span class="kpi-subtext">Assigned field support visits</span>
        </div>

        <div class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Completed This Month</span>
            <div class="kpi-icon-box kpi-icon-green">${getIconSvg("award")}</div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">12</span>
            <span class="kpi-trend positive">£4,850 Completed</span>
          </div>
          <span class="kpi-subtext">SLA Turnaround: 2.1 days</span>
        </div>
      </div>

      <!-- My Active Work Orders -->
      <div class="kendo-grid-container">
        <div class="grid-toolbar">
          <strong>Assigned Work Orders & Site Installations</strong>
          <div class="grid-toolbar-actions">
            <button class="btn btn-sm btn-secondary" id="btn-filter-assigned">All Active</button>
          </div>
        </div>
        <div class="kendo-table-wrapper">
          <table class="kendo-table">
            <thead>
              <tr>
                <th>Job #</th>
                <th>Store Location</th>
                <th>Package Deployed</th>
                <th>Target Date</th>
                <th>Lifecycle Status</th>
                <th style="text-align: right;">Field Action</th>
              </tr>
            </thead>
            <tbody>
              ${myJobs.map(j => {
                let actionBtn = "";
                if (j.status === "Assigned") {
                  actionBtn = `<button class="btn btn-sm btn-secondary btn-schedule-job" data-id="${j.id}">Confirm Date</button>`;
                } else if (j.status === "Scheduled" || j.status === "In Progress") {
                  actionBtn = `<button class="btn btn-sm btn-primary btn-fill-record" data-id="${j.id}">Fill Install Record</button>`;
                } else if (j.status === "Completed by Subcontractor") {
                  actionBtn = `<span class="badge badge-status-completed">In PM Review</span>`;
                } else if (j.status === "Verified/Closed") {
                  actionBtn = `<span class="badge badge-status-verified">Verified & Closed</span>`;
                } else if (j.status === "Rejected – Sent Back") {
                  actionBtn = `<button class="btn btn-sm btn-danger btn-fix-rejected" data-id="${j.id}">Fix & Resubmit</button>`;
                }

                return `
                  <tr class="${j.status === 'Rejected – Sent Back' ? 'row-urgent' : ''}">
                    <td><strong>${j.jobNumber}</strong></td>
                    <td>
                      <div><strong>${j.locationName}</strong></div>
                      <div style="font-size: 0.74rem; color: #64748b;">${j.locationAddress}</div>
                    </td>
                    <td>${j.packageName} (${j.quantity} units)</td>
                    <td>${j.scheduledDate ? `<strong>${j.scheduledDate}</strong>` : `<span style="color: #d97706; font-style: italic;">Unscheduled</span>`}</td>
                    <td>${getStatusBadge(j.status)}</td>
                    <td style="text-align: right;">${actionBtn}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    elViewBody.innerHTML = html;

    // Subcontractor action clicks
    document.querySelectorAll(".btn-schedule-job").forEach(b => {
      b.addEventListener("click", () => openScheduleCalendarModal(b.dataset.id));
    });
    document.querySelectorAll(".btn-fill-record").forEach(b => {
      b.addEventListener("click", () => {
        store.setView("field_record", { jobId: b.dataset.id });
      });
    });
    document.querySelectorAll(".btn-fix-rejected").forEach(b => {
      b.addEventListener("click", () => {
        store.setView("field_record", { jobId: b.dataset.id });
      });
    });
  }

  /* ==========================================================================
     VIEWS: 3. Customer Service Desk (Module 8.2.9)
     ========================================================================== */
  function renderCSDashboard() {
    elBreadcrumbs.innerHTML = `<span>Service Desk</span> <span>›</span> <span class="breadcrumb-active">Operations Hub</span>`;
    elViewTitle.innerHTML = `<span>Customer Service & RMA Lab</span> <span class="badge badge-status-scheduled">Dual Resolution Tracks</span>`;
    elViewDescription.textContent = "Manage after-sales support tickets across both On-Site Subcontractor resolution and In-House Repair (RMA) workflows.";

    elHeaderActions.innerHTML = `
      <button class="btn btn-primary" id="btn-raise-ticket">
        ${getIconSvg("plus")} Raise Support Ticket
      </button>
    `;

    document.getElementById("btn-raise-ticket").addEventListener("click", () => openNewTicketModal());

    const tickets = store.getTickets();
    const openTickets = tickets.filter(t => t.status !== "Closed");

    let html = `
      <!-- Priority Heat Map (Module 8.2.9) -->
      <div class="chart-card" style="margin-bottom: 1.5rem;">
        <div class="chart-header">
          <div class="chart-title">${getIconSvg("flame")} Live Priority Request Matrix</div>
          <span class="chart-subtitle">Real-time SLA Target Heatmap</span>
        </div>
        <div id="cs-priority-heatmap"></div>
      </div>

      <!-- Quick Resolution Tracker -->
      <div class="kendo-grid-container">
        <div class="grid-toolbar">
          <strong>Active Support Incidents & Repair Workflows</strong>
          <span class="badge badge-priority-medium">${openTickets.length} Active</span>
        </div>
        <div class="kendo-table-wrapper">
          <table class="kendo-table">
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Customer & Store</th>
                <th>Resolution Path</th>
                <th>Issue Summary</th>
                <th>Priority</th>
                <th>Status / Sub-status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${tickets.map(t => `
                <tr>
                  <td><strong>${t.ticketNumber}</strong></td>
                  <td>
                    <div><strong>${t.customerName}</strong></div>
                    <div style="font-size: 0.74rem; color: #64748b;">${t.locationName}</div>
                  </td>
                  <td>
                    ${t.resolutionPath === 'inhouse' ? 
                      `<span class="badge badge-status-scheduled">${getIconSvg("box")} In-House Repair (RMA)</span>` : 
                      `<span class="badge badge-status-assigned">${getIconSvg("wrench")} On-Site Field Fix</span>`}
                  </td>
                  <td style="max-width: 260px;">
                    <div class="truncate">${t.issueDescription}</div>
                    <div style="font-size: 0.72rem; color: #64748b;">Job: ${t.originatingJobId}</div>
                  </td>
                  <td>${getPriorityBadge(t.priority)}</td>
                  <td>${getTicketStatusBadge(t.status, t.resolutionPath)}</td>
                  <td style="text-align: right;">
                    <button class="btn btn-sm btn-secondary btn-view-ticket" data-id="${t.id}">
                      Manage Workflow
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    elViewBody.innerHTML = html;
    ChartHelper.renderPriorityHeatMap(document.getElementById("cs-priority-heatmap"), tickets);

    document.querySelectorAll(".btn-view-ticket").forEach(b => {
      b.addEventListener("click", () => openTicketDetailModal(b.dataset.id));
    });
  }

  /* ==========================================================================
     VIEWS: 4. Customers & Store Location Management (Module 8.2.1)
     ========================================================================== */
  function renderCustomersView() {
    elBreadcrumbs.innerHTML = `<span>Master Records</span> <span>›</span> <span class="breadcrumb-active">Customers & Locations</span>`;
    elViewTitle.innerHTML = `<span>Business Customers & Store Locations</span> <span class="badge badge-status-created">${store.getCustomers().length} Accounts</span>`;
    elViewDescription.textContent = "Maintain enterprise retail customer accounts and multi-branch store locations with integrated service histories.";

    elHeaderActions.innerHTML = `
      <button class="btn btn-secondary" id="btn-toggle-filter">
        ${getIconSvg("filter")} Filter Panel
      </button>
      <button class="btn btn-secondary" id="btn-bulk-import-cust">
        ${getIconSvg("file-up")} Bulk Import
      </button>
      <button class="btn btn-primary" id="btn-add-customer-intake">
        ${getIconSvg("plus")} New Customer Intake
      </button>
    `;

    document.getElementById("btn-add-customer-intake").addEventListener("click", () => openCustomerIntakeWizard());
    document.getElementById("btn-bulk-import-cust").addEventListener("click", () => openBulkImportModal());
    document.getElementById("btn-toggle-filter").addEventListener("click", () => openCustomerFilterDrawer());

    const customers = store.getCustomers();
    const locations = store.getStoreLocations();

    let html = `
      <div class="kendo-grid-container">
        <div class="grid-toolbar">
          <div class="grid-search">
            <span class="grid-search-icon">${getIconSvg("search")}</span>
            <input type="text" id="cust-search-input" placeholder="Search customer, account code, contact..." value="${store.searchQuery}">
          </div>
          <div class="grid-toolbar-actions">
            <button class="btn btn-sm btn-secondary" id="btn-export-customers">Export CSV</button>
          </div>
        </div>
        <div class="kendo-table-wrapper">
          <table class="kendo-table">
            <thead>
              <tr>
                <th>Customer / Company</th>
                <th>Account Code</th>
                <th>Tier</th>
                <th>Primary Contact</th>
                <th>Store Branches</th>
                <th>Active Jobs</th>
                <th>Tickets</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${customers.map(c => `
                <tr>
                  <td>
                    <div><strong>${c.companyName}</strong></div>
                    <div style="font-size: 0.74rem; color: #64748b;">${c.billingAddress}</div>
                  </td>
                  <td><span class="mono">${c.accountCode}</span></td>
                  <td><span class="badge badge-status-scheduled">${c.tier}</span></td>
                  <td>
                    <div>${c.primaryContact}</div>
                    <div style="font-size: 0.72rem; color: #64748b;">${c.email}</div>
                  </td>
                  <td>
                    <span class="badge badge-status-created">
                      ${locations.filter(l => l.customerId === c.id).length} Branches
                    </span>
                  </td>
                  <td>${c.activeJobsCount} Active</td>
                  <td>${c.openTicketsCount > 0 ? `<span class="badge badge-priority-high">${c.openTicketsCount} Open</span>` : '0'}</td>
                  <td style="text-align: right;">
                    <button class="btn btn-sm btn-primary btn-customer-360" data-id="${c.id}">
                      360° View
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    elViewBody.innerHTML = html;

    document.getElementById("cust-search-input")?.addEventListener("input", (e) => {
      store.searchQuery = e.target.value.toLowerCase();
    });

    document.querySelectorAll(".btn-customer-360").forEach(b => {
      b.addEventListener("click", () => openCustomer360Drawer(b.dataset.id));
    });

    document.getElementById("btn-export-customers")?.addEventListener("click", () => {
      exportDataModal("Customers & Store Locations Master");
    });
  }

  /* ==========================================================================
     VIEWS: 5. Product & Package Catalogue (Module 8.2.2)
     ========================================================================== */
  function renderProductsView() {
    elBreadcrumbs.innerHTML = `<span>Master Records</span> <span>›</span> <span class="breadcrumb-active">Product & Package Catalogue</span>`;
    elViewTitle.innerHTML = `<span>Quail Digital Hardware & Package Catalogue</span>`;
    elViewDescription.textContent = "Maintain headset models, base transceivers, accessories, and pre-packaged enterprise retail bundles.";

    elHeaderActions.innerHTML = `
      <button class="btn btn-primary" id="btn-add-product">
        ${getIconSvg("plus")} Add Hardware SKU
      </button>
    `;

    const products = store.getProducts();
    const packages = store.getPackages();

    let html = `
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <div>
          <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            ${getIconSvg("package")} Enterprise Headset Packages
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem;">
            ${packages.map(p => `
              <div class="kpi-card" style="border: 1px solid var(--border-strong);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <span class="mono" style="font-size: 0.72rem; color: #0284c7; font-weight: 700;">${p.code}</span>
                    <h4 style="margin: 0.25rem 0;">${p.name}</h4>
                  </div>
                  <span class="badge badge-status-verified">£${p.listPrice.toFixed(2)}</span>
                </div>
                <p style="font-size: 0.78rem; color: #475569;">${p.description}</p>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-sm); padding: 0.6rem; font-size: 0.74rem;">
                  <strong>Bill of Materials:</strong>
                  <ul style="padding-left: 1.2rem; margin-top: 0.35rem; color: #64748b;">
                    ${p.itemsIncluded.map(i => `<li>${i}</li>`).join("")}
                  </ul>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: #64748b;">
                  <span>Capacity: <strong>${p.totalHeadsets} Wireless Headsets</strong></span>
                  <span class="badge badge-status-scheduled">${p.target}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <div>
          <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            ${getIconSvg("headset")} Individual Hardware SKUs
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
            ${products.map(pr => `
              <div class="kpi-card" style="padding: 0; overflow: hidden;">
                <img src="${pr.image}" alt="${pr.name}" style="width: 100%; height: 160px; object-fit: cover; background: #e2e8f0;">
                <div style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="mono" style="font-size: 0.72rem; color: #0284c7;">${pr.code}</span>
                    <span style="font-weight: 700; color: #0f172a;">£${pr.price.toFixed(2)}</span>
                  </div>
                  <h4 style="font-size: 0.92rem;">${pr.name}</h4>
                  <p style="font-size: 0.76rem; color: #64748b; line-height: 1.4;">${pr.description}</p>
                  <div style="border-top: 1px solid #e2e8f0; padding-top: 0.5rem; display: flex; justify-content: space-between; font-size: 0.72rem;">
                    <span>Warranty: ${pr.warrantyMonths}m</span>
                    <span class="badge badge-status-created">${pr.serviceType}</span>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    elViewBody.innerHTML = html;
  }

  /* ==========================================================================
     VIEWS: 6. Subcontractor Master & Smart Lookup (Module 8.2.3)
     ========================================================================== */
  function renderSubcontractorsView() {
    elBreadcrumbs.innerHTML = `<span>Master Records</span> <span>›</span> <span class="breadcrumb-active">Subcontractor Master</span>`;
    elViewTitle.innerHTML = `<span>Registered Subcontractors & Field Partners</span>`;
    elViewDescription.textContent = "Maintain contractor skill matrices, coverage zones, historical SLA performance, and active workload.";

    elHeaderActions.innerHTML = `
      <button class="btn btn-primary" id="btn-add-sub">
        ${getIconSvg("user-plus")} Register Subcontractor
      </button>
    `;

    const subcontractors = store.getSubcontractors();

    let html = `
      <div class="kendo-grid-container">
        <div class="grid-toolbar">
          <strong>Subcontractor Performance & Coverage Registry</strong>
          <span class="badge badge-status-verified">${subcontractors.length} Certified Partners</span>
        </div>
        <div class="kendo-table-wrapper">
          <table class="kendo-table">
            <thead>
              <tr>
                <th>Company & Lead Engineer</th>
                <th>Coverage Regions</th>
                <th>Specialist Skills</th>
                <th>Active Workload</th>
                <th>Completed Jobs</th>
                <th>SLA Score</th>
                <th>Avg Turnaround</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${subcontractors.map(s => `
                <tr>
                  <td>
                    <div><strong>${s.name}</strong></div>
                    <div style="font-size: 0.74rem; color: #64748b;">${s.leadEngineer} • ${s.phone}</div>
                  </td>
                  <td>
                    ${s.regions.map(r => `<span class="badge badge-status-scheduled" style="margin: 1px;">${r}</span>`).join("")}
                  </td>
                  <td style="max-width: 220px;">
                    <div style="font-size: 0.74rem; color: #475569;">${s.skills.join(", ")}</div>
                  </td>
                  <td>
                    <span class="badge ${s.activeJobs > 2 ? 'badge-priority-high' : 'badge-status-assigned'}">
                      ${s.activeJobs} Jobs Active
                    </span>
                  </td>
                  <td>${s.completedJobs} verified</td>
                  <td><strong style="color: #10b981;">${s.slaScore}</strong></td>
                  <td>${s.avgTurnaroundDays} days</td>
                  <td><span class="badge badge-status-verified">${s.status}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    elViewBody.innerHTML = html;
  }

  /* ==========================================================================
     VIEWS: 7. Installation Job Management (Module 8.2.4)
     ========================================================================== */
  function renderJobsView() {
    elBreadcrumbs.innerHTML = `<span>Operations</span> <span>›</span> <span class="breadcrumb-active">Installation Jobs</span>`;
    elViewTitle.innerHTML = `<span>Store Installation Jobs</span> <span class="badge badge-status-scheduled">${store.getJobs().length} Total</span>`;
    elViewDescription.textContent = "Lifecycle management: Created ➔ Assigned ➔ Scheduled ➔ In Progress ➔ Completed ➔ Verified/Closed.";

    elHeaderActions.innerHTML = `
      <button class="btn btn-secondary" id="btn-export-jobs">
        ${getIconSvg("download")} Export CSV
      </button>
      <button class="btn btn-primary" id="btn-create-job">
        ${getIconSvg("plus")} Create Job
      </button>
    `;

    document.getElementById("btn-create-job").addEventListener("click", () => openNewJobModal());
    document.getElementById("btn-export-jobs").addEventListener("click", () => exportDataModal("Installation Jobs Lifecycle"));

    const jobs = store.getJobs();

    let html = `
      <div class="kendo-grid-container">
        <div class="grid-toolbar">
          <div class="grid-search">
            <span class="grid-search-icon">${getIconSvg("search")}</span>
            <input type="text" id="jobs-search-input" placeholder="Search job number, store, subcontractor..." value="${store.searchQuery}">
          </div>
          <div class="grid-toolbar-actions">
            <select class="form-control" style="width: auto; padding: 0.35rem 0.65rem;" id="filter-job-status">
              <option value="">All Statuses</option>
              <option value="Completed by Subcontractor">Pending Verification</option>
              <option value="Rejected – Sent Back">Rejected</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Assigned">Assigned</option>
              <option value="Verified/Closed">Verified/Closed</option>
            </select>
          </div>
        </div>
        <div class="kendo-table-wrapper">
          <table class="kendo-table">
            <thead>
              <tr>
                <th>Job #</th>
                <th>Customer & Location</th>
                <th>Package Deployed</th>
                <th>Assigned Subcontractor</th>
                <th>Scheduled Date</th>
                <th>Lifecycle Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${jobs.map(j => `
                <tr class="${j.status === 'Rejected – Sent Back' ? 'row-urgent' : ''}">
                  <td><strong>${j.jobNumber}</strong></td>
                  <td>
                    <div><strong>${j.customerName}</strong></div>
                    <div style="font-size: 0.74rem; color: #64748b;">${j.locationName}</div>
                  </td>
                  <td>${j.packageName} (${j.quantity}u)</td>
                  <td>
                    <div>${j.assignedSubcontractorName}</div>
                    <div style="font-size: 0.72rem; color: #64748b;">${j.assignedTechName || 'Awaiting tech'}</div>
                  </td>
                  <td>${j.scheduledDate || '<span style="color: #d97706; font-style: italic;">Not scheduled</span>'}</td>
                  <td>${getStatusBadge(j.status)}</td>
                  <td style="text-align: right;">
                    ${getJobActionButton(j)}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    elViewBody.innerHTML = html;

    // Attach listeners
    document.querySelectorAll(".btn-view-job-detail").forEach(b => {
      b.addEventListener("click", () => openVerificationDetailModal(b.dataset.id));
    });
    document.querySelectorAll(".btn-schedule-calendar").forEach(b => {
      b.addEventListener("click", () => openScheduleCalendarModal(b.dataset.id));
    });
  }

  function getJobActionButton(job) {
    if (job.status === "Completed by Subcontractor") {
      return `<button class="btn btn-sm btn-primary btn-view-job-detail" data-id="${job.id}">Review & Verify</button>`;
    } else if (job.status === "Assigned") {
      return `<button class="btn btn-sm btn-secondary btn-schedule-calendar" data-id="${job.id}">Schedule Date</button>`;
    } else if (job.status === "Rejected – Sent Back") {
      return `<button class="btn btn-sm btn-danger btn-view-job-detail" data-id="${job.id}">View Rejection</button>`;
    } else {
      return `<button class="btn btn-sm btn-secondary btn-view-job-detail" data-id="${job.id}">View Details</button>`;
    }
  }

  /* ==========================================================================
     VIEWS: 8. Verification & Quality Gate (Module 8.2.6)
     ========================================================================== */
  function renderVerificationQueueView() {
    elBreadcrumbs.innerHTML = `<span>Operations</span> <span>›</span> <span class="breadcrumb-active">Quality Verification Gate</span>`;
    elViewTitle.innerHTML = `<span>PM Quality Verification Gate</span> <span class="badge badge-status-completed">Audit Queue</span>`;
    elViewDescription.textContent = "Review field technician installation records, checklist gates, and photo evidence with annotations before closing.";

    const pendingJobs = store.getJobs().filter(j => j.status === "Completed by Subcontractor");

    let html = `
      <div class="alert-banner info">
        <div class="alert-banner-icon">${getIconSvg("shield-check")}</div>
        <div class="alert-banner-content">
          <div class="alert-banner-title">Quality Verification Policy</div>
          <div class="alert-banner-desc">Every field job must satisfy RF sweep thresholds, power grounding, completed integration tests, and annotated photo evidence before sign-off. Rejected jobs return automatically to subcontractor queues with written notes.</div>
        </div>
      </div>

      <div class="kendo-grid-container">
        <div class="grid-toolbar">
          <strong>Jobs Awaiting Project Management Verification</strong>
          <span class="badge badge-priority-high">${pendingJobs.length} Pending Approval</span>
        </div>
        <div class="kendo-table-wrapper">
          <table class="kendo-table">
            <thead>
              <tr>
                <th>Job #</th>
                <th>Customer & Location</th>
                <th>Subcontractor & Tech</th>
                <th>Checklist Passed</th>
                <th>Integrations Reported</th>
                <th>Evidence Uploads</th>
                <th style="text-align: right;">Quality Action</th>
              </tr>
            </thead>
            <tbody>
              ${pendingJobs.length === 0 ? `
                <tr><td colspan="7" style="text-align: center; color: #64748b; padding: 2.5rem;">All completed installations have been quality verified!</td></tr>
              ` : pendingJobs.map(j => `
                <tr>
                  <td><strong>${j.jobNumber}</strong></td>
                  <td>
                    <div><strong>${j.customerName}</strong></div>
                    <div style="font-size: 0.74rem; color: #64748b;">${j.locationName}</div>
                  </td>
                  <td>
                    <div>${j.assignedSubcontractorName}</div>
                    <div style="font-size: 0.72rem; color: #64748b;">${j.technicianDetails?.techName || 'Mike Vance'}</div>
                  </td>
                  <td>
                    <span class="badge badge-status-verified">${getIconSvg("check")} 5/5 Mandatory Gates</span>
                  </td>
                  <td>
                    ${j.integrationsCompleted?.map(i => `<span class="badge badge-status-scheduled" style="margin: 1px;">${i.type}</span>`).join("") || 'Standard'}
                  </td>
                  <td>
                    <span class="badge badge-status-assigned">
                      ${getIconSvg("image")} ${j.photos?.length || 2} Photos (Annotated)
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-sm btn-primary btn-open-verification" data-id="${j.id}">
                      Audit & Verify
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    elViewBody.innerHTML = html;

    document.querySelectorAll(".btn-open-verification").forEach(b => {
      b.addEventListener("click", () => openVerificationDetailModal(b.dataset.id));
    });
  }

  /* ==========================================================================
     VIEWS: 9. Field Installation Record Submission (Module 8.2.5)
     ========================================================================== */
  function renderFieldRecordView(initialJobId = null) {
    elBreadcrumbs.innerHTML = `<span>Field Portal</span> <span>›</span> <span class="breadcrumb-active">Installation Record</span>`;
    elViewTitle.innerHTML = `<span>Field Installation Submission Form</span> <span class="brand-edition">Kendo Grid & Stepper</span>`;
    elViewDescription.textContent = "Mobile-friendly technician submission with auto-save, dynamic pre-work checklist gates, and annotated photo uploads.";

    const myJobs = store.getJobs().filter(j => j.status === "Scheduled" || j.status === "In Progress" || j.status === "Rejected – Sent Back" || j.status === "Assigned");
    const activeJobId = initialJobId || (myJobs.length > 0 ? myJobs[0].id : "JOB-2026-081");
    const currentJob = store.getJobs().find(j => j.id === activeJobId) || store.getJobs()[0];

    let html = `
      <!-- Stepper Header -->
      <div class="stepper">
        <div class="step-item completed" data-step="1">
          <div class="step-circle">1</div>
          <span class="step-title">Site & Tech Info</span>
        </div>
        <div class="step-item active" data-step="2">
          <div class="step-circle">2</div>
          <span class="step-title">Hardware Units</span>
        </div>
        <div class="step-item" data-step="3">
          <div class="step-circle">3</div>
          <span class="step-title">Integrations Grid</span>
        </div>
        <div class="step-item" data-step="4">
          <div class="step-circle">4</div>
          <span class="step-title">Checklist Gates</span>
        </div>
        <div class="step-item" data-step="5">
          <div class="step-circle">5</div>
          <span class="step-title">Photo Evidence</span>
        </div>
      </div>

      <!-- Auto-Save status banner -->
      <div style="display: flex; align-items: center; justify-content: space-between; background: #fafbfc; border: 1px solid var(--border-subtle); padding: 0.65rem 1rem; border-radius: var(--radius-md);">
        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: #64748b;">
          ${getIconSvg("cloud-check")} <span>Auto-save active: All draft entries synced locally</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <label class="form-label" style="margin: 0;">Target Job:</label>
          <select class="form-control" id="field-job-selector" style="width: 260px;">
            ${store.getJobs().map(j => `
              <option value="${j.id}" ${j.id === currentJob.id ? 'selected' : ''}>
                ${j.jobNumber} - ${j.locationName} (${j.status})
              </option>
            `).join("")}
          </select>
        </div>
      </div>

      <!-- Prominent Rejection Banner if rejected -->
      ${currentJob.status === "Rejected – Sent Back" ? `
        <div class="alert-banner urgent-rejection">
          <div class="alert-banner-icon">${getIconSvg("alert-triangle")}</div>
          <div class="alert-banner-content">
            <div class="alert-banner-title">Correction Required by Project Management:</div>
            <div class="alert-banner-desc">${currentJob.rejectionReason}</div>
          </div>
        </div>
      ` : ""}

      <!-- Main Rich Form Container -->
      <div class="kpi-card" style="padding: 1.75rem;">
        <form id="form-field-submission">
          <!-- Step 1: Site & Technician Verification -->
          <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            ${getIconSvg("user-check")} Section 1: Field Technician & Site Verification
          </h3>
          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label required">Technician Name</label>
              <input type="text" class="form-control" id="fld-tech-name" value="${currentJob.technicianDetails?.techName || 'Mike Vance'}" required>
            </div>
            <div class="form-group">
              <label class="form-label required">Technician Mobile</label>
              <input type="text" class="form-control" id="fld-tech-phone" value="${currentJob.technicianDetails?.techPhone || '+44 7700 900142'}" required>
            </div>
            <div class="form-group">
              <label class="form-label required">Transit Vehicle Reg</label>
              <input type="text" class="form-control" id="fld-vehicle-reg" value="${currentJob.technicianDetails?.vehicleReg || 'VK72 XNZ (Ford Transit Custom)'}" required>
            </div>
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label required">Duty Store Contact Name & Phone</label>
              <input type="text" class="form-control" id="fld-site-contact" value="${currentJob.technicianDetails?.siteContactConfirmed || 'Gary Fletcher (Store GM)'}" required>
            </div>
            <div class="form-group">
              <label class="form-label required">Actual Installation Date</label>
              <input type="date" class="form-control" id="fld-install-date" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
          </div>

          <hr style="margin: 1.5rem 0; border: 0; border-top: 1px solid var(--border-subtle);">

          <!-- Section 2: Hardware Deployed -->
          <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            ${getIconSvg("headset")} Section 2: Units Deployed & Location Notes
          </h3>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label required">Units Actually Installed (Sold: ${currentJob.quantity})</label>
              <input type="number" class="form-control" id="fld-units-installed" min="1" max="24" value="${currentJob.actualInstalledUnits || currentJob.quantity}" required>
              <span class="form-helper">Ensure unit count matches contract specification.</span>
            </div>
            <div class="form-group">
              <label class="form-label required">Exact Base Station & Dock Mount Location</label>
              <input type="text" class="form-control" id="fld-mount-location" value="${currentJob.installLocationNotes || 'Back-office comms rack at 2.1m height, adjacent to POS relay switch'}" required>
            </div>
          </div>

          <hr style="margin: 1.5rem 0; border: 0; border-top: 1px solid var(--border-subtle);">

          <!-- Section 3: Integrations Completed Grid (Module 8.2.5 Kendo Grid) -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h3 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
              ${getIconSvg("cpu")} Section 3: Integrations Completed (Kendo UI Grid)
            </h3>
            <button type="button" class="btn btn-sm btn-secondary" id="btn-add-custom-integration">
              ${getIconSvg("plus")} Add Custom Integration
            </button>
          </div>
          
          <div class="kendo-grid-container" style="margin-bottom: 1.5rem;">
            <table class="kendo-table" id="integrations-table">
              <thead>
                <tr>
                  <th style="width: 250px;">Integration Type</th>
                  <th>Hardware Interface & Port Notes</th>
                  <th style="width: 120px;">Status</th>
                  <th style="width: 80px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody id="integrations-tbody">
                <tr>
                  <td>
                    <select class="form-control fld-integration-type">
                      <option value="POS System" selected>POS System</option>
                      <option value="Walkie-Talkie Relay">Walkie-Talkie Relay</option>
                      <option value="PA System">PA System</option>
                      <option value="Queue Management">Queue Management</option>
                      <option value="Intercom">Intercom</option>
                    </select>
                  </td>
                  <td>
                    <input type="text" class="form-control fld-integration-desc" value="NCR Aloha POS order terminal line tap connected to Channel 1 audio">
                  </td>
                  <td><span class="badge badge-status-verified">Operational</span></td>
                  <td style="text-align: right;">
                    <button type="button" class="btn btn-sm btn-ghost btn-remove-row">${getIconSvg("trash")}</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <select class="form-control fld-integration-type">
                      <option value="PA System" selected>PA System</option>
                      <option value="POS System">POS System</option>
                      <option value="Walkie-Talkie Relay">Walkie-Talkie Relay</option>
                    </select>
                  </td>
                  <td>
                    <input type="text" class="form-control fld-integration-desc" value="Expediter overhead kitchen horn relay muted when drive-thru customer talks">
                  </td>
                  <td><span class="badge badge-status-verified">Operational</span></td>
                  <td style="text-align: right;">
                    <button type="button" class="btn btn-sm btn-ghost btn-remove-row">${getIconSvg("trash")}</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Section 4: Pre-Work Checklist (Mandatory Gates) -->
          <h3 style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            ${getIconSvg("check-square")} Section 4: Mandatory Pre-Work Quality Gates
          </h3>
          <p style="font-size: 0.78rem; color: #64748b; margin-bottom: 1rem;">
            All 5 items must be confirmed and verified before submission to Project Management.
          </p>

          <div style="display: flex; flex-direction: column; gap: 0.65rem; background: #f8fafc; border: 1px solid var(--border-subtle); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
            ${store.state.preWorkChecklistTemplate.map(chk => `
              <label style="display: flex; align-items: flex-start; gap: 0.75rem; font-size: 0.82rem; cursor: pointer;">
                <input type="checkbox" class="chk-gate-item" data-id="${chk.id}" style="margin-top: 3px;" checked>
                <span><strong>Gate ${chk.id.toUpperCase()}:</strong> ${chk.title} <span style="color: #ef4444;">*</span></span>
              </label>
            `).join("")}
          </div>

          <!-- Section 5: Photo Evidence & Annotation -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h3 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
              ${getIconSvg("camera")} Section 5: Photo Evidence & Technical Annotations
            </h3>
            <button type="button" class="btn btn-sm btn-secondary" id="btn-upload-photo-sim">
              ${getIconSvg("upload")} Upload Installation Photo
            </button>
          </div>

          <div class="photo-gallery-grid" style="margin-bottom: 2rem;" id="field-photo-gallery">
            <div class="photo-card" id="btn-open-annotation-1">
              <img src="./assets/field_install_evidence.jpg" alt="Installation Rack" class="photo-thumbnail">
              <div class="photo-card-info">
                <span class="photo-card-title">Rack Mounted Base Station & 6-Bay Dock</span>
                <span class="photo-card-tag">${getIconSvg("tag")} 3 Technical Pins Annotated</span>
              </div>
            </div>
            <div class="photo-card" id="btn-open-annotation-2">
              <img src="./assets/quail_headset.jpg" alt="Headset Station" class="photo-thumbnail">
              <div class="photo-card-info">
                <span class="photo-card-title">Pro9 Operational Talk-Test</span>
                <span class="photo-card-tag">${getIconSvg("tag")} 2 Technical Pins Annotated</span>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 1rem; border-top: 1px solid var(--border-subtle); padding-top: 1.25rem;">
            <button type="button" class="btn btn-secondary" id="btn-save-draft">
              ${getIconSvg("save")} Save Draft
            </button>
            <button type="submit" class="btn btn-primary btn-lg" id="btn-submit-record">
              ${getIconSvg("send")} Submit for PM Verification
            </button>
          </div>
        </form>
      </div>
    `;

    elViewBody.innerHTML = html;

    // Change target job
    document.getElementById("field-job-selector")?.addEventListener("change", (e) => {
      renderFieldRecordView(e.target.value);
    });

    // Add integration row
    document.getElementById("btn-add-custom-integration")?.addEventListener("click", () => {
      const tbody = document.getElementById("integrations-tbody");
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <input type="text" class="form-control fld-integration-type" placeholder="Custom API / Hardware" value="Custom Serial Loop Relay">
        </td>
        <td>
          <input type="text" class="form-control fld-integration-desc" placeholder="Details" value="RS-232 serial trigger linked to customer display pole">
        </td>
        <td><span class="badge badge-status-verified">Operational</span></td>
        <td style="text-align: right;">
          <button type="button" class="btn btn-sm btn-ghost btn-remove-row">${getIconSvg("trash")}</button>
        </td>
      `;
      tbody.appendChild(tr);
      attachRemoveRowListeners();
    });

    function attachRemoveRowListeners() {
      document.querySelectorAll(".btn-remove-row").forEach(b => {
        b.onclick = () => b.closest("tr").remove();
      });
    }
    attachRemoveRowListeners();

    // Photo annotation modal click
    document.getElementById("btn-open-annotation-1")?.addEventListener("click", () => {
      openPhotoAnnotationModal(currentJob.id, 0);
    });
    document.getElementById("btn-open-annotation-2")?.addEventListener("click", () => {
      openPhotoAnnotationModal(currentJob.id, 1);
    });

    // Form submit
    document.getElementById("form-field-submission")?.addEventListener("submit", (e) => {
      e.preventDefault();

      // Check mandatory gates
      const checkBoxes = document.querySelectorAll(".chk-gate-item");
      let allChecked = true;
      checkBoxes.forEach(c => {
        if (!c.checked) allChecked = false;
      });

      if (!allChecked) {
        alert("Mandatory Gate Incomplete: All pre-work checklist gates must be verified before submitting to PM Quality Gate.");
        return;
      }

      // Collect integrations
      const intRows = document.querySelectorAll("#integrations-tbody tr");
      const integrations = [];
      intRows.forEach(row => {
        const type = row.querySelector(".fld-integration-type")?.value;
        const details = row.querySelector(".fld-integration-desc")?.value;
        if (type) integrations.push({ type, details });
      });

      store.submitInstallationRecord(currentJob.id, {
        actualInstalledUnits: document.getElementById("fld-units-installed").value,
        installLocationNotes: document.getElementById("fld-mount-location").value,
        techName: document.getElementById("fld-tech-name").value,
        techPhone: document.getElementById("fld-tech-phone").value,
        vehicleReg: document.getElementById("fld-vehicle-reg").value,
        siteContactConfirmed: document.getElementById("fld-site-contact").value,
        integrationsCompleted: integrations,
        checklistCompleted: { chk_1: true, chk_2: true, chk_3: true, chk_4: true, chk_5: true }
      });

      alert(`Installation record for ${currentJob.jobNumber} submitted successfully! It has now been placed in the PM Verification Quality Gate.`);
      store.setView("jobs");
    });
  }

  /* ==========================================================================
     VIEWS: 10. Support Tickets (Module 8.2.7)
     ========================================================================== */
  function renderTicketsView() {
    elBreadcrumbs.innerHTML = `<span>Service Management</span> <span>›</span> <span class="breadcrumb-active">Support Tickets</span>`;
    elViewTitle.innerHTML = `<span>After-Sales Support & RMA Depot</span> <span class="badge badge-status-scheduled">${store.getTickets().length} Incidents</span>`;
    elViewDescription.textContent = "Coordinate On-Site Subcontractor repairs and In-House RMA hardware bench testing with versioned documents.";

    elHeaderActions.innerHTML = `
      <button class="btn btn-secondary" id="btn-export-tickets">
        ${getIconSvg("download")} Export CSV
      </button>
      <button class="btn btn-primary" id="btn-open-ticket-intake">
        ${getIconSvg("plus")} Raise Ticket
      </button>
    `;

    document.getElementById("btn-open-ticket-intake").addEventListener("click", () => openNewTicketModal());
    document.getElementById("btn-export-tickets").addEventListener("click", () => exportDataModal("Support Tickets & RMA Registry"));

    const tickets = store.getTickets();

    let html = `
      <div class="kendo-grid-container">
        <div class="grid-toolbar">
          <div class="grid-search">
            <span class="grid-search-icon">${getIconSvg("search")}</span>
            <input type="text" id="ticket-search-input" placeholder="Search ticket, customer, RMA number..." value="${store.searchQuery}">
          </div>
          <div class="grid-toolbar-actions">
            <select class="form-control" style="width: auto; padding: 0.35rem 0.65rem;" id="filter-ticket-track">
              <option value="">All Resolution Tracks</option>
              <option value="onsite">On-Site Field Visit</option>
              <option value="inhouse">In-House Repair (RMA)</option>
            </select>
          </div>
        </div>
        <div class="kendo-table-wrapper">
          <table class="kendo-table">
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Customer & Store</th>
                <th>Resolution Track</th>
                <th>Issue Description</th>
                <th>Priority</th>
                <th>Status / Sub-Status</th>
                <th>Versioned Docs</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${tickets.map(t => `
                <tr>
                  <td><strong>${t.ticketNumber}</strong></td>
                  <td>
                    <div><strong>${t.customerName}</strong></div>
                    <div style="font-size: 0.74rem; color: #64748b;">${t.locationName}</div>
                  </td>
                  <td>
                    ${t.resolutionPath === 'inhouse' ? 
                      `<span class="badge badge-status-scheduled">${getIconSvg("box")} In-House RMA</span>` : 
                      `<span class="badge badge-status-assigned">${getIconSvg("wrench")} On-Site Fix</span>`}
                  </td>
                  <td style="max-width: 240px;">
                    <div class="truncate">${t.issueDescription}</div>
                    <div style="font-size: 0.72rem; color: #64748b;">Linked Job: ${t.originatingJobId}</div>
                  </td>
                  <td>${getPriorityBadge(t.priority)}</td>
                  <td>${getTicketStatusBadge(t.status, t.resolutionPath)}</td>
                  <td>
                    <span class="badge badge-status-created">
                      ${getIconSvg("file-text")} ${t.documents?.length || 1} Docs (${t.documents?.[0]?.version || 'v1.0'})
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-sm btn-primary btn-manage-ticket" data-id="${t.id}">
                      Manage
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    elViewBody.innerHTML = html;

    document.querySelectorAll(".btn-manage-ticket").forEach(b => {
      b.addEventListener("click", () => openTicketDetailModal(b.dataset.id));
    });
  }

  /* ==========================================================================
     VIEWS: 11. Urgent Rejected Queue View (For Subcontractor)
     ========================================================================== */
  function renderRejectedQueueView() {
    elBreadcrumbs.innerHTML = `<span>Field Portal</span> <span>›</span> <span class="breadcrumb-active">Rejected Jobs Queue</span>`;
    elViewTitle.innerHTML = `<span>Urgent Quality Gate Rejections</span> <span class="badge badge-status-rejected">Action Required</span>`;
    elViewDescription.textContent = "Review feedback notes from Project Management, rectify missing checklist items or photos, and resubmit.";

    const rejectedJobs = store.getJobs().filter(j => j.status === "Rejected – Sent Back");

    let html = `
      <div class="kendo-grid-container">
        <div class="grid-toolbar">
          <strong>Jobs Returned for Resubmission</strong>
          <span class="badge badge-status-rejected">${rejectedJobs.length} Work Orders</span>
        </div>
        <div class="kendo-table-wrapper">
          <table class="kendo-table">
            <thead>
              <tr>
                <th>Job #</th>
                <th>Store Location</th>
                <th>Rejection Reason & Required Remediation</th>
                <th>Rejected At</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${rejectedJobs.length === 0 ? `
                <tr><td colspan="5" style="text-align: center; color: #10b981; padding: 2.5rem;">No rejected jobs in your queue! All work orders are in good standing.</td></tr>
              ` : rejectedJobs.map(j => `
                <tr class="row-urgent">
                  <td><strong>${j.jobNumber}</strong></td>
                  <td>
                    <div><strong>${j.customerName}</strong></div>
                    <div style="font-size: 0.74rem; color: #64748b;">${j.locationName}</div>
                  </td>
                  <td style="max-width: 380px;">
                    <div style="background: #fef2f2; border-left: 3px solid #ef4444; padding: 0.5rem; font-size: 0.78rem; color: #991b1b; border-radius: var(--radius-sm);">
                      ${j.rejectionReason}
                    </div>
                  </td>
                  <td>${j.rejectedAt || '2026-09-16 14:15'}</td>
                  <td style="text-align: right;">
                    <button class="btn btn-sm btn-danger btn-fix-job" data-id="${j.id}">
                      Fix & Resubmit
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    elViewBody.innerHTML = html;

    document.querySelectorAll(".btn-fix-job").forEach(b => {
      b.addEventListener("click", () => {
        store.setView("field_record", { jobId: b.dataset.id });
      });
    });
  }

  /* ==========================================================================
     MODALS & INTERACTION OVERLAYS
     ========================================================================== */

  // Customer Intake Wizard (Module 8.2.1)
  function openCustomerIntakeWizard() {
    const html = `
      <div class="modal-backdrop" id="modal-intake-backdrop">
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-title">${getIconSvg("building-2")} New Customer & Store Locations Intake</span>
              <span class="modal-subtitle">Step 1 of 3: Company Master & Multi-Store Locations</span>
            </div>
            <button class="modal-close-btn" id="modal-intake-close">&times;</button>
          </div>
          <div class="modal-body">
            <form id="form-customer-intake">
              <h4 style="margin-bottom: 0.75rem; color: #0284c7;">Company Billing Information</h4>
              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label required">Company / Corporate Name</label>
                  <input type="text" class="form-control" id="intake-company-name" placeholder="e.g. Five Guys JV Enterprises Ltd" required>
                </div>
                <div class="form-group">
                  <label class="form-label required">Account Code / Reference</label>
                  <input type="text" class="form-control" id="intake-account-code" placeholder="e.g. FG-UK-01" required>
                </div>
              </div>
              <div class="form-grid-3">
                <div class="form-group">
                  <label class="form-label required">Primary Contact</label>
                  <input type="text" class="form-control" id="intake-contact-name" placeholder="Full Name" required>
                </div>
                <div class="form-group">
                  <label class="form-label required">Contact Email</label>
                  <input type="email" class="form-control" id="intake-contact-email" placeholder="contact@domain.com" required>
                </div>
                <div class="form-group">
                  <label class="form-label required">Contact Phone</label>
                  <input type="text" class="form-control" id="intake-contact-phone" placeholder="+44 20 7946 0000" required>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label required">Billing Address</label>
                <input type="text" class="form-control" id="intake-billing-address" placeholder="Registered office address..." required>
              </div>

              <hr style="margin: 1.5rem 0; border: 0; border-top: 1px solid var(--border-subtle);">

              <h4 style="margin-bottom: 0.75rem; color: #0284c7; display: flex; justify-content: space-between; align-items: center;">
                <span>Initial Store Location & Package Deployment</span>
                <span class="badge badge-status-assigned">Auto-triggers Job Creation</span>
              </h4>
              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label required">Branch Store Name</label>
                  <input type="text" class="form-control" id="intake-branch-name" placeholder="e.g. Five Guys Oxford Street #14" required>
                </div>
                <div class="form-group">
                  <label class="form-label required">Store Code</label>
                  <input type="text" class="form-control" id="intake-branch-code" placeholder="e.g. FG-1014" required>
                </div>
              </div>
              <div class="form-grid-3">
                <div class="form-group">
                  <label class="form-label required">Store Address</label>
                  <input type="text" class="form-control" id="intake-branch-address" placeholder="Store street address" required>
                </div>
                <div class="form-group">
                  <label class="form-label required">City & Postcode</label>
                  <input type="text" class="form-control" id="intake-branch-postcode" placeholder="London W1D 1BS" required>
                </div>
                <div class="form-group">
                  <label class="form-label required">Region</label>
                  <select class="form-control" id="intake-branch-region">
                    <option value="London">London & South East</option>
                    <option value="Midlands">Midlands</option>
                    <option value="North West">North West</option>
                    <option value="Scotland">Scotland</option>
                  </select>
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label required">Hardware Package Sold</label>
                  <select class="form-control" id="intake-package-id">
                    ${store.getPackages().map(p => `
                      <option value="${p.id}">${p.name} (£${p.listPrice})</option>
                    `).join("")}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label required">Assign Subcontractor (Smart Lookup)</label>
                  <select class="form-control" id="intake-sub-id">
                    ${store.getSubcontractors().map(s => `
                      <option value="${s.id}">${s.name} (SLA: ${s.slaScore}, Active: ${s.activeJobs})</option>
                    `).join("")}
                  </select>
                </div>
              </div>

              <div class="modal-footer" style="padding: 1rem 0 0 0; margin-top: 1rem;">
                <button type="button" class="btn btn-secondary" id="btn-cancel-intake">Cancel</button>
                <button type="submit" class="btn btn-primary">Complete Intake & Generate Job</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    elModalRoot.innerHTML = html;

    document.getElementById("modal-intake-close").onclick = () => closeModal();
    document.getElementById("btn-cancel-intake").onclick = () => closeModal();

    document.getElementById("form-customer-intake").onsubmit = (e) => {
      e.preventDefault();
      const compName = document.getElementById("intake-company-name").value;
      const accCode = document.getElementById("intake-account-code").value;
      const contact = document.getElementById("intake-contact-name").value;
      const email = document.getElementById("intake-contact-email").value;
      const phone = document.getElementById("intake-contact-phone").value;
      const billing = document.getElementById("intake-billing-address").value;

      const storeName = document.getElementById("intake-branch-name").value;
      const storeCode = document.getElementById("intake-branch-code").value;
      const storeAddr = document.getElementById("intake-branch-address").value;
      const postcode = document.getElementById("intake-branch-postcode").value;
      const region = document.getElementById("intake-branch-region").value;
      const pkgId = document.getElementById("intake-package-id").value;
      const pkg = store.getPackages().find(p => p.id === pkgId);
      const subId = document.getElementById("intake-sub-id").value;

      store.addCustomer({
        companyName: compName,
        accountCode: accCode,
        primaryContact: contact,
        email: email,
        phone: phone,
        billingAddress: billing
      }, [
        {
          storeName: storeName,
          storeCode: storeCode,
          address: storeAddr,
          city: "London",
          postcode: postcode,
          region: region,
          packageId: pkgId,
          packageName: pkg.name,
          subcontractorId: subId
        }
      ]);

      closeModal();
      alert(`Customer '${compName}' onboarded! Store location '${storeName}' and linked installation job created.`);
      store.setView("customers");
    };
  }

  // Verification Audit Modal (Module 8.2.6)
  function openVerificationDetailModal(jobId) {
    const job = store.getJobs().find(j => j.id === jobId);
    if (!job) return;

    const html = `
      <div class="modal-backdrop" id="modal-verify-backdrop">
        <div class="modal-dialog modal-xl">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-title">${getIconSvg("shield-check")} Verification Quality Gate: ${job.jobNumber}</span>
              <span class="modal-subtitle">${job.customerName} - ${job.locationName}</span>
            </div>
            <button class="modal-close-btn" id="modal-verify-close">&times;</button>
          </div>
          <div class="modal-body" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <!-- Left Column: Technician Submission & Checklists -->
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <div class="kpi-card">
                <h4 style="margin-bottom: 0.5rem; color: #0284c7;">Field Technician Details</h4>
                <div style="font-size: 0.8rem; line-height: 1.6;">
                  <div><strong>Subcontractor:</strong> ${job.assignedSubcontractorName}</div>
                  <div><strong>Field Engineer:</strong> ${job.technicianDetails?.techName || 'Mike Vance'} (${job.technicianDetails?.techPhone || '+44 7700 900142'})</div>
                  <div><strong>Transit Vehicle:</strong> ${job.technicianDetails?.vehicleReg || 'VK72 XNZ (Ford Transit)'}</div>
                  <div><strong>Store Contact Confirmed:</strong> ${job.technicianDetails?.siteContactConfirmed || 'Gary Fletcher (Store GM)'}</div>
                  <div><strong>Completion Date:</strong> ${job.completedDate || '2026-09-16'}</div>
                </div>
              </div>

              <div class="kpi-card">
                <h4 style="margin-bottom: 0.5rem; color: #0284c7;">Hardware & Integrations</h4>
                <div style="font-size: 0.8rem; line-height: 1.6;">
                  <div><strong>Units Deployed:</strong> ${job.actualInstalledUnits} installed / ${job.quantity} contracted</div>
                  <div><strong>Mounting Notes:</strong> ${job.installLocationNotes || 'Wall mounted at 2.1m in back office server bay'}</div>
                </div>
                <div style="margin-top: 0.75rem;">
                  <strong>Reported Integrations:</strong>
                  <ul style="padding-left: 1.2rem; font-size: 0.76rem; color: #475569; margin-top: 0.25rem;">
                    ${job.integrationsCompleted?.map(i => `<li><strong>${i.type}:</strong> ${i.details}</li>`).join("") || '<li>Standard audio relay</li>'}
                  </ul>
                </div>
              </div>

              <div class="kpi-card">
                <h4 style="margin-bottom: 0.5rem; color: #0284c7;">Pre-Work Checklist Gates</h4>
                <div style="display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.76rem;">
                  <div style="color: #059669;">✓ RF spectrum background sweep (< -85dBm clear)</div>
                  <div style="color: #059669;">✓ Mains 230V AC continuous earth ground verified (< 5Ω)</div>
                  <div style="color: #059669;">✓ Drive-thru vehicle acoustic detector loop checked</div>
                  <div style="color: #059669;">✓ Charging dock 5.0V bus contacts clean</div>
                  <div style="color: #059669;">✓ Store Manager handed operating manual & sanitisation protocol</div>
                </div>
              </div>
            </div>

            <!-- Right Column: Photo Evidence Gallery with WorkDrive Sync -->
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4>Uploaded Photo Evidence</h4>
                <span class="badge badge-status-scheduled">
                  ${getIconSvg("cloud")} Zoho WorkDrive Tier: 2TB
                </span>
              </div>

              <div class="photo-gallery-grid" style="grid-template-columns: 1fr;">
                <div class="photo-card" id="btn-inspect-evidence-photo" style="cursor: pointer;">
                  <img src="./assets/field_install_evidence.jpg" alt="Evidence" class="photo-thumbnail" style="height: 240px;">
                  <div class="photo-card-info">
                    <span class="photo-card-title">Rack Mounted Base Transceiver & 6-Bay Dock</span>
                    <span class="photo-card-tag">Click to open interactive technical pin annotations</span>
                  </div>
                </div>
              </div>

              <!-- Action Controls -->
              <div style="background: #fafbfc; border: 1px solid var(--border-subtle); padding: 1.25rem; border-radius: var(--radius-md); margin-top: auto;">
                <h4 style="margin-bottom: 0.5rem;">Project Management Determination</h4>
                <p style="font-size: 0.78rem; color: #64748b; margin-bottom: 1rem;">
                  Approving verifies installation standards, issues sign-off certification, and releases subcontractor payment. Rejecting automatically routes the job back to the subcontractor's queue with inline rejection notes.
                </p>

                <div style="display: flex; gap: 0.75rem;">
                  <button class="btn btn-outline-danger" id="btn-action-reject" style="flex: 1;">
                    ${getIconSvg("x-circle")} Reject & Send Back
                  </button>
                  <button class="btn btn-success" id="btn-action-approve" style="flex: 1;">
                    ${getIconSvg("check-circle-2")} Approve & Verify/Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    elModalRoot.innerHTML = html;

    document.getElementById("modal-verify-close").onclick = () => closeModal();
    document.getElementById("btn-inspect-evidence-photo").onclick = () => openPhotoAnnotationModal(job.id, 0);

    // Approve
    document.getElementById("btn-action-approve").onclick = () => {
      store.verifyAndCloseJob(job.id, "Verified by Sarah Jenkins. All checklist gates, RF readings, and photo evidence meet Quail Digital standards.");
      closeModal();
      alert(`Job ${job.jobNumber} successfully verified and closed! Certificate issued to customer.`);
      renderCurrentView();
    };

    // Reject Modal trigger
    document.getElementById("btn-action-reject").onclick = () => {
      openRejectionReasonPromptModal(job.id);
    };
  }

  // Rejection Reason Prompt (Module 8.2.4 & 8.2.6)
  function openRejectionReasonPromptModal(jobId) {
    const job = store.getJobs().find(j => j.id === jobId);
    const html = `
      <div class="modal-backdrop" id="modal-reject-prompt-backdrop" style="z-index: 150;">
        <div class="modal-dialog">
          <div class="modal-header" style="background: #fef2f2; border-bottom: 1px solid #fecaca;">
            <div class="modal-title-group">
              <span class="modal-title" style="color: #b91c1c;">
                ${getIconSvg("alert-triangle")} Reject Installation Submission
              </span>
              <span class="modal-subtitle" style="color: #991b1b;">Job ${job.jobNumber} - ${job.locationName}</span>
            </div>
            <button class="modal-close-btn" id="modal-reject-close">&times;</button>
          </div>
          <div class="modal-body">
            <p style="font-size: 0.82rem; color: #475569; margin-bottom: 1rem;">
              Provide a clear, actionable reason for returning this job. The note will appear prominently as a red alert banner in the subcontractor's portal and trigger an automated email notification.
            </p>
            <div class="form-group">
              <label class="form-label required">Written Rejection Reason</label>
              <textarea class="form-control" id="reject-note-input" rows="4" placeholder="e.g. Missing photo evidence of POS relay cabling; unit count mismatch between contract and installation record..." required></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-cancel-reject-prompt">Cancel</button>
            <button class="btn btn-danger" id="btn-confirm-reject">Confirm Rejection & Send Back</button>
          </div>
        </div>
      </div>
    `;

    // Append to modal root
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    document.body.appendChild(tempDiv.firstElementChild);

    const promptModal = document.getElementById("modal-reject-prompt-backdrop");

    document.getElementById("modal-reject-close").onclick = () => promptModal.remove();
    document.getElementById("btn-cancel-reject-prompt").onclick = () => promptModal.remove();

    document.getElementById("btn-confirm-reject").onclick = () => {
      const reason = document.getElementById("reject-note-input").value.trim();
      if (!reason) {
        alert("Please enter a rejection reason.");
        return;
      }
      promptModal.remove();
      closeModal(); // Close verification modal
      store.rejectJob(job.id, reason);
      alert(`Job ${job.jobNumber} has been rejected and sent back to the subcontractor queue with your notes.`);
      renderCurrentView();
    };
  }

  // Interactive Photo Annotation Modal (Module 8.2.11)
  function openPhotoAnnotationModal(jobId, photoIndex = 0) {
    const job = store.getJobs().find(j => j.id === jobId) || store.getJobs()[0];
    const photo = job.photos?.[photoIndex] || {
      url: "./assets/field_install_evidence.jpg",
      title: "Wall Mounted Installation Rack",
      tag: "Transceiver Rack",
      annotations: [
        { x: 58, y: 15, text: "Central PoE Switch & Cat6 blue data line drops to POS terminals" },
        { x: 45, y: 55, text: "6x Pro9 Bluetooth Headsets docked; green charging LED indicators active" },
        { x: 80, y: 50, text: "Protective conduit for 230V clean power feed" }
      ]
    };

    let pinsHtml = "";
    photo.annotations?.forEach((pin, idx) => {
      pinsHtml += `
        <div class="annotation-pin" style="left: ${pin.x}%; top: ${pin.y}%;" data-index="${idx}" title="${pin.text}">
          ${idx + 1}
        </div>
      `;
    });

    let notesListHtml = "";
    photo.annotations?.forEach((pin, idx) => {
      notesListHtml += `
        <div class="annotation-note-item" data-index="${idx}">
          <span class="note-pin-badge">Pin #${idx + 1}</span>
          <p style="font-size: 0.78rem; color: #1e293b; line-height: 1.3;">${pin.text}</p>
        </div>
      `;
    });

    const html = `
      <div class="modal-backdrop" id="modal-annotation-backdrop" style="z-index: 200;">
        <div class="modal-dialog modal-xl">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-title">${getIconSvg("image")} Technical Field Inspection: ${photo.title}</span>
              <span class="modal-subtitle">Interactive Pin Notes • Synced with Zoho WorkDrive Storage</span>
            </div>
            <button class="modal-close-btn" id="modal-anno-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="annotation-stage-container">
              <div class="annotation-image-viewport" id="annotation-viewport">
                <img src="${photo.url}" alt="Inspection View">
                ${pinsHtml}
              </div>
              <div class="annotation-sidebar">
                <div style="font-size: 0.8rem; font-weight: 700; color: #0f172a; display: flex; align-items: center; justify-content: space-between;">
                  <span>Technical Annotations (${photo.annotations?.length || 0})</span>
                  <span class="badge badge-status-verified">Zoho WorkDrive</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.65rem; overflow-y: auto; flex: 1;">
                  ${notesListHtml}
                </div>
                <div style="margin-top: auto; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle);">
                  <button class="btn btn-sm btn-secondary w-full" id="btn-add-pin-sim">
                    ${getIconSvg("plus")} Add New Annotation Pin
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="modal-anno-done">Close Inspection</button>
          </div>
        </div>
      </div>
    `;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    document.body.appendChild(tempDiv.firstElementChild);

    const modal = document.getElementById("modal-annotation-backdrop");
    document.getElementById("modal-anno-close").onclick = () => modal.remove();
    document.getElementById("modal-anno-done").onclick = () => modal.remove();

    // Pin hover/click highlights
    modal.querySelectorAll(".annotation-pin").forEach(pinEl => {
      pinEl.addEventListener("click", () => {
        const idx = pinEl.dataset.index;
        modal.querySelectorAll(".annotation-pin").forEach(p => p.classList.remove("active"));
        modal.querySelectorAll(".annotation-note-item").forEach(n => n.classList.remove("active"));
        pinEl.classList.add("active");
        modal.querySelector(`.annotation-note-item[data-index="${idx}"]`)?.classList.add("active");
      });
    });

    document.getElementById("btn-add-pin-sim")?.addEventListener("click", () => {
      alert("Click anywhere on the photo viewport to place a new inspection marker.");
    });
  }

  // Calendar Scheduler Modal (Module 8.2.4)
  function openScheduleCalendarModal(jobId) {
    const job = store.getJobs().find(j => j.id === jobId);
    if (!job) return;

    const html = `
      <div class="modal-backdrop" id="modal-calendar-backdrop">
        <div class="modal-dialog">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-title">${getIconSvg("calendar")} Schedule Installation Date</span>
              <span class="modal-subtitle">${job.jobNumber} - ${job.locationName}</span>
            </div>
            <button class="modal-close-btn" id="modal-cal-close">&times;</button>
          </div>
          <div class="modal-body">
            <p style="font-size: 0.82rem; color: #475569; margin-bottom: 1.25rem;">
              Select the confirmed field appointment date. An automated notification and email calendar invite will be dispatched to the store manager and Project Management.
            </p>
            <div class="form-group">
              <label class="form-label required">Target Installation Date</label>
              <input type="date" class="form-control" id="sched-date-input" value="2026-09-24" required>
            </div>
            <div class="form-group">
              <label class="form-label">Arrival Time Window</label>
              <select class="form-control" id="sched-time-slot">
                <option>07:00 - 11:00 (Pre-Opening Morning)</option>
                <option>14:00 - 18:00 (Post-Lunch Lull)</option>
                <option>22:00 - 02:00 (Overnight Deep Maintenance)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Site Access Notes</label>
              <input type="text" class="form-control" placeholder="Rear loading dock entry, check in with duty manager..." value="Rear delivery bay entry code 4491">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-cancel-cal">Cancel</button>
            <button class="btn btn-primary" id="btn-confirm-schedule">Confirm Appointment</button>
          </div>
        </div>
      </div>
    `;

    elModalRoot.innerHTML = html;
    document.getElementById("modal-cal-close").onclick = () => closeModal();
    document.getElementById("btn-cancel-cal").onclick = () => closeModal();

    document.getElementById("btn-confirm-schedule").onclick = () => {
      const dateVal = document.getElementById("sched-date-input").value;
      store.scheduleJob(job.id, dateVal);
      closeModal();
      alert(`Installation for ${job.locationName} successfully scheduled for ${dateVal}!`);
      renderCurrentView();
    };
  }

  // Support Ticket Detail Modal with Dual Resolution Paths (Module 8.2.7)
  function openTicketDetailModal(ticketId) {
    const ticket = store.getTickets().find(t => t.id === ticketId);
    if (!ticket) return;

    const html = `
      <div class="modal-backdrop" id="modal-ticket-backdrop">
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-title">${getIconSvg("ticket")} Support Incident: ${ticket.ticketNumber}</span>
              <span class="modal-subtitle">${ticket.customerName} - ${ticket.locationName}</span>
            </div>
            <button class="modal-close-btn" id="modal-ticket-close">&times;</button>
          </div>
          <div class="modal-body">
            <!-- Contextual Originating Installation Job Header -->
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: var(--radius-md); padding: 0.85rem; margin-bottom: 1.25rem; font-size: 0.78rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <strong style="color: #0369a1;">Originating Installation Job Context</strong>
                <span class="mono" style="color: #0284c7;">${ticket.originatingJobId}</span>
              </div>
              <div><strong>Package on File:</strong> ${ticket.originatingPackage}</div>
              <div><strong>Recorded Integrations:</strong> ${ticket.integrationsOnFile}</div>
            </div>

            <!-- Resolution Path Tracker -->
            <h4 style="margin-bottom: 0.5rem;">
              ${ticket.resolutionPath === 'inhouse' ? 'In-House Repair (RMA) Sub-Status Pipeline' : 'On-Site Field Subcontractor Resolution'}
            </h4>

            ${ticket.resolutionPath === 'inhouse' ? `
              <div style="display: flex; align-items: center; justify-content: space-between; background: #fafbfc; border: 1px solid var(--border-subtle); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
                <div style="text-align: center;">
                  <span class="badge ${ticket.status === 'Open' ? 'badge-priority-high' : 'badge-status-created'}">1. Open</span>
                </div>
                <div>→</div>
                <div style="text-align: center;">
                  <span class="badge ${ticket.status === 'Sent for Repair' ? 'badge-status-scheduled' : 'badge-status-created'}">2. Sent for Repair</span>
                  <div style="font-size: 0.68rem; color: #64748b; margin-top: 2px;">${ticket.rmaNumber || 'RMA-9942'}</div>
                </div>
                <div>→</div>
                <div style="text-align: center;">
                  <span class="badge ${ticket.status === 'Repaired' ? 'badge-status-verified' : 'badge-status-created'}">3. Repaired (Bench Lab)</span>
                </div>
                <div>→</div>
                <div style="text-align: center;">
                  <span class="badge ${ticket.status === 'Returned to Customer' ? 'badge-status-completed' : 'badge-status-created'}">4. Returned</span>
                </div>
                <div>→</div>
                <div style="text-align: center;">
                  <span class="badge ${ticket.status === 'Closed' ? 'badge-status-verified' : 'badge-status-created'}">5. Closed</span>
                </div>
              </div>
            ` : `
              <div style="display: flex; align-items: center; justify-content: space-between; background: #fafbfc; border: 1px solid var(--border-subtle); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
                <span class="badge ${ticket.status === 'Assigned' ? 'badge-status-assigned' : 'badge-status-created'}">1. Assigned</span>
                <div>→</div>
                <span class="badge ${ticket.status === 'In Progress' ? 'badge-status-inprogress' : 'badge-status-created'}">2. In Progress (Tech Onsite)</span>
                <div>→</div>
                <span class="badge ${ticket.status === 'Resolved' ? 'badge-status-completed' : 'badge-status-created'}">3. Resolved (Subcontractor)</span>
                <div>→</div>
                <span class="badge ${ticket.status === 'Closed' ? 'badge-status-verified' : 'badge-status-created'}">4. Closed (Customer Service)</span>
              </div>
            `}

            <div class="form-group">
              <label class="form-label">Issue Description</label>
              <textarea class="form-control" rows="2" readonly>${ticket.issueDescription}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Diagnostic / Resolution Notes</label>
              <textarea class="form-control" id="ticket-resolution-notes" rows="3" placeholder="Enter bench diagnostics or field technician findings...">${ticket.resolutionNotes || ''}</textarea>
            </div>

            <!-- Versioned Document Attachments (Module 8.2.7 & 8.2.11) -->
            <div style="margin-top: 1rem;">
              <label class="form-label">Versioned Documents & Courier Slips</label>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${ticket.documents?.map(d => `
                  <div style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.78rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      ${getIconSvg("file-text")}
                      <strong>${d.name}</strong>
                      <span class="badge badge-status-scheduled">${d.version}</span>
                    </div>
                    <span style="color: #64748b;">${d.size} • ${d.date}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-ticket-modal-close">Close</button>
            ${getTicketActionButtons(ticket)}
          </div>
        </div>
      </div>
    `;

    elModalRoot.innerHTML = html;
    document.getElementById("modal-ticket-close").onclick = () => closeModal();
    document.getElementById("btn-ticket-modal-close").onclick = () => closeModal();

    // Attach status progression handlers
    document.getElementById("btn-step-repair-pass")?.addEventListener("click", () => {
      const notes = document.getElementById("ticket-resolution-notes").value;
      store.updateTicketStatus(ticket.id, "Repaired", notes);
      closeModal();
      alert(`Hardware for ${ticket.ticketNumber} marked Repaired! Courier dispatch scheduled.`);
      renderCurrentView();
    });

    document.getElementById("btn-step-return-customer")?.addEventListener("click", () => {
      store.updateTicketStatus(ticket.id, "Returned to Customer", "Dispatched back to store via DPD Express.");
      closeModal();
      alert(`Hardware for ${ticket.ticketNumber} marked Returned to Customer!`);
      renderCurrentView();
    });

    document.getElementById("btn-step-resolve-onsite")?.addEventListener("click", () => {
      const notes = document.getElementById("ticket-resolution-notes").value;
      store.updateTicketStatus(ticket.id, "Resolved", notes);
      closeModal();
      alert(`On-site visit for ${ticket.ticketNumber} marked Resolved by Subcontractor!`);
      renderCurrentView();
    });

    document.getElementById("btn-step-close-ticket")?.addEventListener("click", () => {
      store.updateTicketStatus(ticket.id, "Closed", "Verified and signed off by Customer Service.");
      closeModal();
      alert(`Ticket ${ticket.ticketNumber} is now permanently closed.`);
      renderCurrentView();
    });
  }

  function getTicketActionButtons(ticket) {
    if (ticket.resolutionPath === "inhouse") {
      if (ticket.status === "Sent for Repair") {
        return `<button class="btn btn-primary" id="btn-step-repair-pass">Bench Diagnostics Passed (Repaired)</button>`;
      } else if (ticket.status === "Repaired") {
        return `<button class="btn btn-primary" id="btn-step-return-customer">Courier Dispatched to Store</button>`;
      } else if (ticket.status === "Returned to Customer") {
        return `<button class="btn btn-success" id="btn-step-close-ticket">Close Ticket (Customer Confirmed)</button>`;
      }
    } else {
      if (ticket.status === "Assigned" || ticket.status === "In Progress") {
        return `<button class="btn btn-primary" id="btn-step-resolve-onsite">Mark Resolved (Field Sign-Off)</button>`;
      } else if (ticket.status === "Resolved") {
        return `<button class="btn btn-success" id="btn-step-close-ticket">Close Ticket (CS Sign-Off)</button>`;
      }
    }
    return "";
  }

  // Raise Support Ticket Modal (Module 8.2.7)
  function openNewTicketModal() {
    const locations = store.getStoreLocations();

    const html = `
      <div class="modal-backdrop" id="modal-new-ticket-backdrop">
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-title">${getIconSvg("ticket")} Raise Customer Service Support Ticket</span>
              <span class="modal-subtitle">Auto-populates originating installation job hardware & integrations</span>
            </div>
            <button class="modal-close-btn" id="modal-nt-close">&times;</button>
          </div>
          <div class="modal-body">
            <form id="form-new-ticket">
              <div class="form-group">
                <label class="form-label required">Select Store Location</label>
                <select class="form-control" id="nt-location-id" required>
                  ${locations.map(l => `
                    <option value="${l.id}">
                      ${l.customerName} - ${l.storeName} (${l.city})
                    </option>
                  `).join("")}
                </select>
              </div>

              <!-- Contextual Preview Container -->
              <div id="nt-context-preview" style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: var(--radius-md); padding: 0.75rem; margin-bottom: 1rem; font-size: 0.78rem;">
                <!-- Filled dynamically -->
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label required">Resolution Path</label>
                  <select class="form-control" id="nt-resolution-path">
                    <option value="onsite">On-Site Subcontractor Visit (Audio, cabling, relay)</option>
                    <option value="inhouse">In-House Repair Depot (Hardware RMA, broken boom, board repair)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label required">Priority</label>
                  <select class="form-control" id="nt-priority">
                    <option value="Critical">Critical (Drive-Thru Lane Down - 4h SLA)</option>
                    <option value="High" selected>High (Single Headset Down - 12h SLA)</option>
                    <option value="Medium">Medium (Audio Bleed / Intermittent - 24h SLA)</option>
                    <option value="Low">Low (Spare Charger Battery - 48h SLA)</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label required">Issue Description & Symptoms</label>
                <textarea class="form-control" id="nt-issue-desc" rows="3" placeholder="Describe the symptom reported by store manager..." required></textarea>
              </div>

              <div class="modal-footer" style="padding: 1rem 0 0 0;">
                <button type="button" class="btn btn-secondary" id="btn-cancel-nt">Cancel</button>
                <button type="submit" class="btn btn-primary">Create Ticket & Dispatch</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    elModalRoot.innerHTML = html;
    document.getElementById("modal-nt-close").onclick = () => closeModal();
    document.getElementById("btn-cancel-nt").onclick = () => closeModal();

    const locSelect = document.getElementById("nt-location-id");
    const updatePreview = () => {
      const loc = locations.find(l => l.id === locSelect.value) || locations[0];
      const previewEl = document.getElementById("nt-context-preview");
      previewEl.innerHTML = `
        <div><strong>Originating Job:</strong> ${loc.originatingJobId || 'JOB-2026-081'}</div>
        <div><strong>Hardware on Site:</strong> ${loc.packageDeployed} (${loc.installedUnits || 6} units deployed)</div>
        <div><strong>Site Contact:</strong> ${loc.siteContact} (${loc.phone})</div>
      `;
    };
    locSelect.onchange = updatePreview;
    updatePreview();

    document.getElementById("form-new-ticket").onsubmit = (e) => {
      e.preventDefault();
      const loc = locations.find(l => l.id === locSelect.value);
      const resPath = document.getElementById("nt-resolution-path").value;
      const priority = document.getElementById("nt-priority").value;
      const issue = document.getElementById("nt-issue-desc").value;

      store.createTicket({
        customerId: loc.customerId,
        customerName: loc.customerName,
        locationId: loc.id,
        locationName: loc.storeName,
        originatingJobId: loc.originatingJobId || "JOB-2026-081",
        originatingPackage: loc.packageDeployed,
        integrationsOnFile: "POS System, PA Relay",
        issueDescription: issue,
        resolutionPath: resPath,
        priority: priority
      });

      closeModal();
      alert(`Support ticket generated and dispatched via ${resPath === 'onsite' ? 'On-Site Subcontractor' : 'In-House RMA Lab'}!`);
      store.setView("tickets");
    };
  }

  // 4-Step Bulk Import Wizard (Module 8.2.10)
  function openBulkImportModal() {
    const html = `
      <div class="modal-backdrop" id="modal-import-backdrop">
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-title">${getIconSvg("file-spreadsheet")} Bulk Data Import Wizard</span>
              <span class="modal-subtitle">Guided Column Mapping & Smart Duplicate Detection (Module 8.2.10)</span>
            </div>
            <button class="modal-close-btn" id="modal-import-close">&times;</button>
          </div>
          <div class="modal-body">
            <!-- Wizard Stepper -->
            <div class="stepper" style="margin-bottom: 1.5rem;">
              <div class="step-item active" id="imp-step-1">
                <div class="step-circle">1</div>
                <span class="step-title">Upload File</span>
              </div>
              <div class="step-item" id="imp-step-2">
                <div class="step-circle">2</div>
                <span class="step-title">Field Mapping</span>
              </div>
              <div class="step-item" id="imp-step-3">
                <div class="step-circle">3</div>
                <span class="step-title">Validation & Dedupe</span>
              </div>
              <div class="step-item" id="imp-step-4">
                <div class="step-circle">4</div>
                <span class="step-title">Commit Import</span>
              </div>
            </div>

            <!-- Stage 1 Container: Dropzone -->
            <div id="import-stage-1">
              <div class="dropzone-box" id="import-dropzone">
                <div style="font-size: 2.2rem; color: #0ea5e9; margin-bottom: 0.5rem;">${getIconSvg("file-up")}</div>
                <h4>Drag and drop store locations CSV or Excel template</h4>
                <p style="font-size: 0.78rem; color: #64748b; margin: 0.5rem 0 1rem;">Supports .csv, .xlsx up to 50MB (Zoho Creator Enterprise format)</p>
                <button type="button" class="btn btn-secondary" id="btn-browse-file">Browse Sample File</button>
              </div>

              <div style="margin-top: 1.25rem; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid var(--border-subtle); padding: 0.75rem 1rem; border-radius: var(--radius-md);">
                <div style="font-size: 0.78rem; color: #475569;">
                  <strong>Need the standardised template?</strong>
                  <div>Includes sample columns for Customer Name, Store Code, Address, Postcode, and Package SKU.</div>
                </div>
                <button type="button" class="btn btn-sm btn-ghost" style="color: #0284c7;" id="btn-dl-template">
                  ${getIconSvg("download")} Download CSV Template
                </button>
              </div>
            </div>

            <!-- Stage 2 Container: Column Mapping (hidden initially) -->
            <div id="import-stage-2" class="hidden">
              <div style="margin-bottom: 1rem; font-size: 0.8rem; color: #475569;">
                Match the columns detected in your uploaded spreadsheet with Quail Digital ISM system fields.
              </div>
              <table class="mapping-table">
                <thead>
                  <tr>
                    <th>Spreadsheet Header</th>
                    <th>Sample Data (Row 1)</th>
                    <th>ISM Destination Field</th>
                    <th>Match Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Company_Name</strong></td>
                    <td>Tim Hortons UK Ltd</td>
                    <td>
                      <select class="form-control" style="padding: 0.25rem 0.5rem;">
                        <option selected>Customer Name</option>
                      </select>
                    </td>
                    <td><span class="smart-match-badge">✓ 100% Match</span></td>
                  </tr>
                  <tr>
                    <td><strong>Store_Branch_ID</strong></td>
                    <td>TH-GLASGOW-02</td>
                    <td>
                      <select class="form-control" style="padding: 0.25rem 0.5rem;">
                        <option selected>Store Branch Code</option>
                      </select>
                    </td>
                    <td><span class="smart-match-badge">✓ 100% Match</span></td>
                  </tr>
                  <tr>
                    <td><strong>Postcode_ZIP</strong></td>
                    <td>G1 2DH</td>
                    <td>
                      <select class="form-control" style="padding: 0.25rem 0.5rem;">
                        <option selected>Postcode</option>
                      </select>
                    </td>
                    <td><span class="smart-match-badge">✓ 100% Match</span></td>
                  </tr>
                  <tr>
                    <td><strong>Hardware_Bundle</strong></td>
                    <td>PKG-DT-6U</td>
                    <td>
                      <select class="form-control" style="padding: 0.25rem 0.5rem;">
                        <option selected>Package Code</option>
                      </select>
                    </td>
                    <td><span class="smart-match-badge">✓ 100% Match</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Stage 3 Container: Duplicate Detection & Merge (hidden initially) -->
            <div id="import-stage-3" class="hidden">
              <div class="alert-banner warning">
                <div class="alert-banner-icon">${getIconSvg("alert-circle")}</div>
                <div class="alert-banner-content">
                  <div class="alert-banner-title">Smart De-duplication: 1 Existing Record Detected</div>
                  <div class="alert-banner-desc">
                    Row 3 matches existing customer <strong>'McDonald's Restaurants UK Ltd'</strong>. Suggested action: Merge store branch into existing corporate parent.
                  </div>
                </div>
              </div>
              <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 1rem; border-radius: var(--radius-md); font-size: 0.8rem;">
                <div>✓ 42 rows validated with zero syntax errors.</div>
                <div>✓ All required addresses and postcodes verified against UK Royal Mail PAF database.</div>
                <div>✓ Auto-provisions 42 store locations and installation work orders.</div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-import-prev" style="display: none;">Previous Step</button>
            <button class="btn btn-primary" id="btn-import-next">Continue to Mapping</button>
          </div>
        </div>
      </div>
    `;

    elModalRoot.innerHTML = html;
    document.getElementById("modal-import-close").onclick = () => closeModal();

    let step = 1;
    const btnNext = document.getElementById("btn-import-next");
    const btnPrev = document.getElementById("btn-import-prev");
    const s1 = document.getElementById("import-stage-1");
    const s2 = document.getElementById("import-stage-2");
    const s3 = document.getElementById("import-stage-3");

    const updateStep = (newStep) => {
      step = newStep;
      s1.classList.toggle("hidden", step !== 1);
      s2.classList.toggle("hidden", step !== 2);
      s3.classList.toggle("hidden", step !== 3);
      btnPrev.style.display = step > 1 ? "inline-flex" : "none";

      document.querySelectorAll(".step-item").forEach((it, i) => {
        it.classList.toggle("active", i + 1 === step);
        it.classList.toggle("completed", i + 1 < step);
      });

      if (step === 1) btnNext.textContent = "Continue to Mapping";
      else if (step === 2) btnNext.textContent = "Run Validation & De-Dupe";
      else if (step === 3) btnNext.textContent = "Confirm & Ingest 42 Stores";
    };

    btnNext.onclick = () => {
      if (step === 1) updateStep(2);
      else if (step === 2) updateStep(3);
      else {
        closeModal();
        alert("Bulk import completed! 42 store records successfully imported with smart de-duplication merge.");
        store.setView("customers");
      }
    };

    btnPrev.onclick = () => {
      if (step > 1) updateStep(step - 1);
    };

    document.getElementById("btn-browse-file").onclick = () => {
      btnNext.click();
    };

    document.getElementById("btn-dl-template").onclick = () => {
      alert("Downloading 'Quail_Digital_Store_Locations_Import_Template.csv'...");
    };
  }

  // Customer 360° Drawer (Module 8.2.1)
  function openCustomer360Drawer(customerId) {
    const cust = store.getCustomers().find(c => c.id === customerId);
    if (!cust) return;

    const locs = store.getStoreLocations().filter(l => l.customerId === cust.id);
    const jobs = store.getJobs().filter(j => j.customerId === cust.id);
    const tickets = store.getTickets().filter(t => t.customerId === cust.id);

    const html = `
      <div class="drawer-backdrop" id="drawer-cust-backdrop">
        <div class="drawer drawer-wide">
          <div class="drawer-header">
            <div>
              <h3 style="margin: 0; font-size: 1.15rem;">${cust.companyName}</h3>
              <span class="mono" style="font-size: 0.72rem; color: #0284c7;">${cust.accountCode} • ${cust.tier}</span>
            </div>
            <button class="modal-close-btn" id="drawer-cust-close">&times;</button>
          </div>
          <div class="drawer-body">
            <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; font-size: 0.8rem; line-height: 1.6;">
              <div><strong>Primary Contact:</strong> ${cust.primaryContact} (${cust.contactTitle || 'Operations'})</div>
              <div><strong>Email & Phone:</strong> ${cust.email} • ${cust.phone}</div>
              <div><strong>Billing Address:</strong> ${cust.billingAddress}</div>
            </div>

            <!-- Stores Tab -->
            <h4 style="margin-bottom: 0.75rem; color: #0284c7;">Store Locations (${locs.length})</h4>
            <div style="display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.5rem;">
              ${locs.map(l => `
                <div style="background: #ffffff; border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.78rem;">
                  <div style="display: flex; justify-content: space-between;">
                    <strong>${l.storeName}</strong>
                    <span class="badge badge-status-assigned">${l.driveThruType || 'Drive-Thru'}</span>
                  </div>
                  <div style="color: #64748b; margin-top: 2px;">${l.address}, ${l.city} (${l.postcode})</div>
                  <div style="margin-top: 4px; font-size: 0.72rem; color: #0284c7;">Package: ${l.packageDeployed}</div>
                </div>
              `).join("")}
            </div>

            <!-- Aggregated Jobs -->
            <h4 style="margin-bottom: 0.75rem; color: #0284c7;">Active & Completed Installations (${jobs.length})</h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem;">
              ${jobs.map(j => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: #ffffff; border: 1px solid var(--border-subtle); padding: 0.65rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.78rem;">
                  <div>
                    <strong>${j.jobNumber}</strong> - ${j.locationName}
                    <div style="font-size: 0.72rem; color: #64748b;">Subcontractor: ${j.assignedSubcontractorName}</div>
                  </div>
                  ${getStatusBadge(j.status)}
                </div>
              `).join("")}
            </div>

            <!-- Aggregated Tickets -->
            <h4 style="margin-bottom: 0.75rem; color: #0284c7;">Support Ticket History (${tickets.length})</h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${tickets.length === 0 ? `<div style="font-size: 0.78rem; color: #64748b;">No support incidents recorded.</div>` : tickets.map(t => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: #ffffff; border: 1px solid var(--border-subtle); padding: 0.65rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.78rem;">
                  <div>
                    <strong>${t.ticketNumber}</strong> - ${t.issueDescription.substring(0, 50)}...
                    <div style="font-size: 0.72rem; color: #64748b;">Track: ${t.resolutionPath} • Raised: ${t.dateRaised}</div>
                  </div>
                  ${getTicketStatusBadge(t.status, t.resolutionPath)}
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `;

    elDrawerRoot.innerHTML = html;
    document.getElementById("drawer-cust-close").onclick = () => closeDrawer();
    document.getElementById("drawer-cust-backdrop").onclick = (e) => {
      if (e.target.id === "drawer-cust-backdrop") closeDrawer();
    };
  }

  // In-App Email Alerts Log Drawer (Module 8.2.8)
  function openEmailLogDrawer() {
    const emails = store.getEmails();

    let listHtml = "";
    emails.forEach((em, idx) => {
      listHtml += `
        <div class="notification-item email-item ${idx === 0 ? 'unread' : ''}" data-index="${idx}">
          <div class="notif-content">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="badge badge-status-scheduled">${em.trigger}</span>
              <span class="notif-time">${em.date}</span>
            </div>
            <strong style="font-size: 0.8rem; margin-top: 4px;">${em.subject}</strong>
            <span style="font-size: 0.72rem; color: #64748b;">To: ${em.to}</span>
          </div>
        </div>
      `;
    });

    const html = `
      <div class="drawer-backdrop" id="drawer-email-backdrop">
        <div class="drawer drawer-wide" style="width: 860px;">
          <div class="drawer-header">
            <div>
              <h3 style="margin: 0;">In-App Email Alerts Log</h3>
              <span style="font-size: 0.74rem; color: #64748b;">Centralised transactional email dispatch & audit log (Module 8.2.8)</span>
            </div>
            <button class="modal-close-btn" id="drawer-email-close">&times;</button>
          </div>
          <div class="drawer-body" style="display: grid; grid-template-columns: 320px 1fr; gap: 1rem; padding: 0; overflow: hidden;">
            <!-- Left List -->
            <div style="border-right: 1px solid var(--border-subtle); overflow-y: auto; height: 100%;">
              ${listHtml}
            </div>
            <!-- Right Viewer -->
            <div style="padding: 1.5rem; overflow-y: auto;" id="email-preview-pane">
              ${emails[0] ? renderEmailPreviewContent(emails[0]) : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    elDrawerRoot.innerHTML = html;
    document.getElementById("drawer-email-close").onclick = () => closeDrawer();
    document.getElementById("drawer-email-backdrop").onclick = (e) => {
      if (e.target.id === "drawer-email-backdrop") closeDrawer();
    };

    document.querySelectorAll(".email-item").forEach(item => {
      item.addEventListener("click", () => {
        document.querySelectorAll(".email-item").forEach(i => i.classList.remove("unread"));
        item.classList.add("unread");
        const em = emails[item.dataset.index];
        document.getElementById("email-preview-pane").innerHTML = renderEmailPreviewContent(em);
      });
    });
  }

  function renderEmailPreviewContent(em) {
    return `
      <div style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem;">
        <div style="border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <h3 style="font-size: 1rem; margin: 0;">${em.subject}</h3>
            <span class="badge badge-status-verified">Delivered</span>
          </div>
          <div style="font-size: 0.74rem; color: #64748b; margin-top: 0.5rem; line-height: 1.5;">
            <div><strong>From:</strong> ${em.from} (Quail Digital ISM Gateway)</div>
            <div><strong>To:</strong> ${em.to}</div>
            <div><strong>Trigger Event:</strong> ${em.trigger}</div>
            <div><strong>Dispatched:</strong> ${em.date} via SPF-authenticated SMTP</div>
          </div>
        </div>
        <div style="border: 1px solid #e2e8f0; border-radius: var(--radius-sm); padding: 1.25rem; background: #fafbfc;">
          ${em.bodyHtml}
        </div>
      </div>
    `;
  }

  // Notification Bell Dropdown
  function toggleNotificationDropdown() {
    const isHidden = elNotifDropdown.classList.contains("hidden");
    if (!isHidden) {
      elNotifDropdown.classList.add("hidden");
      return;
    }

    const notifications = store.getNotifications();
    let itemsHtml = "";

    notifications.slice(0, 5).forEach(n => {
      itemsHtml += `
        <div class="notification-item ${n.unread ? 'unread' : ''}" data-job-id="${n.jobId || ''}" data-ticket-id="${n.ticketId || ''}">
          <div class="notif-icon-box ${n.type === 'job_rejected' ? 'kpi-icon-red' : (n.type === 'verification_needed' ? 'kpi-icon-amber' : 'kpi-icon-blue')}">
            ${n.type === 'job_rejected' ? getIconSvg("alert-triangle") : getIconSvg("bell")}
          </div>
          <div class="notif-content">
            <span class="notif-title">${n.title}</span>
            <span class="notif-desc">${n.desc}</span>
            <span class="notif-time">${n.time}</span>
          </div>
        </div>
      `;
    });

    elNotifDropdown.innerHTML = `
      <div class="notification-header">
        <strong>In-App Notifications</strong>
        <button class="btn btn-sm btn-ghost" id="btn-mark-all-read" style="font-size: 0.72rem; color: #0284c7;">
          Mark all as read
        </button>
      </div>
      <div class="notification-list">
        ${itemsHtml}
      </div>
      <div class="notification-footer">
        <button class="btn btn-sm btn-ghost w-full" id="btn-open-email-log-link" style="color: #0284c7; font-size: 0.75rem;">
          View Full Email Audit Log →
        </button>
      </div>
    `;

    elNotifDropdown.classList.remove("hidden");

    document.getElementById("btn-mark-all-read")?.addEventListener("click", () => {
      store.markNotificationsAsRead();
      toggleNotificationDropdown();
    });

    document.getElementById("btn-open-email-log-link")?.addEventListener("click", () => {
      elNotifDropdown.classList.add("hidden");
      openEmailLogDrawer();
    });

    elNotifDropdown.querySelectorAll(".notification-item").forEach(item => {
      item.addEventListener("click", () => {
        elNotifDropdown.classList.add("hidden");
        const jId = item.dataset.jobId;
        const tId = item.dataset.ticketId;
        if (jId) {
          if (store.activeRole === "pm") openVerificationDetailModal(jId);
          else store.setView("field_record", { jobId: jId });
        } else if (tId) {
          openTicketDetailModal(tId);
        }
      });
    });
  }

  // General Close helpers
  function closeModal() {
    elModalRoot.innerHTML = "";
  }
  function closeDrawer() {
    elDrawerRoot.innerHTML = "";
  }

  // Export Data Simulation Modal
  function exportDataModal(reportName) {
    alert(`Generating CSV and Excel export for '${reportName}'...\n\nData formatted according to Zoho Creator Enterprise schema. Download initiated!`);
  }

  function openScheduleReportModal() {
    alert("Scheduled Report Configured: Automated executive summary will be emailed every Monday at 08:00 AM to s.jenkins@quaildigital.com");
  }

  /* ==========================================================================
     BADGE & ICON HELPERS
     ========================================================================== */
  function getStatusBadge(status) {
    switch (status) {
      case "Created":
        return `<span class="badge badge-status-created"><span class="badge-dot"></span>Created</span>`;
      case "Assigned":
        return `<span class="badge badge-status-assigned"><span class="badge-dot"></span>Assigned</span>`;
      case "Scheduled":
        return `<span class="badge badge-status-scheduled"><span class="badge-dot"></span>Scheduled</span>`;
      case "In Progress":
        return `<span class="badge badge-status-inprogress"><span class="badge-dot"></span>In Progress</span>`;
      case "Completed by Subcontractor":
        return `<span class="badge badge-status-completed"><span class="badge-dot"></span>Pending Verification</span>`;
      case "Verified/Closed":
        return `<span class="badge badge-status-verified"><span class="badge-dot"></span>Verified & Closed</span>`;
      case "Rejected – Sent Back":
        return `<span class="badge badge-status-rejected"><span class="badge-dot"></span>Rejected - Sent Back</span>`;
      default:
        return `<span class="badge badge-status-created">${status}</span>`;
    }
  }

  function getPriorityBadge(priority) {
    switch (priority) {
      case "Critical":
        return `<span class="badge badge-priority-critical">Critical</span>`;
      case "High":
        return `<span class="badge badge-priority-high">High</span>`;
      case "Medium":
        return `<span class="badge badge-priority-medium">Medium</span>`;
      default:
        return `<span class="badge badge-priority-low">Low</span>`;
    }
  }

  function getTicketStatusBadge(status, path) {
    if (path === "inhouse") {
      switch (status) {
        case "Open": return `<span class="badge badge-priority-high">Open</span>`;
        case "Sent for Repair": return `<span class="badge badge-status-scheduled">Sent for Repair (RMA)</span>`;
        case "Repaired": return `<span class="badge badge-status-verified">Repaired (Lab Passed)</span>`;
        case "Returned to Customer": return `<span class="badge badge-status-completed">Returned via Courier</span>`;
        case "Closed": return `<span class="badge badge-status-verified">Closed</span>`;
        default: return `<span class="badge">${status}</span>`;
      }
    } else {
      switch (status) {
        case "Assigned": return `<span class="badge badge-status-assigned">Assigned to Tech</span>`;
        case "In Progress": return `<span class="badge badge-status-inprogress">Tech En Route</span>`;
        case "Resolved": return `<span class="badge badge-status-completed">Resolved On-Site</span>`;
        case "Closed": return `<span class="badge badge-status-verified">Closed</span>`;
        default: return `<span class="badge">${status}</span>`;
      }
    }
  }

  // Lucide SVG Icons embedded as lightweight strings
  function getIconSvg(name) {
    const icons = {
      "layout-dashboard": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
      "wrench": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
      "shield-check": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`,
      "shield-alert": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
      "building-2": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`,
      "headset": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a9 9 0 0 1 18 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/></svg>`,
      "users": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      "ticket": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>`,
      "file-spreadsheet": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/></svg>`,
      "alert-triangle": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
      "alert-circle": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
      "clipboard-list": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>`,
      "file-check-2": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m3 15 2 2 4-4"/></svg>`,
      "history": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>`,
      "bell": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
      "mail": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
      "search": `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
      "download": `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`,
      "plus": `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
      "clock": `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      "calendar": `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
      "check-circle-2": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
      "bar-chart-2": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>`,
      "pie-chart": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
      "image": `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
      "refresh-cw": `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>`,
      "flame": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
      "box": `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
      "filter": `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
      "file-up": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 12v6"/><path d="m15 15-3-3-3 3"/></svg>`,
      "package": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
      "user-plus": `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>`,
      "cloud-check": `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 12 2 2 4-4"/><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
      "cloud": `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
      "user-check": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>`,
      "cpu": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>`,
      "check-square": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
      "camera": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
      "upload": `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>`,
      "tag": `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>`,
      "save": `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
      "send": `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
      "trash": `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
      "check": `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
      "file-text": `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
      "award": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
      "x-circle": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>`
    };
    return icons[name] || `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
  }

  // Initial application render
  updateTopBarUser();
  renderSidebar();
  renderCurrentView();
  updateNotificationBadge();
});
