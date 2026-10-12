/* Renderable inner pages: every split page EXCEPT the home page (rendered by
   index.njk) and the post-detail template (rendered by post-detail.njk over
   postItems). Used by inner-pages.njk pagination. */
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "content", "pages");

export default function () {
  return readdirSync(dir).filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")))
    .filter((p) => p.slug && p.slug !== "/" && !p.slug.includes("{"));
}
