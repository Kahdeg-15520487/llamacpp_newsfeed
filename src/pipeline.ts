#!/usr/bin/env node
/**
 * Llama.cpp Daily News Feed Pipeline
 *
 * Uses @earendil-works/pi-agent-core Agent + DeepSeek built-in provider to:
 * 1. Fetch recently merged PRs from ggml-org/llama.cpp
 * 2. Categorize and summarize them
 * 3. Generate VRAM-aware run command suggestions for the model×GPU matrix
 * 4. Write a markdown report to output/
 */

import { Agent } from "@earendil-works/pi-agent-core";
import { getModel } from "@earendil-works/pi-ai";
import type { AgentTool } from "@earendil-works/pi-agent-core";
import { Type } from "typebox";

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

// ── Custom tools ──────────────────────────────────────────

const webfetchTool: AgentTool = {
  name: "webfetch",
  label: "Web Fetch",
  description: "Fetch a URL and return its content as plain text. Use for accessing web pages and APIs.",
  parameters: Type.Object({
    url: Type.String({ description: "The URL to fetch" }),
  }),
  execute: async (_toolCallId, params, _signal) => {
    const { url } = params as { url: string };
    console.log(`   🌐 Fetching: ${url}`);
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "llamacpp-news-bot/1.0",
          "Accept": "application/vnd.github+json, text/html, application/json, */*",
        },
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const text = await response.text();
      // Truncate very large responses to avoid blowing context
      const maxLen = 100_000;
      const truncated = text.length > maxLen
        ? text.slice(0, maxLen) + `\n... (truncated ${text.length - maxLen} bytes)`
        : text;
      return {
        content: [{ type: "text", text: truncated }],
        details: { url, status: response.status, length: text.length },
      };
    } catch (err) {
      throw new Error(`Failed to fetch ${url}: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

const writeTool: AgentTool = {
  name: "write",
  label: "Write File",
  description: "Write content to a file. Creates parent directories if needed. Overwrites existing files.",
  parameters: Type.Object({
    path: Type.String({ description: "File path to write to" }),
    content: Type.String({ description: "Content to write" }),
  }),
  execute: async (_toolCallId, params, _signal) => {
    const { path: filePath, content } = params as { path: string; content: string };
    const resolvedPath = path.resolve(filePath);
    console.log(`   ✏️  Writing: ${resolvedPath}`);
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(resolvedPath, content, "utf-8");
    return {
      content: [{ type: "text", text: `File written: ${resolvedPath} (${content.length} bytes)` }],
      details: { path: resolvedPath, size: content.length },
    };
  },
};

const readTool: AgentTool = {
  name: "read",
  label: "Read File",
  description: "Read the contents of a file.",
  parameters: Type.Object({
    path: Type.String({ description: "File path to read" }),
  }),
  execute: async (_toolCallId, params, _signal) => {
    const { path: filePath } = params as { path: string };
    const resolvedPath = path.resolve(filePath);
    console.log(`   📖 Reading: ${resolvedPath}`);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found: ${resolvedPath}`);
    }
    const content = fs.readFileSync(resolvedPath, "utf-8");
    const maxLen = 50_000;
    const truncated = content.length > maxLen
      ? content.slice(0, maxLen) + `\n... (truncated ${content.length - maxLen} bytes)`
      : content;
    return {
      content: [{ type: "text", text: truncated }],
      details: { path: resolvedPath, size: content.length },
    };
  },
};

const bashTool: AgentTool = {
  name: "bash",
  label: "Bash",
  description: "Execute a bash command and return stdout and stderr.",
  parameters: Type.Object({
    command: Type.String({ description: "The bash command to execute" }),
  }),
  execute: async (_toolCallId, params, _signal) => {
    const { command } = params as { command: string };
    console.log(`   💻 Executing: ${command.slice(0, 120)}`);
    try {
      const { execSync } = await import("node:child_process");
      const output = execSync(command, {
        encoding: "utf-8",
        timeout: 30_000,
        maxBuffer: 10 * 1024 * 1024,
        cwd: process.cwd(),
      });
      const truncated = output.length > 10_000
        ? output.slice(0, 10_000) + `\n... (truncated)`
        : output;
      return {
        content: [{ type: "text", text: truncated || "(no output)" }],
        details: { command, exitCode: 0 },
      };
    } catch (err: any) {
      const stderr = err.stderr || err.message || "";
      const stdout = err.stdout || "";
      const text = [stdout, stderr].filter(Boolean).join("\n") || "(no output)";
      return {
        content: [{ type: "text", text: text.slice(0, 10_000) }],
        details: { command, exitCode: err.status ?? 1, isError: true },
      };
    }
  },
};

const tools: AgentTool[] = [webfetchTool, writeTool, readTool, bashTool];

// ── Get the DeepSeek model (built-in provider) ────────────
const model = getModel("deepseek", DEEPSEEK_CONFIG.modelId as any);
if (!model) {
  console.error(`ERROR: DeepSeek model "${DEEPSEEK_CONFIG.modelId}" not found.`);
  console.error("Available models are discovered at runtime. Check your pi-ai version.");
  process.exit(1);
}
console.log(`   Model: ${model.provider}/${model.id} (${model.name})`);

// ── Create the agent ──────────────────────────────────────
const systemPrompt = buildSystemPrompt();

const agent = new Agent({
  initialState: {
    systemPrompt,
    model,
    thinkingLevel: "off",
    tools,
    messages: [],
  },
  getApiKey: async (provider) => {
    if (provider === "deepseek") return apiKey;
    return undefined;
  },
  toolExecution: "sequential",
});

// ── Subscribe to events for streaming output ──────────────
agent.subscribe((event) => {
  if (event.type === "message_update") {
    const ame = (event as any).assistantMessageEvent;
    if (ame?.type === "text_delta") {
      process.stdout.write(ame.delta);
    }
  }
  if (event.type === "tool_execution_start") {
    console.log(`\n🔧 Tool: ${(event as any).toolName}...`);
  }
  if (event.type === "tool_execution_end") {
    const isError = (event as any).isError;
    console.log(`   ${isError ? "❌ FAILED" : "✅ DONE"}`);
  }
  if (event.type === "agent_end") {
    console.log("\n✅ Agent finished processing.");
  }
});

// ── Main ──────────────────────────────────────────────────
async function main() {
  console.log("🚀 Llama.cpp Daily News Pipeline");
  console.log(`   Provider: ${model.provider} (${model.id})`);
  console.log(`   Output dir: ${outputDir}`);
  console.log(`   Mode: ${isDryRun ? "DRY RUN" : "LIVE"}`);
  console.log("");

  if (isDryRun) {
    const taskPrompt = buildTaskPrompt();
    console.log("── DRY RUN: Task prompt ──");
    console.log(taskPrompt);
    console.log("── END DRY RUN ──");
    console.log("");
    console.log("No agent started. Remove --dry-run to execute.");
    return;
  }

  const taskPrompt = buildTaskPrompt();

  console.log("📡 Sending task to agent...\n");
  const startTime = Date.now();

  try {
    await agent.prompt(taskPrompt);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n⏱️  Pipeline completed in ${elapsed}s`);

    // Check for the output file
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
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
