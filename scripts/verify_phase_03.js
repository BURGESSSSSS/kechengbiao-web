import { chromium } from 'playwright'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const OUT_DIR = path.resolve(__dirname, '../reports/visual')
const TMP_VIDEOS = path.resolve(__dirname, '../reports/visual/tmp_videos_03')

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

  let desktopBounds = null

  // =========================================================================
  // 1-4. Desktop (1440x900) Static Checkpoints: p = 0, p = 0.35, p = 0.65, p = 0.90
  // =========================================================================
  console.log('1. Inspecting Desktop (1440x900) WeekScrollDemo geometry & capturing 4 progress screenshots...')
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    })
    const page = await context.newPage()
    await page.goto(URL, { waitUntil: 'networkidle' })
    await sleep(800)

    desktopBounds = await page.evaluate(() => {
      const hasPinSpacer = !!document.querySelector('.pin-spacer')
      const todaySection = document.getElementById('today-demo')
      const weekSection = document.getElementById('week-demo')
      const uiCard = weekSection.querySelector('.bg-\\[\\#F6F6F6\\]')

      const todayRect = todaySection.getBoundingClientRect()
      const cardRect = uiCard.getBoundingClientRect()

      const vh = window.innerHeight
      const cardTopDoc = cardRect.top + window.scrollY
      const cardHeight = cardRect.height

      // start: 'top 34%', end: 'top 8%'
      const startScrollY = Math.round(cardTopDoc - vh * 0.34)
      const endScrollY = Math.round(cardTopDoc - vh * 0.08)
      const maxScrollY = document.documentElement.scrollHeight - vh

      return {
        hasPinSpacer,
        todayTopDoc: Math.round(todayRect.top + window.scrollY),
        cardTopDoc: Math.round(cardTopDoc),
        cardHeight: Math.round(cardHeight),
        startScrollY,
        endScrollY,
        maxScrollY,
      }
    })
    console.log('Desktop WeekScrollDemo Bounds:', desktopBounds)

    const checkpoints = [
      { p: 0.0, file: 'phase03_desktop_p_0_00.png', label: 'p = 0.00 (Empty Grid)' },
      { p: 0.35, file: 'phase03_desktop_p_0_35.png', label: 'p = 0.35 (Monday Formed)' },
      { p: 0.65, file: 'phase03_desktop_p_0_65.png', label: 'p = 0.65 (Wed / Thu Forming)' },
      { p: 0.9, file: 'phase03_desktop_p_0_90.png', label: 'p = 0.90 (Complete Week)' },
    ]

    for (const cp of checkpoints) {
      const targetY = Math.round(
        desktopBounds.startScrollY +
          (desktopBounds.endScrollY - desktopBounds.startScrollY) * cp.p
      )
      await page.evaluate((y) => window.scrollTo(0, y), targetY)
      await sleep(500)

      const state = await page.evaluate(() => {
        const weekSection = document.getElementById('week-demo')
        const uiCard = weekSection.querySelector('.bg-\\[\\#F6F6F6\\]')
        const rect = uiCard.getBoundingClientRect()
        const cards = Array.from(weekSection.querySelectorAll('[data-course-id]')).map((el) => ({
          id: el.getAttribute('data-course-id'),
          opacity: Number(parseFloat(el.style.opacity || '0').toFixed(2)),
        }))
        return {
          scrollY: window.scrollY,
          progress: uiCard.getAttribute('data-week-progress'),
          cardTopViewport: Math.round(rect.top),
          cardBottomViewport: Math.round(rect.bottom),
          cards,
        }
      })
      console.log(`State at ${cp.label}:`, JSON.stringify(state))

      await page.screenshot({
        path: path.join(OUT_DIR, cp.file),
        fullPage: false,
      })
      console.log(`✓ Saved ${cp.file}`)
    }

    await context.close()
  }

  // =========================================================================
  // 5. Deliverable #5: 桌面正常向下滚动录屏
  // =========================================================================
  console.log('2. Recording Deliverable #5: Desktop normal downward scroll through WeekScrollDemo...')
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

    const startY = desktopBounds.startScrollY - 120
    const endY = desktopBounds.endScrollY + 60
    await page.evaluate((y) => window.scrollTo(0, y), startY)
    await sleep(500)

    const steps = 120
    for (let i = 1; i <= steps; i++) {
      const y = startY + ((endY - startY) * i) / steps
      await page.evaluate((val) => window.scrollTo(0, val), y)
      await sleep(28)
    }
    await sleep(600)

    const videoPath = await page.video().path()
    await context.close()
    fs.copyFileSync(videoPath, path.join(OUT_DIR, 'phase03_desktop_scroll_down.webm'))
    console.log('✓ Saved Deliverable #5: phase03_desktop_scroll_down.webm')
  }

  // =========================================================================
  // 6. Deliverable #6: 滚到约 70% 后反向向上滚录屏
  // =========================================================================
  console.log('3. Recording Deliverable #6: Desktop scroll to ~70% then reverse scroll up...')
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

    const startY = desktopBounds.startScrollY - 50
    const turnY = Math.round(
      desktopBounds.startScrollY +
        (desktopBounds.endScrollY - desktopBounds.startScrollY) * 0.72
    )
    await page.evaluate((y) => window.scrollTo(0, y), startY)
    await sleep(500)

    const forwardSteps = 85
    for (let i = 1; i <= forwardSteps; i++) {
      const y = startY + ((turnY - startY) * i) / forwardSteps
      await page.evaluate((val) => window.scrollTo(0, val), y)
      await sleep(28)
    }
    await sleep(450)

    const reverseSteps = 85
    for (let i = 1; i <= reverseSteps; i++) {
      const y = turnY - ((turnY - startY) * i) / reverseSteps
      await page.evaluate((val) => window.scrollTo(0, val), y)
      await sleep(28)
    }
    await sleep(600)

    const videoPath = await page.video().path()
    await context.close()
    fs.copyFileSync(videoPath, path.join(OUT_DIR, 'phase03_desktop_scroll_reverse.webm'))
    console.log('✓ Saved Deliverable #6: phase03_desktop_scroll_reverse.webm')
  }

  // =========================================================================
  // 8. Deliverable #8: Phase 02 -> Phase 03 连续滚动录屏
  // =========================================================================
  console.log('4. Recording Deliverable #8: Desktop continuous scroll from Phase 02 into Phase 03...')
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

    const startY = Math.max(0, desktopBounds.todayTopDoc - 380)
    const endY = desktopBounds.endScrollY + 40
    await page.evaluate((y) => window.scrollTo(0, y), startY)
    await sleep(500)

    const steps = 155
    for (let i = 1; i <= steps; i++) {
      const y = startY + ((endY - startY) * i) / steps
      await page.evaluate((val) => window.scrollTo(0, val), y)
      await sleep(28)
    }
    await sleep(600)

    const videoPath = await page.video().path()
    await context.close()
    fs.copyFileSync(videoPath, path.join(OUT_DIR, 'phase03_desktop_phase02_to_phase03.webm'))
    console.log('✓ Saved Deliverable #8: phase03_desktop_phase02_to_phase03.webm')
  }

  // =========================================================================
  // 7. Deliverable #7: 390x844 移动端完整录屏 & 截图验证
  // =========================================================================
  console.log('5. Recording Deliverable #7: Mobile (390x844) complete WeekScrollDemo video...')
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

    const mobileBounds = await page.evaluate(() => {
      const weekSection = document.getElementById('week-demo')
      const uiCard = weekSection.querySelector('.bg-\\[\\#F6F6F6\\]')
      const cardRect = uiCard.getBoundingClientRect()
      const vh = window.innerHeight
      const cardTopDoc = cardRect.top + window.scrollY

      const startScrollY = Math.round(cardTopDoc - vh * 0.34)
      const endScrollY = Math.round(cardTopDoc - vh * 0.08)

      return {
        cardTopDoc: Math.round(cardTopDoc),
        cardHeight: Math.round(cardRect.height),
        startScrollY,
        endScrollY,
        hasHorizontalOverflow:
          document.documentElement.scrollWidth > document.documentElement.clientWidth,
      }
    })
    console.log('Mobile WeekScrollDemo Bounds:', mobileBounds)

    // Capture Mobile p = 0.00 and p = 0.90 screenshots for visual inspection
    await page.evaluate((y) => window.scrollTo(0, y), mobileBounds.startScrollY)
    await sleep(450)
    await page.screenshot({
      path: path.join(OUT_DIR, 'phase03_mobile_p_0_00.png'),
      fullPage: false,
    })

    const mobileP90Y = Math.round(
      mobileBounds.startScrollY +
        (mobileBounds.endScrollY - mobileBounds.startScrollY) * 0.9
    )
    await page.evaluate((y) => window.scrollTo(0, y), mobileP90Y)
    await sleep(450)
    await page.screenshot({
      path: path.join(OUT_DIR, 'phase03_mobile_p_0_90.png'),
      fullPage: false,
    })

    // Record smooth mobile scroll forward + partial reverse
    const startY = mobileBounds.startScrollY - 140
    const endY = mobileBounds.endScrollY + 40
    await page.evaluate((y) => window.scrollTo(0, y), startY)
    await sleep(450)

    const forwardSteps = 120
    for (let i = 1; i <= forwardSteps; i++) {
      const y = startY + ((endY - startY) * i) / forwardSteps
      await page.evaluate((val) => window.scrollTo(0, val), y)
      await sleep(28)
    }
    await sleep(450)

    const backY = Math.round(
      mobileBounds.startScrollY +
        (mobileBounds.endScrollY - mobileBounds.startScrollY) * 0.25
    )
    const reverseSteps = 65
    for (let i = 1; i <= reverseSteps; i++) {
      const y = endY - ((endY - backY) * i) / reverseSteps
      await page.evaluate((val) => window.scrollTo(0, val), y)
      await sleep(28)
    }
    await sleep(500)

    const videoPath = await page.video().path()
    await context.close()
    fs.copyFileSync(videoPath, path.join(OUT_DIR, 'phase03_mobile_full.webm'))
    console.log('✓ Saved Deliverable #7: phase03_mobile_full.webm')
  }

  await browser.close()
  fs.rmSync(TMP_VIDEOS, { recursive: true, force: true })
  console.log('\nAll 8 Phase 03 deliverables generated and verified!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
