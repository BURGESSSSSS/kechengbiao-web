import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const framesDir = path.resolve(__dirname, '../reports/visual/frames')
fs.mkdirSync(framesDir, { recursive: true })

async function captureFrames() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist']
  })

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  })

  const page = await context.newPage()
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  console.log('Capturing 24 frames for animated preview...')
  for (let i = 0; i < 24; i++) {
    const framePath = path.join(framesDir, `frame_${String(i).padStart(3, '0')}.png`)
    // Subtle mouse movement to show ambient responsiveness
    const mouseX = 720 + Math.sin(i * 0.25) * 160
    const mouseY = 450 + Math.cos(i * 0.25) * 80
    await page.mouse.move(mouseX, mouseY)
    await page.screenshot({ path: framePath })
    await page.waitForTimeout(120)
  }

  await browser.close()
  console.log('Frame capture complete.')
}

captureFrames().catch(console.error)
