import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.resolve(__dirname, '../reports/visual')
const videosDir = path.join(outputDir, 'videos')

fs.mkdirSync(outputDir, { recursive: true })
fs.mkdirSync(videosDir, { recursive: true })

async function run() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle']
  })

  const results = []

  // Viewports to test
  const viewports = [
    { width: 1366, height: 768, name: '01_desktop_hero_1366x768.png', isMobile: false },
    { width: 1440, height: 900, name: '02_desktop_hero_1440x900.png', isMobile: false },
    { width: 1920, height: 1080, name: '03_desktop_hero_1920x1080.png', isMobile: false },
    { width: 390, height: 844, name: '04_mobile_hero_390x844.png', isMobile: true }
  ]

  for (const vp of viewports) {
    console.log(`Testing viewport ${vp.width}x${vp.height}...`)
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile
    })
    const page = await ctx.newPage()
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2500)

    // Measure Card Top Y
    const measurements = await page.evaluate(() => {
      const todayImg = document.querySelector('img[alt="今日"]')
      const cardContainer = todayImg ? todayImg.parentElement : null
      const cardRect = cardContainer ? cardContainer.getBoundingClientRect() : null
      return {
        cardTopY: cardRect ? cardRect.top : 0,
        viewportHeight: window.innerHeight
      }
    })

    const ratio = (measurements.cardTopY / measurements.viewportHeight) * 100
    results.push({
      width: vp.width,
      height: vp.height,
      cardTopY: Math.round(measurements.cardTopY),
      viewportHeight: measurements.viewportHeight,
      ratio: ratio.toFixed(2) + '%'
    })

    // Screenshot un-scrolled Hero
    await page.screenshot({
      path: path.join(outputDir, vp.name),
      fullPage: false
    })
    console.log(`✓ Saved ${vp.name}: Card Top Y = ${Math.round(measurements.cardTopY)}px, Ratio = ${ratio.toFixed(2)}%`)

    await ctx.close()
  }

  // Header Scroll Transition Test (1440x900)
  console.log('Testing Header Dual-State Transition (1440x900)...')
  const headerContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: videosDir,
      size: { width: 1440, height: 900 }
    }
  })
  const headerPage = await headerContext.newPage()
  await headerPage.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  await headerPage.waitForTimeout(2500)

  // 1. Screenshot at scrollY = 0 (Transparent Header)
  await headerPage.screenshot({
    path: path.join(outputDir, 'header_top_transparent_1440x900.png'),
    fullPage: false
  })
  console.log('✓ Saved header_top_transparent_1440x900.png')

  // Wait 2s at top for video
  await headerPage.waitForTimeout(2000)

  // 2. Scroll down with mouse wheel past 16px threshold
  await headerPage.mouse.wheel(0, 250)
  await headerPage.waitForTimeout(800)

  // Screenshot at scrolled position (Solid White Header)
  await headerPage.screenshot({
    path: path.join(outputDir, 'header_scrolled_solid_1440x900.png'),
    fullPage: false
  })
  console.log('✓ Saved header_scrolled_solid_1440x900.png')

  // Pause at scrolled position for 1.5s
  await headerPage.waitForTimeout(1500)

  // 3. Scroll back to top
  await headerPage.mouse.wheel(0, -250)
  await headerPage.waitForTimeout(1200)

  const headerVideo = await headerPage.video()?.path()
  await headerContext.close()
  if (headerVideo && fs.existsSync(headerVideo)) {
    fs.copyFileSync(headerVideo, path.join(outputDir, 'header_scroll_transition.webm'))
    console.log('✓ Saved header_scroll_transition.webm')
  }

  await browser.close()

  console.log('\n=== MEASUREMENT SUMMARY ===')
  console.table(results)
  fs.writeFileSync(
    path.join(outputDir, 'ratio_measurements.json'),
    JSON.stringify(results, null, 2)
  )
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
