# ARS Home Improvements: website

Vite + Vue 3 single-page site for ARS Home Improvements (Omaha, NE), deployed to GitHub Pages.

## Develop

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

## Adding before/after photos

Each folder inside `src/gallery/` becomes one gallery card:

```
src/gallery/
  01-kitchen-remodel/
    before.jpg
    after.jpg
    info.json      (optional)
  02-basement-finish/
    before.jpg
    after.png
```

- `before` and `after` can be `.jpg`, `.jpeg`, `.png`, `.webp`, or `.avif`.
- Full-size phone photos are fine. At build time they're resized (480–1600px) and converted to WebP.
- Cards are sorted by folder name, so use number prefixes to set the order.
- With no `info.json`, the title comes from the folder name (`01-kitchen-remodel` → "Kitchen Remodel").
- Folders starting with `_` are ignored (see `_sample-project` for an example).
- Photos display at a 4:3 crop, so shoot before and after from the same spot.

Optional `info.json`:

```json
{
  "title": "Kitchen Remodel",
  "location": "Dundee, Omaha",
  "description": "New cabinets, quartz counters and LVP flooring."
}
```

Commit and push. GitHub Actions rebuilds and redeploys the site automatically.

## Editing text

Services, "Why ARS" points, phone, and email are in `src/content.js`.
SEO meta tags and structured data are in `index.html`.

## GitHub Pages setup (one time)

1. Push this repo to GitHub on the `main` branch.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml` and publishes the site.

Asset paths are relative, so the site works at `https://<user>.github.io/<repo>/`
or on a custom domain (add a `public/CNAME` file containing the domain).
