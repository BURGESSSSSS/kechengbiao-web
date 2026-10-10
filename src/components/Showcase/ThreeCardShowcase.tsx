import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CardViewport, CardItem } from './CardViewport'

const CARDS: CardItem[] = [
  {
    id: 'week',
    name: '周视图',
    image: '/assets/screen-week.jpg',
  },
  {
    id: 'today',
    name: '今日',
    image: '/assets/screen-today.jpg',
  },
  {
    id: 'more',
    name: '更多',
    image: '/assets/screen-more.jpg',
  },
]

const CARD_DESCRIPTIONS: Record<string, string> = {
  today: '按时间轴聚合当日课程，直接显示当前课程、剩余时间与下一节安排。',
  week: '将周一至周五完整课表收于一屏，并支持跨周浏览与本地课程编辑。',
  more: '集中管理学校课表导入、截图 OCR、课前提醒和本机课程数据。',
}

export const ThreeCardShowcase: React.FC = () => {
  // Default center is "今日" (index 1)
  const [activeIndex, setActiveIndex] = useState<number>(1)
  // Continuous drag progress: in range approx [-1.2, 1.2]
  // 0: current card centered
  // +1: left card centered (dragged right)
  // -1: right card centered (dragged left)
  const [dragProgress, setDragProgress] = useState<number>(0)
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1440
  )

  const isPointerDownRef = useRef<boolean>(false)
  const startXRef = useRef<number>(0)
  const startProgressRef = useRef<number>(0)
  const animFrameRef = useRef<number | null>(null)
  const dragProgressRef = useRef<number>(0)
  dragProgressRef.current = dragProgress
  const activeIndexRef = useRef<number>(1)
  activeIndexRef.current = activeIndex
  const pendingDeltaRef = useRef<number>(0)

  // Window resize observer for responsive step spacing
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  // Unified smooth spring/snap animation driving dragProgress
  const animateToTarget = useCallback(
    (targetProgress: number, targetIndexDelta: number) => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
        if (pendingDeltaRef.current !== 0) {
          const nextIdx = (activeIndexRef.current + pendingDeltaRef.current + 3) % 3
          setActiveIndex(nextIdx)
          activeIndexRef.current = nextIdx
          pendingDeltaRef.current = 0
        }
      }

      pendingDeltaRef.current = targetIndexDelta
      const initialProgress = dragProgressRef.current
      const startTime = performance.now()
      const duration = 280 // snappy responsive ms

      const step = (now: number) => {
        const elapsed = now - startTime
        const t = Math.min(1, elapsed / duration)
        // Cubic ease out: 1 - (1 - t)^3
        const ease = 1 - Math.pow(1 - t, 3)
        const current = initialProgress + (targetProgress - initialProgress) * ease

        setDragProgress(current)
        dragProgressRef.current = current

        if (t < 1) {
          animFrameRef.current = requestAnimationFrame(step)
        } else {
          animFrameRef.current = null
          if (pendingDeltaRef.current !== 0) {
            const nextIdx = (activeIndexRef.current + pendingDeltaRef.current + 3) % 3
            setActiveIndex(nextIdx)
            activeIndexRef.current = nextIdx
            pendingDeltaRef.current = 0
          }
          setDragProgress(0)
          dragProgressRef.current = 0
        }
      }

      animFrameRef.current = requestAnimationFrame(step)
    },
    []
  )

  // Explicit cyclic navigation actions matching product spec:
  // Next: 今日(1) -> 周视图(0) -> 更多(2) -> 今日(1) (deltaIndex = -1, slide from left/targetProgress = 1)
  const goNext = useCallback(() => {
    animateToTarget(1, -1)
  }, [animateToTarget])

  // Prev: 今日(1) -> 更多(2) -> 周视图(0) -> 今日(1) (deltaIndex = 1, slide from right/targetProgress = -1)
  const goPrev = useCallback(() => {
    animateToTarget(-1, 1)
  }, [animateToTarget])

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return
      if (e.key === 'ArrowRight') {
        goNext()
      } else if (e.key === 'ArrowLeft') {
        goPrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev])

  // Pointer event handlers with setPointerCapture (mouse and touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }

    isPointerDownRef.current = true
    startXRef.current = e.clientX
    startProgressRef.current = dragProgressRef.current

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // ignore
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return

    const deltaX = e.clientX - startXRef.current
    const swipeDistance = windowWidth < 640 ? 210 : 300
    const progressDelta = deltaX / swipeDistance

    let nextProgress = startProgressRef.current + progressDelta
    // Resistance beyond [-1, 1]
    if (nextProgress > 1) {
      nextProgress = 1 + (nextProgress - 1) * 0.35
    } else if (nextProgress < -1) {
      nextProgress = -1 + (nextProgress + 1) * 0.35
    }

    setDragProgress(nextProgress)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return
    isPointerDownRef.current = false

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    } catch {
      // ignore
    }

    const currentP = dragProgressRef.current
    const snapThreshold = 0.22

    let targetP = 0
    let deltaIndex = 0

    if (currentP > snapThreshold) {
      targetP = 1
      deltaIndex = -1 // left card slides into center
    } else if (currentP < -snapThreshold) {
      targetP = -1
      deltaIndex = 1 // right card slides into center
    } else {
      targetP = 0
      deltaIndex = 0
    }

    animateToTarget(targetP, deltaIndex)
  }

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return
    isPointerDownRef.current = false
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    } catch {
      // ignore
    }
    animateToTarget(0, 0)
  }

  // Click on flank card smoothly rotates it to center
  const handleCardClick = (baseOffset: number) => {
    if (baseOffset === -1) {
      animateToTarget(1, -1)
    } else if (baseOffset === 1) {
      animateToTarget(-1, 1)
    }
  }

  // Step spacing between card centers
  const stepSpacing =
    windowWidth < 640 ? 190 : windowWidth < 768 ? 260 : windowWidth < 1024 ? 315 : 360

  return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center select-none pt-1 pb-16 overflow-hidden">
      {/* Section Header: Material 3 three-view architecture */}
      <div className="w-full max-w-3xl mx-auto text-center px-4 pt-4 sm:pt-6 pb-6 sm:pb-8">
        <span className="text-[12px] sm:text-[13px] font-medium tracking-widest uppercase text-neutral-400 mb-2 block">
          界面架构
        </span>
        <h2 className="text-2xl sm:text-4xl md:text-[40px] font-semibold tracking-[-0.03em] text-neutral-950 leading-[1.2] mb-3 sm:mb-4">
          围绕日常查课的三大高频视图而设计
        </h2>
        <p className="text-[14.5px] sm:text-base md:text-[17px] font-normal text-neutral-500 leading-relaxed tracking-[-0.01em] max-w-xl mx-auto">
          遵循 Material 3 设计规范，查看整周排课、调整提醒，都可以直接完成。
        </p>
      </div>

      {/* 
        Independent Label Track:
        All three labels exist on the exact same horizontal baseline.
        They shift and crossfade continuously with dragProgress,
        never enter card DOM, never blur, and never drop to the bottom.
      */}
      <div className="relative w-full max-w-xs mx-auto h-8 mb-4 sm:mb-6 flex items-center justify-center">
        {CARDS.map((card, i) => {
          const baseOffset = ((i - activeIndex + 1) % 3 + 3) % 3 - 1
          const continuousPos = baseOffset + dragProgress
          const normPos = ((continuousPos + 1.5) % 3 + 3) % 3 - 1.5
          const absPos = Math.abs(normPos)

          const labelSpacing = 92
          const labelX = normPos * labelSpacing
          const labelOpacity = Math.max(0.35, 1.0 - 0.58 * Math.min(1, absPos))
          const isPrimary = absPos < 0.45

          return (
            <button
              key={card.id}
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={() => {
                if (baseOffset === -1) animateToTarget(1, -1)
                else if (baseOffset === 1) animateToTarget(-1, 1)
              }}
              style={{
                transform: `translateX(${labelX.toFixed(2)}px)`,
                opacity: labelOpacity,
              }}
              className={`absolute text-[13px] sm:text-sm tracking-wide transition-colors duration-150 cursor-pointer ${
                isPrimary
                  ? 'text-neutral-900 font-medium'
                  : 'text-neutral-400 font-normal hover:text-neutral-600'
              }`}
            >
              {card.name}
            </button>
          )
        })}
      </div>

      {/* Interactive Carousel Stage with Direct Manipulation */}
      <div
        className="relative w-full h-[540px] sm:h-[600px] md:h-[660px] lg:h-[700px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {CARDS.map((card, index) => {
          // Circular relative offset in {-1, 0, 1}
          const baseOffset = ((index - activeIndex + 1) % 3 + 3) % 3 - 1
          const continuousPos = baseOffset + dragProgress
          const normPos = ((continuousPos + 1.5) % 3 + 3) % 3 - 1.5
          const absPos = Math.abs(normPos)

          // Continuous interpolation for all properties
          const x = normPos * stepSpacing
          const scale = 1.0 - 0.12 * Math.min(1, absPos)
          const opacity = Math.max(
            0.25,
            1.0 - 0.28 * Math.min(1, absPos) - 0.45 * Math.max(0, absPos - 1)
          )
          const blurAmount = 1.5 * Math.min(1, absPos)
          const filter = blurAmount > 0.05 ? `blur(${blurAmount.toFixed(2)}px)` : 'none'
          const zIndex = Math.round(30 - 20 * Math.min(1.5, absPos))
          const isCenter = absPos < 0.35

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(baseOffset)}
              style={{
                transform: `translateX(${x.toFixed(2)}px) scale(${scale.toFixed(3)})`,
                opacity,
                filter,
                zIndex,
                willChange: 'transform, opacity, filter',
              }}
              className={`absolute top-0 bottom-0 flex flex-col items-center justify-start ${
                isCenter ? 'cursor-default pointer-events-auto' : 'cursor-pointer'
              }`}
            >
              <CardViewport card={card} isCenter={isCenter} />
            </div>
          )
        })}

        {/* Quiet desktop flank navigation arrows */}
        <button
          type="button"
          onClick={goPrev}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          aria-label="查看上一视图"
          className="hidden md:flex absolute left-4 lg:left-10 z-40 w-10 h-10 rounded-full bg-white/75 backdrop-blur-md ring-1 ring-black/[0.06] shadow-sm items-center justify-center text-neutral-600 hover:text-neutral-950 hover:bg-white transition-all active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 -translate-x-0.5" />
        </button>

        <button
          type="button"
          onClick={goNext}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          aria-label="查看下一视图"
          className="hidden md:flex absolute right-4 lg:right-10 z-40 w-10 h-10 rounded-full bg-white/75 backdrop-blur-md ring-1 ring-black/[0.06] shadow-sm items-center justify-center text-neutral-600 hover:text-neutral-950 hover:bg-white transition-all active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 translate-x-0.5" />
        </button>
      </div>

      {/* Pagination Dot Indicators */}
      <div className="flex items-center gap-2 mt-4 sm:mt-6 z-30">
        {CARDS.map((card, idx) => (
          <button
            key={card.id}
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={() => {
              const diff = ((idx - activeIndex + 1) % 3 + 3) % 3 - 1
              if (diff === 1) animateToTarget(-1, 1)
              else if (diff === -1) animateToTarget(1, -1)
            }}
            aria-label={`切换至${card.name}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === activeIndex
                ? 'w-6 h-1.5 bg-neutral-900'
                : 'w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-400'
            }`}
          />
        ))}
      </div>

      {/* Active Card Description */}
      <div className="w-full max-w-md mx-auto text-center px-4 mt-3 sm:mt-4 min-h-[38px] flex items-center justify-center">
        <p className="text-[13px] sm:text-[14px] text-neutral-500 font-normal leading-relaxed transition-opacity duration-200">
          {CARD_DESCRIPTIONS[CARDS[activeIndex].id]}
        </p>
      </div>
    </div>
  )
}
