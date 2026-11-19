// Vérifie que les clés sont présentes et que chaque outil répond.
// Usage : set -a; source .env; set +a; npm run check:tools
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";

const results = [];
const check = async (name, fn) => {
  try {
    results.push([name, "OK", await fn()]);
  } catch (e) {
    results.push([name, "ÉCHEC", e.message]);
  }
};
const run = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8" }).trim().split("\n")[0];
const need = (v) => {
  if (!process.env[v]) throw new Error(`${v} non défini`);
  return process.env[v];
};

await check("Playwright", async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent("<title>ok</title>");
  const t = await page.title();
  await browser.close();
  return `chromium lancé (title=${t})`;
});

await check("Perplexity", async () => {
  const r = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${need("PERPLEXITY_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "sonar", messages: [{ role: "user", content: "Say ok" }], max_tokens: 5 }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return "API joignable";
});

await check("Firecrawl", async () => {
  const { default: Firecrawl } = await import("@mendable/firecrawl-js");
  const app = new Firecrawl({ apiKey: need("FIRECRAWL_API_KEY") });
  const doc = await app.scrape("https://example.com", { formats: ["markdown"] });
  return `scrape OK (${(doc.markdown || "").length} caractères)`;
});

await check("Composio", async () => {
  const { Composio } = await import("@composio/core");
  const composio = new Composio({ apiKey: need("COMPOSIO_API_KEY") });
  const toolkits = await composio.toolkits.get({});
  return `${toolkits.length ?? toolkits.items?.length ?? "?"} toolkits visibles`;
});

await check("FFmpeg", async () => run("ffmpeg", ["-version"]));
await check("yt-dlp", async () => `version ${run("yt-dlp", ["--version"])}`);
await check("Whisper", async () =>
  `faster-whisper ${run("python3", ["-c", "import faster_whisper as f; print(f.__version__)"])}`);
await check("HyperFrames", async () => `version ${run("npx", ["--no-install", "hyperframes", "--version"])}`);

for (const [n, s, d] of results) console.log(`${s === "OK" ? "✔" : "✘"} ${n.padEnd(11)} ${s.padEnd(6)} ${d}`);
process.exit(results.some((r) => r[1] !== "OK") ? 1 : 0);
