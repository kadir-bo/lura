// No 7B Llama exists in the NVIDIA NIM catalog — the 8B instruct model is the
// closest current small/fast Llama and is in the benchmarked "fast" tier.
export const DEFAULT_MODEL = "meta/llama-3.1-8b-instruct";

// Verified against NVIDIA's chat-completions endpoint on 2026-08-02.
// The provider catalog also contains embedding, parsing, safety, image, and
// retired models that cannot be used to generate a chat response.
export const AVAILABLE_CHAT_MODEL_IDS = new Set([
  "deepseek-ai/deepseek-v4-flash",
  "google/diffusiongemma-26b-a4b-it",
  "meta/llama-3.1-70b-instruct",
  "meta/llama-3.1-8b-instruct",
  "meta/llama-3.2-1b-instruct",
  "meta/llama-3.2-11b-vision-instruct",
  "meta/llama-3.2-90b-vision-instruct",
  "meta/llama-3.3-70b-instruct",
  "mistralai/mistral-nemotron",
  "nvidia/ising-calibration-1.5-31b",
  "nvidia/llama-3.1-nemoguard-8b-content-safety",
  "nvidia/llama-3.1-nemotron-nano-vl-8b-v1",
  "nvidia/llama-3.1-nemotron-safety-guard-8b-v3",
  "nvidia/llama-3.3-nemotron-super-49b-v1.5",
  "nvidia/nemotron-3-nano-30b-a3b",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
  "nvidia/nemotron-3-super-120b-a12b",
  "nvidia/nemotron-3-ultra-550b-a55b",
  "nvidia/nemotron-3.5-content-safety",
  "nvidia/nemotron-mini-4b-instruct",
  "nvidia/nvidia-nemotron-nano-9b-v2",
  "nvidia/riva-translate-4b-instruct-v1.1",
  "nvidia/riva-translate-4b-instruct-v2",
  "openai/gpt-oss-20b",
  "poolside/laguna-xs-2.1",
  "stepfun-ai/step-3.7-flash",
]);

export const MODELS = [
  {
    id: "meta/llama-3.3-70b-instruct",
    value: "meta/llama-3.3-70b-instruct",
    label: "Llama 3.3 70B",
    provider: "NVIDIA NIM",
    company: "Meta",
    description: "Stark, präzise, für allgemeine Aufgaben",
  },
  {
    id: "meta/llama-3.1-8b-instruct",
    value: "meta/llama-3.1-8b-instruct",
    label: "Llama 3.1 8B",
    provider: "NVIDIA NIM",
    company: "Meta",
    fast: true,
    description: "Leichtgewichtig und schnell",
  },
  {
    id: "deepseek-ai/deepseek-v4-flash",
    value: "deepseek-ai/deepseek-v4-flash",
    label: "DeepSeek V4 Flash",
    provider: "NVIDIA NIM",
    company: "DeepSeek",
    description: "Schnell, 1M Token Kontext, MoE 284B",
  },
  {
    id: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
    value: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
    label: "Nemotron Super 49B",
    provider: "NVIDIA NIM",
    company: "NVIDIA",
    description: "NVIDIA's Flaggschiff-Modell",
  },
];
