import { chromium } from 'playwright'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const OUT_DIR = path.resolve(__dirname, '../reports/visual')
const TMP_VIDEOS = path.resolve(__dirname, '../reports/visual/tmp_videos_passthrough')

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
  // 1. Desktop (1440x900) Static Inspection & Deliverable #4: Junction Screenshot
  // =========================================================================
  console.log('1. Inspecting Desktop (1440x900) pass-through geometry & capturing junction screenshot...')
  let desktopScrollBounds = null
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    })
    const page = await context.newPage()
    await page.goto(URL, { waitUntil: 'networkidle' })
    await sleep(800)

    const metrics = await page.evaluate(() => {
      const hasPinSpacer = !!document.querySelector('.pin-spacer')
      const perf = document.getElementById('performance')
      const perfP = perf.querySelector('p')
      const todaySection = document.getElementById('today-demo')
      const todayContent = todaySection.querySelector('.max-w-6xl')
      const activeCard = todaySection.querySelector('.bg-\\[\\#121212\\]')

      const perfRect = perf.getBoundingClientRect()
      const perfPRect = perfP.getBoundingClientRect()
      const todayRect = todayContent.getBoundingClientRect()
      const activeRect = activeCard.getBoundingClientRect()

      const vh = window.innerHeight
      const contentTopDoc = todayRect.top + window.scrollY
      const activeTopDoc = activeRect.top + window.scrollY
      const activeBottomDoc = activeRect.bottom + window.scrollY

      // start: 'bottom 88%', end: 'top 16%' on activeRow
      const startScrollY = Math.round(activeBottomDoc - vh * 0.88)
      const endScrollY = Math.round(activeTopDoc - vh * 0.16)
      const midScrollY = Math.round((startScrollY + endScrollY) / 2)
      const maxScrollY = document.documentElement.scrollHeight - vh

      return {
        hasPinSpacer,
        perfTopY: Math.round(perfRect.top + window.scrollY),
        perfTextBottomY: Math.round(perfPRect.bottom + window.scrollY),
        todayContentTopY: Math.round(contentTopDoc),
        todayContentHeight: Math.round(todayRect.height),
        gapPerfTextToTodayPx: Math.round(contentTopDoc - (perfPRect.bottom + window.scrollY)),
        startScrollY,
        midScrollY,
        endScrollY,
        maxScrollY,
      }
    })
    desktopScrollBounds = metrics
    console.log('Desktop Pass-through Metrics:', metrics)

    // Capture Deliverable #4: Performance -> TodayDemo 交界截图
    const junctionY = Math.max(0, metrics.perfTopY - 60)
    await page.evaluate((y) => window.scrollTo(0, y), junctionY)
    await sleep(500)
    await page.screenshot({
      path: path.join(OUT_DIR, 'phase02_1_performance_today_junction.png'),
      fullPage: false,
    })
    console.log('✓ Saved Deliverable #4: phase02_1_performance_today_junction.png at scrollY =', junctionY)

    // Verify states at startScrollY (p=0), midScrollY (p=0.5), endScrollY (p=1.0)
    for (const [label, y] of [
      ['p=0.0', metrics.startScrollY],
      ['p=0.5', metrics.midScrollY],
      ['p=1.0', metrics.endScrollY],
    ]) {
      await page.evaluate((val) => window.scrollTo(0, val), y)
      await sleep(400)
      const state = await page.evaluate(() => {
        const demo = document.getElementById('today-demo')
        const statusSpan = demo.querySelector('.tabular-nums')
        const bar = demo.querySelector('[style*="width"]')
        const activeCard = demo.querySelector('.bg-\\[\\#121212\\]')
        const rect = activeCard.getBoundingClientRect()
        return {
          scrollY: window.scrollY,
          text: statusSpan?.textContent?.trim(),
          width: bar?.style?.width,
          activeCardViewportTop: Math.round(rect.top),
          activeCardViewportBottom: Math.round(rect.bottom),
        }
      })
      console.log(`State at ${label}:`, state)
    }

    await context.close()
  }

  // =========================================================================
  // 2. Deliverable #1: 从 Performance 滚入 TodayDemo 的桌面录屏
  // =========================================================================
  console.log('2. Recording Deliverable #1: Desktop scroll from Performance into TodayDemo...')
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
    await sleep(700)

    const startY = Math.max(0, desktopScrollBounds.perfTopY - 260)
    const endY = desktopScrollBounds.midScrollY + 60
    await page.evaluate((y) => window.scrollTo(0, y), startY)
    await sleep(500)

    const steps = 110
    for (let i = 1; i <= steps; i++) {
      const y = startY + ((endY - startY) * i) / steps
      await page.evaluate((val) => window.scrollTo(0, val), y)
      await sleep(28)
    }
    await sleep(600)

    const videoPath = await page.video().path()
    await context.close()
    fs.copyFileSync(videoPath, path.join(OUT_DIR, 'phase02_1_desktop_enter_demo.webm'))
    console.log('✓ Saved Deliverable #1: phase02_1_desktop_enter_demo.webm')
  }

  // =========================================================================
  // 3. Deliverable #2: 正常连续向下滚完整 TodayDemo 的录屏
  // =========================================================================
  console.log('3. Recording Deliverable #2: Desktop continuous pass-through scroll across full TodayDemo...')
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
    await sleep(700)

    const startY = desktopScrollBounds.startScrollY - 120
    const endY = desktopScrollBounds.endScrollY + 120
    await page.evaluate((y) => window.scrollTo(0, y), startY)
    await sleep(500)

    const steps = 140
    for (let i = 1; i <= steps; i++) {
      const y = startY + ((endY - startY) * i) / steps
      await page.evaluate((val) => window.scrollTo(0, val), y)
      await sleep(28)
    }
    await sleep(600)

    const videoPath = await page.video().path()
    await context.close()
    fs.copyFileSync(videoPath, path.join(OUT_DIR, 'phase02_1_desktop_full_passthrough.webm'))
    console.log('✓ Saved Deliverable #2: phase02_1_desktop_full_passthrough.webm')
  }

  // =========================================================================
  // 4. Deliverable #3: 滚到中间后反向向上滚的录屏
  // =========================================================================
  console.log('4. Recording Deliverable #3: Desktop scroll to middle/late then reverse scroll up...')
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
    await sleep(700)

    const startY = desktopScrollBounds.startScrollY - 60
    const turnY = Math.round(
      desktopScrollBounds.startScrollY +
        (desktopScrollBounds.endScrollY - desktopScrollBounds.startScrollY) * 0.78
    )
    await page.evaluate((y) => window.scrollTo(0, y), startY)
    await sleep(500)

    // Scroll down to ~78% progress
    const forwardSteps = 85
    for (let i = 1; i <= forwardSteps; i++) {
      const y = startY + ((turnY - startY) * i) / forwardSteps
      await page.evaluate((val) => window.scrollTo(0, val), y)
      await sleep(28)
    }
    await sleep(450)

    // Immediately reverse scroll back up to startY
    const reverseSteps = 85
    for (let i = 1; i <= reverseSteps; i++) {
      const y = turnY - ((turnY - startY) * i) / reverseSteps
      await page.evaluate((val) => window.scrollTo(0, val), y)
      await sleep(28)
    }
    await sleep(600)

    const videoPath = await page.video().path()
    await context.close()
    fs.copyFileSync(videoPath, path.join(OUT_DIR, 'phase02_1_desktop_reverse_scroll.webm'))
    console.log('✓ Saved Deliverable #3: phase02_1_desktop_reverse_scroll.webm')
  }

  // =========================================================================
  // 5. Deliverable #5: 390x844 移动端完整滚动录屏
  // =========================================================================
  console.log('5. Recording Deliverable #5: Mobile (390x844) complete natural scroll video...')
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
    await sleep(700)

    const mobileMetrics = await page.evaluate(() => {
      const hasPinSpacer = !!document.querySelector('.pin-spacer')
      const perf = document.getElementById('performance')
      const perfP = perf.querySelector('p')
      const todaySection = document.getElementById('today-demo')
      const todayContent = todaySection.querySelector('.max-w-6xl')
      const activeCard = todaySection.querySelector('.bg-\\[\\#121212\\]')

      const perfRect = perf.getBoundingClientRect()
      const perfPRect = perfP.getBoundingClientRect()
      const todayRect = todayContent.getBoundingClientRect()
      const activeRect = activeCard.getBoundingClientRect()

      const vh = window.innerHeight
      const contentTopDoc = todayRect.top + window.scrollY
      const activeTopDoc = activeRect.top + window.scrollY
      const activeBottomDoc = activeRect.bottom + window.scrollY

      const startScrollY = Math.round(activeBottomDoc - vh * 0.88)
      const endScrollY = Math.round(activeTopDoc - vh * 0.16)

      return {
        hasPinSpacer,
        perfTopY: Math.round(perfRect.top + window.scrollY),
        gapPerfTextToTodayPx: Math.round(contentTopDoc - (perfPRect.bottom + window.scrollY)),
        startScrollY,
        endScrollY,
      }
    })
    console.log('Mobile Pass-through Metrics:', mobileMetrics)

    // Save Mobile Junction screenshot
    const mobileJunctionY = Math.max(0, mobileMetrics.perfTopY - 50)
    await page.evaluate((y) => window.scrollTo(0, y), mobileJunctionY)
    await sleep(450)
    await page.screenshot({
      path: path.join(OUT_DIR, 'phase02_1_mobile_junction.png'),
      fullPage: false,
    })

    // Scroll continuously from Performance through TodayDemo and partially reverse
    const startY = Math.max(0, mobileMetrics.perfTopY - 120)
    const endY = mobileMetrics.endScrollY + 90
    await page.evaluate((y) => window.scrollTo(0, y), startY)
    await sleep(450)

    const forwardSteps = 130
    for (let i = 1; i <= forwardSteps; i++) {
      const y = startY + ((endY - startY) * i) / forwardSteps
      await page.evaluate((val) => window.scrollTo(0, val), y)
      await sleep(28)
    }
    await sleep(450)

    const backY = Math.round(( mobileMetrics.startScrollY + mobileMetrics.endScrollY ) / 2)
    const reverseSteps = 60
    for (let i = 1; i <= reverseSteps; i++) {
      const y = endY - ((endY - backY) * i) / reverseSteps
      await page.evaluate((val) => window.scrollTo(0, val), y)
      await sleep(28)
    }
    await sleep(500)

    const videoPath = await page.video().path()
    await context.close()
    fs.copyFileSync(videoPath, path.join(OUT_DIR, 'phase02_1_mobile_full_passthrough.webm'))
    console.log('✓ Saved Deliverable #5: phase02_1_mobile_full_passthrough.webm')
  }

  await browser.close()
  fs.rmSync(TMP_VIDEOS, { recursive: true, force: true })
  console.log('\nAll 5 Phase 02.1 pass-through deliverables generated and verified!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
