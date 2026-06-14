/* =============================================================================
 * NON WebAR — art-scene registry
 * -----------------------------------------------------------------------------
 * Each SKU's brand-world art layer is a builder function registered by id.
 * A builder receives the anchor's <a-entity> (the tracked target) and appends
 * its 3D / motion content as children, so the art holds position on the bottle.
 *
 * Plain scripts, no bundler — builders self-register on window.NONScenes.
 * To add a SKU's art: create scenes/<id>.js, call NONScenes.register("<id>", fn),
 * load it from index.html, and point the SKU's `artScene` at "<id>".
 * =============================================================================
 */

window.NONScenes = (function () {
  const builders = {};

  return {
    register(id, builder) {
      builders[id] = builder;
    },

    /** Build the art layer for `sku` into `layerEl`. Falls back to a quiet
     *  generic piece if the SKU has no dedicated scene yet. */
    build(sku, layerEl) {
      const builder = builders[sku.artScene] || builders.placeholder;
      builder(layerEl, sku);
    },
  };
})();
