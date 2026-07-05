# Run Command Reference

> **Living document** — updated daily as new llama.cpp PRs bring new flags, backends, and optimizations.
> **Quantization data sourced from [Unsloth HuggingFace GGUF repos](https://huggingface.co/unsloth)**
> Last updated: 2026-07-05

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

| 2026-07-05 | Reviewed — no changes needed. Today's PRs: CPU quantized concat correctness fix for DeepSeek V4 KV cache prep (#25247), DFlash speculative decoding K/V rotation crash fix on AMD GPUs (#25215), and UI display/behavior settings made syncable via --ui-config-file (#25132). All are bug fixes or UI config improvements — none change any -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-07-04 | Reviewed — no changes needed. Today's PRs: UI streaming performance optimization with 3× scripting time reduction (#25225), and StepFun chat model infinite reasoning loop fix (#25238). Neither PR changes any -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-07-03 | Reviewed — no changes needed. Today's PRs: CUDA GDN copy fusion delivering ~3-4% speedup on Qwen3.6 with MTP (#23940), UI tool message conversation isolation fix (#25177), MCP Servers opt-in onboarding dialog (#25239), and cpp-httplib 0.49.0 update with security fixes (#25218). None of these PRs change any -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| Date | Changes |
|------|---------|
| 2026-07-01 | Reviewed — no changes needed. Today's PRs: CUDA FA `flash_attn_mask_to_KV_max` fully enrolled in PDL for code consistency (#25185), and AVX2/AVX CPU optimization for NVFP4 dot product delivering ~10.7x speedup on CPU (#23961). Neither PR changes any -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-30 | Reviewed — no changes needed. Today's only PR is #25143 (ggml-webgpu NVFP4 support), which adds NVFP4 format support to the WebGPU backend. This is a backend coverage improvement for WebGPU users running NVFP4 GGUFs and does not change any -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-29 | Reviewed — no changes needed. Today's major PR is DeepSeek V4 support (#24162), the most significant model architecture addition in weeks, featuring CSA/HCA compressed attention. Also merged: Tailwind UI build fix for ignored worktrees (#24879) and removal of unused regex-partial dead code (#25118). None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-28 | Reviewed — no changes needed. Today's PRs include: OpenCL flash attention improvement with quantized KV cache support (#25069) and further log reduction (default verbosity lowered, subsystems get COM_*/SPC_* macros, #25078). Neither PR changes the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-27 | Reviewed — no changes needed. Today's PRs include: CUDA per-token sync reduction with fixed multi-GPU pipeline parallelism (#20793), Vulkan step operator fix for zero inputs (#25036), consistent binary naming (rpc-server → llama-rpc-server, #25045), windows-openvino CI release gate (#25022), and test-chat-template --no-common option fix (#25075). None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-26 | Reviewed — no changes needed. Today's PRs include: SSE replay buffer for resumable streaming (#23226), CUDA out_prod broadcast batching with up to 282× speedup (#24426), ARM SVE ggml_vec_dot_f32 correctness fix (#24699), and SYCL softmax NaN clamp fix (#24941). None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-25 | Reviewed — no changes needed. Today's PRs include: SYCL --split-mode tensor all-reduce for dual Intel Arc GPUs (+20-78% speedup vs layer-mode, #24152), multi-GPU CUDA teardown crash fix on Blackwell GPUs (#24935), CUDA binary ops integer overflow fix for large tensors (#24706), and sidebar-on-desktop setting fix after the nav refactor (#24979). None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-24 | Reviewed — no changes needed. Today's PRs include: Vulkan FA FP16 overflow fix for flash attention scalar/CM1 paths (#24909), UI loading bar below model picker (#24931), major web UI redesign with new logo and mobile UX overhaul (#24897), and LFM2.5-ColBERT-350M / LFM2.5-Embedding-350M model support (#24913). None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-23 | Reviewed — no changes needed. Today's PRs include: WebGPU MTP mat-vec optimization delivering 2-3x MTP speedup on Apple Silicon (#24811) and server router dedicated download process (#24834). Neither changes any -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-22 | Reviewed — no changes needed. Today's 10 PRs include: server batch construction refactor into pre-/decode/post-decode phases (#24843), real-time model load progress tracking via /models/sse (#24828, #24865, #24870), jinja call statement support (#24847), ac parser for stricter grammar generation (#24869), edit_file crash fix (#24893), mtmd_get_memory_usage speedup from 200ms to 20ms (#24867), restored "verbose" schema field (#24864), and Android Termux build docs (#21812). None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-21 | Reviewed — no changes needed. Today's PR adds multi-layer MTP speculative decoding for Step3.5/3.7 flash models (#24340), replacing single-block MTP with chained heads for up to ~15% higher token throughput. This is a model-specific speculative decoding feature for Step model users and does not change any -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-20 | Reviewed — no changes needed. Today's PRs add EAGLE3 speculative decoding support for Qwen3.5/3.6 (#24593), server --agent flag (#24801), server logprobs optimization (~12× faster #24796), webui naming cleanup (#24817), router IPC refactor (#24821), cpp-httplib 0.48.0 update with security fixes (#24787), WebGPU F16 toggle for Vulkan+NVIDIA (#24723), mtmd Windows UTF-8 fix (#24779), mtmd 5 bug fixes (#24784), comment support in API key file (#23168), and Docker UI build fix (#24794). None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-19 | Reviewed — no changes needed. Today's PRs include: server crash fix for unbounded `n_discard` in context shifting (#24786), router args forwarding fix for child instances (#24760, from yesterday), slot selection consolidation into `get_available_slot` (#24755), POWER10 K-tails MMA matmul optimization delivering ~60% PP speedup on ppc64le (#24753), and mtmd preprocessing refactor groundwork for llava-uhd batching (#24736). None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-18 | Reviewed — no changes needed. Today's PRs include server model management API (#23976), SYCL dev2dev memcpy fix for multi-GPU stability (#24476), SYCL env var rename (#24719), SYCL Q1_0 MUL_MAT/OUT_PROD support (#24721) delivering up to 19.6x speedup on Intel Arc, CI check-release message parsing fix (#24751), and desktop app self-update gating to llama-install.sh builds only (#24754). None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-17 | Reviewed — no changes needed. Today's PRs include major OpenVINO backend update (OV 2026.2, gemma4 support, context-shift, Q5_1, #24503), OpenCL decode optimization (up to +57% token gen speed #24504), Vulkan buffer memory property fix (#24326), SYCL USM system allocations (#22526), SYCL MoE async copy use-after-free fix (#24676), SYCL FP16 ops completeness (#24692), CUDA device reset revert restoring stability (#24715), UI MCP SSE transport fix (#24500), UI mermaid/SVG source toggle (#24652), and CI Vulkan Docker image fix (#24595). Also the logging queue now enforces a max capacity to prevent unbounded growth (#24490). None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-16 | Reviewed — no changes needed. Today's PRs are SYCL/Vulkan backend improvements (GGML_SYCL_F16 defaulting to ON #23996, UMA host-visible buffers #22930, SYCL Q6_K MoE reorder #24452, Vulkan col2im_1d #24425, gated_delta_net S_v=16 #24581, SYCL EXPM1/FLOOR/TRUNC/ROUND #24363), speculative decoding enhancements (eagle3 backend sampling #24655, spec metrics #24536), and a llama-bench --offline flag #24511. None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-15 | Reviewed — no changes needed. Today's PRs include SVG code block rendering in the web UI (#24080), chat whitespace parsing fix (#24624), LoRA converter arch retrieval fix (#24621), and reasoning block markdown rendering (#24611). None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-14 | Reviewed — no changes needed. Today's PRs include EAGLE3 speculative decoding (#18039), cohere2-MoE architecture support (#24260), UI embed crash fix (#24597), CI improvements for SYCL check-release (#24583) and CUDA label renaming (#24594), and cohere2moe vocab fix (#24601). None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-13 | Reviewed — no changes needed. Today's PRs include PWA support for the web UI (#23871), mtmd batching API for faster multimodal encoding (#24384), reasoning budget WebUI precedence fix (#24517), Vulkan pipeline barriers for Intel GPU correctness (#23770), fit module refactoring (#24506, #24522), and CI release fixes (#24544, #24545). None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-12 | Reviewed — no changes needed. Today's big news is the EAGLE3 speculative decoding merge (#18039), plus Vulkan buffer optimization (#23973), Asahi Linux fix (#24306), OpenCL Adreno Q5 kernels (#24319), EXIF orientation fix in the web UI (#24196), CUDA concat scalar support (#24011), and SYCL CI fix (#24387). None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-11 | Reviewed — no changes needed. Today's PRs fix server checkpoint restore for SWA models (#24411), BERT BOS/CLS token wrapping (#24428), and WPM accent normalization for case-sensitive models (#24371). All are correctness fixes for specific model families — no changes to run command flags, --ctx-size recommendations, --flash-attn, or --tensor-split values. |
| 2026-06-10 | Reviewed — no changes needed. Today's PRs are minor: speculative ngram-map-k4v logging name fix (#24253) and komac version bump in CI (#24396). Neither changes any run command flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other command-line flags. |
| 2026-06-09 | Reviewed — no changes needed. Today's PRs include: GGML_OP_COL2IM_1D CPU (#24206) for audio vocoder upsampling; idle slot RAM export fix (#24190) improving parallel slot KV caching; plamo2 attention_key/value_length regression fix (#24317); rms_norm_back aliasing correctness fix (#24305); ggml-webgpu clang-format CI (#24308); LFM2/LFM2.5 tool parser unification (#24178); SYCL multi-column MMVQ (#21845) delivering ~45% speculative decoding speedup on Intel Arc; Gemma 4 unified variant support (#24077); Step35 MTP KV cache allocation fix (#24125) reducing draft KV cache from 216 MiB to 18 MiB; CI ccache disable for MSVC (#23911); --no-mmproj download fix (#23425); OpenCL flat GEMV for large M (#24006). None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-08 | Reviewed — no changes needed. Today's PRs include Vulkan MoE optimizations (#23991), CUDA PDL MoE enrollment (#24087), Gemma4 MTP support (#23398), SYCL multi-column MMVQ (#21845), HIP RDNA3.5 GPU additions (#24129), Granite4 Vision (#23545), Metal im2col audio fix (#24220), n_layer hparams refactor (#24060), and various bug fixes (speculative vocab check #24256, off-by-one n_gpu_layers #24208, LFM2 reasoning #24234, Mistral-Medium converter #24268, Gemma4 no-audio converter #24242). None of these PRs change the -hf flags, --ctx-size recommendations, --flash-attn, --tensor-split values, or other run command flags used in this reference. |
| 2026-06-07 | Reviewed — no changes needed. PRs this period (LFM2 reasoning fix, n_gpu_layers off-by-one, Gemma4 no-audio converter fix, Docker CUDA 13.3.0 bump, PDL race condition fix, SVE FWHT fix, dynamic chunk scheduling for kleidiai) are backend optimizations or correctness fixes that don't change run command flags or recommendations. |
| 2026-06-06 | Reviewed — no changes needed. PRs this week (TP granularity 128, CUDA KV-cache reservation, Qwen3.6 MTP fix, Gemma 4 unified, EXAONE 4.5, Granite4 Vision, Granite Embeddings R2) are backend/model additions or correctness fixes that don't change run command flags or recommendations. Note: Qwen3