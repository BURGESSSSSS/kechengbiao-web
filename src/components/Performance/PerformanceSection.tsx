import React from 'react'

export const PerformanceSection: React.FC = () => {
  return (
    <section
      id="performance"
      className="relative w-full py-32 md:py-48 px-6 sm:px-10 bg-[#FBFBFD] border-t border-neutral-900/[0.04] overflow-hidden"
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Subdued section badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/[0.04] text-neutral-500 text-xs font-normal tracking-wide mb-8">
          <span>原生体验</span>
          <span className="text-neutral-300">·</span>
          <span>即刻呈现</span>
        </div>

        {/* Primary Headline with quiet typographic weight on 0.3 秒 */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.035em] text-neutral-950 leading-[1.2] md:leading-[1.18] mb-8 max-w-3xl mx-auto">
          轻量级安卓原生应用，
          <br className="hidden sm:inline" />
          冷启动约{' '}
          <span className="inline-block font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-neutral-950 via-neutral-900 to-indigo-900">
            0.3 秒
          </span>
          。
        </h2>

        {/* Supporting Editorial Paragraph */}
        <p className="text-base sm:text-xl md:text-2xl font-normal text-neutral-500 tracking-[-0.01em] leading-relaxed max-w-2xl mx-auto">
          不再等待教务系统 12 秒以上的启动时间，打开即用。
        </p>
      </div>
    </section>
  )
}
