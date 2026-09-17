/**
 * Quail Digital ISM - Initial Realistic Mock Datasets
 * Covers Customers, Stores, Products, Subcontractors, Jobs, Tickets, Notifications, and Email Log.
 */

const INITIAL_DATA = {
  // Current active user roles
  users: {
    pm: {
      id: "usr_pm_01",
      role: "pm",
      name: "Sarah Jenkins",
      title: "Senior Project & Operations Manager",
      avatar: "SJ",
      email: "s.jenkins@quaildigital.com",
      company: "Quail Digital HQ (London)"
    },
    subcontractor: {
      id: "usr_sub_01",
      role: "subcontractor",
      name: "Mike Vance",
      title: "Lead Field Systems Engineer",
      avatar: "MV",
      email: "m.vance@apextelecom.co.uk",
      company: "Apex Telecom Solutions"
    },
    cs: {
      id: "usr_cs_01",
      role: "cs",
      name: "Elena Rostova",
      title: "Customer Support & RMA Lead",
      avatar: "ER",
      email: "e.rostova@quaildigital.com",
      company: "Quail Digital Support Desk"
    }
  },

  // Module 8.2.1: Customers
  customers: [
    {
      id: "CUST-001",
      companyName: "McDonald's Restaurants UK Ltd",
      accountCode: "MCD-UK-ENT",
      tier: "Enterprise Plus",
      status: "Active",
      primaryContact: "David Thorne",
      contactTitle: "Head of Store Technology",
      email: "d.thorne@uk.mcd.com",
      phone: "+44 20 7842 1200",
      billingAddress: "11-59 High Road, East Finchley, London N2 8AW",
      storesCount: 42,
      activeJobsCount: 3,
      openTicketsCount: 1,
      createdAt: "2024-03-15"
    },
    {
      id: "CUST-002",
      companyName: "KFC Franchise Holdings (Cotswold)",
      accountCode: "KFC-COT-09",
      tier: "Gold Tier",
      status: "Active",
      primaryContact: "Rachel Adams",
      contactTitle: "Franchise Operations Director",
      email: "radams@cotswoldkfc.co.uk",
      phone: "+44 121 496 0821",
      billingAddress: "Orion House, Longbridge Technology Park, Birmingham B31 2TS",
      storesCount: 18,
      activeJobsCount: 1,
      openTicketsCount: 1,
      createdAt: "2024-08-20"
    },
    {
      id: "CUST-003",
      companyName: "Greggs Bakery Metro Division",
      accountCode: "GRG-MET-03",
      tier: "Gold Tier",
      status: "Active",
      primaryContact: "Mark Wilson",
      contactTitle: "Retail Infrastructure Manager",
      email: "m.wilson@greggs-retail.co.uk",
      phone: "+44 191 212 7600",
      billingAddress: "Fernwood House, Clayton Road, Newcastle NE2 1TL",
      storesCount: 65,
      activeJobsCount: 2,
      openTicketsCount: 0,
      createdAt: "2025-01-10"
    },
    {
      id: "CUST-004",
      companyName: "Costa Coffee Drive-Thru Express",
      accountCode: "COS-DT-44",
      tier: "Enterprise Plus",
      status: "Active",
      primaryContact: "Claire Sterling",
      contactTitle: "Regional Systems Lead",
      email: "c.sterling@costacoffee.co.uk",
      phone: "+44 1582 844000",
      billingAddress: "Costa House, Houghton Hall Business Park, Dunstable LU5 5XG",
      storesCount: 28,
      activeJobsCount: 1,
      openTicketsCount: 1,
      createdAt: "2025-04-12"
    },
    {
      id: "CUST-005",
      companyName: "Nando's Chicken Restaurants Ltd",
      accountCode: "NAN-UK-08",
      tier: "Silver Tier",
      status: "Active",
      primaryContact: "Marcus Gomez",
      contactTitle: "Operations Tech Coordinator",
      email: "m.gomez@nandos.co.uk",
      phone: "+44 20 3828 0700",
      billingAddress: "St Mary's House, 42 Vicarage Crescent, London SW11 3LD",
      storesCount: 14,
      activeJobsCount: 0,
      openTicketsCount: 1,
      createdAt: "2025-06-01"
    }
  ],

  // Store Locations
  storeLocations: [
    {
      id: "LOC-1042",
      customerId: "CUST-001",
      customerName: "McDonald's Restaurants UK Ltd",
      storeCode: "MCD-1042",
      storeName: "McDonald's Solihull Drive-Thru #1042",
      address: "Highlands Road, Shirley",
      city: "Solihull",
      postcode: "B90 4NX",
      region: "Midlands",
      siteContact: "Gary Fletcher (Store Manager)",
      phone: "+44 121 744 3290",
      hours: "24/7 Drive-Thru",
      driveThruType: "Dual Lane Digital",
      packageDeployed: "Drive-Thru Enterprise 6-User Bundle",
      installedUnits: 6,
      originatingJobId: "JOB-2026-081"
    },
    {
      id: "LOC-0312",
      customerId: "CUST-002",
      customerName: "KFC Franchise Holdings (Cotswold)",
      storeCode: "KFC-0312",
      storeName: "KFC Birmingham Bullring #312",
      address: "Unit SU302 Bullring Shopping Centre",
      city: "Birmingham",
      postcode: "B5 4BS",
      region: "Midlands",
      siteContact: "Priya Sharma (Shift Supervisor)",
      phone: "+44 121 643 8911",
      hours: "10:00 - 23:00",
      driveThruType: "Counter & Kitchen Relay",
      packageDeployed: "Retail Floor Team 10-User System",
      installedUnits: 10,
      originatingJobId: "JOB-2026-082"
    },
    {
      id: "LOC-0045",
      customerId: "CUST-003",
      customerName: "Greggs Bakery Metro Division",
      storeCode: "GRG-0045",
      storeName: "Greggs Manchester Piccadilly #045",
      address: "Station Concourse, Piccadilly Station",
      city: "Manchester",
      postcode: "M1 2PB",
      region: "North West",
      siteContact: "Tom Gallagher (Store GM)",
      phone: "+44 161 236 4920",
      hours: "06:00 - 21:00",
      driveThruType: "Express Order Queue",
      packageDeployed: "Retail Floor Team 10-User System",
      installedUnits: 8,
      originatingJobId: "JOB-2026-083"
    },
    {
      id: "LOC-0019",
      customerId: "CUST-004",
      customerName: "Costa Coffee Drive-Thru Express",
      storeCode: "COS-0019",
      storeName: "Costa Coffee Coventry Drive-Thru #019",
      address: "Arena Shopping Park, Classic Drive",
      city: "Coventry",
      postcode: "CV6 6AS",
      region: "Midlands",
      siteContact: "Hannah Bell (Branch Leader)",
      phone: "+44 24 7666 4301",
      hours: "05:30 - 20:30",
      driveThruType: "Single Lane Drive-Thru",
      packageDeployed: "Drive-Thru Enterprise 6-User Bundle",
      installedUnits: 6,
      originatingJobId: "JOB-2026-084"
    },
    {
      id: "LOC-0501",
      customerId: "CUST-005",
      customerName: "Nando's Chicken Restaurants Ltd",
      storeCode: "NAN-0501",
      storeName: "Nando's London Soho #501",
      address: "10 Frith Street, Soho",
      city: "London",
      postcode: "W1D 3JF",
      region: "London",
      siteContact: "Enzo Rossi (General Manager)",
      phone: "+44 20 7494 2200",
      hours: "11:30 - 23:30",
      driveThruType: "Floor-to-Kitchen Intercom",
      packageDeployed: "Retail Floor Team 10-User System",
      installedUnits: 12,
      originatingJobId: "JOB-2026-085"
    }
  ],

  // Module 8.2.2: Product & Package Catalogue
  products: [
    {
      id: "PROD-01",
      code: "QD-PRO9-DT",
      name: "Pro9 Wireless Drive-Thru Headset",
      category: "Hardware",
      type: "Wireless Bluetooth Headset",
      description: "Acoustic noise-cancelling commercial headset with digital beamforming microphone, 12h lithium battery, dual-channel PTT button.",
      price: 285.00,
      image: "./assets/quail_headset.jpg",
      warrantyMonths: 24,
      serviceType: "Field Replaceable / In-House Repair"
    },
    {
      id: "PROD-02",
      code: "QD-PRO10-ML",
      name: "Pro10 Multi-Lane Base Station Transceiver",
      category: "Base Stations",
      type: "Central Controller Transceiver",
      description: "Wall-mounted DECT/Bluetooth central transceiver controller supporting up to 24 simultaneous active headsets, dual drive-thru lanes, and POS relay.",
      price: 1150.00,
      image: "./assets/field_install_evidence.jpg",
      warrantyMonths: 36,
      serviceType: "Field Service / In-House Repair"
    },
    {
      id: "PROD-03",
      code: "QD-QFLEX-RET",
      name: "Q-Flex Ultra-Light Retail Headset",
      category: "Hardware",
      type: "Team Communication Headset",
      description: "Ultra-lightweight 42g retail communications headset with instant push-to-talk, touch mute, magnetic quick-release ear cushions.",
      price: 210.00,
      image: "./assets/quail_headset.jpg",
      warrantyMonths: 24,
      serviceType: "Field Replaceable"
    },
    {
      id: "PROD-04",
      code: "QD-CHG-6X",
      name: "6-Bay Rapid Headset & Battery Charging Dock",
      category: "Charging",
      type: "Intelligent Fast Charger",
      description: "Wall or desktop mountable 6-bay charging station with LED battery health indicators and USB-C diagnostic firmware port.",
      price: 340.00,
      image: "./assets/field_install_evidence.jpg",
      warrantyMonths: 24,
      serviceType: "Swap & Return"
    },
    {
      id: "PROD-05",
      code: "QD-INT-KIT",
      name: "POS & Drive-Thru Audio Relay Integration Module",
      category: "Integrations",
      type: "Interface Hardware",
      description: "Low-voltage relay interface bridging POS ordering systems, vehicle detector loops, and ceiling PA systems into headset audio.",
      price: 490.00,
      image: "./assets/field_install_evidence.jpg",
      warrantyMonths: 24,
      serviceType: "Field Specialist Only"
    }
  ],

  packages: [
    {
      id: "PKG-01",
      code: "PKG-DT-6U",
      name: "Drive-Thru Enterprise 6-User Bundle",
      target: "Single & Dual Lane Quick Service Drive-Thru",
      description: "Complete commercial kit: 1x Pro10 Base Station, 6x Pro9 Wireless Headsets, 1x 6-Bay Rapid Charger, 1x POS Relay Kit.",
      itemsIncluded: ["1x QD-PRO10-ML", "6x QD-PRO9-DT", "1x QD-CHG-6X", "1x QD-INT-KIT"],
      totalHeadsets: 6,
      listPrice: 3450.00
    },
    {
      id: "PKG-02",
      code: "PKG-RET-10U",
      name: "Retail Floor Team 10-User System",
      target: "Supermarkets, Department Stores & Bakeries",
      description: "Full retail team package: 1x Pro10 Base Station, 10x Q-Flex Headsets, 2x 6-Bay Charging Trays.",
      itemsIncluded: ["1x QD-PRO10-ML", "10x QD-QFLEX-RET", "2x QD-CHG-6X"],
      totalHeadsets: 10,
      listPrice: 3890.00
    },
    {
      id: "PKG-03",
      code: "PKG-DT-12ML",
      name: "Multi-Lane Enterprise 12-User System",
      target: "High-Volume Dual Lane Enterprise Drive-Thru",
      description: "High capacity deployment: 2x Pro10 Base Stations, 12x Pro9 Headsets, 2x Chargers, 2x Relay Kits.",
      itemsIncluded: ["2x QD-PRO10-ML", "12x QD-PRO9-DT", "2x QD-CHG-6X", "2x QD-INT-KIT"],
      totalHeadsets: 12,
      listPrice: 6580.00
    }
  ],

  // Module 8.2.3: Subcontractor Master
  subcontractors: [
    {
      id: "SUB-01",
      name: "Apex Telecom Solutions Ltd",
      leadEngineer: "Mike Vance",
      phone: "+44 7700 900142",
      email: "m.vance@apextelecom.co.uk",
      regions: ["Midlands", "London", "South East"],
      skills: ["Drive-Thru Audio", "POS Relay Integration", "RF Diagnostics", "Acoustic Tuning"],
      activeJobs: 3,
      completedJobs: 84,
      slaScore: "98.4%",
      avgTurnaroundDays: 2.1,
      status: "Active"
    },
    {
      id: "SUB-02",
      name: "FastWire Field Services",
      leadEngineer: "Dave Higgins",
      phone: "+44 7700 900551",
      email: "d.higgins@fastwirefields.co.uk",
      regions: ["North West", "Yorkshire", "North East"],
      skills: ["Commercial Audio", "Structured Cabling", "Walkie-Talkie Relay", "PA Systems"],
      activeJobs: 2,
      completedJobs: 56,
      slaScore: "95.1%",
      avgTurnaroundDays: 3.4,
      status: "Active"
    },
    {
      id: "SUB-03",
      name: "Midlands Radio & Comms Co.",
      leadEngineer: "Simon Bell",
      phone: "+44 7700 900892",
      email: "s.bell@midlandsradio.com",
      regions: ["Midlands", "Wales"],
      skills: ["Wireless RF", "Drive-Thru Acoustics", "Custom API Relay"],
      activeJobs: 1,
      completedJobs: 38,
      slaScore: "92.0%",
      avgTurnaroundDays: 2.8,
      status: "Active"
    },
    {
      id: "SUB-04",
      name: "Caledonian Tech Logistics",
      leadEngineer: "Fiona Campbell",
      phone: "+44 7700 900339",
      email: "f.campbell@caledoniantech.co.uk",
      regions: ["Scotland", "North East"],
      skills: ["Enterprise Comms", "CCTV Notification Link", "POS Systems"],
      activeJobs: 1,
      completedJobs: 41,
      slaScore: "96.8%",
      avgTurnaroundDays: 2.5,
      status: "Active"
    }
  ],

  // Integration types available in Section 8.2.5
  predefinedIntegrations: [
    "POS System",
    "Walkie-Talkie Relay",
    "PA System",
    "CRM Sync",
    "Custom API",
    "Intercom",
    "Queue Management",
    "Digital Signage",
    "CCTV Notification Link"
  ],

  // Pre-work checklist items
  preWorkChecklistTemplate: [
    { id: "chk_1", title: "RF spectrum background sweep conducted (< -85dBm noise floor)", required: true },
    { id: "chk_2", title: "Mains 230V AC socket tested for continuous earth grounding", required: true },
    { id: "chk_3", title: "Drive-Thru acoustic vehicle detector loop checked for cross-chatter", required: true },
    { id: "chk_4", title: "All headset charging bay contacts cleaned & verified delivering 5.0V", required: true },
    { id: "chk_5", title: "Store Duty Manager briefed on daily sanitisation & battery rotation protocol", required: true }
  ],

  // Module 8.2.4 & 8.2.6: Installation Jobs
  jobs: [
    {
      id: "JOB-2026-081",
      jobNumber: "JOB-2026-081",
      customerId: "CUST-001",
      customerName: "McDonald's Restaurants UK Ltd",
      locationId: "LOC-1042",
      locationName: "McDonald's Solihull Drive-Thru #1042",
      locationAddress: "Highlands Road, Shirley, Solihull, B90 4NX",
      packageId: "PKG-01",
      packageName: "Drive-Thru Enterprise 6-User Bundle",
      quantity: 6,
      assignedSubcontractorId: "SUB-01",
      assignedSubcontractorName: "Apex Telecom Solutions Ltd",
      assignedTechName: "Mike Vance",
      // Lifecycle: Created > Assigned > Scheduled > In Progress > Completed by Subcontractor > Verified/Closed (or Rejected)
      status: "Completed by Subcontractor", // PENDING VERIFICATION by PM!
      scheduledDate: "2026-09-14",
      completedDate: "2026-09-16",
      actualInstalledUnits: 6,
      installLocationNotes: "Base Station wall-mounted in Back-Office server bay at 2.1m. 6-bay dock mounted adjacent to order prep station with dedicated 13A surge socket.",
      technicianDetails: {
        techName: "Mike Vance",
        techPhone: "+44 7700 900142",
        vehicleReg: "VK72 XNZ (Ford Transit Custom Tech Van)",
        siteContactConfirmed: "Gary Fletcher (Store Manager)"
      },
      integrationsCompleted: [
        { type: "POS System", details: "NCR Aloha POS ordering terminal audio tap into headset ch 1" },
        { type: "PA System", details: "Overhead kitchen expediter announcement relay" },
        { type: "Queue Management", details: "Drive-thru timer sensor beep triggered on headset" }
      ],
      checklistCompleted: {
        chk_1: true,
        chk_2: true,
        chk_3: true,
        chk_4: true,
        chk_5: true
      },
      photos: [
        {
          id: "photo_081_1",
          url: "./assets/field_install_evidence.jpg",
          title: "Wall Rack Mounting & 6-Bay Charging Dock",
          tag: "Charging Dock & Transceiver",
          notes: "Base station transceiver anchored into block wall with blue Cat6 patch leads neatly bound with velcro ties.",
          annotations: [
            { x: 58, y: 15, text: "Central PoE Switch & Cat6 blue data line drops to POS terminals" },
            { x: 45, y: 55, text: "6x Pro9 Bluetooth Headsets docked; green charging LED indicators active" },
            { x: 80, y: 50, text: "Protective conduit for 230V clean power feed" }
          ]
        },
        {
          id: "photo_081_2",
          url: "./assets/quail_headset.jpg",
          title: "Pro9 Wireless Headset Operational Test",
          tag: "Headset Inspection",
          notes: "Acoustic audio verification passed at 98dB SPL clean output with background fryer noise cancellation active.",
          annotations: [
            { x: 50, y: 45, text: "Acoustic beamforming boom mic aligned to technician mouth distance" },
            { x: 48, y: 72, text: "Cyan LED paired solid status on base channel A" }
          ]
        }
      ],
      rejectionReason: null,
      verificationNotes: null,
      createdAt: "2026-09-02"
    },
    {
      id: "JOB-2026-082",
      jobNumber: "JOB-2026-082",
      customerId: "CUST-002",
      customerName: "KFC Franchise Holdings (Cotswold)",
      locationId: "LOC-0312",
      locationName: "KFC Birmingham Bullring #312",
      locationAddress: "Unit SU302 Bullring Shopping Centre, Birmingham, B5 4BS",
      packageId: "PKG-02",
      packageName: "Retail Floor Team 10-User System",
      quantity: 10,
      assignedSubcontractorId: "SUB-02",
      assignedSubcontractorName: "FastWire Field Services",
      assignedTechName: "Dave Higgins",
      status: "Rejected – Sent Back", // REJECTED - SENT BACK!
      scheduledDate: "2026-09-12",
      completedDate: "2026-09-15",
      actualInstalledUnits: 8, // discrepancy!
      installLocationNotes: "Installed 8 units on wall shelf. Missing 2 units due to broken charging slot.",
      technicianDetails: {
        techName: "Dave Higgins",
        techPhone: "+44 7700 900551",
        vehicleReg: "DX21 TPO (Renault Trafic)",
        siteContactConfirmed: "Priya Sharma (Shift Supervisor)"
      },
      integrationsCompleted: [
        { type: "Walkie-Talkie Relay", details: "Connected to Motorola DP1400 store walkie" }
      ],
      checklistCompleted: {
        chk_1: true,
        chk_2: true,
        chk_3: false,
        chk_4: true,
        chk_5: true
      },
      photos: [
        {
          id: "photo_082_1",
          url: "./assets/field_install_evidence.jpg",
          title: "Preliminary Equipment Setup",
          tag: "Equipment Rack",
          notes: "Installed 8 headsets. Awaiting 2 spare batteries.",
          annotations: [
            { x: 35, y: 60, text: "Slot 5 and 6 empty" }
          ]
        }
      ],
      rejectionReason: "REJECTED BY PM (Sarah Jenkins): Contract stipulates 10 installed units, but field submission states only 8 units deployed. Missing photo evidence of the POS relay audio connection, and Checklist Item 3 was skipped. Please revisit site with remaining 2 replacement headsets and provide complete evidence.",
      rejectedAt: "2026-09-16 14:15",
      createdAt: "2026-09-04"
    },
    {
      id: "JOB-2026-083",
      jobNumber: "JOB-2026-083",
      customerId: "CUST-003",
      customerName: "Greggs Bakery Metro Division",
      locationId: "LOC-0045",
      locationName: "Greggs Manchester Piccadilly #045",
      locationAddress: "Station Concourse, Piccadilly Station, Manchester, M1 2PB",
      packageId: "PKG-02",
      packageName: "Retail Floor Team 10-User System",
      quantity: 8,
      assignedSubcontractorId: "SUB-01",
      assignedSubcontractorName: "Apex Telecom Solutions Ltd",
      assignedTechName: "Mike Vance",
      status: "Assigned", // Awaiting Subcontractor scheduling
      scheduledDate: null,
      completedDate: null,
      actualInstalledUnits: 0,
      installLocationNotes: "",
      technicianDetails: null,
      integrationsCompleted: [],
      checklistCompleted: {},
      photos: [],
      rejectionReason: null,
      createdAt: "2026-09-15"
    },
    {
      id: "JOB-2026-084",
      jobNumber: "JOB-2026-084",
      customerId: "CUST-004",
      customerName: "Costa Coffee Drive-Thru Express",
      locationId: "LOC-0019",
      locationName: "Costa Coffee Coventry Drive-Thru #019",
      locationAddress: "Arena Shopping Park, Classic Drive, Coventry, CV6 6AS",
      packageId: "PKG-01",
      packageName: "Drive-Thru Enterprise 6-User Bundle",
      quantity: 6,
      assignedSubcontractorId: "SUB-03",
      assignedSubcontractorName: "Midlands Radio & Comms Co.",
      assignedTechName: "Simon Bell",
      status: "Scheduled",
      scheduledDate: "2026-09-22",
      completedDate: null,
      actualInstalledUnits: 0,
      installLocationNotes: "",
      technicianDetails: null,
      integrationsCompleted: [],
      checklistCompleted: {},
      photos: [],
      rejectionReason: null,
      createdAt: "2026-09-10"
    },
    {
      id: "JOB-2026-085",
      jobNumber: "JOB-2026-085",
      customerId: "CUST-005",
      customerName: "Nando's Chicken Restaurants Ltd",
      locationId: "LOC-0501",
      locationName: "Nando's London Soho #501",
      locationAddress: "10 Frith Street, Soho, London, W1D 3JF",
      packageId: "PKG-02",
      packageName: "Retail Floor Team 10-User System",
      quantity: 12,
      assignedSubcontractorId: "SUB-01",
      assignedSubcontractorName: "Apex Telecom Solutions Ltd",
      assignedTechName: "Mike Vance",
      status: "Verified/Closed",
      scheduledDate: "2026-08-28",
      completedDate: "2026-09-01",
      actualInstalledUnits: 12,
      installLocationNotes: "Installed on server rack in mezzanine office. 12x headsets fully synced and distributed across 2 charging trays.",
      technicianDetails: {
        techName: "Mike Vance",
        techPhone: "+44 7700 900142",
        vehicleReg: "VK72 XNZ",
        siteContactConfirmed: "Enzo Rossi"
      },
      integrationsCompleted: [
        { type: "Intercom", details: "Kitchen prep table intercom interface" }
      ],
      checklistCompleted: { chk_1: true, chk_2: true, chk_3: true, chk_4: true, chk_5: true },
      photos: [
        {
          id: "photo_085_1",
          url: "./assets/field_install_evidence.jpg",
          title: "Final Verified Installation",
          tag: "Verified Rack",
          notes: "Approved by PM Sarah Jenkins on 2026-09-02.",
          annotations: []
        }
      ],
      rejectionReason: null,
      verificationNotes: "All 12 units verified working, crystal clear audio, manager signed off.",
      createdAt: "2026-08-20"
    }
  ],

  // Module 8.2.7: Support Tickets
  tickets: [
    {
      id: "TICK-2026-104",
      ticketNumber: "TICK-2026-104",
      customerId: "CUST-001",
      customerName: "McDonald's Restaurants UK Ltd",
      locationId: "LOC-1042",
      locationName: "McDonald's Solihull Drive-Thru #1042",
      originatingJobId: "JOB-2026-081",
      originatingPackage: "Drive-Thru Enterprise 6-User Bundle (Installed 2026-09-16)",
      integrationsOnFile: "POS System (NCR Aloha), PA System, Queue Management",
      issueDescription: "Intermittent carrier signal dropout on order headset #2 during peak lunch drive-thru hours. Suspected microwave oven interference in assembly lane.",
      resolutionPath: "onsite", // 'onsite' or 'inhouse'
      priority: "High",
      // Lifecycle: Open > Assigned > In Progress > Resolved > Closed
      status: "In Progress",
      assignedSubcontractorId: "SUB-01",
      assignedSubcontractorName: "Apex Telecom Solutions Ltd",
      dateRaised: "2026-09-16 16:30",
      resolutionNotes: "Subcontractor Mike Vance en route to test frequency channel hopping configuration on Pro10 base station.",
      documents: [
        { name: "Site_Acoustic_Fault_Log_v1.0.pdf", size: "420 KB", version: "v1.0", date: "2026-09-16" }
      ]
    },
    {
      id: "TICK-2026-105",
      ticketNumber: "TICK-2026-105",
      customerId: "CUST-002",
      customerName: "KFC Franchise Holdings (Cotswold)",
      locationId: "LOC-0312",
      locationName: "KFC Birmingham Bullring #312",
      originatingJobId: "JOB-2026-082",
      originatingPackage: "Retail Floor Team 10-User System",
      integrationsOnFile: "Walkie-Talkie Relay (Motorola DP1400)",
      issueDescription: "Pro9 headset dropped on tiled floor; microphone boom snapped and audio crackles. Unit needs chassis replacement and bench diagnostic recalibration.",
      resolutionPath: "inhouse", // 'inhouse'
      priority: "Medium",
      // Sub-status for inhouse: Open > Sent for Repair > Repaired > Returned to Customer > Closed
      status: "Sent for Repair",
      rmaNumber: "RMA-UK-2026-9942",
      courierTracking: "DPD-EXPRESS-GB-8823901",
      repairTech: "Elena Rostova (In-House Bench Lab)",
      dateRaised: "2026-09-15 11:00",
      repairNotes: "Replacement chassis frame and mic flex cable allocated from spares inventory.",
      documents: [
        { name: "RMA_Form_RMA-9942_v1.0.pdf", size: "310 KB", version: "v1.0", date: "2026-09-15" },
        { name: "DPD_Courier_Waybill_v1.1.pdf", size: "185 KB", version: "v1.1", date: "2026-09-15" }
      ]
    },
    {
      id: "TICK-2026-106",
      ticketNumber: "TICK-2026-106",
      customerId: "CUST-005",
      customerName: "Nando's Chicken Restaurants Ltd",
      locationId: "LOC-0501",
      locationName: "Nando's London Soho #501",
      originatingJobId: "JOB-2026-085",
      originatingPackage: "Retail Floor Team 10-User System (12 Units Installed)",
      integrationsOnFile: "Intercom Kitchen Relay",
      issueDescription: "Base Station Transceiver power board damaged following sudden restaurant electrical surge. Unit brought to London repair depot.",
      resolutionPath: "inhouse",
      priority: "Critical",
      status: "Repaired", // Repaired, awaiting customer return shipment!
      rmaNumber: "RMA-UK-2026-9938",
      courierTracking: "DHL-EXPRESS-9921102",
      repairTech: "Sarah Jenkins & Bench Team",
      dateRaised: "2026-09-12 09:20",
      repairNotes: "Power supply capacitors replaced, firmware flashed to v4.8.1. 48-hour continuous soak test successfully completed with zero faults.",
      documents: [
        { name: "Bench_Diagnostic_Report_v1.0.pdf", size: "640 KB", version: "v1.0", date: "2026-09-13" },
        { name: "Component_Replacement_Spec_v1.2.pdf", size: "290 KB", version: "v1.2", date: "2026-09-14" }
      ]
    },
    {
      id: "TICK-2026-107",
      ticketNumber: "TICK-2026-107",
      customerId: "CUST-004",
      customerName: "Costa Coffee Drive-Thru Express",
      locationId: "LOC-0019",
      locationName: "Costa Coffee Coventry Drive-Thru #019",
      originatingJobId: "JOB-2026-084",
      originatingPackage: "Drive-Thru Enterprise 6-User Bundle",
      integrationsOnFile: "Walkie-Talkie Relay",
      issueDescription: "Excessive background bleed from walkie-talkie relay into order window headset. High gain setting suspected.",
      resolutionPath: "onsite",
      priority: "Medium",
      status: "Resolved",
      assignedSubcontractorId: "SUB-03",
      assignedSubcontractorName: "Midlands Radio & Comms Co.",
      dateRaised: "2026-09-11 14:00",
      resolutionNotes: "Attended on site 2026-09-13. Replaced audio isolating transformer on relay tap and calibrated input gain from +12dB to +3dB. Clean audio verified by branch manager Hannah Bell.",
      documents: [
        { name: "Field_Signoff_Sheet_v1.0.pdf", size: "520 KB", version: "v1.0", date: "2026-09-13" }
      ]
    }
  ],

  // Module 8.2.8: Notifications (in-app dropdown)
  notifications: [
    {
      id: "notif_1",
      roleTarget: "pm",
      type: "verification_needed",
      title: "Field Installation Submitted - Verification Required",
      desc: "Mike Vance (Apex Telecom) submitted completed installation record for McDonald's Solihull #1042 (JOB-2026-081).",
      time: "15 mins ago",
      unread: true,
      jobId: "JOB-2026-081"
    },
    {
      id: "notif_2",
      roleTarget: "subcontractor",
      type: "job_rejected",
      title: "ACTION REQUIRED: Installation Job Rejected",
      desc: "JOB-2026-082 (KFC Bullring #312) was rejected by PM Sarah Jenkins: 'Missing photo of POS relay interface; units count discrepancy'.",
      time: "2 hours ago",
      unread: true,
      jobId: "JOB-2026-082"
    },
    {
      id: "notif_3",
      roleTarget: "subcontractor",
      type: "job_assigned",
      title: "New Job Assigned",
      desc: "Greggs Manchester Piccadilly #045 (JOB-2026-083) assigned to Apex Telecom. Please confirm target install date.",
      time: "4 hours ago",
      unread: true,
      jobId: "JOB-2026-083"
    },
    {
      id: "notif_4",
      roleTarget: "cs",
      type: "ticket_repaired",
      title: "RMA Hardware Repaired",
      desc: "Base Transceiver for Nando's Soho #501 (TICK-2026-106) passed bench testing and is ready for return courier dispatch.",
      time: "5 hours ago",
      unread: true,
      ticketId: "TICK-2026-106"
    },
    {
      id: "notif_5",
      roleTarget: "all",
      type: "date_confirmed",
      title: "Installation Date Scheduled",
      desc: "Costa Coffee Coventry Drive-Thru #019 scheduled for field install on 2026-09-22 by Midlands Radio & Comms.",
      time: "Yesterday",
      unread: false,
      jobId: "JOB-2026-084"
    }
  ],

  // Module 8.2.8: Rich Email Alerts Log (simulating in-app email templates)
  emails: [
    {
      id: "em_001",
      to: "m.vance@apextelecom.co.uk",
      from: "ism-alerts@quaildigital.com",
      subject: "[ACTION REQUIRED] Installation Job Rejected - JOB-2026-082 (KFC Bullring #312)",
      trigger: "Job Verification Rejected",
      date: "2026-09-16 14:16",
      bodyHtml: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #1e293b;">
          <div style="background: #ef4444; color: #ffffff; padding: 12px 16px; border-radius: 6px; font-weight: bold;">
            Quality Gate Notice: Installation Record Returned with Rejection Reason
          </div>
          <p style="margin-top: 16px;">Dear Mike,</p>
          <p>The installation record submitted for <strong>JOB-2026-082 (KFC Birmingham Bullring #312)</strong> has been reviewed by Project Management and failed the quality verification gate.</p>
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0; color: #991b1b;">
            <strong>PM Rejection Reason:</strong><br/>
            Contract stipulates 10 installed units, but field submission states only 8 units deployed. Missing photo evidence of the POS relay audio connection, and Checklist Item 3 was skipped. Please revisit site with remaining 2 replacement headsets and provide complete evidence.
          </div>
          <p>This job has been automatically returned to your active queue. Please complete the missing requirements and resubmit through the Quail Digital Field Portal.</p>
          <p>Best regards,<br/><strong>Sarah Jenkins</strong><br/>Operations & Quality Gate Lead | Quail Digital</p>
        </div>
      `
    },
    {
      id: "em_002",
      to: "s.jenkins@quaildigital.com",
      from: "ism-alerts@quaildigital.com",
      subject: "[VERIFICATION PENDING] Field Installation Submitted - JOB-2026-081 (McDonald's Solihull #1042)",
      trigger: "Job Record Submitted",
      date: "2026-09-16 13:45",
      bodyHtml: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #1e293b;">
          <div style="background: #0284c7; color: #ffffff; padding: 12px 16px; border-radius: 6px; font-weight: bold;">
            Field Submission Alert: Ready for Quality Review
          </div>
          <p style="margin-top: 16px;">Hi Sarah,</p>
          <p>Subcontractor <strong>Apex Telecom Solutions (Mike Vance)</strong> has completed field installation for:</p>
          <ul>
            <li><strong>Customer:</strong> McDonald's Restaurants UK Ltd</li>
            <li><strong>Location:</strong> Solihull Drive-Thru #1042</li>
            <li><strong>Package:</strong> Drive-Thru Enterprise 6-User Bundle (6/6 units installed)</li>
            <li><strong>Integrations Completed:</strong> POS System, PA System, Queue Management</li>
          </ul>
          <p>Pre-work checklist items (5/5) and photo evidence with technical annotations have been uploaded and are waiting in your Verification Queue.</p>
          <p>Best regards,<br/>Quail Digital ISM Automated Dispatch</p>
        </div>
      `
    },
    {
      id: "em_003",
      to: "m.vance@apextelecom.co.uk",
      from: "ism-alerts@quaildigital.com",
      subject: "[NEW ASSIGNMENT] Installation Job Created - JOB-2026-083 (Greggs Manchester Piccadilly)",
      trigger: "Job Assigned to Subcontractor",
      date: "2026-09-15 09:30",
      bodyHtml: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #1e293b;">
          <div style="background: #10b981; color: #ffffff; padding: 12px 16px; border-radius: 6px; font-weight: bold;">
            New Work Order Assignment
          </div>
          <p style="margin-top: 16px;">Hello Mike,</p>
          <p>You have been assigned a new installation project for <strong>Greggs Bakery Metro Division (Manchester Piccadilly #045)</strong>.</p>
          <p><strong>Package:</strong> Retail Floor Team 10-User System (8 Headsets, Base Station, 2x Chargers).</p>
          <p>Please log into your Subcontractor Portal and propose/confirm the target installation date.</p>
          <p>Quail Digital Project Management Office</p>
        </div>
      `
    },
    {
      id: "em_004",
      to: "m.gomez@nandos.co.uk",
      from: "support@quaildigital.com",
      subject: "[REPAIR UPDATE] Hardware Repaired & Dispatched - Ticket TICK-2026-106",
      trigger: "In-House Repair Status Change",
      date: "2026-09-14 17:00",
      bodyHtml: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #1e293b;">
          <div style="background: #8b5cf6; color: #ffffff; padding: 12px 16px; border-radius: 6px; font-weight: bold;">
            Quail Digital In-House Repair Depot Update
          </div>
          <p style="margin-top: 16px;">Dear Marcus,</p>
          <p>Good news! The Base Transceiver for <strong>Nando's Soho #501 (RMA-UK-2026-9938)</strong> has passed full bench testing, power supply repairs, and 48-hour burn-in diagnostics.</p>
          <p>Courier tracking reference: <strong>DHL-EXPRESS-9921102</strong>.</p>
          <p>Warm regards,<br/><strong>Elena Rostova</strong><br/>Customer Service & RMA Support | Quail Digital</p>
        </div>
      `
    }
  ]
};
