import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { imagetools } from 'vite-imagetools'

// base: './' makes every asset path relative, so the built site works on
// GitHub Pages at https://<user>.github.io/<repo>/ AND on a custom domain
// without any changes.
export default defineConfig({
  base: './',
  plugins: [vue(), imagetools()],
  build: {
    assetsInlineLimit: 2048,
  },
})
