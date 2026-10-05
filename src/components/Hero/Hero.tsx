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
        { opacity: 0, y: 16, scale: 0.96 },
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
          { opacity: 0, y: 36 },
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
      className="relative min-h-[100svh] w-full flex flex-col items-center justify-between pt-20 sm:pt-28 md:pt-36 px-4 sm:px-6 overflow-hidden select-none"
    >
      {/* Living Ethereal Ambient Canvas */}
      <AmbientBackground />

      {/* Central Hero Information Hierarchy */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl sm:max-w-2xl mx-auto my-auto pt-4 sm:pt-0">
        {/* App Icon Container: strictly controlled anchor scale (76-88px) */}
        <div ref={iconRef} className="mb-4 sm:mb-6">
          <div className="w-[76px] h-[76px] sm:w-[84px] sm:h-[84px] md:w-[88px] md:h-[88px] rounded-[22px] sm:rounded-[26px] bg-white/85 backdrop-blur-md p-1.5 ring-1 ring-black/[0.06] shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.06)] transition-all duration-300">
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
          className="text-3xl sm:text-5xl md:text-[58px] font-semibold tracking-[-0.035em] text-neutral-950 mb-2 sm:mb-3.5 leading-tight"
        >
          课程表
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-[14px] sm:text-lg md:text-[19px] font-normal text-neutral-600 tracking-[-0.01em] max-w-md sm:max-w-lg mx-auto mb-6 sm:mb-8"
        >
          山东商务学子的专属课程表
        </p>

        {/* Download Android Button */}
        <div ref={ctaRef} className="mb-4 sm:mb-6">
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
          className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-[13px] font-normal text-neutral-400 sm:text-neutral-500 tracking-wide"
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

      {/* Bottom fold peek: Directly and naturally peeking the real 今日 interface */}
      <div
        ref={peekRef}
        className="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto flex flex-col items-center mt-4 sm:mt-6"
      >
        <a
          href="#showcase"
          className="group block w-full translate-y-3 sm:translate-y-6 hover:translate-y-1 transition-transform duration-300"
          aria-label="查看产品界面"
        >
          <div className="w-[270px] sm:w-[300px] md:w-[320px] mx-auto rounded-t-[28px] sm:rounded-t-[32px] overflow-hidden bg-white ring-1 ring-black/[0.05] shadow-[0_-4px_24px_rgba(0,0,0,0.03)] p-1.5 sm:p-2 pb-0">
            <div className="rounded-t-[22px] sm:rounded-t-[26px] overflow-hidden bg-[#FBFBFD] max-h-[90px] sm:max-h-[120px] md:max-h-[140px]">
              <img
                src="/assets/screen-today.jpg"
                alt="今日界面预览"
                className="w-full h-auto object-cover object-top block"
              />
            </div>
          </div>
        </a>
      </div>
    </section>
  )
}
