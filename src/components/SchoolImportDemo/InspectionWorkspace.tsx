import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Check, ChevronLeft, MoreHorizontal, RefreshCw } from 'lucide-react'
import {
  SCHEDULE_TIME_BANDS,
  SCHOOL_IMPORT_COURSES,
  SCHOOL_WEEKDAYS,
  type SchoolImportCourse,
} from './schoolImportData'

gsap.registerPlugin(ScrollTrigger)

export const InspectionWorkspace: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null)
  const xrayLayerRef = useRef<HTMLDivElement>(null)
  const heroRequestRef = useRef<HTMLDivElement>(null)
  const dataPosterRef = useRef<HTMLDivElement>(null)
  const courseListRef = useRef<HTMLDivElement>(null)
  const localSectionRef = useRef<HTMLDivElement>(null)

  // Track progress for interactive states
  const [xrayProgress, setXrayProgress] = useState(0)
  const [isRequestFocused, setIsRequestFocused] = useState(false)
  const [textMode, setTextMode] = useState<'mono' | 'sans'>('mono')

  // Real Monday courses for demonstration
  const mondayCourses = SCHOOL_IMPORT_COURSES.filter((c) => c.dayCol === 0)

  // Map courses by (dayCol, appTimeRow) for table rendering
  const courseBySlot = new Map<string, SchoolImportCourse>()
  SCHOOL_IMPORT_COURSES.forEach((c) => {
    courseBySlot.set(`${c.dayCol}-${c.appTimeRow}`, c)
  })

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      // 1. X-Ray Slicing / Reveal trigger
      if (xrayLayerRef.current) {
        ScrollTrigger.create({
          trigger: '#xray-viewport-stage',
          start: 'top 70%',
          end: 'bottom 20%',
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress
            setXrayProgress(p)
            // Clip-path reveals the technical underlayer across the WeCom table
            // Diagonal/vertical editorial slice from left-to-right
            const clipPct = Math.round(p * 100)
            if (xrayLayerRef.current) {
              xrayLayerRef.current.style.clipPath = `polygon(0 0, ${clipPct}% 0, ${Math.max(0, clipPct - 15)}% 100%, 0 100%)`
            }
          },
        })
      }

      // 2. Hero Request Focus Trigger
      if (heroRequestRef.current) {
        ScrollTrigger.create({
          trigger: heroRequestRef.current,
          start: 'top 65%',
          onEnter: () => setIsRequestFocused(true),
          onLeaveBack: () => setIsRequestFocused(false),
        })
      }

      // 3. Typography Transition trigger: mono -> sans
      if (courseListRef.current) {
        ScrollTrigger.create({
          trigger: courseListRef.current,
          start: 'top 55%',
          onEnter: () => setTextMode('sans'),
          onLeaveBack: () => setTextMode('mono'),
        })
      }
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="school-import"
      ref={rootRef}
      className="relative w-full bg-[#FBFBFD] select-none pt-16 sm:pt-20 md:pt-28 pb-24 sm:pb-32 md:pb-40 overflow-hidden transition-colors duration-700"
    >
      {/* =====================================================================
          1. EDITORIAL OPENING: Bold, wide, expansive editorial typography
         ===================================================================== */}
      <div className="w-full px-6 sm:px-10 md:px-16 lg:px-24 mb-14 sm:mb-20">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <span className="text-[11.5px] sm:text-[13px] font-mono tracking-widest uppercase text-neutral-400">
              EDITORIAL X-RAY · 05
            </span>
            <span className="w-8 h-[1px] bg-neutral-300" />
            <span className="text-[11.5px] sm:text-[13px] font-mono text-neutral-500">
              Inside WeCom WebView
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal tracking-[-0.04em] text-neutral-950 leading-[1.12] max-w-5xl mb-6 sm:mb-8">
            <span className="inline-block">课表藏在企业微信里。</span>
            <br />
            <span className="font-semibold text-neutral-950 inline-block">我们把它找出来。</span>
          </h2>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4 border-t border-black/[0.08]">
            <p className="text-lg sm:text-xl md:text-2xl text-neutral-600 font-normal leading-relaxed max-w-xl">
              连接本机无线调试，在企业微信打开「我的课表」。剩下的，由应用完成。
            </p>
            <div className="text-xs sm:text-sm font-mono text-neutral-400 shrink-0">
              无需教务密码 · 不保存登录凭证 · 本地提取
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. THE EDITORIAL X-RAY STAGE (Moment 1 & 2)
          Large-scale WeCom Schedule (occupies 65-75% width, dramatic asymmetrical crop)
          with a live X-Ray cut revealing the underlying CDP / Network layer beneath!
         ===================================================================== */}
      <div className="w-full px-6 sm:px-10 md:px-16 lg:px-24 mb-24 sm:mb-32">
        <div className="w-full max-w-6xl mx-auto">
          {/* Header of the Stage */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/[0.06] font-mono text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="text-neutral-900 font-semibold uppercase">Layer 01</span>
              <span>/ WeCom Surface</span>
            </div>
            <div className="flex items-center gap-3">
              <span>X-Ray Slice: {Math.round(xrayProgress * 100)}%</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            </div>
          </div>

          {/* Dual-Layered X-Ray Canvas */}
          <div
            id="xray-viewport-stage"
            className="relative w-full rounded-[24px] sm:rounded-[32px] border border-black/[0.08] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden"
          >
            {/* ---------------------------------------------------------------
                BASE LAYER: The Authentic WeCom School Timetable
               --------------------------------------------------------------- */}
            <div className="w-full bg-[#F7F8FA]">
              {/* WeCom App Chrome */}
              <div className="px-5 sm:px-7 py-3.5 bg-[#EDEDED] border-b border-black/[0.06] flex items-center justify-between text-neutral-800">
                <div className="flex items-center gap-2 font-medium text-xs sm:text-sm">
                  <ChevronLeft className="w-4 h-4 text-neutral-700" />
                  <span>山东商务职业学院 · 我的课表</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-500">
                  <RefreshCw className="w-4 h-4" />
                  <MoreHorizontal className="w-4 h-4" />
                </div>
              </div>

              {/* Subtitle week selector bar */}
              <div className="px-5 sm:px-7 py-2 bg-[#F2F3F5] border-b border-black/[0.04] flex items-center justify-between text-xs text-neutral-600">
                <span>2026-2027学年 第一学期</span>
                <span className="font-semibold text-neutral-900 px-2 py-0.5 rounded bg-white/70">
                  第 7 周 (本周)
                </span>
              </div>

              {/* Large Timetable Grid (Spacious, bold crop) */}
              <div className="w-full p-4 sm:p-6 bg-white overflow-x-auto">
                <div className="min-w-[620px]">
                  {/* Table Weekday Header */}
                  <div className="grid grid-cols-6 text-xs sm:text-sm text-center font-medium text-neutral-600 pb-2.5 border-b border-neutral-100">
                    <div className="text-neutral-400 font-mono text-xs">节次</div>
                    {SCHOOL_WEEKDAYS.map((w, idx) => (
                      <div
                        key={w.day}
                        className={idx === 0 ? 'text-neutral-950 font-bold' : 'text-neutral-600'}
                      >
                        {w.day}
                      </div>
                    ))}
                  </div>

                  {/* 4 Time Bands (Periods 1-8) */}
                  <div className="space-y-2 pt-2">
                    {SCHEDULE_TIME_BANDS.map((band) => (
                      <div key={band.bandIndex} className="grid grid-cols-6 gap-2 min-h-[72px] sm:min-h-[82px] items-stretch">
                        {/* Period Column */}
                        <div className="flex flex-col items-center justify-center text-xs text-neutral-400 font-mono bg-neutral-50 rounded-lg p-1 border border-neutral-100">
                          <span className="font-semibold text-neutral-600">{band.periodRangeLabel}</span>
                          <span className="text-[11px] text-neutral-400 mt-0.5">{band.appTime}</span>
                        </div>

                        {/* 5 Weekday Columns */}
                        {SCHOOL_WEEKDAYS.map((_, dayIdx) => {
                          const course = courseBySlot.get(`${dayIdx}-${band.bandIndex}`)
                          if (!course) {
                            return (
                              <div
                                key={dayIdx}
                                className="bg-[#FAFBFD] rounded-lg border border-neutral-100/70"
                              />
                            )
                          }
                          const isMonday = dayIdx === 0
                          return (
                            <div
                              key={dayIdx}
                              style={{
                                backgroundColor: isMonday ? course.sourceColor : `${course.sourceColor}33`,
                                color: isMonday ? '#FFFFFF' : '#333333',
                              }}
                              className={`rounded-lg p-2 sm:p-2.5 flex flex-col justify-between text-xs transition-transform duration-200 ${
                                isMonday ? 'font-semibold shadow-xs ring-1 ring-black/10' : 'opacity-85'
                              }`}
                            >
                              <div className="line-clamp-2 leading-tight">{course.name}</div>
                              <div className="text-[10px] sm:text-[11px] opacity-90 truncate mt-1">
                                {course.shortLocation}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Viewport footer banner */}
              <div className="px-5 py-2.5 bg-[#FAFAFA] border-t border-black/[0.04] text-xs font-mono text-neutral-400 flex items-center justify-between">
                <span>SURFACE: Tencent XWeb WebView 4.1.32</span>
                <span>STATUS: In-Foreground</span>
              </div>
            </div>

            {/* ---------------------------------------------------------------
                OVERLAID X-RAY LAYER (Cutout reveals technical inner layer)
                In the exact same coordinate space, rendered with high-contrast
                architectural precision.
               --------------------------------------------------------------- */}
            <div
              ref={xrayLayerRef}
              style={{
                clipPath: 'polygon(0 0, 35% 0, 20% 100%, 0 100%)',
                willChange: 'clip-path',
              }}
              className="absolute inset-0 bg-[#0E1015] text-white flex flex-col pointer-events-none select-none z-10"
            >
              {/* Technical Inspection Header */}
              <div className="px-5 sm:px-7 py-3.5 bg-[#16181E] border-b border-white/[0.08] flex items-center justify-between font-mono text-xs text-neutral-400">
                <div className="flex items-center gap-2.5 text-neutral-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-white">CDP INSPECTION CONTEXT</span>
                  <span className="text-neutral-500">·</span>
                  <span className="text-neutral-400">127.0.0.1:41392 (Local Loopback)</span>
                </div>
                <span className="text-emerald-400 font-medium">SESSION ATTACHED</span>
              </div>

              {/* Sub-bar */}
              <div className="px-5 sm:px-7 py-2 bg-[#12141A] border-b border-white/[0.06] flex items-center justify-between font-mono text-xs text-neutral-400">
                <span>PROTOCOL: Chrome DevTools Protocol (XWeb Hook)</span>
                <span>TARGET: WebView ID 0x8F21</span>
              </div>

              {/* Network Inspection Feed (Inside the X-Ray Cut) */}
              <div className="flex-1 p-5 sm:p-7 font-mono flex flex-col justify-center space-y-3">
                <div className="text-[11px] uppercase tracking-widest text-neutral-500">
                  Captured Network Stream (Network.responseReceived)
                </div>

                <div className="space-y-2 text-xs sm:text-sm">
                  {/* Dimmed background requests */}
                  <div className="flex items-center justify-between text-neutral-600 border-b border-white/[0.04] pb-1.5">
                    <span className="truncate">GET  /static/css/schedule.min.css</span>
                    <span className="text-neutral-600">200 OK  [css]</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-600 border-b border-white/[0.04] pb-1.5">
                    <span className="truncate">GET  /static/js/app-vendor.bundle.js</span>
                    <span className="text-neutral-600">200 OK  [js]</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-600 border-b border-white/[0.04] pb-1.5">
                    <span className="truncate">GET  /wap/index.html</span>
                    <span className="text-neutral-600">200 OK  [document]</span>
                  </div>

                  {/* KEY REQUEST: High contrast inside X-Ray */}
                  <div className="p-3.5 rounded-xl bg-white/[0.08] border border-white/20 flex items-center justify-between text-white font-semibold shadow-lg">
                    <div className="flex items-center gap-3 truncate">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono">
                        POST
                      </span>
                      <span className="text-sm sm:text-base text-white truncate font-mono">
                        /wap/mycourseschedule.action
                      </span>
                    </div>
                    <span className="text-emerald-400 font-mono text-sm sm:text-base ml-2">
                      200 OK
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] font-mono text-neutral-500">
                  ↳ Target payload detected: Course schedule array [9 blocks, 6 courses]
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. THE BREAKTHROUGH HERO MOMENT: Request Blowup (Moment 4)
          The request breaks free of the table and becomes a MASSIVE TYPOGRAPHIC HEADLINE!
         ===================================================================== */}
      <div
        id="hero-request-stage"
        ref={heroRequestRef}
        className="w-full px-6 sm:px-10 md:px-16 lg:px-24 mb-16 sm:mb-24"
      >
        <div className="w-full max-w-6xl mx-auto">
          {/* Subtle Technical Meta Line */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-neutral-400 pb-3 mb-3 border-b border-black/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-neutral-900 font-semibold uppercase">METHOD: POST</span>
              <span>· Content-Type: application/json</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">STATUS:</span>
              <span className="text-emerald-600 font-bold">200 OK</span>
            </div>
          </div>

          {/* MONUMENTAL REQUEST HEADLINE */}
          <div
            className={`transition-all duration-500 py-3 sm:py-6 ${
              isRequestFocused ? 'opacity-100 scale-100' : 'opacity-90'
            }`}
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[76px] font-bold font-mono tracking-tight text-neutral-950 leading-[1.05] break-all sm:break-normal">
              /wap/mycourseschedule.action
            </h1>
          </div>

          <div className="text-sm sm:text-base text-neutral-500 font-normal mt-2 max-w-2xl leading-relaxed">
            找到了真正的课表数据接口。无需解析网页 HTML，直接截获教务系统原始排课响应。
          </div>
        </div>
      </div>

      {/* =====================================================================
          4. EDITORIAL DATA POSTER (Moment 5)
          Request unfurls into large typographic metrics: 07 / 06 / 09
          Directly laid out on the page with Swiss poster typography.
         ===================================================================== */}
      <div
        id="data-poster-stage"
        ref={dataPosterRef}
        className="w-full px-6 sm:px-10 md:px-16 lg:px-24 mb-20 sm:mb-28"
      >
        <div className="w-full max-w-6xl mx-auto border-t-2 border-neutral-950 pt-8 sm:pt-12">
          {/* Giant Typographic Numbers Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 pb-10 sm:pb-14 border-b border-black/[0.08]">
            {/* Metric 1 */}
            <div className="flex flex-col items-start">
              <span className="text-xs sm:text-sm font-mono tracking-widest text-neutral-400 uppercase mb-2">
                ACADEMIC WEEK
              </span>
              <div className="text-7xl sm:text-8xl md:text-9xl font-bold font-mono tracking-tighter text-neutral-950 leading-none">
                07
              </div>
              <span className="text-xs sm:text-sm text-neutral-500 mt-3 font-mono">
                10月12日 — 10月16日
              </span>
            </div>

            {/* Metric 2 */}
            <div className="flex flex-col items-start">
              <span className="text-xs sm:text-sm font-mono tracking-widest text-neutral-400 uppercase mb-2">
                DISTINCT COURSES
              </span>
              <div className="text-7xl sm:text-8xl md:text-9xl font-bold font-mono tracking-tighter text-neutral-950 leading-none">
                06
              </div>
              <span className="text-xs sm:text-sm text-neutral-500 mt-3 font-mono">
                本周必修与选修课
              </span>
            </div>

            {/* Metric 3 */}
            <div className="flex flex-col items-start">
              <span className="text-xs sm:text-sm font-mono tracking-widest text-neutral-400 uppercase mb-2">
                SCHEDULED BLOCKS
              </span>
              <div className="text-7xl sm:text-8xl md:text-9xl font-bold font-mono tracking-tighter text-neutral-950 leading-none">
                09
              </div>
              <span className="text-xs sm:text-sm text-neutral-500 mt-3 font-mono">
                周一至周五节次块
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          5. TYPOGRAPHY TRANSITION: Network Code -> Human Courses (Moment 6)
          From mono technical data to elegant human editorial course content.
         ===================================================================== */}
      <div
        id="course-list-stage"
        ref={courseListRef}
        className="w-full px-6 sm:px-10 md:px-16 lg:px-24 mb-24 sm:mb-36"
      >
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-black/[0.08] font-mono text-xs text-neutral-400">
            <span>RESOLVED TIMETABLE ENTRIES</span>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Typography Identity:</span>
              <span className="font-semibold text-neutral-950 uppercase">
                {textMode === 'mono' ? 'Raw Payload [Mono]' : 'Human Readable [Sans]'}
              </span>
            </div>
          </div>

          {/* 3 Real Structured Course Rows with Smooth Font Transition */}
          <div className="divide-y divide-black/[0.08]">
            {mondayCourses.map((c) => (
              <div
                key={c.id}
                className="py-6 sm:py-8 flex flex-col md:flex-row md:items-baseline justify-between gap-4 transition-all duration-500"
              >
                {/* Time range */}
                <div className="w-48 shrink-0 font-mono text-neutral-400 text-sm sm:text-base">
                  {c.startPeriod === 1 ? '08:00 – 09:40' : c.startPeriod === 3 ? '10:00 – 11:40' : '14:00 – 15:50'}
                  <span className="text-xs text-neutral-300 ml-2">第 {c.startPeriod}-{c.endPeriod} 节</span>
                </div>

                {/* Course Name with Morphing Typography Identity */}
                <div className="flex-1">
                  <div
                    className={`text-2xl sm:text-3xl md:text-4xl text-neutral-950 transition-all duration-500 leading-snug ${
                      textMode === 'sans'
                        ? 'font-medium font-sans tracking-tight'
                        : 'font-mono tracking-tighter text-neutral-800'
                    }`}
                  >
                    {c.name}
                  </div>
                  <div className="text-sm sm:text-base text-neutral-500 mt-2 font-normal">
                    {c.appLocation}
                  </div>
                </div>

                {/* Day Badge */}
                <div className="font-mono text-xs sm:text-sm text-neutral-400 shrink-0">
                  周一 · 第 7 周
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 text-sm text-neutral-500 font-normal leading-relaxed">
            数据在设备端完成结构化归一化，从网络响应对象转化为真实的原生日程。
          </div>
        </div>
      </div>

      {/* =====================================================================
          6. LOCAL / SAVED COMPOSITION (Moment 7)
          Bold typographic tension: LOCAL (top-left) vs SAVED (bottom-right)
          No tiny card box, whole canvas statement.
         ===================================================================== */}
      <div
        id="local-section-stage"
        ref={localSectionRef}
        className="w-full px-6 sm:px-10 md:px-16 lg:px-24 mb-24 sm:mb-32"
      >
        <div className="w-full max-w-6xl mx-auto py-12 sm:py-16 px-8 sm:px-14 rounded-[32px] bg-[#FAF8F5] border border-black/[0.08] relative overflow-hidden">
          {/* Top-Left: LOCAL */}
          <div className="flex items-baseline justify-between mb-8 sm:mb-12">
            <h3 className="text-5xl sm:text-7xl md:text-8xl font-black font-mono tracking-tighter text-neutral-950">
              LOCAL
            </h3>
            <span className="text-xs sm:text-sm font-mono text-neutral-400">
              ENGINE: Room 2.6.1 · SQLite on device
            </span>
          </div>

          {/* Center: Delicate Hairline Rule with Metadata */}
          <div className="w-full py-6 border-y border-black/[0.1] my-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs sm:text-sm text-neutral-600">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-neutral-900">Room Local Database</span>
              <span className="text-neutral-300">·</span>
              <span>Encrypted Keystore</span>
            </div>
            <div>
              <span>Week 7 · 6 courses · 9 blocks persisted</span>
            </div>
          </div>

          {/* Bottom-Right: SAVED */}
          <div className="flex items-baseline justify-between mt-8 sm:mt-12">
            <span className="text-xs sm:text-sm font-mono text-neutral-400">
              Zero cloud telemetry · 完全本地存储
            </span>
            <h3 className="text-5xl sm:text-7xl md:text-8xl font-black font-mono tracking-tighter text-neutral-950 flex items-center gap-3">
              <span>SAVED</span>
              <Check className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-500 inline-block stroke-[3]" />
            </h3>
          </div>
        </div>
      </div>

      {/* =====================================================================
          7. FINAL APP PROOF & COMPLETION COPY (Moment 8)
          App UI occupies ~30% visual proof at the bottom, proving data has entered.
          Ends with confident, calm completion copy.
         ===================================================================== */}
      <div id="final-app-stage" className="w-full px-6 sm:px-10 md:px-16 lg:px-24">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12">
          {/* Left: Completion Copy */}
          <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
            <h3 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-[-0.035em] text-neutral-950 leading-[1.1] mb-4 sm:mb-6">
              已经在本机了。
            </h3>
            <p className="text-lg sm:text-xl text-neutral-600 font-normal leading-relaxed max-w-md mb-4 sm:mb-6">
              之后查课，不需要再打开企业微信。
            </p>
            <div className="text-sm font-mono text-neutral-400 tracking-wide">
              本地保存 · 离线可用 · 零网络依赖
            </div>
          </div>

          {/* Right: Real App Week View Slice (25-35% visual proof) */}
          <div className="w-full lg:w-1/2 max-w-md">
            <div className="text-xs font-mono text-neutral-400 mb-2 flex items-center justify-between">
              <span>PROOF: Native App Week View</span>
              <span className="text-emerald-600 font-medium">Ready</span>
            </div>

            <div className="w-full rounded-2xl border border-black/[0.08] bg-white p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-950 px-2 py-0.5 rounded bg-neutral-100">
                    第 7 周
                  </span>
                  <span className="text-neutral-600 font-medium">周一至周五</span>
                </div>
                <span className="font-mono text-neutral-400">10/12 – 10/16</span>
              </div>

              {/* 3 Native Course Cards */}
              <div className="space-y-2">
                {mondayCourses.map((c) => (
                  <div
                    key={c.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      c.appTheme === 'warm'
                        ? 'bg-[#FCF9F5] border-[#F1E9DE]'
                        : 'bg-[#F9F7FC] border-[#EAE3F3]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-neutral-900 leading-snug">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        {c.shortLocation}
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-neutral-400 shrink-0 ml-3">
                      {c.startPeriod === 1 ? '08:00' : c.startPeriod === 3 ? '10:00' : '14:00'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InspectionWorkspace
