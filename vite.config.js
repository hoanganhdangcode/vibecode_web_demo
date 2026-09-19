import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/vibecode_web_demo/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            /node_modules\/(three|@react-three)/.test(id)
          ) {
            return 'three'
          }
          if (/node_modules\/(react|react-dom|scheduler)/.test(id)) {
            return 'react'
          }
          if (/node_modules\/gsap/.test(id)) {
            return 'gsap'
          }
        },
      },
    },
  },
})