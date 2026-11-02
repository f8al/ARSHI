// ─────────────────────────────────────────────────────────────
// Dynamic before/after gallery.
//
// Every folder inside src/gallery/ becomes one gallery card:
//
//   src/gallery/
//     01-kitchen-remodel/
//       before.jpg        (required — .jpg .jpeg .png .webp .avif)
//       after.jpg         (required)
//       info.json         (optional) { "title": "...", "location": "...", "description": "..." }
//
// Cards are sorted by folder name, so prefix with numbers to control order.
// Folders starting with "_" are ignored completely (handy for hiding a project
// without deleting it).
//
// Images are resized and converted to WebP at build time (vite-imagetools),
// so you can drop in full-size phone photos.
// ─────────────────────────────────────────────────────────────

const srcsets = import.meta.glob(['./gallery/*/{before,after}.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}', '!./gallery/_*/**'], {
  eager: true,
  import: 'default',
  query: { w: '480;800;1200;1600', format: 'webp', as: 'srcset' },
})

const fallbacks = import.meta.glob(['./gallery/*/{before,after}.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}', '!./gallery/_*/**'], {
  eager: true,
  import: 'default',
  query: { w: '1200', format: 'webp' },
})

const infos = import.meta.glob(['./gallery/*/info.json', '!./gallery/_*/**'], { eager: true, import: 'default' })

function titleFromFolder(folder) {
  return folder
    .replace(/^_/, '')
    .replace(/^\d+[-_ ]*/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function build() {
  const projects = new Map()

  for (const [path, srcset] of Object.entries(srcsets)) {
    const [, folder, file] = path.match(/^\.\/gallery\/([^/]+)\/([^/.]+)\./)
    const kind = file.toLowerCase()
    if (!projects.has(folder)) projects.set(folder, { id: folder })
    projects.get(folder)[kind] = { srcset, src: fallbacks[path] }
  }

  return [...projects.values()]
    .filter((p) => p.before && p.after)
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
    .map((p) => {
      const info = infos[`./gallery/${p.id}/info.json`] || {}
      return {
        ...p,
        title: info.title || titleFromFolder(p.id),
        location: info.location || '',
        description: info.description || '',
      }
    })
}

export const projects = build()
