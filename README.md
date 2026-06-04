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

## Project Structure

```
llamacppghexplorer/
├── .github/workflows/daily-llama-news.yml   # CI/CD workflow
├── src/
│   ├── config.ts                             # Model×GPU matrix, provider config
│   ├── prompt.ts                             # System + task prompt templates
│   └── pipeline.ts                           # Main entry point
├── output/                                   # Generated reports
├── package.json
├── tsconfig.json
└── README.md
```
