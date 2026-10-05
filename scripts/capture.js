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
  // 1. Desktop 1440x900 & Smooth Full Page Scroll
  // ==========================================
  console.log('[1/5] Capturing Desktop 1440x900 & Full Page Scroll...')
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

  // 1.1 First-screen 1440x900 Hero (cards entering fold ~50%)
  await page.screenshot({
    path: path.join(outputDir, '01_desktop_hero_1440x900.png'),
    fullPage: false
  })
  console.log('✓ Saved 01_desktop_hero_1440x900.png')

  // Smooth scroll down to showcase
  await page.evaluate(() => {
    window.scrollTo({ top: 320, behavior: 'smooth' })
  })
  await page.waitForTimeout(1600)

  // 1.2 Desktop Showcase Full (cards centered on screen)
  await page.screenshot({
    path: path.join(outputDir, '02_desktop_showcase_full.png'),
    fullPage: false
  })
  console.log('✓ Saved 02_desktop_showcase_full.png')

  // Smooth scroll to Performance section
  await page.evaluate(() => {
    document.querySelector('#performance')?.scrollIntoView({ behavior: 'smooth' })
  })
  await page.waitForTimeout(1600)

  // 1.3 Desktop Performance section
  const perf = await page.locator('#performance')
  await perf.screenshot({
    path: path.join(outputDir, '03_desktop_performance.png')
  })
  console.log('✓ Saved 03_desktop_performance.png')

  // Smooth scroll to Footer
  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  })
  await page.waitForTimeout(1500)

  // Smooth scroll back to Top
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
  await page.waitForTimeout(1200)

  const desktopVideo = await page.video()?.path()
  await desktopContext.close()
  if (desktopVideo && fs.existsSync(desktopVideo)) {
    fs.copyFileSync(desktopVideo, path.join(outputDir, 'desktop_full_page_scroll.webm'))
    console.log('✓ Saved desktop_full_page_scroll.webm')
  }

  // ==========================================
  // 2. Desktop Three Cards Switch Interaction (Click & Drag)
  // ==========================================
  console.log('[2/5] Capturing Desktop Three-Card Switch Interaction...')
  const switchContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: videosDir,
      size: { width: 1440, height: 900 }
    }
  })
  const switchPage = await switchContext.newPage()
  await switchPage.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  await switchPage.waitForTimeout(1500)

  // Position cards in view
  await switchPage.evaluate(() => {
    window.scrollTo({ top: 320, behavior: 'smooth' })
  })
  await switchPage.waitForTimeout(1000)

  // 1) Click Tab "周视图"
  const tabWeek = await switchPage.locator('button:has-text("周视图")').first()
  if (await tabWeek.isVisible()) {
    await tabWeek.click()
    await switchPage.waitForTimeout(1100)
  }

  // 2) Click Tab "更多"
  const tabMore = await switchPage.locator('button:has-text("更多")').first()
  if (await tabMore.isVisible()) {
    await tabMore.click()
    await switchPage.waitForTimeout(1100)
  }

  // 3) Click Tab "今日" back
  const tabToday = await switchPage.locator('button:has-text("今日")').first()
  if (await tabToday.isVisible()) {
    await tabToday.click()
    await switchPage.waitForTimeout(1100)
  }

  // 4) Mouse Drag center card leftward to trigger next card
  const centerBox = { x: 720, y: 550 }
  await switchPage.mouse.move(centerBox.x, centerBox.y)
  await switchPage.mouse.down()
  await switchPage.mouse.move(centerBox.x - 240, centerBox.y, { steps: 20 })
  await switchPage.mouse.up()
  await switchPage.waitForTimeout(1200)

  // 5) Mouse Drag back rightward to return
  await switchPage.mouse.move(centerBox.x, centerBox.y)
  await switchPage.mouse.down()
  await switchPage.mouse.move(centerBox.x + 240, centerBox.y, { steps: 20 })
  await switchPage.mouse.up()
  await switchPage.waitForTimeout(1200)

  const switchVideo = await switchPage.video()?.path()
  await switchContext.close()
  if (switchVideo && fs.existsSync(switchVideo)) {
    fs.copyFileSync(switchVideo, path.join(outputDir, 'desktop_three_cards_switch.webm'))
    console.log('✓ Saved desktop_three_cards_switch.webm')
  }

  // ==========================================
  // 3. Mobile Context (390 x 844) Viewport & Gestures
  // ==========================================
  console.log('[3/5] Capturing Mobile 390x844 & Gestures...')
  const mobileSwipeContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: {
      dir: videosDir,
      size: { width: 390, height: 844 }
    }
  })
  const mobileSwipePage = await mobileSwipeContext.newPage()
  await mobileSwipePage.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  await mobileSwipePage.waitForTimeout(2000)

  // 3.1 Mobile Hero initial viewport
  await mobileSwipePage.screenshot({
    path: path.join(outputDir, '04_mobile_hero_390x844.png'),
    fullPage: false
  })
  console.log('✓ Saved 04_mobile_hero_390x844.png')

  // Scroll so showcase is centered
  await mobileSwipePage.evaluate(() => {
    window.scrollTo({ top: 220, behavior: 'smooth' })
  })
  await mobileSwipePage.waitForTimeout(1200)

  // 3.2 Mobile Showcase view
  await mobileSwipePage.screenshot({
    path: path.join(outputDir, '05_mobile_showcase_390x844.png'),
    fullPage: false
  })
  console.log('✓ Saved 05_mobile_showcase_390x844.png')

  // Swipe Left (showing next card)
  await mobileSwipePage.mouse.move(300, 520)
  await mobileSwipePage.mouse.down()
  await mobileSwipePage.mouse.move(80, 520, { steps: 15 })
  await mobileSwipePage.mouse.up()
  await mobileSwipePage.waitForTimeout(1100)

  // Swipe Left again (showing third card)
  await mobileSwipePage.mouse.move(300, 520)
  await mobileSwipePage.mouse.down()
  await mobileSwipePage.mouse.move(80, 520, { steps: 15 })
  await mobileSwipePage.mouse.up()
  await mobileSwipePage.waitForTimeout(1100)

  // Swipe Right back
  await mobileSwipePage.mouse.move(80, 520)
  await mobileSwipePage.mouse.down()
  await mobileSwipePage.mouse.move(300, 520, { steps: 15 })
  await mobileSwipePage.mouse.up()
  await mobileSwipePage.waitForTimeout(1100)

  // Swipe Right back to initial
  await mobileSwipePage.mouse.move(80, 520)
  await mobileSwipePage.mouse.down()
  await mobileSwipePage.mouse.move(300, 520, { steps: 15 })
  await mobileSwipePage.mouse.up()
  await mobileSwipePage.waitForTimeout(1100)

  const swipeVideo = await mobileSwipePage.video()?.path()
  await mobileSwipeContext.close()
  if (swipeVideo && fs.existsSync(swipeVideo)) {
    fs.copyFileSync(swipeVideo, path.join(outputDir, 'mobile_three_cards_swipe.webm'))
    console.log('✓ Saved mobile_three_cards_swipe.webm')
  }

  // ==========================================
  // 4. Mobile Full Page Scroll & Clean Screenshot
  // ==========================================
  console.log('[4/5] Capturing Mobile Full Page Scroll & Fullpage Screenshot...')
  const mobileScrollContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: {
      dir: videosDir,
      size: { width: 390, height: 844 }
    }
  })
  const mobileScrollPage = await mobileScrollContext.newPage()
  await mobileScrollPage.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  await mobileScrollPage.waitForTimeout(1500)

  // Smoothly scroll through the mobile page
  const totalHeight = await mobileScrollPage.evaluate(() => document.body.scrollHeight)
  let currentScroll = 0
  while (currentScroll < totalHeight) {
    currentScroll += 280
    await mobileScrollPage.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), currentScroll)
    await mobileScrollPage.waitForTimeout(400)
  }
  await mobileScrollPage.waitForTimeout(1000)

  const mobileScrollVideo = await mobileScrollPage.video()?.path()
  await mobileScrollContext.close()
  if (mobileScrollVideo && fs.existsSync(mobileScrollVideo)) {
    fs.copyFileSync(mobileScrollVideo, path.join(outputDir, 'mobile_full_page_scroll.webm'))
    console.log('✓ Saved mobile_full_page_scroll.webm')
  }

  // Capture clean full page screenshot in dedicated context (scrolled to 0)
  const fullPageContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  })
  const fullPage = await fullPageContext.newPage()
  await fullPage.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  await fullPage.waitForTimeout(2000)
  await fullPage.screenshot({
    path: path.join(outputDir, '06_mobile_full_page.png'),
    fullPage: true
  })
  await fullPageContext.close()
  console.log('✓ Saved clean 06_mobile_full_page.png')

  // ==========================================
  // 5. Hero Dynamic Motion Recording & GIF
  // ==========================================
  console.log('[5/5] Capturing Hero dynamic motion & frames...')
  const heroMotionContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
    recordVideo: {
      dir: videosDir,
      size: { width: 1440, height: 900 }
    }
  })
  const heroMotionPage = await heroMotionContext.newPage()
  await heroMotionPage.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  // Record subtle ambient motion
  for (let i = 0; i < 24; i++) {
    const x = 720 + Math.sin(i * 0.25) * 180
    const y = 450 + Math.cos(i * 0.25) * 90
    await heroMotionPage.mouse.move(x, y)
    await heroMotionPage.waitForTimeout(180)
  }
  const motionVideo = await heroMotionPage.video()?.path()
  await heroMotionContext.close()
  if (motionVideo && fs.existsSync(motionVideo)) {
    fs.copyFileSync(motionVideo, path.join(outputDir, 'hero_dynamic_motion_desktop.webm'))
    console.log('✓ Saved hero_dynamic_motion_desktop.webm')
  }

  // Capture 24 frames for GIF compilation
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

  // Compile GIF via Python script
  execSync('python scripts/compile_gif.py', { stdio: 'inherit' })
  console.log('All visual captures and compilations completed successfully!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
