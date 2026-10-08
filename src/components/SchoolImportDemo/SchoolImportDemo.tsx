import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronLeft, ChevronRight, MoreHorizontal, X } from 'lucide-react'
import {
  APP_TIME_ROWS,
  FEATURED_PROCESS_COURSE,
  PHASE05_MOTION_CONFIG,
  PHASE05_STAGE_STEPS,
  SAMPLE_DATA_STRIP_COURSES,
  SCHOOL_IMPORT_COURSES,
  SCHOOL_PERIODS,
  SCHOOL_WEEKDAYS,
  type SchoolImportCourse,
} from './schoolImportData'
import {
  clamp,
  computeFullPhase05CourseState,
  computePhase05MacroState,
  lerp,
  PHASE05B_GLOBAL_END,
  PHASE05B_GLOBAL_START,
  PHASE05C_GLOBAL_END,
  PHASE05C_GLOBAL_START,
  type MorphRect,
  type StageGeometryCache,
} from './courseMorphEngine'
import {
  ImportStageRail,
  MobileStageHeader,
  type StageRailDomRefs,
} from './ImportStageRail'

gsap.registerPlugin(ScrollTrigger)

export type Phase05PreviewState = 'ALL' | 'SOURCE' | 'PROCESS' | 'PREVIEW' | 'DESTINATION'

declare global {
  interface Window {
    __setPhase05State?: (state: Phase05PreviewState) => void
    __setPhase05Progress?: (progress: number) => void
    __getPhase05Progress?: () => number
    __getPhase05Telemetry?: () => unknown
  }
}

function getInitialPhase05State(): Phase05PreviewState {
  if (typeof window === 'undefined') return 'ALL'
  const params = new URLSearchParams(window.location.search)
  const raw = params.get('phase05State')?.toUpperCase()
  if (
    raw === 'SOURCE' ||
    raw === 'PROCESS' ||
    raw === 'PREVIEW' ||
    raw === 'DESTINATION' ||
    raw === 'ALL'
  ) {
    return raw
  }
  return 'ALL'
}

const PROCESS_ROW_INITIAL_OFFSET_X = [7, -5.5, 8.5, -6, 5] as const
const PROCESS_ROW_INITIAL_OFFSET_Y = [-5, -2.5, 0, 2.5, 5] as const

/**
 * 1. SOURCE: 山东商务职业学院企业微信「我的课表」高精重构
 */
export const SourceScheduleStage: React.FC<{
  courses: SchoolImportCourse[]
  registerSourceNode?: (courseId: string, el: HTMLDivElement | null) => void
}> = ({ courses, registerSourceNode }) => {
  const courseBySlot = new Map<string, SchoolImportCourse>()
  const coveredSlots = new Set<string>()

  courses.forEach((course) => {
    courseBySlot.set(`${course.dayCol}-${course.startPeriod}`, course)
    for (let p = course.startPeriod + 1; p <= course.endPeriod; p++) {
      coveredSlots.add(`${course.dayCol}-${p}`)
    }
  })

  return (
    <div
      data-stage-panel="source"
      className="w-full rounded-[22px] bg-white ring-1 ring-black/[0.07] shadow-[0_14px_38px_-12px_rgba(15,23,42,0.08)] overflow-hidden"
    >
      {/* Top WeCom / WebView Dark Bar */}
      <div className="h-9 bg-[#191919] text-white px-3.5 flex items-center justify-between text-[13px] font-medium">
        <div className="flex items-center gap-2.5">
          <X className="w-3.5 h-3.5 text-white/85 stroke-[2.2]" />
          <span className="tracking-tight">我的课表</span>
        </div>
        <MoreHorizontal className="w-4 h-4 text-white/85" />
      </div>

      {/* Second-row Blue Title Bar */}
      <div className="h-9 bg-[#1989FA] text-white px-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[12px] font-normal">
          <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
        </div>
        <span className="text-[13.5px] font-medium tracking-tight">我的课表</span>
        <div className="w-5" />
      </div>

      {/* Semester & Current Week Row */}
      <div className="px-3 py-2 bg-white border-b border-neutral-100 flex items-center justify-between text-[11.5px] text-neutral-700">
        <div className="flex items-center gap-1 font-medium text-neutral-800">
          <span>2026-2027学年第一学期</span>
          <span className="text-[9px] text-neutral-400">▼</span>
        </div>
        <div className="flex items-center gap-1 font-medium text-neutral-700">
          <span>第7周</span>
          <span className="text-[9px] text-neutral-400">▼</span>
        </div>
      </div>

      {/* Month + 5-Day Date Header */}
      <div className="grid grid-cols-[28px_repeat(5,minmax(0,1fr))] border-b border-neutral-100 bg-[#FAFBFD]">
        <div className="py-1.5 flex items-center justify-center text-[10px] text-neutral-500 font-medium border-r border-neutral-100 leading-tight text-center">
          10月
        </div>
        {SCHOOL_WEEKDAYS.map((wd) => (
          <div
            key={wd.day}
            className={`py-1.5 flex flex-col items-center justify-center border-r last:border-r-0 border-neutral-100 ${
              wd.isCurrentDay ? 'bg-[#1989FA] text-white' : 'text-neutral-700'
            }`}
          >
            <span
              className={`text-[10px] leading-tight ${
                wd.isCurrentDay ? 'text-white/95 font-medium' : 'text-neutral-400'
              }`}
            >
              {wd.dateLabel}
            </span>
            <span
              className={`text-[11px] leading-tight mt-0.5 font-medium ${
                wd.isCurrentDay ? 'text-white' : 'text-neutral-700'
              }`}
            >
              {wd.day}
            </span>
          </div>
        ))}
      </div>

      {/* 8-Period × 5-Day School Timetable Grid */}
      <div className="grid grid-cols-[28px_repeat(5,minmax(0,1fr))] grid-rows-[repeat(8,40px)] bg-white">
        {SCHOOL_PERIODS.map((period) => (
          <React.Fragment key={period}>
            {/* Left Period Index Cell */}
            <div
              style={{ gridRow: period, gridColumn: 1 }}
              className="flex items-center justify-center text-[11px] text-neutral-500 font-normal border-r border-b border-neutral-100/90 bg-[#FCFDFE]"
            >
              {period}
            </div>

            {/* 5 Day Columns for this period */}
            {SCHOOL_WEEKDAYS.map((_, dayCol) => {
              const slotKey = `${dayCol}-${period}`
              if (coveredSlots.has(slotKey)) {
                return null
              }

              const course = courseBySlot.get(slotKey)
              if (course) {
                const span = course.endPeriod - course.startPeriod + 1
                return (
                  <div
                    key={slotKey}
                    style={{
                      gridRow: `${period} / span ${span}`,
                      gridColumn: dayCol + 2,
                    }}
                    className="p-[2px] border-r last:border-r-0 border-b border-neutral-100/80 bg-[#FCFDFE]"
                  >
                    <div
                      ref={(el) => registerSourceNode?.(course.id, el)}
                      data-course-id={course.id}
                      data-stage-node="source"
                      data-day-col={course.dayCol}
                      data-start-period={course.startPeriod}
                      data-end-period={course.endPeriod}
                      style={{
                        backgroundColor: course.sourceColor,
                        willChange: 'opacity',
                      }}
                      className="w-full h-full rounded-[5px] px-1.5 py-1 text-white flex flex-col justify-start overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
                    >
                      <div className="text-[10.5px] font-semibold leading-[1.2] tracking-tight break-all line-clamp-3">
                        {course.name}
                      </div>
                      <div className="text-[9px] text-white/92 font-normal leading-[1.18] mt-0.5 break-all line-clamp-3">
                        {course.sourceRawLocation}
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={slotKey}
                  style={{ gridRow: period, gridColumn: dayCol + 2 }}
                  className="border-r last:border-r-0 border-b border-neutral-100/75 bg-white"
                />
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

/**
 * 2. DATA STRIP: 课程数据条（从教务色块抽离出的修长结构化条）
 */
export const DataStripItem: React.FC<{
  course: SchoolImportCourse
  hiddenInStatic?: boolean
  anchorAttr?: string
  initialOpacity?: number
  registerStripEl?: (el: HTMLDivElement | null) => void
}> = ({
  course,
  hiddenInStatic = false,
  anchorAttr,
  initialOpacity,
  registerStripEl,
}) => {
  return (
    <div
      ref={registerStripEl}
      data-course-id={course.id}
      data-stage-node="strip"
      data-process-anchor={anchorAttr}
      data-strip-representative={hiddenInStatic ? 'false' : 'true'}
      style={{
        opacity: initialOpacity !== undefined ? initialOpacity : undefined,
        willChange: 'opacity',
      }}
      className={`${
        hiddenInStatic ? 'hidden' : 'flex'
      } relative items-center w-full h-[38px] rounded-[8px] bg-[#FAFAFC] ring-1 ring-slate-900/[0.08] shadow-[0_2px_6px_rgba(15,23,42,0.03)] px-3 py-2 overflow-hidden`}
    >
      {/* Left 2.5px Source Color Indicator Bar */}
      <span
        aria-hidden="true"
        style={{ backgroundColor: course.sourceColor }}
        className="w-[2.5px] h-3.5 rounded-full shrink-0 mr-2"
      />
      <div className="text-[12px] sm:text-[12.5px] text-neutral-800 font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
        <span>{course.name}</span>
        <span className="mx-1 text-neutral-300">·</span>
        <span className="text-neutral-600 font-normal">{course.day}</span>
        <span className="mx-1 text-neutral-300">·</span>
        <span className="text-neutral-600 font-normal">
          {course.startPeriod}–{course.endPeriod}节
        </span>
        <span className="mx-1 text-neutral-300">·</span>
        <span className="text-neutral-600 font-normal">{course.shortLocation}</span>
      </div>
    </div>
  )
}

/**
 * 2B. PREVIEW ROW ITEM: Corridor 2 结构化预览行槽位（课程名 + 星期 · 节次 · 地点）
 */
const Corridor2PreviewRowItem: React.FC<{
  course: SchoolImportCourse
  initialOpacity?: number
  anchorAttr?: string
  registerRowEl?: (el: HTMLDivElement | null) => void
}> = ({ course, initialOpacity = 0, anchorAttr, registerRowEl }) => {
  return (
    <div
      ref={registerRowEl}
      data-course-id={course.id}
      data-stage-node={anchorAttr ?? 'corridor2-row'}
      style={{
        opacity: initialOpacity,
        willChange: 'opacity',
      }}
      className="relative flex items-center justify-between gap-3 h-[42px] rounded-[9px] bg-white ring-1 ring-slate-900/[0.075] shadow-[0_2px_8px_-2px_rgba(15,23,42,0.03)] px-3.5 overflow-hidden"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          aria-hidden="true"
          style={{ backgroundColor: course.sourceColor }}
          className="w-[6px] h-[6px] rounded-full shrink-0 opacity-90"
        />
        <span className="text-[12.5px] sm:text-[13px] text-neutral-900 font-medium tracking-tight truncate">
          {course.displayName}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-[12px] text-neutral-600 font-normal shrink-0 tabular-nums">
        <span>
          {course.day} · 第{course.startPeriod}–{course.endPeriod}节
        </span>
        <span className="text-neutral-300">·</span>
        <span className="text-neutral-500">{course.shortLocation}</span>
      </div>
    </div>
  )
}

/**
 * 3. PROCESS: 中央数据整理区（Section 11: 固定代表课程 Node.js应用开发 展开为 5 行字段对齐 + 其余 8 门静态弱化 Data Strip）
 */
export const ProcessOrganizerStage: React.FC<{
  courses: SchoolImportCourse[]
  featuredCourse: SchoolImportCourse
  representativeStrips: SchoolImportCourse[]
  stripLaneTopRef?: React.MutableRefObject<HTMLDivElement | null>
  stripLaneBottomRef?: React.MutableRefObject<HTMLDivElement | null>
  processBoxRef?: React.MutableRefObject<HTMLDivElement | null>
  staticStripPlaceholderRef?: React.MutableRefObject<HTMLDivElement | null>
  staticProcessFieldsRef?: React.MutableRefObject<HTMLDivElement | null>
  processStatusLabelRef?: React.MutableRefObject<HTMLSpanElement | null>
  registerSecondaryStripEl?: (courseId: string, el: HTMLDivElement | null) => void
}> = ({
  courses,
  featuredCourse,
  stripLaneTopRef,
  stripLaneBottomRef,
  processBoxRef,
  staticStripPlaceholderRef,
  staticProcessFieldsRef,
  processStatusLabelRef,
  registerSecondaryStripEl,
}) => {
  const secondaryCourses = courses.filter((c) => c.id !== featuredCourse.id)

  const structuredFields = [
    { label: '课程', value: featuredCourse.displayName },
    { label: '星期', value: featuredCourse.day },
    {
      label: '节次',
      value: `${featuredCourse.startPeriod}–${featuredCourse.endPeriod}`,
    },
    { label: '地点', value: featuredCourse.shortLocation },
    { label: '周次', value: featuredCourse.weekLabel },
  ]

  return (
    <div
      data-stage-panel="process"
      className="w-full rounded-[22px] bg-white ring-1 ring-slate-900/[0.07] shadow-[0_14px_38px_-12px_rgba(15,23,42,0.07)] p-4 sm:p-5 flex flex-col gap-3.5"
    >
      {/* Card Header */}
      <div className="pb-2.5 border-b border-slate-900/[0.07] flex items-center justify-between">
        <span className="text-[14px] font-semibold text-neutral-950 tracking-tight">
          结构化抽取
        </span>
        <span
          ref={processStatusLabelRef}
          className="text-[12px] text-neutral-500 font-medium transition-colors"
        >
          提取课程字段
        </span>
      </div>

      {/* Section A: Featured Course Entry Data Strip Slot (Node.js应用开发) */}
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[8px] border border-dashed border-slate-900/[0.07] bg-slate-900/[0.012]"
        />
        <div ref={staticStripPlaceholderRef} style={{ willChange: 'opacity' }}>
          <DataStripItem
            course={featuredCourse}
            hiddenInStatic={false}
            anchorAttr="strip-lane-0"
            registerStripEl={(el) => {
              if (stripLaneTopRef) stripLaneTopRef.current = el
              if (stripLaneBottomRef) stripLaneBottomRef.current = el
            }}
          />
        </div>
      </div>

      {/* Section B: 5-Row Field Alignment Structure for Node.js应用开发 */}
      <div
        ref={processBoxRef}
        data-course-id={featuredCourse.id}
        data-stage-node="process"
        data-process-anchor="field-table"
        className="relative w-full rounded-[12px] bg-[#FAFAFC] ring-1 ring-slate-900/[0.06] px-4 py-1.5"
      >
        <div
          ref={staticProcessFieldsRef}
          style={{ willChange: 'opacity' }}
          className="divide-y divide-slate-900/[0.06]"
        >
          {structuredFields.map((field) => (
            <div
              key={field.label}
              className="py-2.5 flex items-baseline justify-between gap-4 text-[13px]"
            >
              <span className="text-neutral-500 font-medium shrink-0">
                {field.label}
              </span>
              <span className="text-neutral-950 font-semibold text-right truncate">
                {field.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section C: Remaining 8 Courses in Subdued / Secondary Data Strip State */}
      <div className="pt-1.5 border-t border-slate-900/[0.05] flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium px-0.5">
          <span>其余已抽取课程数据条</span>
          <span className="tabular-nums">{secondaryCourses.length} 门就绪</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 opacity-60">
          {secondaryCourses.map((course) => (
            <div
              key={course.id}
              ref={(el) => registerSecondaryStripEl?.(course.id, el)}
              data-secondary-strip={course.id}
              style={{ willChange: 'opacity' }}
              className="flex items-center h-[30px] rounded-[6px] bg-[#FAFAFC] ring-1 ring-slate-900/[0.06] px-2.5 overflow-hidden"
            >
              <span
                aria-hidden="true"
                style={{ backgroundColor: course.sourceColor }}
                className="w-[2px] h-3 rounded-full shrink-0 mr-1.5 opacity-80"
              />
              <span className="text-[11px] text-neutral-700 font-medium truncate">
                {course.displayName}
              </span>
              <span className="ml-auto pl-1.5 text-[10px] text-neutral-400 shrink-0 tabular-nums">
                {course.day} {course.startPeriod}–{course.endPeriod}节
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * 4. PREVIEW: 导入预览态（Sections 11–12: 导入课表 · 第7周 | 共 9 门课程 + 完整 9 门课程列表：课程名、星期、节次、地点）
 */
export const ImportPreviewStage: React.FC<{
  courses: SchoolImportCourse[]
  registerPreviewNode?: (courseId: string, el: HTMLDivElement | null) => void
  panelRef?: React.MutableRefObject<HTMLDivElement | null>
  countBadgeRef?: React.MutableRefObject<HTMLSpanElement | null>
}> = ({ courses, registerPreviewNode, panelRef, countBadgeRef }) => {
  return (
    <div
      ref={panelRef}
      data-stage-panel="preview"
      className="w-full rounded-[22px] bg-white ring-1 ring-slate-900/[0.07] shadow-[0_14px_38px_-12px_rgba(15,23,42,0.07)] px-5 py-4"
    >
      {/* Preview Header */}
      <div className="pb-2.5 border-b border-slate-900/[0.07] flex items-center justify-between">
        <span
          data-preview-header-title="true"
          className="text-[14px] font-semibold text-neutral-950 tracking-tight"
        >
          导入课表 · 第7周
        </span>
        <span
          ref={countBadgeRef}
          data-preview-header-count="true"
          className="text-[12px] text-neutral-500 font-medium tabular-nums"
        >
          共 {courses.length} 门课程
        </span>
      </div>

      {/* Structured 9-Course Preview Rows (Course Name + Weekday + Period + Location) */}
      <div className="divide-y divide-slate-900/[0.055]">
        {courses.map((course) => (
          <div
            key={course.id}
            ref={(el) => registerPreviewNode?.(course.id, el)}
            data-course-id={course.id}
            data-stage-node="preview"
            style={{ willChange: 'opacity' }}
            className="py-2.5 flex items-center justify-between gap-3 text-[12.5px] sm:text-[13px]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                aria-hidden="true"
                style={{ backgroundColor: course.sourceColor }}
                className="w-[6px] h-[6px] rounded-full shrink-0 opacity-90"
              />
              <span className="text-neutral-900 font-medium truncate">
                {course.displayName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] sm:text-[12.5px] text-neutral-600 font-normal shrink-0 tabular-nums">
              <span>
                {course.day} · 第{course.startPeriod}–{course.endPeriod}节
              </span>
              <span className="text-neutral-300">·</span>
              <span className="text-neutral-500">{course.shortLocation}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 5. DESTINATION: 课程表 App 本地周视图（完全复用 Phase 03 视觉语言，Phase 05C 接收批量课程写入）
 */
export const DestinationAppWeekStage: React.FC<{
  courses: SchoolImportCourse[]
  registerDestinationNode?: (courseId: string, el: HTMLDivElement | null) => void
  destinationGridRef?: React.MutableRefObject<HTMLDivElement | null>
  completionCopyRef?: React.MutableRefObject<HTMLDivElement | null>
  initialStaticCompleted?: boolean
}> = ({
  courses,
  registerDestinationNode,
  destinationGridRef,
  completionCopyRef,
  initialStaticCompleted = false,
}) => {
  const courseByAppSlot = new Map<string, SchoolImportCourse>()
  courses.forEach((course) => {
    courseByAppSlot.set(`${course.dayCol}-${course.appTimeRow}`, course)
  })

  return (
    <div data-stage-panel="destination" className="w-full lg:max-w-[720px] flex flex-col">
      <div className="relative w-full bg-[#F6F6F6] rounded-[24px] sm:rounded-[28px] p-3.5 sm:p-5 lg:px-5 lg:py-3.5 ring-1 ring-black/[0.05] shadow-[0_12px_36px_-10px_rgba(15,23,42,0.06)]">
        {/* 1. Top Bar: 第 7 周 + Date Range + 编辑 / 导入 */}
        <div className="flex items-start justify-between px-1">
          <div>
            <div className="text-[21px] sm:text-[24px] lg:text-[22px] font-bold text-neutral-900 leading-none tracking-tight">
              第 7 周
            </div>
            <div className="text-[11px] sm:text-[12px] lg:text-[11.5px] text-neutral-500 font-normal mt-1 lg:mt-0.5">
              10月12日 - 10月16日
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="px-3 py-1 rounded-full bg-white text-neutral-900 text-[11px] sm:text-[12px] font-normal border border-neutral-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              编辑
            </span>
            <span className="px-3 py-1 rounded-full bg-white text-neutral-900 text-[11px] sm:text-[12px] font-normal border border-neutral-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              导入
            </span>
          </div>
        </div>

        {/* 2. Week Navigation Row */}
        <div className="flex items-center gap-1.5 mt-2.5 lg:mt-2 px-0.5">
          <span
            aria-hidden="true"
            className="w-6 h-5 rounded-full bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <ChevronLeft className="w-3 h-3 stroke-[2.2]" />
          </span>
          <span
            aria-hidden="true"
            className="w-6 h-5 rounded-full bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <ChevronRight className="w-3 h-3 stroke-[2.2]" />
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white border border-neutral-200/80 text-[11px] text-neutral-900 font-normal shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            回到本周
          </span>
          <span className="ml-1.5 text-[11px] text-neutral-800 font-normal">
            复制到下周
          </span>
        </div>

        {/* 3. Weekday Header Row + 5×4 Course Grid */}
        <div ref={destinationGridRef} className="relative mt-3 lg:mt-2">
          {/* Weekday Headers: 周一 12 ~ 周五 16 */}
          <div className="flex items-end mb-1.5 lg:mb-1">
            <div className="w-7 sm:w-8 lg:w-9 shrink-0" />
            <div className="flex-1 grid grid-cols-5 gap-1.5 lg:gap-2">
              {SCHOOL_WEEKDAYS.map((wd) => (
                <div key={wd.day} className="flex flex-col items-center justify-center">
                  <span className="text-[10px] sm:text-[11px] text-neutral-500 font-normal leading-tight">
                    {wd.day}
                  </span>
                  <span className="text-[12px] sm:text-[13px] lg:text-[12.5px] text-neutral-900 font-medium leading-tight mt-0.5">
                    {wd.appDate}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 5 × 4 Slots */}
          <div className="flex flex-col gap-1.5 lg:gap-1.5">
            {APP_TIME_ROWS.map((timeLabel, rowIdx) => (
              <div key={timeLabel} className="flex items-start">
                <div className="w-7 sm:w-8 lg:w-9 pt-1.5 text-[9.5px] sm:text-[10.5px] text-neutral-500 font-normal shrink-0 leading-none">
                  {timeLabel}
                </div>

                <div className="flex-1 grid grid-cols-5 gap-1.5 lg:gap-2">
                  {SCHOOL_WEEKDAYS.map((_, colIdx) => {
                    const slotKey = `${colIdx}-${rowIdx}`
                    const course = courseByAppSlot.get(slotKey)

                    return (
                      <div
                        key={slotKey}
                        data-destination-cell={slotKey}
                        className="relative h-[74px] sm:h-[80px] lg:h-[75px] rounded-[11px] sm:rounded-[13px] lg:rounded-[13px] bg-[#EAEAEA]"
                      >
                        {course && (
                          <div
                            ref={(el) => registerDestinationNode?.(course.id, el)}
                            data-course-id={course.id}
                            data-stage-node="destination"
                            data-day-col={course.dayCol}
                            data-time-row={course.appTimeRow}
                            style={{
                              opacity: initialStaticCompleted ? 1 : 0,
                              willChange: 'opacity',
                            }}
                            className={`w-full h-full rounded-[11px] sm:rounded-[13px] lg:rounded-[13px] p-1.5 lg:px-2 lg:py-1.5 overflow-hidden flex flex-col justify-start ${
                              course.appTheme === 'warm'
                                ? 'bg-[#F3ECE1] text-[#5E3704]'
                                : 'bg-[#E9E7F7] text-[#2B1B54]'
                            }`}
                          >
                            <div className="shrink-0 text-[10px] sm:text-[11px] lg:text-[11px] font-semibold leading-[1.2] tracking-tight line-clamp-2 break-all">
                              {course.name}
                            </div>
                            <div
                              className={`overflow-hidden line-clamp-2 text-[8.5px] sm:text-[9.5px] lg:text-[9.5px] font-normal leading-[1.18] mt-0.5 break-all ${
                                course.appTheme === 'warm'
                                  ? 'text-[#6D440E]'
                                  : 'text-[#3D2C6E]'
                              }`}
                            >
                              {course.appLocation}
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

      {/* Completion Status Copy (Tightly grouped with Destination) */}
      <div
        ref={completionCopyRef}
        data-completion-status="true"
        style={{
          opacity: initialStaticCompleted ? 1 : 0,
          transform: initialStaticCompleted ? 'translate3d(0, 0px, 0)' : 'translate3d(0, 6px, 0)',
          willChange: 'opacity, transform',
        }}
        className="mt-2.5 lg:mt-2 px-1.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1"
      >
        <div className="text-[13.5px] sm:text-[14px] text-neutral-900 font-semibold tracking-tight">
          导入完成。
          <span className="ml-1.5 font-normal text-neutral-600">
            之后查课，不需要再打开教务系统。
          </span>
        </div>
        <div className="text-[11.5px] text-neutral-400 font-normal shrink-0">
          课程写入本地 · 后续查看完全离线
        </div>
      </div>
    </div>
  )
}

/**
 * Phase 05 Long Page Prototype (Round 2):
 * Spatial Narrative Long Page:
 * Section Header -> ZONE 1 (Source) -> CORRIDOR 1 (200vh) -> ZONE 2 (Process)
 * -> CORRIDOR 2 (170vh, D=34vh, S=17vh) -> ZONE 3 (Preview + Reading Space, 100vh)
 * Zero pin, zero sticky Main Stage, locally sticky StageRail, zero wheel interception.
 */
export const SchoolImportDemo: React.FC = () => {
  const [previewState, setPreviewState] = useState<Phase05PreviewState>(getInitialPhase05State)

  const sectionRef = useRef<HTMLElement | null>(null)
  const sourceZoneRef = useRef<HTMLDivElement | null>(null)
  const corridor1Ref = useRef<HTMLDivElement | null>(null)
  const processZoneRef = useRef<HTMLDivElement | null>(null)
  const corridor2Ref = useRef<HTMLDivElement | null>(null)
  const previewZoneRef = useRef<HTMLDivElement | null>(null)
  const previewPanelRef = useRef<HTMLDivElement | null>(null)
  const previewCountBadgeRef = useRef<HTMLSpanElement | null>(null)

  // StageRail & MobileStageHeader DOM refs (updated directly in applyGlobalProgress)
  const railRefs = useRef<StageRailDomRefs>({
    masterFillBar: null,
    stepNodes: [],
    stepSegmentFills: [],
    stepCodes: [],
    stepTitles: [],
    stepSubtitles: [],
    transitionHintEl: null,
    transitionHint2El: null,
    mobileStepCode: null,
    mobileStepTitle: null,
    mobileStepSubtitle: null,
    mobileProgressBar: null,
  })

  // Static stage node refs for geometry measurement & opacity handoff
  const staticSourceRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const staticCorridorStripRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const staticSecondaryStripRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const staticCorridor2RowRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const staticPreviewRowRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const stripLaneTopRef = useRef<HTMLDivElement | null>(null)
  const stripLaneBottomRef = useRef<HTMLDivElement | null>(null)
  const processBoxRef = useRef<HTMLDivElement | null>(null)
  const staticStripPlaceholderRef = useRef<HTMLDivElement | null>(null)
  const staticProcessFieldsRef = useRef<HTMLDivElement | null>(null)
  const processStatusLabelRef = useRef<HTMLSpanElement | null>(null)

  // CourseMorphOverlay DOM refs (1 set per course, updated directly without React re-renders)
  const morphCardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const morphBarRefs = useRef<Record<string, HTMLSpanElement | null>>({})
  const morphSourceLayerRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const morphStripLayerRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const morphNormBadgeRefs = useRef<Record<string, HTMLSpanElement | null>>({})
  const morphProcessLayerRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const morphProcessRowLabelRefs = useRef<Record<string, (HTMLSpanElement | null)[]>>({})
  const morphProcessRowValRefs = useRef<Record<string, (HTMLSpanElement | null)[]>>({})
  const morphPreviewLayerRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const morphCompactLayerRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const morphDestinationLayerRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Cached geometry & current scroll progress
  const currentProgressRef = useRef<number>(0)
  const geometryCacheRef = useRef<StageGeometryCache>({
    isMobile: false,
    viewportHeight: 900,
    stageWidth: 1200,
    stageHeight: 4800,
    stripLaneTopRect: { x: 340, y: 1800, width: 480, height: 38 },
    stripLaneBottomRect: { x: 340, y: 1800, width: 480, height: 38 },
    processBoxRect: { x: 340, y: 1860, width: 480, height: 210 },
    destinationGridTopY: 0,
    courses: {},
  })

  useEffect(() => {
    window.__setPhase05State = (nextState: Phase05PreviewState) => {
      setPreviewState(nextState)
    }
    return () => {
      delete window.__setPhase05State
    }
  }, [])

  useEffect(() => {
    if (previewState !== 'ALL') return

    const section = sectionRef.current
    const sourceZone = sourceZoneRef.current
    if (!section || !sourceZone) return

    const toRelativeRect = (el: HTMLElement | null, rootBox: DOMRect): MorphRect => {
      if (!el) return { x: 0, y: 0, width: 0, height: 0 }
      const r = el.getBoundingClientRect()
      return {
        x: r.left - rootBox.left,
        y: r.top - rootBox.top,
        width: r.width,
        height: r.height,
      }
    }

    /**
     * Measure and cache all stage geometry in sectionRef local coordinates
     * (localTop = elementRect.top - sectionRect.top, no scrollY added).
     */
    const measureStageGeometry = () => {
      const rootBox = section.getBoundingClientRect()
      if (rootBox.width === 0 || rootBox.height === 0) return

      const isMobile = window.innerWidth < 1024
      const topLane = toRelativeRect(stripLaneTopRef.current, rootBox)
      const bottomLane = toRelativeRect(stripLaneBottomRef.current, rootBox)
      const procBox = toRelativeRect(processBoxRef.current, rootBox)

      const coursesMap: StageGeometryCache['courses'] = {}
      for (const course of SCHOOL_IMPORT_COURSES) {
        const srcEl = staticSourceRefs.current[course.id]
        const stripEl = staticCorridorStripRefs.current[course.id]
        const secStripEl = staticSecondaryStripRefs.current[course.id]
        const c2RowEl = staticCorridor2RowRefs.current[course.id]
        const prevRowEl = staticPreviewRowRefs.current[course.id]

        const stripR = toRelativeRect(stripEl, rootBox)
        const prevR = prevRowEl ? toRelativeRect(prevRowEl, rootBox) : procBox
        const c2RowR = c2RowEl ? toRelativeRect(c2RowEl, rootBox) : prevR

        coursesMap[course.id] = {
          sourceRect: toRelativeRect(srcEl, rootBox),
          stripRect: stripR,
          secondaryStripRect: secStripEl ? toRelativeRect(secStripEl, rootBox) : stripR,
          corridor2RowRect: c2RowR,
          previewRect: prevR,
          destinationRect: prevR,
        }
      }

      geometryCacheRef.current = {
        isMobile,
        viewportHeight: window.innerHeight || 900,
        stageWidth: rootBox.width,
        stageHeight: rootBox.height,
        stripLaneTopRect: topLane,
        stripLaneBottomRect: bottomLane.width > 0 ? bottomLane : topLane,
        processBoxRect: procBox,
        destinationGridTopY: procBox.y,
        courses: coursesMap,
      }
    }

    /**
     * Pure DOM state application for Long Page Round 2 progress p in [0, 1].
     */
    const applyGlobalProgress = (rawP: number) => {
      const p = clamp(rawP, 0, 1)
      currentProgressRef.current = p
      const geom = geometryCacheRef.current
      const macro = computePhase05MacroState(p, SCHOOL_IMPORT_COURSES)

      // 0. Update Desktop Editorial Timeline StageRail & MobileStageHeader continuously
      const rRefs = railRefs.current
      for (let idx = 0; idx < macro.railSteps.length; idx++) {
        const stepState = macro.railSteps[idx]
        const segEl = rRefs.stepSegmentFills[idx]
        if (segEl) {
          segEl.style.height = `${(stepState.segmentFill * 100).toFixed(1)}%`
          segEl.style.width = `${stepState.railWidthPx.toFixed(2)}px`
          segEl.style.backgroundColor = stepState.railColor
        }
        const nodeEl = rRefs.stepNodes[idx]
        if (nodeEl) {
          nodeEl.style.width = `${stepState.nodeSizePx.toFixed(2)}px`
          nodeEl.style.height = `${stepState.nodeSizePx.toFixed(2)}px`
          nodeEl.style.backgroundColor = stepState.nodeColor
        }
        const codeEl = rRefs.stepCodes[idx]
        if (codeEl) {
          codeEl.style.color = stepState.codeColor
          codeEl.style.fontWeight = String(stepState.titleWeight)
        }
        const titleEl = rRefs.stepTitles[idx]
        if (titleEl) {
          titleEl.style.color = stepState.titleColor
          titleEl.style.fontWeight = String(stepState.titleWeight)
        }
        const subEl = rRefs.stepSubtitles[idx]
        if (subEl) {
          subEl.style.color = stepState.subtitleColor
        }
      }

      if (rRefs.transitionHintEl) {
        rRefs.transitionHintEl.style.opacity = macro.corridorTransitionHintOpacity.toFixed(3)
        rRefs.transitionHintEl.style.transform = `translate3d(0, ${macro.corridorTransitionHintY.toFixed(2)}px, 0)`
      }
      if (rRefs.transitionHint2El) {
        rRefs.transitionHint2El.style.opacity = macro.corridor2TransitionHintOpacity.toFixed(3)
        rRefs.transitionHint2El.style.transform = `translate3d(0, ${macro.corridor2TransitionHintY.toFixed(2)}px, 0)`
      }

      const activeMeta = PHASE05_STAGE_STEPS[macro.activeStepIndex]
      if (rRefs.mobileStepCode) {
        rRefs.mobileStepCode.textContent = `${activeMeta.code} / 04`
      }
      if (rRefs.mobileStepTitle) {
        rRefs.mobileStepTitle.textContent = activeMeta.title
      }
      if (rRefs.mobileStepSubtitle) {
        rRefs.mobileStepSubtitle.textContent = activeMeta.subtitle
      }
      if (rRefs.mobileProgressBar) {
        rRefs.mobileProgressBar.style.width = `${clamp(macro.railProgressPct, 4, 100).toFixed(1)}%`
      }

      // Container visual weight hierarchy (Section 15: Preview = 100%, upstream de-weights)
      if (corridor1Ref.current) {
        corridor1Ref.current.style.opacity = macro.corridor1ContainerOpacity.toFixed(3)
      }
      if (processZoneRef.current) {
        processZoneRef.current.style.opacity = macro.processStageOpacity.toFixed(3)
      }
      if (corridor2Ref.current) {
        corridor2Ref.current.style.opacity = macro.corridor2ContainerOpacity.toFixed(3)
      }

      for (let i = 0; i < SCHOOL_IMPORT_COURSES.length; i++) {
        const course = SCHOOL_IMPORT_COURSES[i]
        const state = computeFullPhase05CourseState(p, course, i, geom)

        // 1. Static Source Node opacity
        const srcEl = staticSourceRefs.current[course.id]
        if (srcEl) {
          srcEl.style.opacity = state.staticSourceOpacity.toFixed(3)
        }

        // 2. Static Corridor 1 Data Strip opacity
        const corridorStripEl = staticCorridorStripRefs.current[course.id]
        if (corridorStripEl) {
          corridorStripEl.style.opacity = (state.staticCorridorStripOpacity ?? 0).toFixed(3)
        }

        // 2b. Static Process Secondary Strip opacity
        const secStripEl = staticSecondaryStripRefs.current[course.id]
        if (secStripEl) {
          secStripEl.style.opacity = (state.staticSecondaryStripOpacity ?? 1).toFixed(3)
        }

        // 2c. Static Corridor 2 Preview Row Slot opacity
        const c2RowEl = staticCorridor2RowRefs.current[course.id]
        if (c2RowEl) {
          c2RowEl.style.opacity = (state.staticCorridor2RowOpacity ?? 0).toFixed(3)
        }

        // 2d. Static ImportPreviewStage Row opacity
        const prevRowEl = staticPreviewRowRefs.current[course.id]
        if (prevRowEl) {
          prevRowEl.style.opacity = state.staticPreviewOpacity.toFixed(3)
        }

        // 3. Morph Overlay Card
        const cardEl = morphCardRefs.current[course.id]
        if (!cardEl) continue

        if (!state.visible || state.overlayOpacity <= 0.001) {
          cardEl.style.opacity = '0'
          cardEl.style.visibility = 'hidden'
          continue
        }

        cardEl.style.visibility = 'visible'
        cardEl.style.opacity = state.overlayOpacity.toFixed(3)
        cardEl.style.zIndex = String(state.zIndex)
        cardEl.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0) scale(${state.scale.toFixed(4)})`
        cardEl.style.width = `${state.width.toFixed(2)}px`
        cardEl.style.height = `${state.height.toFixed(2)}px`
        cardEl.style.borderRadius = `${state.borderRadius.toFixed(1)}px`
        cardEl.style.backgroundColor = state.backgroundColor
        cardEl.style.borderColor = `rgba(15, 23, 42, ${state.borderAlpha.toFixed(3)})`

        const sh = state.shadowStrength
        if (sh > 0.01) {
          const y1 = (4 + 12 * sh).toFixed(1)
          const b1 = (10 + 20 * sh).toFixed(1)
          const a1 = (0.03 + 0.09 * sh).toFixed(3)
          cardEl.style.boxShadow = `0 ${y1}px ${b1}px -4px rgba(15, 23, 42, ${a1})`
        } else {
          cardEl.style.boxShadow = 'none'
        }

        // 3a. Left Source Color Bar -> Preview Identity Dot
        const barEl = morphBarRefs.current[course.id]
        if (barEl) {
          const dotT = state.leftBarToDotProgress
          const procT = state.processLayerOpacity
          const w = lerp(2.5, 6, dotT)
          const h = lerp(14, 6, dotT)
          const leftPx = lerp(lerp(12, 8, procT), 14, dotT)
          const topPct = lerp(50, 10, procT * (1 - dotT))
          barEl.style.opacity = state.leftBarOpacity.toFixed(3)
          barEl.style.width = `${w.toFixed(2)}px`
          barEl.style.height = `${h.toFixed(2)}px`
          barEl.style.left = `${leftPx.toFixed(2)}px`
          barEl.style.top = `${topPct.toFixed(1)}%`
        }

        // 3b. Layer 1: Source Text Layer
        const srcLayer = morphSourceLayerRefs.current[course.id]
        if (srcLayer) {
          srcLayer.style.opacity = state.sourceTextOpacity.toFixed(3)
          srcLayer.style.visibility =
            state.sourceTextOpacity > 0.005 ? 'visible' : 'hidden'
        }

        // 3c. Layer 2: Data Strip Text Layer
        const stripLayer = morphStripLayerRefs.current[course.id]
        if (stripLayer) {
          stripLayer.style.opacity = state.stripTextOpacity.toFixed(3)
          stripLayer.style.visibility =
            state.stripTextOpacity > 0.005 ? 'visible' : 'hidden'
        }
        const badgeEl = morphNormBadgeRefs.current[course.id]
        if (badgeEl) {
          badgeEl.style.display = state.isNormalizedStrip ? 'inline-flex' : 'none'
        }

        // 3d. Layer 3: Process 5-Row Field Alignment Layer
        const procLayer = morphProcessLayerRefs.current[course.id]
        if (procLayer) {
          procLayer.style.opacity = state.processLayerOpacity.toFixed(3)
          procLayer.style.visibility =
            state.processLayerOpacity > 0.005 ? 'visible' : 'hidden'

          if (state.processLayerOpacity > 0.005) {
            const labels = morphProcessRowLabelRefs.current[course.id] || []
            const vals = morphProcessRowValRefs.current[course.id] || []
            const unaligned = 1 - state.processAlignT
            for (let r = 0; r < 5; r++) {
              const lbl = labels[r]
              if (lbl) {
                lbl.style.opacity = state.processLabelOpacity.toFixed(3)
              }
              const val = vals[r]
              if (val) {
                const ox = PROCESS_ROW_INITIAL_OFFSET_X[r] * unaligned
                const oy = PROCESS_ROW_INITIAL_OFFSET_Y[r] * unaligned
                val.style.transform = `translate3d(${ox.toFixed(2)}px, ${oy.toFixed(2)}px, 0)`
              }
            }
          }
        }

        // 3e. Layer 4: Preview Row Layer (Sections 4–6: Course Name + Weekday · Period · Location)
        const prevLayer = morphPreviewLayerRefs.current[course.id]
        if (prevLayer) {
          prevLayer.style.opacity = state.previewTextOpacity.toFixed(3)
          prevLayer.style.visibility =
            state.previewTextOpacity > 0.005 ? 'visible' : 'hidden'
        }

        // 3f. Layers 5..6 (kept hidden in Round 2; Destination is out of scope)
        const compactLayer = morphCompactLayerRefs.current[course.id]
        if (compactLayer) {
          compactLayer.style.opacity = '0'
          compactLayer.style.visibility = 'hidden'
        }
        const destLayer = morphDestinationLayerRefs.current[course.id]
        if (destLayer) {
          destLayer.style.opacity = '0'
          destLayer.style.visibility = 'hidden'
        }
      }

      // 4. Process Zone Static Placeholders Handoff (Node.js应用开发 entry strip -> 5-row field table)
      if (staticStripPlaceholderRef.current) {
        staticStripPlaceholderRef.current.style.opacity =
          macro.staticProcessEntryOpacity.toFixed(3)
      }

      if (staticProcessFieldsRef.current) {
        staticProcessFieldsRef.current.style.opacity =
          macro.staticProcessFieldsOpacity.toFixed(3)
      }

      if (processStatusLabelRef.current) {
        if (macro.corridor2P > 0.08) {
          processStatusLabelRef.current.textContent = '字段已收拢为预览行 · Node.js应用开发'
        } else if (macro.processP >= 0.85) {
          processStatusLabelRef.current.textContent = '已完成字段对齐 · Node.js应用开发'
        } else {
          processStatusLabelRef.current.textContent = '提取课程字段'
        }
      }

      if (previewCountBadgeRef.current) {
        previewCountBadgeRef.current.textContent = `共 ${SCHOOL_IMPORT_COURSES.length} 门课程`
      }
    }

    // Expose deterministic progress setter & telemetry for verification
    window.__setPhase05Progress = (targetP: number) => {
      measureStageGeometry()
      applyGlobalProgress(targetP)
    }
    window.__getPhase05Progress = () => currentProgressRef.current
    window.__getPhase05Telemetry = () => ({
      globalP: currentProgressRef.current,
      macro: computePhase05MacroState(currentProgressRef.current, SCHOOL_IMPORT_COURSES),
      motionConfig: PHASE05_MOTION_CONFIG,
    })

    // Initial measurement & p = 0 state
    measureStageGeometry()
    applyGlobalProgress(0)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sourceZone,
        start: () => (window.innerWidth < 1024 ? 'top top+=110' : 'top top+=240'),
        end: () =>
          `+=${Math.round(
            (window.innerHeight || 900) * (PHASE05_MOTION_CONFIG.totalActiveScrollVh / 100),
          )}`,
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          measureStageGeometry()
          applyGlobalProgress(self.progress)
        },
        onUpdate: (self) => {
          applyGlobalProgress(self.progress)
        },
      })
    }, section)

    const handleResizeOrRefresh = () => {
      measureStageGeometry()
      ScrollTrigger.refresh()
      applyGlobalProgress(currentProgressRef.current)
    }

    const resizeObserver = new ResizeObserver(() => {
      measureStageGeometry()
      applyGlobalProgress(currentProgressRef.current)
    })
    resizeObserver.observe(section)

    window.addEventListener('resize', handleResizeOrRefresh)
    window.addEventListener('load', handleResizeOrRefresh)
    document.fonts?.ready?.then(handleResizeOrRefresh)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResizeOrRefresh)
      window.removeEventListener('load', handleResizeOrRefresh)
      delete window.__setPhase05Progress
      delete window.__getPhase05Progress
      delete window.__getPhase05Telemetry
      ctx.revert()
    }
  }, [previewState])

  const showSource = previewState === 'ALL' || previewState === 'SOURCE'
  const showProcess = previewState === 'ALL' || previewState === 'PROCESS'
  const showPreview = previewState === 'ALL' || previewState === 'PREVIEW'

  // Sort courses by corridor2Index (0..5) for Corridor 2 intermediate stream slots
  const corridor2StreamCourses = [...SCHOOL_IMPORT_COURSES]
    .sort((a, b) => a.corridor2Index - b.corridor2Index)
    .filter((c) => c.corridor2Index <= 5)

  return (
    <section
      id="school-import-demo"
      ref={sectionRef}
      data-phase05-state={previewState}
      data-phase05-architecture="spatial-long-page-round-2"
      data-corridor-d-vh={PHASE05_MOTION_CONFIG.corridorCourseDurationVh}
      data-corridor-s-vh={PHASE05_MOTION_CONFIG.corridorCourseStaggerVh}
      data-corridor1-height-vh={PHASE05_MOTION_CONFIG.corridor1HeightVh}
      data-source-overlap-ratio={PHASE05_MOTION_CONFIG.sourceCorridorOverlapRatio}
      data-process-overlap-ratio={PHASE05_MOTION_CONFIG.processCorridorOverlapRatio}
      data-corridor2-d-vh={PHASE05_MOTION_CONFIG.corridor2CourseDurationVh}
      data-corridor2-s-vh={PHASE05_MOTION_CONFIG.corridor2CourseStaggerVh}
      data-corridor2-height-vh={PHASE05_MOTION_CONFIG.corridor2HeightVh}
      data-process-corridor2-overlap-ratio={PHASE05_MOTION_CONFIG.processCorridor2OverlapRatio}
      data-preview-corridor2-overlap-ratio={PHASE05_MOTION_CONFIG.previewCorridor2OverlapRatio}
      data-preview-zone-height-vh={PHASE05_MOTION_CONFIG.previewZoneMinVh}
      data-phase05b-start={PHASE05B_GLOBAL_START}
      data-phase05b-end={PHASE05B_GLOBAL_END}
      data-phase05c-start={PHASE05C_GLOBAL_START}
      data-phase05c-end={PHASE05C_GLOBAL_END}
      className="relative w-full bg-[#FBFBFD] select-none overflow-x-clip -mt-[300px] sm:-mt-[340px] md:-mt-[380px] pt-8 sm:pt-12 md:pt-14 pb-[180px] sm:pb-[220px] md:pb-[260px]"
    >
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="w-full max-w-7xl mx-auto">
          {/* =================================================================
              PART 1: SECTION HEADER
             ================================================================= */}
          <div data-zone="section-header" className="max-w-2xl">
            <h2
              style={{ lineHeight: 1.16 }}
              className="text-2xl sm:text-4xl md:text-[42px] lg:text-[44px] font-bold tracking-[-0.03em] text-neutral-950"
            >
              把学校里的课表带进来。
            </h2>
            <p className="mt-3.5 sm:mt-4 text-[16px] sm:text-[18px] text-neutral-700 font-normal leading-relaxed">
              在企业微信打开“我的课表”，完成采集后直接导入。课程写入本地，之后查课不再依赖教务系统。
            </p>
            <p className="mt-2.5 text-[13.5px] sm:text-[14px] text-neutral-600 font-medium tracking-tight">
              无需输入教务密码 · 导入后离线可用
            </p>
          </div>

          {/* Mobile Compact Stage Indicator (Normal Document Flow, Non-Sticky) */}
          {previewState === 'ALL' && (
            <div className="mt-6 lg:hidden">
              <MobileStageHeader railRefs={railRefs} />
            </div>
          )}

          {/* =================================================================
              SPATIAL NARRATIVE TWO-COLUMN FLOW:
              - Left Column: Locally sticky Stage Rail (ONLY Stage Rail is sticky)
              - Right Column: Normal scrolling Long Page:
                SourceZone -> Corridor 1 -> ProcessZone -> Corridor 2 -> PreviewZone
             ================================================================= */}
          <div className="mt-8 sm:mt-10 lg:mt-12 flex flex-col lg:flex-row lg:items-stretch gap-6 lg:gap-12">
            {previewState === 'ALL' && <ImportStageRail railRefs={railRefs} />}

            <div className="flex-1 min-w-0">
              {/* =============================================================
                  PART 2: ZONE 1 · SOURCE
                  Normal document flow; stays visible in upper viewport during
                  the first ~28% of Corridor 1 via spatial overlap.
                 ============================================================= */}
              {showSource && (
                <div
                  ref={sourceZoneRef}
                  data-zone="source"
                  className="relative z-10 min-h-[56vh] flex items-start"
                >
                  <div className="w-full max-w-[560px]">
                    <SourceScheduleStage
                      courses={SCHOOL_IMPORT_COURSES}
                      registerSourceNode={(id, el) => {
                        staticSourceRefs.current[id] = el
                      }}
                    />
                  </div>
                </div>
              )}

              {/* =============================================================
                  PART 3: CORRIDOR 1 · SOURCE -> PROCESS (Round 2 Section 1 Tweak)
                  Height = 200vh (D1=40vh, S1=20vh).
                  - Front 28% (-56vh) overlaps with SourceZone
                  - Back 44% (-88vh on ProcessZone, +12% earlier than Round 1.1)
                 ============================================================= */}
              {previewState === 'ALL' && (
                <div
                  ref={corridor1Ref}
                  data-corridor="source-to-process"
                  data-corridor-front-overlap={PHASE05_MOTION_CONFIG.sourceCorridorOverlapRatio}
                  data-corridor-back-overlap={PHASE05_MOTION_CONFIG.processCorridorOverlapRatio}
                  style={{
                    height: `${PHASE05_MOTION_CONFIG.corridor1HeightVh}vh`,
                    marginTop: `-${Math.round(
                      PHASE05_MOTION_CONFIG.corridor1HeightVh *
                        PHASE05_MOTION_CONFIG.sourceCorridorOverlapRatio,
                    )}vh`,
                    willChange: 'opacity',
                  }}
                  className="relative z-10 pointer-events-none"
                >
                  <div className="w-full max-w-[560px] h-full relative">
                    {SCHOOL_IMPORT_COURSES.map((course, idx) => {
                      // 9 Data Strip slots distributed from 54vh to 162vh (just above Process card at 176vh)
                      const topVh = 54 + idx * 13.5
                      const topPct = (topVh / PHASE05_MOTION_CONFIG.corridor1HeightVh) * 100
                      return (
                        <div
                          key={course.id}
                          style={{ top: `${topPct.toFixed(2)}%` }}
                          className="absolute left-0 right-0 -translate-y-1/2"
                        >
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 rounded-[8px] border border-dashed border-slate-900/[0.05] bg-slate-900/[0.008]"
                          />
                          <DataStripItem
                            course={course}
                            initialOpacity={0}
                            anchorAttr={`corridor-strip-${idx}`}
                            registerStripEl={(el) => {
                              staticCorridorStripRefs.current[course.id] = el
                            }}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* =============================================================
                  PART 4: ZONE 2 · PROCESS
                  Overlaps the last 44% (-88vh) of Corridor 1 (+12% earlier than
                  Round 1.1 per Section 1) so ProcessOrganizerStage rises into
                  the lower viewport while the last few Data Strips finish.
                 ============================================================= */}
              {showProcess && (
                <div
                  ref={processZoneRef}
                  data-zone="process"
                  style={
                    previewState === 'ALL'
                      ? {
                          marginTop: `-${Math.round(
                            PHASE05_MOTION_CONFIG.corridor1HeightVh *
                              PHASE05_MOTION_CONFIG.processCorridorOverlapRatio,
                          )}vh`,
                          paddingTop: '64vh',
                          willChange: 'opacity',
                        }
                      : undefined
                  }
                  className="relative z-20 flex items-start"
                >
                  <div className="w-full max-w-[560px]">
                    <ProcessOrganizerStage
                      courses={SCHOOL_IMPORT_COURSES}
                      featuredCourse={FEATURED_PROCESS_COURSE}
                      representativeStrips={SAMPLE_DATA_STRIP_COURSES}
                      stripLaneTopRef={stripLaneTopRef}
                      stripLaneBottomRef={stripLaneBottomRef}
                      processBoxRef={processBoxRef}
                      staticStripPlaceholderRef={staticStripPlaceholderRef}
                      staticProcessFieldsRef={staticProcessFieldsRef}
                      processStatusLabelRef={processStatusLabelRef}
                      registerSecondaryStripEl={(id, el) => {
                        staticSecondaryStripRefs.current[id] = el
                      }}
                    />
                  </div>
                </div>
              )}

              {/* =============================================================
                  PART 5: CORRIDOR 2 · PROCESS -> PREVIEW (Sections 2–11)
                  Exact Height = (9 - 1) * 17 + 34 = 170vh (D2=34vh, S2=17vh).
                  - Front 28% (-48vh) overlaps with ProcessZone
                  - Back 34% (-58vh on PreviewZone) overlaps with PreviewZone
                 ============================================================= */}
              {previewState === 'ALL' && (
                <div
                  ref={corridor2Ref}
                  data-corridor="process-to-preview"
                  data-corridor-front-overlap={PHASE05_MOTION_CONFIG.processCorridor2OverlapRatio}
                  data-corridor-back-overlap={PHASE05_MOTION_CONFIG.previewCorridor2OverlapRatio}
                  style={{
                    height: `${PHASE05_MOTION_CONFIG.corridor2HeightVh}vh`,
                    marginTop: `-${PHASE05_MOTION_CONFIG.processCorridor2OverlapVh}vh`,
                    willChange: 'opacity',
                  }}
                  className="relative z-10 pointer-events-none"
                >
                  <div className="w-full max-w-[560px] h-full relative">
                    {corridor2StreamCourses.map((course) => {
                      const c2Idx = course.corridor2Index
                      // Distributed from 54vh (just below Process card) to 139vh (above Preview card at 164vh)
                      const topVh = 54 + c2Idx * 17
                      const topPct = (topVh / PHASE05_MOTION_CONFIG.corridor2HeightVh) * 100
                      return (
                        <div
                          key={course.id}
                          style={{ top: `${topPct.toFixed(2)}%` }}
                          className="absolute left-0 right-0 -translate-y-1/2"
                        >
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 rounded-[9px] border border-dashed border-slate-900/[0.05] bg-slate-900/[0.008]"
                          />
                          <Corridor2PreviewRowItem
                            course={course}
                            initialOpacity={0}
                            anchorAttr={`corridor2-row-${c2Idx}`}
                            registerRowEl={(el) => {
                              staticCorridor2RowRefs.current[course.id] = el
                            }}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* =============================================================
                  PART 6: ZONE 3 · PREVIEW + PREVIEW READING SPACE (Sections 11–15)
                  Overlaps the last 34% (-58vh) of Corridor 2 so ImportPreviewStage
                  rises from the bottom of the viewport while the final courses
                  stream in, then glides naturally through a ~103vh Reading Space.
                 ============================================================= */}
              {showPreview && (
                <div
                  ref={previewZoneRef}
                  data-zone="preview"
                  style={
                    previewState === 'ALL'
                      ? {
                          minHeight: `${PHASE05_MOTION_CONFIG.previewZoneMinVh}vh`,
                          marginTop: `-${PHASE05_MOTION_CONFIG.previewCorridor2OverlapVh}vh`,
                          paddingTop: '52vh',
                        }
                      : undefined
                  }
                  className="relative z-20 flex items-start pb-[4vh]"
                >
                  <div className="w-full max-w-[560px]">
                    <ImportPreviewStage
                      courses={SCHOOL_IMPORT_COURSES}
                      panelRef={previewPanelRef}
                      countBadgeRef={previewCountBadgeRef}
                      registerPreviewNode={(id, el) => {
                        staticPreviewRowRefs.current[id] = el
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          CourseMorphOverlay (Sections 18–19):
          Section-relative absolute overlay (position: absolute; inset: 0; pointer-events: none)
          bridging SourceZone -> Corridor 1 -> ProcessZone -> Corridor 2 -> PreviewZone.
         ===================================================================== */}
      {previewState === 'ALL' && (
        <div
          data-course-morph-overlay="true"
          className="pointer-events-none absolute inset-0 z-30"
        >
          {SCHOOL_IMPORT_COURSES.map((course) => {
            const processFields = [
              { label: '课程', value: course.displayName },
              { label: '星期', value: course.day },
              {
                label: '节次',
                value: `${course.startPeriod}–${course.endPeriod}`,
              },
              { label: '地点', value: course.shortLocation },
              { label: '周次', value: course.weekLabel },
            ]

            return (
              <div
                key={course.id}
                ref={(el) => {
                  morphCardRefs.current[course.id] = el
                }}
                data-morph-course-id={course.id}
                style={{
                  left: 0,
                  top: 0,
                  opacity: 0,
                  visibility: 'hidden',
                  transformOrigin: '50% 50%',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(15, 23, 42, 0)',
                  willChange:
                    'transform, width, height, border-radius, background-color, opacity, box-shadow',
                }}
                className="absolute overflow-hidden"
              >
                {/* Continuous Left Color Identity Bar -> Preview Dot */}
                <span
                  ref={(el) => {
                    morphBarRefs.current[course.id] = el
                  }}
                  aria-hidden="true"
                  style={{
                    backgroundColor: course.sourceColor,
                    left: 12,
                    top: '50%',
                    width: 2.5,
                    height: 14,
                    opacity: 0,
                    transform: 'translateY(-50%)',
                  }}
                  className="absolute rounded-full z-20"
                />

                {/* Layer 1: High-Saturation SOURCE Block Content */}
                <div
                  ref={(el) => {
                    morphSourceLayerRefs.current[course.id] = el
                  }}
                  className="absolute inset-0 px-1.5 py-1 text-white flex flex-col justify-start overflow-hidden"
                >
                  <div className="text-[10.5px] font-semibold leading-[1.2] tracking-tight break-all line-clamp-3">
                    {course.name}
                  </div>
                  <div className="text-[9px] text-white/92 font-normal leading-[1.18] mt-0.5 break-all line-clamp-3">
                    {course.sourceRawLocation}
                  </div>
                </div>

                {/* Layer 2: Slender DATA STRIP Content */}
                <div
                  ref={(el) => {
                    morphStripLayerRefs.current[course.id] = el
                  }}
                  style={{ opacity: 0, visibility: 'hidden' }}
                  className="absolute inset-0 pl-5 pr-2.5 flex items-center justify-between gap-1.5 overflow-hidden"
                >
                  <div className="text-[12px] sm:text-[12.5px] text-neutral-800 font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                    <span>{course.displayName}</span>
                    <span className="mx-1 text-neutral-300">·</span>
                    <span className="text-neutral-600 font-normal">{course.day}</span>
                    <span className="mx-1 text-neutral-300">·</span>
                    <span className="text-neutral-600 font-normal">
                      {course.startPeriod}–{course.endPeriod}节
                    </span>
                    <span className="mx-1 text-neutral-300">·</span>
                    <span className="text-neutral-600 font-normal">
                      {course.shortLocation}
                    </span>
                  </div>
                  <span
                    ref={(el) => {
                      morphNormBadgeRefs.current[course.id] = el
                    }}
                    style={{ display: 'none' }}
                    className="shrink-0 px-1.5 py-0.5 rounded bg-slate-900/[0.05] text-[10.5px] text-neutral-600 font-medium tabular-nums"
                  >
                    {course.weekLabel}
                  </span>
                </div>

                {/* Layer 3: PROCESS 5-Row Field Alignment Content */}
                <div
                  ref={(el) => {
                    morphProcessLayerRefs.current[course.id] = el
                  }}
                  style={{ opacity: 0, visibility: 'hidden' }}
                  className="absolute inset-0 px-4 py-1.5 flex flex-col justify-between divide-y divide-slate-900/[0.06] bg-white"
                >
                  {processFields.map((field, rIdx) => (
                    <div
                      key={field.label}
                      className="flex-1 flex items-center justify-between gap-4 text-[13px] overflow-hidden"
                    >
                      <span
                        ref={(el) => {
                          if (!morphProcessRowLabelRefs.current[course.id]) {
                            morphProcessRowLabelRefs.current[course.id] = []
                          }
                          morphProcessRowLabelRefs.current[course.id][rIdx] = el
                        }}
                        className="text-neutral-500 font-medium shrink-0"
                      >
                        {field.label}
                      </span>
                      <span
                        ref={(el) => {
                          if (!morphProcessRowValRefs.current[course.id]) {
                            morphProcessRowValRefs.current[course.id] = []
                          }
                          morphProcessRowValRefs.current[course.id][rIdx] = el
                        }}
                        style={{ willChange: 'transform' }}
                        className="text-neutral-950 font-semibold text-right truncate"
                      >
                        {field.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Layer 4: PREVIEW ROW Content (Course Name + Weekday · Period · Location) */}
                <div
                  ref={(el) => {
                    morphPreviewLayerRefs.current[course.id] = el
                  }}
                  style={{ opacity: 0, visibility: 'hidden' }}
                  className="absolute inset-0 pl-7 pr-3.5 flex items-center justify-between gap-3 overflow-hidden"
                >
                  <span className="text-[12.5px] sm:text-[13px] text-neutral-900 font-medium tracking-tight truncate">
                    {course.displayName}
                  </span>
                  <div className="flex items-center gap-1.5 text-[12px] sm:text-[12.5px] text-neutral-600 font-normal shrink-0 tabular-nums">
                    <span>
                      {course.day} · 第{course.startPeriod}–{course.endPeriod}节
                    </span>
                    <span className="text-neutral-300">·</span>
                    <span className="text-neutral-500">{course.shortLocation}</span>
                  </div>
                </div>

                {/* Layer 5..6 placeholders (retained for future Destination reuse) */}
                <div
                  ref={(el) => {
                    morphCompactLayerRefs.current[course.id] = el
                  }}
                  style={{ opacity: 0, visibility: 'hidden' }}
                  className="hidden"
                />
                <div
                  ref={(el) => {
                    morphDestinationLayerRefs.current[course.id] = el
                  }}
                  style={{ opacity: 0, visibility: 'hidden' }}
                  className="hidden"
                />
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

