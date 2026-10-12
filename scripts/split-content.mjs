/* One-time migration: explode the single source-of-truth JSON
   (zicom-site-content.json) into per-entity collection files that Decap can edit
   and Eleventy can consume. Non-destructive: the original JSON is left untouched
   and kept as the import archive. Re-runnable (overwrites the generated files).

   Also applies the image-path convention decision (step 3):
   every image src is normalised to the canonical web path  /images/<file>.

   Run:  node scripts/split-content.mjs            (from the Zicom_Website_V002 folder) */
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SRC = join(ROOT, "zicom-site-content.json");
const DATA = join(ROOT, "src", "_data");
const CONTENT = join(ROOT, "src", "content");

const data = JSON.parse(readFileSync(SRC, "utf8"));

/* ---------- real-file image map (resolve idealized paths) ----------
   Project cover/gallery images carry a `sourceFile` (the original export name).
   The real photos in assets/img/ are slugified versions of those names. Build a
   lookup from every idealized `src` -> the real /images/<file> it corresponds to,
   so idealized paths referenced anywhere (project galleries, home/overview cards,
   hero images) resolve to files that actually exist.                              */
const realFiles = new Set(readdirSync(join(ROOT, "assets", "img")));
const slugify = (s) => String(s).toLowerCase().replace(/\.[a-z0-9]+$/i, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function realFor(sourceFile) {
  if (!sourceFile) return null;
  const base = slugify(sourceFile);
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    if (realFiles.has(base + ext)) return "/images/" + base + ext;
  }
  return null;
}
const imgMap = {};              // idealized src -> real /images/<file>
function harvest(imgObj) {
  if (imgObj && imgObj.src && imgObj.sourceFile) {
    const real = realFor(imgObj.sourceFile);
    if (real) imgMap[imgObj.src] = real;
  }
}
for (const it of data.projects.items) {
  harvest(it.coverImage);
  for (const g of (it.gallery?.images || [])) harvest(g);
}
let remapped = 0, unresolved = new Set();
function remap(src) {
  if (typeof src !== "string") return src;
  if (imgMap[src]) { remapped++; return imgMap[src]; }
  if (/^\/images\/(projects|partners|moments|brand)\//.test(src)) unresolved.add(src);
  return src;
}

/* ---------- image-path convention ----------
   Real editorial files live (flat) in assets/img/ and are published to /images/.
   - "assets/img/x.jpg"  -> "/images/x.jpg"
   - "/assets/img/x.jpg" -> "/images/x.jpg"
   - "/images/..."       -> left as-is (already canonical)
   - project paths that still point at not-yet-supplied per-slug folders are left
     as /images/projects/<slug>/... and tracked as known-missing.               */
function normImg(p) {
  if (typeof p !== "string") return p;
  return p
    .replace(/^\/?assets\/img\//, "/images/")
    .replace(/^images\//, "/images/");
}
/* Walk any value and normalise every string that looks like an image path. */
function normDeep(v) {
  if (typeof v === "string") {
    return /\.(jpe?g|png|webp|svg|gif|avif)$/i.test(v) || /^\/?(assets\/img|images)\//.test(v)
      ? remap(normImg(v)) : v;
  }
  if (Array.isArray(v)) return v.map(normDeep);
  if (v && typeof v === "object") {
    const o = {};
    for (const k of Object.keys(v)) {
      let val = normDeep(v[k]);
      // Alt text is never shown to users as a sentence — strip any [TBC] marker so
      // the rendered HTML has clean alternative text even while the photo is pending.
      if ((k === "alt" || k === "imageAlt") && typeof val === "string") {
        val = val.replace(/\s*\[TBC[^\]]*\]/g, "").trim();
      }
      // A placeholder image src ("[TBC: photo…]") is not a path — blank it so
      // templates fall back to their empty-media state instead of a broken <img>.
      if ((k === "src" || k === "file") && typeof val === "string" && val.includes("[TBC")) {
        val = "";
      }
      o[k] = val;
    }
    return o;
  }
  return v;
}

/* ---------- helpers ---------- */
function fresh(dir) { rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true }); }
function writeJson(file, obj) { writeFileSync(file, JSON.stringify(obj, null, 2) + "\n"); }
function slugFromId(x, i) { return String(x.id || x.slug || ("item-" + i)).replace(/[^a-z0-9-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase(); }

mkdirSync(DATA, { recursive: true });

/* ---------- globals -> src/_data ---------- */
writeJson(join(DATA, "site.json"), normDeep(data.site));
writeJson(join(DATA, "navigation.json"), normDeep(data.navigation));
writeJson(join(DATA, "partners.json"), normDeep(data.partners));
writeJson(join(DATA, "meta.json"), normDeep({
  $version: data.$version, build: data.build, updated: data.updated,
  notes: data.notes, sitemap: data.sitemap, openItems: data.openItems,
}));

/* ---------- pages -> src/content/pages/*.json ---------- */
const pagesDir = join(CONTENT, "pages");
fresh(pagesDir);
for (let i = 0; i < data.pages.length; i++) {
  const pg = normDeep(data.pages[i]);
  const name = slugFromId(pg, i) || ("page-" + i);
  writeJson(join(pagesDir, name + ".json"), pg);
}

/* ---------- projects -> src/content/projects/*.json + meta ---------- */
const projDir = join(CONTENT, "projects");
fresh(projDir);
for (let i = 0; i < data.projects.items.length; i++) {
  const it = normDeep(data.projects.items[i]);
  writeJson(join(projDir, slugFromId(it, i) + ".json"), it);
}
writeJson(join(DATA, "projectsMeta.json"), normDeep({
  categories: data.projects.categories,
  featured: data.projects.featured,
  other: data.projects.other,
}));

/* ---------- posts -> src/content/posts/*.md (front matter + body) ---------- */
const postsDir = join(CONTENT, "posts");
fresh(postsDir);
for (let i = 0; i < data.posts.length; i++) {
  const p = normDeep(data.posts[i]);
  const name = (slugFromId(p, i) || ("post-" + i));
  // Body is a list of content blocks (richtext etc.), not prose — keep it in the
  // JSON front matter so post-detail can render it through the section dispatcher.
  const md = "---json\n" + JSON.stringify(p, null, 2) + "\n---\n";
  writeFileSync(join(postsDir, name + ".md"), md);
}

console.log("Image remap: " + remapped + " idealized refs -> real files; " + unresolved.size + " still unresolved (no real photo yet).");
if (unresolved.size) writeFileSync(join(ROOT, "unresolved-images.txt"),
  "Idealized image paths with no matching file in assets/img/ (supply photos or fix sourceFile):\n\n" + [...unresolved].sort().join("\n") + "\n");
console.log("Split complete:");
console.log("  _data/: site, navigation, partners, meta, projectsMeta");
console.log("  content/pages/   : " + data.pages.length);
console.log("  content/projects/: " + data.projects.items.length);
console.log("  content/posts/   : " + data.posts.length);
