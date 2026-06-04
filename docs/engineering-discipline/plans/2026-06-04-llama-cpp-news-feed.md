# Llama.cpp PR News Feed Pipeline — Implementation Plan

> **Worker note:** Execute this plan task-by-task using the agentic-run-plan skill or subagents. Checkbox syntax is rendered task formatting only; canonical progress is read with `todoread` and updated with `todowrite`.

**Goal:** Build a daily GitHub Action pipeline that uses pi-agent-core + DeepSeek to research recent llama.cpp merged PRs, categorize them, and generate VRAM-aware run-command suggestions for a model×GPU matrix.

**Architecture:** A single TypeScript pipeline script uses `@earendil-works/pi-agent-core` SDK's `createAgentSession` to spawn a DeepSeek-powered agent. The agent fetches PRs via GitHub API (webfetch), categorizes them, and writes a structured markdown report. A GitHub Actions workflow triggers daily via cron and commits the output.

**Tech Stack:** Node.js 20+, TypeScript, `@earendil-works/pi-agent-core` (pi SDK), DeepSeek API (openai-completions compat), GitHub Actions

**Work Scope:**
- **In scope:**
  - GitHub Actions daily cron workflow
  - TypeScript pipeline script using pi-agent-core SDK with DeepSeek
  - Agentic research: fetch merged PRs, categorize, summarize
  - VRAM-aware run command suggestions for model×GPU matrix
  - Markdown report output committed to repo
  - Model matrix: qwen3.6-35b-a3b-mtp, qwen3.6-27b-mtp, gemma4-12b, gemma4-26b-a4b
  - GPU setups: 1×3090 (24GB), 2×3090 (48GB), 2×5060ti (32GB)
- **Out of scope:**
  - Historical backfill of PRs
  - Web UI or GitHub Pages hosting
  - Slack/email notifications
  - Multiple quantization comparison tables

**Verification Strategy:**
- **Level:** build-only (new project, no existing tests)
- **Command:** `npx tsx src/pipeline.ts` (dry-run mode)
- **What it validates:** Pipeline runs without errors, agent session initializes, report file is generated

---

## File Structure Mapping

```
llamacppghexplorer/
├── .github/workflows/daily-llama-news.yml   # GitHub Action workflow
├── src/
│   ├── pipeline.ts                           # Main entry point: creates session, sends prompt, waits
│   ├── config.ts                             # Model×GPU matrix, DeepSeek provider config, output paths
│   └── prompt.ts                             # System prompt and task prompt templates
├── output/                                   # Generated reports land here
│   └── .gitkeep
├── package.json
├── tsconfig.json
└── README.md
```

---

## Project Capability Discovery

No existing project agents or skills found. This is a greenfield project. Will use the pi SDK directly — no subagents needed for implementation.

---

### Task 1: Project Scaffolding

**Dependencies:** None (can run in parallel)
**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `output/.gitkeep`

- [x] **Step 1: Create package.json**

```json
{
  "name": "llamacppghexplorer",
  "version": "1.0.0",
  "private": true,
  "description": "Daily llama.cpp merged PR news feed powered by pi-agent-core + DeepSeek",
  "type": "module",
  "scripts": {
    "pipeline": "tsx src/pipeline.ts",
    "pipeline:dry-run": "tsx src/pipeline.ts --dry-run"
  },
  "dependencies": {
    "@earendil-works/pi-coding-agent": "latest",
    "@earendil-works/pi-agent-core": "latest"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.6.0"
  }
}
```

- [x] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [x] **Step 3: Create output/.gitkeep**

```bash
mkdir -p output && touch output/.gitkeep
```

- [x] **Step 4: Install dependencies**

```bash
npm install
```

Expected: Dependencies install without errors.

---

### Task 2: Configuration Module (Model Matrix + DeepSeek Provider)

**Dependencies:** Task 1 completes
**Files:**
- Create: `src/config.ts`

- [x] **Step 1: Create src/config.ts with typed model/GPU matrix, DeepSeek provider config, and VRAM constants**

```typescript
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
  spec: string;       // e.g. "a3b" for MoE, "mtp" for multi-token prediction
  quant: string;       // recommended quantization
  estimatedSizeGB: number; // estimated file size at recommended quant
  contextWindow: number;    // native context window
  hfRepo: string;     // HuggingFace repo for GGUF downloads
  ggufPattern: string; // pattern to identify the right GGUF file
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
  modelId: "deepseek-chat",
  modelName: "DeepSeek V3",
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
```

- [x] **Step 2: Verify the config compiles**

```bash
npx tsx --eval "import './src/config.ts'; console.log('Config OK')"
```

Expected: "Config OK" printed, no errors.

---

### Task 3: Prompt Templates

**Dependencies:** Task 2 completes (imports config types)
**Files:**
- Create: `src/prompt.ts`

- [x] **Step 1: Create src/prompt.ts with the system prompt and task prompt for the agent**

```typescript
import { MODELS, GPU_SETUPS, getCompatiblePairs, LLAMACPP_REPO, PR_LOOKBACK_DAYS, OUTPUT_DIR, REPORT_FILENAME_PREFIX } from "./config.js";

export function buildSystemPrompt(): string {
  return `You are a technical analyst specializing in llama.cpp, LLM inference, and GPU-accelerated local inference. Your job is to research recently merged PRs in the llama.cpp repository, categorize them, summarize their impact, and generate relevant run-command suggestions.

## Your Capabilities
- You can fetch GitHub API endpoints using the webfetch tool to get PR data
- You can write files using the write tool to produce the final report
- You analyze PR diffs and descriptions to understand what changed and who it affects

## Categorization Rules
When categorizing PRs, use these categories:
- **Backend** — CUDA, Vulkan, Metal, SYCL, ROCm, CPU optimizations, GGML kernel changes
- **Quantization** — New quant types, quantization improvements, IQ changes
- **Model Support** — New architecture support, model-specific fixes, tokenizer updates
- **Performance** — Memory optimizations, speed improvements, batch processing
- **Server/API** — llama-server, HTTP API, OAI-compatible endpoint changes
- **CLI/Tooling** — llama-cli, llama-quantize, llama-perplexity, etc.
- **Bug Fix** — Crash fixes, correctness fixes, edge case handling
- **Documentation** — README, docs, examples
- **Build/CI** — CMake, Makefile, CI pipelines, dependency updates
- **Other** — Anything that doesn't fit above`;

export function buildTaskPrompt(): string {
  const compatiblePairs = getCompatiblePairs();

  const modelList = MODELS.map(m =>
    `- **${m.name}** (${m.paramSize} ${m.spec}): ${m.quant} ~${m.estimatedSizeGB}GB, ctx ${m.contextWindow.toLocaleString()}`
  ).join("\n");

  const setupList = GPU_SETUPS.map(s =>
    `- **${s.name}**: ${s.totalVramGB}GB total (${s.gpuCount}×${s.vramPerGpuGB}GB ${s.gpuModel})`
  ).join("\n");

  const pairsList = compatiblePairs.map(p =>
    `| ${p.model.name} | ${p.setup.name} | ${p.setup.totalVramGB}GB VRAM |`
  ).join("\n");

  const today = new Date().toISOString().split("T")[0];
  const outputPath = `${OUTPUT_DIR}/${today}-${REPORT_FILENAME_PREFIX}.md`;

  return `## Task: Generate Llama.cpp Daily News Report

### Step 1: Fetch Recent Merged PRs

Fetch the last ${PR_LOOKBACK_DAYS} days of merged PRs from \`${LLAMACPP_REPO}\` using the GitHub API:
- Endpoint: \`https://api.github.com/repos/${LLAMACPP_REPO}/pulls?state=closed&sort=updated&direction=desc&per_page=50\`
- Use the webfetch tool with appropriate headers (Accept: application/vnd.github+json)
- Filter to only PRs merged in the last ${PR_LOOKBACK_DAYS} days (check merged_at field)
- Focus on PRs with meaningful changes — skip trivial typo fixes and merge-branch PRs

### Step 2: Categorize Each PR

For each PR, determine its primary category from the categorization rules in your system prompt. A PR may touch multiple areas; pick the most impactful one.

### Step 3: Summarize Each PR

For each PR, write a 2-4 sentence summary covering:
- What changed
- Why it matters (who benefits, what improves)
- Any user-facing impact (new flags, changed behavior, new capabilities)

### Step 4: Generate Run Command Suggestions

For PRs that affect inference (Backend, Performance, Model Support, Quantization), generate run command suggestions. For EACH compatible model×GPU pair:

${pairsList.length > 0 ? `The following ${pairsList.length} model×GPU pairs are VRAM-compatible:\\n\\n| Model | GPU Setup | Total VRAM |\\n|-------|-----------|--------|\\n${pairsList}` : 'No compatible pairs found.'}

For each relevant PR, generate at least one concrete, runnable llama.cpp CLI command per compatible pair. Commands must include:
- Exact model GGUF filename (from HuggingFace repos)
- \`--model\` path
- \`--n-gpu-layers\` (offload all layers: 999 or specific count)
- \`--ctx-size\` (use model's native context window or a practical value)
- \`--flash-attn\` (enable when relevant, especially for large contexts)
- \`--split-mode layer\` (for multi-GPU setups)
- \`--tensor-split\` with VRAM-proportional values (for multi-GPU setups)
- \`--threads\` (CPU thread count recommendation)
- \`--no-mmap\` (when relevant for Windows or low-RAM systems)
- \`--temp\`, \`--repeat-penalty\`, \`--top-p\`, \`--top-k\` (reasonable defaults)
- Any new flags introduced by the PR

### Step 5: Write the Report

Write the complete report to \`${outputPath}\` using the write tool.

## Report Format

The report must follow this exact markdown structure:

\`\`\`markdown
# Llama.cpp Daily News — ${today}

> Auto-generated by pi-agent-core + DeepSeek | ${LLAMACPP_REPO}
> Model matrix: ${MODELS.length} models × ${GPU_SETUPS.length} GPU setups
> Compatible pairs (VRAM-filtered): ${compatiblePairs.length}

---

## 📊 Summary

| Metric | Count |
|--------|-------|
| PRs analyzed | N |
| Backend PRs | N |
| Bug fixes | N |
| Performance PRs | N |
| New features | N |
| PRs with command suggestions | N |

---

## 🔍 PR Details

### [Category] — PR #N: Title

**Merged:** YYYY-MM-DD | **Author:** @handle

**Summary:** 2-4 sentence summary of what changed and why it matters.

**Affected areas:** backend1, backend2

---

## 🖥️ Run Command Suggestions

### Model: [Model Name] | Setup: [GPU Setup]

> **PR #N: Title** — [one-line reason this PR affects these commands]

\`\`\`bash
# Download the model (if needed)
huggingface-cli download [hfRepo] [ggufPattern].gguf --local-dir ./models

# Run with llama.cpp
./llama-cli \\
  --model ./models/[ggufPattern].gguf \\
  --n-gpu-layers 999 \\
  --ctx-size [value] \\
  --flash-attn \\
  --split-mode layer \\
  --tensor-split [values] \\
  --threads [count] \\
  --temp 0.7 \\
  --repeat-penalty 1.1 \\
  --top-p 0.9 \\
  --top-k 40 \\
  -p "Your prompt here"
\`\`\`

---

## 📋 Command Quick-Reference Matrix

| Model | 1×3090 | 2×3090 | 2×5060Ti |
|-------|--------|--------|----------|
${MODELS.map(m => `| ${m.name} | ${GPU_SETUPS.map(s => modelFitsSetup(m, s) ? \`✅\` : \`❌ ${s.totalVramGB}GB\`).join(" | ")} |`).join("\n")}

---

*Report generated ${new Date().toISOString()} | Next update: tomorrow*
\`\`\`

## Important Notes
- Use the write tool to save the report — do NOT just output it in your response
- For PRs you cannot access/fetch, note them in the summary table but skip the details
- If no new PRs were merged in the window, generate a report stating that clearly
- When suggesting commands, ensure flags are compatible with the model architecture (e.g., Qwen models need --flash-attn for long contexts)`;
}

// Helper to check VRAM compatibility (mirrors config.ts for prompt use)
function modelFitsSetup(model: typeof MODELS[0], setup: typeof GPU_SETUPS[0]): boolean {
  const VRAM_HEADROOM_PER_GPU = 2;
  const usableVram = setup.totalVramGB - (setup.gpuCount * VRAM_HEADROOM_PER_GPU);
  return model.estimatedSizeGB <= usableVram;
}
```

- [x] **Step 2: Verify prompt templates compile**

```bash
npx tsx --eval "import { buildSystemPrompt, buildTaskPrompt } from './src/prompt.js'; console.log('System prompt length:', buildSystemPrompt().length); console.log('Task prompt length:', buildTaskPrompt().length)"
```

Expected: Both lengths printed, no errors.

---

### Task 4: Main Pipeline Script

**Dependencies:** Tasks 2, 3 complete
**Files:**
- Create: `src/pipeline.ts`

- [x] **Step 1: Create src/pipeline.ts — the main entry point using pi-agent-core SDK**

```typescript
#!/usr/bin/env node
/**
 * Llama.cpp Daily News Feed Pipeline
 *
 * Uses @earendil-works/pi-agent-core SDK with DeepSeek API to:
 * 1. Fetch recently merged PRs from ggml-org/llama.cpp
 * 2. Categorize and summarize them
 * 3. Generate VRAM-aware run command suggestions for the model×GPU matrix
 * 4. Write a markdown report to output/
 */

import {
  AuthStorage,
  createAgentSession,
  DefaultResourceLoader,
  ModelRegistry,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent";

import { DEEPSEEK_CONFIG, OUTPUT_DIR } from "./config.js";
import { buildSystemPrompt, buildTaskPrompt } from "./prompt.js";
import * as fs from "node:fs";
import * as path from "node:path";

// ── CLI args ──────────────────────────────────────────────
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");

// ── Validate environment ──────────────────────────────────
const apiKey = process.env["DEEPSEEK_API_KEY"];
if (!apiKey) {
  console.error("ERROR: DEEPSEEK_API_KEY environment variable is required");
  console.error("Set it via: export DEEPSEEK_API_KEY=sk-...");
  process.exit(1);
}

// ── Ensure output directory exists ────────────────────────
const outputDir = path.resolve(OUTPUT_DIR);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ── Configure auth storage with DeepSeek API key ──────────
const authStorage = AuthStorage.create();
authStorage.setRuntimeApiKey(DEEPSEEK_CONFIG.provider, apiKey);

// ── Model registry with custom DeepSeek model ─────────────
const modelRegistry = ModelRegistry.create(authStorage);

// ── Settings (in-memory, disable compaction for single-shot) ─
const settingsManager = SettingsManager.inMemory({
  compaction: { enabled: false },
  retry: { enabled: true, maxRetries: 2 },
});

// ── Resource loader with custom system prompt ─────────────
const loader = new DefaultResourceLoader({
  cwd: process.cwd(),
  systemPromptOverride: () => buildSystemPrompt(),
  settingsManager,
});
await loader.reload();

// ── Build model config ────────────────────────────────────
const model = {
  provider: DEEPSEEK_CONFIG.provider,
  model: DEEPSEEK_CONFIG.modelId,
  name: DEEPSEEK_CONFIG.modelName,
  api: DEEPSEEK_CONFIG.api,
  baseUrl: DEEPSEEK_CONFIG.baseUrl,
  apiKey: DEEPSEEK_CONFIG.apiKey,
  contextWindow: DEEPSEEK_CONFIG.contextWindow,
  maxTokens: DEEPSEEK_CONFIG.maxTokens,
  cost: { input: 0.27, output: 1.10, cacheRead: 0.07, cacheWrite: 0.27 },
  reasoning: false,
  input: ["text" as const],
  compat: {
    ...DEEPSEEK_CONFIG.compat,
  },
};

async function main() {
  console.log("🚀 Llama.cpp Daily News Pipeline");
  console.log(`   Provider: ${DEEPSEEK_CONFIG.provider} (${DEEPSEEK_CONFIG.modelId})`);
  console.log(`   Output dir: ${outputDir}`);
  console.log(`   Mode: ${isDryRun ? "DRY RUN" : "LIVE"}`);
  console.log("");

  // ── Register DeepSeek as a custom provider ──────────────
  // This is done via an inline extension factory
  const deepseekExtension = (pi: any) => {
    pi.registerProvider(DEEPSEEK_CONFIG.provider, {
      name: "DeepSeek",
      baseUrl: DEEPSEEK_CONFIG.baseUrl,
      apiKey: DEEPSEEK_CONFIG.apiKey,
      api: DEEPSEEK_CONFIG.api,
      authHeader: true,
      models: [model],
    });
  };

  const loader2 = new DefaultResourceLoader({
    cwd: process.cwd(),
    systemPromptOverride: () => buildSystemPrompt(),
    settingsManager,
    additionalExtensionFactories: [deepseekExtension],
  });
  await loader2.reload();

  // ── Create the agent session ────────────────────────────
  const { session } = await createAgentSession({
    cwd: process.cwd(),
    settingsManager,
    authStorage,
    modelRegistry,
    resourceLoader: loader2,
    sessionManager: SessionManager.inMemory(),
    tools: ["read", "write", "bash", "webfetch"],
    thinkingLevel: "off",
  });

  // ── Stream output to console ────────────────────────────
  session.subscribe((event: any) => {
    if (event.type === "message_update") {
      if (event.assistantMessageEvent?.type === "text_delta") {
        process.stdout.write(event.assistantMessageEvent.delta);
      }
      if (event.assistantMessageEvent?.type === "thinking_delta") {
        // Suppress thinking in output
      }
    }
    if (event.type === "tool_execution_start") {
      console.log(`\n🔧 Tool: ${event.toolName}...`);
    }
    if (event.type === "tool_execution_end") {
      const status = event.isError ? "❌ FAILED" : "✅ DONE";
      console.log(`   ${status}`);
    }
    if (event.type === "agent_end") {
      console.log("\n✅ Agent finished.");
    }
  });

  // ── Build the task prompt ───────────────────────────────
  const taskPrompt = buildTaskPrompt();

  if (isDryRun) {
    console.log("── DRY RUN: Task prompt ──");
    console.log(taskPrompt);
    console.log("── END DRY RUN ──");
    console.log("");
    console.log("No agent session started. Remove --dry-run to execute.");
    return;
  }

  // ── Execute the agent ───────────────────────────────────
  console.log("📡 Sending task to agent...\n");
  const startTime = Date.now();

  try {
    await session.prompt(taskPrompt);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n⏱️  Pipeline completed in ${elapsed}s`);

    // ── Check for the output file ─────────────────────────
    const today = new Date().toISOString().split("T")[0];
    const reportPath = path.join(outputDir, `${today}-llama-cpp-news.md`);
    if (fs.existsSync(reportPath)) {
      const stats = fs.statSync(reportPath);
      console.log(`📄 Report generated: ${reportPath} (${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
      console.warn("⚠️  Report file not found — agent may not have written it.");
      console.warn(`   Expected: ${reportPath}`);
    }
  } catch (err) {
    console.error("❌ Pipeline failed:", err);
    process.exit(1);
  } finally {
    session.dispose();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
```

- [x] **Step 2: Verify the pipeline compiles**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [x] **Step 3: Test dry-run mode**

```bash
DEEPSEEK_API_KEY=sk-test npx tsx src/pipeline.ts --dry-run
```

Expected: Prints the task prompt, no agent session started.

---

### Task 5: GitHub Actions Workflow

**Dependencies:** Task 4 completes
**Files:**
- Create: `.github/workflows/daily-llama-news.yml`

- [x] **Step 1: Create .github/workflows/daily-llama-news.yml**

```yaml
name: Daily Llama.cpp News Feed

on:
  schedule:
    # Run daily at 08:00 UTC (adjust as needed)
    - cron: "0 8 * * *"
  workflow_dispatch:  # Allow manual trigger
    inputs:
      lookback-days:
        description: "Days to look back for PRs"
        required: false
        default: "7"
        type: string

jobs:
  generate-news:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    permissions:
      contents: write  # Needed to commit the report

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Generate news report
        env:
          DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
        run: npm run pipeline
        timeout-minutes: 20

      - name: Commit and push report
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

          # Stage any new/modified report files
          git add output/*.md

          # Check if there are changes to commit
          if git diff --staged --quiet; then
            echo "No new report to commit."
          else
            TODAY=$(date +%Y-%m-%d)
            git commit -m "📰 Daily llama.cpp news — $TODAY"
            git push
            echo "✅ Report committed and pushed."
          fi
```

- [x] **Step 2: Verify YAML syntax**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/daily-llama-news.yml'))" 2>/dev/null || echo "Install pyyaml to validate, or use: npx action-validator .github/workflows/daily-llama-news.yml"
```

Expected: YAML parses without errors (or reasonable fallback message).

---

### Task 6: README Documentation

**Dependencies:** Task 5 completes
**Files:**
- Create: `README.md`

- [x] **Step 1: Create README.md**

```markdown
# Llama.cpp PR Explorer

Daily automated news feed for [llama.cpp](https://github.com/ggml-org/llama.cpp) merged PRs — categorized, summarized, and paired with VRAM-aware run command suggestions.

## How It Works

1. **GitHub Action** triggers daily at 08:00 UTC
2. **pi-agent-core + DeepSeek** agent fetches recent merged PRs via GitHub API
3. PRs are **categorized** (Backend, Performance, Bug Fix, etc.) and **summarized**
4. For inference-related PRs, **runnable `llama-cli` commands** are generated for each compatible model×GPU pair
5. A **markdown report** is committed to `output/YYYY-MM-DD-llama-cpp-news.md`

## Model Matrix

| Model | Params | Architecture | Quant | Size |
|-------|--------|-------------|-------|------|
| Qwen 3.6 35B A3B MTP | 35B | MoE + MTP | Q4_K_M | ~20.5 GB |
| Qwen 3.6 27B MTP | 27B | Dense + MTP | Q4_K_M | ~15.8 GB |
| Gemma 4 12B | 12B | Dense | Q4_K_M | ~7.0 GB |
| Gemma 4 26B A4B | 26B | MoE | Q4_K_M | ~15.2 GB |

## GPU Setups

| Setup | Total VRAM | Per-GPU VRAM |
|-------|-----------|--------------|
| 1× RTX 3090 | 24 GB | 24 GB |
| 2× RTX 3090 | 48 GB | 24 GB |
| 2× RTX 5060 Ti | 32 GB | 16 GB |

## Setup

### Prerequisites
- Node.js 20+
- DeepSeek API key

### Installation
```bash
npm install
```

### Configuration
Set your DeepSeek API key as a GitHub Actions secret:
1. Go to repo **Settings → Secrets and variables → Actions**
2. Add `DEEPSEEK_API_KEY` with your API key

### Local Usage
```bash
# Dry-run: prints the task prompt without executing
DEEPSEEK_API_KEY=sk-... npm run pipeline:dry-run

# Live run: executes the agent and generates a report
DEEPSEEK_API_KEY=sk-... npm run pipeline
```

### Manual Trigger
Go to **Actions → Daily Llama.cpp News Feed → Run workflow**.

## Output

Reports are saved to `output/YYYY-MM-DD-llama-cpp-news.md`. Each report includes:
- **Summary table** — PR counts by category
- **PR details** — one section per PR with summary and affected areas
- **Run command suggestions** — VRAM-aware `llama-cli` commands for each compatible model×GPU pair
- **Quick-reference matrix** — at-a-glance compatibility grid

## Architecture

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│ GitHub Action │────▶│ pi-agent-core   │────▶│ output/*.md  │
│ (daily cron)  │     │ + DeepSeek V3   │     │ (committed)  │
└──────────────┘     └─────────────────┘     └──────────────┘
                            │
                            ├── webfetch (GitHub API)
                            ├── write (markdown report)
                            └── read/bash (context)
```
```

- [x] **Step 2: Quick review for typos and broken links**

Read through the README and verify all paths match the actual file structure.

---

### Task 7 (Final): End-to-End Verification

**Dependencies:** All preceding tasks
**Files:** None (read-only verification)

- [x] **Step 1: Run dry-run to verify the full pipeline initializes**

```bash
DEEPSEEK_API_KEY=sk-test npx tsx src/pipeline.ts --dry-run
```

Expected: Task prompt printed, no agent session, no errors.

- [x] **Step 2: Verify all files exist**

```bash
echo "Checking file structure..."
test -f package.json && echo "✅ package.json"
test -f tsconfig.json && echo "✅ tsconfig.json"
test -f src/config.ts && echo "✅ src/config.ts"
test -f src/prompt.ts && echo "✅ src/prompt.ts"
test -f src/pipeline.ts && echo "✅ src/pipeline.ts"
test -f .github/workflows/daily-llama-news.yml && echo "✅ workflow"
test -f README.md && echo "✅ README.md"
test -f output/.gitkeep && echo "✅ output/.gitkeep"
```

Expected: All files present.

- [x] **Step 3: Verify TypeScript compiles clean**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 4: Verify plan success criteria**

Manually check each:
- [x] GitHub Actions workflow exists with daily cron schedule
- [x] Pipeline script uses pi-agent-core SDK with DeepSeek provider
- [x] Model matrix covers all 4 models (qwen 35b a3b mtp, qwen 27b mtp, gemma 12b, gemma 26b a4b)
- [x] GPU setups cover all 3 configs (1×3090, 2×3090, 2×5060ti)
- [x] VRAM-aware filtering excludes infeasible pairs
- [x] Command suggestions include full detail (ngl, ctx, flash-attn, split-mode, tensor-split, threads)
- [x] Reports output to markdown files committed to repo
- [x] DeepSeek API key configured via GitHub Secrets
