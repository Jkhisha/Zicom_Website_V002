/* ZICOM — data-driven mega-menu navbar.
   Reads the JSON in <script type="application/json" id="nav-data"> and builds the
   bar (brand, links, actions), the hover mega-menu "extension", and the mobile
   drawer. Every label, link, panel and action comes from that JSON — nothing in
   this file is hardcoded content. Bar height is unchanged (--nav-h); the mega is
   an absolute panel dropped just below the bar.
   Appearance (transparent/frosted per section) stays owned by app.js. */
(function () {
  "use strict";

  var host = document.getElementById("siteNav");
  var dataEl = document.getElementById("nav-data");
  if (!host || !dataEl) return;

  var data;
  try { data = JSON.parse(dataEl.textContent); }
  catch (err) { if (window.console) console.error("navbar: invalid #nav-data JSON", err); return; }

  var SVGNS = "http://www.w3.org/2000/svg";
  var CHEVRON = "M6 9l6 6 6-6";
  var ARROW = "M5 12h14M13 6l6 6-6 6";
  var desktop = window.matchMedia("(min-width: 721px)");

  var items = data.items || [];
  var actions = data.actions || [];

  /* ---------- tiny DOM helpers ---------- */
  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function strokeSvg(size, sw) {
    var s = document.createElementNS(SVGNS, "svg");
    s.setAttribute("width", size); s.setAttribute("height", size);
    s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("fill", "none");
    s.setAttribute("stroke", "currentColor"); s.setAttribute("stroke-width", sw || 2);
    s.setAttribute("stroke-linecap", "round"); s.setAttribute("stroke-linejoin", "round");
    s.setAttribute("aria-hidden", "true");
    return s;
  }
  function pathSvg(d, size, sw) {
    var s = strokeSvg(size, sw);
    var p = document.createElementNS(SVGNS, "path"); p.setAttribute("d", d); s.appendChild(p);
    return s;
  }
  function searchSvg(size) {
    var s = strokeSvg(size, 2);
    var c = document.createElementNS(SVGNS, "circle");
    c.setAttribute("cx", 11); c.setAttribute("cy", 11); c.setAttribute("r", 7); s.appendChild(c);
    var p = document.createElementNS(SVGNS, "path"); p.setAttribute("d", "M20 20l-3.5-3.5"); s.appendChild(p);
    return s;
  }

  /* ---------- bar: brand ---------- */
  var inner = h("div", "nav__inner");
  var brand = data.brand || {};
  var logo = h("a", "nav__logo"); logo.href = brand.href || "#";
  if (brand.mark) { var mark = h("img"); mark.src = brand.mark; mark.alt = ""; logo.appendChild(mark); }
  var bwrap = h("span", "nav__brand");
  bwrap.appendChild(h("span", "nav__name", brand.name || ""));
  if (brand.tagline) bwrap.appendChild(h("span", "nav__tagline", brand.tagline));
  logo.appendChild(bwrap);
  inner.appendChild(logo);

  /* ---------- bar: center links ---------- */
  var navEl = h("nav"); navEl.setAttribute("aria-label", "Main");
  var ul = h("ul", "nav__links");
  var records = [];   // { li, trigger, item }
  items.forEach(function (item) {
    var li = h("li", "nav__item");
    var trigger;
    if (item.panel) {
      trigger = h("button", "nav__link"); trigger.type = "button";
      trigger.setAttribute("aria-expanded", "false");
      trigger.appendChild(h("span", null, item.label));
      var chev = pathSvg(CHEVRON, 12, 2.2); chev.classList.add("nav__chev");
      trigger.appendChild(chev);
    } else {
      trigger = h("a", "nav__link"); trigger.href = item.href || "#";
      trigger.appendChild(h("span", null, item.label));
    }
    li.appendChild(trigger); ul.appendChild(li);
    records.push({ li: li, trigger: trigger, item: item });
  });
  navEl.appendChild(ul);
  inner.appendChild(navEl);

  /* ---------- bar: right-hand actions ---------- */
  var right = h("div", "nav__right");
  actions.forEach(function (a) {
    if (a.type === "search") {
      var b = h("button", "nav__icon"); b.type = "button";
      b.setAttribute("aria-label", a.label || "Search");
      b.appendChild(searchSvg(17));
      right.appendChild(b);
    } else if (a.type === "cta") {
      var c = h("a", "btn nav__cta"); c.href = a.href || "#"; c.textContent = a.label || "";
      right.appendChild(c);
    }
  });
  var toggle = h("button", "nav__toggle"); toggle.type = "button";
  toggle.setAttribute("aria-label", "Menu"); toggle.setAttribute("aria-expanded", "false");
  toggle.appendChild(h("span")); toggle.appendChild(h("span")); toggle.appendChild(h("span"));
  right.appendChild(toggle);
  inner.appendChild(right);

  host.appendChild(inner);

  /* ---------- mega panels (one per item that has a panel) ---------- */
  function buildPanel(p, label) {
    var panel = h("div", "mega");
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", label);

    var intro = h("div", "mega__intro");
    if (p.eyebrow) intro.appendChild(h("div", "mega__eyebrow", p.eyebrow));
    if (p.title) intro.appendChild(h("div", "mega__title", p.title));
    if (p.blurb) intro.appendChild(h("div", "mega__blurb", p.blurb));
    if (p.overview) {
      var ov = h("a", "mega__overview"); ov.href = p.overview.href || "#";
      ov.appendChild(h("span", null, p.overview.label || "Overview"));
      var ar = pathSvg(ARROW, 14, 2.2); ar.classList.add("arrow"); ov.appendChild(ar);
      intro.appendChild(ov);
    }
    panel.appendChild(intro);

    var cols = h("div", "mega__cols");
    (p.columns || []).forEach(function (c) {
      var col = h("div", "mega__col");
      col.appendChild(h("div", "mega__head", (c.head && c.head.trim()) ? c.head : " "));
      (c.links || []).forEach(function (l) {
        var a = h("a", "mega__link" + (l.current ? " mega__link--current" : ""));
        a.href = l.href || "#";
        var main = h("span", "mega__link-main");
        main.appendChild(h("span", null, l.label));
        if (l.desc) main.appendChild(h("span", "mega__link-desc", l.desc));
        a.appendChild(main);
        if (l.current) a.appendChild(h("span", "mega__badge", "You are here"));
        col.appendChild(a);
      });
      cols.appendChild(col);
    });
    panel.appendChild(cols);

    var f = p.featured;
    if (f) {
      var feat = h("div", "mega__feat");
      if (f.type === "image" && f.image) {
        var im = h("img", "mega__feat-img"); im.src = f.image; im.alt = f.imageAlt || f.title || "";
        im.loading = "lazy"; feat.appendChild(im);
      } else if (f.type === "card") {
        var card = h("div", "mega__feat-card");
        card.appendChild(h("div", "mega__feat-mark", f.cardMark || ""));
        card.appendChild(h("div", "mega__feat-cardtext", f.cardText || ""));
        feat.appendChild(card);
      }
      if (f.eyebrow) feat.appendChild(h("div", "mega__feat-eyebrow", f.eyebrow));
      if (f.title) feat.appendChild(h("div", "mega__feat-title", f.title));
      if (f.meta) feat.appendChild(h("div", "mega__feat-meta", f.meta));
      panel.appendChild(feat);
    }
    return panel;
  }

  var mega = h("div", "nav__mega");
  var panels = records.map(function (rec) {
    if (!rec.item.panel) return null;
    var panel = buildPanel(rec.item.panel, rec.item.label);
    mega.appendChild(panel);
    return panel;
  });
  host.appendChild(mega);

  var scrim = h("div", "nav__scrim");
  document.body.appendChild(scrim);

  /* ---------- open / close (hover + keyboard) ---------- */
  var openIndex = -1, closeTimer = null;
  function cancelClose() { if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; } }
  function setItem(i, on) {
    if (i < 0 || !records[i]) return;
    records[i].li.classList.toggle("is-open", on);
    if (records[i].trigger.tagName === "BUTTON") records[i].trigger.setAttribute("aria-expanded", on ? "true" : "false");
    if (panels[i]) panels[i].classList.toggle("is-active", on);
  }
  function openPanel(i) {
    cancelClose();
    if (!panels[i]) { closePanel(); return; }
    if (openIndex === i) return;
    if (openIndex !== -1) setItem(openIndex, false);
    openIndex = i; setItem(i, true);
    host.classList.add("is-open");
    mega.classList.add("is-shown");
    scrim.classList.add("is-shown");
  }
  function closePanel() {
    cancelClose();
    if (openIndex === -1) return;
    setItem(openIndex, false);
    openIndex = -1;
    host.classList.remove("is-open");
    mega.classList.remove("is-shown");
    scrim.classList.remove("is-shown");
  }
  function scheduleClose() { cancelClose(); closeTimer = setTimeout(closePanel, 160); }

  records.forEach(function (rec, i) {
    rec.li.addEventListener("mouseenter", function () {
      if (!desktop.matches) return;
      if (rec.item.panel) openPanel(i); else closePanel();
    });
    rec.trigger.addEventListener("focus", function () {
      if (desktop.matches && rec.item.panel) openPanel(i);
    });
    if (rec.item.panel) {
      rec.trigger.addEventListener("click", function (e) {
        e.preventDefault();
        if (openIndex === i) closePanel(); else openPanel(i);
      });
    }
  });
  host.addEventListener("mouseenter", cancelClose);
  host.addEventListener("mouseleave", function () { if (desktop.matches) scheduleClose(); });
  mega.addEventListener("mouseenter", cancelClose);
  mega.addEventListener("mouseleave", function () { if (desktop.matches) scheduleClose(); });
  mega.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a"); if (a) closePanel();
  });
  scrim.addEventListener("mouseenter", closePanel);
  scrim.addEventListener("click", closePanel);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && openIndex !== -1) { var t = records[openIndex].trigger; closePanel(); t.focus(); }
  });

  /* ---------- mobile drawer ---------- */
  function buildDrawer() {
    var d = h("div", "nav__drawer"); d.id = "navDrawer";
    items.forEach(function (item) {
      var di = h("div", "drawer__item");
      if (!item.panel) {
        var link = h("a", "drawer__head"); link.href = item.href || "#"; link.textContent = item.label;
        di.appendChild(link); d.appendChild(di); return;
      }
      var head = h("button", "drawer__head"); head.type = "button"; head.setAttribute("aria-expanded", "false");
      head.appendChild(h("span", null, item.label));
      var chev = pathSvg(CHEVRON, 16, 2.2); chev.classList.add("nav__chev"); head.appendChild(chev);
      var pan = h("div", "drawer__panel");
      var pin = h("div", "drawer__inner");
      var p = item.panel;
      if (p.overview) { var ov = h("a", "drawer__overview"); ov.href = p.overview.href || "#"; ov.textContent = p.overview.label; pin.appendChild(ov); }
      (p.columns || []).forEach(function (c) {
        var group = h("div", "drawer__group");
        if (c.head && c.head.trim()) group.appendChild(h("div", "drawer__col-head", c.head));
        (c.links || []).forEach(function (l) {
          var a = h("a", "drawer__link"); a.href = l.href || "#"; a.textContent = l.label; group.appendChild(a);
        });
        pin.appendChild(group);
      });
      pan.appendChild(pin); di.appendChild(head); di.appendChild(pan); d.appendChild(di);
      head.addEventListener("click", function () {
        var open = di.classList.toggle("is-open");
        head.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
    var acts = h("div", "drawer__actions");
    actions.forEach(function (a) {
      if (a.type === "cta") { var c = h("a", "btn"); c.href = a.href || "#"; c.textContent = a.label; acts.appendChild(c); }
      else if (a.type === "search") { var s = h("a", "btn btn--ghost"); s.href = a.href || "#"; s.textContent = a.label || "Search"; acts.appendChild(s); }
    });
    d.appendChild(acts);
    return d;
  }

  var drawer = buildDrawer();
  document.body.appendChild(drawer);

  var drawerOpen = false;
  function setDrawer(open) {
    drawerOpen = open;
    drawer.classList.toggle("is-open", open);
    toggle.classList.toggle("is-active", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    host.classList.toggle("is-open", open);   // frost the bar while the drawer is up
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", function () { setDrawer(!drawerOpen); });
  drawer.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a) return;
    // navigating closes the drawer; expanding an accordion head does not
    if (a.classList.contains("drawer__link") || a.classList.contains("drawer__overview") ||
        a.classList.contains("btn") || (a.classList.contains("drawer__head") && a.tagName === "A")) {
      setDrawer(false);
    }
  });

  /* ---------- keep states sane across the breakpoint ---------- */
  function onBreakpoint() {
    if (desktop.matches) { setDrawer(false); }
    else { closePanel(); }
  }
  if (desktop.addEventListener) desktop.addEventListener("change", onBreakpoint);
  else if (desktop.addListener) desktop.addListener(onBreakpoint);
})();
