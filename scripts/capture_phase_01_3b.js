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

  // 1. Static Hero Screenshots & Ratios across standard resolutions
  const viewports = [
    { width: 1440, height: 900, name: '02_desktop_hero_1440x900.png', isMobile: false },
    { width: 390, height: 844, name: '04_mobile_hero_390x844.png', isMobile: true },
    { width: 1366, height: 768, name: '01_desktop_hero_1366x768.png', isMobile: false },
    { width: 1920, height: 1080, name: '03_desktop_hero_1920x1080.png', isMobile: false }
  ]

  const results = []

  for (const vp of viewports) {
    console.log(`Capturing viewport ${vp.width}x${vp.height}...`)
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile
    })
    const page = await ctx.newPage()
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

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

    await page.screenshot({
      path: path.join(outputDir, vp.name),
      fullPage: false
    })
    console.log(`✓ Saved ${vp.name} (Card Top Y = ${Math.round(measurements.cardTopY)}px, Ratio = ${ratio.toFixed(2)}%)`)

    await ctx.close()
  }

  // 2. Hero Background Living Motion Video (1440x900, top unscrolled, 8.5 seconds still observation)
  console.log('Recording Hero Background Motion (1440x900, 8s still observation)...')
  const motionCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: videosDir,
      size: { width: 1440, height: 900 }
    }
  })
  const motionPage = await motionCtx.newPage()
  await motionPage.goto('http://localhost:4173', { waitUntil: 'networkidle' })
  // Record living ambient shader motion for 8.5 seconds of calm still observation
  await motionPage.waitForTimeout(8500)
  const motionVideo = await motionPage.video()?.path()
  await motionCtx.close()
  if (motionVideo && fs.existsSync(motionVideo)) {
    fs.copyFileSync(motionVideo, path.join(outputDir, 'hero_background_motion.webm'))
    fs.copyFileSync(motionVideo, path.join(outputDir, 'hero_background_8s_still.webm'))
    console.log('✓ Saved hero_background_motion.webm and hero_background_8s_still.webm')
  }

  // 3. Header Dual-State Transition Video & Scrolled Screenshot
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
  await headerPage.waitForTimeout(2000)

  // Verify and record top transparent state
  const topBg = await headerPage.evaluate(() =>
    window.getComputedStyle(document.querySelector('header')).backgroundColor
  )
  console.log(`Header at scrollY=0 background: ${topBg}`)
  await headerPage.screenshot({
    path: path.join(outputDir, 'header_top_transparent_1440x900.png'),
    fullPage: false
  })
  console.log('✓ Saved header_top_transparent_1440x900.png')

  // Pause at top for video
  await headerPage.waitForTimeout(1500)

  // Scroll down ~35px (past 16px threshold)
  await headerPage.evaluate(() => window.scrollTo(0, 35))
  await headerPage.waitForTimeout(600)

  const scrolledBg = await headerPage.evaluate(() =>
    window.getComputedStyle(document.querySelector('header')).backgroundColor
  )
  console.log(`Header at scrollY=35 background: ${scrolledBg}`)

  // Screenshot at scrollY = 35 (Solid White Header)
  await headerPage.screenshot({
    path: path.join(outputDir, 'header_scrolled_solid_1440x900.png'),
    fullPage: false
  })
  console.log('✓ Saved header_scrolled_solid_1440x900.png')

  // Pause at scrolled position for video
  await headerPage.waitForTimeout(1500)

  // Scroll back to top
  await headerPage.evaluate(() => window.scrollTo(0, 0))
  await headerPage.waitForTimeout(1500)

  const returnBg = await headerPage.evaluate(() =>
    window.getComputedStyle(document.querySelector('header')).backgroundColor
  )
  console.log(`Header returned to top background: ${returnBg}`)

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
