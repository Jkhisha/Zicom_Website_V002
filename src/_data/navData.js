/* Transforms the editorial navigation (src/_data/navigation.json, the shape the
   client edits) into the exact JSON shape assets/navbar.js consumes from the
   inline <script id="nav-data">. Single source of truth stays navigation.json;
   this is a pure derived view. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const nav = JSON.parse(readFileSync(join(here, "navigation.json"), "utf8"));
const site = JSON.parse(readFileSync(join(here, "site.json"), "utf8"));

/* A header item's mega panel -> navbar.js panel shape. */
function toPanel(menu) {
  if (!menu) return undefined;
  const panel = {};
  const intro = menu.intro || {};
  if (intro.eyebrow) panel.eyebrow = intro.eyebrow;
  if (intro.title) panel.title = intro.title;
  if (intro.text) panel.blurb = intro.text;
  if (intro.link) panel.overview = { label: intro.link.label, href: intro.link.href };

  panel.columns = (menu.columns || []).map((c) => ({
    head: c.heading || "",
    links: (c.links || []).map((l) => ({
      label: l.label, href: l.href, ...(l.desc ? { desc: l.desc } : {}), ...(l.current ? { current: true } : {}),
    })),
  }));

  const f = menu.featured;
  if (f) {
    panel.featured = f.image
      ? { type: "image", image: f.image.src, imageAlt: f.image.alt || "", eyebrow: f.eyebrow, title: f.title, meta: f.text }
      : { type: "card", cardMark: f.cardMark || "", cardText: f.cardText || f.text || "", eyebrow: f.eyebrow, title: f.title, meta: f.meta };
  }
  return panel;
}

export default function () {
  return {
    brand: {
      mark: "/assets/zicom-mark.svg",
      name: site.logo?.wordmark || site.name || "ZICOM",
      tagline: site.logo?.subline || "",
      href: "/",
    },
    items: (nav.header?.items || []).map((it) => {
      const panel = toPanel(it.menu);
      return panel ? { label: it.label, href: it.href, panel } : { label: it.label, href: it.href };
    }),
    actions: [
      { type: "search", label: "Search", href: "/resources" },
      { type: "cta", label: "Contact", href: "/contact" },
    ],
  };
}
