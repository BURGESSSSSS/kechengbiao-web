import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronLeft, ChevronRight, MoreHorizontal, X } from 'lucide-react'
import {
  APP_TIME_ROWS,
  FEATURED_PROCESS_COURSE,
  SAMPLE_DATA_STRIP_COURSES,
  SCHOOL_IMPORT_COURSES,
  SCHOOL_PERIODS,
  SCHOOL_WEEKDAYS,
  type SchoolImportCourse,
} from './schoolImportData'
import {
  clamp,
  computeCourseMorphState,
  lerp,
  type MorphRect,
  type StageGeometryCache,
} from './courseMorphEngine'

gsap.registerPlugin(ScrollTrigger)

export type Phase05PreviewState = 'ALL' | 'SOURCE' | 'PROCESS' | 'PREVIEW' | 'DESTINATION'

declare global {
  interface Window {
    __setPhase05State?: (state: Phase05PreviewState) => void
    __setPhase05Progress?: (progress: number) => void
    __getPhase05Progress?: () => number
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
  registerStripEl?: (el: HTMLDivElement | null) => void
}> = ({ course, hiddenInStatic = false, anchorAttr, registerStripEl }) => {
  return (
    <div
      ref={registerStripEl}
      data-course-id={course.id}
      data-stage-node="strip"
      data-process-anchor={anchorAttr}
      data-strip-representative={hiddenInStatic ? 'false' : 'true'}
      style={{ willChange: 'opacity' }}
      className={`${
        hiddenInStatic ? 'hidden' : 'flex'
      } relative items-center w-full h-[36px] rounded-[7px] bg-[#FAFAFC] ring-1 ring-slate-900/[0.08] shadow-[0_2px_6px_rgba(15,23,42,0.03)] px-2.5 py-2 overflow-hidden`}
    >
      {/* Left 2.5px Source Color Indicator Bar */}
      <span
        aria-hidden="true"
        style={{ backgroundColor: course.sourceColor }}
        className="w-[2.5px] h-3.5 rounded-full shrink-0 mr-2"
      />
      <div className="text-[11.5px] sm:text-[12px] lg:text-[11.5px] xl:text-[12px] text-neutral-800 font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
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
 * 3. PROCESS: 中央数据整理区（极简细线结构 + Data Strip 通道 + 字段对齐）
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
}> = ({
  courses,
  featuredCourse,
  representativeStrips,
  stripLaneTopRef,
  stripLaneBottomRef,
  processBoxRef,
  staticStripPlaceholderRef,
  staticProcessFieldsRef,
  processStatusLabelRef,
}) => {
  const repIds = new Set(representativeStrips.map((c) => c.id))

  const structuredFields = [
    { label: '课程', value: featuredCourse.displayName },
    { label: '星期', value: featuredCourse.day },
    {
      label: '节次',
      value: `第 ${featuredCourse.startPeriod}–${featuredCourse.endPeriod} 节`,
    },
    { label: '地点', value: featuredCourse.shortLocation },
    { label: '周次', value: featuredCourse.weekLabel },
  ]

  return (
    <div data-stage-panel="process" className="w-full flex flex-col gap-4 py-1">
      {/* Section A: Data Strip Stream Channel */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-medium tracking-[0.04em] text-neutral-400">
            抽取课程数据条
          </span>
          <span className="text-[11px] text-neutral-400 font-normal">DATA STRIP</span>
        </div>

        <div className="relative flex flex-col gap-2">
          {/* Underlying subtle stream lane guides */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex flex-col gap-2"
          >
            <div className="w-full h-[36px] rounded-[7px] border border-dashed border-slate-900/[0.06] bg-slate-900/[0.01]" />
            <div className="w-full h-[36px] rounded-[7px] border border-dashed border-slate-900/[0.06] bg-slate-900/[0.01]" />
          </div>

          {/* Static representative strips (measured for stripLaneTopRect / stripLaneBottomRect) */}
          <div
            ref={staticStripPlaceholderRef}
            style={{ willChange: 'opacity' }}
            className="flex flex-col gap-2"
          >
            {representativeStrips.map((course, idx) => (
              <DataStripItem
                key={course.id}
                course={course}
                hiddenInStatic={false}
                anchorAttr={`strip-lane-${idx}`}
                registerStripEl={(el) => {
                  if (idx === 0 && stripLaneTopRef) stripLaneTopRef.current = el
                  if (idx === 1 && stripLaneBottomRef) stripLaneBottomRef.current = el
                }}
              />
            ))}
            {courses
              .filter((c) => !repIds.has(c.id))
              .map((course) => (
                <DataStripItem
                  key={course.id}
                  course={course}
                  hiddenInStatic={true}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Hairline Connector */}
      <div className="flex items-center gap-2 px-1">
        <div className="h-px flex-1 bg-slate-900/[0.08]" />
        <span
          ref={processStatusLabelRef}
          className="text-[10.5px] text-neutral-400 font-normal transition-colors"
        >
          字段对齐与清洗
        </span>
        <div className="h-px flex-1 bg-slate-900/[0.08]" />
      </div>

      {/* Section B: Minimal Hairline Field Alignment Structure */}
      <div
        ref={processBoxRef}
        data-course-id={featuredCourse.id}
        data-stage-node="process"
        data-process-anchor="field-table"
        className="relative w-full border-t border-b border-slate-900/[0.08] divide-y divide-slate-900/[0.06]"
      >
        <div
          ref={staticProcessFieldsRef}
          style={{ willChange: 'opacity' }}
          className="divide-y divide-slate-900/[0.06]"
        >
          {structuredFields.map((field) => (
            <div
              key={field.label}
              className="py-2 px-1 flex items-baseline justify-between gap-4 text-[12.5px]"
            >
              <span className="text-neutral-400 font-normal shrink-0">
                {field.label}
              </span>
              <span className="text-neutral-900 font-medium text-right truncate">
                {field.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * 4. PREVIEW: 导入预览态（进入周视图前的结构化确认列表）
 */
export const ImportPreviewStage: React.FC<{
  courses: SchoolImportCourse[]
  registerPreviewNode?: (courseId: string, el: HTMLDivElement | null) => void
  panelRef?: React.MutableRefObject<HTMLDivElement | null>
}> = ({ courses, registerPreviewNode, panelRef }) => {
  return (
    <div
      ref={panelRef}
      data-stage-panel="preview"
      className="w-full rounded-[20px] bg-white/95 ring-1 ring-slate-900/[0.07] shadow-[0_10px_28px_-10px_rgba(15,23,42,0.06)] px-4 py-3.5"
    >
      {/* Preview Header */}
      <div className="pb-2.5 border-b border-slate-900/[0.07] flex items-center justify-between">
        <span className="text-[13.5px] font-semibold text-neutral-900 tracking-tight">
          导入课表 · 第7周
        </span>
        <span className="text-[11.5px] text-neutral-400 font-normal">
          共 {courses.length} 门课程
        </span>
      </div>

      {/* Structured Course Rows */}
      <div className="divide-y divide-slate-900/[0.05]">
        {courses.map((course) => (
          <div
            key={course.id}
            ref={(el) => registerPreviewNode?.(course.id, el)}
            data-course-id={course.id}
            data-stage-node="preview"
            style={{ willChange: 'opacity' }}
            className="py-2 flex items-center justify-between gap-3 text-[12px] sm:text-[12.5px]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                aria-hidden="true"
                style={{ backgroundColor: course.sourceColor }}
                className="w-1.5 h-1.5 rounded-full shrink-0 opacity-75"
              />
              <span className="text-neutral-900 font-medium truncate">
                {course.displayName}
              </span>
            </div>
            <span className="text-neutral-500 font-normal shrink-0 tabular-nums">
              {course.day} · 第{course.startPeriod}–{course.endPeriod}节
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 5. DESTINATION: 课程表 App 本地周视图（完全复用 Phase 03 视觉语言，Phase 05B 保持静态）
 */
export const DestinationAppWeekStage: React.FC<{
  courses: SchoolImportCourse[]
}> = ({ courses }) => {
  const courseByAppSlot = new Map<string, SchoolImportCourse>()
  courses.forEach((course) => {
    courseByAppSlot.set(`${course.dayCol}-${course.appTimeRow}`, course)
  })

  return (
    <div data-stage-panel="destination" className="w-full flex flex-col">
      <div className="relative w-full bg-[#F6F6F6] rounded-[24px] sm:rounded-[28px] p-3.5 sm:p-4.5 ring-1 ring-black/[0.05] shadow-[0_12px_36px_-10px_rgba(15,23,42,0.06)]">
        {/* 1. Top Bar: 第 7 周 + Date Range + 编辑 / 导入 */}
        <div className="flex items-start justify-between px-1">
          <div>
            <div className="text-[21px] sm:text-[24px] font-bold text-neutral-900 leading-none tracking-tight">
              第 7 周
            </div>
            <div className="text-[11px] sm:text-[12px] text-neutral-500 font-normal mt-1">
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
        <div className="flex items-center gap-1.5 mt-2.5 px-0.5">
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
        <div className="relative mt-3">
          {/* Weekday Headers: 周一 12 ~ 周五 16 */}
          <div className="flex items-end mb-1.5">
            <div className="w-7 sm:w-8 shrink-0" />
            <div className="flex-1 grid grid-cols-5 gap-1.5">
              {SCHOOL_WEEKDAYS.map((wd) => (
                <div key={wd.day} className="flex flex-col items-center justify-center">
                  <span className="text-[10px] sm:text-[11px] text-neutral-500 font-normal leading-tight">
                    {wd.day}
                  </span>
                  <span className="text-[12px] sm:text-[13px] text-neutral-900 font-medium leading-tight mt-0.5">
                    {wd.appDate}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 5 × 4 Slots */}
          <div className="flex flex-col gap-1.5">
            {APP_TIME_ROWS.map((timeLabel, rowIdx) => (
              <div key={timeLabel} className="flex items-start">
                <div className="w-7 sm:w-8 pt-1.5 text-[9.5px] sm:text-[10.5px] text-neutral-500 font-normal shrink-0 leading-none">
                  {timeLabel}
                </div>

                <div className="flex-1 grid grid-cols-5 gap-1.5">
                  {SCHOOL_WEEKDAYS.map((_, colIdx) => {
                    const slotKey = `${colIdx}-${rowIdx}`
                    const course = courseByAppSlot.get(slotKey)

                    return (
                      <div
                        key={slotKey}
                        data-destination-cell={slotKey}
                        className="relative h-[74px] sm:h-[80px] rounded-[11px] sm:rounded-[13px] bg-[#EAEAEA]"
                      >
                        {course && (
                          <div
                            data-course-id={course.id}
                            data-stage-node="destination"
                            data-day-col={course.dayCol}
                            data-time-row={course.appTimeRow}
                            className={`w-full h-full rounded-[11px] sm:rounded-[13px] p-1.5 overflow-hidden flex flex-col justify-start ${
                              course.appTheme === 'warm'
                                ? 'bg-[#F3ECE1] text-[#5E3704]'
                                : 'bg-[#E9E7F7] text-[#2B1B54]'
                            }`}
                          >
                            <div className="shrink-0 text-[10px] sm:text-[11px] font-semibold leading-[1.2] tracking-tight line-clamp-2 break-all">
                              {course.name}
                            </div>
                            <div
                              className={`overflow-hidden line-clamp-2 text-[8.5px] sm:text-[9.5px] font-normal leading-[1.18] mt-0.5 break-all ${
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

      {/* Completion Status Copy (Section 13) */}
      <div className="mt-3.5 px-1 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
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
 * Phase 05B: 学校课表导入 · SOURCE -> DATA STRIP -> PROCESS -> PREVIEW 连续 Morph
 */
export const SchoolImportDemo: React.FC = () => {
  const [previewState, setPreviewState] = useState<Phase05PreviewState>(getInitialPhase05State)

  const sectionRef = useRef<HTMLElement | null>(null)
  const stageWrapperRef = useRef<HTMLDivElement | null>(null)
  const previewPanelRef = useRef<HTMLDivElement | null>(null)

  // Static stage node refs for geometry measurement & opacity handoff
  const staticSourceRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const staticPreviewRefs = useRef<Record<string, HTMLDivElement | null>>({})
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

  // Cached geometry & current scroll progress
  const currentProgressRef = useRef<number>(0)
  const geometryCacheRef = useRef<StageGeometryCache>({
    isMobile: false,
    stageWidth: 1200,
    stageHeight: 800,
    stripLaneTopRect: { x: 420, y: 60, width: 260, height: 36 },
    stripLaneBottomRect: { x: 420, y: 104, width: 260, height: 36 },
    processBoxRect: { x: 420, y: 176, width: 260, height: 185 },
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
    const stageWrapper = stageWrapperRef.current
    if (!section || !stageWrapper) return

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
     * Measure and cache all stage geometry in stageWrapper root coordinates.
     * Never called inside ScrollTrigger.onUpdate.
     */
    const measureStageGeometry = () => {
      const rootBox = stageWrapper.getBoundingClientRect()
      if (rootBox.width === 0 || rootBox.height === 0) return

      const isMobile = window.innerWidth < 1024
      const topLane = toRelativeRect(stripLaneTopRef.current, rootBox)
      const bottomLane = toRelativeRect(stripLaneBottomRef.current, rootBox)
      const procBox = toRelativeRect(processBoxRef.current, rootBox)

      const coursesMap: StageGeometryCache['courses'] = {}
      for (const course of SCHOOL_IMPORT_COURSES) {
        const srcEl = staticSourceRefs.current[course.id]
        const prevEl = staticPreviewRefs.current[course.id]
        coursesMap[course.id] = {
          sourceRect: toRelativeRect(srcEl, rootBox),
          stripRect: topLane,
          previewRect: toRelativeRect(prevEl, rootBox),
        }
      }

      geometryCacheRef.current = {
        isMobile,
        stageWidth: rootBox.width,
        stageHeight: rootBox.height,
        stripLaneTopRect: topLane,
        stripLaneBottomRect: bottomLane.width > 0 ? bottomLane : topLane,
        processBoxRect: procBox,
        courses: coursesMap,
      }
    }

    /**
     * Pure DOM state application for global progress p in [0, 1].
     */
    const applyGlobalProgress = (rawP: number) => {
      const p = clamp(rawP, 0, 1)
      currentProgressRef.current = p
      const geom = geometryCacheRef.current

      let anyCourseInProcessStageC = false
      let maxProcessOverlayInfluence = 0

      for (let i = 0; i < SCHOOL_IMPORT_COURSES.length; i++) {
        const course = SCHOOL_IMPORT_COURSES[i]
        const state = computeCourseMorphState(p, course, i, geom)

        if (state.stage === 'stage-c-process') {
          anyCourseInProcessStageC = true
          maxProcessOverlayInfluence = Math.max(
            maxProcessOverlayInfluence,
            state.processLayerOpacity
          )
        }

        // 1. Static Source Node opacity
        const srcEl = staticSourceRefs.current[course.id]
        if (srcEl) {
          srcEl.style.opacity = state.staticSourceOpacity.toFixed(3)
        }

        // 2. Static Preview Row opacity
        const prevEl = staticPreviewRefs.current[course.id]
        if (prevEl) {
          prevEl.style.opacity = state.staticPreviewOpacity.toFixed(3)
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

        // 3a. Left Source Color Bar -> Preview Dot
        const barEl = morphBarRefs.current[course.id]
        if (barEl) {
          const dotT = state.leftBarToDotProgress
          const procT = state.processLayerOpacity
          const w = lerp(2.5, 6, dotT)
          const h = lerp(14, 6, dotT)
          const leftPx = lerp(lerp(10, 6, procT), 0, dotT)
          const topPct = lerp(50, 10, procT)
          barEl.style.opacity = state.leftBarOpacity.toFixed(3)
          barEl.style.width = `${w.toFixed(2)}px`
          barEl.style.height = `${h.toFixed(2)}px`
          barEl.style.left = `${leftPx.toFixed(2)}px`
          barEl.style.top = `${topPct.toFixed(1)}%`
        }

        // 3b. Source Text Layer
        const srcLayer = morphSourceLayerRefs.current[course.id]
        if (srcLayer) {
          srcLayer.style.opacity = state.sourceTextOpacity.toFixed(3)
          srcLayer.style.visibility =
            state.sourceTextOpacity > 0.005 ? 'visible' : 'hidden'
        }

        // 3c. Data Strip / Normalized Record Text Layer
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

        // 3d. Process 5-Row Field Alignment Layer
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

        // 3e. Preview Row Text Layer
        const prevLayer = morphPreviewLayerRefs.current[course.id]
        if (prevLayer) {
          prevLayer.style.opacity = state.previewTextOpacity.toFixed(3)
          prevLayer.style.visibility =
            state.previewTextOpacity > 0.005 ? 'visible' : 'hidden'
        }
      }

      // 4. Central Process Stage Static Placeholders (Idle vs Active vs Completed)
      if (staticStripPlaceholderRef.current) {
        // Hide static representative strips once pipeline begins so only live streaming Data Strips appear
        const stripIdleOpacity = p <= 0.02 ? 1 - p / 0.02 : 0
        staticStripPlaceholderRef.current.style.opacity = stripIdleOpacity.toFixed(3)
      }

      if (staticProcessFieldsRef.current) {
        // Fade down static background fields when an active course is expanding in Stage C,
        // and restore to calm low-weight idle state when pipeline finishes (p >= 0.88)
        let bgFieldOpacity = 0.22
        if (p <= 0.04) {
          bgFieldOpacity = lerp(0.55, 0.18, p / 0.04)
        } else if (anyCourseInProcessStageC) {
          bgFieldOpacity = lerp(0.18, 0.0, clamp(maxProcessOverlayInfluence * 1.4, 0, 1))
        } else if (p >= 0.86) {
          bgFieldOpacity = lerp(0.18, 0.36, clamp((p - 0.86) / 0.06, 0, 1))
        }
        staticProcessFieldsRef.current.style.opacity = bgFieldOpacity.toFixed(3)
      }

      if (processStatusLabelRef.current) {
        if (p >= 0.895) {
          processStatusLabelRef.current.textContent = '已完成 9 门课程字段对齐'
        } else {
          processStatusLabelRef.current.textContent = '字段对齐与清洗'
        }
      }
    }

    // Expose deterministic progress setter for verification & inspection
    window.__setPhase05Progress = (targetP: number) => {
      measureStageGeometry()
      applyGlobalProgress(targetP)
    }
    window.__getPhase05Progress = () => currentProgressRef.current

    // Initial measurement & p = 0 state
    measureStageGeometry()
    applyGlobalProgress(0)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: stageWrapper,
        start: () => (window.innerWidth < 1024 ? 'top 62%' : 'top 62%'),
        end: () => {
          if (window.innerWidth < 1024 && previewPanelRef.current) {
            const rootTop = stageWrapper.getBoundingClientRect().top
            const prevBottom = previewPanelRef.current.getBoundingClientRect().bottom
            const offsetPx = Math.max(400, Math.round(prevBottom - rootTop))
            return `top+=${offsetPx}px 78%`
          }
          return 'top 6%'
        },
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
    resizeObserver.observe(stageWrapper)

    window.addEventListener('resize', handleResizeOrRefresh)
    window.addEventListener('load', handleResizeOrRefresh)
    document.fonts?.ready?.then(handleResizeOrRefresh)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResizeOrRefresh)
      window.removeEventListener('load', handleResizeOrRefresh)
      delete window.__setPhase05Progress
      delete window.__getPhase05Progress
      ctx.revert()
    }
  }, [previewState])

  const showSource = previewState === 'ALL' || previewState === 'SOURCE'
  const showProcess = previewState === 'ALL' || previewState === 'PROCESS'
  const showPreview = previewState === 'ALL' || previewState === 'PREVIEW'
  const showDestination = previewState === 'ALL' || previewState === 'DESTINATION'

  return (
    <section
      id="school-import-demo"
      ref={sectionRef}
      data-phase05-state={previewState}
      className="relative w-full bg-[#FBFBFD] select-none overflow-x-clip -mt-[300px] sm:-mt-[340px] md:-mt-[380px] pt-8 sm:pt-12 md:pt-14 pb-[280px] sm:pb-[340px] md:pb-[420px]"
    >
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="w-full max-w-7xl mx-auto">
          {/* Top Narrative Copy (Section 4) */}
          <div className="max-w-2xl">
            <h2
              style={{ lineHeight: 1.18 }}
              className="text-2xl sm:text-4xl md:text-[42px] lg:text-[44px] font-bold tracking-[-0.03em] text-neutral-950"
            >
              把学校里的课表带进来。
            </h2>
            <p className="mt-3.5 sm:mt-4 text-[15px] sm:text-[17px] text-neutral-500 font-normal leading-relaxed">
              在企业微信打开“我的课表”，完成采集后直接导入。课程写入本地，之后查课不再依赖教务系统。
            </p>
            <p className="mt-2.5 text-[12.5px] sm:text-[13.5px] text-neutral-400 font-normal tracking-tight">
              无需输入教务密码 · 导入后离线可用
            </p>
          </div>

          {/* Wide Import Stage Wrapper (Relative root for CourseMorphOverlay) */}
          <div
            ref={stageWrapperRef}
            className="relative mt-8 sm:mt-11 md:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-6 items-start"
          >
            {/* Column 1 (Left on Desktop): SOURCE 山东商务职业学院“我的课表” */}
            {showSource && (
              <div className="lg:col-span-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11.5px] font-medium text-neutral-400 tracking-tight">
                    01 · 教务系统源课表
                  </span>
                  <span className="text-[11px] text-neutral-400 font-normal">
                    山东商务职业学院
                  </span>
                </div>
                <SourceScheduleStage
                  courses={SCHOOL_IMPORT_COURSES}
                  registerSourceNode={(id, el) => {
                    staticSourceRefs.current[id] = el
                  }}
                />
              </div>
            )}

            {/* Column 2 (Center on Desktop): PROCESS 数据整理区 + DATA STRIP */}
            {showProcess && (
              <div className="lg:col-span-3 lg:pt-8 flex flex-col gap-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11.5px] font-medium text-neutral-400 tracking-tight">
                    02 · 结构化抽取与对齐
                  </span>
                  <span className="text-[11px] text-neutral-400 font-normal">
                    自动解析
                  </span>
                </div>
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
                />
              </div>
            )}

            {/* Column 3 (Right on Desktop): PREVIEW 导入预览 + DESTINATION 本地课表周视图 */}
            {(showPreview || showDestination) && (
              <div className="lg:col-span-5 flex flex-col gap-6">
                {showPreview && (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11.5px] font-medium text-neutral-400 tracking-tight">
                        03 · 导入预览确认
                      </span>
                      <span className="text-[11px] text-neutral-400 font-normal">
                        写入前预览
                      </span>
                    </div>
                    <ImportPreviewStage
                      courses={SCHOOL_IMPORT_COURSES}
                      panelRef={previewPanelRef}
                      registerPreviewNode={(id, el) => {
                        staticPreviewRefs.current[id] = el
                      }}
                    />
                  </div>
                )}

                {showDestination && (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11.5px] font-medium text-neutral-400 tracking-tight">
                        04 · 课程表 App 本地周视图
                      </span>
                      <span className="text-[11px] text-neutral-400 font-normal">
                        本地存储
                      </span>
                    </div>
                    <DestinationAppWeekStage courses={SCHOOL_IMPORT_COURSES} />
                  </div>
                )}
              </div>
            )}

            {/* ===============================================================
                CourseMorphOverlay: 9 Unified Morphing Course Entities
                (SOURCE -> DATA STRIP -> PROCESS ORGANIZER -> PREVIEW ROW)
               =============================================================== */}
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
                      value: `第 ${course.startPeriod}–${course.endPeriod} 节`,
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
                      {/* Continuous Left Color Identity Bar -> Preview Row Dot */}
                      <span
                        ref={(el) => {
                          morphBarRefs.current[course.id] = el
                        }}
                        aria-hidden="true"
                        style={{
                          backgroundColor: course.sourceColor,
                          left: 10,
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

                      {/* Layer 2: Slender DATA STRIP / Normalized Record Content */}
                      <div
                        ref={(el) => {
                          morphStripLayerRefs.current[course.id] = el
                        }}
                        style={{ opacity: 0, visibility: 'hidden' }}
                        className="absolute inset-0 pl-5 pr-2.5 flex items-center justify-between gap-1.5 overflow-hidden"
                      >
                        <div className="text-[11.5px] sm:text-[12px] text-neutral-800 font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
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
                          className="shrink-0 px-1.5 py-0.5 rounded bg-slate-900/[0.04] text-[10px] text-neutral-500 font-normal tabular-nums"
                        >
                          {course.weekLabel}
                        </span>
                      </div>

                      {/* Layer 3: PROCESS 5-Row Hairline Field Alignment Content */}
                      <div
                        ref={(el) => {
                          morphProcessLayerRefs.current[course.id] = el
                        }}
                        style={{ opacity: 0, visibility: 'hidden' }}
                        className="absolute inset-0 pl-4 pr-2.5 flex flex-col justify-between divide-y divide-slate-900/[0.06] bg-white"
                      >
                        {processFields.map((field, rIdx) => (
                          <div
                            key={field.label}
                            className="flex-1 flex items-center justify-between gap-3 text-[12px] sm:text-[12.5px] overflow-hidden"
                          >
                            <span
                              ref={(el) => {
                                if (!morphProcessRowLabelRefs.current[course.id]) {
                                  morphProcessRowLabelRefs.current[course.id] = []
                                }
                                morphProcessRowLabelRefs.current[course.id][rIdx] = el
                              }}
                              className="text-neutral-400 font-normal shrink-0"
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
                              className="text-neutral-900 font-medium text-right truncate"
                            >
                              {field.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Layer 4: Final PREVIEW Row Content */}
                      <div
                        ref={(el) => {
                          morphPreviewLayerRefs.current[course.id] = el
                        }}
                        style={{ opacity: 0, visibility: 'hidden' }}
                        className="absolute inset-0 pl-3.5 flex items-center justify-between gap-3 text-[12px] sm:text-[12.5px]"
                      >
                        <span className="text-neutral-900 font-medium truncate">
                          {course.displayName}
                        </span>
                        <span className="text-neutral-500 font-normal shrink-0 tabular-nums">
                          {course.day} · 第{course.startPeriod}–{course.endPeriod}节
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
