/**
 * TanStack Start + Tailwind can emit different CSS content hashes for the
 * SSR router vs the public asset. That causes FOUC (404 stylesheet on first
 * paint). After every production build, rewrite SSR refs to the real public
 * file and mirror any stale hashed names so old HTML still resolves.
 */
import { readdirSync, readFileSync, writeFileSync, statSync, copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const publicAssets = join(root, ".output/public/assets");
const serverDir = join(root, ".output/server");

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

if (!existsSync(publicAssets) || !existsSync(serverDir)) {
  console.log("[sync-css-hash] no .output yet — skip");
  process.exit(0);
}

const cssFiles = readdirSync(publicAssets)
  .filter((n) => /^styles-.*\.css$/.test(n))
  .map((n) => ({ name: n, size: statSync(join(publicAssets, n)).size }))
  .sort((a, b) => b.size - a.size);

if (!cssFiles.length) {
  console.log("[sync-css-hash] no styles-*.css found — skip");
  process.exit(0);
}

const real = cssFiles[0].name;
const realHref = `/assets/${real}`;
const pat = /\/assets\/styles-[A-Za-z0-9_-]+\.css/g;

let patched = 0;
const seen = new Set();

for (const file of walk(serverDir)) {
  if (!file.endsWith(".mjs") && !file.endsWith(".js")) continue;
  const text = readFileSync(file, "utf8");
  const matches = text.match(pat) || [];
  for (const m of matches) seen.add(m);
  let next = text;
  for (const m of matches) {
    if (m !== realHref) next = next.split(m).join(realHref);
  }
  if (next !== text) {
    writeFileSync(file, next);
    patched++;
  }
}

// Mirror real CSS under any other hashed names SSR (or old HTML) might request
for (const href of seen) {
  const name = href.slice("/assets/".length);
  const dest = join(publicAssets, name);
  if (!existsSync(dest)) {
    copyFileSync(join(publicAssets, real), dest);
    console.log(`[sync-css-hash] mirrored ${real} -> ${name}`);
  }
}

console.log(`[sync-css-hash] canonical=${real} patched=${patched} refs=${[...seen].join(",") || "(none)"}`);
