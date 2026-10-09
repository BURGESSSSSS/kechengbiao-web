import React, { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronLeft, ChevronRight, MoreHorizontal, RotateCw, X } from 'lucide-react'
import {
  INPLACE_PROTOTYPE_CONFIG,
  SCHEDULE_TIME_BANDS,
  SCHOOL_IMPORT_COURSES,
  SCHOOL_PERIOD_ROWS,
  SCHOOL_WEEKDAYS,
  type SchoolImportCourse,
} from './schoolImportData'
import {
  computeInPlacePrototypeState,
  type TextSimplifyVariant,
} from './courseMorphEngine'

gsap.registerPlugin(ScrollTrigger)

function detectInitialVariant(): TextSimplifyVariant {
  if (typeof window === 'undefined') return 'A'
  const params = new URLSearchParams(window.location.search)
  const raw = (params.get('variant') || params.get('strike') || 'A').toUpperCase()
  return raw === 'B' ? 'B' : 'A'
}

export const SchoolImportDemo: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const [globalP, setGlobalP] = useState<number>(0)
  const [variant] = useState<TextSimplifyVariant>(detectInitialVariant)

  // Map (dayCol, bandIndex) -> course for O(1) lookup in the shared 5x4 band grid
  const courseBySlot = useMemo(() => {
    const map = new Map<string, SchoolImportCourse>()
    for (const course of SCHOOL_IMPORT_COURSES) {
      map.set(`${course.dayCol}-${course.appTimeRow}`, course)
    }
    return map
  }, [])

  useEffect(() => {
    const sectionEl = sectionRef.current
    if (!sectionEl) return

    const trigger = ScrollTrigger.create({
      trigger: sectionEl,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        setGlobalP(self.progress)
      },
    })

    // Sync initial scroll position immediately
    setGlobalP(trigger.progress)

    return () => {
      trigger.kill()
    }
  }, [])

  const state = useMemo(
    () => computeInPlacePrototypeState(globalP, variant),
    [globalP, variant]
  )

  return (
    <section
      id="school-import"
      ref={sectionRef}
      data-prototype="phase05-reset-in-place"
      data-variant={variant}
      data-progress={state.globalP.toFixed(4)}
      style={{
        height: `${INPLACE_PROTOTYPE_CONFIG.sectionTotalHeightVh}vh`,
      }}
      className="relative w-full bg-[#FBFBFD] select-none"
    >
      {/* CSS position: sticky stage (NO ScrollTrigger pin) */}
      <div className="sticky top-0 w-full h-screen pt-14 flex flex-col items-center justify-center overflow-hidden px-3">
        {/* Subtle Top Source / Stage Context Label Space */}
        <div className="relative h-6 mb-2.5 flex items-center justify-center text-[12px] tracking-wide text-neutral-400 font-normal">
          <span
            style={{
              opacity: state.topStageLabelSchoolOpacity,
              transform: `translateY(${(1 - state.topStageLabelSchoolOpacity) * -4}px)`,
            }}
            className="absolute whitespace-nowrap"
          >
            企业微信 · 教务系统课表
          </span>
          <span
            style={{
              opacity: state.topStageLabelAppOpacity,
              transform: `translateY(${(1 - state.topStageLabelAppOpacity) * 4}px)`,
            }}
            className="absolute whitespace-nowrap text-neutral-500"
          >
            App 周视图 · 第 7 周
          </span>
        </div>

        {/* Single Persistent Schedule Frame (376 × 700px on desktop, shared DOM throughout p ∈ [0, 1]) */}
        <div
          data-testid="inplace-schedule-frame"
          style={{
            width: `${INPLACE_PROTOTYPE_CONFIG.frameWidthPx}px`,
            maxWidth: 'calc(100vw - 24px)',
            height: `${INPLACE_PROTOTYPE_CONFIG.frameHeightPx}px`,
            borderRadius: `${INPLACE_PROTOTYPE_CONFIG.frameRadiusPx}px`,
            backgroundColor: state.frameBgColor,
            transform: `scale(${state.frameSubtleSettleScale.toFixed(4)})`,
          }}
          className="relative flex flex-col overflow-hidden border border-black/[0.08] bg-white"
        >
          {/* =================================================================
              1. WeCom Dark Host Bar (#191919) — Clips / collapses upward (0.66–0.80)
             ================================================================= */}
          <div
            style={{
              height: `${state.wecomBarHeightPx.toFixed(2)}px`,
              opacity: state.wecomBarOpacity,
            }}
            className="relative w-full bg-[#191919] text-white overflow-hidden shrink-0"
          >
            <div
              style={{
                transform: `translateY(${state.wecomBarTranslateY.toFixed(2)}px)`,
              }}
              className="h-[34px] px-3.5 flex items-center justify-between text-[12px]"
            >
              <div className="flex items-center gap-2 text-white/90">
                <X className="w-3.5 h-3.5 stroke-[2]" />
                <span className="w-[1px] h-3 bg-white/20" />
                <span className="text-[11.5px] font-medium tracking-tight">我的课表</span>
              </div>
              <span className="text-[10.5px] text-white/55 font-normal">企业微信工作台</span>
              <MoreHorizontal className="w-4 h-4 text-white/85" />
            </div>
          </div>

          {/* =================================================================
              2. School Blue Title Bar (#1989FA) — Compresses in height (0.68–0.84)
             ================================================================= */}
          <div
            style={{
              height: `${state.schoolBlueBarHeightPx.toFixed(2)}px`,
              opacity: state.schoolBlueBarOpacity,
            }}
            className="relative w-full bg-[#1989FA] text-white overflow-hidden shrink-0"
          >
            <div className="h-[34px] px-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11.5px] text-white/95">
                <ChevronLeft className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>返回</span>
              </div>
              <span className="text-[13px] font-semibold tracking-tight">我的课表</span>
              <div className="flex items-center justify-end w-10">
                <RotateCw className="w-3.5 h-3.5 text-white/90" />
              </div>
            </div>
          </div>

          {/* =================================================================
              3. Unified Header Band (28px School Semester Row -> 88px Real App Header)
                 Houses the shared FLIP-morphed "第7周" -> "第 7 周" title element!
             ================================================================= */}
          <div
            style={{
              height: `${state.headerBandHeightPx.toFixed(2)}px`,
              backgroundColor: state.headerBandBgColor,
              borderBottom: `1px solid rgba(203, 213, 225, ${state.tableGridLineOpacity.toFixed(3)})`,
            }}
            className="relative w-full shrink-0 overflow-hidden"
          >
            {/* School Semester Label (Left side of 28px row, fades out during 0.66–0.76) */}
            <div
              style={{
                opacity: state.schoolSemesterTextOpacity,
                transform: `translateY(${state.schoolSemesterTranslateY.toFixed(2)}px)`,
              }}
              className="absolute left-3 top-[6px] flex items-center gap-1.5 text-[11px] text-[#475569] font-medium pointer-events-none"
            >
              <span>2026-2027学年第一学期</span>
              <span className="text-[#CBD5E1]">|</span>
              <span className="text-[10px] text-[#64748B]">计算机科学与技术</span>
            </div>

            {/* SHARED FLIP / GEOMETRY MORPH ELEMENT: "第7周" (right selector) -> "第 7 周" (App main header) */}
            <div
              data-testid="shared-week-title"
              style={{
                left: `${state.weekTitleLeftPx.toFixed(2)}px`,
                top: `${state.weekTitleTopPx.toFixed(2)}px`,
                fontSize: `${state.weekTitleFontSizePx.toFixed(2)}px`,
                fontWeight: state.weekTitleFontWeight,
                color: state.weekTitleColor,
                lineHeight: 1.15,
              }}
              className="absolute z-20 flex items-center tracking-tight whitespace-nowrap origin-top-left"
            >
              <span>第</span>
              <span
                style={{
                  marginLeft: `${state.weekTitleDigitGapPx.toFixed(2)}px`,
                  marginRight: `${state.weekTitleDigitGapPx.toFixed(2)}px`,
                }}
                className="tabular-nums"
              >
                7
              </span>
              <span>周</span>
              <span
                style={{
                  opacity: state.weekDropdownCaretOpacity,
                  width: `${(state.weekDropdownCaretOpacity * 10).toFixed(1)}px`,
                }}
                className="ml-0.5 text-[9px] text-[#1989FA] overflow-hidden inline-block"
              >
                ▾
              </span>
            </div>

            {/* Real App Top Header Companion Metadata (Date Subtitle + Edit/Import Pills) */}
            <div
              style={{
                opacity: state.appHeaderMetaOpacity,
                transform: `translateY(${state.appHeaderMetaTranslateY.toFixed(2)}px)`,
              }}
              className="absolute inset-x-0 top-0 h-[50px] px-4 pointer-events-none flex items-start justify-between pt-3"
            >
              <div className="pt-[26px] text-[11px] text-[#737373] font-normal tracking-tight">
                10月12日 - 10月16日
              </div>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="px-3 py-1 rounded-full bg-white text-[11.5px] font-medium text-neutral-900 border border-neutral-200/85 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  编辑
                </span>
                <span className="px-3 py-1 rounded-full bg-white text-[11.5px] font-medium text-neutral-900 border border-neutral-200/85 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  导入
                </span>
              </div>
            </div>

            {/* Real App Week Switcher Navigation Row (< > 回到本周 | 复制到下周) */}
            <div
              style={{
                opacity: state.appWeekNavRowOpacity,
                transform: `translateY(${state.appWeekNavRowTranslateY.toFixed(2)}px)`,
              }}
              className="absolute inset-x-0 top-[53px] h-[30px] px-4 pointer-events-none flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-full bg-white border border-neutral-200/85 flex items-center justify-center text-neutral-700">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </span>
                <span className="w-6 h-6 rounded-full bg-white border border-neutral-200/85 flex items-center justify-center text-neutral-700">
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-neutral-200/85 text-[11px] font-medium text-neutral-800">
                  回到本周
                </span>
              </div>
              <span className="text-[11px] font-medium text-neutral-800 pr-0.5">
                复制到下周
              </span>
            </div>
          </div>

          {/* =================================================================
              4. Shared Weekday Header Row (10月 + 周一 12日..周五 16日 -> 周一 12..周五 16)
             ================================================================= */}
          <div
            style={{
              backgroundColor: state.weekdayRowBgColor,
              paddingLeft: `${state.gridOuterPadHorizontalPx.toFixed(2)}px`,
              paddingRight: `${state.gridOuterPadHorizontalPx.toFixed(2)}px`,
              borderBottom: `1px solid rgba(203, 213, 225, ${state.tableGridLineOpacity.toFixed(3)})`,
            }}
            className="relative h-[36px] w-full shrink-0 flex items-stretch"
          >
            {/* Left Axis Header Cell ("10月" in School -> clean time-column spacer in App) */}
            <div
              style={{
                borderRight: `1px solid rgba(203, 213, 225, ${state.tableGridLineOpacity.toFixed(3)})`,
              }}
              className="w-[34px] shrink-0 flex items-center justify-center"
            >
              <span
                style={{ opacity: state.monthCellTextOpacity }}
                className="text-[10px] font-semibold text-[#475569] leading-none"
              >
                10月
              </span>
            </div>

            {/* 5 Shared Weekday Columns (周一 .. 周五) */}
            <div className="flex-1 grid grid-cols-5">
              {SCHOOL_WEEKDAYS.map((item, colIdx) => {
                const isMon = colIdx === 0
                return (
                  <div
                    key={item.day}
                    style={{
                      backgroundColor: isMon
                        ? `rgba(238, 246, 255, ${state.weekdayMondaySchoolHighlightOpacity.toFixed(3)})`
                        : 'transparent',
                      borderRight:
                        colIdx < 4
                          ? `1px solid rgba(203, 213, 225, ${state.tableGridLineOpacity.toFixed(3)})`
                          : 'none',
                    }}
                    className="flex flex-col items-center justify-center leading-none"
                  >
                    <span
                      style={{
                        color: isMon && state.weekdayMondaySchoolHighlightOpacity > 0.5
                          ? '#1989FA'
                          : state.weekdayNameColor,
                      }}
                      className="text-[10.5px] font-medium"
                    >
                      {item.day}
                    </span>
                    <div
                      style={{
                        fontSize: `${state.weekdayDateFontSizePx.toFixed(2)}px`,
                        color: isMon && state.weekdayMondaySchoolHighlightOpacity > 0.5
                          ? '#1989FA'
                          : state.weekdayDateColor,
                      }}
                      className="mt-0.5 flex items-baseline font-semibold tabular-nums leading-none"
                    >
                      <span>{item.appDate}</span>
                      <span
                        style={{
                          opacity: state.weekdayDaySuffixOpacity,
                          maxWidth: `${state.weekdayDaySuffixMaxWidthPx.toFixed(2)}px`,
                        }}
                        className="inline-block overflow-hidden text-[9.5px] font-normal"
                      >
                        {item.dateSuffix}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* =================================================================
              5. Shared Schedule Grid Body
                 4 Time Bands (8 School Period Rows -> 4 App Time Rows × 5 Weekday Columns)
                 Courses NEVER leave their (dayCol, bandIndex) slot!
             ================================================================= */}
          <div
            style={{
              height: `${state.gridBodyHeightPx.toFixed(2)}px`,
              paddingLeft: `${state.gridOuterPadHorizontalPx.toFixed(2)}px`,
              paddingRight: `${state.gridOuterPadHorizontalPx.toFixed(2)}px`,
              paddingTop: `${state.gridOuterPadVerticalPx.toFixed(2)}px`,
              paddingBottom: `${state.gridOuterPadVerticalPx.toFixed(2)}px`,
            }}
            className="relative w-full shrink-0 flex flex-col"
          >
            {SCHEDULE_TIME_BANDS.map((band, bandIdx) => {
              const oddInfo = SCHOOL_PERIOD_ROWS[bandIdx * 2]
              const evenInfo = SCHOOL_PERIOD_ROWS[bandIdx * 2 + 1]

              return (
                <div
                  key={band.bandIndex}
                  style={{
                    borderBottom:
                      bandIdx < 3
                        ? `1px solid rgba(203, 213, 225, ${state.tableGridLineOpacity.toFixed(3)})`
                        : 'none',
                  }}
                  className="relative flex-1 flex items-stretch min-h-0"
                >
                  {/* ---------------------------------------------------------
                      Left Axis Column:
                      Odd & Even Period Rows (1+2, 3+4, 5+6, 7+8) merging into
                      App Time Labels (08:00, 10:00, 14:00, 16:00)
                     --------------------------------------------------------- */}
                  <div
                    style={{
                      borderRight: `1px solid rgba(203, 213, 225, ${state.tableGridLineOpacity.toFixed(3)})`,
                    }}
                    className="relative w-[34px] shrink-0 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Odd Period Sub-Row (1, 3, 5, 7) */}
                    <div
                      style={{
                        opacity: state.schoolPeriodLabelOpacity,
                        transform: `translateY(${state.oddPeriodTranslateYPx.toFixed(2)}px)`,
                      }}
                      className="h-1/2 flex flex-col items-center justify-center text-center leading-none"
                    >
                      <span className="text-[11px] font-bold text-[#334155] tabular-nums">
                        {oddInfo.period}
                      </span>
                      <span className="mt-0.5 text-[7.5px] text-[#94A3B8] whitespace-pre-line leading-[1.05] tabular-nums">
                        {oddInfo.timeRange}
                      </span>
                    </div>

                    {/* Horizontal Sub-Divider between Odd & Even Periods (Dissolves in Motion 3) */}
                    <div
                      style={{
                        opacity: state.periodSubDividerOpacity,
                      }}
                      className="
                        absolute left-0 right-0 top-1/2 -translate-y-1/2
                        h-[1px] bg-[#CBD5E1] pointer-events-none
                      "
                    />

                    {/* Even Period Sub-Row (2, 4, 6, 8) */}
                    <div
                      style={{
                        opacity: state.schoolPeriodLabelOpacity,
                        transform: `translateY(${state.evenPeriodTranslateYPx.toFixed(2)}px)`,
                      }}
                      className="h-1/2 flex flex-col items-center justify-center text-center leading-none"
                    >
                      <span className="text-[11px] font-bold text-[#334155] tabular-nums">
                        {evenInfo.period}
                      </span>
                      <span className="mt-0.5 text-[7.5px] text-[#94A3B8] whitespace-pre-line leading-[1.05] tabular-nums">
                        {evenInfo.timeRange}
                      </span>
                    </div>

                    {/* Merged App Time Label (08:00, 10:00, 14:00, 16:00) */}
                    <div
                      style={{
                        opacity: state.appTimeLabelOpacity,
                        transform: `translateY(${state.appTimeLabelTranslateYPx.toFixed(2)}px) scale(${state.appTimeLabelScale.toFixed(3)})`,
                      }}
                      className="absolute inset-x-0 top-2.5 flex justify-center pointer-events-none"
                    >
                      <span className="text-[10.5px] font-medium text-[#737373] tabular-nums">
                        {band.appTime}
                      </span>
                    </div>
                  </div>

                  {/* ---------------------------------------------------------
                      5 Weekday Columns in this Time Band
                     --------------------------------------------------------- */}
                  <div className="flex-1 grid grid-cols-5 min-h-0">
                    {SCHOOL_WEEKDAYS.map((weekday, colIdx) => {
                      const course = courseBySlot.get(`${colIdx}-${band.bandIndex}`)
                      const cardState = course ? state.getCourseCardState(course) : null

                      return (
                        <div
                          key={`${weekday.day}-${band.bandIndex}`}
                          style={{
                            padding: `${state.slotInsetPx.toFixed(2)}px`,
                            borderRight:
                              colIdx < 4
                                ? `1px solid rgba(203, 213, 225, ${state.tableGridLineOpacity.toFixed(3)})`
                                : 'none',
                          }}
                          className="relative min-h-0 flex items-stretch"
                        >
                          {/* Odd/Even Period Sub-Divider across empty cells in School state */}
                          {!course && (
                            <div
                              style={{
                                opacity: state.periodSubDividerOpacity * 0.75,
                              }}
                              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#E2E8F0] pointer-events-none z-0"
                            />
                          )}

                          {/* Empty Slot Card Surface (emerges as #EAEAEA rounded-[12px] in Motion 4) */}
                          {!course && (
                            <div
                              style={{
                                opacity: state.emptySlotBgOpacity,
                                borderRadius: `${state.emptySlotRadiusPx.toFixed(2)}px`,
                              }}
                              className="w-full h-full bg-[#EAEAEA]"
                            />
                          )}

                          {/* SHARED COURSE CARD DOM (In-Place Re-typesetting: zero flight, zero stagger) */}
                          {course && cardState && (
                            <div
                              data-testid={`inplace-course-${course.id}`}
                              style={{
                                backgroundColor: cardState.cardBaseBg,
                                borderRadius: `${cardState.borderRadiusPx.toFixed(2)}px`,
                                paddingTop: `${cardState.padTopPx.toFixed(2)}px`,
                                paddingBottom: `${cardState.padTopPx.toFixed(2)}px`,
                                paddingLeft: `${cardState.padHorizontalPx.toFixed(2)}px`,
                                paddingRight: `${cardState.padHorizontalPx.toFixed(2)}px`,
                                border: `1px solid rgba(228, 228, 231, ${cardState.proofBorderOpacity.toFixed(3)})`,
                              }}
                              className="relative w-full h-full overflow-hidden flex flex-col justify-start z-10"
                            >
                              {/* Fill Layer:
                                  - Retracts from 100% width to 3px left tag in Motion 1 (0.06–0.24)
                                  - Expands from 3px left tag back to 100% width as warm beige / lavender in Motion 5 (0.52–0.72) */}
                              <div
                                style={{
                                  backgroundColor: cardState.fillLayerColor,
                                  width: `calc(100% - ${cardState.fillRightInsetPercent.toFixed(2)}% + ${((cardState.fillRightInsetPercent / 100) * cardState.fillMinLeftTagPx).toFixed(2)}px)`,
                                }}
                                className="absolute inset-y-0 left-0 pointer-events-none z-0"
                              />

                              {/* Crisp 3px Left Editorial Color Tag Accent */}
                              <div
                                style={{
                                  backgroundColor: cardState.leftTagAccentColor,
                                  opacity: cardState.leftTagAccentOpacity,
                                }}
                                className="absolute inset-y-0 left-0 w-[3px] pointer-events-none z-10"
                              />

                              {/* Course Title (Shared across School & App) */}
                              <div
                                style={{
                                  color: cardState.titleColor,
                                  fontSize: `${cardState.titleFontSizePx.toFixed(2)}px`,
                                }}
                                className="relative z-20 shrink-0 font-semibold leading-[1.2] tracking-tight line-clamp-2 break-all"
                              >
                                {course.displayName}
                              </div>

                              {/* Course Location Block (Motion 2: Redundant Prefix/Suffix Mask & Re-layout) */}
                              <div
                                style={{
                                  color: cardState.locationColor,
                                  fontSize: `${cardState.locationFontSizePx.toFixed(2)}px`,
                                }}
                                className="relative z-20 mt-0.5 flex flex-col leading-[1.18] break-all overflow-hidden"
                              >
                                {/* Redundant School Prefix (@本校区...[) — Crops out simultaneously in Motion 2 */}
                                <div
                                  style={{
                                    opacity: cardState.redundantTextOpacity,
                                    maxHeight: `${cardState.redundantMaxHeightPx.toFixed(2)}px`,
                                    clipPath: `inset(0 0 ${cardState.redundantClipBottomPercent.toFixed(1)}% 0)`,
                                  }}
                                  className="relative overflow-hidden"
                                >
                                  <span>{course.sourcePrefix}</span>
                                  {/* Optional Variant B: lightweight 1.5px strikethrough line */}
                                  {variant === 'B' && cardState.strikeLineOpacity > 0.01 && (
                                    <span
                                      style={{
                                        width: `${cardState.strikeLineWidthPercent.toFixed(1)}%`,
                                        opacity: cardState.strikeLineOpacity,
                                      }}
                                      className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#52525B] pointer-events-none"
                                    />
                                  )}
                                </div>

                                {/* Retained Clean Classroom Name (Shared Core Location) */}
                                <div
                                  style={{
                                    opacity: cardState.cleanLocationOpacity,
                                  }}
                                  className="line-clamp-3 leading-[1.2]"
                                >
                                  {course.appLocation}
                                </div>

                                {/* Redundant School Suffix (] (1-2节)) — Crops out simultaneously in Motion 2 */}
                                <div
                                  style={{
                                    opacity: cardState.redundantTextOpacity,
                                    maxHeight: `${(cardState.redundantMaxHeightPx * 0.7).toFixed(2)}px`,
                                    clipPath: `inset(0 0 ${cardState.redundantClipBottomPercent.toFixed(1)}% 0)`,
                                  }}
                                  className="relative overflow-hidden text-[8px] opacity-90"
                                >
                                  <span>{course.sourceSuffix}</span>
                                  {variant === 'B' && cardState.strikeLineOpacity > 0.01 && (
                                    <span
                                      style={{
                                        width: `${cardState.strikeLineWidthPercent.toFixed(1)}%`,
                                        opacity: cardState.strikeLineOpacity,
                                      }}
                                      className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#52525B] pointer-events-none"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* =================================================================
              6. Bottom Region (32px School Summary Bar -> 66px App Bottom Nav Pill)
             ================================================================= */}
          <div
            style={{
              height: `${state.bottomRegionHeightPx.toFixed(2)}px`,
              borderTop: `1px solid rgba(203, 213, 225, ${state.tableGridLineOpacity.toFixed(3)})`,
            }}
            className="relative w-full shrink-0 flex items-center justify-center overflow-hidden"
          >
            {/* School Schedule Bottom Summary Bar */}
            <div
              style={{
                opacity: state.schoolSummaryBarOpacity,
                transform: `translateY(${state.schoolSummaryBarTranslateY.toFixed(2)}px)`,
              }}
              className="absolute inset-0 bg-[#F8FAFC] px-3 flex items-center justify-between text-[10.5px] text-[#64748B] pointer-events-none"
            >
              <span>共 9 门课程 · 第 7 周（10月12日–10月16日）</span>
              <span className="text-[#1989FA] font-medium">教务同步</span>
            </div>

            {/* Real App Bottom Navigation Floating Pill (今日 | 周视图 | 更多) */}
            <div
              style={{
                opacity: state.appBottomNavOpacity,
                transform: `translateY(${state.appBottomNavTranslateY.toFixed(2)}px)`,
              }}
              className="w-full px-5 flex items-center justify-center pointer-events-none"
            >
              <div className="w-full h-[46px] rounded-full bg-white border border-black/[0.06] shadow-[0_4px_14px_rgba(0,0,0,0.04)] p-1 grid grid-cols-3 items-center text-[12px]">
                <div className="flex items-center justify-center text-neutral-500 font-normal">
                  今日
                </div>
                <div className="h-full rounded-full bg-[#141414] text-white flex items-center justify-center font-medium tracking-tight">
                  周视图
                </div>
                <div className="flex items-center justify-center text-neutral-500 font-normal">
                  更多
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Outside Completion Marker ("导入完成。") */}
        <div
          style={{
            opacity: state.outsideCompleteMarkerOpacity,
            transform: `translateY(${state.outsideCompleteMarkerTranslateY.toFixed(2)}px)`,
          }}
          className="h-6 mt-2.5 flex items-center justify-center text-[13px] text-neutral-500 font-medium tracking-wide pointer-events-none"
        >
          导入完成。
        </div>
      </div>
    </section>
  )
}

export default SchoolImportDemo
