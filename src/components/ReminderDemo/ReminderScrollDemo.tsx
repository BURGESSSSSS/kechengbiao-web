import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronDown, ChevronRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

/**
 * Technical Architecture Note (Real Android Implementation Reference):
 * In the native Android app, course reminders are scheduled locally via:
 * - AlarmManager (exact local time scheduling)
 * - BroadcastReceiver (wakeup & boot/update/timezone reschedule receiver)
 * - NotificationCompat (high-priority system notification presentation)
 * Course data is read directly from local Room database without FCM, push servers,
 * Foreground Service, or WorkManager polling.
 */

const START_MINUTE = 13 * 60 + 42 // 13:42 (822 mins)
const TRIGGER_MINUTE = 13 * 60 + 45 // 13:45 (825 mins)

const TIME_START_P = 0.26
const TIME_TRIGGER_P = 0.60

const NOTIF_START_P = 0.60
const NOTIF_END_P = 0.78

const NOTIF_STAGE_A_END = 0.28
const NOTIF_STAGE_B_END = 0.82

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t)
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export interface ReminderMotionState {
  p: number
  // Layer A: Reminder Settings Card
  settingScale: number
  settingOpacity: number
  settingBlur: number
  settingY: number
  // Layer B: Simulated Time & Course Context
  simulatedMinutes: number
  formattedTime: string
  timeProgress: number
  thresholdWeight: number
  layerBOpacity: number
  layerBY: number
  layerBScale: number
  courseOpacity: number
  courseBlur: number
  timelineOpacity: number
  timelineBlur: number
  // Layer C: Android System Notification
  notifP: number
  notifStage: 'hidden' | 'A-reveal' | 'B-slide' | 'C-snap' | 'settled'
  notifY: number
  notifScale: number
  notifBlur: number
  notifOpacity: number
  notifShadowStrength: number
  // Bottom Stage Technical Caption
  captionOpacity: number
  captionY: number
}

/**
 * Pure, stateless mapping from scroll progress p in [0, 1] to all 3 stage layers.
 * Guarantees 100% identical forward and reverse behavior with zero autonomous timelines.
 */
export function computeReminderDemoState(p: number, isMobile: boolean): ReminderMotionState {
  const clampedP = clamp(p, 0, 1)

  // -------------------------------------------------------------------------
  // 1. Layer A: Course Reminder Settings Card (Act 1 focus -> Act 2/3 recedes)
  // -------------------------------------------------------------------------
  const act2RecedeT = easeInOutCubic(clamp((clampedP - 0.18) / (0.46 - 0.18), 0, 1))
  const act3ExtraRecedeT = easeInOutQuad(clamp((clampedP - 0.60) / (0.78 - 0.60), 0, 1))

  const settingScale = 1.0 - 0.04 * act2RecedeT - 0.015 * act3ExtraRecedeT
  const settingOpacity = 1.0 - 0.70 * act2RecedeT - 0.10 * act3ExtraRecedeT
  const settingBlur = 2.0 * act2RecedeT + 0.8 * act3ExtraRecedeT
  const settingY = 10 * act2RecedeT + 6 * act3ExtraRecedeT

  // -------------------------------------------------------------------------
  // 2. Continuous Simulated Clock (13:42 -> 13:45 across p in [0.26, 0.60])
  // -------------------------------------------------------------------------
  const timeProgress = clamp(
    (clampedP - TIME_START_P) / (TIME_TRIGGER_P - TIME_START_P),
    0,
    1
  )
  const simulatedMinutes =
    START_MINUTE + (TRIGGER_MINUTE - START_MINUTE) * timeProgress

  // Floor with epsilon so 825.000 formats cleanly as 13:45
  const totalMinutesInt = Math.floor(simulatedMinutes + 1e-5)
  const hh = Math.floor(totalMinutesInt / 60)
  const mm = totalMinutesInt % 60
  const formattedTime = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`

  // Threshold marker visual weight as clock approaches 13:45
  const thresholdWeight = easeOutQuad(clamp((clampedP - 0.40) / (0.60 - 0.40), 0, 1))

  // -------------------------------------------------------------------------
  // 3. Layer B: Foreground Course & Time Layer (Enters in Act 2, yields focus in Act 3)
  // -------------------------------------------------------------------------
  const layerBEnterT = easeOutCubic(clamp((clampedP - 0.20) / (0.42 - 0.20), 0, 1))
  const layerBRecedeT = easeInOutQuad(clamp((clampedP - 0.60) / (0.78 - 0.60), 0, 1))

  const layerBOpacity = layerBEnterT
  const shiftDownForNotif = isMobile ? 54 : 58
  const layerBY = (1 - layerBEnterT) * 18 + layerBRecedeT * shiftDownForNotif
  const layerBScale = 0.98 + 0.02 * layerBEnterT - 0.02 * layerBRecedeT

  const courseOpacity = 1.0 - 0.55 * layerBRecedeT // 1.0 -> 0.45
  const courseBlur = 1.0 * layerBRecedeT // 0px -> 1.0px
  const timelineOpacity = 1.0 - 0.70 * layerBRecedeT // 1.0 -> 0.30
  const timelineBlur = 1.0 * layerBRecedeT // 0px -> 1.0px

  // -------------------------------------------------------------------------
  // 4. Layer C: Android System Notification (3-Stage Motion across p in [0.60, 0.78])
  // -------------------------------------------------------------------------
  const notifP = clamp(
    (clampedP - NOTIF_START_P) / (NOTIF_END_P - NOTIF_START_P),
    0,
    1
  )
  const startY = isMobile ? -96 : -112

  let notifStage: ReminderMotionState['notifStage'] = 'hidden'
  let notifY = startY
  let notifScale = 0.965
  let notifBlur = 5.0
  let notifOpacity = 0
  let notifShadowStrength = 0

  if (notifP <= 0.0001) {
    notifStage = 'hidden'
    notifY = startY
    notifScale = 0.965
    notifBlur = 5.0
    notifOpacity = 0
    notifShadowStrength = 0
  } else if (notifP >= 0.9999) {
    notifStage = 'settled'
    notifY = 0
    notifScale = 1.0
    notifBlur = 0
    notifOpacity = 1
    notifShadowStrength = 1.0
  } else if (notifP < NOTIF_STAGE_A_END) {
    // Stage A｜露出 (notifP: 0 -> 0.28)
    notifStage = 'A-reveal'
    const uA = notifP / NOTIF_STAGE_A_END
    const eA = easeOutQuad(uA)
    notifY = startY * (1 - 0.38 * eA) // -112px -> -69.4px
    notifOpacity = clamp(uA * 1.35, 0, 1) // Fast opacity rise
    notifBlur = 5.0 - 4.0 * eA // 5px -> 1px
    notifScale = 0.965 + 0.025 * eA // 0.965 -> 0.990
    notifShadowStrength = 0.15 + 0.45 * eA
  } else if (notifP < NOTIF_STAGE_B_END) {
    // Stage B｜下滑 (notifP: 0.28 -> 0.82)
    notifStage = 'B-slide'
    const uB = (notifP - NOTIF_STAGE_A_END) / (NOTIF_STAGE_B_END - NOTIF_STAGE_A_END)
    const eB = easeOutCubic(uB)
    // Preserve gentle arrival velocity entering Stage C overshoot
    const qB = 0.68 * easeOutQuad(uB) + 0.32 * uB
    const remainingStartY = startY * 0.62
    notifY = remainingStartY * (1 - qB) // -69.4px -> 0px
    notifOpacity = 1
    const blurDecay = clamp(uB / 0.65, 0, 1)
    notifBlur = 1.0 * Math.pow(1 - blurDecay, 2) // 1px -> 0px
    notifScale = 0.990 + 0.010 * eB // 0.990 -> 1.000
    notifShadowStrength = 0.60 + 0.40 * eB // 0.60 -> 1.00
  } else {
    // Stage C｜系统吸附 (notifP: 0.82 -> 1.00): single 3~5px overshoot -> settle
    notifStage = 'C-snap'
    const uC = (notifP - NOTIF_STAGE_B_END) / (1 - NOTIF_STAGE_B_END)
    const pulse = Math.sin(Math.PI * uC) * (1 - 0.30 * uC) // Single lobe, max ~0.86 at uC≈0.45
    const maxOvershootPx = isMobile ? 3.8 : 4.5
    notifY = maxOvershootPx * pulse // Peaks at ~3.9px overshoot, then returns to 0px
    notifScale = 1.0 + 0.009 * pulse // Peaks at ~1.008 (<= 1.01), then returns to 1.0
    notifBlur = 0
    notifOpacity = 1
    notifShadowStrength = 1.0
  }

  // -------------------------------------------------------------------------
  // 5. Act 4: Bottom Stage Technical Caption (p: 0.74 -> 0.86)
  // -------------------------------------------------------------------------
  const captionT = easeOutQuad(clamp((clampedP - 0.74) / (0.86 - 0.74), 0, 1))
  const captionOpacity = captionT
  const captionY = (1 - captionT) * 6

  return {
    p: clampedP,
    settingScale,
    settingOpacity,
    settingBlur,
    settingY,
    simulatedMinutes,
    formattedTime,
    timeProgress,
    thresholdWeight,
    layerBOpacity,
    layerBY,
    layerBScale,
    courseOpacity,
    courseBlur,
    timelineOpacity,
    timelineBlur,
    notifP,
    notifStage,
    notifY,
    notifScale,
    notifBlur,
    notifOpacity,
    notifShadowStrength,
    captionOpacity,
    captionY,
  }
}

export const ReminderScrollDemo: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const settingsLayerRef = useRef<HTMLDivElement>(null)
  const timeCourseLayerRef = useRef<HTMLDivElement>(null)
  const courseInfoRef = useRef<HTMLDivElement>(null)
  const timelineBlockRef = useRef<HTMLDivElement>(null)
  const clockTextRef = useRef<HTMLSpanElement>(null)
  const timelineFillRef = useRef<HTMLDivElement>(null)
  const timelineCursorRef = useRef<HTMLDivElement>(null)
  const thresholdTickRef = useRef<HTMLDivElement>(null)
  const thresholdDotRef = useRef<HTMLDivElement>(null)
  const thresholdLabelRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const bottomCaptionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return

    const applyState = (progress: number) => {
      const isMobile = window.innerWidth < 768
      const s = computeReminderDemoState(progress, isMobile)

      stage.setAttribute('data-reminder-progress', s.p.toFixed(4))
      stage.setAttribute('data-simulated-time', s.formattedTime)
      stage.setAttribute('data-simulated-minutes', s.simulatedMinutes.toFixed(2))
      stage.setAttribute('data-notif-p', s.notifP.toFixed(3))
      stage.setAttribute('data-notif-stage', s.notifStage)

      // 1. Layer A: Settings Card
      if (settingsLayerRef.current) {
        settingsLayerRef.current.style.opacity = s.settingOpacity.toFixed(3)
        settingsLayerRef.current.style.transform = `translate3d(0, ${s.settingY.toFixed(2)}px, 0) scale(${s.settingScale.toFixed(4)})`
        settingsLayerRef.current.style.filter =
          s.settingBlur > 0.05 ? `blur(${s.settingBlur.toFixed(2)}px)` : 'none'
      }

      // 2. Layer B: Course + Time Foreground
      if (timeCourseLayerRef.current) {
        timeCourseLayerRef.current.style.opacity = s.layerBOpacity.toFixed(3)
        timeCourseLayerRef.current.style.transform = `translate3d(0, ${s.layerBY.toFixed(2)}px, 0) scale(${s.layerBScale.toFixed(4)})`
      }

      if (courseInfoRef.current) {
        courseInfoRef.current.style.opacity = s.courseOpacity.toFixed(3)
        courseInfoRef.current.style.filter =
          s.courseBlur > 0.05 ? `blur(${s.courseBlur.toFixed(2)}px)` : 'none'
      }

      if (timelineBlockRef.current) {
        timelineBlockRef.current.style.opacity = s.timelineOpacity.toFixed(3)
        timelineBlockRef.current.style.filter =
          s.timelineBlur > 0.05 ? `blur(${s.timelineBlur.toFixed(2)}px)` : 'none'
      }

      if (clockTextRef.current && clockTextRef.current.textContent !== s.formattedTime) {
        clockTextRef.current.textContent = s.formattedTime
      }

      const pct = `${(s.timeProgress * 100).toFixed(2)}%`
      if (timelineFillRef.current) {
        timelineFillRef.current.style.width = pct
      }
      if (timelineCursorRef.current) {
        timelineCursorRef.current.style.left = pct
      }

      // Threshold 13:45 visual feedback
      const grayChannel = Math.round(180 - 163 * s.thresholdWeight)
      const dotColor = `rgb(${grayChannel}, ${grayChannel}, ${grayChannel})`
      if (thresholdDotRef.current) {
        thresholdDotRef.current.style.backgroundColor = dotColor
        thresholdDotRef.current.style.transform = `translate(50%, -50%) scale(${(0.9 + 0.22 * s.thresholdWeight).toFixed(3)})`
      }
      if (thresholdTickRef.current) {
        thresholdTickRef.current.style.opacity = (0.25 + 0.75 * s.thresholdWeight).toFixed(3)
        thresholdTickRef.current.style.backgroundColor = dotColor
      }
      if (thresholdLabelRef.current) {
        thresholdLabelRef.current.style.opacity = (0.45 + 0.55 * s.thresholdWeight).toFixed(3)
      }

      // 3. Layer C: Android System Notification
      if (notificationRef.current) {
        const el = notificationRef.current
        el.style.opacity = s.notifOpacity.toFixed(3)
        el.style.transform = `translate3d(0, ${s.notifY.toFixed(2)}px, 0) scale(${s.notifScale.toFixed(4)})`
        el.style.filter =
          s.notifBlur > 0.05 ? `blur(${s.notifBlur.toFixed(2)}px)` : 'none'

        if (s.notifOpacity <= 0.001) {
          el.style.boxShadow = 'none'
        } else {
          const sh = s.notifShadowStrength
          const y1 = (6 + 12 * sh).toFixed(1)
          const b1 = (16 + 22 * sh).toFixed(1)
          const a1 = (0.04 + 0.08 * sh).toFixed(3)
          const y2 = (2 + 3 * sh).toFixed(1)
          const b2 = (6 + 6 * sh).toFixed(1)
          const a2 = (0.02 + 0.04 * sh).toFixed(3)
          el.style.boxShadow = `0 ${y1}px ${b1}px -6px rgba(15, 23, 42, ${a1}), 0 ${y2}px ${b2}px -2px rgba(15, 23, 42, ${a2})`
        }
      }

      // 4. Bottom Stage Caption
      if (bottomCaptionRef.current) {
        bottomCaptionRef.current.style.opacity = s.captionOpacity.toFixed(3)
        bottomCaptionRef.current.style.transform = `translate3d(0, ${s.captionY.toFixed(2)}px, 0)`
      }
    }

    // Initialize at p = 0
    applyState(0)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: stage,
        start: 'top 50%',
        end: 'top 6%',
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: (self) => applyState(self.progress),
        onUpdate: (self) => applyState(self.progress),
      })
    }, section)

    const handleRefresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', handleRefresh)
    document.fonts?.ready?.then(handleRefresh)

    return () => {
      window.removeEventListener('load', handleRefresh)
      ctx.revert()
    }
  }, [])

  return (
    <section
      id="reminder-demo"
      ref={sectionRef}
      className="relative w-full bg-[#FBFBFD] select-none pt-12 sm:pt-16 md:pt-20 pb-12 sm:pb-16 md:pb-20"
    >
      <div className="w-full px-4 sm:px-8 md:px-14 lg:px-20">
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-7 sm:gap-10 md:gap-12 lg:gap-16">
          {/* Desktop Left (38%) / Mobile Top: Narrative Copy */}
          <div className="w-full md:w-[38%] flex flex-col items-start text-left shrink-0">
            <span className="text-[12px] sm:text-[13px] font-medium tracking-widest uppercase text-neutral-400 mb-2.5 block">
              课前通知
            </span>
            <h2
              style={{ lineHeight: 1.22 }}
              className="text-2xl sm:text-4xl md:text-[42px] lg:text-[44px] font-bold tracking-[-0.03em] text-neutral-950"
            >
              上课之前，
              <br />
              准时提醒你
            </h2>
            <p className="mt-3 sm:mt-5 text-[14.5px] sm:text-base lg:text-[16.5px] text-neutral-500 font-normal leading-relaxed max-w-[390px]">
              使用 Android 原生通知与系统定时任务，无需让应用长期挂在后台。可以选择提前 5、10、15 或 30 分钟提醒，也可以随时发送测试通知检查权限。
            </p>
            <div className="mt-4 sm:mt-6 text-[12.5px] sm:text-[13.5px] text-neutral-400 font-normal tracking-wide">
              Android 原生通知 · AlarmManager 定时唤醒 · 无需后台常驻
            </div>
          </div>

          {/* Desktop Right (56%) / Mobile Bottom: Three-Layer Notification Demo Stage */}
          <div className="w-full md:w-[56%] flex items-center justify-center">
            <div
              ref={stageRef}
              className="relative w-full max-w-[510px] min-h-[420px] sm:min-h-[450px] bg-[#F6F6F6] rounded-[28px] sm:rounded-[34px] p-4 sm:p-6 md:p-7 ring-1 ring-black/[0.05] shadow-[0_12px_36px_-10px_rgba(15,23,42,0.06)] overflow-hidden flex flex-col justify-between"
            >
              {/* =============================================================
                  LAYER A: Authentic "课程提醒" Settings Fragment (Act 1 Primary)
                 ============================================================= */}
              <div
                ref={settingsLayerRef}
                data-layer="settings"
                style={{
                  transformOrigin: '50% 35%',
                  willChange: 'transform, opacity, filter',
                }}
                className="w-full"
              >
                <div className="text-[22px] sm:text-[26px] font-bold text-neutral-900 tracking-tight mb-3.5 sm:mb-4 px-1">
                  课程提醒
                </div>

                <div className="w-full bg-white rounded-[22px] sm:rounded-[24px] p-4 sm:p-5 border border-neutral-200/75">
                  {/* Block 1: 开启提醒 + Black Switch */}
                  <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-neutral-100">
                    <div>
                      <div className="text-[15px] sm:text-[16px] font-medium text-neutral-900 leading-snug">
                        开启提醒
                      </div>
                      <div className="text-[12px] sm:text-[13px] text-neutral-500 font-normal mt-0.5">
                        上课前 15 分钟提醒
                      </div>
                    </div>

                    {/* Authentic Black Switch (ON) */}
                    <div
                      aria-label="开启提醒开关"
                      className="w-[50px] h-[28px] sm:w-[52px] sm:h-[30px] rounded-full bg-[#141414] p-[3px] flex items-center justify-end shrink-0"
                    >
                      <div className="w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] rounded-full bg-white" />
                    </div>
                  </div>

                  {/* Block 2: 提前提醒时间 + 5 / 10 / [15] / 30 分 */}
                  <div className="py-3.5 sm:py-4">
                    <div className="text-[12px] sm:text-[13px] text-neutral-500 font-normal mb-2.5 sm:mb-3">
                      提前提醒时间
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2 items-center text-center">
                      <span className="py-1.5 sm:py-2 rounded-full text-[13px] sm:text-[14px] text-neutral-900 font-normal">
                        5 分
                      </span>
                      <span className="py-1.5 sm:py-2 rounded-full text-[13px] sm:text-[14px] text-neutral-900 font-normal">
                        10 分
                      </span>
                      <span className="py-1.5 sm:py-2 rounded-full bg-[#141414] text-white text-[13px] sm:text-[14px] font-medium">
                        15 分
                      </span>
                      <span className="py-1.5 sm:py-2 rounded-full text-[13px] sm:text-[14px] text-neutral-900 font-normal">
                        30 分
                      </span>
                    </div>
                  </div>

                  {/* Block 3: 发送测试通知 (Low visual weight at bottom) */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between opacity-60">
                    <div>
                      <div className="text-[13.5px] sm:text-[14px] text-neutral-800 font-normal">
                        发送测试通知
                      </div>
                      <div className="text-[11px] sm:text-[12px] text-neutral-400 font-normal mt-0.5">
                        检查通知是否正常显示
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-500 shrink-0" />
                  </div>
                </div>
              </div>

              {/* =============================================================
                  LAYER B: Simulated Clock & Course Context (Act 2 Primary)
                 ============================================================= */}
              <div
                ref={timeCourseLayerRef}
                data-layer="time-course"
                style={{
                  opacity: 0,
                  transformOrigin: '50% 50%',
                  willChange: 'transform, opacity',
                }}
                className="absolute inset-x-4 sm:inset-x-6 md:inset-x-7 top-[102px] sm:top-[112px] pointer-events-none z-10"
              >
                <div className="w-full bg-white/95 rounded-[22px] sm:rounded-[24px] p-4 sm:p-5 ring-1 ring-black/[0.06] shadow-[0_10px_28px_-8px_rgba(15,23,42,0.08)]">
                  {/* Course Context */}
                  <div
                    ref={courseInfoRef}
                    style={{ willChange: 'opacity, filter' }}
                    className="flex items-start justify-between gap-3 pb-3.5 sm:pb-4 border-b border-neutral-100"
                  >
                    <div>
                      <div className="text-[11px] sm:text-[12px] text-neutral-400 font-medium tracking-wide">
                        即将上课 · 提前 15 分钟提醒
                      </div>
                      <div className="text-[17px] sm:text-[19px] font-semibold text-neutral-950 tracking-tight mt-0.5">
                        Node.js 应用开发
                      </div>
                      <div className="text-[12.5px] sm:text-[13.5px] text-neutral-500 font-normal mt-0.5">
                        14:00 – 15:50 · 实训中心 E209
                      </div>
                    </div>

                    {/* Simulated Clock Display */}
                    <div className="text-right shrink-0">
                      <div className="text-[10.5px] sm:text-[11.5px] text-neutral-400 font-normal">
                        当前时间
                      </div>
                      <span
                        ref={clockTextRef}
                        data-clock-display="true"
                        className="block text-[28px] sm:text-[34px] font-bold text-neutral-950 tracking-tight tabular-nums leading-none mt-1"
                      >
                        13:42
                      </span>
                    </div>
                  </div>

                  {/* Thin Precision Timeline: 13:42 ───────── 13:45 (↑ 提醒时间) */}
                  <div
                    ref={timelineBlockRef}
                    style={{ willChange: 'opacity, filter' }}
                    className="pt-3.5 sm:pt-4"
                  >
                    <div className="flex items-center">
                      <span className="text-[11px] sm:text-[12px] text-neutral-400 font-normal tabular-nums shrink-0">
                        13:42
                      </span>

                      {/* Timeline Track */}
                      <div className="relative flex-1 h-[2px] bg-neutral-200 mx-3 rounded-full">
                        {/* Active Progress Fill */}
                        <div
                          ref={timelineFillRef}
                          className="absolute left-0 top-0 bottom-0 bg-neutral-900 rounded-full"
                          style={{ width: '0%' }}
                        />

                        {/* Moving Time Dot */}
                        <div
                          ref={timelineCursorRef}
                          className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-neutral-900 absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                          style={{ left: '0%' }}
                        />

                        {/* 13:45 Threshold Vertical Tick */}
                        <div
                          ref={thresholdTickRef}
                          className="w-px h-3.5 bg-neutral-400 absolute right-0 -top-[6px]"
                        />

                        {/* 13:45 Threshold Node Dot */}
                        <div
                          ref={thresholdDotRef}
                          className="w-2.5 h-2.5 rounded-full bg-neutral-400 absolute right-0 top-1/2"
                          style={{ transform: 'translate(50%, -50%)' }}
                        />
                      </div>

                      <span className="text-[11.5px] sm:text-[12.5px] text-neutral-900 font-semibold tabular-nums shrink-0">
                        13:45
                      </span>
                    </div>

                    {/* Threshold Marker Caption */}
                    <div
                      ref={thresholdLabelRef}
                      className="flex justify-end mt-1.5 pr-0.5 text-[10.5px] sm:text-[11px] text-neutral-500 font-normal"
                    >
                      <span>↑ 提醒时间</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* =============================================================
                  LAYER C: Android System Notification (Act 3 & Act 4 Primary)
                 ============================================================= */}
              <div
                ref={notificationRef}
                data-layer="android-notification"
                style={{
                  opacity: 0,
                  transformOrigin: '50% 0%',
                  willChange: 'transform, opacity, filter, box-shadow',
                }}
                className="absolute inset-x-3.5 sm:inset-x-5 md:inset-x-6 top-4 sm:top-5 z-20 pointer-events-none bg-white rounded-[22px] sm:rounded-[24px] p-4 sm:p-5 ring-1 ring-black/[0.08]"
              >
                {/* System Notification Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={`${import.meta.env.BASE_URL}assets/app-icon-circle.png`}
                      alt="课程表"
                      className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-[6px] object-cover ring-1 ring-black/[0.06] shrink-0"
                    />
                    <span className="text-[12px] sm:text-[12.5px] font-medium text-neutral-700">
                      课程表
                    </span>
                    <span className="text-[12px] text-neutral-300">·</span>
                    <span className="text-[11.5px] sm:text-[12px] text-neutral-400 tabular-nums">
                      13:45
                    </span>
                  </div>

                  <span
                    aria-hidden="true"
                    className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"
                  >
                    <ChevronDown className="w-3 h-3 stroke-[2.2]" />
                  </span>
                </div>

                {/* System Notification Content */}
                <div className="mt-2 sm:mt-2.5 pl-0.5">
                  <div className="text-[15.5px] sm:text-[17px] font-semibold text-neutral-950 tracking-tight leading-snug">
                    Node.js 应用开发
                  </div>
                  <div className="text-[13px] sm:text-[14px] text-neutral-600 font-normal mt-0.5 leading-snug">
                    15 分钟后开始 · 14:00–15:50 · 实训中心 E209
                  </div>
                </div>
              </div>

              {/* =============================================================
                  Bottom Stage Subtle Technical Note (Appears in Act 4)
                 ============================================================= */}
              <div
                ref={bottomCaptionRef}
                style={{ opacity: 0, willChange: 'transform, opacity' }}
                className="relative z-20 pt-3 text-center text-[11.5px] sm:text-[12px] text-neutral-400 font-normal tracking-wide pointer-events-none"
              >
                Android 系统调度 · 无需后台常驻
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
