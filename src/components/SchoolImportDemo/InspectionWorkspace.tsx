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
  const containerRef = useRef<HTMLDivElement>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [activeRequest, setActiveRequest] = useState(false)
  const [responseExpanded, setResponseExpanded] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Monday courses from the real data
  const mondayCourses = SCHOOL_IMPORT_COURSES.filter((c) => c.dayCol === 0)

  // Map courses by (dayCol, appTimeRow) for the school schedule grid
  const courseBySlot = new Map<string, SchoolImportCourse>()
  SCHOOL_IMPORT_COURSES.forEach((c) => {
    courseBySlot.set(`${c.dayCol}-${c.appTimeRow}`, c)
  })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ctx = gsap.context(() => {
      // 1. Connection trigger: Waiting -> Connected
      ScrollTrigger.create({
        trigger: '#inspection-workspace',
        start: 'top 75%',
        onEnter: () => setIsConnected(true),
        onLeaveBack: () => setIsConnected(false),
      })

      // 2. Network request focal trigger
      ScrollTrigger.create({
        trigger: '#inspection-network-section',
        start: 'top 70%',
        onEnter: () => setActiveRequest(true),
        onLeaveBack: () => setActiveRequest(false),
      })

      // 3. Response expansion trigger
      ScrollTrigger.create({
        trigger: '#inspection-response-section',
        start: 'top 65%',
        onEnter: () => setResponseExpanded(true),
        onLeaveBack: () => setResponseExpanded(false),
      })

      // 4. Local storage Saved trigger
      ScrollTrigger.create({
        trigger: '#inspection-local-section',
        start: 'top 65%',
        onEnter: () => setIsSaved(true),
        onLeaveBack: () => setIsSaved(false),
      })
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="school-import"
      ref={containerRef}
      className="relative w-full bg-[#FBFBFD] select-none pt-12 sm:pt-16 md:pt-20 pb-20 sm:pb-24 md:pb-28"
    >
      {/* =====================================================================
          SECTION HEADER: Clean, editorial, ample whitespace
         ===================================================================== */}
      <div className="w-full px-5 sm:px-8 md:px-14 lg:px-20 mb-10 sm:mb-14 md:mb-16">
        <div className="w-full max-w-6xl mx-auto flex flex-col items-start text-left">
          <span className="text-[12px] sm:text-[13px] font-medium tracking-widest uppercase text-neutral-400 mb-2.5 block">
            本机调试链路
          </span>
          <h2 className="text-[32px] sm:text-5xl md:text-[56px] lg:text-[62px] font-bold tracking-[-0.035em] text-neutral-950 leading-[1.15] md:leading-[1.1] max-w-3xl">
            课表藏在企业微信里。
            <br />
            我们把它找出来。
          </h2>
          <p className="mt-3.5 sm:mt-5 text-[15px] sm:text-[17.5px] md:text-[18.5px] text-neutral-600 font-normal leading-relaxed max-w-[620px]">
            连接本机无线调试，在企业微信打开「我的课表」。剩下的，由应用完成。
          </p>
          <div className="mt-3 sm:mt-4 text-[13px] sm:text-[14px] text-neutral-400 font-normal tracking-wide">
            无需输入教务密码 · 不保存企业微信登录信息
          </div>
        </div>
      </div>

      {/* =====================================================================
          CORE INSPECTION WORKSPACE
          Single, cohesive, flat technical workspace container.
          Two collaborative columns on Desktop; natural vertical flow on Mobile.
         ===================================================================== */}
      <div
        id="inspection-workspace"
        className="w-full px-4 sm:px-6 md:px-10 lg:px-14 max-w-6xl mx-auto"
      >
        <div className="w-full bg-white rounded-[24px] sm:rounded-[32px] border border-black/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Workspace Chrome Bar */}
          <div className="w-full px-5 sm:px-7 py-3.5 sm:py-4 bg-[#FAFAFA] border-b border-black/[0.06] flex items-center justify-between gap-4 text-xs font-mono">
            {/* Left: Session & Connection Status */}
            <div className="flex items-center gap-3">
              <span className="text-neutral-500 font-sans font-medium text-[12.5px] sm:text-[13px]">
                Local session
              </span>
              <span className="text-neutral-300">/</span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-black/[0.06] text-[11.5px] sm:text-[12px]">
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    isConnected ? 'bg-emerald-500' : 'bg-neutral-400'
                  }`}
                />
                <span className={isConnected ? 'text-neutral-900 font-medium' : 'text-neutral-500'}>
                  {isConnected ? 'Connected' : 'Waiting'}
                </span>
              </div>
            </div>

            {/* Right: Debugging Context Identification */}
            <div className="hidden sm:flex items-center gap-2.5 text-neutral-500 text-[11.5px] sm:text-[12px]">
              <span className="text-neutral-400">Target:</span>
              <span className="text-neutral-800 font-medium">WeCom · XWeb</span>
              <span className="text-neutral-300">·</span>
              <span className="text-neutral-500">DevTools Protocol</span>
            </div>
          </div>

          {/* Workspace Interior: Two columns on desktop */}
          <div className="w-full p-5 sm:p-7 md:p-8 flex flex-col lg:flex-row gap-7 md:gap-9 lg:gap-12 items-start">
            {/* -----------------------------------------------------------------
                LEFT PANEL: The Authentic WeCom "我的课表" Viewport
                Stays recognizable and clear throughout the session.
               ----------------------------------------------------------------- */}
            <div className="w-full lg:w-[45%] lg:sticky lg:top-24 flex flex-col shrink-0">
              <div className="text-[12px] font-medium uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center justify-between">
                <span>WeCom · WebView Viewport</span>
                <span className="font-mono text-[11px] text-neutral-400">127.0.0.1:41392</span>
              </div>

              {/* Mobile Frame / WeCom Crop */}
              <div className="w-full rounded-[20px] sm:rounded-[24px] border border-black/[0.08] bg-[#F7F8FA] overflow-hidden shadow-xs">
                {/* WeCom Top Nav Bar */}
                <div className="w-full px-3.5 py-2.5 bg-[#EDEDED] border-b border-black/[0.06] flex items-center justify-between text-neutral-800">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <ChevronLeft className="w-4 h-4 text-neutral-700" />
                    <span>我的课表</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Subtitle Bar: School & Week Info */}
                <div className="px-3.5 py-1.5 bg-[#F2F3F5] border-b border-black/[0.04] flex items-center justify-between text-[11px] text-neutral-500">
                  <span>山东商务职业学院 · 2026-2027-1</span>
                  <span className="font-medium text-neutral-700">第 7 周</span>
                </div>

                {/* School Timetable Table Crop */}
                <div className="w-full p-2.5 bg-white">
                  {/* Weekday Columns (Mon-Fri) */}
                  <div className="grid grid-cols-6 text-[10.5px] text-center font-medium text-neutral-500 pb-1.5 border-b border-neutral-100">
                    <div className="text-neutral-400 text-[10px]">节次</div>
                    {SCHOOL_WEEKDAYS.map((w, idx) => (
                      <div
                        key={w.day}
                        className={idx === 0 ? 'text-neutral-900 font-semibold' : 'text-neutral-500'}
                      >
                        {w.day}
                      </div>
                    ))}
                  </div>

                  {/* Period Rows 1-8 (grouped into 4 bands) */}
                  <div className="w-full space-y-1.5 pt-1.5">
                    {SCHEDULE_TIME_BANDS.map((band) => (
                      <div key={band.bandIndex} className="grid grid-cols-6 gap-1 min-h-[46px] items-stretch">
                        {/* Period label */}
                        <div className="flex flex-col items-center justify-center text-[9.5px] text-neutral-400 font-mono bg-neutral-50 rounded-md p-0.5">
                          <span>{band.oddPeriod}-{band.evenPeriod}</span>
                          <span className="text-[8.5px] text-neutral-400">{band.appTime}</span>
                        </div>

                        {/* 5 Day Cells */}
                        {SCHOOL_WEEKDAYS.map((_, dayIdx) => {
                          const course = courseBySlot.get(`${dayIdx}-${band.bandIndex}`)
                          if (!course) {
                            return (
                              <div
                                key={dayIdx}
                                className="bg-[#FAFBFD] rounded-md border border-neutral-100/60"
                              />
                            )
                          }
                          const isMonday = dayIdx === 0
                          return (
                            <div
                              key={dayIdx}
                              style={{
                                backgroundColor: isMonday ? course.sourceColor : `${course.sourceColor}33`,
                                color: isMonday ? '#FFFFFF' : '#404040',
                              }}
                              className={`rounded-md p-1 flex flex-col justify-between text-[9px] leading-tight transition-opacity duration-300 ${
                                isMonday ? 'opacity-100 font-medium shadow-xs' : 'opacity-70'
                              }`}
                            >
                              <div className="font-semibold line-clamp-2">{course.name}</div>
                              <div className="text-[8px] opacity-85 truncate mt-0.5">
                                {course.shortLocation}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer status caption */}
                <div className="px-3 py-1.5 bg-[#FAFAFA] border-t border-black/[0.04] text-[10.5px] text-neutral-400 flex items-center justify-between">
                  <span>企微内置浏览器内核 (XWeb)</span>
                  <span className="text-neutral-500 font-mono text-[10px]">Active Page</span>
                </div>
              </div>
            </div>

            {/* -----------------------------------------------------------------
                RIGHT PANEL: Inspection Stream (Continuous Downward Journey)
                Network -> Response -> Local -> App Result
               ----------------------------------------------------------------- */}
            <div className="w-full lg:w-[55%] flex flex-col gap-6 sm:gap-8">
              {/* STAGE 1: Wireless debugging status details */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F9F9FB] border border-black/[0.05]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11.5px] font-mono uppercase tracking-wider text-neutral-400">
                    Connection
                  </span>
                  <span className="text-[11.5px] font-mono text-neutral-500">
                    Local loopback / ADB
                  </span>
                </div>
                <div className="text-[13.5px] sm:text-[14px] text-neutral-800 leading-snug">
                  无需物理数据线。设备通过本机无线调试端口建立本地 loopback 调试上下文，识别企业微信内核进程。
                </div>
              </div>

              {/* STAGE 2: Network Activity & Key Request */}
              <div id="inspection-network-section" className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-mono uppercase tracking-wider text-neutral-400">
                    Network Activity
                  </span>
                  <span className="text-[11.5px] font-mono text-neutral-400">
                    4 requests captured
                  </span>
                </div>

                {/* Request list */}
                <div className="w-full rounded-2xl border border-black/[0.06] bg-white overflow-hidden divide-y divide-black/[0.04] font-mono text-xs">
                  {/* Background requests (low contrast) */}
                  <div className="px-3.5 py-2.5 flex items-center justify-between text-neutral-400 bg-neutral-50/50">
                    <span className="truncate">GET /static/css/schedule.min.css</span>
                    <span className="text-neutral-400 shrink-0 ml-2">200 OK</span>
                  </div>
                  <div className="px-3.5 py-2.5 flex items-center justify-between text-neutral-400 bg-neutral-50/50">
                    <span className="truncate">GET /static/js/app-vendor.bundle.js</span>
                    <span className="text-neutral-400 shrink-0 ml-2">200 OK</span>
                  </div>
                  <div className="px-3.5 py-2.5 flex items-center justify-between text-neutral-400 bg-neutral-50/50">
                    <span className="truncate">GET /wap/index.html</span>
                    <span className="text-neutral-400 shrink-0 ml-2">200 OK</span>
                  </div>

                  {/* KEY REQUEST: High contrast focal point */}
                  <div
                    className={`px-3.5 py-3 flex items-center justify-between transition-all duration-300 ${
                      activeRequest
                        ? 'bg-neutral-950 text-white shadow-xs'
                        : 'bg-white text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200">
                        POST
                      </span>
                      <span className="font-semibold text-[13px] tracking-tight truncate">
                        /wap/mycourseschedule.action
                      </span>
                    </div>
                    <span
                      className={`text-[12px] font-bold shrink-0 ml-2 ${
                        activeRequest ? 'text-emerald-400' : 'text-neutral-900'
                      }`}
                    >
                      200
                    </span>
                  </div>
                </div>
              </div>

              {/* STAGE 3: Response Preview (Restrained, Real Technical Evidence) */}
              <div id="inspection-response-section" className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-mono uppercase tracking-wider text-neutral-400">
                    Response Preview
                  </span>
                  <span className="text-[11.5px] font-mono text-emerald-600 font-medium">
                    200 OK · JSON
                  </span>
                </div>

                {/* Restrained Response Card */}
                <div
                  className={`w-full p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
                    responseExpanded
                      ? 'border-neutral-900/20 bg-[#FAFAFA] shadow-xs'
                      : 'border-black/[0.06] bg-white'
                  } flex flex-col gap-3.5`}
                >
                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-md bg-white border border-black/[0.06] text-neutral-800 font-medium">
                      Week 7
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-white border border-black/[0.06] text-neutral-800">
                      Days 5
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-white border border-black/[0.06] text-neutral-800">
                      Periods 8
                    </span>
                    <span className="text-neutral-300">|</span>
                    <span className="px-2.5 py-1 rounded-md bg-white border border-black/[0.06] text-neutral-900 font-semibold">
                      Courses 6
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-white border border-black/[0.06] text-neutral-900 font-semibold">
                      Blocks 9
                    </span>
                  </div>

                  {/* 3 Real Structured Course Items */}
                  <div className="w-full bg-white rounded-xl border border-black/[0.05] p-3.5 divide-y divide-neutral-100 text-[12.5px] sm:text-[13px]">
                    {mondayCourses.map((c) => (
                      <div key={c.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span className="font-mono text-neutral-400 text-xs shrink-0 mt-0.5">
                            {c.startPeriod === 1 ? '08:00' : c.startPeriod === 3 ? '10:00' : '14:00'}
                          </span>
                          <div>
                            <div className="font-medium text-neutral-900 leading-snug">
                              {c.name}
                            </div>
                            <div className="text-[11.5px] text-neutral-500 mt-0.5">
                              {c.shortLocation} · {c.startPeriod}-{c.endPeriod}节
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-neutral-400 shrink-0">
                          周一
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[12px] text-neutral-500 leading-relaxed font-sans">
                    企业微信里的学校课表背后，本身就在返回结构化课程数据。应用在此直接捕获排课对象。
                  </div>
                </div>
              </div>

              {/* STAGE 4: Local Storage (Room · on device) */}
              <div id="inspection-local-section" className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-mono uppercase tracking-wider text-neutral-400">
                    Local Persistence
                  </span>
                  <span className="text-[11.5px] font-mono text-neutral-500">
                    Room · on device
                  </span>
                </div>

                <div className="w-full p-4 sm:p-5 rounded-2xl border border-black/[0.06] bg-[#F9F9FB] flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[14px] font-medium text-neutral-900">
                      课程数据已写入本地数据库
                    </div>
                    <div className="text-[12px] text-neutral-500 mt-0.5">
                      Week 7 · 6 courses · 9 blocks
                    </div>
                  </div>

                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 shadow-xs transition-colors duration-300 ${
                      isSaved
                        ? 'bg-neutral-950 text-white'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    <Check
                      className={`w-3.5 h-3.5 transition-colors duration-300 ${
                        isSaved ? 'text-emerald-400' : 'text-neutral-400'
                      }`}
                    />
                    <span>{isSaved ? 'Saved' : 'Ready'}</span>
                  </div>
                </div>
              </div>

              {/* STAGE 5: Quiet App Result Proof */}
              <div className="flex flex-col gap-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-mono uppercase tracking-wider text-neutral-400">
                    Result in App
                  </span>
                  <span className="text-[11.5px] text-neutral-400 font-sans">
                    本机周视图呈现
                  </span>
                </div>

                {/* Quiet slice of App Week View */}
                <div className="w-full rounded-2xl border border-black/[0.08] bg-white p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-900 px-2 py-0.5 rounded bg-neutral-100">
                        第 7 周
                      </span>
                      <span className="text-xs text-neutral-500">周视图</span>
                    </div>
                    <span className="text-[11px] text-neutral-400">10月12日–10月16日</span>
                  </div>

                  {/* 3 Real course cards rendered in authentic App warm/lavender style */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {mondayCourses.map((c) => (
                      <div
                        key={c.id}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between min-h-[72px] ${
                          c.appTheme === 'warm'
                            ? 'bg-[#FCF9F5] border-[#F1E9DE] text-neutral-900'
                            : 'bg-[#F9F7FC] border-[#EAE3F3] text-neutral-900'
                        }`}
                      >
                        <div>
                          <div className="text-[10px] text-neutral-400 font-mono">
                            {c.startPeriod === 1 ? '08:00' : c.startPeriod === 3 ? '10:00' : '14:00'}
                          </div>
                          <div className="text-[11.5px] font-semibold leading-tight mt-0.5 line-clamp-2">
                            {c.name}
                          </div>
                        </div>
                        <div className="text-[10px] text-neutral-500 truncate mt-1">
                          {c.shortLocation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          SECTION COMPLETION: Quiet, confident narrative conclusion
         ===================================================================== */}
      <div className="w-full px-5 sm:px-8 md:px-14 lg:px-20 mt-12 sm:mt-16 md:mt-20">
        <div className="w-full max-w-6xl mx-auto flex flex-col items-start text-left">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-neutral-950 mb-2.5 sm:mb-3">
            已经在本机了。
          </h3>
          <p className="text-[14.5px] sm:text-base md:text-[17px] text-neutral-600 font-normal leading-relaxed max-w-xl">
            之后查课，不需要再打开企业微信。
          </p>
          <div className="mt-3 text-[13px] sm:text-[14px] text-neutral-400 font-normal tracking-wide">
            本地保存 · 离线可用
          </div>
        </div>
      </div>
    </section>
  )
}
export default InspectionWorkspace
