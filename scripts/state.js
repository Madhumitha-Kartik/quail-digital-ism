/**
 * Quail Digital ISM - Reactive State Store & Dispatcher
 */

class AppStore {
  constructor() {
    this.storageKey = "quail_digital_ism_state_v1";
    this.listeners = new Map();
    this.init();
  }

  init() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        this.state = JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to parse local state, resetting to initial", e);
        this.state = JSON.parse(JSON.stringify(INITIAL_DATA));
      }
    } else {
      this.state = JSON.parse(JSON.stringify(INITIAL_DATA));
    }

    // Default active session state
    this.activeRole = "pm"; // 'pm', 'subcontractor', 'cs'
    this.activeView = "dashboard";
    this.activeViewParams = {};
    this.searchQuery = "";
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error("Storage save failed", e);
    }
  }

  resetToDefault() {
    localStorage.removeItem(this.storageKey);
    this.state = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.publish("stateReset", {});
  }

  // Pub / Sub Event Bus
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => {
      const arr = this.listeners.get(event).filter(cb => cb !== callback);
      this.listeners.set(event, arr);
    };
  }

  publish(event, payload) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(payload));
    }
  }

  // Role Switching
  setRole(roleKey) {
    if (!this.state.users[roleKey]) return;
    this.activeRole = roleKey;
    this.publish("roleChanged", { role: roleKey, user: this.state.users[roleKey] });
  }

  getUser() {
    return this.state.users[this.activeRole];
  }

  // Navigation
  setView(viewName, params = {}) {
    this.activeView = viewName;
    this.activeViewParams = params;
    this.publish("viewChanged", { view: viewName, params });
  }

  // Getters
  getCustomers() { return this.state.customers; }
  getStoreLocations() { return this.state.storeLocations; }
  getProducts() { return this.state.products; }
  getPackages() { return this.state.packages; }
  getSubcontractors() { return this.state.subcontractors; }
  getJobs() { return this.state.jobs; }
  getTickets() { return this.state.tickets; }
  getNotifications() { return this.state.notifications; }
  getEmails() { return this.state.emails; }

  getUnreadNotificationsCount() {
    const userRole = this.activeRole;
    return this.state.notifications.filter(n => n.unread && (n.roleTarget === userRole || n.roleTarget === "all")).length;
  }

  markNotificationsAsRead() {
    const userRole = this.activeRole;
    this.state.notifications.forEach(n => {
      if (n.roleTarget === userRole || n.roleTarget === "all") {
        n.unread = false;
      }
    });
    this.save();
    this.publish("notificationsUpdated", {});
  }

  // Module 8.2.1: Customer & Location Intake
  addCustomer(customerData, locations = []) {
    const custId = "CUST-" + String(this.state.customers.length + 1).padStart(3, "0");
    const newCust = {
      id: custId,
      companyName: customerData.companyName,
      accountCode: customerData.accountCode || (customerData.companyName.substring(0, 3).toUpperCase() + "-ENT"),
      tier: customerData.tier || "Gold Tier",
      status: "Active",
      primaryContact: customerData.primaryContact,
      contactTitle: customerData.contactTitle || "Store Operations Lead",
      email: customerData.email,
      phone: customerData.phone,
      billingAddress: customerData.billingAddress,
      storesCount: locations.length,
      activeJobsCount: locations.length,
      openTicketsCount: 0,
      createdAt: new Date().toISOString().split("T")[0]
    };
    this.state.customers.unshift(newCust);

    // Auto create store locations and installation jobs
    locations.forEach((loc, idx) => {
      const locId = "LOC-" + String(Math.floor(1000 + Math.random() * 9000));
      const jobId = "JOB-2026-" + String(this.state.jobs.length + 80 + idx);
      
      const newLoc = {
        id: locId,
        customerId: custId,
        customerName: newCust.companyName,
        storeCode: loc.storeCode || `STR-${idx + 101}`,
        storeName: loc.storeName || `${newCust.companyName} Branch #${idx + 1}`,
        address: loc.address,
        city: loc.city || "London",
        postcode: loc.postcode || "EC1A 1BB",
        region: loc.region || "London",
        siteContact: loc.siteContact || customerData.primaryContact,
        phone: loc.phone || customerData.phone,
        hours: loc.hours || "07:00 - 22:00",
        driveThruType: loc.driveThruType || "Standard Counter / Drive-Thru",
        packageDeployed: loc.packageName || "Drive-Thru Enterprise 6-User Bundle",
        installedUnits: 6,
        originatingJobId: jobId
      };
      this.state.storeLocations.unshift(newLoc);

      // Create installation job per location (Section 8.2.4)
      const newJob = {
        id: jobId,
        jobNumber: jobId,
        customerId: custId,
        customerName: newCust.companyName,
        locationId: locId,
        locationName: newLoc.storeName,
        locationAddress: `${newLoc.address}, ${newLoc.city}, ${newLoc.postcode}`,
        packageId: loc.packageId || "PKG-01",
        packageName: newLoc.packageDeployed,
        quantity: 6,
        assignedSubcontractorId: loc.subcontractorId || "SUB-01",
        assignedSubcontractorName: (this.state.subcontractors.find(s => s.id === loc.subcontractorId) || this.state.subcontractors[0]).name,
        assignedTechName: "Mike Vance",
        status: "Assigned",
        scheduledDate: null,
        completedDate: null,
        actualInstalledUnits: 0,
        installLocationNotes: "",
        technicianDetails: null,
        integrationsCompleted: [],
        checklistCompleted: {},
        photos: [],
        rejectionReason: null,
        createdAt: new Date().toISOString().split("T")[0]
      };
      this.state.jobs.unshift(newJob);

      // Trigger notification & email alert
      this.addNotification({
        roleTarget: "subcontractor",
        type: "job_assigned",
        title: "New Job Assigned: " + newLoc.storeName,
        desc: `${jobId} assigned to ${newJob.assignedSubcontractorName}. Please schedule installation date.`,
        jobId: jobId
      });

      this.addEmailAlert({
        to: "m.vance@apextelecom.co.uk",
        from: "ism-dispatch@quaildigital.com",
        subject: `[NEW JOB ASSIGNMENT] ${jobId} - ${newLoc.storeName}`,
        trigger: "Job Created & Assigned",
        bodyHtml: `
          <div style="font-family: sans-serif; padding: 10px;">
            <h3>New Quail Digital Installation Work Order</h3>
            <p><strong>Customer:</strong> ${newCust.companyName}</p>
            <p><strong>Location:</strong> ${newLoc.storeName} (${newLoc.address}, ${newLoc.city})</p>
            <p><strong>Hardware:</strong> ${newLoc.packageDeployed}</p>
            <p>Please log in to your Subcontractor Portal to schedule the target installation date.</p>
          </div>
        `
      });
    });

    this.save();
    this.publish("customerAdded", newCust);
    return newCust;
  }

  // Module 8.2.4: Job Scheduling
  scheduleJob(jobId, dateStr) {
    const job = this.state.jobs.find(j => j.id === jobId);
    if (!job) return;
    job.scheduledDate = dateStr;
    job.status = "Scheduled";
    this.save();

    this.addNotification({
      roleTarget: "pm",
      type: "date_confirmed",
      title: "Installation Scheduled: " + job.jobNumber,
      desc: `${job.locationName} scheduled for ${dateStr} by ${job.assignedSubcontractorName}.`,
      jobId: job.id
    });

    this.addEmailAlert({
      to: "s.jenkins@quaildigital.com",
      from: "ism-dispatch@quaildigital.com",
      subject: `[DATE CONFIRMED] ${job.jobNumber} Scheduled for ${dateStr}`,
      trigger: "Installation Date Confirmed",
      bodyHtml: `<p>${job.assignedSubcontractorName} confirmed installation date ${dateStr} for ${job.locationName}.</p>`
    });

    this.publish("jobUpdated", job);
  }

  // Module 8.2.5: Subcontractor Field Record Submission
  submitInstallationRecord(jobId, recordData) {
    const job = this.state.jobs.find(j => j.id === jobId);
    if (!job) return;

    job.actualInstalledUnits = parseInt(recordData.actualInstalledUnits) || job.quantity;
    job.installLocationNotes = recordData.installLocationNotes || "";
    job.technicianDetails = {
      techName: recordData.techName || "Mike Vance",
      techPhone: recordData.techPhone || "+44 7700 900142",
      vehicleReg: recordData.vehicleReg || "VK72 XNZ (Transit Custom)",
      siteContactConfirmed: recordData.siteContactConfirmed || "Store Lead"
    };
    job.integrationsCompleted = recordData.integrationsCompleted || [];
    job.checklistCompleted = recordData.checklistCompleted || {};
    job.completedDate = new Date().toISOString().split("T")[0];
    job.status = "Completed by Subcontractor"; // Moves to PM Verification Queue!
    job.rejectionReason = null;

    if (recordData.photos && recordData.photos.length > 0) {
      job.photos = recordData.photos;
    } else if (!job.photos || job.photos.length === 0) {
      // Provide default high-quality uploaded photos if none provided
      job.photos = [
        {
          id: "photo_" + Date.now(),
          url: "./assets/field_install_evidence.jpg",
          title: "Rack Mounted Base Transceiver & 6-Bay Charging Station",
          tag: "Field Evidence",
          notes: "Power grounding verified. Blue Cat6 cabling secured into conduit.",
          annotations: [
            { x: 50, y: 50, text: "Installed equipment verified active" }
          ]
        }
      ];
    }

    this.save();

    // Trigger alert to PM
    this.addNotification({
      roleTarget: "pm",
      type: "verification_needed",
      title: "Verification Queue: " + job.jobNumber,
      desc: `${job.assignedSubcontractorName} completed field installation for ${job.locationName}. Please inspect and verify.`,
      jobId: job.id
    });

    this.addEmailAlert({
      to: "s.jenkins@quaildigital.com",
      from: "ism-alerts@quaildigital.com",
      subject: `[VERIFICATION QUEUE] Submission for ${job.jobNumber} (${job.locationName})`,
      trigger: "Job Submitted for Verification",
      bodyHtml: `
        <div style="font-family: sans-serif; padding: 10px;">
          <h3>Field Installation Record Submitted</h3>
          <p><strong>Subcontractor:</strong> ${job.assignedSubcontractorName} (${job.technicianDetails.techName})</p>
          <p><strong>Units Installed:</strong> ${job.actualInstalledUnits} / ${job.quantity}</p>
          <p><strong>Integrations:</strong> ${job.integrationsCompleted.map(i => i.type).join(", ") || "Standard"}</p>
          <p>Checklist gates verified and photo evidence attached. Please review in the Verification Queue.</p>
        </div>
      `
    });

    this.publish("jobUpdated", job);
  }

  // Module 8.2.6: Verification & Quality Gate
  verifyAndCloseJob(jobId, verificationNotes = "Approved by Project Management") {
    const job = this.state.jobs.find(j => j.id === jobId);
    if (!job) return;

    job.status = "Verified/Closed";
    job.verificationNotes = verificationNotes;
    job.verifiedAt = new Date().toISOString().replace("T", " ").substring(0, 16);
    this.save();

    this.addNotification({
      roleTarget: "subcontractor",
      type: "job_verified",
      title: "Job Verified & Closed: " + job.jobNumber,
      desc: `PM Sarah Jenkins approved your installation record for ${job.locationName}. Job successfully closed.`,
      jobId: job.id
    });

    this.addEmailAlert({
      to: "m.vance@apextelecom.co.uk",
      from: "ism-quality@quaildigital.com",
      subject: `[APPROVED] Job Verified & Closed - ${job.jobNumber} (${job.locationName})`,
      trigger: "Job Verified/Closed",
      bodyHtml: `
        <div style="font-family: sans-serif; padding: 10px;">
          <h3 style="color: #059669;">Installation Quality Verified</h3>
          <p>Your field submission for <strong>${job.locationName}</strong> has been approved and closed.</p>
          <p><strong>Notes:</strong> ${verificationNotes}</p>
          <p>Payment milestone released to accounts.</p>
        </div>
      `
    });

    this.publish("jobUpdated", job);
  }

  rejectJob(jobId, rejectionReason) {
    const job = this.state.jobs.find(j => j.id === jobId);
    if (!job) return;

    job.status = "Rejected – Sent Back";
    job.rejectionReason = rejectionReason || "Incomplete documentation or verification discrepancies.";
    job.rejectedAt = new Date().toISOString().replace("T", " ").substring(0, 16);
    this.save();

    // Urgent notification to Subcontractor
    this.addNotification({
      roleTarget: "subcontractor",
      type: "job_rejected",
      title: "ACTION REQUIRED: Job Rejected - " + job.jobNumber,
      desc: `PM Sarah Jenkins returned ${job.jobNumber}: "${job.rejectionReason}". Please fix and resubmit.`,
      jobId: job.id
    });

    this.addEmailAlert({
      to: "m.vance@apextelecom.co.uk",
      from: "ism-quality@quaildigital.com",
      subject: `[ACTION REQUIRED] Job Rejected - ${job.jobNumber} (${job.locationName})`,
      trigger: "Job Rejected",
      bodyHtml: `
        <div style="font-family: sans-serif; padding: 12px; color: #1e293b;">
          <h3 style="color: #dc2626;">Quality Gate Rejection Notice</h3>
          <p>The installation submission for <strong>${job.jobNumber} (${job.locationName})</strong> has been rejected by Project Management.</p>
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 10px; margin: 12px 0;">
            <strong>Reason for Rejection:</strong><br/>
            ${job.rejectionReason}
          </div>
          <p>Please update the field submission with corrective actions and resubmit.</p>
        </div>
      `
    });

    this.publish("jobUpdated", job);
  }

  // Module 8.2.7: Support Tickets
  createTicket(ticketData) {
    const ticketId = "TICK-2026-" + String(100 + this.state.tickets.length + 1);
    const newTicket = {
      id: ticketId,
      ticketNumber: ticketId,
      customerId: ticketData.customerId,
      customerName: ticketData.customerName,
      locationId: ticketData.locationId,
      locationName: ticketData.locationName,
      originatingJobId: ticketData.originatingJobId || "N/A",
      originatingPackage: ticketData.originatingPackage || "Standard System",
      integrationsOnFile: ticketData.integrationsOnFile || "POS System",
      issueDescription: ticketData.issueDescription,
      resolutionPath: ticketData.resolutionPath || "onsite", // 'onsite' or 'inhouse'
      priority: ticketData.priority || "Medium",
      status: ticketData.resolutionPath === "inhouse" ? "Open" : "Assigned",
      assignedSubcontractorId: ticketData.assignedSubcontractorId || "SUB-01",
      assignedSubcontractorName: ticketData.assignedSubcontractorName || "Apex Telecom Solutions Ltd",
      rmaNumber: ticketData.resolutionPath === "inhouse" ? "RMA-UK-2026-" + Math.floor(9000 + Math.random() * 999) : null,
      courierTracking: null,
      repairTech: ticketData.resolutionPath === "inhouse" ? "Elena Rostova (Lab)" : null,
      dateRaised: new Date().toISOString().replace("T", " ").substring(0, 16),
      resolutionNotes: "",
      documents: [
        { name: "Initial_Incident_Log_v1.0.pdf", size: "320 KB", version: "v1.0", date: new Date().toISOString().split("T")[0] }
      ]
    };

    this.state.tickets.unshift(newTicket);
    this.save();

    this.addNotification({
      roleTarget: newTicket.resolutionPath === "onsite" ? "subcontractor" : "cs",
      type: "ticket_created",
      title: `Support Ticket Raised: ${ticketId} [${newTicket.priority}]`,
      desc: `${newTicket.locationName}: ${newTicket.issueDescription.substring(0, 70)}...`,
      ticketId: ticketId
    });

    this.addEmailAlert({
      to: newTicket.resolutionPath === "onsite" ? "m.vance@apextelecom.co.uk" : "e.rostova@quaildigital.com",
      from: "support-alerts@quaildigital.com",
      subject: `[SUPPORT DISPATCH] ${ticketId} (${newTicket.priority}) - ${newTicket.locationName}`,
      trigger: "Ticket Raised & Assigned",
      bodyHtml: `
        <div style="font-family: sans-serif; padding: 10px;">
          <h3>New After-Sales Support Incident</h3>
          <p><strong>Customer:</strong> ${newTicket.customerName}</p>
          <p><strong>Location:</strong> ${newTicket.locationName}</p>
          <p><strong>Resolution Path:</strong> ${newTicket.resolutionPath === "onsite" ? "On-Site Field Visit" : "In-House Repair (RMA)"}</p>
          <p><strong>Priority:</strong> ${newTicket.priority}</p>
          <p><strong>Issue:</strong> ${newTicket.issueDescription}</p>
        </div>
      `
    });

    this.publish("ticketCreated", newTicket);
    return newTicket;
  }

  updateTicketStatus(ticketId, newStatus, notes = "") {
    const ticket = this.state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    ticket.status = newStatus;
    if (notes) ticket.resolutionNotes = notes;
    if (newStatus === "Repaired" && !ticket.courierTracking) {
      ticket.courierTracking = "DPD-EXP-GB-" + Math.floor(100000 + Math.random() * 900000);
    }
    this.save();

    this.addNotification({
      roleTarget: "all",
      type: "ticket_status_change",
      title: `Ticket ${ticket.ticketNumber} Updated: ${newStatus}`,
      desc: `${ticket.locationName} - Status changed to ${newStatus}.`,
      ticketId: ticket.id
    });

    this.publish("ticketUpdated", ticket);
  }

  // Generic Notification & Email helper
  addNotification(notif) {
    const newNotif = {
      id: "notif_" + Date.now(),
      roleTarget: notif.roleTarget || "all",
      type: notif.type || "info",
      title: notif.title,
      desc: notif.desc,
      time: "Just now",
      unread: true,
      jobId: notif.jobId || null,
      ticketId: notif.ticketId || null
    };
    this.state.notifications.unshift(newNotif);
    this.save();
    this.publish("notificationsUpdated", newNotif);
  }

  addEmailAlert(email) {
    const newEmail = {
      id: "em_" + Date.now(),
      to: email.to,
      from: email.from || "ism-system@quaildigital.com",
      subject: email.subject,
      trigger: email.trigger || "System Event",
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      bodyHtml: email.bodyHtml
    };
    this.state.emails.unshift(newEmail);
    this.save();
    this.publish("emailsUpdated", newEmail);
  }
}

window.appStore = new AppStore();
