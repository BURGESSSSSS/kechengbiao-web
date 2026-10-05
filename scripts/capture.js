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

  // 1. Desktop Context (1440 x 900)
  console.log('Capturing Desktop 1440x900...')
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
  await page.waitForTimeout(2000)

  // 1.1 1440x900 Hero viewport screenshot
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

  // 1.2 Showcase desktop
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

  // 1.3 Performance desktop
  const perf = await page.locator('#performance')
  await perf.screenshot({
    path: path.join(outputDir, '03_desktop_performance.png')
  })
  console.log('✓ Saved 03_desktop_performance.png')

  // Scroll back to top to finish desktop video
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
  await page.waitForTimeout(1000)
  const desktopVideo = await page.video()?.path()
  await desktopContext.close()
  if (desktopVideo && fs.existsSync(desktopVideo)) {
    fs.copyFileSync(desktopVideo, path.join(outputDir, 'desktop_full_page_scroll.webm'))
    console.log('✓ Saved desktop_full_page_scroll.webm')
  }

  // 2. Mobile Context (390 x 844)
  console.log('Capturing Mobile 390x844...')
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
  await mobilePage.waitForTimeout(2000)

  // 2.1 Mobile Hero screenshot
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

  // 2.2 Mobile Full Page screenshot
  await mobilePage.screenshot({
    path: path.join(outputDir, '05_mobile_full_page.png'),
    fullPage: true
  })
  console.log('✓ Saved 05_mobile_full_page.png')

  const mobileVideo = await mobilePage.video()?.path()
  await mobileContext.close()
  if (mobileVideo && fs.existsSync(mobileVideo)) {
    fs.copyFileSync(mobileVideo, path.join(outputDir, 'mobile_full_page_scroll.webm'))
    console.log('✓ Saved mobile_full_page_scroll.webm')
  }

  // 3. Hero dynamic motion recording (1440x900)
  console.log('Capturing Hero dynamic motion video...')
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
  // Gentle mouse moves across hero
  for (let i = 0; i < 20; i++) {
    const x = 720 + Math.sin(i * 0.3) * 200
    const y = 450 + Math.cos(i * 0.3) * 100
    await heroMotionPage.mouse.move(x, y)
    await heroMotionPage.waitForTimeout(200)
  }
  const motionVideo = await heroMotionPage.video()?.path()
  await heroMotionContext.close()
  if (motionVideo && fs.existsSync(motionVideo)) {
    fs.copyFileSync(motionVideo, path.join(outputDir, 'hero_dynamic_motion_desktop.webm'))
    console.log('✓ Saved hero_dynamic_motion_desktop.webm')
  }

  // 4. Capture 24 frames for Animated GIF preview
  console.log('Capturing 24 frames for animated GIF...')
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

  // 5. Compile animated GIF using python
  console.log('Compiling 06_hero_dynamic_motion.gif...')
  execSync(`python -c "
from PIL import Image
import glob, os

frames = sorted(glob.glob('reports/visual/frames/frame_*.png'))
images = []
for f in frames:
    im = Image.open(f)
    im_small = im.resize((720, 450), Image.Resampling.LANCZOS).convert('P', palette=Image.Palette.ADAPTIVE, colors=128)
    images.append(im_small)

if images:
    out_path = 'reports/visual/06_hero_dynamic_motion.gif'
    images[0].save(
        out_path,
        save_all=True,
        append_images=images[1:],
        duration=120,
        loop=0,
        optimize=True
    )
    print('Generated GIF successfully')
"`, { stdio: 'inherit' })

  console.log('All visual captures and compilations completed successfully!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
