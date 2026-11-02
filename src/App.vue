<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import BeforeAfter from './components/BeforeAfter.vue'
import Icon from './components/Icon.vue'
import { business, services, reasons } from './content.js'
import { projects } from './gallery.js'
import logo from './assets/logo.webp'
import logoMark from './assets/logo-mark.webp'

const menuOpen = ref(false)
const scrolled = ref(false)
const year = new Date().getFullYear()

const nav = [
  { href: '#services', label: 'Services' },
  { href: '#work', label: 'Our Work' },
  { href: '#about', label: 'Why ARS' },
  { href: '#contact', label: 'Contact' },
]

function onScroll() {
  scrolled.value = window.scrollY > 8
}
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <a class="skip" href="#main">Skip to content</a>

  <header class="top" :class="{ 'is-scrolled': scrolled }">
    <div class="wrap top__bar">
      <a href="#" class="brand" aria-label="ARS Home Improvements, home">
        <img :src="logoMark" alt="" width="44" height="41" />
        <span class="brand__text"><b>ARS</b><small>Home Improvements</small></span>
      </a>

      <nav id="main-nav" class="nav" :class="{ 'is-open': menuOpen }" aria-label="Main">
        <a v-for="n in nav" :key="n.href" :href="n.href" @click="menuOpen = false">{{ n.label }}</a>
        <a :href="business.phoneHref" class="btn btn--sm nav__call">
          <Icon name="phone" /> {{ business.phoneDisplay }}
        </a>
      </nav>

      <button
        class="menu-btn"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="main-nav"
        aria-label="Menu"
        @click="menuOpen = !menuOpen"
      >
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <main id="main">
    <!-- HERO -->
    <section class="hero">
      <div class="wrap hero__grid">
        <div class="hero__copy">
          <p class="eyebrow">Omaha, Nebraska</p>
          <h1>Better homes,<br /><span class="grad">built right.</span></h1>
          <p class="lead">
            Remodeling, repairs and upgrades from a local contractor who treats your home
            like their own. Free estimates. Honest work.
          </p>
          <div class="cta-row">
            <a :href="business.phoneHref" class="btn"><Icon name="phone" /> Call {{ business.phoneDisplay }}</a>
            <a href="#work" class="btn btn--ghost">See our work</a>
          </div>
        </div>
        <div class="hero__logo">
          <img :src="logo" alt="ARS Home Improvements logo" width="560" height="560" fetchpriority="high" />
        </div>
      </div>
    </section>

    <!-- SERVICES -->
    <section id="services" class="section">
      <div class="wrap">
        <header class="section__head">
          <p class="eyebrow">What we do</p>
          <h2>Services</h2>
        </header>
        <ul class="cards">
          <li v-for="s in services" :key="s.title" class="card">
            <span class="card__icon"><Icon :name="s.icon" /></span>
            <h3>{{ s.title }}</h3>
            <p>{{ s.text }}</p>
          </li>
        </ul>
      </div>
    </section>

    <!-- GALLERY -->
    <section id="work" class="section section--alt">
      <div class="wrap">
        <header class="section__head">
          <p class="eyebrow">Before &amp; after</p>
          <h2>Our Work</h2>
          <p class="muted">
            <span class="only-hover">Hover over a photo</span><span class="only-touch">Tap a photo</span>
            to see the transformation.
          </p>
        </header>

        <div v-if="projects.length" class="gallery">
          <figure v-for="(p, i) in projects" :key="p.id" class="project">
            <BeforeAfter :before="p.before" :after="p.after" :title="p.title" :aspect="p.aspect" :eager="i < 2" />
            <figcaption>
              <h3>{{ p.title }}</h3>
              <p v-if="p.location" class="project__loc">{{ p.location }}</p>
              <p v-if="p.description">{{ p.description }}</p>
            </figcaption>
          </figure>
        </div>
        <p v-else class="empty">Project photos coming soon. Call us to see examples of our work!</p>
      </div>
    </section>

    <!-- WHY US -->
    <section id="about" class="section">
      <div class="wrap">
        <header class="section__head">
          <p class="eyebrow">Why ARS</p>
          <h2>Work you can count on</h2>
        </header>
        <ul class="reasons">
          <li v-for="r in reasons" :key="r.title">
            <Icon name="check" class="reasons__check" />
            <div>
              <h3>{{ r.title }}</h3>
              <p>{{ r.text }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- CONTACT -->
    <section id="contact" class="section contact">
      <div class="wrap contact__inner">
        <p class="eyebrow">Free estimates</p>
        <h2>Let's talk about your project</h2>
        <p class="lead">Call or text for the fastest response, or send us an email with a few details and photos.</p>
        <div class="contact__grid">
          <a :href="business.phoneHref" class="contact__item">
            <Icon name="phone" />
            <span><small>Call</small>{{ business.phoneDisplay }}</span>
          </a>
          <a :href="business.smsHref" class="contact__item">
            <Icon name="chat" />
            <span><small>Text</small>{{ business.phoneDisplay }}</span>
          </a>
          <a :href="`mailto:${business.email}?subject=Estimate%20request`" class="contact__item">
            <Icon name="mail" />
            <span><small>Email</small>{{ business.email }}</span>
          </a>
        </div>
      </div>
    </section>
  </main>

  <footer class="foot">
    <div class="wrap foot__inner">
      <img :src="logoMark" alt="" width="36" height="33" loading="lazy" />
      <p>&copy; {{ year }} {{ business.name }} · {{ business.city }}</p>
      <p>
        <a :href="business.phoneHref">{{ business.phoneDisplay }}</a> ·
        <a :href="`mailto:${business.email}`">{{ business.email }}</a>
      </p>
    </div>
  </footer>

  <!-- Mobile sticky call bar -->
  <div class="callbar">
    <a :href="business.phoneHref" class="btn"><Icon name="phone" /> Call</a>
    <a :href="business.smsHref" class="btn btn--ghost"><Icon name="chat" /> Text</a>
    <a :href="`mailto:${business.email}`" class="btn btn--ghost"><Icon name="mail" /> Email</a>
  </div>
</template>
