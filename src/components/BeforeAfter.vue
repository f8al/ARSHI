<script setup>
import { ref } from 'vue'

const props = defineProps({
  before: { type: Object, required: true }, // { src, srcset }
  after: { type: Object, required: true },
  title: { type: String, default: '' },
  eager: { type: Boolean, default: false },
  aspect: { type: Number, default: 4 / 3 }, // width / height
})

// Keep extreme panoramas or tall shots within a sensible range.
const ratio = Math.min(Math.max(props.aspect || 4 / 3, 3 / 4), 16 / 9)

const SIZES = '(min-width: 1100px) 520px, (min-width: 700px) 46vw, 94vw'

const revealed = ref(false)
// The "after" image isn't requested until the "before" image has finished
// loading, so the before shot always appears first and gets the bandwidth.
const loadAfter = ref(false)
let lastPointer = 'mouse'

function onBeforeLoad() {
  loadAfter.value = true
}

function onPointerDown(e) {
  lastPointer = e.pointerType
}
function onEnter(e) {
  if (e.pointerType === 'mouse') revealed.value = true
}
function onLeave(e) {
  if (e.pointerType === 'mouse') revealed.value = false
}
function onClick(e) {
  // Mouse users get hover; touch, pen and keyboard (detail === 0) toggle.
  if (e.detail !== 0 && lastPointer === 'mouse') return
  revealed.value = !revealed.value
}
</script>

<template>
  <button
    type="button"
    class="ba"
    :class="{ 'is-revealed': revealed }"
    :style="{ aspectRatio: ratio }"
    :aria-pressed="revealed"
    :aria-label="`${title}: show ${revealed ? 'before' : 'after'} photo`"
    @pointerdown="onPointerDown"
    @pointerenter="onEnter"
    @pointerleave="onLeave"
    @click="onClick"
  >
    <img
      class="ba__img"
      :src="before.src"
      :srcset="before.srcset"
      :sizes="SIZES"
      :alt="`${title}, before`"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : 'auto'"
      decoding="async"
      @load="onBeforeLoad"
    />

    <div class="ba__after" aria-hidden="true">
      <img
        v-if="loadAfter"
        class="ba__img"
        :src="after.src"
        :srcset="after.srcset"
        :sizes="SIZES"
        :alt="`${title}, after`"
        decoding="async"
      />
    </div>
    <span class="ba__edge" aria-hidden="true"></span>

    <span class="ba__tag ba__tag--before">Before</span>
    <span class="ba__tag ba__tag--after">After</span>
    <span class="ba__hint" aria-hidden="true">
      <span class="hint-hover">Hover to see after</span>
      <span class="hint-tap">{{ revealed ? 'Tap for before' : 'Tap to see after' }}</span>
    </span>
  </button>
</template>

<style scoped>
.ba {
  --wipe: 750ms cubic-bezier(0.65, 0, 0.25, 1);
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  padding: 0;
  border: 0;
  overflow: hidden;
  border-radius: var(--radius);
  background: #1a1513;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: pan-y; /* vertical scroll stays native; sideways swipes change rooms */
  isolation: isolate;
  container-type: inline-size;
}
.ba:focus-visible {
  outline: 3px solid var(--amber);
  outline-offset: 3px;
}

.ba__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* After layer: hidden by clipping it to zero width from the right,
   then wiped open left → right. */
.ba__after {
  position: absolute;
  inset: 0;
  clip-path: inset(0 100% 0 0);
  transition: clip-path var(--wipe);
  will-change: clip-path;
}
.is-revealed .ba__after {
  clip-path: inset(0 0 0 0);
}

/* Glowing edge that travels with the wipe. */
.ba__edge {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  margin-left: -3px;
  background: linear-gradient(var(--amber), var(--coral));
  box-shadow: 0 0 18px 2px rgb(230 166 74 / 0.7);
  transform: translateX(0);
  transition: transform var(--wipe), opacity 200ms;
  opacity: 0;
  pointer-events: none;
}
.is-revealed .ba__edge {
  transform: translateX(calc(100cqw + 3px));
  opacity: 1;
}
.ba__tag {
  position: absolute;
  top: 0.75rem;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #fff;
  backdrop-filter: blur(6px);
  transition: opacity 300ms;
}
.ba__tag--before {
  left: 0.75rem;
  background: rgb(0 0 0 / 0.55);
}
.ba__tag--after {
  right: 0.75rem;
  background: linear-gradient(135deg, var(--coral), var(--rust));
  opacity: 0;
}
.is-revealed .ba__tag--before {
  opacity: 0;
}
.is-revealed .ba__tag--after {
  opacity: 1;
  transition-delay: 350ms;
}

.ba__hint {
  position: absolute;
  left: 50%;
  bottom: 0.75rem;
  transform: translateX(-50%);
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  background: rgb(0 0 0 / 0.6);
  backdrop-filter: blur(6px);
  color: #f3ece6;
  font-size: 0.75rem;
  white-space: nowrap;
  transition: opacity 300ms;
}
.hint-hover {
  display: none;
}
@media (hover: hover) and (pointer: fine) {
  .hint-hover {
    display: inline;
  }
  .hint-tap {
    display: none;
  }
  .is-revealed .ba__hint {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ba {
    --wipe: 1ms linear;
  }
  .ba__after {
    clip-path: none;
    opacity: 0;
    transition: opacity 250ms;
  }
  .is-revealed .ba__after {
    opacity: 1;
  }
  .ba__edge {
    display: none;
  }
}
</style>
