import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Plugin to copy .lino files to public directory
function copyLinoFiles() {
  return {
    name: 'copy-lino-files',
    buildStart() {
      const sourceDir = join(__dirname, '..', 'providers')
      const targetDir = join(__dirname, 'public', 'providers')

      // Recursively copy directory
      function copyDir(src, dest) {
        mkdirSync(dest, { recursive: true })
        const entries = readdirSync(src, { withFileTypes: true })

        for (const entry of entries) {
          const srcPath = join(src, entry.name)
          const destPath = join(dest, entry.name)

          if (entry.isDirectory()) {
            copyDir(srcPath, destPath)
          } else if (entry.name.endsWith('.lino')) {
            copyFileSync(srcPath, destPath)
          }
        }
      }

      copyDir(sourceDir, targetDir)
      console.log('Copied .lino files to public directory')
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyLinoFiles()],
  base: '/models/',
  build: {
    minify: false,
  },
})
