import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pages = JSON.parse(await readFile(path.join(root, "source", "pages.json"), "utf8"));
const manifest = JSON.parse(await readFile(path.join(root, "source", "manifest.json"), "utf8"));

const categoryPages = [
  ["jedzenie", "Food"],
  ["owoce-i-warzywa", "Fruits & vegetables"],
  ["mieso", "Meat"],
  ["napoje", "Drinks"],
  ["ciasta", "Cakes"],
  ["rzeczy", "Things"],
];

const sourceToMedia = new Map(manifest.map((item) => [item.sourceUrl, item]));
const seen = new Set();
const artworks = [];

for (const [slug, category] of categoryPages) {
  const page = pages.find((item) => item.slug === slug);
  if (!page) continue;
  const urls = [...page.content.rendered.matchAll(/href=['"](https:\/\/justyna\.mahboob\.pl\/wp-content\/uploads\/[^'"]+)['"]/g)].map((match) => match[1]);
  for (const url of urls) {
    const item = sourceToMedia.get(url);
    if (!item || seen.has(item.id) || item.mediaType !== "image") continue;
    seen.add(item.id);
    artworks.push({
      id: item.id,
      src: `artwork/${item.filename}`,
      title: item.title || item.filename.replace(/^\d+-|\.[^.]+$/g, "").replaceAll("-", " "),
      alt: item.alt || item.title || "Collage by Justyna Mahboob",
      category,
      width: item.width,
      height: item.height,
    });
  }
}

const uncategorized = manifest.filter((item) => item.mediaType === "image" && !seen.has(item.id));
for (const item of uncategorized) {
  if ((item.width || 0) < 600 || (item.height || 0) < 600) continue;
  artworks.push({
    id: item.id,
    src: `artwork/${item.filename}`,
    title: item.title || item.filename,
    alt: item.alt || item.title || "Collage by Justyna Mahboob",
    category: "Archive",
    width: item.width,
    height: item.height,
  });
}

const output = `window.JUSTYNA_ARTWORKS = ${JSON.stringify(artworks, null, 2)};\n`;
await writeFile(path.join(root, "mockups", "data.js"), output);

const counts = Object.groupBy(artworks, (item) => item.category);
console.log(JSON.stringify({ total: artworks.length, categories: Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, value.length])) }, null, 2));
