import React from 'react'
import { PHASE05_STAGE_STEPS } from './schoolImportData'

export interface StageRailDomRefs {
  masterFillBar: HTMLDivElement | null
  stepNodes: (HTMLSpanElement | null)[]
  stepSegmentFills: (HTMLDivElement | null)[]
  stepCodes: (HTMLSpanElement | null)[]
  stepTitles: (HTMLDivElement | null)[]
  stepSubtitles: (HTMLDivElement | null)[]
  // Mobile compact progress header refs
  mobileStepCode: HTMLSpanElement | null
  mobileStepTitle: HTMLSpanElement | null
  mobileStepSubtitle: HTMLSpanElement | null
  mobileProgressBar: HTMLDivElement | null
}

/**
 * Editorial Timeline Step Block for Spatial Narrative Long Page (Section 13).
 * Part of the natural document flow — never sticky or fixed.
 */
export const EditorialStageRailNode: React.FC<{
  stepIndex: number
  railRefs: React.MutableRefObject<StageRailDomRefs>
  showConnectorBelow?: boolean
  connectorClassName?: string
}> = ({
  stepIndex,
  railRefs,
  showConnectorBelow = true,
  connectorClassName = 'bottom-[-12px]',
}) => {
  const step = PHASE05_STAGE_STEPS[stepIndex]
  const isFirst = stepIndex === 0

  return (
    <div
      data-stage-rail-step={step.code}
      className="relative pl-7 flex flex-col select-none"
    >
      {/* Continuous Vertical Track Segment for this Step */}
      {showConnectorBelow && (
        <div
          aria-hidden="true"
          className={`absolute left-[6px] top-[10px] ${connectorClassName} flex justify-center w-[4px] -translate-x-1/2`}
        >
          {/* Base 1px light-gray future track */}
          <div className="w-[1px] h-full bg-[#D4D4D8]" />

          {/* Continuous Darkening & Thickening Progress Segment (1px -> 3.5px, gray -> black) */}
          <div
            ref={(el) => {
              railRefs.current.stepSegmentFills[stepIndex] = el
            }}
            style={{
              height: '0%',
              width: isFirst ? '3.5px' : '1px',
              backgroundColor: isFirst ? '#111111' : '#D4D4D8',
              willChange: 'height, width, background-color',
            }}
            className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
          />
        </div>
      )}

      {/* Step Node Circle (6px future -> 10px current -> 7.5px done) */}
      <span
        ref={(el) => {
          railRefs.current.stepNodes[stepIndex] = el
        }}
        aria-hidden="true"
        style={{
          width: isFirst ? '10px' : '6px',
          height: isFirst ? '10px' : '6px',
          backgroundColor: isFirst ? '#111111' : '#D4D4D8',
          willChange: 'width, height, background-color',
        }}
        className="absolute left-[6px] top-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full z-10"
      />

      {/* Step Code + Title + Short Subtitle */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2">
          <span
            ref={(el) => {
              railRefs.current.stepCodes[stepIndex] = el
            }}
            style={{
              color: isFirst ? '#111111' : '#A1A1AA',
              fontWeight: isFirst ? 680 : 450,
            }}
            className="text-[12.5px] leading-none tabular-nums tracking-tight"
          >
            {step.code}
          </span>
          <div
            ref={(el) => {
              railRefs.current.stepTitles[stepIndex] = el
            }}
            style={{
              color: isFirst ? '#111111' : '#A1A1AA',
              fontWeight: isFirst ? 680 : 450,
              willChange: 'color, font-weight',
            }}
            className="text-[15.5px] xl:text-[16px] leading-[1.25] tracking-[-0.015em]"
          >
            {step.title}
          </div>
        </div>

        <div
          ref={(el) => {
            railRefs.current.stepSubtitles[stepIndex] = el
          }}
          style={{
            color: isFirst ? '#3F3F46' : '#C4C4CC',
            willChange: 'color',
          }}
          className="mt-1 pl-[22px] text-[12.5px] leading-[1.35] font-normal tracking-tight"
        >
          {step.subtitle}
        </div>
      </div>
    </div>
  )
}

/**
 * Full-Height Editorial Timeline Rail spanning SourceZone -> Corridor 1 -> ProcessZone
 * (Section 13: Non-sticky, non-fixed spatial editorial timeline).
 */
export const ImportStageRail: React.FC<{
  railRefs: React.MutableRefObject<StageRailDomRefs>
}> = ({ railRefs }) => {
  return (
    <aside
      data-stage-rail="desktop"
      aria-label="课表导入阶段时间轴"
      className="hidden lg:flex flex-col w-[216px] xl:w-[232px] shrink-0 select-none pr-3"
    >
      {PHASE05_STAGE_STEPS.map((step, idx) => {
        const isLast = idx === PHASE05_STAGE_STEPS.length - 1
        return (
          <div key={step.code} className={isLast ? 'pb-2' : 'pb-9'}>
            <EditorialStageRailNode
              stepIndex={idx}
              railRefs={railRefs}
              showConnectorBelow={!isLast}
            />
          </div>
        )
      })}
    </aside>
  )
}

/**
 * Mobile Top Compact Stage Indicator + Horizontal Progress Rail.
 */
export const MobileStageHeader: React.FC<{
  railRefs: React.MutableRefObject<StageRailDomRefs>
}> = ({ railRefs }) => {
  const firstStep = PHASE05_STAGE_STEPS[0]
  return (
    <div
      data-stage-rail="mobile"
      className="lg:hidden w-full mb-4 select-none"
    >
      <div className="flex items-baseline justify-between gap-2 pb-2">
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span
            ref={(el) => {
              railRefs.current.mobileStepCode = el
            }}
            className="text-[12.5px] font-semibold text-neutral-950 tabular-nums shrink-0"
          >
            {firstStep.code} / 04
          </span>
          <span className="text-neutral-300 text-[12px]">·</span>
          <span
            ref={(el) => {
              railRefs.current.mobileStepTitle = el
            }}
            className="text-[14px] font-semibold text-neutral-950 tracking-tight truncate"
          >
            {firstStep.title}
          </span>
        </div>

        <span
          ref={(el) => {
            railRefs.current.mobileStepSubtitle = el
          }}
          className="text-[12px] text-neutral-600 font-normal shrink-0"
        >
          {firstStep.subtitle}
        </span>
      </div>

      {/* Slender Horizontal Progress Rail */}
      <div className="w-full h-[2.5px] rounded-full bg-neutral-200/90 overflow-hidden">
        <div
          ref={(el) => {
            railRefs.current.mobileProgressBar = el
          }}
          style={{
            width: '4%',
            willChange: 'width',
          }}
          className="h-full bg-neutral-950 rounded-full"
        />
      </div>
    </div>
  )
}
