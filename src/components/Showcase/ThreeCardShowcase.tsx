import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CardItem {
  id: string
  name: string
  image: string
}

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

export const ThreeCardShowcase: React.FC = () => {
  // Default center is "今日" (index 1)
  const [activeIndex, setActiveIndex] = useState<number>(1)
  const [dragOffset, setDragOffset] = useState<number>(0)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [isAnimating, setIsAnimating] = useState<boolean>(false)

  const startXRef = useRef<number>(0)
  const currentXRef = useRef<number>(0)
  const isPointerDownRef = useRef<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % 3)
    setIsAnimating(true)
  }, [])

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + 3) % 3)
    setIsAnimating(true)
  }, [])

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 600)
      return () => clearTimeout(timer)
    }
  }, [isAnimating])

  // Pointer drag/swipe event handlers (unified for mouse and touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDownRef.current = true
    startXRef.current = e.clientX
    currentXRef.current = e.clientX
    setIsDragging(false)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return
    const diff = e.clientX - startXRef.current
    if (Math.abs(diff) > 6) {
      setIsDragging(true)
      setDragOffset(diff * 0.75)
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return
    isPointerDownRef.current = false
    const diff = e.clientX - startXRef.current

    if (Math.abs(diff) > 45) {
      if (diff < 0) {
        goToNext()
      } else {
        goToPrev()
      }
    }
    setDragOffset(0)
    setTimeout(() => setIsDragging(false), 50)
  }

  const handlePointerCancel = () => {
    isPointerDownRef.current = false
    setDragOffset(0)
    setIsDragging(false)
  }

  // Card click behavior: Clicking flank cards shifts them to center
  const handleCardClick = (index: number) => {
    if (isDragging) return
    const diff = (index - activeIndex + 3) % 3
    if (diff === 1) {
      goToNext()
    } else if (diff === 2) {
      goToPrev()
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-6xl mx-auto flex flex-col items-center select-none pt-2 pb-12 overflow-hidden"
    >
      {/* Current Active Label: Quiet and minimal */}
      <div className="h-7 mb-4 flex items-center justify-center">
        <span className="text-[13px] sm:text-sm font-medium tracking-wide text-neutral-800 transition-opacity duration-300">
          {CARDS[activeIndex].name}
        </span>
      </div>

      {/* Interactive Carousel Stage */}
      <div
        className="relative w-full h-[520px] sm:h-[600px] md:h-[640px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {CARDS.map((card, index) => {
          // Circular relative offset: 0 = center, 1 = right, 2 = left
          const diff = (index - activeIndex + 3) % 3
          const isCenter = diff === 0
          const isRight = diff === 1
          const isLeft = diff === 2

          // Responsive spatial offsets
          let scale = 1.0
          let opacity = 1.0
          let blur = '0px'
          let zIndex = 20

          if (isCenter) {
            scale = 1.0
            opacity = 1.0
            blur = isAnimating ? '1px' : '0px'
            zIndex = 30
          } else if (isRight) {
            scale = 0.88
            opacity = 0.72
            blur = '1.5px'
            zIndex = 10
          } else if (isLeft) {
            scale = 0.88
            opacity = 0.72
            blur = '1.5px'
            zIndex = 10
          }

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(index)}
              style={{
                zIndex,
                opacity,
                filter: `blur(${blur})`,
                transform: isCenter && dragOffset !== 0 ? `translateX(${dragOffset}px)` : undefined,
                transition: isDragging
                  ? 'none'
                  : 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease, filter 0.5s ease',
              }}
              className={`absolute top-0 bottom-0 flex flex-col items-center justify-start ${
                isCenter
                  ? 'cursor-default pointer-events-auto'
                  : 'cursor-pointer hover:opacity-90'
              } ${
                isRight
                  ? 'translate-x-[190px] sm:translate-x-[260px] md:translate-x-[320px] lg:translate-x-[360px]'
                  : isLeft
                  ? '-translate-x-[190px] sm:-translate-x-[260px] md:-translate-x-[320px] lg:-translate-x-[360px]'
                  : ''
              }`}
            >
              {/* Card Container with subtle software-first framing */}
              <div
                style={{
                  transform: isCenter ? `scale(${scale})` : `scale(${scale})`,
                }}
                className={`relative w-[240px] sm:w-[280px] md:w-[310px] lg:w-[325px] rounded-[28px] sm:rounded-[32px] overflow-hidden bg-white ring-1 ring-black/[0.04] ${
                  isCenter
                    ? 'shadow-[0_12px_40px_rgba(15,23,42,0.08)] ring-black/[0.06]'
                    : 'shadow-[0_4px_20px_rgba(15,23,42,0.03)] ring-black/[0.03]'
                } transition-shadow duration-500`}
              >
                <img
                  src={card.image}
                  alt={card.name}
                  draggable={false}
                  className="w-full h-auto object-cover block pointer-events-none"
                  loading="eager"
                />
              </div>

              {/* Minimal identification tag below flanking cards */}
              {!isCenter && (
                <span className="mt-3 text-xs font-normal tracking-wide text-neutral-400 select-none">
                  {card.name}
                </span>
              )}
            </div>
          )
        })}

        {/* Restrained Flank Navigation Buttons (Desktop only, subtle) */}
        <button
          onClick={goToPrev}
          aria-label="查看上一视图"
          className="hidden md:flex absolute left-4 lg:left-12 z-40 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md ring-1 ring-black/[0.06] shadow-sm items-center justify-center text-neutral-600 hover:text-neutral-950 hover:bg-white transition-all active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 -translate-x-0.5" />
        </button>

        <button
          onClick={goToNext}
          aria-label="查看下一视图"
          className="hidden md:flex absolute right-4 lg:right-12 z-40 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md ring-1 ring-black/[0.06] shadow-sm items-center justify-center text-neutral-600 hover:text-neutral-950 hover:bg-white transition-all active:scale-95"
        >
          <ChevronRight className="w-5 h-5 translate-x-0.5" />
        </button>
      </div>

      {/* Pagination Dot Indicators: Quiet and refined */}
      <div className="flex items-center gap-2 mt-4 sm:mt-6 z-30">
        {CARDS.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => {
              setActiveIndex(idx)
              setIsAnimating(true)
            }}
            aria-label={`切换至${card.name}`}
            className={`transition-all duration-300 rounded-full ${
              idx === activeIndex
                ? 'w-6 h-1.5 bg-neutral-900'
                : 'w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-400'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
