/* =============================================================================
 * NON WebAR — content model
 * -----------------------------------------------------------------------------
 * Single source of truth for every SKU. Copy and assets are edited HERE; logic
 * in app.js never needs to change to add or revise a SKU.
 *
 * story  / pairing  — PLACEHOLDER copy for the brand team. Do NOT invent tasting
 *                     notes. Replace the bracketed text in place.
 * artScene          — id of the registered art-layer builder (see /scenes).
 * target            — single-target .mind file for the fast NFC/QR param path.
 * targetIndex       — this SKU's index inside the combined targets/non-all.mind
 *                     used by the no-param image-detection fallback. Order here
 *                     MUST match the order the labels were fed to the compiler.
 * =============================================================================
 */

window.NON_CONFIG = {
  // Combined multi-target file used only when there is no ?sku= param and we
  // must work out which of the six labels is in frame.
  combinedTarget: "targets/non-all.mind",

  skus: {
    NON1: {
      id: "NON1",
      name: "Salted Raspberry and Chamomile",
      format: "Sparkling",
      story:
        "[BRAND COPY — NON1 story. Where the raspberry and chamomile come from, " +
        "why the pairing exists, how it tastes. 2–3 short sensory sentences.]",
      pairing:
        "[BRAND COPY — NON1 pairing. One or two specific dishes to drink this with.]",
      artScene: "non1",
      target: "targets/non1.mind",
      targetIndex: 0,
      accent: "#C0455E", // restrained raspberry — art layer only, not UI chrome
    },

    NON2: {
      id: "NON2",
      name: "Caramelised Pear and Kombu",
      format: "Sparkling",
      story: "[BRAND COPY — NON2 story. Do not invent tasting notes.]",
      pairing: "[BRAND COPY — NON2 pairing.]",
      artScene: "placeholder",
      target: "targets/non2.mind",
      targetIndex: 1,
      accent: "#B6883E",
    },

    NON3: {
      id: "NON3",
      name: "Toasted Cinnamon and Yuzu",
      format: "Still",
      story: "[BRAND COPY — NON3 story. Do not invent tasting notes.]",
      pairing: "[BRAND COPY — NON3 pairing.]",
      artScene: "placeholder",
      target: "targets/non3.mind",
      targetIndex: 2,
      accent: "#C98B3A",
    },

    NON5: {
      id: "NON5",
      name: "Lemon Marmalade and Hibiscus",
      format: "Sparkling",
      story: "[BRAND COPY — NON5 story. Do not invent tasting notes.]",
      pairing: "[BRAND COPY — NON5 pairing.]",
      artScene: "placeholder",
      target: "targets/non5.mind",
      targetIndex: 3,
      accent: "#C8543F",
    },

    NON7: {
      id: "NON7",
      name: "Stewed Cherry and Coffee",
      format: "Sparkling",
      story: "[BRAND COPY — NON7 story. Do not invent tasting notes.]",
      pairing: "[BRAND COPY — NON7 pairing.]",
      artScene: "placeholder",
      target: "targets/non7.mind",
      targetIndex: 4,
      accent: "#7A2E33",
    },

    NON9: {
      id: "NON9",
      name: "Oaked Blackberry and Plum",
      format: "Still",
      story: "[BRAND COPY — NON9 story. Do not invent tasting notes.]",
      pairing: "[BRAND COPY — NON9 pairing.]",
      artScene: "placeholder",
      target: "targets/non9.mind",
      targetIndex: 5,
      accent: "#4A3550",
    },
  },

  // Order of the labels inside combinedTarget. Drives the detection fallback's
  // targetIndex → SKU lookup. Keep in lock-step with the compiler input order.
  combinedOrder: ["NON1", "NON2", "NON3", "NON5", "NON7", "NON9"],
};

/* -----------------------------------------------------------------------------
 * FUTURE HOOKS (not built in v1 — noted so the slot is obvious):
 *  - Per-bottle serialised NFC: the NFC URL would carry e.g. ?sku=NON1&tag=AB12
 *    The `tag` param would slot in here as a lookup key for a per-bottle record
 *    (provenance, batch). v1 ignores everything except ?sku=.
 *  - "Join NON" / "Buy" CTA: add a `cta: { label, url }` field per SKU and
 *    render it as a fourth, optional control in app.js buildControls().
 * --------------------------------------------------------------------------- */
