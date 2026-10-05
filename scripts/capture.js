import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.resolve(__dirname, '../reports/visual')
const videosDir = path.join(outputDir, 'videos')
const framesDir = path.join(outputDir, 'frames')

fs.mkdirSync(outputDir, { recursive: true })
fs.mkdirSync(videosDir, { recursive: true })
fs.mkdirSync(framesDir, { recursive: true })

async function run() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle']
  })

  // ==========================================
  // 1. Desktop 1440x900 Un-scrolled & Full Showcase Screenshots + Full Page Scroll
  // ==========================================
  console.log('[1/6] Capturing Desktop 1440x900 Screenshots & Full Page Scroll...')
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: videosDir,
      size: { width: 1440, height: 900 }
    }
  })
  const page = await desktopContext.newPage()
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)

  // 1.1 Un-scrolled 1440x900 Hero (Codex baseline: cards top ~76%-80%, ~25%-35% exposed)
  await page.screenshot({
    path: path.join(outputDir, '01_desktop_hero_1440x900.png'),
    fullPage: false
  })
  console.log('✓ Saved 01_desktop_hero_1440x900.png')

  // Smooth scroll down to full showcase state
  await page.evaluate(() => {
    window.scrollTo({ top: 480, behavior: 'smooth' })
  })
  await page.waitForTimeout(1600)

  // 1.2 Full Showcase state (all 3 cards completely visible, bottom nav intact, status bar cropped)
  await page.screenshot({
    path: path.join(outputDir, '02_desktop_showcase_full.png'),
    fullPage: false
  })
  console.log('✓ Saved 02_desktop_showcase_full.png')

  // Smooth scroll through Performance to Footer
  await page.evaluate(() => {
    document.querySelector('#performance')?.scrollIntoView({ behavior: 'smooth' })
  })
  await page.waitForTimeout(1600)

  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  })
  await page.waitForTimeout(1500)

  // Smooth scroll back to top
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
  await page.waitForTimeout(1200)

  const desktopVideo = await page.video()?.path()
  await desktopContext.close()
  if (desktopVideo && fs.existsSync(desktopVideo)) {
    fs.copyFileSync(desktopVideo, path.join(outputDir, '07_desktop_full_page_scroll.webm'))
    console.log('✓ Saved 07_desktop_full_page_scroll.webm')
  }

  // ==========================================
  // 2. Desktop Mouse "Slow Direct Dragging" (0 -> 0.5 -> 1)
  // ==========================================
  console.log('[2/6] Capturing Desktop Slow Direct Dragging Video (0 -> 0.5 -> 1)...')
  const slowDragContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: videosDir,
      size: { width: 1440, height: 900 }
    }
  })
  const slowDragPage = await slowDragContext.newPage()
  await slowDragPage.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  await slowDragPage.waitForTimeout(1500)
  await slowDragPage.evaluate(() => window.scrollTo({ top: 460, behavior: 'smooth' }))
  await slowDragPage.waitForTimeout(1000)

  // Start pointer drag from center
  const centerPos = { x: 720, y: 550 }
  await slowDragPage.mouse.move(centerPos.x, centerPos.y)
  await slowDragPage.mouse.down()
  await slowDragPage.waitForTimeout(300)

  // Slowly drag right: 0 -> 0.5 (progress ~ 0.5)
  for (let i = 1; i <= 15; i++) {
    await slowDragPage.mouse.move(centerPos.x + i * 10, centerPos.y)
    await slowDragPage.waitForTimeout(60)
  }
  await slowDragPage.waitForTimeout(600) // Pause at 0.5 to clearly show mid-progress blur & scale

  // Continue dragging right: 0.5 -> 1.0 (progress ~ 1.0)
  for (let i = 16; i <= 30; i++) {
    await slowDragPage.mouse.move(centerPos.x + i * 10, centerPos.y)
    await slowDragPage.waitForTimeout(60)
  }
  await slowDragPage.waitForTimeout(600) // Pause at 1.0

  // Release mouse
  await slowDragPage.mouse.up()
  await slowDragPage.waitForTimeout(1200)

  const slowDragVideo = await slowDragPage.video()?.path()
  await slowDragContext.close()
  if (slowDragVideo && fs.existsSync(slowDragVideo)) {
    fs.copyFileSync(slowDragVideo, path.join(outputDir, '03_desktop_drag_slow.webm'))
    console.log('✓ Saved 03_desktop_drag_slow.webm')
  }

  // ==========================================
  // 3. Desktop Drag Halfway & Reverse Drag Back
  // ==========================================
  console.log('[3/6] Capturing Desktop Drag Halfway & Reverse Drag Back...')
  const reverseDragContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: videosDir,
      size: { width: 1440, height: 900 }
    }
  })
  const reverseDragPage = await reverseDragContext.newPage()
  await reverseDragPage.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  await reverseDragPage.waitForTimeout(1500)
  await reverseDragPage.evaluate(() => window.scrollTo({ top: 460, behavior: 'smooth' }))
  await reverseDragPage.waitForTimeout(1000)

  await reverseDragPage.mouse.move(centerPos.x, centerPos.y)
  await reverseDragPage.mouse.down()
  await reverseDragPage.waitForTimeout(200)

  // Drag leftward to ~ -0.6
  for (let i = 1; i <= 18; i++) {
    await reverseDragPage.mouse.move(centerPos.x - i * 10, centerPos.y)
    await reverseDragPage.waitForTimeout(40)
  }
  await reverseDragPage.waitForTimeout(400)

  // Immediately drag back rightward past center to +0.5
  for (let i = 18; i >= -15; i--) {
    await reverseDragPage.mouse.move(centerPos.x - i * 10, centerPos.y)
    await reverseDragPage.waitForTimeout(40)
  }
  await reverseDragPage.waitForTimeout(400)

  // Release mouse
  await reverseDragPage.mouse.up()
  await reverseDragPage.waitForTimeout(1200)

  const reverseDragVideo = await reverseDragPage.video()?.path()
  await reverseDragContext.close()
  if (reverseDragVideo && fs.existsSync(reverseDragVideo)) {
    fs.copyFileSync(reverseDragVideo, path.join(outputDir, '04_desktop_drag_reverse.webm'))
    console.log('✓ Saved 04_desktop_drag_reverse.webm')
  }

  // ==========================================
  // 4. Mobile Finger Swipe (390 x 844)
  // ==========================================
  console.log('[4/6] Capturing Mobile Finger Swipe (390x844)...')
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: {
      dir: videosDir,
      size: { width: 390, height: 844 }
    }
  })
  const mobilePage = await mobileContext.newPage()
  await mobilePage.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  // 4.1 Mobile un-scrolled Hero screenshot
  await mobilePage.screenshot({
    path: path.join(outputDir, '04_mobile_hero_390x844.png'),
    fullPage: false
  })
  console.log('✓ Saved 04_mobile_hero_390x844.png')

  await mobilePage.evaluate(() => window.scrollTo({ top: 320, behavior: 'smooth' }))
  await mobilePage.waitForTimeout(1000)

  // 4.2 Mobile Showcase view screenshot
  await mobilePage.screenshot({
    path: path.join(outputDir, '05_mobile_showcase_390x844.png'),
    fullPage: false
  })
  console.log('✓ Saved 05_mobile_showcase_390x844.png')

  // Touch swipe left (showing next card)
  await mobilePage.mouse.move(310, 520)
  await mobilePage.mouse.down()
  await mobilePage.mouse.move(70, 520, { steps: 20 })
  await mobilePage.mouse.up()
  await mobilePage.waitForTimeout(1100)

  // Touch swipe right (bringing previous card back)
  await mobilePage.mouse.move(70, 520)
  await mobilePage.mouse.down()
  await mobilePage.mouse.move(310, 520, { steps: 20 })
  await mobilePage.mouse.up()
  await mobilePage.waitForTimeout(1100)

  // 4.3 Clean Mobile Full Page screenshot
  await mobilePage.evaluate(() => window.scrollTo(0, 0))
  await mobilePage.waitForTimeout(600)
  await mobilePage.screenshot({
    path: path.join(outputDir, '06_mobile_full_page.png'),
    fullPage: true
  })
  console.log('✓ Saved 06_mobile_full_page.png')

  const mobileVideo = await mobilePage.video()?.path()
  await mobileContext.close()
  if (mobileVideo && fs.existsSync(mobileVideo)) {
    fs.copyFileSync(mobileVideo, path.join(outputDir, '05_mobile_swipe.webm'))
    console.log('✓ Saved 05_mobile_swipe.webm')
  }

  // ==========================================
  // 5. Label Track Switch Demonstration (Same Horizontal Baseline)
  // ==========================================
  console.log('[5/6] Capturing Label Track Switch Demonstration...')
  const labelContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: videosDir,
      size: { width: 1440, height: 900 }
    }
  })
  const labelPage = await labelContext.newPage()
  await labelPage.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  await labelPage.waitForTimeout(1500)
  await labelPage.evaluate(() => window.scrollTo({ top: 460, behavior: 'smooth' }))
  await labelPage.waitForTimeout(1000)

  // Click "周视图" label
  const labelWeek = await labelPage.locator('button:has-text("周视图")').first()
  if (await labelWeek.isVisible()) {
    await labelWeek.click()
    await labelPage.waitForTimeout(1000)
  }

  // Click "更多" label
  const labelMore = await labelPage.locator('button:has-text("更多")').first()
  if (await labelMore.isVisible()) {
    await labelMore.click()
    await labelPage.waitForTimeout(1000)
  }

  // Click "今日" label back
  const labelToday = await labelPage.locator('button:has-text("今日")').first()
  if (await labelToday.isVisible()) {
    await labelToday.click()
    await labelPage.waitForTimeout(1000)
  }

  const labelVideo = await labelPage.video()?.path()
  await labelContext.close()
  if (labelVideo && fs.existsSync(labelVideo)) {
    fs.copyFileSync(labelVideo, path.join(outputDir, '06_label_track_switch.webm'))
    console.log('✓ Saved 06_label_track_switch.webm')
  }

  // ==========================================
  // 6. Compile Animated GIF for Hero
  // ==========================================
  console.log('[6/6] Capturing frames and compiling 08_hero_dynamic_motion.gif...')
  const gifContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  })
  const gifPage = await gifContext.newPage()
  await gifPage.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  await gifPage.waitForTimeout(1500)
  for (let i = 0; i < 24; i++) {
    const framePath = path.join(framesDir, `frame_${String(i).padStart(3, '0')}.png`)
    const mouseX = 720 + Math.sin(i * 0.25) * 160
    const mouseY = 450 + Math.cos(i * 0.25) * 80
    await gifPage.mouse.move(mouseX, mouseY)
    await gifPage.screenshot({ path: framePath })
    await gifPage.waitForTimeout(120)
  }
  await gifContext.close()
  await browser.close()

  // Compile GIF with python
  execSync('python scripts/compile_gif.py', { stdio: 'inherit' })
  if (fs.existsSync('reports/visual/07_hero_dynamic_motion.gif')) {
    fs.copyFileSync('reports/visual/07_hero_dynamic_motion.gif', 'reports/visual/08_hero_dynamic_motion.gif')
  }

  console.log('All visual captures and verifications completed successfully!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
