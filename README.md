# wazoo-diagrams

An illustrated gallery of hand-inked, interactive diagrams explaining how Wazoo
works.

Each diagram draws one idea as an everyday machine you can press — a single,
self-contained isometric HTML page — and the whole set is built and published to
GitHub Pages: the gallery at the site root, each diagram at its own subpath.

**Site:** https://wazootech.github.io/wazoo-diagrams/

The sibling [wazoo-anatomy](https://github.com/wazootech/wazoo-anatomy) gallery
takes mechanisms apart in muted metal; this one draws them in flat colour with
the [Colorfigures](https://april-zhu.com/colorfigures) skill.

## Layout

```text
figures/<slug>/     figure.html + figure.json  (one diagram per directory)
engine/             vendored Colorfigures engine (see Licensing)
scripts/            build-site.mjs
gallery/template.html   the gallery page template (build-site fills in the cards)
.github/workflows/pages.yml   build + deploy to Pages on push to main
```

## Add a diagram

1. Create `figures/<slug>/figure.html` following the Colorfigures skill. Load
   the engine with `<script src="../../engine/core.js"></script>` so the page
   opens straight from disk while you work.
2. Add `figure.json`:

   ```json
   {
     "project": "Wazoo",
     "title": "World model",
     "blurb": "One sentence on what the diagram shows.",
     "prompt": "The prompt used to generate the diagram.",
     "order": 1
   }
   ```

Diagrams are grouped by `project` in the gallery and ordered by `order`. The
`prompt` is shown beside each diagram so the gallery doubles as a prompt catalog.

Every diagram reads URL parameters for screenshots, and `?press=Label@ms,...`
presses its buttons on a timer (see `mountFigure` in `engine/core.js`).

## Build locally

```sh
node scripts/build-site.mjs
```

This inlines the engine into each `figures/*/figure.html` and assembles the
gallery into `_site/`. Open `_site/index.html` to preview; it needs no server.

Deployment is automatic: push to `main` builds and publishes via GitHub Actions.
The repository's Pages source must be set to **GitHub Actions**.

## Licensing

Our content — the gallery, the build script, and each diagram — is MIT, see
[LICENSE](LICENSE).

`engine/` is a vendored copy of the Colorfigures engine by April Zhu, used under
the MIT License; its terms are preserved in [engine/LICENSE](engine/LICENSE) and
it is not original work of this repository.
