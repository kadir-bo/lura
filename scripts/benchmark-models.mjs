// One-off benchmark: measures generation speed of every NVIDIA NIM model
// and writes scripts/model-benchmark.json. Reads the API key from .env.local
// without printing it. Run: node scripts/benchmark-models.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadKey() {
  const env = readFileSync(join(ROOT, ".env.local"), "utf8");
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^\s*NVIDIA_API_KEY\s*=\s*(.+?)\s*$/);
    if (m) return m[1].replace(/^["']|["']$/g, "");
  }
  throw new Error("NVIDIA_API_KEY not found in .env.local");
}

const API = "https://integrate.api.nvidia.com/v1";
const KEY = loadKey();
const CONCURRENCY = 6;
const MAX_TOKENS = 48;
const TIMEOUT_MS = 30000;

async function listModels() {
  const res = await fetch(`${API}/models`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) throw new Error(`models list failed: ${res.status}`);
  const data = await res.json();
  return (data.data ?? [])
    .filter((m) => m.object === "model")
    .map((m) => m.id);
}

async function benchOne(id) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const start = Date.now();
  try {
    const res = await fetch(`${API}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: id,
        messages: [{ role: "user", content: "Count from 1 to 20." }],
        max_tokens: MAX_TOKENS,
        temperature: 0,
        stream: false,
      }),
      signal: controller.signal,
    });
    const ms = Date.now() - start;
    if (!res.ok) {
      return { id, ok: false, status: res.status, ms };
    }
    const json = await res.json();
    const completion = json.usage?.completion_tokens ?? 0;
    const tps = completion > 0 ? (completion / ms) * 1000 : 0;
    return { id, ok: true, ms, completion, tps: Math.round(tps * 10) / 10 };
  } catch (e) {
    return { id, ok: false, error: e.name === "AbortError" ? "timeout" : e.message, ms: Date.now() - start };
  } finally {
    clearTimeout(t);
  }
}

async function runPool(ids) {
  const results = [];
  let i = 0;
  let done = 0;
  async function worker() {
    while (i < ids.length) {
      const idx = i++;
      const r = await benchOne(ids[idx]);
      results[idx] = r;
      done++;
      const tag = r.ok ? `${r.tps} tok/s (${r.ms}ms)` : `FAIL ${r.status || r.error}`;
      process.stdout.write(`[${done}/${ids.length}] ${r.id} → ${tag}\n`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return results;
}

(async () => {
  const ids = await listModels();
  process.stdout.write(`Benchmarking ${ids.length} models (concurrency ${CONCURRENCY})…\n`);
  const results = await runPool(ids);

  const ok = results.filter((r) => r.ok && r.tps > 0).sort((a, b) => b.tps - a.tps);
  const tpsValues = ok.map((r) => r.tps);
  const median = tpsValues.length
    ? tpsValues.sort((a, b) => a - b)[Math.floor(tpsValues.length / 2)]
    : 0;

  // "Fast" = throughput at or above 1.3× median (clearly faster than typical)
  const threshold = Math.round(median * 1.3 * 10) / 10;
  const fast = ok.filter((r) => r.tps >= threshold).map((r) => r.id);

  const out = {
    generatedAt: new Date().toISOString(),
    total: ids.length,
    succeeded: ok.length,
    median,
    threshold,
    fast,
    results: results.map((r) => ({ ...r })),
  };
  writeFileSync(join(__dirname, "model-benchmark.json"), JSON.stringify(out, null, 2));
  process.stdout.write(
    `\nDone. median=${median} tok/s, threshold=${threshold} tok/s, fast=${fast.length} models\n`,
  );
  process.stdout.write(`Top 15:\n`);
  ok.slice(0, 15).forEach((r) => process.stdout.write(`  ${r.tps} tok/s  ${r.id}\n`));
})();
