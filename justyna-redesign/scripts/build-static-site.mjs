import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const repositoryRoot = path.resolve(root, "..");
const site = path.join(root, "site");

await rm(site, { recursive: true, force: true });
await mkdir(path.join(site, "fonts"), { recursive: true });

for (const filename of ["index.html", "styles.css", "app.js", "data.js"]) {
  await cp(path.join(root, "mockups", filename), path.join(site, filename));
}

await cp(path.join(root, "public", "artwork"), path.join(site, "artwork"), { recursive: true });
await cp(path.join(repositoryRoot, "public", "fonts", "roobert-regular.woff2"), path.join(site, "fonts", "roobert-regular.woff2"));
await cp(path.join(repositoryRoot, "public", "fonts", "roobert-bold.woff2"), path.join(site, "fonts", "roobert-bold.woff2"));

console.log(`Built ${site}`);
