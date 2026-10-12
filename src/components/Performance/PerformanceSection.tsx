import React from 'react'

export const PerformanceSection: React.FC = () => {
  return (
    <section
      id="performance"
      className="relative w-full pt-8 sm:pt-12 md:pt-14 pb-9 sm:pb-12 md:pb-14 px-6 sm:px-10 bg-[#FBFBFD] overflow-hidden"
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Primary Headline: Unified solid black, emphasizing 0.3 秒 */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-[-0.035em] text-neutral-950 leading-[1.25] md:leading-[1.2] mb-5 sm:mb-6 max-w-3xl mx-auto">
          纯原生架构驱动，
          <br className="hidden sm:inline" />
          冷启动约 <span className="font-bold tracking-tight">0.3 秒</span>
        </h2>

        {/* Supporting Editorial Paragraph */}
        <p className="text-base sm:text-lg md:text-xl font-normal text-neutral-600 tracking-[-0.01em] leading-relaxed max-w-2xl mx-auto mb-6 sm:mb-8">
          不再等待教务系统 12 秒以上的启动与网页加载时间，打开即用。
        </p>

        {/* Supporting Metadata */}
        <div className="text-[13px] sm:text-[14.5px] font-medium text-neutral-400 tracking-wide">
          Kotlin + Jetpack Compose 原生构建 · Room 本地读取 · 日常查课零网络等待
        </div>
      </div>
    </section>
  )
}
