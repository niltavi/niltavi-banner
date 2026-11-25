---
name: niltavi-banner-code
description: Design and implement code-generated icons, motif catalog additions, and reproducible Canvas artwork in Niltavi Banner. Covers geometric screenprint (几何丝印), folk rubber stamps (民艺橡皮章), and modernist woodcuts (现代主义木刻). For direct image-model prompts or standalone image studies, use niltavi-banner-image.
---

# Niltavi Banner code icons

Read the reference for the requested style before drawing. Compare against at least one rendered repository example at the size where the artwork will be used.

| Style | Read | Preview |
| --- | --- | --- |
| Geometric screenprint / 几何丝印 | [geometric-screenprint.md](references/geometric-screenprint.md) | [index.html](../../../index.html) |
| Folk rubber stamp / 民艺橡皮章 | [folk-rubber-stamp.md](references/folk-rubber-stamp.md) | [stamps.html](../../../stamps.html) |
| Modernist woodcut / 现代主义木刻 | [modernist-woodcut.md](references/modernist-woodcut.md) | [woodcut.html](../../../woodcut.html) |

## Add a motif

Author editable geometry or a procedural motif in the selected renderer. Match the style's silhouette, ink, paper, and cut or pattern density. Give catalog additions stable, unique IDs. Keep preset slots, older IDs, and existing browser entry points compatible unless the task changes them.

Keep the 1024 × 1536 default proof at four columns and six rows. Use the renderer's existing cell centers and spacing. Folk stamps and woodcuts share the staggered grid in `NiltaviStamp.printLayout`. Inspect the finished proof for optical balance and clear gutters, including any overhangs. Keep the seed and navigation outside the artwork. Shared integration details live in the [agent guide](../../../docs/en/for-agents.md).

Use the renderer's seeded random streams and compare existing seeds before and after the change. Appending a stamp or woodcut changes the sampling pool length. This can change the selection for older free-form seeds and the companion motifs for ID-pinned seeds. If existing output is required, preserve the old selection cohort or use an explicitly selected catalog revision. Make the new IDs reachable through the supported selection flow. The default proof's order, orientation, and pixels are useful regression fixtures. Check a representative free-form seed and at least one existing motif-ID seed too.

The repository's [second series](../../../docs/series-2.md) is one example of explicit revision selection. A URL option chooses its catalog separately from the seed string. The original seed field still accepts arbitrary text with the original meaning.

Update the affected catalog index and tests with the new entries. Regenerate committed individual assets where the style already ships them or where the task calls for them. When updating a README image, export the artwork canvas and preserve the surrounding README text.

## Verify

Run `node --test` and use the offline browser preview. Render the new motif on its own where supported and on the sheet at desktop and phone widths. Check legibility at the intended icon size, repeat the seed, and verify the catalog entry opens the right image. A successful layout test covers placement and selection. Check a rendered result to verify masks, ink, and actual cut visibility.
