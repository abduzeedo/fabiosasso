# CSS Visual Editor

A lightweight, Figma-ish visual canvas plus CodePen-style code panel for building HTML/CSS/JS with 3D transforms, transitions, and GSAP presets.

## Local run

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

Then open the local URL printed by Vite.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In the repo settings, go to **Pages** and set **Source = GitHub Actions**.
3. Push to the `main` branch. The workflow in `.github/workflows/deploy.yml` will build and deploy automatically.

### Build for GitHub Pages locally

The base path is set using env vars so it works for any repo name.

```bash
REPO_NAME="your-repo-name" npm run build:gh
```

This sets Vite base to `/<repo-name>/` so assets load correctly on Pages.

## Features checklist

- Visual create and manipulate rectangles and text
- 3D transforms (translate/rotate on X/Y/Z)
- Inspector panel with Figma-like fields
- Code panel with HTML/CSS/JS tabs (CodeMirror)
- GSAP animation presets
- CSS transitions toggle
- Events (click/hover) with class toggle, style apply, or JS
- LocalStorage persistence
- Undo/redo

## Notes

- The canvas is the visual source of truth. The Code panel is kept in sync, with a user-editable section preserved across regenerations.
- Manual HTML edits show a warning and are not re-parsed into the visual model.
