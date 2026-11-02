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

Each folder inside `src/gallery/` becomes one gallery card.

### Single-room project

```
src/gallery/
  01-kitchen-remodel/
    before.jpg
    after.jpg
    info.json      (optional)
```

### Multi-room project

Give each room its own subfolder. The card gets room chips ("Kitchen · Dining Room · Half Bath"),
a "1 / 3" counter, and swipe left/right on phones. Each room still uses the before/after wipe.

```
src/gallery/
  02-main-floor-remodel/
    info.json            (optional, project title/location/description)
    01-kitchen/
      before.jpg
      after.jpg
      info.json          (optional) { "title": "Kitchen", "note": "Quartz counters, new cabinets" }
    02-dining-room/
      before.jpg
      after.jpg
    03-half-bath/
      before.jpg
      after.jpg
```

Only the first room's photos load with the page. Each other room loads when someone opens it.

### Extra photos

For photos that don't have a matching before/after shot (finished details, progress shots, other angles),
put them in an `extra` folder inside the project. They show as a "More photos" thumbnail strip under the card.
Tapping one opens a full-screen viewer with swipe/arrow navigation.

```
src/gallery/
  whole-home-reno/
    Bedroom/ ...
    Living-Room/ ...
    extra/
      01-stairs.jpg
      02-hallway.jpg
```

- A project can have **only** an `extra` folder (no before/after). Its first photo becomes the card cover.
- Photos are ordered by file name. Rename to `01-…`, `02-…` to control the order.
- Optional captions go in the project's `info.json`, keyed by file name:

```json
{
  "title": "Whole Home Renovation",
  "captions": {
    "01-stairs.jpg": "New stair carpet and LVP landing"
  }
}
```

### Rules

- `before` and `after` can be `.jpg`, `.jpeg`, `.png`, `.webp`, or `.avif`.
- Full-size phone photos are fine. At build time they're resized (480–1600px) and converted to WebP.
- Projects and rooms are sorted by folder name, so use number prefixes to set the order.
- Names come from folder names (`03-half-bath` → "Half Bath") unless `info.json` sets a `title`.
- Anything starting with `_` is never published, whether it's a project, a single room, or a single extra photo. See `_sample-project` and `_sample-multi-room` for examples.
- Each card takes the shape of its before photo (portrait or landscape). Shoot before and after from the same spot and orientation.

Project `info.json`:

```json
{
  "title": "Kitchen Remodel",
  "location": "Dundee, Omaha",
  "description": "New cabinets, quartz counters and LVP flooring."
}
```

Commit and push. GitHub Actions rebuilds and redeploys the site automatically.
You can also upload photos from GitHub's website. Open `src/gallery/`, choose **Add file → Upload files**,
and drag in a whole project folder from your computer. Its subfolders come along too.

## Editing text

Services, "Why ARS" points, the owner bio, phone, and email are in `src/content.js`.

**Owner photo:** add `src/assets/owner.jpg` (or `.png` / `.webp`) and it replaces the "AS" monogram
automatically. A square-ish head-and-shoulders shot works best. It's shown in a circle.
SEO meta tags and structured data are in `index.html`.

## GitHub Pages setup (one time)

1. Push this repo to GitHub on the `main` branch.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml` and publishes the site.

Asset paths are relative, so the site works at `https://<user>.github.io/<repo>/`
or on a custom domain (add a `public/CNAME` file containing the domain).
