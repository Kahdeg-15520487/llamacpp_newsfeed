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
  getAgentDir,
  ModelRegistry,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import { DEEPSEEK_CONFIG, OUTPUT_DIR } from "./config.js";
import { buildSystemPrompt, buildTaskPrompt } from "./prompt.js";
import * as fs from "node:fs";
import * as path from "node:path";

// ── CLI args ──────────────────────────────────────────────
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");

// ── Validate environment ──────────────────────────────────
const apiKey = process.env["DEEPSEEK_API_KEY"];
if (!apiKey && !isDryRun) {
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
if (apiKey) {
  authStorage.setRuntimeApiKey(DEEPSEEK_CONFIG.provider, apiKey);
}

// ── Model registry with custom DeepSeek model ─────────────
const modelRegistry = ModelRegistry.create(authStorage);

// ── Settings (in-memory, disable compaction for single-shot)
const settingsManager = SettingsManager.inMemory({
  compaction: { enabled: false },
  retry: { enabled: true, maxRetries: 2 },
});

// ── DeepSeek provider extension factory ───────────────────
function deepseekExtension(pi: ExtensionAPI) {
  pi.registerProvider(DEEPSEEK_CONFIG.provider, {
    name: "DeepSeek",
    baseUrl: DEEPSEEK_CONFIG.baseUrl,
    apiKey: DEEPSEEK_CONFIG.apiKey,
    api: DEEPSEEK_CONFIG.api,
    authHeader: true,
    models: [
      {
        id: DEEPSEEK_CONFIG.modelId,
        name: DEEPSEEK_CONFIG.modelName,
        reasoning: false,
        input: ["text"],
        cost: {
          input: 0.27,
          output: 1.1,
          cacheRead: 0.07,
          cacheWrite: 0.27,
        },
        contextWindow: DEEPSEEK_CONFIG.contextWindow,
        maxTokens: DEEPSEEK_CONFIG.maxTokens,
        compat: DEEPSEEK_CONFIG.compat,
      },
    ],
  });
}

// ── Resource loader with custom system prompt + extension ─
const loader = new DefaultResourceLoader({
  cwd: process.cwd(),
  agentDir: getAgentDir(),
  systemPromptOverride: () => buildSystemPrompt(),
  settingsManager,
  extensionFactories: [deepseekExtension],
});
await loader.reload();

async function main() {
  console.log("🚀 Llama.cpp Daily News Pipeline");
  console.log(
    `   Provider: ${DEEPSEEK_CONFIG.provider} (${DEEPSEEK_CONFIG.modelId})`
  );
  console.log(`   Output dir: ${outputDir}`);
  console.log(`   Mode: ${isDryRun ? "DRY RUN" : "LIVE"}`);
  console.log("");

  // ── Dry-run: just print the task prompt ────────────────
  if (isDryRun) {
    const taskPrompt = buildTaskPrompt();
    console.log("── DRY RUN: Task prompt ──");
    console.log(taskPrompt);
    console.log("── END DRY RUN ──");
    console.log("");
    console.log("No agent session started. Remove --dry-run to execute.");
    return;
  }

  // ── Find the DeepSeek model from registry ──────────────
  const deepseekModel = modelRegistry.find(
    DEEPSEEK_CONFIG.provider,
    DEEPSEEK_CONFIG.modelId
  );
  if (!deepseekModel) {
    console.error(
      `ERROR: Model ${DEEPSEEK_CONFIG.provider}/${DEEPSEEK_CONFIG.modelId} not found in registry.`
    );
    console.error("Make sure the extension registers it before model lookup.");
    process.exit(1);
  }

  // ── Create the agent session ────────────────────────────
  const { session } = await createAgentSession({
    cwd: process.cwd(),
    model: deepseekModel,
    thinkingLevel: "off",
    settingsManager,
    authStorage,
    modelRegistry,
    resourceLoader: loader,
    sessionManager: SessionManager.inMemory(),
    tools: ["read", "write", "bash", "webfetch"],
  });

  // ── Stream output to console ────────────────────────────
  session.subscribe((event) => {
    if (event.type === "message_update") {
      if (event.assistantMessageEvent?.type === "text_delta") {
        process.stdout.write(event.assistantMessageEvent.delta);
      }
      if (event.assistantMessageEvent?.type === "thinking_delta") {
        // Suppress thinking output for cleaner logs
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
      console.log("\n✅ Agent finished processing.");
    }
    if (event.type === "turn_end") {
      // Optional: log turn completions
    }
  });

  // ── Build the task prompt ───────────────────────────────
  const taskPrompt = buildTaskPrompt();

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
      console.log(
        `📄 Report generated: ${reportPath} (${(stats.size / 1024).toFixed(1)} KB)`
      );
    } else {
      console.warn(
        "⚠️  Report file not found — agent may not have written it."
      );
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
