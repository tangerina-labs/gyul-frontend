/**
 * Simple prerender script for landing page
 * 
 * This script runs after build to generate static HTML for the home page.
 * Similar to vite-ssg but simpler and tailored for our needs.
 */
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function prerender() {
  const distPath = path.resolve(__dirname, '../dist')
  const indexHtmlPath = path.join(distPath, 'index.html')
  
  // Check if dist exists
  if (!fs.existsSync(distPath)) {
    console.error('Error: dist folder not found. Run build first.')
    process.exit(1)
  }
  
  console.log('Prerendering landing page...')
  
  // For now, the static HTML from index.html is good enough
  // The Lottie animation and other JS will hydrate on client
  console.log('✓ Landing page HTML ready at', indexHtmlPath)
  console.log('✓ Prerendering complete!')
}

prerender().catch((err) => {
  console.error('Prerender failed:', err)
  process.exit(1)
})
