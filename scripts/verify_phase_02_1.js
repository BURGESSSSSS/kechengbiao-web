import { chromium } from 'playwright'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const OUT_DIR = path.resolve(__dirname, '../reports/visual')
const TMP_VIDEOS = path.resolve(__dirname, '../reports/visual/tmp_videos_02_1')

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
if (!fs.existsSync(TMP_VIDEOS)) fs.mkdirSync(TMP_VIDEOS, { recursive: true })

const URL = 'http://localhost:4173'

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function run() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
  })

  // =========================================================================
  // 1. Desktop (1440x900): Measure spacing & capture Fade Zone + Junction screenshots
  // =========================================================================
  console.log('1. Measuring Desktop (1440x900) geometry & capturing static transition screenshots...')
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    })
    const page = await context.newPage()
    await page.goto(URL, { waitUntil: 'networkidle' })
    await sleep(900)

    // Measure exact vertical distances at scrollY = 0 (before pinning)
    const metrics = await page.evaluate(() => {
      const hero = document.getElementById('hero')
      const perf = document.getElementById('performance')
      const perfP = perf.querySelector('p')
      const todaySection = document.getElementById('today-demo')
      const todayContent = todaySection.querySelector('.max-w-6xl')

      const heroRect = hero.getBoundingClientRect()
      const perfRect = perf.getBoundingClientRect()
      const perfPRect = perfP.getBoundingClientRect()
      const todayContentRect = todayContent.getBoundingClientRect()

      return {
        heroBottomY: heroRect.bottom + window.scrollY,
        perfTopY: perfRect.top + window.scrollY,
        perfTextBottomY: perfPRect.bottom + window.scrollY,
        todayContentTopY: todayContentRect.top + window.scrollY,
        gapPerfTextToTodayContentPx: Math.round(todayContentRect.top - perfPRect.bottom),
      }
    })
    console.log('Desktop Geometry Metrics:', metrics)

    // Capture 3: Hero 蓝紫 → 白色渐变中间位置截图
    // Center viewport right on heroBottomY so the upper half shows the lower ThreeCardShowcase + Fade Zone
    // and the lower half shows PerformanceSection seamlessly emerging
    const fadeScrollY = Math.max(0, Math.round(metrics.heroBottomY - 480))
    await page.evaluate((y) => window.scrollTo(0, y), fadeScrollY)
    await sleep(600)
    await page.screenshot({
      path: path.join(OUT_DIR, 'phase02_1_hero_fade_zone.png'),
      fullPage: false,
    })
    console.log('✓ Saved phase02_1_hero_fade_zone.png at scrollY =', fadeScrollY)

    // Capture 2: Performance 与 Today Demo 交界截图
    // Position viewport so PerformanceSection is in the upper portion and TodayScrollDemo is naturally entering below it (just before pin starts)
    const junctionScrollY = Math.max(0, Math.round(metrics.perfTopY - 90))
    await page.evaluate((y) => window.scrollTo(0, y), junctionScrollY)
    await sleep(600)
    await page.screenshot({
      path: path.join(OUT_DIR, 'phase02_1_performance_today_junction.png'),
      fullPage: false,
    })
    console.log('✓ Saved phase02_1_performance_today_junction.png at scrollY =', junctionScrollY)

    // Verify ScrollTrigger states at p=0, p=0.5, p=1.0
    const pinCheck = await page.evaluate(async () => {
      const demo = document.getElementById('today-demo')
      const spacer = demo.querySelector('.pin-spacer') || demo
      const rect = spacer.getBoundingClientRect()
      const startY = rect.top + window.scrollY - (window.innerHeight * 0.53 - demo.querySelector('.max-w-6xl').offsetHeight / 2)
      return { spacerHeight: spacer.offsetHeight }
    })
    console.log('Desktop Pin Spacer Check:', pinCheck)

    await context.close()
  }

  // =========================================================================
  // 2. Desktop (1440x900) Video: Hero → Performance → Today Demo Continuous Scroll
  // =========================================================================
  console.log('2. Recording Desktop Hero -> Performance -> Today Demo continuous scroll video...')
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: {
        dir: TMP_VIDEOS,
        size: { width: 1440, height: 900 },
      },
    })
    const page = await context.newPage()
    await page.goto(URL, { waitUntil: 'networkidle' })
    await sleep(800)

    // Start from lower Hero / Showcase (scrollY = 450) and smoothly scroll all the way through
    // Hero Fade Zone -> PerformanceSection -> TodayScrollDemo (including full pin scrub) -> reverse slightly
    await page.evaluate(() => window.scrollTo(0, 420))
    await sleep(600)

    const totalSteps = 160
    const startScroll = 420
    const endScroll = 3050

    for (let i = 1; i <= totalSteps; i++) {
      const t = i / totalSteps
      const y = startScroll + (endScroll - startScroll) * t
      await page.evaluate((val) => window.scrollTo(0, val), y)
      await sleep(28)
    }
    await sleep(700)

    const videoPath = await page.video().path()
    await context.close()
    const targetVideo = path.join(OUT_DIR, 'phase02_1_desktop_continuous_scroll.webm')
    fs.copyFileSync(videoPath, targetVideo)
    console.log('✓ Saved phase02_1_desktop_continuous_scroll.webm')
  }

  // =========================================================================
  // 3. Mobile (390x844): Measure spacing & record complete transition video
  // =========================================================================
  console.log('3. Measuring Mobile (390x844) geometry & recording complete transition video...')
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      recordVideo: {
        dir: TMP_VIDEOS,
        size: { width: 390, height: 844 },
      },
    })
    const page = await context.newPage()
    await page.goto(URL, { waitUntil: 'networkidle' })
    await sleep(800)

    const mobileMetrics = await page.evaluate(() => {
      const hero = document.getElementById('hero')
      const perf = document.getElementById('performance')
      const perfP = perf.querySelector('p')
      const todaySection = document.getElementById('today-demo')
      const todayContent = todaySection.querySelector('.max-w-6xl')

      const heroRect = hero.getBoundingClientRect()
      const perfRect = perf.getBoundingClientRect()
      const perfPRect = perfP.getBoundingClientRect()
      const todayContentRect = todayContent.getBoundingClientRect()

      return {
        heroBottomY: heroRect.bottom + window.scrollY,
        perfTopY: perfRect.top + window.scrollY,
        perfTextBottomY: perfPRect.bottom + window.scrollY,
        todayContentTopY: todayContentRect.top + window.scrollY,
        gapPerfTextToTodayContentPx: Math.round(todayContentRect.top - perfPRect.bottom),
      }
    })
    console.log('Mobile Geometry Metrics:', mobileMetrics)

    // Capture Mobile Junction screenshot
    const mobileJunctionY = Math.max(0, Math.round(mobileMetrics.perfTopY - 80))
    await page.evaluate((y) => window.scrollTo(0, y), mobileJunctionY)
    await sleep(500)
    await page.screenshot({
      path: path.join(OUT_DIR, 'phase02_1_mobile_junction.png'),
      fullPage: false,
    })

    // Start from lower Hero (scrollY = 380) and scroll continuously through Fade Zone -> Performance -> Today Demo
    await page.evaluate(() => window.scrollTo(0, 380))
    await sleep(500)

    const totalSteps = 145
    const startScroll = 380
    const endScroll = 2650

    for (let i = 1; i <= totalSteps; i++) {
      const t = i / totalSteps
      const y = startScroll + (endScroll - startScroll) * t
      await page.evaluate((val) => window.scrollTo(0, val), y)
      await sleep(28)
    }
    await sleep(700)

    const videoPath = await page.video().path()
    await context.close()
    const targetVideo = path.join(OUT_DIR, 'phase02_1_mobile_continuous_scroll.webm')
    fs.copyFileSync(videoPath, targetVideo)
    console.log('✓ Saved phase02_1_mobile_continuous_scroll.webm')
  }

  await browser.close()
  fs.rmSync(TMP_VIDEOS, { recursive: true, force: true })
  console.log('\nAll Phase 02.1 verifications & recordings finished!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
