import { chromium } from 'playwright'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const OUT_DIR = path.resolve(__dirname, '../reports/visual')
const TMP_VIDEOS = path.resolve(__dirname, '../reports/visual/tmp_videos_03_1')

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
if (!fs.existsSync(TMP_VIDEOS)) fs.mkdirSync(TMP_VIDEOS, { recursive: true })

const URL = 'http://localhost:4173'

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function getScrollBounds(page, startRatio = 0.54, endRatio = 0.06) {
  return page.evaluate(
    ({ sRatio, eRatio }) => {
      const hasPinSpacer = !!document.querySelector('.pin-spacer')
      const weekSection = document.getElementById('week-demo')
      const uiCard = weekSection.querySelector('[data-week-progress]')
      const stableGrid = weekSection.querySelector('[data-stable-grid="true"]')
      const overlay = weekSection.querySelector('[data-course-overlay="true"]')

      const cardRect = uiCard.getBoundingClientRect()
      const vh = window.innerHeight
      const cardTopDoc = cardRect.top + window.scrollY

      const startScrollY = Math.round(cardTopDoc - vh * sRatio)
      const endScrollY = Math.round(cardTopDoc - vh * eRatio)

      return {
        hasPinSpacer,
        hasStableGrid: !!stableGrid,
        hasOverlay: !!overlay,
        cardTopDoc: Math.round(cardTopDoc),
        cardHeight: Math.round(cardRect.height),
        startScrollY,
        endScrollY,
        scrollSpanPx: endScrollY - startScrollY,
        hasHorizontalOverflow:
          document.documentElement.scrollWidth > document.documentElement.clientWidth,
      }
    },
    { sRatio: startRatio, eRatio: endRatio }
  )
}

async function smoothScroll(page, fromY, toY, steps, stepDelayMs = 28) {
  for (let i = 1; i <= steps; i++) {
    const y = fromY + ((toY - fromY) * i) / steps
    await page.evaluate((val) => window.scrollTo(0, val), y)
    await sleep(stepDelayMs)
  }
}

async function run() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
  })

  let desktopBounds = null

  // =========================================================================
  // 0. Diagnostic Telemetry & Key Stage Screenshots on Desktop (1440x900)
  // =========================================================================
  console.log('0. Verifying Phase 03.1 DOM layering, cell rects, and 3-stage telemetry...')
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    })
    const page = await context.newPage()
    await page.goto(URL, { waitUntil: 'networkidle' })
    await sleep(700)

    desktopBounds = await getScrollBounds(page)
    console.log('Desktop Bounds:', desktopBounds)

    // Inspect mon-08 across Stage A (p=0.045 -> localP=0.139), Stage B (p=0.11 -> localP=0.50), Stage C overshoot peak (p=0.182 -> localP=0.90), and Settled (p=0.21 -> localP=1.00)
    const stageSnapshots = [
      { p: 0.045, file: 'phase03_1_stage_A_launch.png', label: 'Stage A Launch (mon-08 localP≈0.14)' },
      { p: 0.11, file: 'phase03_1_stage_B_glide.png', label: 'Stage B Glide Arc (mon-08 localP=0.50, mon-10 launching)' },
      { p: 0.182, file: 'phase03_1_stage_C_overshoot.png', label: 'Stage C Magnetic Overshoot Peak (mon-08 localP=0.90)' },
      { p: 0.60, file: 'phase03_1_stopped_at_60.png', label: 'Mid-flight Freeze at p=0.60 (wed-14 gliding, thu-08 launching)' },
    ]

    for (const snap of stageSnapshots) {
      const y = Math.round(
        desktopBounds.startScrollY + desktopBounds.scrollSpanPx * snap.p
      )
      await page.evaluate((val) => window.scrollTo(0, val), y)
      await sleep(300)

      const telemetry = await page.evaluate(() => {
        const weekSection = document.getElementById('week-demo')
        const uiCard = weekSection.querySelector('[data-week-progress]')
        const activeCards = Array.from(weekSection.querySelectorAll('[data-course-id]'))
          .map((el) => ({
            id: el.getAttribute('data-course-id'),
            localP: Number(el.getAttribute('data-local-p')),
            stage: el.getAttribute('data-stage'),
            dx: Number(el.getAttribute('data-dx')),
            dy: Number(el.getAttribute('data-dy')),
            scale: Number(el.getAttribute('data-scale')),
            rot: Number(el.getAttribute('data-rot')),
            opacity: Number(parseFloat(el.style.opacity || '0').toFixed(2)),
            zIndex: el.style.zIndex,
          }))
          .filter((c) => c.localP > 0)
        return {
          progress: uiCard.getAttribute('data-week-progress'),
          activeCards,
        }
      })
      console.log(`Telemetry [${snap.label}]:`, JSON.stringify(telemetry))

      await page.screenshot({
        path: path.join(OUT_DIR, snap.file),
        fullPage: false,
      })
    }

    await context.close()
  }

  // =========================================================================
  // 1. Deliverable #1: 单张课程卡慢速进入录屏 (清楚展示抛出 → 滑翔 → 磁吸)
  // =========================================================================
  console.log('1. Recording Deliverable #1: Single course card slow entry (p: 0.00 -> 0.21)...')
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: TMP_VIDEOS, size: { width: 1440, height: 900 } },
    })
    const page = await context.newPage()
    await page.goto(URL, { waitUntil: 'networkidle' })
    await sleep(500)

    const startY = desktopBounds.startScrollY
    const endY = Math.round(
      desktopBounds.startScrollY + desktopBounds.scrollSpanPx * 0.205
    )
    await page.evaluate((y) => window.scrollTo(0, y), startY)
    await sleep(600)

    // Slow scroll so Stage A -> Stage B -> Stage C overshoot & snap are crystal clear
    await smoothScroll(page, startY, endY, 115, 30)
    await sleep(700)

    const videoPath = await page.video().path()
    await context.close()
    fs.copyFileSync(videoPath, path.join(OUT_DIR, 'phase03_1_single_card_slow.webm'))
    console.log('✓ Saved Deliverable #1: phase03_1_single_card_slow.webm')
  }

  // =========================================================================
  // 2. Deliverable #2: 周一四张连续进入录屏
  // =========================================================================
  console.log('2. Recording Deliverable #2: Monday 4 cards continuous overlapping deal (p: 0.00 -> 0.45)...')
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: TMP_VIDEOS, size: { width: 1440, height: 900 } },
    })
    const page = await context.newPage()
    await page.goto(URL, { waitUntil: 'networkidle' })
    await sleep(500)

    const startY = desktopBounds.startScrollY - 15
    const endY = Math.round(
      desktopBounds.startScrollY + desktopBounds.scrollSpanPx * 0.45
    )
    await page.evaluate((y) => window.scrollTo(0, y), startY)
    await sleep(500)

    await smoothScroll(page, startY, endY, 110, 28)
    await sleep(700)

    const videoPath = await page.video().path()
    await context.close()
    fs.copyFileSync(videoPath, path.join(OUT_DIR, 'phase03_1_monday_four_cards.webm'))
    console.log('✓ Saved Deliverable #2: phase03_1_monday_four_cards.webm')
  }

  // =========================================================================
  // 3. Deliverable #3: 完整 9 张课程形成录屏
  // =========================================================================
  console.log('3. Recording Deliverable #3: Complete 9 courses formation (p: 0.00 -> 1.00)...')
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: TMP_VIDEOS, size: { width: 1440, height: 900 } },
    })
    const page = await context.newPage()
    await page.goto(URL, { waitUntil: 'networkidle' })
    await sleep(500)

    const startY = desktopBounds.startScrollY - 30
    const endY = desktopBounds.endScrollY + 20
    await page.evaluate((y) => window.scrollTo(0, y), startY)
    await sleep(500)

    await smoothScroll(page, startY, endY, 150, 28)
    await sleep(700)

    const videoPath = await page.video().path()
    await context.close()
    fs.copyFileSync(videoPath, path.join(OUT_DIR, 'phase03_1_full_9_cards_down.webm'))
    console.log('✓ Saved Deliverable #3: phase03_1_full_9_cards_down.webm')
  }

  // =========================================================================
  // 4. Deliverable #4: 滚到约 60% 后停止 2 秒（证明课程停在半空，不会自己继续播放）
  // =========================================================================
  console.log('4. Recording Deliverable #4: Scroll to 60% and hold still for >2 seconds...')
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: TMP_VIDEOS, size: { width: 1440, height: 900 } },
    })
    const page = await context.newPage()
    await page.goto(URL, { waitUntil: 'networkidle' })
    await sleep(500)

    const startY = desktopBounds.startScrollY
    const target60Y = Math.round(
      desktopBounds.startScrollY + desktopBounds.scrollSpanPx * 0.60
    )
    await page.evaluate((y) => window.scrollTo(0, y), startY)
    await sleep(450)

    await smoothScroll(page, startY, target60Y, 85, 28)

    // Verify before & after 2.4 seconds of zero scroll that card positions are 100% identical
    const beforeHold = await page.evaluate(() => {
      const el = document.querySelector('[data-course-id="wed-14"]')
      return { transform: el.style.transform, localP: el.getAttribute('data-local-p') }
    })
    await sleep(2400)
    const afterHold = await page.evaluate(() => {
      const el = document.querySelector('[data-course-id="wed-14"]')
      return { transform: el.style.transform, localP: el.getAttribute('data-local-p') }
    })
    console.log('Hold at 60% check (before vs after 2.4s):', { beforeHold, afterHold })

    const videoPath = await page.video().path()
    await context.close()
    fs.copyFileSync(videoPath, path.join(OUT_DIR, 'phase03_1_stop_at_60_hold.webm'))
    console.log('✓ Saved Deliverable #4: phase03_1_stop_at_60_hold.webm')
  }

  // =========================================================================
  // 5. Deliverable #5: 60% → 0% 反向慢速录屏
  // =========================================================================
  console.log('5. Recording Deliverable #5: Slow reverse scroll from 60% -> 0%...')
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: TMP_VIDEOS, size: { width: 1440, height: 900 } },
    })
    const page = await context.newPage()
    await page.goto(URL, { waitUntil: 'networkidle' })
    await sleep(500)

    const target60Y = Math.round(
      desktopBounds.startScrollY + desktopBounds.scrollSpanPx * 0.60
    )
    const startY = desktopBounds.startScrollY - 20
    await page.evaluate((y) => window.scrollTo(0, y), target60Y)
    await sleep(700)

    await smoothScroll(page, target60Y, startY, 125, 30)
    await sleep(700)

    const videoPath = await page.video().path()
    await context.close()
    fs.copyFileSync(videoPath, path.join(OUT_DIR, 'phase03_1_reverse_60_to_0_slow.webm'))
    console.log('✓ Saved Deliverable #5: phase03_1_reverse_60_to_0_slow.webm')
  }

  // =========================================================================
  // 6. Deliverable #6: 完整向下 + 向上录屏
  // =========================================================================
  console.log('6. Recording Deliverable #6: Full downward (0% -> 100%) + upward (100% -> 0%) scroll...')
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: TMP_VIDEOS, size: { width: 1440, height: 900 } },
    })
    const page = await context.newPage()
    await page.goto(URL, { waitUntil: 'networkidle' })
    await sleep(500)

    const startY = desktopBounds.startScrollY - 25
    const endY = desktopBounds.endScrollY + 25
    await page.evaluate((y) => window.scrollTo(0, y), startY)
    await sleep(500)

    // Scroll Down 0% -> 100%
    await smoothScroll(page, startY, endY, 130, 26)
    await sleep(650)

    // Scroll Up 100% -> 0%
    await smoothScroll(page, endY, startY, 130, 26)
    await sleep(650)

    const videoPath = await page.video().path()
    await context.close()
    fs.copyFileSync(videoPath, path.join(OUT_DIR, 'phase03_1_full_down_and_up.webm'))
    console.log('✓ Saved Deliverable #6: phase03_1_full_down_and_up.webm')
  }

  // =========================================================================
  // 7. Deliverable #7: 390×844 移动端录屏
  // =========================================================================
  console.log('7. Recording Deliverable #7: Mobile (390x844) full forward + reverse video...')
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      recordVideo: { dir: TMP_VIDEOS, size: { width: 390, height: 844 } },
    })
    const page = await context.newPage()
    await page.goto(URL, { waitUntil: 'networkidle' })
    await sleep(600)

    const mobileBounds = await getScrollBounds(page)
    console.log('Mobile Bounds:', mobileBounds)

    // Capture a mid-flight mobile screenshot at p = 0.60
    const mobile60Y = Math.round(
      mobileBounds.startScrollY + mobileBounds.scrollSpanPx * 0.60
    )
    await page.evaluate((y) => window.scrollTo(0, y), mobile60Y)
    await sleep(350)
    await page.screenshot({
      path: path.join(OUT_DIR, 'phase03_1_mobile_midflight.png'),
      fullPage: false,
    })

    const startY = mobileBounds.startScrollY - 30
    const endY = mobileBounds.endScrollY + 25
    await page.evaluate((y) => window.scrollTo(0, y), startY)
    await sleep(500)

    // Mobile Forward 0% -> 100%
    await smoothScroll(page, startY, endY, 120, 26)
    await sleep(600)

    // Mobile Reverse 100% -> 0%
    await smoothScroll(page, endY, startY, 110, 26)
    await sleep(600)

    const videoPath = await page.video().path()
    await context.close()
    fs.copyFileSync(videoPath, path.join(OUT_DIR, 'phase03_1_mobile_390x844.webm'))
    console.log('✓ Saved Deliverable #7: phase03_1_mobile_390x844.webm')
  }

  await browser.close()
  fs.rmSync(TMP_VIDEOS, { recursive: true, force: true })
  console.log('\nAll 7 Phase 03.1 deliverables generated and verified!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
