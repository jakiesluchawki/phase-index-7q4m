import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const repositoryRoot = path.resolve(root, "..");
const site = path.join(root, "site");

await rm(site, { recursive: true, force: true });
await mkdir(path.join(site, "fonts"), { recursive: true });

let html = await readFile(path.join(root, "mockups", "index.html"), "utf8");

for (const filename of ["styles.css", "app.js", "data.js"]) {
  const content = await readFile(path.join(root, "mockups", filename));
  const extension = path.extname(filename);
  const basename = path.basename(filename, extension);
  const hash = createHash("sha256").update(content).digest("hex").slice(0, 10);
  const outputName = `${basename}.${hash}${extension}`;

  await writeFile(path.join(site, outputName), content);
  html = html.replaceAll(`"${filename}"`, `"${outputName}"`);
}

await writeFile(path.join(site, "index.html"), html);

await cp(path.join(root, "public", "artwork"), path.join(site, "artwork"), { recursive: true });
await cp(path.join(repositoryRoot, "public", "fonts", "roobert-regular.woff2"), path.join(site, "fonts", "roobert-regular.woff2"));
await cp(path.join(repositoryRoot, "public", "fonts", "roobert-bold.woff2"), path.join(site, "fonts", "roobert-bold.woff2"));

console.log(`Built ${site}`);
