/* ZICOM website — Eleventy config (ESM; package.json has "type":"module").

   Content model: the single source-of-truth JSON is split (scripts/split-content.mjs)
   into collections under src/content/ (pages, projects, posts) plus globals under
   src/_data/ (site, navigation, partners, meta, projectsMeta). Decap edits those
   files; Eleventy renders them with Nunjucks.

   Assets: code assets (css/js/svg) publish to /assets; editorial photos publish to
   /images (the canonical image path baked into the content by the split script).   */
export default function (eleventyConfig) {
  // Home-first build: content/ is consumed as data (see src/_data/*.js loaders),
  // not rendered as pages yet. Pagination templates for pages/projects/posts come
  // in the next phase, where post dates/permalinks get handled properly.
  eleventyConfig.ignores.add("src/content/**");

  // Editorial photos: assets/img -> /images
  eleventyConfig.addPassthroughCopy({ "assets/img": "images" });
  // Code assets: keep their /assets/* paths
  eleventyConfig.addPassthroughCopy({ "assets/templates.css": "assets/templates.css" });
  eleventyConfig.addPassthroughCopy({ "assets/site.css": "assets/site.css" });
  eleventyConfig.addPassthroughCopy({ "assets/site-sections.css": "assets/site-sections.css" });
  eleventyConfig.addPassthroughCopy({ "assets/templates.js": "assets/templates.js" });
  eleventyConfig.addPassthroughCopy({ "assets/navbar.js": "assets/navbar.js" });
  eleventyConfig.addPassthroughCopy({ "assets/hero-logo.js": "assets/hero-logo.js" });
  eleventyConfig.addPassthroughCopy({ "assets/app.js": "assets/app.js" });
  eleventyConfig.addPassthroughCopy({ "assets/favicon.svg": "assets/favicon.svg" });
  eleventyConfig.addPassthroughCopy({ "assets/zicom-mark.svg": "assets/zicom-mark.svg" });
  eleventyConfig.addPassthroughCopy({ "assets/zicom-logo-poppins.svg": "assets/zicom-logo-poppins.svg" });

  // Emit the derived navbar JSON as a JSON filter for the inline #nav-data script.
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));
  // Small collection helpers (Nunjucks lacks selectattr; loop-scoped set doesn't persist).
  eleventyConfig.addFilter("where", (arr, key, val) => (arr || []).filter((x) => x && x[key] === val));
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n == null ? undefined : n));
  eleventyConfig.addFilter("byIds", (map, ids) => (ids || []).map((id) => (map || {})[id]).filter(Boolean));
  eleventyConfig.addFilter("hasReal", (v) => typeof v === "string" && v.length > 0 && !v.includes("[TBC"));

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
