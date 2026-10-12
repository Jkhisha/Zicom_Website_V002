/* =========================================================
   ZICOM — TEMPLATES controllers (shared, framework-free)
   Behaviour for the section designs. initTemplates() wires any
   matching elements and is safe to call repeatedly (idempotent),
   so it works for static pages and dynamically-rendered ones.
   ========================================================= */
(function (global) {
  "use strict";
  var prefersReduced = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function raf(fn) { global.requestAnimationFrame(fn); }
  function num(v, d) { v = parseFloat(v); return isNaN(v) ? d : v; }

  /* ---------- Cover-scroll ("Cover" transition) ---------- */
  function CoverScroll(section) {
    var covers = Array.prototype.slice.call(section.querySelectorAll(".cover"));
    var n = covers.length;
    if (!n) return;
    var TRANS = num(section.getAttribute("data-trans"), 0.9); // scroll (in screens) to slide a cover in
    var HOLD = num(section.getAttribute("data-hold"), 0.6);   // scroll it holds before the next starts
    var totalUnits = n * HOLD + (n - 1) * TRANS;
    var ticking = false;

    function setHeight() { section.style.height = (1 + totalUnits) * global.innerHeight + "px"; }
    function onScroll() {
      var vh = global.innerHeight;
      var scrolled = Math.min(Math.max(-section.getBoundingClientRect().top, 0), totalUnits * vh);
      var progress = scrolled / vh;
      for (var k = 1; k < n; k++) {
        var start = HOLD + (k - 1) * (TRANS + HOLD);
        var p = Math.min(Math.max((progress - start) / TRANS, 0), 1);
        covers[k].style.transform = "translateX(" + (1 - p) * 100 + "%)";
      }
    }
    global.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; raf(function () { onScroll(); ticking = false; }); }
    }, { passive: true });
    global.addEventListener("resize", function () { setHeight(); onScroll(); });
    setHeight(); onScroll();
  }

  /* ---------- Message reveal (+ optional background images) ---------- */
  function MessageReveal(section) {
    var lines = Array.prototype.slice.call(section.querySelectorAll(".message__line"));
    var bgs = Array.prototype.slice.call(section.querySelectorAll(".message__bg"));
    var cta = section.querySelector(".message__cta");
    var n = lines.length;
    if (!n) return;
    var ticking = false;

    function onScroll() {
      var vh = global.innerHeight;
      var travel = section.offsetHeight - vh;
      if (travel <= 0) return;
      var scrolled = Math.min(Math.max(-section.getBoundingClientRect().top, 0), travel);
      var active = Math.floor(scrolled / (travel / n));
      active = Math.min(Math.max(active, 0), n - 1);
      lines.forEach(function (el, i) { el.classList.toggle("is-active", i === active); });
      if (cta) cta.classList.toggle("is-shown", active === n - 1);
      if (bgs.length) {
        var bi = Math.min(active, bgs.length - 1);
        bgs.forEach(function (el, i) { el.classList.toggle("is-active", i === bi); });
      }
    }
    global.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; raf(function () { onScroll(); ticking = false; }); }
    }, { passive: true });
    global.addEventListener("resize", onScroll);
    onScroll();
  }

  /* ---------- Carousel (fading slides + dots, autoplay) ---------- */
  function Carousel(root, interval) {
    this.root = root;
    this.slides = Array.prototype.slice.call(root.querySelectorAll(".carousel__slide"));
    this.dotsWrap = root.querySelector(".carousel__dots");
    this.interval = interval || 5500;
    this.index = 0; this.timer = null;
    if (this.slides.length < 2) { if (this.dotsWrap) this.dotsWrap.style.display = "none"; return; }
    this.buildDots(); this.go(0); this.start();
    var self = this;
    root.addEventListener("mouseenter", function () { self.stop(); });
    root.addEventListener("mouseleave", function () { self.start(); });
  }
  Carousel.prototype.buildDots = function () {
    var self = this;
    this.dots = this.slides.map(function (_, i) {
      var dot = document.createElement("button");
      dot.className = "carousel__dot" + (i === 0 ? " is-active" : "");
      dot.type = "button";
      dot.setAttribute("aria-label", "Go to slide " + (i + 1));
      dot.addEventListener("click", function () { self.go(i); self.start(); });
      self.dotsWrap.appendChild(dot);
      return dot;
    });
  };
  Carousel.prototype.go = function (i) {
    this.index = (i + this.slides.length) % this.slides.length;
    var idx = this.index;
    this.slides.forEach(function (s, j) { s.classList.toggle("is-active", j === idx); });
    if (this.dots) this.dots.forEach(function (d, j) { d.classList.toggle("is-active", j === idx); });
  };
  Carousel.prototype.next = function () { this.go(this.index + 1); };
  Carousel.prototype.start = function () { this.stop(); if (prefersReduced) return; var self = this; this.timer = setInterval(function () { self.next(); }, this.interval); };
  Carousel.prototype.stop = function () { if (this.timer) clearInterval(this.timer); this.timer = null; };

  /* ---------- idempotent initialiser ---------- */
  function each(root, sel, fn) {
    Array.prototype.slice.call(root.querySelectorAll(sel)).forEach(function (el) {
      if (el.dataset.tplInit) return;
      el.dataset.tplInit = "1";
      fn(el);
    });
  }
  function initTemplates(root) {
    root = root || document;
    each(root, ".section--covers", CoverScroll);
    each(root, ".section--message", MessageReveal);
    each(root, ".carousel", function (el) { new Carousel(el); });
  }

  global.ZicomTemplates = { CoverScroll: CoverScroll, MessageReveal: MessageReveal, Carousel: Carousel, init: initTemplates };
  global.initTemplates = initTemplates;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { initTemplates(); });
  } else {
    initTemplates();
  }
})(window);
