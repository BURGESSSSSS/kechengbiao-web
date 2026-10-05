import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.resolve(__dirname, '../reports/visual')
fs.mkdirSync(outputDir, { recursive: true })

async function run() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle']
  })

  console.log('Capturing Desktop 1440x900...')
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: path.resolve(__dirname, '../reports/visual/videos'),
      size: { width: 1440, height: 900 }
    }
  })
  const page = await desktopContext.newPage()
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  // 1. 1440x900 Hero viewport screenshot
  await page.screenshot({
    path: path.join(outputDir, '01_desktop_hero_1440x900.png'),
    fullPage: false
  })
  console.log('✓ Saved 01_desktop_hero_1440x900.png')

  // Smooth scroll to showcase
  await page.evaluate(() => {
    window.scrollTo({ top: 900, behavior: 'smooth' })
  })
  await page.waitForTimeout(1500)

  // 2. Showcase desktop
  const showcase = await page.locator('#showcase')
  await showcase.screenshot({
    path: path.join(outputDir, '02_desktop_showcase.png')
  })
  console.log('✓ Saved 02_desktop_showcase.png')

  // Smooth scroll to performance
  await page.evaluate(() => {
    document.querySelector('#performance')?.scrollIntoView({ behavior: 'smooth' })
  })
  await page.waitForTimeout(1500)

  // 3. Performance desktop
  const perf = await page.locator('#performance')
  await perf.screenshot({
    path: path.join(outputDir, '03_desktop_performance.png')
  })
  console.log('✓ Saved 03_desktop_performance.png')

  // Scroll back up and finish desktop video
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
  await page.waitForTimeout(1000)
  await desktopContext.close()
  console.log('✓ Desktop video recorded')

  // Mobile Context (390 x 844)
  console.log('Capturing Mobile 390x844...')
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: {
      dir: path.resolve(__dirname, '../reports/visual/videos'),
      size: { width: 390, height: 844 }
    }
  })
  const mobilePage = await mobileContext.newPage()
  await mobilePage.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  await mobilePage.waitForTimeout(2000)

  // 4. Mobile Hero screenshot
  await mobilePage.screenshot({
    path: path.join(outputDir, '04_mobile_hero_390x844.png'),
    fullPage: false
  })
  console.log('✓ Saved 04_mobile_hero_390x844.png')

  // Mobile Scroll through entire page
  const totalHeight = await mobilePage.evaluate(() => document.body.scrollHeight)
  let currentScroll = 0
  while (currentScroll < totalHeight) {
    currentScroll += 300
    await mobilePage.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), currentScroll)
    await mobilePage.waitForTimeout(400)
  }
  await mobilePage.waitForTimeout(1000)

  // 5. Mobile Full Page screenshot
  await mobilePage.screenshot({
    path: path.join(outputDir, '05_mobile_full_page.png'),
    fullPage: true
  })
  console.log('✓ Saved 05_mobile_full_page.png')

  await mobileContext.close()
  console.log('✓ Mobile video recorded')

  // Record a dedicated Hero ambient motion recording (1440x900, 4 seconds motionless Hero)
  console.log('Capturing Hero dynamic motion video...')
  const heroMotionContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
    recordVideo: {
      dir: path.resolve(__dirname, '../reports/visual/videos'),
      size: { width: 1440, height: 900 }
    }
  })
  const heroMotionPage = await heroMotionContext.newPage()
  await heroMotionPage.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  // Gentle mouse moves across hero
  for (let i = 0; i < 20; i++) {
    const x = 720 + Math.sin(i * 0.3) * 200
    const y = 450 + Math.cos(i * 0.3) * 100
    await heroMotionPage.mouse.move(x, y)
    await heroMotionPage.waitForTimeout(200)
  }
  await heroMotionContext.close()
  console.log('✓ Hero motion video recorded')

  await browser.close()
  console.log('All visual captures completed!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
