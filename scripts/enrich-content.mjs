/* Content enrichment pass: deepen thin pages to ~6-8 sections with real,
   domain-accurate copy, and point the Supcon/Cimarron/Keckonn brand pages at
   relevant photos we actually have (official product shots remain a client TBC).
   Non-destructive to the schema; re-runnable (keyed by section id).
   Run:  node scripts/enrich-content.mjs   then  node scripts/split-content.mjs    */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const FILE = join(ROOT, "zicom-site-content.json");
const data = JSON.parse(readFileSync(FILE, "utf8"));
const bySlug = (s) => data.pages.find((p) => p.slug === s);

/* insert sections before the trailing siblings/cta block */
function addSections(slug, sections) {
  const p = bySlug(slug); if (!p) { console.warn("missing page", slug); return; }
  p.sections = p.sections || [];
  const have = new Set(p.sections.map((s) => s.id));
  const fresh = sections.filter((s) => !have.has(s.id));
  let at = p.sections.findIndex((s) => s.type === "siblings" || s.type === "cta");
  if (at === -1) at = p.sections.length;
  p.sections.splice(at, 0, ...fresh);
}
function setHeroImage(slug, src, alt) {
  const p = bySlug(slug); if (!p || !p.hero) return;
  p.hero.image = { src, alt };
}
function replaceText(slug, id, text) {
  const p = bySlug(slug); if (!p) return;
  const s = (p.sections || []).find((x) => x.id === id);
  if (s) s.text = text;
}

/* real photos we hold that match each brand's domain */
const IMG_CONTROL = "/images/80-mmscfd-compressor-station-titas-loce-5.jpg";   // DCS/SCADA control room
const IMG_FLARE = "/images/80-mmscfd-compressor-station-titas-loce-1.jpg";     // process skids + flare stack
const IMG_METERING = "/images/50-mmscfd-laksam-ms-1.jpg";                      // metering runs / valves
const IMG_FILTER = "/images/50-mmscfd-laksam-ms-2.jpg";                        // filter separators

/* =========================================================================
   BRAND PAGES
   ========================================================================= */

/* ---- Supcon (control systems) ---- */
setHeroImage("/products/supcon", IMG_CONTROL, "DCS and SCADA screens in a Zicom-commissioned control room");
replaceText("/products/supcon", "partnership",
  "As an authorized channel partner we size, supply, engineer, commission and support Supcon platforms in Bangladesh — not just resell them. That means local application engineering, configuration and graphics, FAT and SAT, on-site commissioning and a first line of technical support from engineers who have deployed these systems in the field.");
addSections("/products/supcon", [
  { type: "cards", id: "supcon-families", title: "Platforms we deploy", items: [
    { title: "ECS-700 DCS", text: "Distributed control for continuous process plants — redundant controllers, deterministic I/O and integrated historian for gas processing and compression." },
    { title: "TCS-900 SIS", text: "Safety instrumented system to IEC 61508 / 61511, built for SIL-rated emergency shutdown, fire & gas and burner management duties." },
    { title: "Nyx UCS", text: "Universal control system that converges DCS, PLC and SIS functions on one engineering environment for smaller or hybrid plants." },
  ]},
  { type: "text-image", id: "supcon-field", imageSide: "right",
    eyebrow: "In the field", title: "Engineered and commissioned locally",
    subtitle: "Supcon is the platform; the configuration, graphics and start-up are ours.",
    paragraphs: ["Our engineers build the control narrative, I/O database and operator graphics, run factory and site acceptance tests, and lead commissioning and operator training — so the plant is handed over running, with a team in-country that knows the system."],
    image: { src: IMG_CONTROL, alt: "DCS and SCADA operator screens in a control room" },
    link: { label: "Our commissioning service", href: "/services/installation-commissioning" } },
  { type: "list", id: "supcon-apps", title: "Where we apply it", items: [
    "Gas process plants and dehydration units", "Compressor station control", "City gate and metering station automation",
    "Emergency shutdown and fire & gas systems", "Brownfield DCS migrations and upgrades", "Plant-wide historian and reporting",
  ]},
]);

/* ---- Cimarron (flare & emissions) ---- */
setHeroImage("/products/cimarron", IMG_FLARE, "Process skids and flare stack at a Zicom-built compressor station");
replaceText("/products/cimarron", "overview",
  "Cimarron engineers combustion and emissions-control equipment for oil & gas — flares, combustors and vapor recovery. We bring that equipment, and the engineering to integrate it, to plants and terminals in Bangladesh where safe disposal of relief and waste gas is a permit and safety requirement.");
addSections("/products/cimarron", [
  { type: "cards", id: "cimarron-families", title: "Equipment we supply", items: [
    { title: "Enclosed & ground flares", text: "Smokeless, radiation-controlled combustion with the flame shielded from view — for sites with strict visibility or thermal-radiation limits." },
    { title: "Elevated flares", text: "Utility and emergency flare stacks sized for peak relief loads, with reliable ignition and flame monitoring." },
    { title: "Vapor recovery units", text: "Recover hydrocarbon vapors from tanks and loading instead of flaring them — cutting emissions and recovering product." },
    { title: "Combustors", text: "Enclosed combustors for continuous low-volume waste-gas streams where destruction efficiency must be demonstrable." },
  ]},
  { type: "list", id: "cimarron-deliver", title: "What we deliver with it", items: [
    "Relief and waste-gas load analysis", "Flare / combustor sizing and selection", "Ignition, pilot and flame-monitoring controls",
    "Skid integration with the plant control system", "Installation, commissioning and start-up", "Spares and after-sales support",
  ]},
  { type: "text-image", id: "cimarron-compliance", imageSide: "left",
    eyebrow: "Why it matters", title: "Safe disposal, on the record",
    subtitle: "Flaring and vapor control are safety barriers and permit conditions, not afterthoughts.",
    paragraphs: ["A correctly sized, reliably ignited flare protects the plant during upset and relief events; vapor recovery keeps routine emissions within limits. We engineer the package into the wider facility so the controls, interlocks and documentation line up with the rest of the plant."],
    image: { src: IMG_FLARE, alt: "Flare stack beside process skids" },
    link: { label: "Safety instrumented systems", href: "/solutions/process-automation/sis" } },
]);

/* ---- Keckonn / KCON (valves & actuators) ---- */
setHeroImage("/products/keckonn", IMG_METERING, "Valves and metering runs at a Zicom-built station");
addSections("/products/keckonn", [
  { type: "richtext", id: "keckonn-overview", title: "Overview",
    text: "Keckonn supplies industrial valves and valve automation for gas and process service. We hold the agency, specify the right valve and actuator for the duty, and stock spares locally so a station is never waiting on a long import lead time for a routine part." },
  { type: "cards", id: "keckonn-families", title: "The range we represent", items: [
    { title: "Ball & plug valves", text: "Quarter-turn isolation for gas and liquid service, soft- and metal-seated, in the pressure classes used on transmission and distribution." },
    { title: "Gate, globe & check valves", text: "Isolation, throttling and non-return valves for process and utility lines." },
    { title: "Actuators & automation", text: "Pneumatic, gas-over-oil, electric and manual gear operators, with limit switches and positioners for remote and automated control." },
  ]},
  { type: "list", id: "keckonn-apps", title: "Typical applications", items: [
    "Station isolation and blow-down", "Regulating and metering skids", "Compressor station manifolds",
    "ESD and shutdown valves", "Pipeline block and bypass", "Industrial process lines",
  ]},
  { type: "text-image", id: "keckonn-field", imageSide: "right",
    eyebrow: "Supported locally", title: "The valve is only half the job",
    subtitle: "Selection, actuation and spares decide whether it keeps working.",
    paragraphs: ["We match valve and actuator to the service conditions, supply them as part of the skid or station scope, and keep common spares in country — so maintenance is a same-week job, not an import project."],
    image: { src: IMG_METERING, alt: "Valves and metering runs under a canopy" },
    link: { label: "Field & bench calibration", href: "/services/field-calibration" } },
]);

/* =========================================================================
   PRODUCTS OVERVIEW
   ========================================================================= */
addSections("/products", [
  { type: "richtext", id: "products-intro", title: "Partner brands, supported locally",
    text: "We represent a focused set of control, instrumentation and valve manufacturers and back them with in-country engineering and spares. You get proven global equipment with a local team that specifies it, commissions it and supports it after handover." },
  { type: "cards", id: "products-categories", title: "What we supply", items: [
    { title: "Control & instrumentation", text: "DCS, SIS and SCADA platforms, industrial connectivity and networking, and gas flow metering.", link: { label: "Supcon", href: "/products/supcon" } },
    { title: "Valves & process equipment", text: "Control valves, manual valves and actuators, and flare and emissions packages.", link: { label: "Keckonn valves", href: "/products/keckonn" } },
    { title: "Flow & measurement", text: "Ultrasonic gas flow meters and flow computers for custody-grade measurement.", link: { label: "NexVal", href: "/products/nexval" } },
  ]},
  { type: "stats", id: "products-stats", title: "Represented in Bangladesh", items: [
    { value: "7", label: "Partner brands represented" },
    { value: "Local", label: "Spares held in country" },
    { value: "FAT→SAT", label: "Engineered and commissioned by us" },
  ]},
]);

/* =========================================================================
   SOLUTIONS OVERVIEW
   ========================================================================= */
addSections("/solutions", [
  { type: "richtext", id: "solutions-intro", title: "One team, from design to year fifteen",
    text: "Zicom engineers, procures, builds and commissions energy and automation infrastructure — then supports it. Because the same team owns the process, the control system and the construction, the pieces fit the first time and there is one accountable party from FEED to long-term operations." },
  { type: "stats", id: "solutions-stats", title: "Track record", items: [
    { value: "50+", label: "Stations and plants delivered" },
    { value: "20+", label: "Years in oil & gas EPC" },
    { value: "3", label: "Core disciplines under one roof" },
  ]},
]);

/* =========================================================================
   SERVICES OVERVIEW
   ========================================================================= */
addSections("/services", [
  { type: "richtext", id: "services-intro", title: "Engineering before the build, support after handover",
    text: "Our services bracket the project: front-end engineering and consulting that de-risk the design, installation and commissioning that get the plant running, and the calibration, spares and after-sales support that keep it running for years." },
  { type: "steps", id: "services-lifecycle", title: "Across the lifecycle", items: [
    { title: "Engineer", text: "FEED studies and process automation consulting." },
    { title: "Deliver", text: "Installation, commissioning and start-up." },
    { title: "Sustain", text: "After-sales service, calibration and spares." },
    { title: "Improve", text: "Brownfield upgrades, leak detection and training." },
  ]},
]);

/* =========================================================================
   RESOURCES OVERVIEW
   ========================================================================= */
addSections("/resources", [
  { type: "richtext", id: "resources-intro", title: "What we know, shared",
    text: "Project news, field notes and plain-language guides to specifying control systems, valves and metering. Written by the engineers who build and commission these systems — meant to be lifted straight into a tender or a design basis." },
  { type: "feature", id: "resources-guides", eyebrow: "Specification guides",
    title: "Clauses you can put in a tender", text: "Short, practical guides on what a good control-system or valve specification actually contains — so your enquiry gets a real price, not a guess.",
    link: { label: "Read the guides", href: "/resources/specification-guides" } },
]);

/* =========================================================================
   SERVICES — detail pages (fill TBC overviews + add process / value sections)
   ========================================================================= */
const whyFromDesign = { type: "feature", id: "why", eyebrow: "Why it matters",
  title: "Decisions made early are the cheap ones", text: "Getting the process basis, control philosophy and equipment selection right at the front end is what keeps the build on schedule and the plant safe. The expensive surprises are the ones found during commissioning.",
  link: { label: "Our EPC approach", href: "/solutions/epc-oil-gas" } };

replaceText("/services/feed-engineering", "overview",
  "Front-end engineering design turns a concept into a costable, buildable project. We establish the process design basis, develop P&IDs and equipment sizing, and produce the cost estimate and schedule the rest of the project is built on — so you go to sanction with the risks understood.");
addSections("/services/feed-engineering", [
  { type: "steps", id: "feed-process", title: "How a FEED runs", items: [
    { title: "Basis of design", text: "Capacities, feed composition, standards and battery limits agreed." },
    { title: "Process design", text: "Heat and mass balance, PFDs and P&IDs." },
    { title: "Sizing & selection", text: "Equipment sizing, line sizing and major equipment specs." },
    { title: "Estimate & plan", text: "Cost estimate, schedule and execution strategy." },
  ]},
  whyFromDesign,
]);

addSections("/services/process-automation-consulting", [
  { type: "list", id: "consult-scope", title: "Where we help", items: [
    "Control system architecture (DCS vs PLC vs SCADA)", "Control and safety philosophy", "Alarm rationalization and HMI design",
    "Protocol and integration strategy", "Cyber-security and network segregation", "Obsolescence and migration planning",
  ]},
  { type: "feature", id: "consult-why", eyebrow: "Why it matters", title: "Specify the protocol, not the brand",
    text: "Good automation decisions keep you free to choose the best equipment later and avoid vendor lock-in. We help you write a specification that gets competitive, comparable bids.",
    link: { label: "Remote monitoring", href: "/solutions/process-automation/remote-monitoring" } },
]);

addSections("/services/installation-commissioning", [
  { type: "steps", id: "ic-process", title: "From delivery to handover", items: [
    { title: "Installation", text: "Mechanical, electrical and instrumentation installation by our crews." },
    { title: "Pre-commissioning", text: "Loop checks, continuity, calibration and point-to-point testing." },
    { title: "Commissioning", text: "Energization, functional tests and control-system validation." },
    { title: "Start-up & handover", text: "Safe start-up, performance test, documentation and operator training." },
  ]},
  { type: "feature", id: "ic-why", eyebrow: "Why it matters", title: "Handover is where projects are judged",
    text: "A clean commissioning — loops proven, interlocks tested, operators trained — is the difference between a plant that starts on schedule and one that limps.",
    link: { label: "After-sales service", href: "/services/after-sales-service" } },
]);

addSections("/services/after-sales-service", [
  { type: "list", id: "aftersales-scope", title: "What we cover", items: [
    "Scheduled preventive maintenance", "Breakdown and emergency support", "Spare parts supply and management",
    "Control-system patching and backups", "Health checks and performance reviews", "Annual maintenance contracts",
  ]},
  { type: "feature", id: "aftersales-why", eyebrow: "Why it matters", title: "The plant runs for years, not weeks",
    text: "Equipment is only as reliable as its upkeep. A local team with spares on the shelf turns a potential outage into a routine service call.",
    link: { label: "Field calibration", href: "/services/field-calibration" } },
]);

addSections("/services/field-calibration", [
  { type: "steps", id: "fieldcal-process", title: "How we calibrate on site", items: [
    { title: "Plan", text: "Scope the loops and instruments and agree acceptance tolerances." },
    { title: "Calibrate", text: "Traceable field calibration of pressure, temperature, flow and level devices." },
    { title: "Certify", text: "As-found / as-left records and calibration certificates issued." },
  ]},
  { type: "feature", id: "fieldcal-why", eyebrow: "Why it matters", title: "Measurement you can defend",
    text: "Custody transfer and safety functions depend on instruments reading true. Traceable calibration keeps your numbers — and your certificates — defensible.",
    link: { label: "Bench calibration", href: "/services/bench-calibration" } },
]);

addSections("/services/bench-calibration", [
  { type: "list", id: "benchcal-scope", title: "In our calibration lab", items: [
    "Pressure and differential-pressure transmitters", "Temperature sensors and transmitters", "Flow and level instruments",
    "Gas detectors and analyzers", "As-found / as-left documentation", "Traceable reference standards",
  ]},
  { type: "feature", id: "benchcal-why", eyebrow: "Why it matters", title: "A controlled environment for critical devices",
    text: "Some instruments are better calibrated off the plant, under controlled conditions, against traceable standards — then returned ready to install.",
    link: { label: "Field calibration", href: "/services/field-calibration" } },
]);

replaceText("/services/leak-detection-systems", "overview",
  "Leak detection systems watch a pipeline or facility continuously and raise the alarm when something changes — by monitoring flow and pressure balances, or by sensing gas directly. We engineer, integrate and support these systems as part of the control and safety architecture.");
addSections("/services/leak-detection-systems", [
  { type: "list", id: "lds-scope", title: "What we deliver", items: [
    "Flow / pressure balance leak detection", "Point and open-path gas detection", "Integration with the DCS / SCADA and ESD",
    "Alarm management and operator response", "Field commissioning and testing", "Ongoing calibration and support",
  ]},
  { type: "feature", id: "lds-why", eyebrow: "Why it matters", title: "Find it before anyone else does",
    text: "Early, reliable detection limits loss, protects people and keeps a small event from becoming a reportable one.",
    link: { label: "Mobile gas leak detection", href: "/services/mobile-gas-leak-detection" } },
]);

addSections("/services/training", [
  { type: "list", id: "training-scope", title: "What we train", items: [
    "Operator training on the delivered control system", "Maintenance and troubleshooting", "Calibration and instrumentation practice",
    "Safety system and shutdown procedures", "Alarm response and abnormal-situation handling", "Refresher and on-site sessions",
  ]},
  { type: "feature", id: "training-why", eyebrow: "Why it matters", title: "The system is only as good as the team running it",
    text: "We hand plants over to operators who understand them — trained on the actual system they will run, not a generic course.",
    link: { label: "After-sales service", href: "/services/after-sales-service" } },
]);

/* =========================================================================
   SOLUTION DETAIL — pig launchers (thin)
   ========================================================================= */
replaceText("/solutions/epc-oil-gas/pig-launchers-receivers", "overview",
  "Pig launchers and receivers let a pipeline be cleaned, batched and inspected without taking it out of service. We design and build launcher/receiver skids with the closures, trays, valves and instrumentation to run pigging operations safely.");
addSections("/solutions/epc-oil-gas/pig-launchers-receivers", [
  { type: "spec-table", id: "pig-spec", title: "At a glance", rows: [
    { label: "Application", value: "Pipeline cleaning, batching and in-line inspection (ILI)" },
    { label: "Scope", value: "Barrel, quick-opening closure, pig trays, kicker/isolation valves, vents and drains, instrumentation" },
    { label: "Design codes", value: "To project pipeline code and pressure class [TBC: confirm]" },
    { label: "Delivery", value: "Skid-mounted, factory tested before shipment" },
  ]},
  { type: "list", id: "pig-scope", title: "What we deliver", items: [
    "Launcher and receiver barrels and closures", "Kicker, isolation and bypass valves", "Pig signallers and position indication",
    "Vent, drain and pressure-relief arrangements", "Integration with station controls and ESD", "Installation and commissioning",
  ]},
  { type: "feature", id: "pig-why", eyebrow: "Why it matters", title: "Maintain the line without shutting it down",
    text: "Regular pigging keeps a pipeline clean and inspectable — protecting throughput and integrity — and a well-designed trap makes the operation routine and safe.",
    link: { label: "Filtration & separation", href: "/solutions/epc-oil-gas/filtration-separation" } },
]);

/* =========================================================================
   COMPANY — clients & partners (thin)
   ========================================================================= */
addSections("/company/clients-partners", [
  { type: "richtext", id: "clients-intro", title: "Who we work with",
    text: "We deliver for the national gas transmission and distribution companies and their operating entities, and we represent a focused set of international equipment manufacturers. The same team sits on both sides — which is why what we specify is what we can support." },
  { type: "stats", id: "clients-stats", title: "By the numbers", items: [
    { value: "50+", label: "Stations and plants delivered" },
    { value: "7", label: "Partner brands represented" },
    { value: "20+", label: "Years operating in Bangladesh" },
  ]},
]);

/* =========================================================================
   PRODUCTS — downloads page (thin)
   ========================================================================= */
addSections("/products/downloads", [
  { type: "richtext", id: "downloads-intro", title: "Catalogues & datasheets",
    text: "Product catalogues and datasheets from the brands we represent. Looking for something specific that is not listed here yet? Ask us and we will send it." },
]);

writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n");
console.log("Enrichment applied. Pages now:");
for (const slug of ["/solutions", "/products", "/services", "/resources",
  "/products/supcon", "/products/cimarron", "/products/keckonn",
  "/services/feed-engineering", "/solutions/epc-oil-gas/pig-launchers-receivers",
  "/company/clients-partners", "/products/downloads"]) {
  const p = bySlug(slug); console.log("  " + String(p.sections.length).padStart(2) + "  " + slug);
}
