import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.resolve(__dirname, '../reports/visual')
const videosDir = path.join(outputDir, 'videos')

fs.mkdirSync(outputDir, { recursive: true })
fs.mkdirSync(videosDir, { recursive: true })

async function smoothScrollTo(page, startY, endY, durationMs) {
  await page.evaluate(
    async ({ startY, endY, durationMs }) => {
      await new Promise((resolve) => {
        const startTime = performance.now()
        function step(now) {
          const t = Math.min(1, (now - startTime) / durationMs)
          // Smooth linear-ease for consistent scrub observation
          const curY = startY + (endY - startY) * t
          window.scrollTo(0, curY)
          if (t < 1) {
            requestAnimationFrame(step)
          } else {
            resolve()
          }
        }
        requestAnimationFrame(step)
      })
    },
    { startY, endY, durationMs }
  )
}

async function run() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle']
  })

  // =========================================================================
  // 1. DESKTOP STATIC SCREENSHOTS (p = 0.0, p = 0.5, p = 1.0)
  // =========================================================================
  console.log('1. Capturing Desktop (1440x900) static progress screenshots...')
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  })
  const desktopPage = await desktopCtx.newPage()
  await desktopPage.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  await desktopPage.waitForTimeout(1500)

  // Get exact ScrollTrigger start & end positions
  const triggerBounds = await desktopPage.evaluate(() => {
    const section = document.getElementById('today-demo')
    const rect = section.getBoundingClientRect()
    const startY = window.scrollY + rect.top
    const distance = window.innerHeight * 1.3
    return {
      startY,
      midY: startY + distance * 0.5,
      endY: startY + distance
    }
  })
  console.log('Desktop Trigger Bounds:', triggerBounds)

  // p = 0.0
  await desktopPage.evaluate((y) => window.scrollTo(0, y), triggerBounds.startY)
  await desktopPage.waitForTimeout(600)
  const state0 = await desktopPage.evaluate(() => ({
    text: document.querySelector('#today-demo .tabular-nums')?.textContent,
    width: document.querySelector('#today-demo [style*="will-change: width"]')?.style.width
  }))
  console.log('State at p=0.0:', state0)
  await desktopPage.screenshot({
    path: path.join(outputDir, 'phase02_desktop_progress_0_0.png')
  })

  // p = 0.5
  await desktopPage.evaluate((y) => window.scrollTo(0, y), triggerBounds.midY)
  await desktopPage.waitForTimeout(600)
  const state05 = await desktopPage.evaluate(() => ({
    text: document.querySelector('#today-demo .tabular-nums')?.textContent,
    width: document.querySelector('#today-demo [style*="will-change: width"]')?.style.width
  }))
  console.log('State at p=0.5:', state05)
  await desktopPage.screenshot({
    path: path.join(outputDir, 'phase02_desktop_progress_0_5.png')
  })

  // p = 1.0
  await desktopPage.evaluate((y) => window.scrollTo(0, y), triggerBounds.endY)
  await desktopPage.waitForTimeout(600)
  const state10 = await desktopPage.evaluate(() => ({
    text: document.querySelector('#today-demo .tabular-nums')?.textContent,
    width: document.querySelector('#today-demo [style*="will-change: width"]')?.style.width
  }))
  console.log('State at p=1.0:', state10)
  await desktopPage.screenshot({
    path: path.join(outputDir, 'phase02_desktop_progress_1_0.png')
  })

  await desktopCtx.close()

  // =========================================================================
  // 2. DESKTOP SLOW FORWARD SCROLL VIDEO
  // =========================================================================
  console.log('2. Recording Desktop slow forward scroll video...')
  const fwdCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    recordVideo: { dir: videosDir, size: { width: 1440, height: 900 } }
  })
  const fwdPage = await fwdCtx.newPage()
  await fwdPage.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  await fwdPage.waitForTimeout(1000)

  // Jump slightly above #today-demo
  await fwdPage.evaluate((y) => window.scrollTo(0, y - 150), triggerBounds.startY)
  await fwdPage.waitForTimeout(1000)

  // Smooth slow scroll from startY - 150 to endY + 100 over 5 seconds
  await smoothScrollTo(fwdPage, triggerBounds.startY - 150, triggerBounds.endY + 100, 5000)
  await fwdPage.waitForTimeout(1200)

  const fwdVideo = await fwdPage.video()?.path()
  await fwdCtx.close()
  if (fwdVideo && fs.existsSync(fwdVideo)) {
    fs.copyFileSync(fwdVideo, path.join(outputDir, 'phase02_desktop_scroll_forward.webm'))
    console.log('✓ Saved phase02_desktop_scroll_forward.webm')
  }

  // =========================================================================
  // 3. DESKTOP HALFWAY + REVERSE SCROLL VIDEO
  // =========================================================================
  console.log('3. Recording Desktop halfway + reverse scroll video...')
  const revCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    recordVideo: { dir: videosDir, size: { width: 1440, height: 900 } }
  })
  const revPage = await revCtx.newPage()
  await revPage.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  await revPage.waitForTimeout(1000)

  await revPage.evaluate((y) => window.scrollTo(0, y), triggerBounds.startY)
  await revPage.waitForTimeout(1000)

  // Scroll forward to p = 0.6 over 2.5s
  const targetMid = triggerBounds.startY + (triggerBounds.endY - triggerBounds.startY) * 0.6
  await smoothScrollTo(revPage, triggerBounds.startY, targetMid, 2500)
  await revPage.waitForTimeout(1000)

  // Scroll reverse back to p = 0.0 over 2.5s
  await smoothScrollTo(revPage, targetMid, triggerBounds.startY, 2500)
  await revPage.waitForTimeout(1200)

  const revVideo = await revPage.video()?.path()
  await revCtx.close()
  if (revVideo && fs.existsSync(revVideo)) {
    fs.copyFileSync(revVideo, path.join(outputDir, 'phase02_desktop_scroll_reverse.webm'))
    console.log('✓ Saved phase02_desktop_scroll_reverse.webm')
  }

  // =========================================================================
  // 4. MOBILE (390x844) SCREENSHOT & FULL DEMO VIDEO
  // =========================================================================
  console.log('4. Recording Mobile (390x844) complete demo video & screenshots...')
  const mobCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: { dir: videosDir, size: { width: 390, height: 844 } }
  })
  const mobPage = await mobCtx.newPage()
  await mobPage.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  await mobPage.waitForTimeout(1000)

  const mobBounds = await mobPage.evaluate(() => {
    const section = document.getElementById('today-demo')
    const rect = section.getBoundingClientRect()
    const startY = window.scrollY + rect.top
    const distance = window.innerHeight * 1.3
    return {
      startY,
      midY: startY + distance * 0.5,
      endY: startY + distance
    }
  })
  console.log('Mobile Trigger Bounds:', mobBounds)

  await mobPage.evaluate((y) => window.scrollTo(0, y), mobBounds.startY)
  await mobPage.waitForTimeout(1000)
  await mobPage.screenshot({
    path: path.join(outputDir, 'phase02_mobile_progress_0_0.png')
  })

  // Scroll forward to p = 1.0 over 3.5s
  await smoothScrollTo(mobPage, mobBounds.startY, mobBounds.endY, 3500)
  await mobPage.waitForTimeout(1000)
  await mobPage.screenshot({
    path: path.join(outputDir, 'phase02_mobile_progress_1_0.png')
  })

  // Scroll reverse back to p = 0.0 over 2.5s
  await smoothScrollTo(mobPage, mobBounds.endY, mobBounds.startY, 2500)
  await mobPage.waitForTimeout(1000)

  const mobVideo = await mobPage.video()?.path()
  await mobCtx.close()
  if (mobVideo && fs.existsSync(mobVideo)) {
    fs.copyFileSync(mobVideo, path.join(outputDir, 'phase02_mobile_demo.webm'))
    console.log('✓ Saved phase02_mobile_demo.webm')
  }

  await browser.close()
  console.log('\nAll Phase 02 verifications & recordings finished!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
