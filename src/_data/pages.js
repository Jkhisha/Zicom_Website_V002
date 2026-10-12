/* Loads every split page file (src/content/pages/*.json) into one object keyed by
   its filename, e.g. pages.home, pages.about. Lets templates read a page by id
   without wiring up pagination yet (home-first build). */
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "content", "pages");

export default function () {
  const out = {};
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    out[f.replace(/\.json$/, "")] = JSON.parse(readFileSync(join(dir, f), "utf8"));
  }
  return out;
}
