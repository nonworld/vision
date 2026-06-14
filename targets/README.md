# Image targets (`.mind`)

Compiled MindAR image-target files **and their source images** live here.

| File             | Contents                                                    |
| ---------------- | ----------------------------------------------------------- |
| `non1.mind` …    | Single target per SKU. Fast `?sku=NON1` path.               |
| `non-all.mind`   | Combined file, all six labels, for the no-param detection fallback. |
| `src/<sku>.png`  | The label artwork each target was compiled from.            |

These were generated from `NON-AUS-LABEL-MASTER-PRINT.pdf` and are committed and
working. Regenerate any time with the compiler in [`../tools`](../tools).

## Compiler input order matters

`non-all.mind` is compiled with the labels in **exactly** this order, because
`config.js` maps each label to a `targetIndex`:

```
0: NON1   1: NON2   2: NON3   3: NON5   4: NON7   5: NON9
```

Change the order → update `combinedOrder` and every `targetIndex` in `config.js`,
and `ORDER` in `tools/compile-targets.mjs`, to match.

## Source-image mapping (from the master print)

`src/<sku>.png` are renders of these front-label pages in the master PDF:

| SKU  | Flavour                        | PDF page | Format    |
| ---- | ------------------------------ | -------- | --------- |
| NON1 | Salted Raspberry & Chamomile   | 1        | Sparkling |
| NON2 | Caramelised Pear & Kombu       | 3        | Sparkling |
| NON3 | Toasted Cinnamon & Yuzu        | 5        | Still     |
| NON5 | Lemon Marmalade & Hibiscus     | 9        | Sparkling |
| NON7 | Stewed Cherry & Coffee         | 13       | Sparkling |
| NON9 | Oaked Blackberry & Plum        | 17       | Still     |

> ⚠️ **NON9 caveat.** The master print contains **two** "Oaked Blackberry & Plum"
> artworks: an older one numbered **4** ("BLACKBERRIES, PINE NEEDLES…") and the
> current one numbered **9** ("BLACKBERRIES, **FIR** PINE NEEDLES…"). We used the
> **9 / FIR** version. If the artwork is revised, recompile from the correct page.
>
> The master also includes SKUs outside this build's six (Tomato Water & Basil,
> and an apple SKU). They're ignored here.

The `src/*.png` are 480px renders — fine for MindAR tracking of these bold,
high-contrast labels. Re-render larger from the PDF if you ever want denser
feature points (the compiler handles bigger images, just slower).

## Recompile

**Primary (Node, ~25s for the whole set):**

```bash
cd ../tools
npm install
npm run compile
```

**Fallback (browser, no Node):** open `../tools/compile.html` over the dev
server and click *Compile all + download*, then drop the files here.

See [`../tools`](../tools) and the project README for details, and the MindAR
browser compiler at https://hiukim.github.io/mind-ar-js-doc/tools/compile.
