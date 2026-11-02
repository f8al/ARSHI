<script setup>
import { ref, computed } from 'vue'
import BeforeAfter from './BeforeAfter.vue'
import Lightbox from './Lightbox.vue'

const props = defineProps({
  project: { type: Object, required: true },
  eager: { type: Boolean, default: false },
})

const index = ref(0)
const room = computed(() => props.project.rooms[index.value])
const multi = computed(() => props.project.rooms.length > 1)
const chips = ref(null)

// Extra photos: thumbnail strip + full-screen viewer.
const MAX_THUMBS = 4
const extra = computed(() => props.project.extra)
const lightbox = ref(null)
const openPhoto = (i) => lightbox.value.open(i)

// Photos-only project (no before/after pair): first photo is the cover, and
// the thumbnail strip starts at the second photo.
const cover = computed(() => (room.value ? null : extra.value[0]))
const offset = computed(() => (cover.value ? 1 : 0))
const thumbs = computed(() => extra.value.slice(offset.value, offset.value + MAX_THUMBS))
const hiddenCount = computed(() => extra.value.length - offset.value - thumbs.value.length)
const coverRatio = computed(() =>
  cover.value ? Math.min(Math.max(cover.value.width / cover.value.height, 3 / 4), 16 / 9) : 1,
)
const SIZES = '(min-width: 1100px) 520px, (min-width: 700px) 46vw, 94vw'

function go(i) {
  const n = props.project.rooms.length
  index.value = (i + n) % n
  // Keep the active chip visible when the chip row scrolls sideways.
  chips.value?.children[index.value]?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

function onChipKey(e) {
  if (e.key === 'ArrowRight') go(index.value + 1)
  else if (e.key === 'ArrowLeft') go(index.value - 1)
  else return
  e.preventDefault()
  chips.value?.children[index.value]?.focus()
}

// Swipe left/right on the photo to change rooms (touch & pen only).
let start = null
let swiped = false
function onPointerDown(e) {
  start = multi.value && e.pointerType !== 'mouse' ? { x: e.clientX, y: e.clientY } : null
}
function onPointerUp(e) {
  if (!start) return
  const dx = e.clientX - start.x
  const dy = e.clientY - start.y
  start = null
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    swiped = true
    go(index.value + (dx < 0 ? 1 : -1))
  }
}
// A swipe must not also count as a tap that toggles before/after.
function onClickCapture(e) {
  if (swiped) {
    swiped = false
    e.stopPropagation()
  }
}
</script>

<template>
  <figure class="project">
    <div
      class="project__media"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointercancel="start = null"
      @click.capture="onClickCapture"
    >
      <button
        v-if="cover"
        type="button"
        class="cover"
        :style="{ aspectRatio: coverRatio }"
        :aria-label="`${project.title}: view ${extra.length} photo${extra.length > 1 ? 's' : ''}`"
        @click="openPhoto(0)"
      >
        <img
          :src="cover.src"
          :srcset="cover.srcset"
          :sizes="SIZES"
          :alt="cover.alt"
          :loading="eager ? 'eager' : 'lazy'"
          decoding="async"
        />
        <span class="cover__tag">{{ extra.length }} photo{{ extra.length > 1 ? 's' : '' }}</span>
      </button>
      <Transition v-else name="room" mode="out-in">
        <BeforeAfter
          :key="room.key"
          :before="room.before"
          :after="room.after"
          :aspect="room.aspect"
          :title="multi ? `${project.title}, ${room.name}` : project.title"
          :eager="eager && index === 0"
        />
      </Transition>
      <span v-if="multi" class="project__count" aria-hidden="true">{{ index + 1 }} / {{ project.rooms.length }}</span>
    </div>

    <div v-if="multi" ref="chips" class="rooms" role="group" :aria-label="`${project.title} rooms`">
      <button
        v-for="(r, i) in project.rooms"
        :key="r.key"
        type="button"
        class="rooms__chip"
        :aria-pressed="i === index"
        :tabindex="i === index ? 0 : -1"
        @click="go(i)"
        @keydown="onChipKey"
      >
        {{ r.name }}
      </button>
    </div>

    <div v-if="extra.length > (cover ? 1 : 0)" class="extras">
      <p v-if="!cover" class="extras__label">More photos</p>
      <ul class="extras__list">
        <li v-for="(x, i) in thumbs" :key="x.id">
          <button
            type="button"
            class="extras__thumb"
            :aria-label="hiddenCount && i === thumbs.length - 1 ? `View all ${extra.length} photos` : `View ${x.alt}`"
            @click="openPhoto(i + offset)"
          >
            <img :src="x.thumb" alt="" width="160" height="160" loading="lazy" decoding="async" />
            <span v-if="hiddenCount && i === thumbs.length - 1" class="extras__more">+{{ hiddenCount }}</span>
          </button>
        </li>
      </ul>
    </div>

    <Lightbox v-if="extra.length" ref="lightbox" :images="extra" :title="project.title" />

    <figcaption>
      <h3>{{ project.title }}</h3>
      <p v-if="project.location" class="project__loc">{{ project.location }}</p>
      <p v-if="multi && room.note" class="project__note"><b>{{ room.name }}:</b> {{ room.note }}</p>
      <p v-if="project.description">{{ project.description }}</p>
    </figcaption>
  </figure>
</template>

<style scoped>
.project__media {
  position: relative;
}
.project__count {
  position: absolute;
  top: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: rgb(0 0 0 / 0.55);
  backdrop-filter: blur(6px);
  font-size: 0.72rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #fff;
  pointer-events: none;
}

.rooms {
  display: flex;
  gap: 0.5rem;
  /* padding leaves room for the focus ring, which overflow would clip */
  margin: 0.5rem -6px 0;
  padding: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  scroll-snap-type: x proximity;
}
.rooms::-webkit-scrollbar {
  display: none;
}
.rooms__chip {
  flex: none;
  min-height: 36px;
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--panel);
  color: var(--muted);
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  scroll-snap-align: start;
  transition: color 150ms, border-color 150ms, background 150ms;
}
@media (hover: hover) {
  .rooms__chip:hover {
    color: var(--text);
    border-color: rgb(230 166 74 / 0.5);
  }
}
.rooms__chip[aria-pressed='true'] {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(135deg, var(--coral), var(--rust));
}

.project__note {
  color: var(--text) !important;
}
.project__note b {
  color: var(--amber);
}

.cover {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  overflow: hidden;
  border-radius: var(--radius);
  background: #1a1513;
  cursor: zoom-in;
}
.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 400ms ease;
}
@media (hover: hover) {
  .cover:hover img {
    transform: scale(1.03);
  }
}
.cover__tag {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  background: rgb(0 0 0 / 0.55);
  backdrop-filter: blur(6px);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.extras {
  margin-top: 0.75rem;
}
.extras__label {
  margin: 0 0 0.4rem !important;
  font-size: 0.72rem !important;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
}
.extras__list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}
.extras__thumb {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
  background: var(--panel);
  cursor: zoom-in;
  transition: border-color 150ms;
}
.extras__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
@media (hover: hover) {
  .extras__thumb:hover {
    border-color: var(--amber);
  }
}
.extras__more {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(0 0 0 / 0.6);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 800;
}

.room-enter-active,
.room-leave-active {
  transition: opacity 160ms ease;
}
.room-enter-from,
.room-leave-to {
  opacity: 0;
}
</style>
