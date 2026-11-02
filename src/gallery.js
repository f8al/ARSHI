// ─────────────────────────────────────────────────────────────
// Dynamic before/after gallery.
//
// Every folder inside src/gallery/ becomes one gallery card.
//
// Single-room project:
//
//   src/gallery/01-kitchen-remodel/
//     before.jpg      (required: .jpg .jpeg .png .webp .avif)
//     after.jpg       (required)
//     info.json       (optional) { "title": "...", "location": "...", "description": "..." }
//
// Multi-room project: one subfolder per room. The card gets a room switcher.
//
//   src/gallery/02-main-floor-remodel/
//     info.json       (optional, same as above)
//     01-kitchen/
//       before.jpg
//       after.jpg
//       info.json     (optional) { "title": "Kitchen", "note": "Quartz counters, new cabinets" }
//     02-half-bath/
//       before.jpg
//       after.jpg
//
// Extra photos (finished shots, details, progress pics with no matching
// before/after) go in an "extra" folder. They show as a thumbnail strip under
// the card and open in a full-screen viewer. A project can be extra photos only.
//
//   src/gallery/03-deck-build/
//     info.json       (optional) add "captions": { "01-stairs.jpg": "New stairs" }
//     extra/
//       01-stairs.jpg
//       02-railing.jpg
//
// Projects, rooms and extra photos are sorted by name, so prefix with numbers to set
// the order. Names come from the folder name ("02-half-bath" → "Half Bath")
// unless info.json gives a title. Anything starting with "_" is ignored
// (handy for hiding a project, room or photo without deleting it).
//
// Images are resized and converted to WebP at build time (vite-imagetools),
// so you can drop in full-size phone photos. Each photo pair keeps its own
// shape (portrait or landscape) instead of being cropped. Shoot before and
// after from the same spot and orientation for the best wipe.
// ─────────────────────────────────────────────────────────────

// Note: Vite needs these patterns written out literally (no variables).
const srcsets = import.meta.glob(
  ['./gallery/*/{before,after}.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}', './gallery/*/*/{before,after}.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}', '!./gallery/_*/**', '!./gallery/*/_*/**'],
  { eager: true, import: 'default', query: { w: '480;800;1200;1600', format: 'webp', as: 'srcset' } },
)

// 1200px fallback image plus its width/height (used to size the card).
const fallbacks = import.meta.glob(
  ['./gallery/*/{before,after}.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}', './gallery/*/*/{before,after}.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}', '!./gallery/_*/**', '!./gallery/*/_*/**'],
  { eager: true, import: 'default', query: { w: '1200', format: 'webp', as: 'metadata' } },
)

const infos = import.meta.glob(['./gallery/*/info.json', './gallery/*/*/info.json', '!./gallery/_*/**', '!./gallery/*/_*/**'], { eager: true, import: 'default' })

// Extra photos: small thumbnail, full-size srcset, and 1600px fallback + size.
const extraThumbs = import.meta.glob(
  ['./gallery/*/extra/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}', '!./gallery/_*/**', '!./gallery/*/extra/_*'],
  { eager: true, import: 'default', query: { w: '320', h: '320', fit: 'cover', format: 'webp' } },
)
const extraSrcsets = import.meta.glob(
  ['./gallery/*/extra/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}', '!./gallery/_*/**', '!./gallery/*/extra/_*'],
  { eager: true, import: 'default', query: { w: '800;1200;1600;2048', format: 'webp', as: 'srcset' } },
)
const extraFallbacks = import.meta.glob(
  ['./gallery/*/extra/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}', '!./gallery/_*/**', '!./gallery/*/extra/_*'],
  { eager: true, import: 'default', query: { w: '1600', format: 'webp', as: 'metadata' } },
)

function collectExtras() {
  const byProject = new Map()
  for (const [path, thumb] of Object.entries(extraThumbs)) {
    const [projectId, , file] = path.replace('./gallery/', '').split('/')
    const { src, width, height } = extraFallbacks[path]
    if (!byProject.has(projectId)) byProject.set(projectId, [])
    byProject.get(projectId).push({ id: file, thumb, src, srcset: extraSrcsets[path], width, height })
  }
  return byProject
}

const byName = (a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })

function titleFromFolder(folder) {
  return folder
    .replace(/^\d+[-_ ]*/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function build() {
  // projectId → Map(roomId → { before, after })
  // A project's top-level before/after pair uses roomId "".
  const projects = new Map()

  for (const [path, srcset] of Object.entries(srcsets)) {
    const parts = path.replace('./gallery/', '').split('/')
    if (parts.length > 3) continue // too deep, ignore
    const projectId = parts[0]
    const roomId = parts.length === 3 ? parts[1] : ''
    const kind = parts.at(-1).split('.')[0].toLowerCase()

    if (!projects.has(projectId)) projects.set(projectId, new Map())
    const rooms = projects.get(projectId)
    if (!rooms.has(roomId)) rooms.set(roomId, { id: roomId })

    const { src, width, height } = fallbacks[path]
    rooms.get(roomId)[kind] = { srcset, src, width, height }
  }

  const extras = collectExtras()
  for (const id of extras.keys()) if (!projects.has(id)) projects.set(id, new Map())

  return [...projects.entries()]
    .map(([id, roomMap]) => {
      const info = infos[`./gallery/${id}/info.json`] || {}
      const rooms = [...roomMap.values()]
        .filter((r) => r.before && r.after)
        .sort(byName)
        .map((r) => {
          const rInfo = (r.id && infos[`./gallery/${id}/${r.id}/info.json`]) || {}
          return {
            ...r,
            key: `${id}/${r.id}`,
            name: rInfo.title || rInfo.name || (r.id ? titleFromFolder(r.id) : 'Overview'),
            note: rInfo.note || rInfo.description || '',
            aspect: r.before.width / r.before.height,
          }
        })
      const captions = info.captions || {}
      const extra = (extras.get(id) || []).sort(byName).map((x, i) => ({
        ...x,
        caption: captions[x.id] || '',
        alt: captions[x.id] || `${info.title || titleFromFolder(id)}, photo ${i + 1}`,
      }))
      return {
        id,
        rooms,
        extra,
        title: info.title || titleFromFolder(id),
        location: info.location || '',
        description: info.description || '',
      }
    })
    .filter((p) => p.rooms.length || p.extra.length)
    .sort(byName)
}

export const projects = build()
