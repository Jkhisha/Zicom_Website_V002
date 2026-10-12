/* Second enrichment pass: deepen the remaining 5-section solution detail pages
   (EPC + process automation) and nexval to ~7 sections, and fill their [TBC]
   overviews / spec rows with honest, domain-accurate copy (no invented numbers).
   Re-runnable (keyed by section id). Run before split-content.mjs.                */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const FILE = join(ROOT, "zicom-site-content.json");
const data = JSON.parse(readFileSync(FILE, "utf8"));
const bySlug = (s) => data.pages.find((p) => p.slug === s);

function addFront(slug, sections) {
  const p = bySlug(slug); if (!p) return;
  const have = new Set(p.sections.map((s) => s.id));
  p.sections.unshift(...sections.filter((s) => !have.has(s.id)));
}
function addTail(slug, sections) {
  const p = bySlug(slug); if (!p) return;
  const have = new Set(p.sections.map((s) => s.id));
  const fresh = sections.filter((s) => !have.has(s.id));
  let at = p.sections.findIndex((s) => s.type === "siblings" || s.type === "cta");
  if (at === -1) at = p.sections.length;
  p.sections.splice(at, 0, ...fresh);
}
function setText(slug, id, text) {
  const s = (bySlug(slug)?.sections || []).find((x) => x.id === id);
  if (s) s.text = text;
}
function setSpecRow(slug, id, label, value) {
  const s = (bySlug(slug)?.sections || []).find((x) => x.id === id);
  if (!s || !s.rows) return;
  const r = s.rows.find((x) => x.label === label);
  if (r) r.value = value;
}
const why = (id, title, text, href, label) =>
  ({ type: "feature", id, eyebrow: "Why it matters", title, text, link: { label, href } });

/* ---------------- Process Automation overview ---------------- */
addFront("/solutions/process-automation", [
  { type: "richtext", id: "pa-intro", title: "Control, safety and visibility",
    text: "Process automation is what turns a collection of equipment into a plant you can run, protect and see. We design the control philosophy, build and configure the system, and commission it — DCS, PLC, SCADA and safety systems, chosen for the duty rather than the brochure." },
]);
addTail("/solutions/process-automation", [
  { type: "stats", id: "pa-stats", title: "What we bring", items: [
    { value: "DCS·PLC·SIS", label: "Platforms engineered in-house" },
    { value: "FAT→SAT", label: "Tested before and after shipment" },
    { value: "24/7", label: "Systems we support after handover" },
  ]},
  why("pa-why", "Specify the protocol, not the brand", "Good automation keeps you free to choose the best equipment later and avoids lock-in. We help you write a specification that gets comparable, competitive bids.", "/services/process-automation-consulting", "Automation consulting"),
]);

/* ---------------- EPC: gas process plants ---------------- */
addFront("/solutions/epc-oil-gas/gas-process-plants", [
  { type: "richtext", id: "gpp-overview", title: "Gas processing, delivered whole",
    text: "We deliver gas processing and dehydration plants lump-sum turnkey — process design, equipment, construction and the control system integrated from day one. One team owns the result, so the plant meets spec and starts on schedule." },
]);
addTail("/solutions/epc-oil-gas/gas-process-plants", [
  { type: "steps", id: "gpp-steps", title: "From feed gas to spec gas", items: [
    { title: "Design", text: "Process basis, heat & mass balance, P&IDs and sizing." },
    { title: "Procure", text: "Package equipment, skids and long-lead items." },
    { title: "Build", text: "Fabrication, civil, mechanical, E&I by our crews." },
    { title: "Commission", text: "Start-up, performance test and handover." },
  ]},
  why("gpp-why", "The control system is not an add-on", "Integrating automation from day one is what makes the difference between a plant that starts cleanly and one that fights its instruments.", "/solutions/process-automation", "Process automation"),
]);

/* ---------------- EPC: compressor stations ---------------- */
setText("/solutions/epc-oil-gas/compressor-stations", "overview",
  "Compressor stations raise pipeline pressure to keep gas moving across the network. We deliver the station complete — compression package, process piping, utilities and the control and safety system — engineered, built and commissioned as one scope.");
addTail("/solutions/epc-oil-gas/compressor-stations", [
  { type: "spec-table", id: "cs-spec", title: "At a glance", rows: [
    { label: "Application", value: "Pipeline pressure boosting on transmission and distribution networks" },
    { label: "Scope", value: "Compression package, process & utility piping, E&I and controls, civil works" },
    { label: "Controls", value: "Unit control panel integrated with station DCS/PLC and ESD" },
    { label: "Delivery", value: "Turnkey — engineered, constructed and commissioned by one team" },
  ]},
  why("cs-why", "Availability is the whole point", "A compressor station earns its keep only when it runs. We design for reliable control, safe shutdown and maintainability, and we stay to support it.", "/services/after-sales-service", "After-sales service"),
]);

/* ---------------- EPC: city gate & metering ---------------- */
addFront("/solutions/epc-oil-gas/city-gate-metering-stations", [
  { type: "richtext", id: "cgs-overview", title: "Where transmission meets distribution",
    text: "A city gate station steps high-pressure transmission gas down to distribution pressure and measures it on the way through. We build these stations complete — pressure reduction, filtration, heating, custody metering and controls." },
]);
addTail("/solutions/epc-oil-gas/city-gate-metering-stations", [
  { type: "spec-table", id: "cgs-spec", title: "At a glance", rows: [
    { label: "Function", value: "Pressure reduction and custody-grade metering at the city/distribution boundary" },
    { label: "Scope", value: "Filtration, pre-heating, pressure regulation, metering runs, flow computers and controls" },
    { label: "Measurement", value: "Custody-grade metering with flow computers for billing-quality data" },
    { label: "Delivery", value: "Skid-mounted where practical, factory tested before shipment" },
  ]},
  why("cgs-why", "The meter is the cash register", "At custody points, measurement is money. We engineer the metering and flow computing so the numbers are accurate, traceable and defensible.", "/solutions/epc-oil-gas/flow-computers", "Flow computers"),
]);

/* ---------------- EPC: regulating & metering (rms-skids) ---------------- */
setSpecRow("/solutions/epc-oil-gas/rms-skids", "specifications", "Specifications",
  "Capacity, pressure class and design code sized to the project duty and confirmed per enquiry");
addFront("/solutions/epc-oil-gas/rms-skids", [
  { type: "richtext", id: "rms-overview", title: "Regulating and metering, on a skid",
    text: "A regulating and metering station controls pressure and measures flow for distribution and industrial supply. We build them skid-mounted and factory tested, so installation on site is fast and the station arrives proven." },
]);
addTail("/solutions/epc-oil-gas/rms-skids", [
  { type: "list", id: "rms-scope", title: "What we deliver", items: [
    "Pressure regulation with active and monitor streams", "Filtration and, where needed, pre-heating",
    "Custody or check metering runs", "Flow computers and station instrumentation",
    "Overpressure protection (slam-shut / relief)", "Skid fabrication, factory test and commissioning",
  ]},
  why("rms-why", "Pre-tested beats on-site surprises", "Building and testing the station as a skid in the shop means fewer unknowns in the field and a faster, cleaner commissioning.", "/services/installation-commissioning", "Installation & commissioning"),
]);

/* ---------------- EPC: flow computers ---------------- */
setSpecRow("/solutions/epc-oil-gas/flow-computers", "specifications", "Specifications",
  "Standards, meter types and I/O configured to the project's measurement basis and confirmed per enquiry");
addFront("/solutions/epc-oil-gas/flow-computers", [
  { type: "richtext", id: "fc-overview", title: "Custody-grade measurement",
    text: "Flow computers turn raw meter signals into corrected, auditable volume and energy figures. We specify, configure and commission them as part of the metering station so the measurement is accurate and the records stand up." },
]);
addTail("/solutions/epc-oil-gas/flow-computers", [
  { type: "list", id: "fc-features", title: "What they handle", items: [
    "Volume and energy correction (AGA / ISO methods)", "Orifice, turbine and ultrasonic meter inputs",
    "Pressure, temperature and composition compensation", "Audit trails and tamper-evident logs",
    "Communications to SCADA and billing systems", "Configuration, calibration and commissioning",
  ]},
  why("fc-why", "Accuracy you can audit", "Custody measurement is only as good as its correction and its records. We set the computers up so the figures are defensible and the logs are complete.", "/services/field-calibration", "Field calibration"),
]);

/* ---------------- EPC: water bath heaters ---------------- */
setSpecRow("/solutions/epc-oil-gas/water-bath-heaters", "specifications", "Specifications",
  "Duty, burner type and controls sized to the throughput and pressure-drop required, confirmed per enquiry");
addFront("/solutions/epc-oil-gas/water-bath-heaters", [
  { type: "richtext", id: "wbh-overview", title: "Heat before the pressure drop",
    text: "Dropping gas pressure cools it (Joule–Thomson), which can freeze lines and form hydrates. Indirect water bath heaters add heat before regulation to keep the gas above its dew point. We supply and integrate them with the station controls." },
]);
addTail("/solutions/epc-oil-gas/water-bath-heaters", [
  { type: "list", id: "wbh-scope", title: "What we deliver", items: [
    "Indirect (water bath) heater sized to the duty", "Burner management and temperature control",
    "Integration with station regulation and safety", "Instrumentation and local control panel",
    "Installation and commissioning", "Spares and after-sales support",
  ]},
  why("wbh-why", "No heat, no flow", "In cold conditions or across a big pressure cut, heating is what keeps gas flowing and lines clear. Sizing and burner control decide how well it works.", "/solutions/epc-oil-gas/city-gate-metering-stations", "City gate stations"),
]);

/* ---------------- EPC: filtration & separation ---------------- */
setText("/solutions/epc-oil-gas/filtration-separation", "overview",
  "Clean gas protects everything downstream — meters, regulators, compressors and burners. We supply filtration and separation equipment, from inlet separators to fine filter-coalescers, sized and integrated for the service.");
addTail("/solutions/epc-oil-gas/filtration-separation", [
  { type: "spec-table", id: "fs-spec", title: "At a glance", rows: [
    { label: "Application", value: "Removal of liquids and solids from gas to protect downstream equipment" },
    { label: "Equipment", value: "Inlet separators, filter separators, filter-coalescers, strainers" },
    { label: "Selection", value: "Vessel size, element rating and design code to the service and flow" },
    { label: "Delivery", value: "Standalone or integrated into the station/plant skid" },
  ]},
  why("fs-why", "Dirty gas is expensive gas", "Particulates and liquids wreck meters and chew up valves and burners. Right-sized separation up front is the cheapest insurance on the station.", "/solutions/epc-oil-gas/pig-launchers-receivers", "Pig launchers & receivers"),
]);

/* ---------------- PA: PLC ---------------- */
addFront("/solutions/process-automation/plc", [
  { type: "richtext", id: "plc-overview", title: "Fast, deterministic control",
    text: "PLCs are the right tool for discrete logic, machine sequences and packaged units — compressors, skids and standalone equipment. We program, panel-build and commission them, and tie them into the wider DCS/SCADA when the plant needs it." },
]);
addTail("/solutions/process-automation/plc", [
  { type: "list", id: "plc-apps", title: "Where we apply it", items: [
    "Compressor and pump unit control", "Packaged equipment and skids", "Metering and regulating station logic",
    "Burner management and heater control", "ESD and interlock logic", "Integration with plant DCS/SCADA",
  ]},
  why("plc-why", "Right-size the controller", "Bolting a PLC onto every problem, or buying a DCS for one skid, both cost money. We match the controller to the job.", "/solutions/process-automation/dcs", "Compare with DCS"),
]);

/* ---------------- PA: brownfield upgrades ---------------- */
addFront("/solutions/process-automation/brownfield-upgrades", [
  { type: "richtext", id: "bf-overview", title: "Upgrade without starting over",
    text: "Ageing controls become a spares and support risk long before the plant does. We migrate obsolete DCS/PLC systems to current platforms with minimal downtime — keeping what still works and replacing what doesn't." },
]);
addTail("/solutions/process-automation/brownfield-upgrades", [
  { type: "steps", id: "bf-steps", title: "How a migration runs", items: [
    { title: "Assess", text: "Audit the existing system, I/O and documentation." },
    { title: "Plan", text: "Migration strategy, cutover sequence and rollback." },
    { title: "Stage", text: "Configure and test the new system off-line (FAT)." },
    { title: "Cut over", text: "Phased changeover during a planned window, then SAT." },
  ]},
  why("bf-why", "The clock starts at obsolescence", "Once a platform goes end-of-life, every breakdown is a scramble for parts. Migrating on your schedule beats migrating on a failure's.", "/services/after-sales-service", "Lifecycle support"),
]);

/* ---------------- PA: remote monitoring ---------------- */
setText("/solutions/process-automation/remote-monitoring", "overview",
  "Remote monitoring brings station and plant data back to a central room — and to engineers' screens — so problems are seen early and trips are understood fast. We deliver the field connectivity, the SCADA and the reporting, built on open protocols.");
addTail("/solutions/process-automation/remote-monitoring", [
  { type: "list", id: "rm-scope", title: "What we deliver", items: [
    "Field RTUs and station connectivity", "Central SCADA and historian", "Secure, segregated communications",
    "Alarming and operator notifications", "Dashboards and automated reports", "Commissioning and ongoing support",
  ]},
  why("rm-why", "See it before it trips", "Continuous visibility turns a midnight call-out into a planned intervention — and gives you the data to prove what happened.", "/services/leak-detection-systems", "Leak detection"),
]);

/* ---------------- Products: NexVal ---------------- */
addFront("/products/nexval", [
  { type: "richtext", id: "nexval-overview", title: "Control valves, specified and supported",
    text: "NexVal supplies control valves for gas and process service — globe, ball and rotary. We size and select them for the duty, supply them as part of the station or skid scope, and support them with spares and calibration locally." },
]);
addTail("/products/nexval", [
  { type: "list", id: "nexval-apps", title: "Typical applications", items: [
    "Pressure and flow control on gas stations", "Compressor recycle and anti-surge service",
    "Level and pressure control on process plants", "Regulating and metering skids",
    "Shutdown and blow-down duties", "Industrial process control loops",
  ]},
  why("nexval-why", "A valve is a sizing problem", "The wrong trim or actuator turns a control valve into a maintenance headache. We size for the real operating envelope, not just the line size.", "/services/field-calibration", "Calibration & support"),
]);

writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n");
console.log("Pass 2 applied. Section counts:");
for (const slug of ["/solutions/process-automation", "/solutions/epc-oil-gas/gas-process-plants",
  "/solutions/epc-oil-gas/compressor-stations", "/solutions/epc-oil-gas/city-gate-metering-stations",
  "/solutions/epc-oil-gas/rms-skids", "/solutions/epc-oil-gas/flow-computers",
  "/solutions/epc-oil-gas/water-bath-heaters", "/solutions/epc-oil-gas/filtration-separation",
  "/solutions/process-automation/plc", "/solutions/process-automation/brownfield-upgrades",
  "/solutions/process-automation/remote-monitoring", "/products/nexval"]) {
  const p = bySlug(slug); console.log("  " + String(p.sections.length).padStart(2) + "  " + slug);
}
