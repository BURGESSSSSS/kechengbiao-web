import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Download } from 'lucide-react'

export const HeroIntro: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const attributesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
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
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const btn = e.currentTarget as HTMLElement
    gsap.fromTo(btn, { scale: 0.96 }, { scale: 1, duration: 0.25, ease: 'power1.out' })
  }

  return (
    <div
      ref={containerRef}
      className="relative z-10 w-full max-w-xl sm:max-w-2xl mx-auto flex flex-col items-center justify-center text-center pt-16 sm:pt-20 md:pt-24 pb-2 sm:pb-4 h-[58svh] md:h-[62svh] min-h-[380px] max-h-[500px]"
    >
      {/* App Icon Container */}
      <div ref={iconRef} className="mb-3 sm:mb-4">
        <div className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] md:w-[84px] md:h-[84px] rounded-[22px] sm:rounded-[26px] bg-white/90 backdrop-blur-md p-1.5 ring-1 ring-black/[0.06] shadow-[0_8px_22px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] transition-all duration-300">
          <img
            src={`${import.meta.env.BASE_URL}assets/app-icon-circle.png`}
            alt="课程表 App 图标"
            className="w-full h-full object-cover rounded-[18px] sm:rounded-[21px]"
          />
        </div>
      </div>

      {/* Product Name / Main Title */}
      <h1
        ref={titleRef}
        className="text-3xl sm:text-5xl md:text-[52px] font-semibold tracking-[-0.035em] text-neutral-950 mb-3 sm:mb-4 leading-tight max-w-2xl"
      >
        山东商务学子的专属课程表
      </h1>

      {/* Download Android Button */}
      <div ref={ctaRef} className="mb-3 sm:mb-3.5">
        <a
          href="#download"
          onClick={handleDownloadClick}
          className="group inline-flex items-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3.5 rounded-full bg-neutral-950 text-white text-[13px] sm:text-[15px] font-medium tracking-tight shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:bg-neutral-800 hover:shadow-[0_6px_18px_rgba(0,0,0,0.14)] active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:-translate-y-0.5 duration-200" />
          <span>下载 Android</span>
        </a>
      </div>

      {/* Second Information Tier: 4 Core Attributes */}
      <div
        ref={attributesRef}
        className="flex items-center justify-center gap-3 sm:gap-4 text-[14px] sm:text-[15.5px] font-medium text-neutral-700 tracking-normal select-none"
      >
        <span className="hover:text-neutral-950 transition-colors">开源</span>
        <span className="text-neutral-400 select-none text-[13px] sm:text-[14px] font-black">·</span>
        <span className="hover:text-neutral-950 transition-colors">安全</span>
        <span className="text-neutral-400 select-none text-[13px] sm:text-[14px] font-black">·</span>
        <span className="hover:text-neutral-950 transition-colors">离线</span>
        <span className="text-neutral-400 select-none text-[13px] sm:text-[14px] font-black">·</span>
        <span className="hover:text-neutral-950 transition-colors">快捷</span>
      </div>
    </div>
  )
}
