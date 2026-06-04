// Model × GPU matrix configuration for llama.cpp run command generation

export interface GpuSetup {
  name: string;
  gpuCount: number;
  gpuModel: string;
  totalVramGB: number;
  vramPerGpuGB: number;
}

export interface ModelEntry {
  name: string;
  family: string;
  paramSize: string;
  spec: string;          // e.g. "a3b" for MoE, "mtp" for multi-token prediction
  quant: string;          // recommended quantization
  estimatedSizeGB: number; // estimated file size at recommended quant
  contextWindow: number;   // native context window
  hfRepo: string;         // HuggingFace repo for GGUF downloads
  ggufPattern: string;    // pattern to identify the right GGUF file
}

// GPU setups
export const GPU_SETUPS: GpuSetup[] = [
  {
    name: "1× RTX 3090",
    gpuCount: 1,
    gpuModel: "RTX 3090",
    totalVramGB: 24,
    vramPerGpuGB: 24,
  },
  {
    name: "2× RTX 3090",
    gpuCount: 2,
    gpuModel: "RTX 3090",
    totalVramGB: 48,
    vramPerGpuGB: 24,
  },
  {
    name: "2× RTX 5060 Ti",
    gpuCount: 2,
    gpuModel: "RTX 5060 Ti",
    totalVramGB: 32,
    vramPerGpuGB: 16,
  },
];

// Model catalog
export const MODELS: ModelEntry[] = [
  {
    name: "Qwen 3.6 35B A3B MTP",
    family: "qwen",
    paramSize: "35B",
    spec: "A3B MoE + MTP",
    quant: "Q4_K_M",
    estimatedSizeGB: 20.5,
    contextWindow: 131072,
    hfRepo: "bartowski/Qwen3.6-35B-A3B-GGUF",
    ggufPattern: "Qwen3.6-35B-A3B-Q4_K_M",
  },
  {
    name: "Qwen 3.6 27B MTP",
    family: "qwen",
    paramSize: "27B",
    spec: "Dense + MTP",
    quant: "Q4_K_M",
    estimatedSizeGB: 15.8,
    contextWindow: 131072,
    hfRepo: "bartowski/Qwen3.6-27B-GGUF",
    ggufPattern: "Qwen3.6-27B-Q4_K_M",
  },
  {
    name: "Gemma 4 12B",
    family: "gemma",
    paramSize: "12B",
    spec: "Dense",
    quant: "Q4_K_M",
    estimatedSizeGB: 7.0,
    contextWindow: 32768,
    hfRepo: "bartowski/gemma-4-12b-it-GGUF",
    ggufPattern: "gemma-4-12b-it-Q4_K_M",
  },
  {
    name: "Gemma 4 26B A4B",
    family: "gemma",
    paramSize: "26B",
    spec: "A4B MoE",
    quant: "Q4_K_M",
    estimatedSizeGB: 15.2,
    contextWindow: 32768,
    hfRepo: "bartowski/gemma-4-26b-a4b-it-GGUF",
    ggufPattern: "gemma-4-26b-a4b-it-Q4_K_M",
  },
];

// VRAM headroom per GPU for KV cache and overhead (in GB)
export const VRAM_HEADROOM_PER_GPU = 2;

// DeepSeek provider configuration for pi-agent-core
export const DEEPSEEK_CONFIG = {
  provider: "deepseek",
  apiKey: "DEEPSEEK_API_KEY", // resolved from env
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

// PR fetch window (days)
export const PR_LOOKBACK_DAYS = 7;

// GitHub API endpoint for llama.cpp merged PRs
export const LLAMACPP_REPO = "ggml-org/llama.cpp";

// VRAM compatibility check
export function modelFitsSetup(model: ModelEntry, setup: GpuSetup): boolean {
  const totalModelVram = model.estimatedSizeGB;
  // Model must fit across all GPUs with headroom per GPU
  const usableVram = setup.totalVramGB - (setup.gpuCount * VRAM_HEADROOM_PER_GPU);
  return totalModelVram <= usableVram;
}

// Generate compatible (model, setup) pairs
export function getCompatiblePairs(): Array<{ model: ModelEntry; setup: GpuSetup }> {
  const pairs: Array<{ model: ModelEntry; setup: GpuSetup }> = [];
  for (const model of MODELS) {
    for (const setup of GPU_SETUPS) {
      if (modelFitsSetup(model, setup)) {
        pairs.push({ model, setup });
      }
    }
  }
  return pairs;
}
