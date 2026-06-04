// Quant selector — interactive matrix for llama.cpp Run Command Reference
// Attaches to #quant-selector dropdown, updates matrix + command blocks

(function() {
  'use strict';

  // ── Model data (mirrors src/config.ts) ─────────────────
  const MODELS = [
    {
      id: "qwen330b",
      name: "Qwen3 30B A3B",
      hfRepo: "unsloth/Qwen3-30B-A3B-GGUF",
      ctx: 40960,
      arch: "qwen3moe",
      quants: {
        Q4_K_M: { size: 17.3, fn: "Qwen3-30B-A3B-Q4_K_M.gguf" },
        Q5_K_M: { size: 20.2, fn: "Qwen3-30B-A3B-Q5_K_M.gguf" },
        Q6_K:   { size: 23.4, fn: "Qwen3-30B-A3B-Q6_K.gguf" },
      }
    },
    {
      id: "qwen27b",
      name: "Qwen 3.6 27B MTP",
      hfRepo: "unsloth/Qwen3.6-27B-MTP-GGUF",
      ctx: 131072,
      arch: "qwen3",
      quants: {
        Q4_K_M: { size: 15.9, fn: "Qwen3.6-27B-Q4_K_M.gguf" },
        Q5_K_M: { size: 18.5, fn: "Qwen3.6-27B-Q5_K_M.gguf" },
        Q6_K:   { size: 23.1, fn: "Qwen3.6-27B-Q6_K.gguf" },
      }
    },
    {
      id: "gemma12b",
      name: "Gemma 3 12B",
      hfRepo: "unsloth/gemma-3-12b-it-GGUF",
      ctx: 131072,
      arch: "gemma3",
      quants: {
        Q4_K_M: { size: 7.5,  fn: "gemma-3-12b-it-Q4_K_M.gguf" },
        Q5_K_M: { size: 8.8,  fn: "gemma-3-12b-it-Q5_K_M.gguf" },
        Q6_K:   { size: 10.5, fn: "gemma-3-12b-it-Q6_K.gguf" },
      }
    },
    {
      id: "gemma27b",
      name: "Gemma 3 27B",
      hfRepo: "unsloth/gemma-3-27b-it-GGUF",
      ctx: 131072,
      arch: "gemma3",
      quants: {
        Q4_K_M: { size: 16.0, fn: "gemma-3-27b-it-Q4_K_M.gguf" },
        Q5_K_M: { size: 18.5, fn: "gemma-3-27b-it-Q5_K_M.gguf" },
        Q6_K:   { size: 22.0, fn: "gemma-3-27b-it-Q6_K.gguf" },
      }
    }
  ];

  const SETUPS = [
    { name: "1x3090", label: "1× RTX 3090", vram: 24, usable: 22, gpus: 1, split: "" },
    { name: "2x3090", label: "2× RTX 3090", vram: 48, usable: 44, gpus: 2, split: "24,24" },
    { name: "2x5060", label: "2× RTX 5060 Ti", vram: 32, usable: 28, gpus: 2, split: "16,16" },
  ];

  const QUANTS = ["Q4_K_M", "Q5_K_M", "Q6_K"];

  // ── Helpers ────────────────────────────────────────────
  function freeGB(model, quant, setup) {
    return Math.max(0, setup.usable - model.quants[quant].size);
  }

  function recCtx(model, quant, setup) {
    var free = freeGB(model, quant, setup);
    if (free <= 1) return { val: "—", cls: "red" };
    if (free <= 3) return { val: formatCtx(Math.floor(free * 400)), cls: "yellow" };
    if (free <= 8) return { val: formatCtx(Math.floor(free * 800)), cls: "green" };
    // Plenty of VRAM — use native context window
    return { val: formatCtx(model.ctx), cls: "green" };
  }

  function formatCtx(n) {
    if (n >= 1000) return Math.round(n / 1000) + "K";
    return n.toString();
  }

  function badge(free, rec) {
    if (rec.cls === "red") return '<span class="badge-red">❌ ' + free.toFixed(1) + ' GB free</span>';
    if (rec.cls === "yellow") return '<span class="badge-yellow">⚠️ ' + free.toFixed(1) + ' GB free</span>';
    return '<span class="badge-green">✅ ' + free.toFixed(1) + ' GB free</span>';
  }

  // ── Render ─────────────────────────────────────────────
  function render(quant) {
    // Update matrix cells
    MODELS.forEach(function(model) {
      SETUPS.forEach(function(setup) {
        var cell = document.getElementById("cell-" + model.id + "-" + setup.name);
        if (!cell) return;
        var free = freeGB(model, quant, setup);
        var rec = recCtx(model, quant, setup);
        cell.innerHTML = badge(free, rec) +
          '<br><small>' + rec.val + ' ctx → <a href="#' + model.id + '-' + setup.name + '">cmds</a></small>';
      });
    });

    // Update command link text and quant badges
    document.querySelectorAll('.cur-quant').forEach(function(el) {
      el.textContent = quant;
    });

    // Show/hide command blocks based on quant
    document.querySelectorAll('.cmd-block').forEach(function(el) {
      el.style.display = el.dataset.quant === quant ? '' : 'none';
    });

    // Update model sizes in overview table
    MODELS.forEach(function(model) {
      var el = document.getElementById("size-" + model.id);
      if (el) el.textContent = model.quants[quant].size.toFixed(1) + " GB";
    });

    // Update totals
    var vramCtx = 0;
    var totalPairs = 0;
    var fails = 0;
    MODELS.forEach(function(model) {
      SETUPS.forEach(function(setup) {
        if (model.quants[quant].size <= setup.usable) {
          totalPairs++;
          var free = freeGB(model, quant, setup);
          if (free < 1) fails++;
        }
      });
    });
    var pairCount = document.getElementById("pair-count");
    var failCount = document.getElementById("fail-count");
    if (pairCount) pairCount.textContent = totalPairs;
    if (failCount) failCount.textContent = fails;
  }

  // ── Init ───────────────────────────────────────────────
  function init() {
    // Insert dropdown before the first h1 if it doesn't exist
    if (document.getElementById("quant-selector")) return;
    var title = document.querySelector("h1") || document.querySelector("main h2") || document.body.firstElementChild;
    if (!title) return;

    var container = document.createElement("div");
    container.className = "quant-selector-container";
    container.innerHTML =
      '<label for="quant-selector"><strong>Quantization:</strong></label> ' +
      '<select id="quant-selector">' +
        '<option value="Q4_K_M">Q4_K_M (~4-bit)</option>' +
        '<option value="Q5_K_M">Q5_K_M (~5-bit)</option>' +
        '<option value="Q6_K">Q6_K (~6-bit)</option>' +
      '</select>' +
      ' <span style="font-size:0.85em;color:#888;">— Select to update matrix</span>';

    title.parentNode.insertBefore(container, title);

    document.getElementById("quant-selector").addEventListener("change", function() {
      render(this.value);
    });

    render("Q4_K_M");
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
