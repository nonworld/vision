# NON WebAR — label experience

A browser-based AR experience for NON. Point a phone at a NON bottle label and
three layers unlock over the bottle: the **brand-world art piece** (default),
the **flavour & origin story**, and **food pairing** guidance. No app download —
it runs in the mobile browser.

Built with [MindAR](https://github.com/hiukim/mind-ar-js) (image-target tracking)
+ [A-Frame](https://aframe.io) (declarative 3D). Static site, deploys to
Cloudflare Pages. No backend in v1.

## The six SKUs

| SKU  | Flavour                          | Format    |
| ---- | -------------------------------- | --------- |
| NON1 | Salted Raspberry and Chamomile   | Sparkling |
| NON2 | Caramelised Pear and Kombu       | Sparkling |
| NON3 | Toasted Cinnamon and Yuzu        | Still     |
| NON5 | Lemon Marmalade and Hibiscus     | Sparkling |
| NON7 | Stewed Cherry and Coffee         | Sparkling |
| NON9 | Oaked Blackberry and Plum        | Still     |

**NON1 is the fully built reference SKU** (procedural art layer in
`scenes/non1.js`). The other five share the quiet placeholder art and are a
**content exercise, not a code exercise** — fill copy and drop a `.mind` file.

## How a shopper gets in

Two entry points, both opening this same site:

1. **NFC (primary)** — an inlay in the label opens the URL with a SKU param,
   e.g. `https://…/?sku=NON1`. The right experience loads immediately; we use a
   **single-target** `.mind` so there's no disambiguation and it's fast.
2. **QR (fallback)** — printed shelf collateral opens the identical URL with the
   same param. Rescues any phone where NFC is off or unsupported.

If someone opens the **bare URL** (no `?sku=`), the app loads the **combined**
six-label target file and lets MindAR work out which label is in frame.

> Both paths track the label so the art holds position on the bottle. See the
> "DESIGN NOTE" block at the top of `app.js` for why the `?sku=` path still
> tracks rather than blindly overlaying.

## Run locally

It's a static site, but the camera needs a secure context. `localhost` counts as
secure, so any static server works for desktop smoke-testing:

```bash
cd non-ar
npx serve .          # or: python3 -m http.server 8000
```

To test on a **phone** you need HTTPS (camera is blocked on plain-http LAN IPs).
Easiest is a tunnel:

```bash
npx serve . &
npx cloudflared tunnel --url http://localhost:3000
```

Open the generated `https://…trycloudflare.com/?sku=NON1` on the phone.

> All six `.mind` targets are compiled and committed (from the AUS label master
> print), so detection works as soon as you point a real camera at a printed
> label. To rebuild them, see "Compile targets" below.

## File structure

```
non-ar/
  index.html        entry, permission gate, script loading
  app.js            entry-path logic, MindAR init, layer switching, UI
  config.js         ← single source of truth: all per-SKU copy + asset paths
  styles.css        quiet UI chrome (Helvetica, white-on-dark)
  /scenes
    registry.js     art-scene registry
    placeholder.js  quiet default art for un-built SKUs
    non1.js         NON1 brand-world art (reference implementation)
  /targets          compiled .mind files + src/ label images (see its README)
  /tools            target compiler (Node primary + browser fallback)
  /assets/<sku>     per-SKU textures / models / audio
  _headers          Cloudflare Pages headers (camera permission, caching)
```

## Compile targets (`.mind`)

The six single-target files and the combined `non-all.mind` are already in
`/targets`. To rebuild them (e.g. after new label artwork):

**Primary — Node, ~25s for the whole set:**

```bash
cd tools
npm install        # uses @napi-rs/canvas (prebuilt, no system libs needed)
npm run compile    # reads targets/src/*.png → writes targets/*.mind
```

**Fallback — browser, no Node:** open `tools/compile.html` over the dev server
and click *Compile all + download*, then move the files into `/targets`.

To add a brand-new label: drop its artwork into `targets/src/<sku>.png`, add the
SKU to `ORDER` in `tools/compile-targets.mjs` (and to `combinedOrder` /
`targetIndex` in `config.js`), then recompile. The **required label order** and a
note on the duplicate NON9 artwork are in [`targets/README.md`](targets/README.md).

## Add / edit a SKU

Everything is config-driven — copy and assets change without touching logic.

1. **Copy & pairing** — edit the SKU's `story` and `pairing` in `config.js`.
   These are clearly-marked `[BRAND COPY …]` placeholders. **Do not invent
   tasting notes** — leave them bracketed until the brand team supplies real copy.
2. **Target file** — compile `non<N>.mind` (above), confirm `target` and
   `targetIndex` in `config.js` match.
3. **Bespoke art (optional)** — to give a SKU its own art layer instead of the
   placeholder:
   - create `scenes/non<N>.js`, call
     `NONScenes.register("non<N>", function (layerEl, sku) { … })`,
   - append your A-Frame entities to `layerEl` (they'll be anchored to the
     bottle — see `scenes/non1.js` for the pattern),
   - add `<script src="scenes/non<N>.js"></script>` to `index.html`,
   - set that SKU's `artScene: "non<N>"` in `config.js`.

That's it — no other code changes.

## Deploy to Cloudflare Pages

Consistent with the NON stack. The site is fully static — no build step.

**Via dashboard (Git):**

1. Push this repo to GitHub.
2. Cloudflare Pages → *Create project* → connect the repo.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `non-ar` (or the repo root if this is the repo root)
4. Deploy. `_headers` applies the camera `Permissions-Policy` automatically.

**Via Wrangler (direct upload):**

```bash
npx wrangler pages deploy non-ar --project-name non-ar
```

Pages serves over HTTPS, which the camera requires. Point the NFC inlays and QR
codes at `https://<your-pages-domain>/?sku=NON1` (one per SKU).

## v1 scope & where later hooks slot in

**In v1:** working site that detects ≥1 NON label and shows all three layers;
config-driven structure; NON1 reference; this README.

**Out of scope, with the slot noted in code:**

- **Per-bottle serialised NFC** (unique URL per tag) — v1 uses one URL per SKU.
  A `&tag=` param would slot into `config.js` (see the FUTURE HOOKS comment).
- **"Join NON" / "Buy" CTA** — add a `cta: { label, url }` field per SKU and
  render it as a fourth control in `app.js` (`buildControls`/`wireControls`).
- **Analytics** — fire events from `onTargetFound` / `showLayer` in `app.js`.

**Targeted browsers:** current Safari and Chrome on mobile.
