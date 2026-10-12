/* ZICOM — site chrome: navbar blur + scroll-spy.
   (Section design behaviour lives in templates.js.) */
(function () {
  "use strict";

  /* ---- Navbar appearance ----
     Default (before the spy takes over, or if there's no spy): transparent
     over the hero, blurred bar once scrolled. Once the scroll-spy is active it
     drives this per section instead — see setNavState / navTransparentFor. */
  var siteNav = document.querySelector(".nav");
  function setNavState(transparent) {
    if (siteNav) siteNav.classList.toggle("is-scrolled", !transparent);
  }
  // How the header should look while a given section is active.
  //   data-nav="transparent" -> force invisible/transparent header
  //   data-nav="solid"       -> force the blurred bar
  //   (unset)                -> transparent only on the main cover (first section)
  function navTransparentFor(sec, idx) {
    var mode = sec && sec.getAttribute("data-nav");
    if (mode === "transparent") return true;
    if (mode === "solid") return false;
    return idx === 0;
  }
  var onNav = function () { setNavState(window.scrollY <= 40); };
  onNav();
  window.addEventListener("scroll", onNav, { passive: true });

  /* Mobile menu + mega-menu are owned by navbar.js (renders the nav from
     #nav-data). This file only drives the bar's scroll/section appearance. */

  /* ---- Scroll-spy: left side dot rail, expands to labels on hover ---- */
  function initSpy() {
    var sections = Array.prototype.slice.call(document.querySelectorAll("main > section[id]"));
    if (sections.length < 2) return;

    // Spy is active: it now owns the navbar appearance (per section), so drop
    // the raw scroll-offset handler set up above.
    window.removeEventListener("scroll", onNav);

    var nav = document.createElement("nav");
    nav.className = "spy";
    nav.setAttribute("aria-label", "On this page");
    var rail = document.createElement("div"); rail.className = "spy__rail";
    var list = document.createElement("div"); list.className = "spy__list";
    rail.appendChild(list); nav.appendChild(rail);

    var items = sections.map(function (sec, i) {
      var label = sec.getAttribute("data-label") || sec.id;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "spy__item";
      btn.style.setProperty("--i", i);
      btn.setAttribute("aria-label", label);
      btn.innerHTML =
        '<span class="spy__dotwrap"><span class="spy__dot"></span></span>' +
        '<span class="spy__label"><span class="spy__text"></span></span>';
      btn.querySelector(".spy__text").textContent = label;
      btn.addEventListener("click", function () {
        sec.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      list.appendChild(btn);
      return btn;
    });
    document.body.appendChild(nav);

    var ticking = false;
    function onScroll() {
      var line = 200; // active = last section whose top has passed 200px below the viewport top
      var idx = 0;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= line) idx = i;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) idx = sections.length - 1;
      items.forEach(function (b, i) {
        var on = i === idx;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-current", on ? "location" : "false");
      });
      nav.classList.toggle("on-dark", sections[idx].hasAttribute("data-dark"));
      nav.classList.toggle("on-cover", idx === 0); // hide the rail while on the main cover
      setNavState(navTransparentFor(sections[idx], idx)); // header appearance per active section
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(function () { onScroll(); ticking = false; }); }
    }, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }
  initSpy();
})();
