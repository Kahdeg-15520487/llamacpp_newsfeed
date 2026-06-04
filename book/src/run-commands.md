# Run Command Reference

> **Living document** — updated daily as new llama.cpp PRs bring new flags, backends, and optimizations.
> **Quantization data sourced from [Unsloth HuggingFace GGUF repos](https://huggingface.co/unsloth)**
> Last updated: 2026-06-04

---

## Model × GPU Matrix

Select quantization to see VRAM usage and recommended context sizes for each pairing.

| Model | Size | 1× RTX 3090 <br><small>22 GB usable</small> | 2× RTX 3090 <br><small>44 GB usable</small> | 2× RTX 5060 Ti <br><small>28 GB usable</small> |
|-------|------|-------------|-------------|---------------|
| Qwen 3.6 35B A3B MTP | <span id="size-qwen330b">17.3 GB</span> | <span id="cell-qwen330b-1x3090">✅ 4.7 GB free<br><small>5K ctx</small></span> | <span id="cell-qwen330b-2x3090">✅ 26.7 GB free<br><small>40K ctx</small></span> | <span id="cell-qwen330b-2x5060">✅ 10.7 GB free<br><small>16K ctx</small></span> |
| Qwen 3.6 27B MTP | <span id="size-qwen27b">15.9 GB</span> | <span id="cell-qwen27b-1x3090">✅ 6.1 GB free<br><small>9K ctx</small></span> | <span id="cell-qwen27b-2x3090">✅ 28.1 GB free<br><small>42K ctx</small></span> | <span id="cell-qwen27b-2x5060">✅ 12.1 GB free<br><small>18K ctx</small></span> |
| Gemma 3 12B | <span id="size-gemma12b">7.5 GB</span> | <span id="cell-gemma12b-1x3090">✅ 14.5 GB free<br><small>21K ctx</small></span> | <span id="cell-gemma12b-2x3090">✅ 36.5 GB free<br><small>131K ctx</small></span> | <span id="cell-gemma12b-2x5060">✅ 20.5 GB free<br><small>30K ctx</small></span> |
| Gemma 3 27B | <span id="size-gemma27b">16.0 GB</span> | <span id="cell-gemma27b-1x3090">✅ 6.0 GB free<br><small>9K ctx</small></span> | <span id="cell-gemma27b-2x3090">✅ 28.0 GB free<br><small>42K ctx</small></span> | <span id="cell-gemma27b-2x5060">✅ 12.0 GB free<br><small>18K ctx</small></span> |

<span id="pair-count">12</span> pairs · <span id="pass-count">0</span> meet 64K target · <span id="fail-count">12</span> below 64K or won't fit

> **Usable VRAM** = total VRAM − 2 GB per GPU (system overhead).<br>
> **Target:** ≥ 64K context. 🟢 = meets target, ⚠️ = below 64K, ❌ = < 8K or won't fit.<br>
> Data sourced from [Unsloth GGUF repos](https://huggingface.co/unsloth).

---

## Commands

### Qwen 3.6 35B A3B MTP <span id="qwen330b-1x3090"></span>

<div class="cmd-block" data-quant="Q4_K_M">

#### 1× RTX 3090 — Q4_K_M
```bash
# Download (or use -hf flag with llama-cli)
huggingface-cli download unsloth/Qwen3-30B-A3B-GGUF Qwen3-30B-A3B-Q4_K_M.gguf --local-dir ./models

./llama-cli \
  -hf unsloth/Qwen3-30B-A3B-GGUF:UD-Q4_K_XL \
  --n-gpu-layers 999 \
  --ctx-size 4096 \
  --flash-attn \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

</div>
<div class="cmd-block" data-quant="Q5_K_M">

#### 1× RTX 3090 — Q5_K_M
```bash
huggingface-cli download unsloth/Qwen3-30B-A3B-GGUF Qwen3-30B-A3B-Q5_K_M.gguf --local-dir ./models

./llama-cli \
  -hf unsloth/Qwen3-30B-A3B-GGUF:Q5_K_M \
  --n-gpu-layers 999 \
  --ctx-size 2048 \
  --flash-attn \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

</div>
<div class="cmd-block" data-quant="Q6_K">

#### 1× RTX 3090 — Q6_K (does not fit — model 23.4 GB > 22 GB usable)
```bash
# Q6_K does not fit on a single 3090. Use Q4_K_M or Q5_K_M instead.
# With 2×3090 or 2×5060Ti it fits.
```

</div>

---

#### 2× RTX 3090

<div class="cmd-block" data-quant="Q4_K_M">

```bash
huggingface-cli download unsloth/Qwen3-30B-A3B-GGUF Qwen3-30B-A3B-Q4_K_M.gguf --local-dir ./models

./llama-cli \
  -hf unsloth/Qwen3-30B-A3B-GGUF:UD-Q4_K_XL \
  --n-gpu-layers 999 \
  --ctx-size 40960 \
  --flash-attn \
  --split-mode layer --tensor-split 24,24 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

</div>
<div class="cmd-block" data-quant="Q5_K_M">

```bash
huggingface-cli download unsloth/Qwen3-30B-A3B-GGUF Qwen3-30B-A3B-Q5_K_M.gguf --local-dir ./models

./llama-cli \
  -hf unsloth/Qwen3-30B-A3B-GGUF:Q5_K_M \
  --n-gpu-layers 999 \
  --ctx-size 35840 \
  --flash-attn \
  --split-mode layer --tensor-split 24,24 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

</div>
<div class="cmd-block" data-quant="Q6_K">

```bash
huggingface-cli download unsloth/Qwen3-30B-A3B-GGUF Qwen3-30B-A3B-Q6_K.gguf --local-dir ./models

./llama-cli \
  -hf unsloth/Qwen3-30B-A3B-GGUF:Q6_K \
  --n-gpu-layers 999 \
  --ctx-size 30720 \
  --flash-attn \
  --split-mode layer --tensor-split 24,24 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

</div>

---

#### 2× RTX 5060 Ti

<div class="cmd-block" data-quant="Q4_K_M">

```bash
huggingface-cli download unsloth/Qwen3-30B-A3B-GGUF Qwen3-30B-A3B-Q4_K_M.gguf --local-dir ./models

./llama-cli \
  -hf unsloth/Qwen3-30B-A3B-GGUF:UD-Q4_K_XL \
  --n-gpu-layers 999 \
  --ctx-size 16384 \
  --flash-attn \
  --split-mode layer --tensor-split 16,16 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

</div>
<div class="cmd-block" data-quant="Q5_K_M">

```bash
huggingface-cli download unsloth/Qwen3-30B-A3B-GGUF Qwen3-30B-A3B-Q5_K_M.gguf --local-dir ./models

./llama-cli \
  -hf unsloth/Qwen3-30B-A3B-GGUF:Q5_K_M \
  --n-gpu-layers 999 \
  --ctx-size 11264 \
  --flash-attn \
  --split-mode layer --tensor-split 16,16 \
  --threads 8 \
  --temp 0.7 --repeat-penalty 1.1 --top-p 0.9 --top-k 40 \
  -p "Your prompt here"
```

</div>
<div class="cmd-block" data-quant="Q6_K">

```bash
huggingface-cli download unsloth/Qwen3-30B-A3B-GGUF Qwen3-30B-A3B-Q6_K.gguf --local-dir ./models

./llama-cli \
  -hf unsloth/Qwen3-30B-A3B-GGUF:Q6_K \
  --n-gpu-layers 999 \
  --ctx-size 6656 \
  --flash-attn \
  --split-mode layer --tensor-split 16,16 \
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
| 2026-06-04 | Initial commands based on current llama.cpp build. Sourced from Unsloth GGUF repos. Added interactive quant selector (Q4_K_M / Q5_K_M / Q6_K). |

---

*This page is updated daily by the pi-agent-core + DeepSeek pipeline based on recent llama.cpp merged PRs.*
