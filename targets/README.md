# Image targets (`.mind`)

This folder holds the compiled MindAR image-target files. They are **not** in the
repo as binaries you can edit — you compile them from the label artwork.

Expected files:

| File              | Contents                                              |
| ----------------- | ----------------------------------------------------- |
| `non1.mind`       | Single target — NON1 label. Fast `?sku=NON1` path.    |
| `non2.mind` …     | One single-target file per SKU.                       |
| `non-all.mind`    | Combined file, all six labels, used by the no-param detection fallback. |

## Compiler input order matters

`non-all.mind` must be compiled with the labels in **exactly** this order, because
`config.js` maps each label to a `targetIndex`:

```
0: NON1   1: NON2   2: NON3   3: NON5   4: NON7   5: NON9
```

If you change the order, update `combinedOrder` and every `targetIndex` in
`config.js` to match.

## How to compile

Use MindAR's browser-based image compiler (no install):

1. Open https://hiukim.github.io/mind-ar-js-doc/tools/compile
2. Drag in the label image(s). Use a high-contrast, feature-rich, flat crop of
   the label artwork at print resolution — the more distinct detail, the better
   the tracking.
3. For a **single-SKU** file, drop one image and export as `non1.mind`.
4. For the **combined** file, drop all six in the order above and export as
   `non-all.mind`.
5. Drop the exported file into this folder and redeploy.

Tip: aim for label crops ≥ 512px on the short edge, even lighting, no glare.
