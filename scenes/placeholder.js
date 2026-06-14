/* =============================================================================
 * NON WebAR — placeholder art scene
 * -----------------------------------------------------------------------------
 * Quiet, brand-restrained default for SKUs whose bespoke art layer is not yet
 * built. A single slow-rotating ring in the SKU's accent, sitting above the
 * label. Gallery, not carnival. Replace per-SKU with a dedicated scene.
 * =============================================================================
 */

NONScenes.register("placeholder", function (layerEl, sku) {
  const accent = sku.accent || "#FFFFFF";

  // Slow halo ring, anchored just above the bottle label.
  const ring = document.createElement("a-entity");
  ring.setAttribute("position", "0 0.15 0");
  ring.setAttribute(
    "geometry",
    "primitive: torus; radius: 0.32; radiusTubular: 0.004; segmentsTubular: 64"
  );
  ring.setAttribute(
    "material",
    `color: ${accent}; opacity: 0.85; shader: flat; transparent: true`
  );
  ring.setAttribute(
    "animation",
    "property: rotation; to: 0 360 0; loop: true; dur: 14000; easing: linear"
  );
  layerEl.appendChild(ring);
});
