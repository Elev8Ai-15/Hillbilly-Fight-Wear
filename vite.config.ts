import { defineConfig } from 'vite'
import pages from '@hono/vite-cloudflare-pages'
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

// Custom plugin to copy public assets to dist after build
function copyPublicAssets() {
  return {
    name: 'copy-public-assets',
    closeBundle() {
      const publicDir = resolve(__dirname, 'public')
      const distDir = resolve(__dirname, 'dist')
      
      // Copy images folder
      if (existsSync(resolve(publicDir, 'images'))) {
        cpSync(
          resolve(publicDir, 'images'),
          resolve(distDir, 'images'),
          { recursive: true, force: true }
        )
        console.log('\x1b[32m✓ Copied public/images to dist/images\x1b[0m')
      }
      
      // Copy _routes.json
      if (existsSync(resolve(publicDir, '_routes.json'))) {
        cpSync(
          resolve(publicDir, '_routes.json'),
          resolve(distDir, '_routes.json'),
          { force: true }
        )
        console.log('\x1b[32m✓ Copied public/_routes.json to dist/\x1b[0m')
      }
      
      // Copy manifest.json
      if (existsSync(resolve(publicDir, 'manifest.json'))) {
        cpSync(
          resolve(publicDir, 'manifest.json'),
          resolve(distDir, 'manifest.json'),
          { force: true }
        )
        console.log('\x1b[32m✓ Copied public/manifest.json to dist/\x1b[0m')
      }
      
      // Copy static folder (contains pre-built tailwind.css)
      if (existsSync(resolve(publicDir, 'static'))) {
        cpSync(
          resolve(publicDir, 'static'),
          resolve(distDir, 'static'),
          { recursive: true, force: true }
        )
        console.log('\x1b[32m✓ Copied public/static to dist/static\x1b[0m')
      }
    }
  }
}

export default defineConfig({
  plugins: [pages(), copyPublicAssets()],
  build: {
    outDir: 'dist'
  }
})
