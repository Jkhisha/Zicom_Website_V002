/* ZICOM static builder — reads content/*.json, writes static HTML pages.
   Run:  node build.mjs   (from the Zicom_Website_V002 folder)                */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = dirname(fileURLToPath(import.meta.url));
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ARROW = '<svg class="arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

/* ---------- section renderers ---------- */
const renderers = {
  "cover-scroll": (s) => {
    const covers = (s.covers || []).map((c, i) => {
      const bg = c.image ? ` style="background-image:url('${esc(c.image)}');z-index:${i + 1}${i ? ";transform:translateX(100%)" : ""}"`
                         : ` style="z-index:${i + 1}${i ? ";transform:translateX(100%)" : ""}"`;
      const hint = i === 0 ? '<span class="covers__hint">Scroll &darr;</span>' : "";
      return `<div class="cover"${bg}>
        <div class="cover__inner">
          <span class="cover__index">${String(i + 1).padStart(2, "0")} / ${String(s.covers.length).padStart(2, "0")}</span>
          <h1 class="cover__title">${esc(c.title)}</h1>
          <p class="cover__subtitle">${esc(c.subtitle)}</p>
        </div>${hint}
      </div>`;
    }).join("\n");
    return sectionTag(s, "section--covers", true, `<div class="covers__sticky">${covers}</div>`);
  },

  intro: (s) => sectionTag(s, "section", false, `<div class="container intro__grid">
      <div>${eyebrow(s.eyebrow)}<h2 class="intro__title">${esc(s.title)}</h2></div>
      <p class="intro__text">${esc(s.text)}</p>
    </div>`),

  cards: (s) => {
    const items = (s.items || []).map((c, i) => `<article class="card">
        <span class="card__num">${String(i + 1).padStart(2, "0")}</span>
        <h3 class="card__title">${esc(c.title)}</h3>
        <p class="card__text">${esc(c.text)}</p>
        ${c.link ? `<a class="link-more" href="${esc(c.link.href)}">${esc(c.link.label)} ${ARROW}</a>` : ""}
      </article>`).join("\n");
    return sectionTag(s, "section section--cream", false, `<div class="container">${head(s)}<div class="cards">${items}</div></div>`);
  },

  stats: (s) => {
    const items = (s.items || []).map((st) => `<div class="stat"><div class="stat__value">${esc(st.value)}</div><div class="stat__label">${esc(st.label)}</div></div>`).join("\n");
    return sectionTag(s, "section", false, `<div class="container">${head(s)}<div class="stats">${items}</div></div>`);
  },

  teasers: (s) => {
    const items = (s.items || []).map((t) => `<article class="teaser">
        <h3 class="teaser__title">${esc(t.title)}</h3>
        <p class="teaser__text">${esc(t.text)}</p>
        ${t.link ? `<a class="link-more" href="${esc(t.link.href)}">${esc(t.link.label)} ${ARROW}</a>` : ""}
      </article>`).join("\n");
    return sectionTag(s, "section section--gray", false, `<div class="container">${head(s)}<div class="teasers">${items}</div></div>`);
  },

  logos: (s) => {
    const items = (s.items || []).map((l) => `<div class="logo-item">
        <img src="${esc(l.logo)}" alt="${esc(l.name)}" onload="this.nextElementSibling.style.display='none'" onerror="this.remove()">
        <span class="logo-name">${esc(l.name)}</span>
      </div>`).join("\n");
    return sectionTag(s, "section section--cream", false, `<div class="container">${head(s)}<div class="logos">${items}</div></div>`);
  },

  /* hero designs (data: subtitle, title, paragraphs, images[], buttonText, buttonLink) */
  "left-image": (s) => heroTag(s, "section--split section--left-image", false,
    `<div class="split__media">${carousel(s.images, "split")}</div><div class="split__content">${contentInner(s, false)}</div>`),
  "right-image": (s) => heroTag(s, "section--split section--right-image", false,
    `<div class="split__media">${carousel(s.images, "split")}</div><div class="split__content">${contentInner(s, false)}</div>`),
  "full-image": (s) => heroTag(s, "section--full", true,
    `${carousel(s.images, "full")}<div class="full__content">${contentInner(s, true)}</div>`),
  centered: (s) => heroTag(s, "section--centered", true,
    `${carousel(s.images, "editorial")}<div class="center__overlay"></div><div class="center__content">${contentInner(s, false)}</div>`),
  framed: (s) => heroTag(s, "section--framed", true,
    `${carousel(s.images, "editorial")}<div class="frame__overlay"></div><div class="frame__border"></div><div class="frame__content">${contentInner(s, false)}</div>`),
  overlap: (s) => heroTag(s, "section--overlap", false,
    `<div class="overlap__media">${carousel(s.images, "split")}</div><div class="overlap__card">${contentInner(s, false)}</div>`),

  /* handles any message* type; flags parsed from the name:
     message | message-framed | message-images | message-images-framed
     | message-left | message-images-left | message-left-framed ...           */
  message: (s) => {
    const t = s.type || "message";
    const framed = t.includes("framed");
    const left = t.includes("left");
    const imgs = (s.images || []).filter(Boolean);
    const withImages = imgs.length > 0;
    const cls = "section--message"
      + (framed ? " section--message--framed" : "")
      + (withImages ? " section--message--images" : "")
      + (left ? " section--message--left" : "");
    const bgs = withImages ? imgs.map((src, i) => `<div class="message__bg${i === 0 ? " is-active" : ""}" style="background-image:url('${esc(src)}')"></div>`).join("\n") : "";
    const overlay = withImages ? '<div class="message__overlay"></div>' : "";
    const frame = framed ? '<div class="message__frame"></div>' : "";
    const lines = (s.messages || []).map((m, i) => `<p class="message__line${i === 0 ? " is-active" : ""}">${esc(m)}</p>`).join("\n");
    const cta = s.cta ? `<a class="btn btn--on-dark message__cta" href="${esc(s.cta.href)}">${esc(s.cta.label)} ${ARROW}</a>` : "";
    const inner = `<div class="message__stage">
      ${bgs}
      ${overlay}
      ${frame}
      ${s.eyebrow ? `<p class="message__eyebrow">${esc(s.eyebrow)}</p>` : ""}
      <div class="message__lines">${lines}</div>
      ${cta}
    </div>`;
    const lineCount = Math.max((s.messages || []).length, 1);
    return `<section class="${cls}" id="${esc(s.id)}" data-label="${esc(s.eyebrow || "Message")}" data-dark style="height:${(lineCount + 1) * 100}vh">${inner}</section>`;
  },

  cta: (s) => `<section class="section cta-band" id="${esc(s.id)}" data-label="${esc(s.title || "Contact")}" data-dark><div class="container">
      <h2 class="section-title">${esc(s.title)}</h2>
      <p class="cta-band__text">${esc(s.text)}</p>
      <div class="cta-band__actions">
        ${s.primary ? `<a class="btn" href="${esc(s.primary.href)}">${esc(s.primary.label)} ${ARROW}</a>` : ""}
        ${s.secondary ? `<a class="btn btn--ghost" href="${esc(s.secondary.href)}">${esc(s.secondary.label)}</a>` : ""}
      </div>
    </div></section>`,
};

/* ---------- helpers ---------- */
function eyebrow(t) { return t ? `<p class="eyebrow">${esc(t)}</p>` : ""; }
function head(s) { return `<div class="section-head">${eyebrow(s.eyebrow)}<h2 class="section-title">${esc(s.title)}</h2></div>`; }
function sectionTag(s, cls, dark, inner) {
  return `<section class="${cls}" id="${esc(s.id)}" data-label="${esc(s.eyebrow || s.title || s.id)}"${dark ? " data-dark" : ""}>${inner}</section>`;
}
/* hero-design helpers (these designs use `subtitle` as the eyebrow) */
function heroTag(s, cls, dark, inner) {
  return `<section class="${cls}" id="${esc(s.id)}" data-label="${esc(s.subtitle || s.title || s.id)}"${dark ? " data-dark" : ""}>${inner}</section>`;
}
function paras(p) {
  const arr = Array.isArray(p) ? p.filter(Boolean) : (p ? [String(p)] : []);
  return arr.length ? `<div class="paragraphs">${arr.map((t) => `<p>${esc(t)}</p>`).join("")}</div>` : "";
}
function carousel(images, variant) {
  const fill = variant === "full" || variant === "editorial";
  const slides = (images || []).map((src, i) =>
    `<div class="carousel__slide${i === 0 ? " is-active" : ""}"><img src="${esc(src)}" alt="" loading="${i === 0 ? "eager" : "lazy"}"></div>`
  ).join("");
  const overlay = variant === "full" ? '<div class="full__overlay"></div>' : "";
  const dotsFull = variant === "full" ? " carousel__dots--full" : "";
  return `<div class="carousel${fill ? " carousel--full" : ""}">${slides}${overlay}<div class="carousel__dots${dotsFull}"></div></div>`;
}
function contentInner(cfg, light) {
  const eb = cfg.subtitle ? `<p class="eyebrow">${esc(cfg.subtitle)}</p>` : "";
  const ti = cfg.title ? `<h2 class="title">${esc(cfg.title)}</h2>` : "";
  const btn = `<a class="btn${light ? " btn--light" : ""}" href="${esc(cfg.buttonLink || "#")}"><span>${esc(cfg.buttonText || "Explore more")}</span> ${ARROW}</a>`;
  return `<div class="content-inner">${eb}${ti}${paras(cfg.paragraphs)}${btn}</div>`;
}

/* ---------- navbar + footer ---------- */
function navbar(site) {
  const links = (site.nav || []).map((n) => `<li><a href="${esc(n.href)}">${esc(n.label)}</a></li>`).join("");
  return `<header class="nav">
    <div class="nav__inner">
      <a class="nav__logo" href="/"><img src="${esc(site.logo)}" alt=""><span>${esc(site.name)}</span></a>
      <nav><ul class="nav__links">${links}</ul></nav>
      <div class="nav__right">
        ${site.cta ? `<a class="btn nav__cta" href="${esc(site.cta.href)}">${esc(site.cta.label)}</a>` : ""}
        <button class="nav__toggle" aria-label="Menu"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>`;
}
function footer(site) {
  return `<footer class="site-footer"><div class="container site-footer__inner">
    <a class="site-footer__logo" href="/"><img src="${esc(site.logo)}" alt=""><span>${esc(site.name)}</span></a>
    <small>&copy; ${new Date().getFullYear()} ${esc(site.name)}. ${esc(site.tagline)}.</small>
  </div></footer>`;
}

/* ---------- page shell ---------- */
function renderPage(data) {
  const { site, page } = data;
  const body = (page.sections || []).map((s) => {
    const fn = renderers[s.type] || (String(s.type).startsWith("message") ? renderers.message : null);
    if (!fn) { console.warn("No renderer for section type:", s.type); return `<!-- unknown section: ${s.type} -->`; }
    return fn(s);
  }).join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description || site.tagline)}">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/templates.css">
  <link rel="stylesheet" href="assets/site.css">
</head>
<body>
  ${navbar(site)}
  <main>
${body}
  </main>
  ${footer(site)}
  <script src="assets/templates.js"></script>
  <script src="assets/app.js"></script>
</body>
</html>
`;
}

/* ---------- run ----------
   node build.mjs                         -> content/home.json  -> index.html
   node build.mjs <input.json> <out.html> -> custom input/output                */
const inFile = process.argv[2] || join("content", "home.json");
const outFile = process.argv[3] || "index.html";
const data = JSON.parse(readFileSync(join(ROOT, inFile), "utf8"));
const html = renderPage(data);
writeFileSync(join(ROOT, outFile), html);
console.log("Built " + outFile + " (" + (data.page.sections || []).length + " sections)");
