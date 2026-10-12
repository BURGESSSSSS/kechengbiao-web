import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Check, ChevronLeft, Database, Globe, MoreHorizontal, Radio, RefreshCw, Smartphone, Wifi } from 'lucide-react'
import {
  SCHEDULE_TIME_BANDS,
  SCHOOL_IMPORT_COURSES,
  SCHOOL_WEEKDAYS,
  type SchoolImportCourse,
} from './schoolImportData'

gsap.registerPlugin(ScrollTrigger)

type InspectionTab = 'wecom' | 'network' | 'local'

export const InspectionWorkspace: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const stageCardRef = useRef<HTMLDivElement>(null)

  // Active stage tab: 'wecom' (0) -> 'network' (1) -> 'local' (2)
  const [activeTab, setActiveTab] = useState<InspectionTab>('wecom')

  // Map courses by (dayCol, appTimeRow) for compact table rendering
  const courseBySlot = new Map<string, SchoolImportCourse>()
  SCHOOL_IMPORT_COURSES.forEach((c) => {
    courseBySlot.set(`${c.dayCol}-${c.appTimeRow}`, c)
  })

  // Monday courses for inspection extraction preview
  const mondayCourses = SCHOOL_IMPORT_COURSES.filter((c) => c.dayCol === 0)

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageCardRef.current
    if (!section || !stage) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: stage,
        start: 'top 70%',
        end: 'bottom 20%',
        scrub: 0.2,
        onUpdate: (self) => {
          const p = self.progress
          // Seamlessly transition tabs based on reading scroll progress
          if (p < 0.38) {
            setActiveTab('wecom')
          } else if (p < 0.72) {
            setActiveTab('network')
          } else {
            setActiveTab('local')
          }
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="school-import"
      ref={sectionRef}
      className="relative w-full bg-[#FBFBFD] select-none pt-10 sm:pt-14 md:pt-18 pb-14 sm:pb-20 md:pb-24"
    >
      <div className="w-full px-4 sm:px-8 md:px-14 lg:px-20">
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-7 sm:gap-10 md:gap-12 lg:gap-16">
          {/* =================================================================
              Left Column (Desktop 38%): Fixed Narrative Copy
              Harmonized 1:1 with Today / Week / Reminder sections
             ================================================================= */}
          <div className="w-full md:w-[38%] flex flex-col items-start text-left shrink-0">
            <span className="text-[12px] sm:text-[13px] font-medium tracking-widest uppercase text-neutral-400 mb-2.5 block">
              课表导入
            </span>
            <h2
              style={{ lineHeight: 1.22 }}
              className="text-2xl sm:text-4xl md:text-[40px] lg:text-[42px] font-bold tracking-[-0.03em] text-neutral-950"
            >
              课表藏在企业微信里。
              <br />
              我们把它找出来
            </h2>
            <p className="mt-3 sm:mt-5 text-[14.5px] sm:text-base lg:text-[16.5px] text-neutral-500 font-normal leading-relaxed max-w-[390px]">
              连接 Android 本机无线调试，在企业微信中打开「我的课表」。应用直接截获教务系统原始排课接口并保存在本地数据库，无需输入教务密码，离线即可秒级查课。
            </p>

            {/* Architecture Highlights */}
            <div className="mt-5 sm:mt-7 space-y-2.5 text-[12.5px] sm:text-[13.5px] text-neutral-600 font-normal">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>Android 本机无线调试 · 127.0.0.1 闭环通信</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>
                  捕获真实接口 <code className="text-[11.5px] font-mono bg-neutral-200/60 px-1.5 py-0.5 rounded text-neutral-800">/wap/mycourseschedule.action</code>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>Room 本地数据库持久化 · 离线随时可用</span>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 text-[12px] sm:text-[13px] text-neutral-400 font-normal tracking-wide">
              无需教务密码 · 不保存登录凭据 · 完全本地解析
            </div>
          </div>

          {/* =================================================================
              Right Column (Desktop 56%): Reconstructed Native Stage Card
              Harmonized 1:1 with Today / Week / Reminder card dimensions
             ================================================================= */}
          <div className="w-full md:w-[56%] flex items-center justify-center">
            <div
              ref={stageCardRef}
              className="relative w-full max-w-[510px] bg-[#F6F6F6] rounded-[28px] sm:rounded-[34px] p-4 sm:p-6 md:p-7 ring-1 ring-black/[0.05] shadow-[0_12px_36px_-10px_rgba(15,23,42,0.06)] flex flex-col gap-3.5 sm:gap-4"
            >
              {/* 1. Header Row */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <div className="text-[19px] sm:text-[23px] font-bold text-neutral-900 leading-none tracking-tight">
                    课表调试链路
                  </div>
                  <div className="text-[11.5px] sm:text-[12.5px] text-neutral-500 font-normal mt-1.5 flex items-center gap-1.5 sm:gap-2">
                    <span>Android 无线调试</span>
                    <span className="text-neutral-300">·</span>
                    <span className="font-mono text-neutral-400 text-[11px]">127.0.0.1:41392</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] sm:text-[12px] font-medium border border-emerald-200/80 shrink-0">
                  <Wifi className="w-3 h-3 text-emerald-500" />
                  <span>已连接</span>
                </div>
              </div>

              {/* 2. Interactive Segment Control */}
              <div className="grid grid-cols-3 p-1 bg-neutral-200/70 rounded-xl text-[12px] sm:text-[13px] font-medium text-neutral-600">
                <button
                  type="button"
                  onClick={() => setActiveTab('wecom')}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 ${
                    activeTab === 'wecom'
                      ? 'bg-white text-neutral-950 shadow-xs font-semibold'
                      : 'hover:text-neutral-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>企微原表</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('network')}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 ${
                    activeTab === 'network'
                      ? 'bg-white text-neutral-950 shadow-xs font-semibold'
                      : 'hover:text-neutral-900'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>抓取接口</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('local')}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 ${
                    activeTab === 'local'
                      ? 'bg-white text-neutral-950 shadow-xs font-semibold'
                      : 'hover:text-neutral-900'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>本机保存</span>
                </button>
              </div>

              {/* 3. Main Stage Content (Smooth State Switch) */}
              <div className="relative w-full min-h-[300px] sm:min-h-[315px] bg-white rounded-[20px] sm:rounded-[24px] border border-neutral-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.015)] overflow-hidden flex flex-col justify-between">
                {/* -----------------------------------------------------------
                    STATE 1: WeCom Authentic Timetable Surface
                   ----------------------------------------------------------- */}
                {activeTab === 'wecom' && (
                  <div className="w-full flex flex-col h-full animate-in fade-in duration-200">
                    {/* WeCom App Chrome */}
                    <div className="px-3.5 sm:px-4 py-2.5 bg-[#EDEDED] border-b border-black/[0.06] flex items-center justify-between text-neutral-800 text-xs">
                      <div className="flex items-center gap-1.5 font-medium">
                        <ChevronLeft className="w-3.5 h-3.5 text-neutral-600" />
                        <span>山东商务职业学院 · 我的课表</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500">
                        <RefreshCw className="w-3 h-3" />
                        <MoreHorizontal className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Schedule Grid */}
                    <div className="p-3 sm:p-4 bg-[#FAFBFD] flex-1">
                      <div className="grid grid-cols-6 text-[11px] sm:text-xs text-center font-medium text-neutral-500 pb-2 border-b border-neutral-100">
                        <div className="text-neutral-400 font-mono">节次</div>
                        {SCHOOL_WEEKDAYS.map((w, idx) => (
                          <div
                            key={w.day}
                            className={idx === 0 ? 'text-neutral-900 font-semibold' : 'text-neutral-500'}
                          >
                            {w.day}
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1.5 pt-2">
                        {SCHEDULE_TIME_BANDS.map((band) => (
                          <div key={band.bandIndex} className="grid grid-cols-6 gap-1.5 items-stretch min-h-[46px] sm:min-h-[50px]">
                            <div className="flex flex-col items-center justify-center text-[10px] text-neutral-400 font-mono bg-neutral-100/70 rounded-md p-1">
                              <span className="font-semibold text-neutral-600">{band.periodRangeLabel}</span>
                              <span className="text-[9px] text-neutral-400">{band.appTime}</span>
                            </div>

                            {SCHOOL_WEEKDAYS.map((_, dayIdx) => {
                              const course = courseBySlot.get(`${dayIdx}-${band.bandIndex}`)
                              if (!course) {
                                return (
                                  <div
                                    key={dayIdx}
                                    className="bg-white rounded-md border border-neutral-100/70"
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
                                  className={`rounded-md p-1 sm:p-1.5 flex flex-col justify-between text-[10px] leading-tight ${
                                    isMonday ? 'font-medium shadow-2xs' : 'opacity-80'
                                  }`}
                                >
                                  <div className="line-clamp-2">{course.name}</div>
                                  <div className="text-[8.5px] opacity-90 truncate mt-0.5">
                                    {course.shortLocation}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="px-3.5 py-2 bg-[#FAFAFA] border-t border-black/[0.04] text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                      <span>SURFACE: Tencent XWeb WebView</span>
                      <span className="text-emerald-600 font-medium">第 7 周 (本周)</span>
                    </div>
                  </div>
                )}

                {/* -----------------------------------------------------------
                    STATE 2: CDP Network Interception
                   ----------------------------------------------------------- */}
                {activeTab === 'network' && (
                  <div className="w-full p-4 sm:p-5 bg-[#111318] text-white flex flex-col justify-between h-full animate-in fade-in duration-200">
                    <div className="space-y-3">
                      {/* Technical Hook Header */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2 text-neutral-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-semibold text-white">CDP INSPECTION HOOK</span>
                          <span className="text-neutral-500">·</span>
                          <span>127.0.0.1:41392</span>
                        </div>
                        <span className="text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/20">
                          200 OK
                        </span>
                      </div>

                      {/* Key Request Card */}
                      <div className="bg-white/10 rounded-xl p-3 border border-white/10 flex flex-col gap-1.5 font-mono">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10.5px] font-bold">
                              POST
                            </span>
                            <span className="text-white text-[12px] sm:text-[13px] font-semibold truncate">
                              /wap/mycourseschedule.action
                            </span>
                          </div>
                          <span className="text-neutral-400 text-[11px] shrink-0">JSON</span>
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          教务系统原始排课数据响应 · 状态正常
                        </div>
                      </div>

                      {/* Payload Metrics */}
                      <div className="grid grid-cols-3 gap-2 text-center font-mono py-1">
                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                          <div className="text-lg font-bold text-white">07</div>
                          <div className="text-[10px] text-neutral-400 uppercase mt-0.5">Academic Week</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                          <div className="text-lg font-bold text-white">06</div>
                          <div className="text-[10px] text-neutral-400 uppercase mt-0.5">Courses</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                          <div className="text-lg font-bold text-white">09</div>
                          <div className="text-[10px] text-neutral-400 uppercase mt-0.5">Blocks</div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Status */}
                    <div className="pt-2 border-t border-white/10 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                      <span>已成功提取结构化课程数组</span>
                      <span className="text-emerald-400">Ready for Room</span>
                    </div>
                  </div>
                )}

                {/* -----------------------------------------------------------
                    STATE 3: Local Persistence Proof (Room SQLite & Native App UI)
                   ----------------------------------------------------------- */}
                {activeTab === 'local' && (
                  <div className="w-full p-4 sm:p-5 bg-white flex flex-col justify-between h-full animate-in fade-in duration-200">
                    <div className="space-y-3">
                      {/* Room Database Banner */}
                      <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                            <Database className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[13px] sm:text-[14px] font-bold text-neutral-900 flex items-center gap-1.5">
                              <span>Room 2.6.1 · 本地存储</span>
                              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-0.5">
                              SQLite on device · 零云端依赖
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-medium shrink-0">
                          离线可用
                        </span>
                      </div>

                      {/* Native Course Proof Cards */}
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-mono text-neutral-400 flex items-center justify-between px-0.5">
                          <span>NATIVE SCHEDULE PROOF (周一)</span>
                          <span className="text-neutral-600 font-medium">第 7 周</span>
                        </div>

                        {mondayCourses.map((c) => (
                          <div
                            key={c.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                              c.appTheme === 'warm'
                                ? 'bg-[#FCF9F5] border-[#F1E9DE]'
                                : 'bg-[#F9F7FC] border-[#EAE3F3]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  c.appTheme === 'warm' ? 'bg-[#DFB968]' : 'bg-[#A78BFA]'
                                }`}
                              />
                              <div>
                                <div className="font-semibold text-neutral-900 leading-tight">
                                  {c.name}
                                </div>
                                <div className="text-[10.5px] text-neutral-500 mt-0.5">
                                  {c.shortLocation}
                                </div>
                              </div>
                            </div>
                            <span className="font-mono text-[11px] text-neutral-400 shrink-0 ml-2">
                              {c.startPeriod === 1 ? '08:00' : c.startPeriod === 3 ? '10:00' : '14:00'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-neutral-100 text-[11.5px] text-neutral-500 flex items-center justify-between">
                      <span>之后查课，不需要再打开企业微信</span>
                      <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Bottom Explanatory Strip */}
              <div className="px-2 text-[12px] text-neutral-500 font-normal flex items-center justify-between">
                <span>
                  {activeTab === 'wecom' && '在企业微信打开「我的课表」'}
                  {activeTab === 'network' && '截获 /wap/mycourseschedule.action 接口'}
                  {activeTab === 'local' && '数据已入库，打开 App 即可直接离线查看'}
                </span>
                <span className="font-mono text-neutral-400 text-[11px]">
                  {activeTab === 'wecom' && '1/3'}
                  {activeTab === 'network' && '2/3'}
                  {activeTab === 'local' && '3/3'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InspectionWorkspace
