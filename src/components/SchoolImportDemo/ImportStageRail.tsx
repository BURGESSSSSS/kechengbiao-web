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
 * Desktop Left-Hand 4-Stage Vertical Narrative Rail (Sections 4–10, 35, 36, 39).
 * Driven continuously by scroll progress without sudden class toggles.
 */
export const ImportStageRail: React.FC<{
  railRefs: React.MutableRefObject<StageRailDomRefs>
}> = ({ railRefs }) => {
  return (
    <aside
      data-stage-rail="desktop"
      aria-label="课表导入阶段导航"
      className="hidden lg:flex flex-col justify-center w-[212px] xl:w-[228px] shrink-0 select-none pr-2"
    >
      <div className="relative flex flex-col">
        {PHASE05_STAGE_STEPS.map((step, idx) => {
          const isLast = idx === PHASE05_STAGE_STEPS.length - 1
          return (
            <div
              key={step.code}
              data-stage-rail-step={step.code}
              className={`relative pl-7 ${isLast ? 'pb-2' : 'pb-9'}`}
            >
              {/* Continuous Vertical Track Segment for this Step */}
              <div
                aria-hidden="true"
                className="
                  absolute left-[6px] top-[10px] bottom-[-10px]
                  flex justify-center w-[4px] -translate-x-1/2
                "
              >
                {/* Base 1px light-gray future track */}
                <div className="w-[1px] h-full bg-[#D4D4D8]" />

                {/* Continuous Darkening & Thickening Progress Segment (1px -> 3.5px, gray -> black) */}
                <div
                  ref={(el) => {
                    railRefs.current.stepSegmentFills[idx] = el
                  }}
                  style={{
                    height: idx === 0 ? '0%' : '0%',
                    width: idx === 0 ? '3.5px' : '1px',
                    backgroundColor: idx === 0 ? '#111111' : '#D4D4D8',
                    willChange: 'height, width, background-color',
                  }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
                />
              </div>

              {/* Step Node Circle (6px future -> 9.5px current -> 7px done) */}
              <span
                ref={(el) => {
                  railRefs.current.stepNodes[idx] = el
                }}
                aria-hidden="true"
                style={{
                  width: idx === 0 ? '9.5px' : '6px',
                  height: idx === 0 ? '9.5px' : '6px',
                  backgroundColor: idx === 0 ? '#111111' : '#D4D4D8',
                  willChange: 'width, height, background-color',
                }}
                className="absolute left-[6px] top-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full z-10"
              />

              {/* Step Code + Title + Short Subtitle */}
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span
                    ref={(el) => {
                      railRefs.current.stepCodes[idx] = el
                    }}
                    style={{
                      color: idx === 0 ? '#111111' : '#A1A1AA',
                      fontWeight: idx === 0 ? 650 : 500,
                    }}
                    className="text-[12.5px] leading-none tabular-nums tracking-tight"
                  >
                    {step.code}
                  </span>
                  <div
                    ref={(el) => {
                      railRefs.current.stepTitles[idx] = el
                    }}
                    style={{
                      color: idx === 0 ? '#111111' : '#A1A1AA',
                      fontWeight: idx === 0 ? 650 : 460,
                      willChange: 'color, font-weight',
                    }}
                    className="text-[15px] xl:text-[15.5px] leading-[1.25] tracking-[-0.015em]"
                  >
                    {step.title}
                  </div>
                </div>

                <div
                  ref={(el) => {
                    railRefs.current.stepSubtitles[idx] = el
                  }}
                  style={{
                    color: idx === 0 ? '#52525B' : '#A1A1AA',
                    willChange: 'color',
                  }}
                  className="mt-1 pl-[22px] text-[12.5px] leading-[1.35] font-normal tracking-tight"
                >
                  {step.subtitle}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

/**
 * Mobile Top Compact Stage Indicator + Horizontal Progress Rail (Section 37).
 */
export const MobileStageHeader: React.FC<{
  railRefs: React.MutableRefObject<StageRailDomRefs>
}> = ({ railRefs }) => {
  const firstStep = PHASE05_STAGE_STEPS[0]
  return (
    <div
      data-stage-rail="mobile"
      className="lg:hidden w-full mb-3.5 select-none"
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
