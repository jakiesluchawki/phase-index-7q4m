import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const origin = "https://justyna.mahboob.pl";
const projectRoot = path.resolve(import.meta.dirname, "..");
const sourceDir = path.join(projectRoot, "source");
const artworkDir = path.join(projectRoot, "public", "artwork");

await mkdir(sourceDir, { recursive: true });
await mkdir(artworkDir, { recursive: true });

async function fetchChecked(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "Justyna portfolio archival mirror" },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }
  return response;
}

async function fetchCollection(endpoint) {
  const first = await fetchChecked(`${origin}/wp-json/wp/v2/${endpoint}?per_page=100&page=1`);
  const pages = Number(first.headers.get("x-wp-totalpages") || "1");
  const items = await first.json();
  for (let page = 2; page <= pages; page += 1) {
    const response = await fetchChecked(`${origin}/wp-json/wp/v2/${endpoint}?per_page=100&page=${page}`);
    items.push(...(await response.json()));
  }
  return items;
}

function safeFilename(media) {
  const url = new URL(media.source_url);
  const original = decodeURIComponent(path.basename(url.pathname));
  const cleaned = original.replace(/[^a-zA-Z0-9._-]+/g, "-");
  return `${String(media.id).padStart(4, "0")}-${cleaned}`;
}

const [media, pages, posts] = await Promise.all([
  fetchCollection("media"),
  fetchCollection("pages"),
  fetchCollection("posts"),
]);

await Promise.all([
  writeFile(path.join(sourceDir, "media.json"), `${JSON.stringify(media, null, 2)}\n`),
  writeFile(path.join(sourceDir, "pages.json"), `${JSON.stringify(pages, null, 2)}\n`),
  writeFile(path.join(sourceDir, "posts.json"), `${JSON.stringify(posts, null, 2)}\n`),
]);

const sitePages = new Set([`${origin}/`, `${origin}/galeria/`, `${origin}/kontakt/`]);
for (const page of pages) {
  if (page.link?.startsWith(origin)) sitePages.add(page.link);
}

for (const pageUrl of sitePages) {
  const response = await fetchChecked(pageUrl);
  const slug = new URL(pageUrl).pathname.replace(/^\/+|\/+$/g, "") || "home";
  await writeFile(path.join(sourceDir, `${slug.replaceAll("/", "-")}.html`), await response.text());
}

const manifest = [];
for (const item of media) {
  if (!item.source_url) continue;
  const filename = safeFilename(item);
  const destination = path.join(artworkDir, filename);
  const response = await fetchChecked(item.source_url);
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  manifest.push({
    id: item.id,
    filename,
    sourceUrl: item.source_url,
    mediaType: item.media_type,
    mimeType: item.mime_type,
    width: item.media_details?.width ?? null,
    height: item.media_details?.height ?? null,
    title: item.title?.rendered ?? "",
    caption: item.caption?.rendered ?? "",
    alt: item.alt_text ?? "",
    date: item.date ?? null,
  });
}

await writeFile(path.join(sourceDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(JSON.stringify({ media: media.length, pages: pages.length, posts: posts.length, downloaded: manifest.length }, null, 2));
