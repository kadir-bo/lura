// No 7B Llama exists in the NVIDIA NIM catalog — the 8B instruct model is the
// closest current small/fast Llama and is in the benchmarked "fast" tier.
export const DEFAULT_MODEL = "meta/llama-3.1-8b-instruct";

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
    id: "meta/llama-4-maverick-17b-128e-instruct",
    value: "meta/llama-4-maverick-17b-128e-instruct",
    label: "Llama 4 Maverick",
    provider: "NVIDIA NIM",
    company: "Meta",
    fast: true,
    description: "Neuestes Meta-Modell, multimodal, 128 Experten",
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
