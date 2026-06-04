// Model × GPU matrix configuration for llama.cpp run command generation
// Data sourced from Unsloth HuggingFace GGUF repos

export interface GpuSetup {
  name: string;
  gpuCount: number;
  gpuModel: string;
  totalVramGB: number;
  vramPerGpuGB: number;
}

export type QuantLevel = "Q4_K_M" | "Q5_K_M" | "Q6_K";

export interface QuantEntry {
  quant: QuantLevel;
  sizeGB: number;
  filename: string; // exact GGUF filename in the repo
}

export interface ModelEntry {
  name: string;
  family: string;
  paramSize: string;
  spec: string;
  hfRepo: string;       // Unsloth HuggingFace repo
  contextWindow: number; // native context window
  architecture: string;
  quants: Record<QuantLevel, QuantEntry>;
}

// GPU setups
export const GPU_SETUPS: GpuSetup[] = [
  { name: "1× RTX 3090",     gpuCount: 1, gpuModel: "RTX 3090",    totalVramGB: 24, vramPerGpuGB: 24 },
  { name: "2× RTX 3090",     gpuCount: 2, gpuModel: "RTX 3090",    totalVramGB: 48, vramPerGpuGB: 24 },
  { name: "2× RTX 5060 Ti",  gpuCount: 2, gpuModel: "RTX 5060 Ti", totalVramGB: 32, vramPerGpuGB: 16 },
];

// Model catalog — data from Unsloth HF API (sizes in GB = bytes / 1,073,741,824)
export const MODELS: ModelEntry[] = [
  {
    name: "Qwen3 30B A3B",
    family: "qwen",
    paramSize: "30B",
    spec: "MoE (3B active) + MTP",
    hfRepo: "unsloth/Qwen3-30B-A3B-GGUF",
    contextWindow: 40960,
    architecture: "qwen3moe",
    quants: {
      Q4_K_M: { quant: "Q4_K_M", sizeGB: 17.3, filename: "Qwen3-30B-A3B-Q4_K_M.gguf" },
      Q5_K_M: { quant: "Q5_K_M", sizeGB: 20.2, filename: "Qwen3-30B-A3B-Q5_K_M.gguf" },
      Q6_K:   { quant: "Q6_K",   sizeGB: 23.4, filename: "Qwen3-30B-A3B-Q6_K.gguf" },
    },
  },
  {
    name: "Qwen 3.6 27B MTP",
    family: "qwen",
    paramSize: "27B",
    spec: "Dense + MTP",
    hfRepo: "unsloth/Qwen3.6-27B-MTP-GGUF",
    contextWindow: 131072,
    architecture: "qwen3",
    quants: {
      Q4_K_M: { quant: "Q4_K_M", sizeGB: 15.9, filename: "Qwen3.6-27B-Q4_K_M.gguf" },
      Q5_K_M: { quant: "Q5_K_M", sizeGB: 18.5, filename: "Qwen3.6-27B-Q5_K_M.gguf" },
      Q6_K:   { quant: "Q6_K",   sizeGB: 23.1, filename: "Qwen3.6-27B-Q6_K.gguf" }, // estimated
    },
  },
  {
    name: "Gemma 3 12B",
    family: "gemma",
    paramSize: "12B",
    spec: "Dense",
    hfRepo: "unsloth/gemma-3-12b-it-GGUF",
    contextWindow: 131072,
    architecture: "gemma3",
    quants: {
      Q4_K_M: { quant: "Q4_K_M", sizeGB: 7.5,  filename: "gemma-3-12b-it-Q4_K_M.gguf" },  // estimated
      Q5_K_M: { quant: "Q5_K_M", sizeGB: 8.8,  filename: "gemma-3-12b-it-Q5_K_M.gguf" },  // estimated
      Q6_K:   { quant: "Q6_K",   sizeGB: 10.5, filename: "gemma-3-12b-it-Q6_K.gguf" },     // estimated
    },
  },
  {
    name: "Gemma 3 27B",
    family: "gemma",
    paramSize: "27B",
    spec: "Dense",
    hfRepo: "unsloth/gemma-3-27b-it-GGUF",
    contextWindow: 131072,
    architecture: "gemma3",
    quants: {
      Q4_K_M: { quant: "Q4_K_M", sizeGB: 16.0, filename: "gemma-3-27b-it-Q4_K_M.gguf" }, // estimated
      Q5_K_M: { quant: "Q5_K_M", sizeGB: 18.5, filename: "gemma-3-27b-it-Q5_K_M.gguf" }, // estimated
      Q6_K:   { quant: "Q6_K",   sizeGB: 22.0, filename: "gemma-3-27b-it-Q6_K.gguf" },    // estimated
    },
  },
];

export const QUANT_LEVELS: QuantLevel[] = ["Q4_K_M", "Q5_K_M", "Q6_K"];

// VRAM headroom per GPU for KV cache and overhead (in GB)
export const VRAM_HEADROOM_PER_GPU = 2;

// DeepSeek provider configuration for pi-agent-core
export const DEEPSEEK_CONFIG = {
  provider: "deepseek",
  apiKey: "DEEPSEEK_API_KEY",
  baseUrl: "https://api.deepseek.com/v1",
  api: "openai-completions" as const,
  modelId: "deepseek-v4-flash",
  modelName: "DeepSeek V4 Flash",
  contextWindow: 131072,
  maxTokens: 8192,
  compat: {
    thinkingFormat: "deepseek" as const,
    supportsDeveloperRole: true,
    supportsReasoningEffort: false,
    maxTokensField: "max_tokens" as const,
  },
};

// Output configuration
export const OUTPUT_DIR = "output";
export const REPORT_FILENAME_PREFIX = "llama-cpp-news";
export const PR_LOOKBACK_DAYS = 7;
export const LLAMACPP_REPO = "ggml-org/llama.cpp";

// VRAM compatibility check for a given model + quant + setup
export function modelFitsSetup(model: ModelEntry, quant: QuantLevel, setup: GpuSetup): boolean {
  const size = model.quants[quant].sizeGB;
  const usableVram = setup.totalVramGB - (setup.gpuCount * VRAM_HEADROOM_PER_GPU);
  return size <= usableVram;
}

// Calculate free VRAM after loading the model (for KV cache)
export function freeVramGB(model: ModelEntry, quant: QuantLevel, setup: GpuSetup): number {
  const size = model.quants[quant].sizeGB;
  const usableVram = setup.totalVramGB - (setup.gpuCount * VRAM_HEADROOM_PER_GPU);
  return Math.max(0, usableVram - size);
}

// Get compatible pairs for a given quant level
export function getCompatiblePairs(quant?: QuantLevel): Array<{ model: ModelEntry; setup: GpuSetup }> {
  const pairs: Array<{ model: ModelEntry; setup: GpuSetup }> = [];
  const q = quant ?? "Q4_K_M";
  for (const model of MODELS) {
    for (const setup of GPU_SETUPS) {
      if (modelFitsSetup(model, q, setup)) {
        pairs.push({ model, setup });
      }
    }
  }
  return pairs;
}
