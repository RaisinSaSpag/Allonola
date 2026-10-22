# Revision notes

## Layout / alignment fixes (HTML + CSS)
| Problem | Cause | Fix |
|---|---|---|
| Centered text sat off-center (footer lines, CTA, feature strip) | global `p { max-width: 70ch }` with no auto margins | `.text-center` / `.mx-auto` utilities; footer paragraphs use full width |
| Page headings squeezed into a narrow column; "Choosing a method" card narrower than the table above it | `.content-reading` capped the whole block at 70ch | block spans the container; only running text keeps the 70ch measure |
| Footer differed on 4 pages (blue underlined links, other layout) and listed only 4 of 6 algorithms | footer copied by hand and drifted | one canonical footer on all 11 pages, all 6 algorithms linked |
| No breadcrumbs on KNN / Linear Regression / Naive Bayes | missing markup | added, matching the other algorithm pages |
| Demo output column: stat box, text and chart touching each other | bare `<div>` with no spacing | `.demo-layout > *` stacks with an even gap |
| Large demo cards lifted/glowed on hover like small cards | `.card:hover` applied to containers | disabled for `.demo-container`, `.chart-card` |
| Pills in comparison table wrapped into odd ovals | pill allowed to wrap | `white-space: nowrap` in tables |
| Chart captions right-aligned italic, ragged next to left-aligned cards | style choice | left-aligned, muted |
| Dashboard table inside two scroll wrappers (double border) | `app.js` wrapped an already-wrapped table | skip tables already in a wrapper |
| Header nav floated mid-bar | `justify-content: space-between` with 3 groups | nav sits beside the action buttons |
| Undefined classes: `.filter-btn-group` (defined on one page only), `.action-row`, `.output-box` | missing CSS | defined once in `components.css` |
| Eyebrow pill touching H1; double gap between hero and demo | missing margins | spacing rules |
| Time-range selector wrapped awkwardly on phones | inline flex | `.time-range-bar` |

Verified by rendering all 11 pages at 1440, 820 and 390 px: no horizontal overflow, no console errors.

## New: `ml_pipeline/` (Python)
See `ml_pipeline/README.md`.
