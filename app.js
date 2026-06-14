/* =============================================================================
 * NON WebAR — app
 * -----------------------------------------------------------------------------
 * Responsibilities:
 *   1. Read ?sku= (NFC / QR fast path) vs no param (image-detection fallback).
 *   2. Gate the camera behind one tap, then start MindAR.
 *   3. Build the tracked scene, layer-switching UI, and graceful tracking-loss.
 *
 * DESIGN NOTE on the two entry paths
 * ----------------------------------
 * The brief asks the ?sku= path to "use the camera for the art overlay rather
 * than for detection". MindAR is fundamentally a tracker — without a tracked
 * anchor the art layer cannot hold position on the bottle, which the brief also
 * requires. So we honour the INTENT rather than the literal wording:
 *   - ?sku= present  -> load that SKU's SINGLE-target .mind. No multi-target
 *                       disambiguation, the right assets are preloaded, and we
 *                       jump straight in. This is the fast path the brief wants.
 *   - no param       -> load the COMBINED .mind and let MindAR decide which of
 *                       the six labels is in frame.
 * Both paths still track, so the art holds to the bottle either way.
 * =============================================================================
 */

(function () {
  "use strict";

  const CFG = window.NON_CONFIG;
  const LAYERS = ["art", "story", "pairing"];

  const el = {
    gate: document.getElementById("gate"),
    gateButton: document.getElementById("gate-button"),
    gateInstruction: document.getElementById("gate-instruction"),
    gateError: document.getElementById("gate-error"),
    hintScanning: document.getElementById("hint-scanning"),
    hintLost: document.getElementById("hint-lost"),
    controls: document.getElementById("controls"),
    skuLabel: document.getElementById("sku-label"),
    arRoot: document.getElementById("ar-root"),
  };

  // Tracks which SKUs have had their (lazy) art layer built.
  const built = new Set();
  let activeLayer = "art";

  // ---------------------------------------------------------------------------
  // Entry path resolution
  // ---------------------------------------------------------------------------
  function resolveEntry() {
    const params = new URLSearchParams(window.location.search);
    const skuParam = (params.get("sku") || "").toUpperCase();
    const sku = CFG.skus[skuParam];

    if (sku) {
      return { mode: "single", skus: [sku], targetSrc: sku.target };
    }
    // Fallback: combined multi-target detection across all six labels.
    const ordered = CFG.combinedOrder.map((id) => CFG.skus[id]);
    return { mode: "combined", skus: ordered, targetSrc: CFG.combinedTarget };
  }

  // ---------------------------------------------------------------------------
  // Scene construction
  // ---------------------------------------------------------------------------
  function buildScene(entry) {
    const scene = document.createElement("a-scene");
    scene.setAttribute(
      "mindar-image",
      `imageTargetSrc: ${entry.targetSrc}; autoStart: false; ` +
        `uiScanning: no; uiLoading: no; uiError: no; ` +
        `maxTrack: 1; filterMinCF: 0.0001; filterBeta: 0.01`
    );
    scene.setAttribute("color-space", "sRGB");
    scene.setAttribute("renderer", "colorManagement: true, physicallyCorrectLights");
    scene.setAttribute("vr-mode-ui", "enabled: false");
    scene.setAttribute("device-orientation-permission-ui", "enabled: false");

    const camera = document.createElement("a-camera");
    camera.setAttribute("position", "0 0 0");
    camera.setAttribute("look-controls", "enabled: false");
    scene.appendChild(camera);

    // One tracked anchor per candidate SKU. In single mode there is exactly one
    // at targetIndex 0; in combined mode, one per label in compiler order.
    entry.skus.forEach((sku, i) => {
      const targetIndex = entry.mode === "single" ? 0 : sku.targetIndex;
      const anchor = document.createElement("a-entity");
      anchor.setAttribute("mindar-image-target", `targetIndex: ${targetIndex}`);
      anchor.dataset.sku = sku.id;

      // Three layer containers. Art is default-visible; text layers hidden.
      LAYERS.forEach((name) => {
        const layer = document.createElement("a-entity");
        layer.setAttribute("id", `layer-${sku.id}-${name}`);
        layer.dataset.layer = name;
        layer.setAttribute("visible", name === "art" ? "true" : "false");
        anchor.appendChild(layer);
      });

      anchor.addEventListener("targetFound", () => onTargetFound(sku, anchor));
      anchor.addEventListener("targetLost", () => onTargetLost());
      scene.appendChild(anchor);
    });

    scene.addEventListener("arError", () => {
      showGateError(
        "Camera couldn't start. Check camera permissions in your browser settings, then reload."
      );
    });

    el.arRoot.appendChild(scene);
    return scene;
  }

  // ---------------------------------------------------------------------------
  // Layers
  // ---------------------------------------------------------------------------
  function ensureBuilt(sku, anchor) {
    if (built.has(sku.id)) return;
    built.add(sku.id);

    // Art layer (lazy — per the load budget, only built once detected).
    const artLayer = anchor.querySelector(`#layer-${sku.id}-art`);
    window.NONScenes.build(sku, artLayer);

    // Text layers, generic from config, anchored beside the bottle so they
    // hold position as the phone moves.
    buildTextPanel(anchor.querySelector(`#layer-${sku.id}-story`), sku.story);
    buildTextPanel(anchor.querySelector(`#layer-${sku.id}-pairing`), sku.pairing);
  }

  function buildTextPanel(layerEl, copy) {
    const panel = document.createElement("a-entity");
    panel.setAttribute("position", "0 0.05 0.02");

    const bg = document.createElement("a-entity");
    bg.setAttribute(
      "geometry",
      "primitive: plane; width: 1.05; height: 0.62"
    );
    bg.setAttribute(
      "material",
      "color: #0B0B0B; opacity: 0.72; shader: flat; transparent: true"
    );
    panel.appendChild(bg);

    const text = document.createElement("a-entity");
    text.setAttribute("position", "0 0 0.001");
    text.setAttribute(
      "text",
      `value: ${sanitize(copy)}; color: #FFFFFF; align: center; ` +
        `width: 0.95; wrapCount: 34; baseline: center; font: mozillavr`
    );
    panel.appendChild(text);

    // Quiet entry: fade the panel in when shown.
    panel.setAttribute(
      "animation__in",
      "property: scale; from: 0.96 0.96 0.96; to: 1 1 1; dur: 280; easing: easeOutQuad"
    );
    layerEl.appendChild(panel);
  }

  // A-Frame text component splits on ';' and ':', so strip them from copy.
  function sanitize(s) {
    return String(s).replace(/[;:]/g, ",");
  }

  function showLayer(name) {
    activeLayer = name;
    document.querySelectorAll('[data-layer]').forEach((node) => {
      // A-Frame layer entities carry data-layer too; only toggle those that are
      // scene layers (have an id starting with "layer-").
      if (node.id && node.id.startsWith("layer-")) {
        node.setAttribute("visible", node.dataset.layer === name ? "true" : "false");
      }
    });
    el.controls.querySelectorAll(".layer-btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.layer === name));
    });
  }

  // ---------------------------------------------------------------------------
  // Tracking callbacks
  // ---------------------------------------------------------------------------
  function onTargetFound(sku, anchor) {
    hide(el.hintScanning);
    hide(el.hintLost);
    ensureBuilt(sku, anchor);

    el.skuLabel.innerHTML =
      `<span class="sku-id">${sku.id}</span>` +
      `<span class="sku-name">${sku.name} · ${sku.format}</span>`;
    show(el.skuLabel);
    show(el.controls);

    // Default to the brand-world art layer: first thing seen is beautiful.
    showLayer(activeLayer);
  }

  function onTargetLost() {
    // Graceful: pause, don't error. Keep controls so re-detect is seamless.
    show(el.hintLost);
  }

  // ---------------------------------------------------------------------------
  // Controls
  // ---------------------------------------------------------------------------
  function wireControls() {
    el.controls.querySelectorAll(".layer-btn").forEach((btn) => {
      btn.addEventListener("click", () => showLayer(btn.dataset.layer));
    });
  }

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------
  function start(entry, scene) {
    el.gate.classList.add("hide");
    show(el.hintScanning);

    const begin = () => {
      const system = scene.systems["mindar-image"];
      if (!system) {
        showGateError("AR engine failed to load. Reload and try again.");
        return;
      }
      system.start();
    };

    if (scene.hasLoaded) begin();
    else scene.addEventListener("loaded", begin, { once: true });
  }

  function onGateTap(entry) {
    el.gateButton.disabled = true;
    el.gateButton.textContent = "Starting…";
    const scene = buildScene(entry);
    start(entry, scene);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function show(node) {
    node.hidden = false;
  }
  function hide(node) {
    node.hidden = true;
  }
  function showGateError(msg) {
    el.gate.classList.remove("hide");
    el.gateError.textContent = msg;
    el.gateError.hidden = false;
    el.gateButton.disabled = false;
    el.gateButton.textContent = "Try again";
  }

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------
  function boot() {
    const entry = resolveEntry();

    // Tailor the instruction to the entry path.
    if (entry.mode === "single") {
      el.gateInstruction.textContent =
        `Point your camera at the ${entry.skus[0].id} label.`;
    }

    wireControls();
    el.gateButton.addEventListener("click", () => onGateTap(entry), { once: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
