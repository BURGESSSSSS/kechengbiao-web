import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronLeft, ChevronRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export interface WeekCourseItem {
  id: string
  order: number
  col: number // 0: 周一, 1: 周二, 2: 周三, 3: 周四, 4: 周五
  row: number // 0: 08:00, 1: 10:00, 2: 14:00, 3: 16:00
  title: string
  location: string
  theme: 'warm' | 'lavender'
  startP: number
  endP: number
  // Spatial motion parameters (desktop baseline in px / deg; scaled on mobile)
  offsetX: number
  offsetY: number
  arcX: number
  arcY: number
  overX: number
  overY: number
  startRot: number
}

export interface CellRect {
  x: number
  y: number
  width: number
  height: number
}

export const WEEK_COURSES: WeekCourseItem[] = [
  // === Group 1: 周一四张（从左侧偏下连续发出） ===
  // 1. 周一 08:00 · 产品原型设计
  {
    id: 'mon-08',
    order: 1,
    col: 0,
    row: 0,
    title: '产品原型设计',
    location: '先进制造产教融合实训基地D202AI数据增值科创工坊2',
    theme: 'warm',
    startP: 0.02,
    endP: 0.20,
    offsetX: -142,
    offsetY: 108,
    arcX: -24,
    arcY: -42,
    overX: 8.5,
    overY: -6.5,
    startRot: -3.8,
  },
  // 2. 周一 10:00 · 习近平新时代中国特色社会主义思想概论
  {
    id: 'mon-10',
    order: 2,
    col: 0,
    row: 1,
    title: '习近平新时代中国特色社会主义思想概论',
    location: '二号教学楼B204',
    theme: 'lavender',
    startP: 0.10,
    endP: 0.28,
    offsetX: -134,
    offsetY: 98,
    arcX: -22,
    arcY: -38,
    overX: 8.0,
    overY: -6.0,
    startRot: -3.4,
  },
  // 3. 周一 14:00 · Node.js 应用开发
  {
    id: 'mon-14',
    order: 3,
    col: 0,
    row: 2,
    title: 'Node.js应用开发',
    location: '数智基地29-实训中心E209',
    theme: 'lavender',
    startP: 0.18,
    endP: 0.36,
    offsetX: -126,
    offsetY: 90,
    arcX: -20,
    arcY: -35,
    overX: 7.5,
    overY: -5.5,
    startRot: -3.0,
  },
  // 4. 周一 16:00 · 习近平新时代中国特色社会主义思想概论
  {
    id: 'mon-16',
    order: 4,
    col: 0,
    row: 3,
    title: '习近平新时代中国特色社会主义思想概论',
    location: '二号教学楼A406',
    theme: 'lavender',
    startP: 0.26,
    endP: 0.44,
    offsetX: -118,
    offsetY: 82,
    arcX: -18,
    arcY: -32,
    overX: 7.0,
    overY: -5.0,
    startRot: -2.6,
  },

  // === Group 2: 周三 + 周四（短暂呼吸后，从下方偏左 / 下方偏右展开中部） ===
  // 5. 周三 08:00 · 区块链基础原理
  {
    id: 'wed-08',
    order: 5,
    col: 2,
    row: 0,
    title: '区块链基础原理',
    location: '数智基地32-实训中心E303',
    theme: 'warm',
    startP: 0.38,
    endP: 0.57,
    offsetX: -68,
    offsetY: 138,
    arcX: -18,
    arcY: -36,
    overX: 5.0,
    overY: -8.5,
    startRot: -2.6,
  },
  // 6. 周三 14:00 · 大学体育（二）
  {
    id: 'wed-14',
    order: 6,
    col: 2,
    row: 2,
    title: '大学体育（二）',
    location: '未填写',
    theme: 'lavender',
    startP: 0.48,
    endP: 0.67,
    offsetX: -56,
    offsetY: 120,
    arcX: -15,
    arcY: -32,
    overX: 4.5,
    overY: -7.5,
    startRot: -2.2,
  },
  // 7. 周四 08:00 · 区块链基础原理
  {
    id: 'thu-08',
    order: 7,
    col: 3,
    row: 0,
    title: '区块链基础原理',
    location: '数智基地32-实训中心E303',
    theme: 'warm',
    startP: 0.58,
    endP: 0.77,
    offsetX: 68,
    offsetY: 138,
    arcX: 18,
    arcY: -36,
    overX: -5.0,
    overY: -8.5,
    startRot: 2.6,
  },

  // === Group 3: 周五两张（从右侧偏下进入，完成整周收尾） ===
  // 8. 周五 10:00 · 产品原型设计
  {
    id: 'fri-10',
    order: 8,
    col: 4,
    row: 1,
    title: '产品原型设计',
    location: '先进制造产教融合实训基地D202AI数据增值科创工坊2',
    theme: 'warm',
    startP: 0.70,
    endP: 0.88,
    offsetX: 138,
    offsetY: 98,
    arcX: 24,
    arcY: -38,
    overX: -8.5,
    overY: -6.0,
    startRot: 3.5,
  },
  // 9. 周五 16:00 · Node.js 应用开发
  {
    id: 'fri-16',
    order: 9,
    col: 4,
    row: 3,
    title: 'Node.js应用开发',
    location: '数智基地32-实训中心E303',
    theme: 'lavender',
    startP: 0.80,
    endP: 0.98,
    offsetX: 124,
    offsetY: 86,
    arcX: 20,
    arcY: -34,
    overX: -7.5,
    overY: -5.5,
    startRot: 2.9,
  },
]

const WEEKDAYS = [
  { label: '周一', date: '19' },
  { label: '周二', date: '20' },
  { label: '周三', date: '21' },
  { label: '周四', date: '22' },
  { label: '周五', date: '23' },
]

const TIME_ROWS = ['08:00', '10:00', '14:00', '16:00']

const STAGE_A_END = 0.25
const STAGE_B_END = 0.82

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t)
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Pure, deterministic 3-stage "Deal + Glide Arc + Magnetic Snap" motion model.
 * Strictly maps global scroll progress p in [0, 1] -> localP in [0, 1] -> spatial state.
 */
export function computeCardMotion(
  p: number,
  course: WeekCourseItem,
  targetRect: CellRect,
  isMobile: boolean
) {
  const clampedP = clamp(p, 0, 1)
  const localP = clamp((clampedP - course.startP) / (course.endP - course.startP), 0, 1)

  // Scale spatial offsets on mobile (390x844) so cards stay within viewport bounds while preserving arc & magnetic character
  const distanceScale = isMobile ? 0.56 : 1.0
  const overshootScale = isMobile ? 0.78 : 1.0

  const targetX = targetRect.x
  const targetY = targetRect.y

  const startX = targetX + course.offsetX * distanceScale
  const startY = targetY + course.offsetY * distanceScale

  // Quadratic Bézier control point for curved flight path (Stage A + Stage B)
  const ctrlX = (startX + targetX) * 0.5 + course.arcX * distanceScale
  const ctrlY = (startY + targetY) * 0.5 + course.arcY * distanceScale

  let x = targetX
  let y = targetY
  let scale = 1
  let rotation = 0
  let blur = 0
  let opacity = 1
  let shadowStrength = 0
  let stage: 'idle' | 'A-launch' | 'B-glide' | 'C-snap' | 'settled' = 'idle'

  if (localP <= 0.0001) {
    stage = 'idle'
    x = startX
    y = startY
    scale = 0.82
    rotation = course.startRot
    blur = 3.0
    opacity = 0
    shadowStrength = 0
  } else if (localP >= 0.9999) {
    stage = 'settled'
    x = targetX
    y = targetY
    scale = 1
    rotation = 0
    blur = 0
    opacity = 1
    shadowStrength = 0
  } else if (localP < STAGE_B_END) {
    // Shared curved flight trajectory across Stage A (0 -> 0.25) and Stage B (0.25 -> 0.82)
    const u = localP / STAGE_B_END // [0, 1] across flight
    // Smooth ease-out with preserved arrival momentum (q'(1) = 0.38 > 0) into Stage C overshoot
    const q = 0.62 * easeOutQuad(u) + 0.38 * u
    const invQ = 1 - q

    x = invQ * invQ * startX + 2 * invQ * q * ctrlX + q * q * targetX
    y = invQ * invQ * startY + 2 * invQ * q * ctrlY + q * q * targetY

    if (localP < STAGE_A_END) {
      // Stage A｜抛出 (0 -> 0.25)
      stage = 'A-launch'
      const tA = localP / STAGE_A_END
      const easedA = easeOutQuad(tA)
      opacity = easedA
      scale = 0.82 + 0.12 * easedA // 0.82 -> 0.94
      blur = 3.0 - 2.2 * easedA // 3.0px -> 0.8px
      rotation = course.startRot * (1 - 0.42 * easedA)
      shadowStrength = easedA // Ramps up to full floating elevation
    } else {
      // Stage B｜滑翔 (0.25 -> 0.82)
      stage = 'B-glide'
      const tB = (localP - STAGE_A_END) / (STAGE_B_END - STAGE_A_END)
      const easedB = easeOutCubic(tB)
      opacity = 1
      scale = 0.94 + 0.06 * easedB // 0.94 -> 1.00
      const blurProgress = clamp(tB / 0.65, 0, 1)
      blur = 0.8 * Math.pow(1 - blurProgress, 2) // Rapidly drops 0.8px -> 0px
      rotation = course.startRot * 0.58 * (1 - easedB) // Smoothly levels to 0 deg
      shadowStrength = 1.0 - 0.35 * tB // Elevated shadow begins softening (1.0 -> 0.65)
    }
  } else {
    // Stage C｜磁吸落位 (0.82 -> 1.00): single slight overshoot -> magnetic pull back to target
    stage = 'C-snap'
    const tC = (localP - STAGE_B_END) / (1 - STAGE_B_END) // [0, 1]
    // Single-lobe pulse peaking at tC ≈ 0.45 (localP ≈ 0.90), zero bounce
    const overshootPulse = Math.sin(Math.PI * tC) * (1 - 0.32 * tC)

    x = targetX + course.overX * overshootScale * overshootPulse
    y = targetY + course.overY * overshootScale * overshootPulse
    scale = 1.0 + 0.022 * Math.sin(Math.PI * tC) * (1 - 0.25 * tC) // Peaks at ~1.020 -> 1.000
    rotation = -Math.sign(course.startRot) * 0.42 * Math.sin(Math.PI * tC) * (1 - tC)
    blur = 0
    opacity = 1
    shadowStrength = 0.65 * Math.pow(1 - tC, 2) // Settles to 0 as card embeds into cell
  }

  return {
    localP,
    stage,
    x,
    y,
    dx: x - targetX,
    dy: y - targetY,
    scale,
    rotation,
    blur,
    opacity,
    shadowStrength,
  }
}

export const WeekScrollDemo: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const uiCardRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const courseRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const targetRectsRef = useRef<Record<string, CellRect>>({})
  const currentProgressRef = useRef<number>(0)

  useEffect(() => {
    const section = sectionRef.current
    const uiCard = uiCardRef.current
    const overlay = overlayRef.current
    if (!section || !uiCard || !overlay) return

    const measureCellRects = () => {
      const overlayRect = overlay.getBoundingClientRect()
      if (overlayRect.width === 0 || overlayRect.height === 0) return

      for (const course of WEEK_COURSES) {
        const cellKey = `${course.col}-${course.row}`
        const cellEl = cellRefs.current[cellKey]
        const cardEl = courseRefs.current[course.id]
        if (!cellEl || !cardEl) continue

        const cellRect = cellEl.getBoundingClientRect()
        const rect: CellRect = {
          x: cellRect.left - overlayRect.left,
          y: cellRect.top - overlayRect.top,
          width: cellRect.width,
          height: cellRect.height,
        }
        targetRectsRef.current[course.id] = rect

        cardEl.style.width = `${rect.width.toFixed(2)}px`
        cardEl.style.height = `${rect.height.toFixed(2)}px`
      }
    }

    const updateAllCards = (progress: number) => {
      currentProgressRef.current = progress
      uiCard.setAttribute('data-week-progress', progress.toFixed(4))
      const isMobile = window.innerWidth < 768

      for (const course of WEEK_COURSES) {
        const el = courseRefs.current[course.id]
        const targetRect = targetRectsRef.current[course.id]
        if (!el || !targetRect) continue

        const {
          localP,
          stage,
          x,
          y,
          dx,
          dy,
          scale,
          rotation,
          blur,
          opacity,
          shadowStrength,
        } = computeCardMotion(progress, course, targetRect, isMobile)

        el.setAttribute('data-local-p', localP.toFixed(3))
        el.setAttribute('data-stage', stage)
        el.setAttribute('data-dx', dx.toFixed(1))
        el.setAttribute('data-dy', dy.toFixed(1))
        el.setAttribute('data-scale', scale.toFixed(3))
        el.setAttribute('data-rot', rotation.toFixed(2))

        if (localP <= 0.0001) {
          el.style.opacity = '0'
          el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rotation.toFixed(2)}deg) scale(0.82)`
          el.style.filter = 'blur(3px)'
          el.style.boxShadow = 'none'
          el.style.zIndex = '1'
        } else if (localP >= 0.9999) {
          el.style.opacity = '1'
          el.style.transform = `translate3d(${targetRect.x.toFixed(2)}px, ${targetRect.y.toFixed(2)}px, 0) rotate(0deg) scale(1)`
          el.style.filter = 'none'
          el.style.boxShadow = 'none'
          el.style.zIndex = '2'
        } else {
          el.style.opacity = opacity.toFixed(3)
          el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(4)})`
          el.style.filter = blur > 0.04 ? `blur(${blur.toFixed(2)}px)` : 'none'
          el.style.zIndex = String(30 + course.order)

          const s = shadowStrength
          const y1 = (4 + 16 * s).toFixed(1)
          const b1 = (10 + 26 * s).toFixed(1)
          const sp1 = (2 + 4 * s).toFixed(1)
          const a1 = (0.04 + 0.16 * s).toFixed(3)
          const y2 = (2 + 5 * s).toFixed(1)
          const b2 = (4 + 10 * s).toFixed(1)
          const a2 = (0.02 + 0.08 * s).toFixed(3)
          el.style.boxShadow = `0 ${y1}px ${b1}px -${sp1}px rgba(15, 23, 42, ${a1}), 0 ${y2}px ${b2}px -2px rgba(15, 23, 42, ${a2})`
        }
      }
    }

    // Initial measurement & p = 0 initialization
    measureCellRects()
    updateAllCards(0)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: uiCard,
        start: 'top 54%',
        end: 'top 6%',
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          measureCellRects()
          updateAllCards(self.progress)
        },
        onUpdate: (self) => {
          updateAllCards(self.progress)
        },
      })
    }, section)

    const handleResizeOrRefresh = () => {
      measureCellRects()
      ScrollTrigger.refresh()
      updateAllCards(currentProgressRef.current)
    }

    const resizeObserver = new ResizeObserver(() => {
      measureCellRects()
      updateAllCards(currentProgressRef.current)
    })
    resizeObserver.observe(overlay)

    window.addEventListener('resize', handleResizeOrRefresh)
    window.addEventListener('load', handleResizeOrRefresh)
    document.fonts?.ready?.then(handleResizeOrRefresh)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResizeOrRefresh)
      window.removeEventListener('load', handleResizeOrRefresh)
      ctx.revert()
    }
  }, [])

  return (
    <section
      id="week-demo"
      ref={sectionRef}
      className="relative w-full bg-[#FBFBFD] select-none overflow-x-clip pt-10 sm:pt-14 md:pt-16 pb-14 sm:pb-20 md:pb-24"
    >
      <div className="w-full px-3.5 sm:px-8 md:px-14 lg:px-20">
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-9 md:gap-12 lg:gap-16">
          {/* Desktop Left (59%) / Mobile Bottom: Reconstructed Native App "周视图" UI */}
          <div className="w-full md:w-[59%] order-2 md:order-1 flex items-center justify-center">
            <div
              ref={uiCardRef}
              className="relative w-full max-w-[530px] bg-[#F6F6F6] rounded-[26px] sm:rounded-[32px] p-3.5 sm:p-5 ring-1 ring-black/[0.05] shadow-[0_12px_36px_-10px_rgba(15,23,42,0.06)]"
            >
              {/* 1. Top Bar: 第 8 周 + Date Range + 编辑 / 导入 */}
              <div className="flex items-start justify-between px-1">
                <div>
                  <div className="text-[23px] sm:text-[28px] font-bold text-neutral-900 leading-none tracking-tight">
                    第 8 周
                  </div>
                  <div className="text-[11px] sm:text-[12.5px] text-neutral-500 font-normal mt-1.5">
                    10月19日 - 10月25日
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                  <span className="px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white text-neutral-900 text-[11.5px] sm:text-[12.5px] font-normal border border-neutral-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    编辑
                  </span>
                  <span className="px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white text-neutral-900 text-[11.5px] sm:text-[12.5px] font-normal border border-neutral-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    导入
                  </span>
                </div>
              </div>

              {/* 2. Week Navigation Row: < > 回到本周 复制到下周 */}
              <div className="flex items-center gap-1.5 sm:gap-2 mt-2.5 sm:mt-3.5 px-0.5">
                <span
                  aria-hidden="true"
                  className="w-6 h-5 sm:w-7 sm:h-6 rounded-full bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.2]" />
                </span>
                <span
                  aria-hidden="true"
                  className="w-6 h-5 sm:w-7 sm:h-6 rounded-full bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                >
                  <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.2]" />
                </span>
                <span className="px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-white border border-neutral-200/80 text-[11px] sm:text-[12px] text-neutral-900 font-normal shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  回到本周
                </span>
                <span className="ml-1.5 sm:ml-2.5 text-[11px] sm:text-[12px] text-neutral-800 font-normal">
                  复制到下周
                </span>
              </div>

              {/* 3 & 4. Layered Architecture: StableGrid + CourseCardOverlay */}
              <div className="relative mt-3.5 sm:mt-4">
                {/* Layer 1: StableGrid (Weekday Headers + Time Axis + 20 Fixed Empty Cells) */}
                <div data-stable-grid="true">
                  {/* Weekday Header Row: 周一 19 ~ 周五 23 */}
                  <div className="flex items-end mb-2">
                    <div className="w-8 sm:w-10 shrink-0" />
                    <div className="flex-1 grid grid-cols-5 gap-1.5 sm:gap-2">
                      {WEEKDAYS.map((day) => (
                        <div key={day.date} className="flex flex-col items-center justify-center">
                          <span className="text-[10.5px] sm:text-[11.5px] text-neutral-500 font-normal leading-tight">
                            {day.label}
                          </span>
                          <span className="text-[12.5px] sm:text-[13.5px] text-neutral-900 font-medium leading-tight mt-0.5">
                            {day.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5 x 4 Empty Course Slots */}
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    {TIME_ROWS.map((timeLabel, rowIdx) => (
                      <div key={timeLabel} className="flex items-start">
                        {/* Left Time Label */}
                        <div className="w-8 sm:w-10 pt-1.5 text-[10px] sm:text-[11.5px] text-neutral-500 font-normal shrink-0 leading-none">
                          {timeLabel}
                        </div>

                        {/* 5 Fixed Empty Cells */}
                        <div className="flex-1 grid grid-cols-5 gap-1.5 sm:gap-2">
                          {WEEKDAYS.map((_, colIdx) => {
                            const cellKey = `${colIdx}-${rowIdx}`
                            return (
                              <div
                                key={cellKey}
                                ref={(el) => {
                                  cellRefs.current[cellKey] = el
                                }}
                                data-cell-key={cellKey}
                                className="relative h-[86px] sm:h-[94px] rounded-[12px] sm:rounded-[15px] bg-[#EAEAEA]"
                              />
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Layer 2: CourseCardOverlay (9 Floating & Magnetically Snapping Course Cards) */}
                <div
                  ref={overlayRef}
                  data-course-overlay="true"
                  className="absolute inset-0 pointer-events-none"
                >
                  {WEEK_COURSES.map((course) => (
                    <div
                      key={course.id}
                      ref={(el) => {
                        courseRefs.current[course.id] = el
                      }}
                      data-course-id={course.id}
                      data-course-order={course.order}
                      style={{
                        left: 0,
                        top: 0,
                        opacity: 0,
                        transformOrigin: '50% 50%',
                        willChange: 'transform, opacity, filter, box-shadow',
                      }}
                      className={`
                        absolute rounded-[12px] sm:rounded-[15px] p-1.5 sm:p-2 overflow-hidden flex flex-col justify-start
                        ${
                          course.theme === 'warm'
                            ? 'bg-[#F3ECE1] text-[#5E3704]'
                            : 'bg-[#E9E7F7] text-[#2B1B54]'
                        }
                      `}
                    >
                      <div className="shrink-0 text-[10.5px] sm:text-[12.5px] font-semibold leading-[1.24] tracking-tight line-clamp-2 break-all">
                        {course.title}
                      </div>
                      <div
                        className={`
                          overflow-hidden line-clamp-3 text-[9px] sm:text-[10.5px] font-normal leading-[1.22] mt-0.5 sm:mt-1 break-all
                          ${
                            course.theme === 'warm'
                              ? 'text-[#6D440E]'
                              : 'text-[#3D2C6E]'
                          }
                        `}
                      >
                        {course.location}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Right (36%) / Mobile Top: Fixed Narrative Copy */}
          <div className="w-full md:w-[36%] order-1 md:order-2 flex flex-col items-start text-left">
            <h2
              style={{ lineHeight: 1.22 }}
              className="text-2xl sm:text-4xl md:text-[42px] lg:text-[44px] font-bold tracking-[-0.03em] text-neutral-950"
            >
              把一周放在
              <br />
              一张视图里。
            </h2>
            <p className="mt-3 sm:mt-5 text-[15px] sm:text-[17px] text-neutral-500 font-normal leading-relaxed max-w-[360px]">
              课程按时间排进一周，什么时候有课、什么时候空着，直接展开来看。
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
