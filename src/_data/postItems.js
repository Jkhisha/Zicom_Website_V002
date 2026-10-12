/* All posts (src/content/posts/*.md with ---json front matter) as an array, newest
   first where a usable date exists. Powers the resources listings, the `posts`
   section type, and the post-detail pagination. */
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "content", "posts");

function parse(raw) {
  const m = raw.match(/^---json\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) return { body: raw };
  const fm = JSON.parse(m[1]);
  // Body lives in the JSON front matter (a list of content blocks). Only fall back
  // to a markdown body if one is actually present after the fence.
  const md = (m[2] || "").trim();
  if (md) fm.body = md;
  return fm;
}

export default function () {
  const list = readdirSync(dir).filter((f) => f.endsWith(".md"))
    .map((f) => parse(readFileSync(join(dir, f), "utf8")))
    // Drop placeholder posts (e.g. the [TBC] first blog post) so they don't
    // produce a /[TBC]/ URL or an empty card until the client supplies them.
    .filter((p) => p.slug && !String(p.slug).includes("[TBC") && !String(p.title).includes("[TBC"));
  // Stable order: valid dates newest-first, undated/[TBC] keep file order after.
  const dated = (v) => (v && !String(v).includes("TBC") ? Date.parse(v) : NaN);
  list.sort((a, b) => (dated(b.date) || 0) - (dated(a.date) || 0));
  return list;
}
