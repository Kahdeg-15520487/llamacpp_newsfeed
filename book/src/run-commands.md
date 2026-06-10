# Run Command Reference

> **Living document** — updated daily as new llama.cpp PRs bring new flags, backends, and optimizations.
> **Quantization data sourced from [Unsloth HuggingFace GGUF repos](https://huggingface.co/unsloth)**
> Last updated: 2026-06-10

---

## Model × GPU Matrix

Select quantization to see VRAM usage and recommended context sizes for each pairing.

| Model | Size | 1× RTX 3090 <br><small>22 GB usable</small> | 2× RTX 3090 <br><small>44 GB usable</small> | 2× RTX 5060 Ti <br><small>28 GB usable</small> |
|-------|------|-------------|-------------|---------------|
| Qwen 3.6 35B A3B MTP | <span id="size-qwen35b">—</span> | <span id="cell-qwen35b-1x3090">—</span> | <span id="cell-qwen35b-2x3090">—</span> | <span id="cell-qwen35b-2x5060">—</span> |
| Qwen 3.6 27B MTP | <span id="size-qwen27b">—</span> | <span id="cell-qwen27b-1x3090">—</span> | <span id="cell-qwen27b-2x3090">—</span> | <span id="cell-qwen27b-2x5060">—</span> |
| Gemma 3 12B | <span id="size-gemma12b">—</span> | <span id="cell-gemma12b-1x3090">—</span> | <span id="cell-gemma12b-2x3090">—</span> | <span id="cell-gemma12b-2x5060">—</span> |
| Gemma 3 27B | <span id="size-gemma27b">—</span> | <span id="cell-gemma27b-1x3090">—</span> | <span id="cell-gemma27b-2x3090">—</span> | <span id="cell-gemma27b-2x5060">—</span> |

<span id="pair-count">12</span> pairs · <span id="pass-count">0</span> meet 64K target · <span id="fail-count">12</span> below 64K or won't fit

> **Usable VRAM** = total VRAM − 2 GB per GPU (system overhead).<br>
> **Target:** ≥ 64K context. 🟢 = meets target, ⚠️ = below 64K, ❌ = < 8K or won't fit.<br>
> Data sourced from [Unsloth GGUF repos](https://huggingface.co/unsloth).

---

## Commands

### Qwen 3.6 35B A3B MTP <span id="qwen35b-1x3090"></span>

> **Q4_K_M (22.66 GB) does NOT fit on 1× RTX 3090 (22 GB usable).** Use 2×3090 or 2×5060Ti.

<div class="cmd-block" data-quant="Q4_K_M">

#### 2× RTX 3090 — Q4_K_M
```bash
huggingface-cli download unsloth/Qwen3.6-35B-A3B-MTP-GGUF Qwen3.6-35B-A3B-UD-Q4_K_M.gguf --local-dir ./models

./llama-cli \
  -hf unsloth/Qwen3.6-35B-A3B-MTP-GGUF:UD-Q4_K_M \
  --n-gpu-layers 999 \
  --ctx-size 131072 \
  --flash-attn \
  --split-mode layer --tensor-split 24,24 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

#### 2× RTX 5060 Ti — Q4_K_M
```bash
./llama-cli \
  -hf unsloth/Qwen3.6-35B-A3B-MTP-GGUF:UD-Q4_K_M \
  --n-gpu-layers 999 \
  --ctx-size 32768 \
  --flash-attn \
  --split-mode layer --tensor-split 16,16 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

</div>
<div class="cmd-block" data-quant="Q5_K_M">

> **Q5_K_M (27.09 GB) does NOT fit on 1×3090 or 2×5060Ti.**

#### 2× RTX 3090 — Q5_K_M
```bash
huggingface-cli download unsloth/Qwen3.6-35B-A3B-MTP-GGUF Qwen3.6-35B-A3B-UD-Q5_K_M.gguf --local-dir ./models

./llama-cli \
  -hf unsloth/Qwen3.6-35B-A3B-MTP-GGUF:UD-Q5_K_M \
  --n-gpu-layers 999 \
  --ctx-size 65536 \
  --flash-attn \
  --split-mode layer --tensor-split 24,24 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

</div>
<div class="cmd-block" data-quant="Q6_K">

> **Q6_K (30.01 GB) does NOT fit on 1×3090 or 2×5060Ti.**

#### 2× RTX 3090 — Q6_K
```bash
huggingface-cli download unsloth/Qwen3.6-35B-A3B-MTP-GGUF Qwen3.6-35B-A3B-UD-Q6_K.gguf --local-dir ./models

./llama-cli \
  -hf unsloth/Qwen3.6-35B-A3B-MTP-GGUF:UD-Q6_K \
  --n-gpu-layers 999 \
  --ctx-size 32768 \
  --flash-attn \
  --split-mode layer --tensor-split 24,24 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

</div>

---

### Qwen 3.6 27B MTP

<div class="cmd-block" data-quant="Q4_K_M">

#### 1× RTX 3090 — Q4_K_M
```bash
huggingface-cli download unsloth/Qwen3.6-27B-MTP-GGUF Qwen3.6-27B-Q4_K_M.gguf --local-dir ./models

./llama-cli \
  -hf unsloth/Qwen3.6-27B-MTP-GGUF:UD-Q4_K_XL \
  --n-gpu-layers 999 \
  --ctx-size 9216 \
  --flash-attn \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

#### 2× RTX 3090 — Q4_K_M
```bash
./llama-cli \
  -hf unsloth/Qwen3.6-27B-MTP-GGUF:UD-Q4_K_XL \
  --n-gpu-layers 999 \
  --ctx-size 43008 \
  --flash-attn \
  --split-mode layer --tensor-split 24,24 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

#### 2× RTX 5060 Ti — Q4_K_M
```bash
./llama-cli \
  -hf unsloth/Qwen3.6-27B-MTP-GGUF:UD-Q4_K_XL \
  --n-gpu-layers 999 \
  --ctx-size 18432 \
  --flash-attn \
  --split-mode layer --tensor-split 16,16 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

</div>
<div class="cmd-block" data-quant="Q5_K_M">

#### 1× RTX 3090 — Q5_K_M
```bash
huggingface-cli download unsloth/Qwen3.6-27B-MTP-GGUF Qwen3.6-27B-Q5_K_M.gguf --local-dir ./models

./llama-cli \
  -hf unsloth/Qwen3.6-27B-MTP-GGUF:Q5_K_M \
  --n-gpu-layers 999 \
  --ctx-size 5120 \
  --flash-attn \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

#### 2× RTX 3090 — Q5_K_M
```bash
./llama-cli \
  -hf unsloth/Qwen3.6-27B-MTP-GGUF:Q5_K_M \
  --n-gpu-layers 999 \
  --ctx-size 38400 \
  --flash-attn \
  --split-mode layer --tensor-split 24,24 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

#### 2× RTX 5060 Ti — Q5_K_M
```bash
./llama-cli \
  -hf unsloth/Qwen3.6-27B-MTP-GGUF:Q5_K_M \
  --n-gpu-layers 999 \
  --ctx-size 14336 \
  --flash-attn \
  --split-mode layer --tensor-split 16,16 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

</div>
<div class="cmd-block" data-quant="Q6_K">

#### 1× RTX 3090 — Q6_K (does not fit)
```bash
# Q6_K (23.1 GB) does not fit on a single 3090 (22 GB usable).
# Use Q4_K_M or Q5_K_M instead, or multi-GPU setups.
```

#### 2× RTX 3090 — Q6_K
```bash
huggingface-cli download unsloth/Qwen3.6-27B-MTP-GGUF Qwen3.6-27B-Q6_K.gguf --local-dir ./models

./llama-cli \
  -hf unsloth/Qwen3.6-27B-MTP-GGUF:Q6_K \
  --n-gpu-layers 999 \
  --ctx-size 31744 \
  --flash-attn \
  --split-mode layer --tensor-split 24,24 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

#### 2× RTX 5060 Ti — Q6_K
```bash
./llama-cli \
  -hf unsloth/Qwen3.6-27B-MTP-GGUF:Q6_K \
  --n-gpu-layers 999 \
  --ctx-size 7168 \
  --flash-attn \
  --split-mode layer --tensor-split 16,16 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

</div>

---

### Gemma 3 12B

<div class="cmd-block" data-quant="Q4_K_M">

#### All setups — Q4_K_M (fits easily on all)
```bash
huggingface-cli download unsloth/gemma-3-12b-it-GGUF gemma-3-12b-it-Q4_K_M.gguf --local-dir ./models

# Single GPU:
./llama-cli \
  -hf unsloth/gemma-3-12b-it-GGUF:UD-Q4_K_XL \
  --n-gpu-layers 999 \
  --ctx-size 32768 \
  --flash-attn \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"

# Multi-GPU: add --split-mode layer --tensor-split <vram>,<vram>
```

</div>
<div class="cmd-block" data-quant="Q5_K_M">

#### All setups — Q5_K_M
```bash
huggingface-cli download unsloth/gemma-3-12b-it-GGUF gemma-3-12b-it-Q5_K_M.gguf --local-dir ./models

./llama-cli \
  -hf unsloth/gemma-3-12b-it-GGUF:Q5_K_M \
  --n-gpu-layers 999 \
  --ctx-size 32768 \
  --flash-attn \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

</div>
<div class="cmd-block" data-quant="Q6_K">

#### All setups — Q6_K
```bash
huggingface-cli download unsloth/gemma-3-12b-it-GGUF gemma-3-12b-it-Q6_K.gguf --local-dir ./models

./llama-cli \
  -hf unsloth/gemma-3-12b-it-GGUF:Q6_K \
  --n-gpu-layers 999 \
  --ctx-size 32768 \
  --flash-attn \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

</div>

---

### Gemma 3 27B

<div class="cmd-block" data-quant="Q4_K_M">

#### 1× RTX 3090 — Q4_K_M
```bash
huggingface-cli download unsloth/gemma-3-27b-it-GGUF gemma-3-27b-it-Q4_K_M.gguf --local-dir ./models

./llama-cli \
  -hf unsloth/gemma-3-27b-it-GGUF:UD-Q4_K_XL \
  --n-gpu-layers 999 \
  --ctx-size 9216 \
  --flash-attn \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

#### 2× RTX 3090 — Q4_K_M
```bash
./llama-cli \
  -hf unsloth/gemma-3-27b-it-GGUF:UD-Q4_K_XL \
  --n-gpu-layers 999 \
  --ctx-size 43008 \
  --flash-attn \
  --split-mode layer --tensor-split 24,24 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

#### 2× RTX 5060 Ti — Q4_K_M
```bash
./llama-cli \
  -hf unsloth/gemma-3-27b-it-GGUF:UD-Q4_K_XL \
  --n-gpu-layers 999 \
  --ctx-size 18432 \
  --flash-attn \
  --split-mode layer --tensor-split 16,16 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

</div>
<div class="cmd-block" data-quant="Q5_K_M">

#### 1× RTX 3090 — Q5_K_M
```bash
huggingface-cli download unsloth/gemma-3-27b-it-GGUF gemma-3-27b-it-Q5_K_M.gguf --local-dir ./models

./llama-cli \
  -hf unsloth/gemma-3-27b-it-GGUF:Q5_K_M \
  --n-gpu-layers 999 \
  --ctx-size 5120 \
  --flash-attn \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

#### 2× RTX 3090 — Q5_K_M
```bash
./llama-cli \
  -hf unsloth/gemma-3-27b-it-GGUF:Q5_K_M \
  --n-gpu-layers 999 \
  --ctx-size 38400 \
  --flash-attn \
  --split-mode layer --tensor-split 24,24 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

#### 2× RTX 5060 Ti — Q5_K_M
```bash
./llama-cli \
  -hf unsloth/gemma-3-27b-it-GGUF:Q5_K_M \
  --n-gpu-layers 999 \
  --ctx-size 14336 \
  --flash-attn \
  --split-mode layer --tensor-split 16,16 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

</div>
<div class="cmd-block" data-quant="Q6_K">

#### 1× RTX 3090 — Q6_K (does not fit)
```bash
# Q6_K (22.0 GB) is exactly at the 22 GB usable limit — may OOM.
# Use Q4_K_M or Q5_K_M instead, or multi-GPU setups.
```

#### 2× RTX 3090 — Q6_K
```bash
huggingface-cli download unsloth/gemma-3-27b-it-GGUF gemma-3-27b-it-Q6_K.gguf --local-dir ./models

./llama-cli \
  -hf unsloth/gemma-3-27b-it-GGUF:Q6_K \
  --n-gpu-layers 999 \
  --ctx-size 33280 \
  --flash-attn \
  --split-mode layer --tensor-split 24,24 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

#### 2× RTX 5060 Ti — Q6_K
```bash
./llama-cli \
  -hf unsloth/gemma-3-27b-it-GGUF:Q6_K \
  --n-gpu-layers 999 \
  --ctx-size 9216 \
  --flash-attn \
  --split-mode layer --tensor-split 16,16 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

</div>

---

## Changelog

| Date | Changes |
|------|---------|
| 2026-06-10 | Reviewed — no changes needed. Today's PRs include: Gemma4 MTP support (#23398) delivering 2× speedup on dense models; Vulkan v_dot2_f32_f16 (#24123) up to 2× f16 matmul speedup on AMD; Vulkan IQ1 shared memory fix (#24287); COL2IM_1D CPU op (#24206) for audio vocoders; Granite speech embedding fix (#24357); server prompt logging (#22031); idle KV cache slot export fix (#24190); WebUI pinned conversations (#21387), run_javascript tool (#24244), mobile overflow fix (#24158), and style perf fix (#24243); SYCL multi-column MMVQ port (#21845) for ~45% speculative decoding speedup on Intel Arc; build_vit batching (#24352) enabling future DeepSeek-OCR multi-tile encoding; and various bug fixes (plamo2 regression #24317, rms_norm_back aliasing #24305, speculative vocab check #24256). None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-09 | Reviewed — no changes needed. Today's PRs include: GGML_OP_COL2IM_1D CPU (#24206) for audio vocoder upsampling; idle slot RAM export fix (#24190) improving parallel slot KV caching; plamo2 attention_key/value_length regression fix (#24317); rms_norm_back aliasing correctness fix (#24305); ggml-webgpu clang-format CI (#24308); LFM2/LFM2.5 tool parser unification (#24178); SYCL multi-column MMVQ (#21845) delivering ~45% speculative decoding speedup on Intel Arc; Gemma 4 unified variant support (#24077); Step35 MTP KV cache allocation fix (#24125) reducing draft KV cache from 216 MiB to 18 MiB; CI ccache disable for MSVC (#23911); --no-mmproj download fix (#23425); OpenCL flat GEMV for large M (#24006). None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-08 | Reviewed — no changes needed. Today's PRs include Vulkan MoE optimizations (#23991), CUDA PDL MoE enrollment (#24087), Gemma4 MTP support (#23398), SYCL multi-column MMVQ (#21845), HIP RDNA3.5 GPU additions (#24129), Granite4 Vision (#23545), Metal im2col audio fix (#24220), n_layer hparams refactor (#24060), and various bug fixes (speculative vocab check #24256, off-by-one n_gpu_layers #24208, LFM2 reasoning #24234, Mistral-Medium converter #24268, Gemma4 no-audio converter #24242). None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-07 | Reviewed — no changes needed. PRs this period (LFM2 reasoning fix, n_gpu_layers off-by-one, Gemma4 no-audio converter fix, Docker CUDA 13.3.0 bump, PDL race condition fix, SVE FWHT fix, dynamic chunk scheduling for kleidiai) are backend optimizations or correctness fixes that don't change run command flags or recommendations. |
| 2026-06-06 | Reviewed — no changes needed. PRs this week (TP granularity 128, CUDA KV-cache reservation, Qwen3.6 MTP fix, Gemma 4 unified, EXAONE 4.5, Granite4 Vision, Granite Embeddings R2) are backend/model additions or correctness fixes that don't change run command flags or recommendations. Note: Qwen3.6 MTP users should re-download updated GGUFs after the post-norm MTP fix (#24025). |
| 2026-06-05 | **PR #23792**: Tensor parallelism (`--split-mode tensor`) now supports quantized KV cache (`--type-k`, `--type-v`). The previous restriction is lifted, allowing TP users to reduce KV cache VRAM with quantization. Users should add `--type-k q8_0 --type-v q8_0` (or Q4_0 for more savings) to multi-GPU tensor-split commands. No flag changes needed for layer-split mode. |
| 2026-06-04 | Reviewed — no changes needed. Today's PRs (Gemma 4 unified, Granite Embeddings R2, iGPU dedup, Turing MMVQ tuning, AMD MFMA dispatch, Hexagon refresh) are backend/model additions that don't change run command flags or recommendations. |
| 2026-06-04 | Initial commands based on current llama.cpp build. Sourced from Unsloth GGUF repos. Added interactive quant selector (Q4_K_M / Q5_K_M / Q6_K). |

---

*This page is updated daily by the pi-agent-core + DeepSeek pipeline based on recent llama.cpp merged PRs.*
