/* Third enrichment pass: fill the last visible [TBC] copy and enrich the two
   remaining thin brand pages (Red Lion, Softing). Re-runnable (keyed by id).
   Run before split-content.mjs.                                                  */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const FILE = join(ROOT, "zicom-site-content.json");
const data = JSON.parse(readFileSync(FILE, "utf8"));
const bySlug = (s) => data.pages.find((p) => p.slug === s);
function setText(slug, id, text) { const s = (bySlug(slug)?.sections || []).find((x) => x.id === id); if (s) s.text = text; }
function setHeroImage(slug, src, alt) { const p = bySlug(slug); if (p?.hero) p.hero.image = { src, alt }; }
function addTail(slug, sections) {
  const p = bySlug(slug); if (!p) return;
  const have = new Set(p.sections.map((s) => s.id));
  const fresh = sections.filter((s) => !have.has(s.id));
  let at = p.sections.findIndex((s) => s.type === "siblings" || s.type === "cta");
  if (at === -1) at = p.sections.length;
  p.sections.splice(at, 0, ...fresh);
}
const why = (id, title, text, href, label) =>
  ({ type: "feature", id, eyebrow: "Why it matters", title, text, link: { label, href } });

const IMG_CONTROL = "/images/80-mmscfd-compressor-station-titas-loce-5.jpg";
const IMG_METERING = "/images/50-mmscfd-laksam-ms-1.jpg";

/* ---- company/about: clean disputed headcount stat labels ---- */
{
  const s = bySlug("/company/about").sections.find((x) => x.id === "numbers");
  if (s) for (const it of s.items) it.label = it.label.replace(/,?\s*group\s*\[TBC\]/i, " (group)").replace(/\s*\[TBC\]/i, "");
}

/* ---- company/quality: fill QA/QC + HSE ---- */
setText("/company/quality", "qaqc",
  "Quality is planned, not inspected in at the end. Every project runs to an inspection and test plan agreed up front: material traceability on pressure parts, witnessed factory acceptance tests before shipment, site acceptance tests at commissioning, and a documentation dossier — datasheets, certificates, test records and as-builts — handed over at the close.");
setText("/company/quality", "hse",
  "We work to a health, safety and environment management system covering risk assessment, permit-to-work, toolbox talks and incident reporting on every site. Safe delivery is a condition of the work, not a trade-off against the schedule.");

/* ---- products/supcon: remove the parenthetical TBC in the about text ---- */
{
  const s = bySlug("/products/supcon").sections.find((x) => x.id === "about");
  if (s) s.text = s.text.replace(/\s*\[TBC[^\]]*\]/g, "").replace(/\s{2,}/g, " ").trim();
}

/* ---- products/downloads: replace the [TBC] placeholder download ---- */
{
  const s = bySlug("/products/downloads").sections.find((x) => x.id === "downloads");
  if (s && Array.isArray(s.items)) {
    s.items = s.items.filter((it) => !String(it.title).includes("[TBC") && !String(it.file).includes("[TBC") || !String(it.title).includes("[TBC"));
    // normalise: drop any item whose title is a TBC placeholder
    s.items = s.items.filter((it) => !String(it.title).includes("[TBC"));
  }
}

/* ---- Red Lion (industrial networking & data) ---- */
setHeroImage("/products/red-lion", IMG_CONTROL, "Industrial networking and data acquisition in a control room");
setText("/products/red-lion", "overview",
  "Red Lion supplies industrial networking, communication and data-acquisition hardware — the devices that connect field equipment, protocols and control systems and make plant data usable. We supply and integrate them as part of the automation and remote-monitoring scope.");
addTail("/products/red-lion", [
  { type: "cards", id: "redlion-families", title: "What we supply", items: [
    { title: "Protocol gateways", text: "Convert and bridge industrial protocols so legacy and modern equipment talk to one control system." },
    { title: "Industrial networking", text: "Managed switches and cellular/edge devices for rugged plant and field networks." },
    { title: "HMIs & data acquisition", text: "Panel HMIs, data loggers and controllers that capture and present field data." },
  ]},
  { type: "list", id: "redlion-apps", title: "Typical applications", items: [
    "Protocol conversion between field devices and DCS/SCADA", "Remote station connectivity and telemetry",
    "Edge data collection and buffering", "Local operator interfaces on skids and packages",
    "Network segregation for control systems", "Integration with remote monitoring",
  ]},
  why("redlion-why", "Data is only useful if it moves", "The best instruments are wasted if their data can't reach the control room. Reliable, secure connectivity is what turns field signals into decisions.", "/solutions/process-automation/remote-monitoring", "Remote monitoring"),
]);

/* ---- Softing (industrial connectivity & diagnostics) ---- */
setHeroImage("/products/softing", IMG_METERING, "Industrial connectivity and fieldbus diagnostics on a process skid");
setText("/products/softing", "overview",
  "Softing specialises in industrial connectivity and fieldbus diagnostics — the tools and interfaces that keep communication networks between field instruments and control systems healthy and visible. We apply them during commissioning and for ongoing diagnostics.");
addTail("/products/softing", [
  { type: "cards", id: "softing-families", title: "What we supply", items: [
    { title: "Fieldbus diagnostics", text: "Monitoring and diagnostics for PROFIBUS, Foundation Fieldbus and HART networks — find faults before they become trips." },
    { title: "Connectivity & gateways", text: "Interfaces and gateways that bridge industrial protocols to control systems and higher-level software." },
    { title: "Commissioning tools", text: "Test and diagnostic tools that speed up network commissioning and troubleshooting." },
  ]},
  { type: "list", id: "softing-apps", title: "Where we apply it", items: [
    "Fieldbus commissioning and acceptance", "Ongoing network health monitoring", "Fault-finding on communication networks",
    "Protocol bridging to control and asset systems", "Diagnostics during brownfield upgrades", "Integration with plant automation",
  ]},
  why("softing-why", "A quiet network is a working plant", "Communication faults are some of the hardest problems to chase on a live plant. Continuous diagnostics turn an intermittent mystery into a located, fixable fault.", "/solutions/process-automation/brownfield-upgrades", "Brownfield upgrades"),
]);

writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n");
console.log("Pass 3 applied. red-lion:", bySlug("/products/red-lion").sections.length, "softing:", bySlug("/products/softing").sections.length);
