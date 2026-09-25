# Unda documentation site

The public documentation for Unda Media Server, built with
[VitePress](https://vitepress.dev). This folder works on its own: copy it
into its own repository, or deploy it straight from here.

```bash
npm install
npm run dev       # preview at http://localhost:5173, updates as you edit
npm run build     # the finished site in .vitepress/dist
```

- Pages are the `.md` files in `guide/` and `reference/`; the menu and sidebar
  are in `.vitepress/config.mts`.
- `shared/` holds copies of `deploy/INSTALL.md`, `unda.example.yaml` and
  `deploy/caddy/*` from the Unda repository. Inside that repository every
  `npm run dev` / `npm run build` refreshes them; commit `shared/` afterwards.
  On its own, the folder uses the copies it has.

## Vercel

- From Git: import the repository; if it is the Unda repository, set
  **Root Directory** to `docs-site`. Vercel detects VitePress.
- Without Git: `npx vercel` in this folder uploads just this folder.

Then add the domain (e.g. `docs.localstreamgh.com`) under **Settings → Domains**.
