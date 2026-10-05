import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { AmbientBackground } from './AmbientBackground'
import { Download } from 'lucide-react'

export const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const attributesRef = useRef<HTMLDivElement>(null)
  const peekRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Quiet, serene entrance choreography matching Codex baseline
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        delay: 0.15,
      })

      tl.fromTo(
        iconRef.current,
        { opacity: 0, y: 16, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 }
      )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.75 },
          '-=0.55'
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.75 },
          '-=0.55'
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.75 },
          '-=0.55'
        )
        .fromTo(
          attributesRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.75 },
          '-=0.55'
        )
        .fromTo(
          peekRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1.0 },
          '-=0.5'
        )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const btn = e.currentTarget as HTMLElement
    gsap.fromTo(btn, { scale: 0.96 }, { scale: 1, duration: 0.25, ease: 'power1.out' })
  }

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-[100svh] w-full flex flex-col items-center justify-between pt-28 sm:pt-32 md:pt-36 px-6 overflow-hidden select-none"
    >
      {/* Living Ethereal Ambient Canvas */}
      <AmbientBackground />

      {/* Central Hero Information Hierarchy */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto my-auto">
        {/* App Icon Container */}
        <div ref={iconRef} className="mb-6 md:mb-7">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-[24px] sm:rounded-[26px] bg-white/90 backdrop-blur-xl p-1.5 ring-1 ring-black/[0.07] shadow-[0_10px_28px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)] transition-all duration-300">
            <img
              src="/assets/app-icon-circle.png"
              alt="课程表 App 图标"
              className="w-full h-full object-cover rounded-[19px] sm:rounded-[21px]"
            />
          </div>
        </div>

        {/* Product Name */}
        <h1
          ref={titleRef}
          className="text-4xl sm:text-5xl md:text-[56px] font-semibold tracking-[-0.035em] text-neutral-950 mb-3.5 leading-tight"
        >
          课程表
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-base sm:text-lg md:text-[19px] font-normal text-neutral-600 tracking-[-0.01em] max-w-lg mx-auto mb-8 md:mb-9"
        >
          山东商务学子的专属课程表
        </p>

        {/* Download Android Button */}
        <div ref={ctaRef} className="mb-6 md:mb-7">
          <a
            href="#download"
            onClick={handleDownloadClick}
            className="group inline-flex items-center gap-2.5 px-6 py-3 sm:px-7 sm:py-3.5 rounded-full bg-neutral-950 text-white text-[14px] sm:text-[15px] font-medium tracking-tight shadow-[0_4px_14px_rgba(0,0,0,0.12)] hover:bg-neutral-800 hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 duration-200" />
            <span>下载 Android</span>
          </a>
        </div>

        {/* Lightweight Metadata Attributes (Not Feature Cards) */}
        <div
          ref={attributesRef}
          className="flex items-center justify-center gap-2.5 sm:gap-3.5 text-xs sm:text-[13px] font-normal text-neutral-500 tracking-wide"
        >
          <span>开源</span>
          <span className="text-neutral-300 select-none">·</span>
          <span>安全</span>
          <span className="text-neutral-300 select-none">·</span>
          <span>离线</span>
          <span className="text-neutral-300 select-none">·</span>
          <span>快捷</span>
        </div>
      </div>

      {/* Bottom fold peek: Top chrome of product interface peeking up into view (Codex hallmark) */}
      <div
        ref={peekRef}
        className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center mt-6 sm:mt-10"
      >
        <a
          href="#showcase"
          className="group block w-full max-w-lg md:max-w-xl mx-auto translate-y-4 sm:translate-y-6 hover:translate-y-2 transition-transform duration-300"
          aria-label="查看产品界面"
        >
          <div className="rounded-t-[28px] sm:rounded-t-[32px] bg-white/80 backdrop-blur-xl p-3 pb-0 ring-1 ring-black/[0.06] shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
            <div className="h-10 sm:h-12 border-b border-neutral-100 flex items-center justify-between px-4 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-pulse" />
                <span className="font-medium text-neutral-700">实时课表就绪</span>
              </div>
              <span className="text-[11px] text-neutral-400 group-hover:text-neutral-900 transition-colors">
                滚动查看界面 ↓
              </span>
            </div>
            {/* Top clipping of Today view header */}
            <div className="h-10 sm:h-12 bg-white/60 flex items-center justify-between px-4 text-xs text-neutral-500">
              <span className="font-semibold text-neutral-900 text-sm">今日 · 周一</span>
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-[11px] text-neutral-600">3 节课</span>
            </div>
          </div>
        </a>
      </div>
    </section>
  )
}
