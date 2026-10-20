import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const FIGURES = join(ROOT, "figures");
const ENGINE = join(ROOT, "engine", "core.js");
const TEMPLATE = join(ROOT, "gallery", "template.html");
const OUT = join(ROOT, "_site");

// A figure loads the engine with this tag while you work on it; the build inlines it.
const ENGINE_TAG = /<script\s+src=["'](?:\.\.\/\.\.\/engine\/)core\.js["']\s*>\s*<\/script>/;

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function figureDirs() {
  if (!existsSync(FIGURES)) return [];
  return readdirSync(FIGURES, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => existsSync(join(FIGURES, slug, "figure.html")))
    .sort();
}

function readMeta(slug) {
  const path = join(FIGURES, slug, "figure.json");
  const meta = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
  return { slug, project: "", title: slug, blurb: "", prompt: "", order: 0, ...meta };
}

function buildFigure(slug, engine) {
  const page = readFileSync(join(FIGURES, slug, "figure.html"), "utf8");
  const tag = ENGINE_TAG.exec(page);
  if (!tag) throw new Error(`figures/${slug}/figure.html must load <script src="../../engine/core.js"></script>`);
  const to = join(OUT, slug);
  mkdirSync(to, { recursive: true });
  const built = page.slice(0, tag.index) + "<script>\n" + engine + "\n</script>" + page.slice(tag.index + tag[0].length);
  writeFileSync(join(to, "index.html"), built);
}

function card(meta) {
  const href = `${meta.slug}/index.html`;
  const prompt = meta.prompt
    ? `<details class="prompt"><summary>Prompt</summary><p>${escapeHtml(meta.prompt)}</p></details>`
    : "";
  const blurb = meta.blurb ? `<p class="blurb">${escapeHtml(meta.blurb)}</p>` : "";
  return `      <article class="card">
        <a class="open" href="${href}">
          <h3>${escapeHtml(meta.title)}</h3>
        </a>
        ${blurb}
        ${prompt}
        <p class="links"><a href="${href}">Open</a></p>
      </article>`;
}

function render(figures) {
  const groups = new Map();
  for (const meta of figures) {
    const key = meta.project || "Other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(meta);
  }
  const sections = [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([project, items]) => {
      const cards = items
        .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
        .map(card)
        .join("\n");
      return `    <section class="group">
      <h2>${escapeHtml(project)}</h2>
      <div class="grid">
${cards}
      </div>
    </section>`;
    })
    .join("\n");

  const template = readFileSync(TEMPLATE, "utf8");
  return template
    .replace("<!--FIGURES-->", sections || '<p class="empty">No figures yet.</p>')
    .replace("<!--COUNT-->", String(figures.length));
}

function main() {
  const engine = readFileSync(ENGINE, "utf8");
  if (engine.toLowerCase().includes("</script")) throw new Error('engine/core.js contains "</script" and cannot be inlined');
  const slugs = figureDirs();
  if (!slugs.length) console.warn("no figures found under figures/");
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  const metas = [];
  for (const slug of slugs) {
    buildFigure(slug, engine);
    metas.push(readMeta(slug));
    console.log(`built ${slug}`);
  }

  writeFileSync(join(OUT, "index.html"), render(metas));
  writeFileSync(join(OUT, ".nojekyll"), "");
  console.log(`\nbuilt ${metas.length} figure(s) into _site/`);
}

main();
