/* All project items (src/content/projects/*.json) as an array, plus a by-id map,
   for the projects page and the `projects` section type. */
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "content", "projects");

export default function () {
  const list = readdirSync(dir).filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")));
  const byId = {};
  for (const p of list) byId[p.id || p.slug] = p;
  return { list, byId };
}
