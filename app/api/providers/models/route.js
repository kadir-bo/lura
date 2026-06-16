import { NextResponse } from "next/server";
import { FAST_MODEL_IDS } from "@/lib/fast-models";

export const runtime = "edge";

export async function GET() {
  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "NVIDIA API key not configured" },
      { status: 500 },
    );
  }

  const res = await fetch("https://integrate.api.nvidia.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Provider returned ${res.status}` },
      { status: res.status },
    );
  }

  const data = await res.json();

  const models = (data.data ?? [])
    .filter((m) => m.object === "model")
    .map((m) => ({
      id: m.id,
      value: m.id,
      label: formatLabel(m.id),
      // Connection provider (top-level group)
      provider: "NVIDIA NIM",
      // Model maker / company (sub-group)
      company: deriveProvider(m.id),
      // Benchmarked as a top-throughput model
      fast: FAST_MODEL_IDS.has(m.id),
      description: "",
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return NextResponse.json({ models });
}

function formatLabel(id) {
  const parts = id.split("/");
  const name = parts[parts.length - 1];
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function deriveProvider(id) {
  const org = id.split("/")[0] ?? "Unknown";
  const map = {
    "meta": "Meta",
    "nvidia": "NVIDIA",
    "deepseek-ai": "DeepSeek",
    "google": "Google",
    "microsoft": "Microsoft",
    "mistralai": "Mistral",
    "qwen": "Qwen",
    "01-ai": "01.AI",
    "ai21labs": "AI21 Labs",
    "baichuan-inc": "Baichuan",
    "nv-mistralai": "NVIDIA × Mistral",
    "nv-meta": "NVIDIA × Meta",
  };
  return map[org] ?? org;
}
