import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Download } from 'lucide-react'

export const HeroIntro: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
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
          eyebrowRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.75 },
          '-=0.55'
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
      className="relative z-10 w-full max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto flex flex-col items-center justify-center text-center pt-16 sm:pt-20 md:pt-24 pb-6 sm:pb-8 min-h-[500px]"
    >
      {/* App Icon Container */}
      <div ref={iconRef} className="mb-3 sm:mb-4">
        <div className="w-[68px] h-[68px] sm:w-[76px] sm:h-[76px] md:w-[82px] md:h-[82px] rounded-[20px] sm:rounded-[24px] bg-white/90 backdrop-blur-md p-1.5 ring-1 ring-black/[0.06] shadow-[0_8px_22px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] transition-all duration-300">
          <img
            src="/assets/app-icon-circle.png"
            alt="课程表 App 图标"
            className="w-full h-full object-cover rounded-[16px] sm:rounded-[19px]"
          />
        </div>
      </div>

      {/* Eyebrow */}
      <div
        ref={eyebrowRef}
        className="text-[12px] sm:text-[13.5px] font-medium tracking-wide text-neutral-500 mb-2 sm:mb-2.5"
      >
        山东商务职业学院 · Android 原生应用
      </div>

      {/* Product Name / Main Title */}
      <h1
        ref={titleRef}
        className="text-3xl sm:text-5xl md:text-[52px] font-semibold tracking-[-0.035em] text-neutral-950 mb-3 sm:mb-4 leading-tight max-w-2xl"
      >
        山东商务学子的专属课程表
      </h1>

      {/* Subtitle / Body Paragraph */}
      <p
        ref={subtitleRef}
        className="text-[14px] sm:text-[15.5px] md:text-[16.5px] font-normal text-neutral-600 leading-relaxed tracking-[-0.01em] max-w-lg sm:max-w-xl md:max-w-2xl mx-auto mb-5 sm:mb-6 px-4"
      >
        为日常高频查课的核心需求而打造。将每次都要打开企业微信、等待教务网页加载的繁琐流程，浓缩为点开即看的原生体验。应用基于 Kotlin 与 Jetpack Compose 构建，课程数据完整保存在手机本机——从教务课表采集、截图端侧识别到课前系统提醒，日常查课、编辑与识别等核心功能无需依赖云端服务器，随时离线可用。
      </p>

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
