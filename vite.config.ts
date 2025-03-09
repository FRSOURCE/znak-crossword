import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
// import tailwindcssCleaner from 'vite-plugin-tailwindcss-cleaner'

import ipuz from './ipuz-vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss(), ipuz()], //, tailwindcssCleaner()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  experimental: {
    renderBuiltUrl(filename, { hostType, ssr }) {
      if (hostType === 'js' && !ssr) {
        return {
          runtime: `typeof window !== 'undefined' && window.__frs_crossword_withBaseURL(${JSON.stringify(filename)})`,
        }
      } else {
        return { relative: true }
      }
    },
  },
})
