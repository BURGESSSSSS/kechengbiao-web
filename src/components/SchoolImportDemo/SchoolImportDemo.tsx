import React, { useEffect, useState } from 'react'
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

export type Phase05PreviewState = 'ALL' | 'SOURCE' | 'PROCESS' | 'PREVIEW' | 'DESTINATION'

declare global {
  interface Window {
    __setPhase05State?: (state: Phase05PreviewState) => void
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

/**
 * 1. SOURCE: 山东商务职业学院企业微信「我的课表」高精重构
 */
export const SourceScheduleStage: React.FC<{
  courses: SchoolImportCourse[]
}> = ({ courses }) => {
  // Fast lookup by (dayCol, startPeriod)
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
                    className="p-[2px] border-r last:border-r-0 border-b border-neutral-100/80"
                  >
                    <div
                      data-course-id={course.id}
                      data-stage-node="source"
                      data-day-col={course.dayCol}
                      data-start-period={course.startPeriod}
                      data-end-period={course.endPeriod}
                      style={{ backgroundColor: course.sourceColor }}
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
}> = ({ course, hiddenInStatic = false }) => {
  return (
    <div
      data-course-id={course.id}
      data-stage-node="strip"
      data-strip-representative={hiddenInStatic ? 'false' : 'true'}
      className={`${
        hiddenInStatic ? 'hidden' : 'flex'
      } relative items-center w-full rounded-[7px] bg-[#FAFAFC] ring-1 ring-slate-900/[0.08] shadow-[0_2px_6px_rgba(15,23,42,0.03)] px-2.5 py-2 overflow-hidden`}
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
 * 3. PROCESS: 中央数据整理区（极简细线结构 + Data Strip + 字段对齐）
 */
export const ProcessOrganizerStage: React.FC<{
  courses: SchoolImportCourse[]
  featuredCourse: SchoolImportCourse
  representativeStrips: SchoolImportCourse[]
}> = ({ courses, featuredCourse, representativeStrips }) => {
  const repIds = new Set(representativeStrips.map((c) => c.id))

  const structuredFields = [
    { label: '课程', value: featuredCourse.displayName },
    { label: '星期', value: featuredCourse.day },
    { label: '节次', value: `第 ${featuredCourse.startPeriod}–${featuredCourse.endPeriod} 节` },
    { label: '地点', value: featuredCourse.shortLocation },
    { label: '周次', value: featuredCourse.weekLabel },
  ]

  return (
    <div
      data-stage-panel="process"
      className="w-full flex flex-col gap-4 py-1"
    >
      {/* Section A: Representative Data Strips */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-medium tracking-[0.04em] text-neutral-400">
            抽取课程数据条
          </span>
          <span className="text-[11px] text-neutral-400 font-normal">
            DATA STRIP
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {/* Render the 2 representative strips visibly */}
          {representativeStrips.map((course) => (
            <DataStripItem key={course.id} course={course} hiddenInStatic={false} />
          ))}
          {/* Keep remaining courses mounted in DOM with shared data-course-id for Phase 05B geometry */}
          {courses
            .filter((c) => !repIds.has(c.id))
            .map((course) => (
              <DataStripItem key={course.id} course={course} hiddenInStatic={true} />
            ))}
        </div>
      </div>

      {/* Hairline Connector */}
      <div className="flex items-center gap-2 px-1">
        <div className="h-px flex-1 bg-slate-900/[0.08]" />
        <span className="text-[10.5px] text-neutral-400 font-normal">字段对齐与清洗</span>
        <div className="h-px flex-1 bg-slate-900/[0.08]" />
      </div>

      {/* Section B: Minimal Hairline Field Alignment Structure */}
      <div
        data-course-id={featuredCourse.id}
        data-stage-node="process"
        className="w-full border-t border-b border-slate-900/[0.08] divide-y divide-slate-900/[0.06]"
      >
        {structuredFields.map((field) => (
          <div
            key={field.label}
            className="py-2 px-1 flex items-baseline justify-between gap-4 text-[12.5px]"
          >
            <span className="text-neutral-400 font-normal shrink-0">{field.label}</span>
            <span className="text-neutral-900 font-medium text-right truncate">
              {field.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 4. PREVIEW: 导入预览态（进入周视图前的结构化确认列表）
 */
export const ImportPreviewStage: React.FC<{
  courses: SchoolImportCourse[]
}> = ({ courses }) => {
  return (
    <div
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
            data-course-id={course.id}
            data-stage-node="preview"
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
 * 5. DESTINATION: 课程表 App 本地周视图（完全复用 Phase 03 视觉语言）
 */
export const DestinationAppWeekStage: React.FC<{
  courses: SchoolImportCourse[]
}> = ({ courses }) => {
  // Lookup by (dayCol, appTimeRow)
  const courseByAppSlot = new Map<string, SchoolImportCourse>()
  courses.forEach((course) => {
    courseByAppSlot.set(`${course.dayCol}-${course.appTimeRow}`, course)
  })

  return (
    <div
      data-stage-panel="destination"
      className="w-full flex flex-col"
    >
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
 * Phase 05A: 学校课表导入 · 静态舞台与视觉基线
 */
export const SchoolImportDemo: React.FC = () => {
  const [previewState, setPreviewState] = useState<Phase05PreviewState>(getInitialPhase05State)

  useEffect(() => {
    window.__setPhase05State = (nextState: Phase05PreviewState) => {
      setPreviewState(nextState)
    }
    return () => {
      delete window.__setPhase05State
    }
  }, [])

  const showSource = previewState === 'ALL' || previewState === 'SOURCE'
  const showProcess = previewState === 'ALL' || previewState === 'PROCESS'
  const showPreview = previewState === 'ALL' || previewState === 'PREVIEW'
  const showDestination = previewState === 'ALL' || previewState === 'DESTINATION'

  return (
    <section
      id="school-import-demo"
      data-phase05-state={previewState}
      className="relative w-full bg-[#FBFBFD] select-none overflow-x-clip -mt-[300px] sm:-mt-[340px] md:-mt-[380px] pt-8 sm:pt-12 md:pt-14 pb-20 sm:pb-28 md:pb-36"
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

          {/* Wide Import Stage (Desktop: 3-column horizontal flow / Mobile: vertical narrative stack) */}
          <div className="mt-8 sm:mt-11 md:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-6 items-start">
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
                <SourceScheduleStage courses={SCHOOL_IMPORT_COURSES} />
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
                    <ImportPreviewStage courses={SCHOOL_IMPORT_COURSES} />
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
          </div>
        </div>
      </div>
    </section>
  )
}
