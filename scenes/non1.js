/* =============================================================================
 * NON WebAR — NON1 brand-world art layer
 * Salted Raspberry and Chamomile (Sparkling)
 * -----------------------------------------------------------------------------
 * The reference implementation. A quiet field of rising "sparkling" motes with
 * two concentric haloes that hold over and around the bottle. Procedural — no
 * external model — so it costs almost nothing to load and respects the 3s/4G
 * first-paint budget. The aesthetic is the point; there is no text here.
 *
 * Anchoring: every entity is appended to `layerEl`, which is a child of the
 * tracked target, so the whole piece moves with the bottle.
 *
 * Coordinate note: MindAR's image-target space is normalised so the target's
 * width ≈ 1 unit. Positions below are in those units (0 = label centre).
 * =============================================================================
 */

NONScenes.register("non1", function (layerEl, sku) {
  const accent = sku.accent || "#C0455E"; // restrained raspberry
  const chamomile = "#E9DFA6"; // soft chamomile gold

  // ---- Two concentric haloes, counter-rotating, sitting above the label ----
  const haloOuter = document.createElement("a-entity");
  haloOuter.setAttribute("position", "0 0.18 0");
  haloOuter.setAttribute("rotation", "75 0 0");
  haloOuter.setAttribute(
    "geometry",
    "primitive: torus; radius: 0.40; radiusTubular: 0.0035; segmentsTubular: 80"
  );
  haloOuter.setAttribute(
    "material",
    `color: ${accent}; opacity: 0.8; shader: flat; transparent: true`
  );
  haloOuter.setAttribute(
    "animation",
    "property: rotation; to: 75 0 360; loop: true; dur: 18000; easing: linear"
  );
  layerEl.appendChild(haloOuter);

  const haloInner = document.createElement("a-entity");
  haloInner.setAttribute("position", "0 0.18 0");
  haloInner.setAttribute("rotation", "75 0 0");
  haloInner.setAttribute(
    "geometry",
    "primitive: torus; radius: 0.27; radiusTubular: 0.003; segmentsTubular: 64"
  );
  haloInner.setAttribute(
    "material",
    `color: ${chamomile}; opacity: 0.7; shader: flat; transparent: true`
  );
  haloInner.setAttribute(
    "animation",
    "property: rotation; to: 75 0 -360; loop: true; dur: 12000; easing: linear"
  );
  layerEl.appendChild(haloInner);

  // ---- Rising sparkle motes -------------------------------------------------
  // A modest count keeps it gallery-quiet and cheap on mobile GPUs.
  const MOTES = 22;
  for (let i = 0; i < MOTES; i++) {
    const mote = document.createElement("a-entity");

    // Deterministic spread (no Math.random so the field reads as composed,
    // not noisy) across a ring around the bottle.
    const angle = (i / MOTES) * Math.PI * 2;
    const r = 0.12 + (i % 4) * 0.07;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r * 0.4;
    const startY = -0.05 + (i % 5) * 0.02;

    mote.setAttribute("position", `${x.toFixed(3)} ${startY.toFixed(3)} ${z.toFixed(3)}`);
    mote.setAttribute("geometry", "primitive: sphere; radius: 0.007");
    mote.setAttribute(
      "material",
      `color: ${i % 3 === 0 ? chamomile : accent}; opacity: 0.9; shader: flat; transparent: true`
    );

    // Slow rise + fade, staggered so they don't pulse in unison.
    const dur = 4200 + (i % 6) * 600;
    const delay = (i * 180) % 3600;
    mote.setAttribute(
      "animation__rise",
      `property: position; to: ${x.toFixed(3)} 0.5 ${z.toFixed(3)}; loop: true; dur: ${dur}; delay: ${delay}; easing: easeInOutSine`
    );
    mote.setAttribute(
      "animation__fade",
      `property: material.opacity; from: 0; to: 0.9; loop: true; dir: alternate; dur: ${Math.round(
        dur / 2
      )}; delay: ${delay}; easing: easeInOutSine`
    );
    layerEl.appendChild(mote);
  }

  // ---- A soft floor glow so the piece feels grounded on the label ----------
  const glow = document.createElement("a-entity");
  glow.setAttribute("position", "0 0 0.001");
  glow.setAttribute("rotation", "-90 0 0");
  glow.setAttribute("geometry", "primitive: circle; radius: 0.22");
  glow.setAttribute(
    "material",
    `color: ${accent}; opacity: 0.12; shader: flat; transparent: true; side: double`
  );
  glow.setAttribute(
    "animation",
    "property: material.opacity; from: 0.06; to: 0.18; loop: true; dir: alternate; dur: 3000; easing: easeInOutSine"
  );
  layerEl.appendChild(glow);
});
