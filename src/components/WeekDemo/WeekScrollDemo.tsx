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
}

export const WEEK_COURSES: WeekCourseItem[] = [
  // 1. 周一 08:00 · 产品原型设计
  {
    id: 'mon-08',
    order: 1,
    col: 0,
    row: 0,
    title: '产品原型设计',
    location: '先进制造产教融合实训基地D202AI数据增值科创工坊2',
    theme: 'warm',
    startP: 0.04,
    endP: 0.16,
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
    endP: 0.22,
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
    startP: 0.16,
    endP: 0.28,
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
    startP: 0.22,
    endP: 0.34,
  },
  // 5. 周三 08:00 · 区块链基础原理
  {
    id: 'wed-08',
    order: 5,
    col: 2,
    row: 0,
    title: '区块链基础原理',
    location: '数智基地32-实训中心E303',
    theme: 'warm',
    startP: 0.37,
    endP: 0.50,
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
    startP: 0.45,
    endP: 0.58,
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
    startP: 0.53,
    endP: 0.65,
  },
  // 8. 周五 10:00 · 产品原型设计
  {
    id: 'fri-10',
    order: 8,
    col: 4,
    row: 1,
    title: '产品原型设计',
    location: '先进制造产教融合实训基地D202AI数据增值科创工坊2',
    theme: 'warm',
    startP: 0.67,
    endP: 0.79,
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
    startP: 0.74,
    endP: 0.86,
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

/**
 * Computes continuous visual properties for a single course card from global scroll progress p in [0, 1].
 */
export function computeCardMotion(p: number, course: WeekCourseItem) {
  const clampedP = Math.max(0, Math.min(1, p))
  const rawLocal = (clampedP - course.startP) / (course.endP - course.startP)
  const localP = Math.max(0, Math.min(1, rawLocal))

  // Smooth cubic ease-out for calm spatial settling without bounce or overshoot
  const eased = 1 - Math.pow(1 - localP, 3)
  const opacity = 1 - Math.pow(1 - localP, 2.2)
  const scale = 0.94 + 0.06 * eased
  const blur = (1 - eased) * 2.2
  const y = (1 - eased) * 26
  const colDirectionOffset = (course.col - 2) * 3.5
  const x = (1 - eased) * colDirectionOffset

  return {
    localP,
    opacity,
    scale,
    blur,
    x,
    y,
  }
}

export const WeekScrollDemo: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const uiCardRef = useRef<HTMLDivElement>(null)
  const courseRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const section = sectionRef.current
    const uiCard = uiCardRef.current
    if (!section || !uiCard) return

    const updateAllCards = (progress: number) => {
      uiCard.setAttribute('data-week-progress', progress.toFixed(4))
      for (const course of WEEK_COURSES) {
        const el = courseRefs.current[course.id]
        if (!el) continue

        const { localP, opacity, scale, blur, x, y } = computeCardMotion(progress, course)

        if (localP <= 0.0001) {
          el.style.opacity = '0'
          el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(0.94)`
          el.style.filter = 'blur(2.2px)'
        } else if (localP >= 0.9999) {
          el.style.opacity = '1'
          el.style.transform = 'translate3d(0px, 0px, 0) scale(1)'
          el.style.filter = 'none'
        } else {
          el.style.opacity = opacity.toFixed(3)
          el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`
          el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none'
        }
      }
    }

    // Initialize at p = 0 (empty grid)
    updateAllCards(0)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: uiCard,
        start: 'top 34%',
        end: 'top 8%',
        scrub: 0.12,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          updateAllCards(self.progress)
        },
      })
    }, section)

    const handleRefresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', handleRefresh)
    document.fonts?.ready?.then(handleRefresh)

    return () => {
      window.removeEventListener('load', handleRefresh)
      ctx.revert()
    }
  }, [])

  // Helper lookup for course at (col, row)
  const getCourseAt = (col: number, row: number) =>
    WEEK_COURSES.find((c) => c.col === col && c.row === row)

  return (
    <section
      id="week-demo"
      ref={sectionRef}
      className="relative w-full bg-[#FBFBFD] select-none pt-10 sm:pt-14 md:pt-16 pb-[380px] sm:pb-[420px] md:pb-[480px]"
    >
      <div className="w-full px-3.5 sm:px-8 md:px-14 lg:px-20">
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-9 md:gap-12 lg:gap-16">
          {/* Desktop Left (58%) / Mobile Bottom: Reconstructed Native App "周视图" UI */}
          <div className="w-full md:w-[59%] order-2 md:order-1 flex items-center justify-center">
            <div
              ref={uiCardRef}
              className="w-full max-w-[530px] bg-[#F6F6F6] rounded-[26px] sm:rounded-[32px] p-3.5 sm:p-5 ring-1 ring-black/[0.05] shadow-[0_12px_36px_-10px_rgba(15,23,42,0.06)]"
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
                  className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-full bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-800" />
                </span>
                <span
                  aria-hidden="true"
                  className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-full bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-800" />
                </span>
                <span className="h-7.5 sm:h-8.5 px-3 sm:px-4 rounded-full bg-white border border-neutral-200/80 flex items-center justify-center text-[11px] sm:text-[12.5px] text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  回到本周
                </span>
                <span className="px-2 sm:px-2.5 text-[11px] sm:text-[12.5px] text-neutral-900 font-normal">
                  复制到下周
                </span>
              </div>

              {/* 3. Weekday & Date Header Row (Aligned with 5-column grid) */}
              <div className="flex items-center mt-3 sm:mt-3.5 mb-1.5 sm:mb-2">
                {/* Left Time Column Spacer */}
                <div className="w-8 sm:w-10 shrink-0" />
                <div className="flex-1 grid grid-cols-5 gap-1.5 sm:gap-2 text-center">
                  {WEEKDAYS.map((day) => (
                    <div key={day.label} className="flex flex-col items-center">
                      <span className="text-[10.5px] sm:text-[12px] text-neutral-500 font-normal leading-tight">
                        {day.label}
                      </span>
                      <span className="text-[11.5px] sm:text-[13px] text-neutral-900 font-medium leading-tight mt-0.5">
                        {day.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. 5 x 4 Course Grid + Left Time Column */}
              <div className="flex flex-col gap-1.5 sm:gap-2">
                {TIME_ROWS.map((timeLabel, rowIdx) => (
                  <div key={timeLabel} className="flex items-start">
                    {/* Left Time Label */}
                    <div className="w-8 sm:w-10 pt-1.5 text-[10px] sm:text-[11.5px] text-neutral-500 font-normal shrink-0 leading-none">
                      {timeLabel}
                    </div>

                    {/* 5 Weekday Cells for this Time Row */}
                    <div className="flex-1 grid grid-cols-5 gap-1.5 sm:gap-2">
                      {WEEKDAYS.map((_, colIdx) => {
                        const course = getCourseAt(colIdx, rowIdx)

                        return (
                          <div
                            key={`${rowIdx}-${colIdx}`}
                            className="relative h-[86px] sm:h-[94px] rounded-[12px] sm:rounded-[15px] bg-[#EAEAEA]"
                          >
                            {course && (
                              <div
                                ref={(el) => {
                                  courseRefs.current[course.id] = el
                                }}
                                data-course-id={course.id}
                                data-course-order={course.order}
                                style={{
                                  opacity: 0,
                                  willChange: 'transform, opacity, filter',
                                }}
                                className={`
                                  absolute inset-0 rounded-[12px] sm:rounded-[15px] p-1.5 sm:p-2 overflow-hidden flex flex-col justify-start
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
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Right (36%) / Mobile Top: Fixed Narrative Copy */}
          <div className="w-full md:w-[36%] order-1 md:order-2 flex flex-col items-start text-left shrink-0 md:-mt-8">
            <h2
              style={{ lineHeight: 1.25 }}
              className="text-2xl sm:text-4xl lg:text-[42px] font-semibold tracking-[-0.03em] text-neutral-950 leading-[1.25] sm:leading-[1.25] lg:leading-[1.25] mb-3 sm:mb-5"
            >
              把一周放在
              <br className="hidden sm:inline" />
              一张视图里。
            </h2>
            <p className="text-[14.5px] sm:text-lg lg:text-[19px] font-normal text-neutral-500 leading-relaxed tracking-[-0.01em] max-w-md">
              课程按时间排进一周，什么时候有课、什么时候空着，直接展开来看。
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
