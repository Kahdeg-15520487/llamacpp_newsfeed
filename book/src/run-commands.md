# Run Command Reference

> **Living document** — updated daily as new llama.cpp PRs bring new flags, backends, and optimizations.

---

## Model × GPU Matrix

| Model | Quant | Size | Context |
|-------|-------|------|---------|
| Qwen 3.6 35B A3B MTP | Q4_K_M | ~20.5 GB | 131K |
| Qwen 3.6 27B MTP | Q4_K_M | ~15.8 GB | 131K |
| Gemma 4 12B | Q4_K_M | ~7.0 GB | 32K |
| Gemma 4 26B A4B | Q4_K_M | ~15.2 GB | 32K |

---

## Commands

> Last updated: 2026-06-04
> Based on: PR #24074 (Metal heartbeat), PR #23834 (WebGPU FlashAttn), PR #23815 (Gemma 4 norm fix)

### Qwen 3.6 35B A3B MTP | 1× RTX 3090 (24 GB)

```bash
huggingface-cli download bartowski/Qwen3.6-35B-A3B-GGUF Qwen3.6-35B-A3B-Q4_K_M.gguf --local-dir ./models

./llama-cli \
  --model ./models/Qwen3.6-35B-A3B-Q4_K_M.gguf \
  --n-gpu-layers 999 \
  --ctx-size 8192 \
  --flash-attn \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

### Qwen 3.6 35B A3B MTP | 2× RTX 3090 (48 GB)

```bash
huggingface-cli download bartowski/Qwen3.6-35B-A3B-GGUF Qwen3.6-35B-A3B-Q4_K_M.gguf --local-dir ./models

./llama-cli \
  --model ./models/Qwen3.6-35B-A3B-Q4_K_M.gguf \
  --n-gpu-layers 999 \
  --ctx-size 32768 \
  --flash-attn \
  --split-mode layer \
  --tensor-split 24,24 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

### Qwen 3.6 35B A3B MTP | 2× RTX 5060 Ti (32 GB)

```bash
huggingface-cli download bartowski/Qwen3.6-35B-A3B-GGUF Qwen3.6-35B-A3B-Q4_K_M.gguf --local-dir ./models

./llama-cli \
  --model ./models/Qwen3.6-35B-A3B-Q4_K_M.gguf \
  --n-gpu-layers 999 \
  --ctx-size 16384 \
  --flash-attn \
  --split-mode layer \
  --tensor-split 16,16 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

### Qwen 3.6 27B MTP | 1× RTX 3090 (24 GB)

```bash
huggingface-cli download bartowski/Qwen3.6-27B-GGUF Qwen3.6-27B-Q4_K_M.gguf --local-dir ./models

./llama-cli \
  --model ./models/Qwen3.6-27B-Q4_K_M.gguf \
  --n-gpu-layers 999 \
  --ctx-size 16384 \
  --flash-attn \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

### Qwen 3.6 27B MTP | 2× RTX 3090 (48 GB)

```bash
huggingface-cli download bartowski/Qwen3.6-27B-GGUF Qwen3.6-27B-Q4_K_M.gguf --local-dir ./models

./llama-cli \
  --model ./models/Qwen3.6-27B-Q4_K_M.gguf \
  --n-gpu-layers 999 \
  --ctx-size 65536 \
  --flash-attn \
  --split-mode layer \
  --tensor-split 24,24 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

### Qwen 3.6 27B MTP | 2× RTX 5060 Ti (32 GB)

```bash
huggingface-cli download bartowski/Qwen3.6-27B-GGUF Qwen3.6-27B-Q4_K_M.gguf --local-dir ./models

./llama-cli \
  --model ./models/Qwen3.6-27B-Q4_K_M.gguf \
  --n-gpu-layers 999 \
  --ctx-size 32768 \
  --flash-attn \
  --split-mode layer \
  --tensor-split 16,16 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

### Gemma 4 12B | 1× RTX 3090 (24 GB)

```bash
huggingface-cli download bartowski/gemma-4-12b-it-GGUF gemma-4-12b-it-Q4_K_M.gguf --local-dir ./models

./llama-cli \
  --model ./models/gemma-4-12b-it-Q4_K_M.gguf \
  --n-gpu-layers 999 \
  --ctx-size 32768 \
  --flash-attn \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

### Gemma 4 12B | 2× RTX 3090 (48 GB)

```bash
huggingface-cli download bartowski/gemma-4-12b-it-GGUF gemma-4-12b-it-Q4_K_M.gguf --local-dir ./models

./llama-cli \
  --model ./models/gemma-4-12b-it-Q4_K_M.gguf \
  --n-gpu-layers 999 \
  --ctx-size 32768 \
  --flash-attn \
  --split-mode layer \
  --tensor-split 24,24 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

### Gemma 4 12B | 2× RTX 5060 Ti (32 GB)

```bash
huggingface-cli download bartowski/gemma-4-12b-it-GGUF gemma-4-12b-it-Q4_K_M.gguf --local-dir ./models

./llama-cli \
  --model ./models/gemma-4-12b-it-Q4_K_M.gguf \
  --n-gpu-layers 999 \
  --ctx-size 32768 \
  --flash-attn \
  --split-mode layer \
  --tensor-split 16,16 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

### Gemma 4 26B A4B | 1× RTX 3090 (24 GB)

```bash
huggingface-cli download bartowski/gemma-4-26b-a4b-it-GGUF gemma-4-26b-a4b-it-Q4_K_M.gguf --local-dir ./models

./llama-cli \
  --model ./models/gemma-4-26b-a4b-it-Q4_K_M.gguf \
  --n-gpu-layers 999 \
  --ctx-size 8192 \
  --flash-attn \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

### Gemma 4 26B A4B | 2× RTX 3090 (48 GB)

```bash
huggingface-cli download bartowski/gemma-4-26b-a4b-it-GGUF gemma-4-26b-a4b-it-Q4_K_M.gguf --local-dir ./models

./llama-cli \
  --model ./models/gemma-4-26b-a4b-it-Q4_K_M.gguf \
  --n-gpu-layers 999 \
  --ctx-size 32768 \
  --flash-attn \
  --split-mode layer \
  --tensor-split 24,24 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

### Gemma 4 26B A4B | 2× RTX 5060 Ti (32 GB)

```bash
huggingface-cli download bartowski/gemma-4-26b-a4b-it-GGUF gemma-4-26b-a4b-it-Q4_K_M.gguf --local-dir ./models

./llama-cli \
  --model ./models/gemma-4-26b-a4b-it-Q4_K_M.gguf \
  --n-gpu-layers 999 \
  --ctx-size 16384 \
  --flash-attn \
  --split-mode layer \
  --tensor-split 16,16 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

---

## Changelog

| Date | Changes |
|------|---------|
| 2026-06-04 | **PR #23834** WebGPU FlashAttention refactor — quantized KV-cache now supported in browser WebGPU tile path. K/V cache formats can be independent. No change to CUDA CLI flags. |
| 2026-06-04 | **PR #24074** Metal backend heartbeat reduced 500ms→5ms — macOS exit time improved. No change to CUDA CLI flags. |
| 2026-06-04 | **PR #23815** Gemma 4 audio RMS norm eps fixed from 1e-5 to 1e-6 — re-convert GGUFs for correct quality. |
| 2026-06-04 | **PR #22754** RVV quantization vec dot extended to 512/1024-bit VLENs — RISC-V CPU optimization only. |
| 2026-06-04 | **PR #22716** Added Granite Embedding R2 (97M/311M) ModernBERT model support. |
| 2026-06-04 | **PR #24032** Mermaid diagram rendering in server web UI. |
| 2026-06-04 | Initial commands based on current llama.cpp build |

---

*This page is updated daily by the pi-agent-core + DeepSeek pipeline based on recent llama.cpp merged PRs.*
