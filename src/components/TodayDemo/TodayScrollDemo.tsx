import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Formats the remaining minutes and progress percentage continuously from scroll progress p in [0, 1].
 * Course: 10:00 - 11:40 (100 minutes total).
 * p = 0.0 -> 10:30 -> elapsed 30m, remaining 70m ("1 小时 10 分"), bar = 30%
 * p = 1.0 -> 11:35 -> elapsed 95m, remaining 5m ("5 分"), bar = 95%
 */
export function computeCourseState(progress: number) {
  const p = Math.max(0, Math.min(1, progress))
  const elapsedMinutes = 30 + p * 65
  const remainingMinutes = Math.max(5, Math.round(100 - elapsedMinutes))
  const barPercent = elapsedMinutes // since total is 100 minutes, elapsedMinutes directly equals %

  let timeStr = ''
  if (remainingMinutes >= 60) {
    const hours = Math.floor(remainingMinutes / 60)
    const mins = remainingMinutes % 60
    timeStr = mins > 0 ? `${hours} 小时 ${mins} 分` : `${hours} 小时`
  } else {
    timeStr = `${remainingMinutes} 分`
  }

  return {
    statusText: `进行中 · 还剩 ${timeStr}`,
    barPercent,
    p,
  }
}

export const TodayScrollDemo: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const contentWrapperRef = useRef<HTMLDivElement>(null)
  const statusTextRef = useRef<HTMLSpanElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const topRowRef = useRef<HTMLDivElement>(null)
  const activeRowRef = useRef<HTMLDivElement>(null)
  const bottomRowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const contentWrapper = contentWrapperRef.current
    if (!section || !contentWrapper) return

    const updateFromProgress = (rawProgress: number) => {
      const { statusText, barPercent, p } = computeCourseState(rawProgress)

      // 1. Update countdown text continuously
      if (statusTextRef.current) {
        statusTextRef.current.textContent = statusText
      }

      // 2. Update progress bar width continuously
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${barPercent.toFixed(2)}%`
      }

      // 3. Synchronized subtle Depth of Field (DOF) for upper & lower courses
      // Smoothly deepens as user scrolls through the demo, keeping active card 100% sharp
      const dofCurve = Math.sin(p * Math.PI * 0.5) // 0 at p=0 -> 1 at p=1
      const blurPx = 0.4 + dofCurve * 0.75 // 0.4px -> 1.15px (subtle optical DOF, never mosaic-like)
      const sideOpacity = 0.82 - dofCurve * 0.22 // 0.82 -> 0.60
      const sideScale = 0.994 - dofCurve * 0.014 // 0.994 -> 0.980
      const activeScale = 1.0 + dofCurve * 0.012 // 1.0 -> 1.012

      if (topRowRef.current) {
        topRowRef.current.style.filter = `blur(${blurPx.toFixed(2)}px)`
        topRowRef.current.style.opacity = sideOpacity.toFixed(3)
        topRowRef.current.style.transform = `scale(${sideScale.toFixed(4)})`
      }

      if (bottomRowRef.current) {
        bottomRowRef.current.style.filter = `blur(${blurPx.toFixed(2)}px)`
        bottomRowRef.current.style.opacity = sideOpacity.toFixed(3)
        bottomRowRef.current.style.transform = `scale(${sideScale.toFixed(4)})`
      }

      if (activeRowRef.current) {
        activeRowRef.current.style.transform = `scale(${activeScale.toFixed(4)})`
      }
    }

    // Initialize at p = 0
    updateFromProgress(0)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: activeRowRef.current || contentWrapper,
        start: 'bottom 88%',
        end: 'top 16%',
        scrub: 0.12,
        onUpdate: (self) => {
          updateFromProgress(self.progress)
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="today-demo"
      ref={sectionRef}
      className="relative w-full bg-[#FBFBFD] select-none pt-6 sm:pt-7 md:pt-9 pb-[360px] sm:pb-[400px] md:pb-[450px]"
    >
      <div
        ref={contentWrapperRef}
        className="w-full px-5 sm:px-10 md:px-14 lg:px-20"
      >
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-9 md:gap-12 lg:gap-16">
          {/* Left Column (Desktop 38%): Fixed Narrative Copy */}
          <div className="w-full md:w-[38%] flex flex-col items-start text-left shrink-0 md:-mt-10">
            <h2
              style={{ lineHeight: 1.25 }}
              className="text-2xl sm:text-4xl lg:text-[42px] font-semibold tracking-[-0.03em] text-neutral-950 leading-[1.25] sm:leading-[1.25] lg:leading-[1.25] mb-3 sm:mb-5"
            >
              当前课程，
              <br className="hidden sm:inline" />
              直接显示在首页。
            </h2>
            <p className="text-[14.5px] sm:text-lg lg:text-[19px] font-normal text-neutral-500 leading-relaxed tracking-[-0.01em] max-w-md">
              剩余时间、上课地点和下一节课，一打开就能看到。
            </p>
          </div>

          {/* Right Column (Desktop 56%): Reconstructed Native App "今日" Core UI */}
          <div className="w-full md:w-[56%] flex items-center justify-center">
            <div className="w-full max-w-[460px] sm:max-w-[500px] bg-[#F6F6F6] rounded-[28px] sm:rounded-[34px] p-4 sm:p-6 md:p-7 ring-1 ring-black/[0.05] shadow-[0_12px_36px_-10px_rgba(15,23,42,0.06)]">
              {/* App Header: 周一 & 3 节课 */}
              <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
                <div>
                  <div className="text-[26px] sm:text-[34px] font-bold text-neutral-900 leading-none tracking-tight">
                    周一
                  </div>
                  <div className="text-[12px] sm:text-[13.5px] text-neutral-500 font-normal mt-1.5">
                    10月12日 · 第 7 周
                  </div>
                </div>

                <div className="px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white text-neutral-700 text-[12px] sm:text-[13px] font-normal border border-neutral-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  3 节课
                </div>
              </div>

              {/* Course List Stack */}
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* 1. Earlier Course (Recedes into upper Depth of Field) */}
                <div
                  ref={topRowRef}
                  style={{
                    willChange: 'transform, opacity, filter',
                    transformOrigin: 'center bottom',
                  }}
                  className="flex items-start gap-2.5 sm:gap-3.5 transition-none"
                >
                  <div className="w-11 sm:w-13 pt-1 shrink-0 text-left">
                    <div className="text-[12.5px] sm:text-[14px] font-semibold text-neutral-900 leading-tight">
                      08:00
                    </div>
                    <div className="text-[11.5px] sm:text-[13px] font-normal text-neutral-400 mt-0.5 leading-tight">
                      09:40
                    </div>
                  </div>

                  <div className="flex-1 bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-neutral-200/75 shadow-[0_2px_8px_rgba(0,0,0,0.015)]">
                    <div className="flex items-center">
                      <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#DFB968] mr-2 shrink-0" />
                      <h3 className="text-[14.5px] sm:text-[16.5px] font-semibold text-neutral-600 tracking-tight">
                        产品原型设计
                      </h3>
                    </div>
                    <p className="text-[11.5px] sm:text-[13px] text-neutral-500 leading-[1.5] mt-1 sm:mt-1.5">
                      第 1-2 节 · 本校区 · 先进制造产教融合实训基地[先进制造产教融合实训基地D202AI数据增值科创工坊2]
                    </p>
                  </div>
                </div>

                {/* 2. Active Course (Sharp, High-Contrast Visual Focus) */}
                <div
                  ref={activeRowRef}
                  style={{
                    willChange: 'transform',
                    zIndex: 20,
                  }}
                  className="flex items-start gap-2.5 sm:gap-3.5 relative"
                >
                  <div className="w-11 sm:w-13 pt-1 shrink-0 text-left">
                    <div className="text-[12.5px] sm:text-[14px] font-semibold text-neutral-950 leading-tight">
                      10:00
                    </div>
                    <div className="text-[11.5px] sm:text-[13px] font-normal text-neutral-500 mt-0.5 leading-tight">
                      11:40
                    </div>
                  </div>

                  <div className="flex-1 bg-[#121212] rounded-[20px] sm:rounded-[24px] p-4 sm:p-5.5 shadow-[0_18px_38px_-10px_rgba(0,0,0,0.28)] ring-1 ring-black/10 text-white">
                    {/* Live Status & Scroll-driven Countdown */}
                    <div className="flex items-center">
                      <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#52C478] mr-2 shrink-0 shadow-[0_0_8px_rgba(82,196,120,0.55)]" />
                      <span
                        ref={statusTextRef}
                        className="text-[12.5px] sm:text-[14px] text-white/95 font-normal tracking-tight tabular-nums"
                      >
                        进行中 · 还剩 1 小时 10 分
                      </span>
                    </div>

                    {/* Course Title */}
                    <h3 className="text-[15.5px] sm:text-[18.5px] font-semibold text-white leading-[1.38] mt-2 sm:mt-2.5 mb-1 sm:mb-1.5 tracking-tight">
                      习近平新时代中国特色社会主义思想概论
                    </h3>

                    {/* Location Info */}
                    <p className="text-[11.5px] sm:text-[13px] text-white/80 leading-[1.48]">
                      第 3-4 节 · 本校区 · 二号教学楼[二号教学楼B204]
                    </p>

                    {/* Scroll-driven Continuous Progress Bar */}
                    <div className="w-full h-[3.5px] sm:h-[4px] bg-white/20 rounded-full mt-3.5 sm:mt-5 relative flex items-center">
                      <div
                        ref={progressBarRef}
                        style={{ width: '30%', willChange: 'width' }}
                        className="h-full bg-white rounded-full"
                      />
                      {/* End-of-class indicator dot matching native UI */}
                      <span className="w-1 h-1 rounded-full bg-white absolute right-0" />
                    </div>
                  </div>
                </div>

                {/* 3. Upcoming Course (Recedes into lower Depth of Field) */}
                <div
                  ref={bottomRowRef}
                  style={{
                    willChange: 'transform, opacity, filter',
                    transformOrigin: 'center top',
                  }}
                  className="flex items-start gap-2.5 sm:gap-3.5 transition-none"
                >
                  <div className="w-11 sm:w-13 pt-1 shrink-0 text-left">
                    <div className="text-[12.5px] sm:text-[14px] font-semibold text-neutral-900 leading-tight">
                      14:00
                    </div>
                    <div className="text-[11.5px] sm:text-[13px] font-normal text-neutral-400 mt-0.5 leading-tight">
                      15:50
                    </div>
                  </div>

                  <div className="flex-1 bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-neutral-200/75 shadow-[0_2px_8px_rgba(0,0,0,0.015)]">
                    <div className="flex items-center">
                      <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#7C66DC] mr-2 shrink-0" />
                      <h3 className="text-[14.5px] sm:text-[16.5px] font-semibold text-neutral-900 tracking-tight">
                        Node.js应用开发
                      </h3>
                    </div>
                    <p className="text-[11.5px] sm:text-[13px] text-neutral-500 leading-[1.5] mt-1 sm:mt-1.5">
                      第 5-6 节 · 本校区 · 实训中心E区[数智基地29-实训中心E209]
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
