import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { AmbientBackground } from './AmbientBackground'
import { ThreeCardShowcase } from '../Showcase/ThreeCardShowcase'
import { Download } from 'lucide-react'

export const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const attributesRef = useRef<HTMLDivElement>(null)
  const showcaseWrapperRef = useRef<HTMLDivElement>(null)

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
          showcaseWrapperRef.current,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.9 },
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
      className="relative w-full flex flex-col items-center pt-20 sm:pt-24 md:pt-28 px-4 sm:px-6 overflow-hidden select-none"
    >
      {/* Living Ethereal Ambient Canvas (Continuous across Hero & Showcase) */}
      <AmbientBackground />

      {/* Central Hero Information Hierarchy: Concentrated, balanced, and steady */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl sm:max-w-2xl mx-auto mb-6 sm:mb-8">
        {/* App Icon Container: strictly controlled anchor scale */}
        <div ref={iconRef} className="mb-3.5 sm:mb-4">
          <div className="w-[74px] h-[74px] sm:w-[82px] sm:h-[82px] md:w-[86px] md:h-[86px] rounded-[22px] sm:rounded-[26px] bg-white/90 backdrop-blur-md p-1.5 ring-1 ring-black/[0.06] shadow-[0_8px_22px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] transition-all duration-300">
            <img
              src="/assets/app-icon-circle.png"
              alt="课程表 App 图标"
              className="w-full h-full object-cover rounded-[18px] sm:rounded-[21px]"
            />
          </div>
        </div>

        {/* Product Name */}
        <h1
          ref={titleRef}
          className="text-3xl sm:text-5xl md:text-[54px] font-semibold tracking-[-0.035em] text-neutral-950 mb-2 sm:mb-2.5 leading-tight"
        >
          课程表
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-[14px] sm:text-base md:text-[18px] font-normal text-neutral-600 tracking-[-0.01em] max-w-md sm:max-w-lg mx-auto mb-5 sm:mb-6"
        >
          山东商务学子的专属课程表
        </p>

        {/* Download Android Button */}
        <div ref={ctaRef} className="mb-3.5 sm:mb-4">
          <a
            href="#download"
            onClick={handleDownloadClick}
            className="group inline-flex items-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3.5 rounded-full bg-neutral-950 text-white text-[13px] sm:text-[15px] font-medium tracking-tight shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:bg-neutral-800 hover:shadow-[0_6px_18px_rgba(0,0,0,0.14)] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:-translate-y-0.5 duration-200" />
            <span>下载 Android</span>
          </a>
        </div>

        {/* Lightweight Metadata Attributes */}
        <div
          ref={attributesRef}
          className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-[13px] font-normal text-neutral-400 tracking-wide"
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

      {/* The Three-Card Interactive Component:
          Directly exposed in the first screen (~50% visible without scrolling),
          mirroring the OpenAI Codex Hero product stage */}
      <div
        id="showcase"
        ref={showcaseWrapperRef}
        className="relative z-10 w-full max-w-6xl mx-auto mt-2 sm:mt-4"
      >
        <ThreeCardShowcase />
      </div>
    </section>
  )
}
