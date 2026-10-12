/* ZICOM — hero logo docking.
   The logo starts large at the cover's bottom-left and, as you scroll the first
   screen, shrinks + rises into the navbar's logo slot ("snaps to navbar").
   Motion is purely scroll-linked (no autoplay). Sizing is viewport-relative
   (vw/vh); the dock target is measured from the real navbar so it lands exactly
   where the brand belongs. The navbar's own brand lockup is hidden here because
   this flying logo IS the brand on this page. */
(function () {
  "use strict";

  var logo = document.getElementById("heroLogo");
  var nav = document.getElementById("siteNav");
  if (!logo || !nav) return;

  // Inner pages: the logo is NOT a flying cover element — it starts and stays in
  // the docked navbar slot (same geometry as the home cover once docked). We skip
  // the scroll-linked animation and pin it at the dock (progress = 1).
  var docked = logo.hasAttribute("data-docked");

  // The flying logo replaces the bar's built-in brand — hide that one, but keep
  // it as an invisible spacer (width set in measure()) so the flex nav reserves
  // the room the docked logo lands in and the links never slide under it.
  var navBrand = nav.querySelector(".nav__logo");
  if (navBrand) navBrand.style.visibility = "hidden";

  var ASPECT = 150 / 430;     // logo intrinsic height / width (from its viewBox)
  var DOCK_H = 60;            // docked logo height (px)
  var DOCK_NUDGE_Y = 8;       // move the DOCKED logo DOWN (+) / UP (-) from bar centre (px)
  var HERO_VW = 0.5;         // hero width as a fraction of the viewport (desktop)
  var HERO_VW_SM = 0.82;      // ...on small screens
  var HERO_LEFT_VW = 0.01;    // hero's gap from the LEFT edge (fraction of viewport)
  var HERO_BOTTOM_VH = 0.01;  // hero's gap from the BOTTOM edge (fraction of viewport)
  var DOCK_SCROLL_VH = 0.85;  // scroll (in screens) over which it fully docks

  var small = window.matchMedia("(max-width: 720px)");
  var dockLeft, dockTop, heroLeft, heroTop, dockScale, dockDist;

  function measure() {
    var navH = nav.getBoundingClientRect().height || 48;
    var inner = nav.querySelector(".nav__inner");
    var r = inner ? inner.getBoundingClientRect() : { left: 0 };
    var padL = inner ? parseFloat(getComputedStyle(inner).paddingLeft) || 0 : 20;

    dockLeft = r.left + padL;                        // x where the brand sits in the bar
    dockTop = (navH - DOCK_H) / 2 + DOCK_NUDGE_Y;    // bar centre, nudged by DOCK_NUDGE_Y

    var vw = window.innerWidth, vh = window.innerHeight;
    heroLeft = vw * HERO_LEFT_VW;                    // hero's own left (independent of dock)
    var heroW = vw * (small.matches ? HERO_VW_SM : HERO_VW);
    heroW = Math.min(heroW, vw - heroLeft - 16);     // never spill past the right edge
    var heroH = heroW * ASPECT;

    heroTop = vh - heroH - vh * HERO_BOTTOM_VH;      // sit near the bottom-left
    dockScale = DOCK_H / heroH;                       // scale at the dock (p = 1)
    dockDist = vh * DOCK_SCROLL_VH;                   // scroll distance to dock

    // Base box = the HERO (full) size so the SVG rasterises large and crisp; the
    // transform then scales DOWN to the dock. (Scaling a small raster UP would
    // blur it — transforms don't re-render the image at the new size.)
    logo.style.left = heroLeft + "px";
    logo.style.top = heroTop + "px";
    logo.style.height = heroH + "px";

    // Reserve the docked logo's visible footprint in the flex bar. Its glyphs
    // span ~295 of the 430-wide viewBox, so visible width = DOCK_H * 295/150.
    if (navBrand) navBrand.style.flex = "0 0 " + (DOCK_H * 295 / 150) + "px";
  }

  function render() {
    var p = docked ? 1 : window.scrollY / dockDist;
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    var s = 1 + (dockScale - 1) * p;               // 1 (hero) -> dockScale
    var tx = (dockLeft - heroLeft) * p;            // hero's left -> dock's left
    var ty = (dockTop - heroTop) * p;              // hero's top  -> dock's top
    logo.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + s + ")";
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { render(); ticking = false; });
  }

  measure(); render();
  if (!docked) window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { measure(); render(); });
  if (small.addEventListener) small.addEventListener("change", function () { measure(); render(); });
  else if (small.addListener) small.addListener(function () { measure(); render(); });
})();
