<script setup>
import { ref, computed, watch, nextTick } from 'vue'

// Full-screen photo viewer built on the native <dialog> element, which gives
// us Esc-to-close, focus trapping and a top layer for free.
const props = defineProps({
  images: { type: Array, required: true }, // [{ src, srcset, width, height, alt, caption }]
  title: { type: String, default: '' },
})

const dialog = ref(null)
const index = ref(0)
const current = computed(() => props.images[index.value])
const many = computed(() => props.images.length > 1)

function open(i = 0) {
  index.value = i
  dialog.value.showModal()
  preloadNeighbors()
}
function close() {
  dialog.value.close()
}
function go(step) {
  const n = props.images.length
  index.value = (index.value + step + n) % n
}
defineExpose({ open })

// Warm the cache for the next/previous photo so arrows feel instant.
function preloadNeighbors() {
  if (!many.value) return
  for (const step of [1, -1]) {
    const img = props.images[(index.value + step + props.images.length) % props.images.length]
    const pre = new Image()
    pre.sizes = '100vw'
    pre.srcset = img.srcset
    pre.src = img.src
  }
}
watch(index, () => nextTick(preloadNeighbors))

function onKey(e) {
  if (!many.value) return
  if (e.key === 'ArrowRight') go(1)
  else if (e.key === 'ArrowLeft') go(-1)
}

// Clicking the dark backdrop (the dialog element itself) closes it.
function onBackdrop(e) {
  if (e.target === dialog.value || e.target.classList.contains('lb__stage')) close()
}

// Swipe left/right to navigate.
let start = null
function onPointerDown(e) {
  start = e.pointerType === 'mouse' ? null : { x: e.clientX, y: e.clientY }
}
function onPointerUp(e) {
  if (!start) return
  const dx = e.clientX - start.x
  const dy = e.clientY - start.y
  start = null
  if (many.value && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1)
}
</script>

<template>
  <dialog
    ref="dialog"
    class="lb"
    :aria-label="`${title} photos`"
    @click="onBackdrop"
    @keydown="onKey"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="start = null"
  >
    <div class="lb__bar">
      <span class="lb__count" aria-live="polite">
        <template v-if="many">{{ index + 1 }} / {{ images.length }}</template>
      </span>
      <button type="button" class="lb__btn" aria-label="Close" autofocus @click="close">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>
    </div>

    <div class="lb__stage">
      <img
        v-if="current"
        :key="current.src"
        class="lb__img"
        :src="current.src"
        :srcset="current.srcset"
        sizes="100vw"
        :width="current.width"
        :height="current.height"
        :alt="current.alt"
        decoding="async"
      />
    </div>

    <p v-if="current?.caption" class="lb__caption">{{ current.caption }}</p>

    <template v-if="many">
      <button type="button" class="lb__btn lb__nav lb__nav--prev" aria-label="Previous photo" @click="go(-1)">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <button type="button" class="lb__btn lb__nav lb__nav--next" aria-label="Next photo" @click="go(1)">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </button>
    </template>
  </dialog>
</template>

<style scoped>
.lb {
  width: 100vw;
  height: 100dvh;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: #050404;
  color: #fff;
  overscroll-behavior: contain;
  touch-action: pan-y pinch-zoom;
}
.lb[open] {
  display: grid;
  grid-template-rows: auto 1fr auto;
  animation: lb-in 180ms ease-out;
}
.lb::backdrop {
  background: rgb(0 0 0 / 0.6);
}
@keyframes lb-in {
  from {
    opacity: 0;
  }
}

.lb__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: max(0.5rem, env(safe-area-inset-top)) 0.75rem 0.25rem 1.25rem;
}
.lb__count {
  font-size: 0.85rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}

.lb__stage {
  /* flex (not grid) so the image's max-height: 100% resolves against the
     stage's real height and tall photos shrink to fit the screen */
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
  padding: 0 0.5rem;
}
.lb__img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  min-width: 0;
  object-fit: contain;
  border-radius: 6px;
  animation: lb-in 200ms ease-out;
}

.lb__caption {
  margin: 0;
  padding: 0.75rem 1.25rem max(1rem, env(safe-area-inset-bottom));
  text-align: center;
  color: var(--text);
}

.lb__btn {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.08);
  color: #fff;
  cursor: pointer;
  transition: background 150ms;
}
.lb__btn:hover {
  background: rgb(255 255 255 / 0.18);
}
.lb__btn svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.lb__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgb(0 0 0 / 0.45);
}
.lb__nav--prev {
  left: 0.5rem;
}
.lb__nav--next {
  right: 0.5rem;
}
/* On touch screens, swiping is the main way to navigate; keep arrows subtle. */
@media (hover: none) {
  .lb__nav {
    opacity: 0.7;
  }
}
</style>
