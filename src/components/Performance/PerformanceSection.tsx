import React from 'react'

export const PerformanceSection: React.FC = () => {
  return (
    <section
      id="performance"
      className="relative w-full py-28 md:py-44 px-6 sm:px-10 bg-[#FBFBFD] border-t border-neutral-900/[0.04] overflow-hidden"
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Primary Headline: Unified solid black, emphasizing 0.3 秒 through weight & size */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-[-0.035em] text-neutral-950 leading-[1.25] md:leading-[1.2] mb-6 sm:mb-8 max-w-3xl mx-auto">
          轻量级安卓原生应用，
          <br className="hidden sm:inline" />
          冷启动约 <span className="font-bold tracking-tight">0.3 秒</span>。
        </h2>

        {/* Supporting Editorial Paragraph */}
        <p className="text-base sm:text-xl md:text-2xl font-normal text-neutral-500 tracking-[-0.01em] leading-relaxed max-w-2xl mx-auto">
          不再等待教务系统 12 秒以上的启动时间，打开即用。
        </p>
      </div>
    </section>
  )
}
