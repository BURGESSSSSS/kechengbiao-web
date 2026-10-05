import React, { useState } from 'react'
import { Calendar, Clock, Settings, Sparkles } from 'lucide-react'

export const ProductShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'more'>('today')

  const screens = [
    {
      id: 'today',
      name: '今日',
      label: '今日视图',
      subtitle: '此时此刻，正在进行的课程一目了然',
      image: '/assets/screen-today.jpg',
      icon: Clock,
      highlight: true,
      description: '高对比度进行中课程卡片、实时倒计时与课时进度条，告别走错教室与迟到。',
    },
    {
      id: 'week',
      name: '周视图',
      label: '整周网格',
      subtitle: '5×4 经典网格，全周安排尽在掌握',
      image: '/assets/screen-week.jpg',
      icon: Calendar,
      highlight: false,
      description: '清晰直观的整周课表排布，周数无缝切换，支持空闲教室规划与快速备考。',
    },
    {
      id: 'more',
      name: '更多',
      label: '更多与设置',
      subtitle: '纯本地离线存储，安全免登录',
      image: '/assets/screen-more.jpg',
      icon: Settings,
      highlight: false,
      description: '教务系统一键同步、课程到时提醒与本地备份恢复，数据零上传，尊重隐私。',
    },
  ]

  return (
    <section
      id="showcase"
      className="relative w-full py-28 md:py-36 px-6 sm:px-10 bg-[#FBFBFD] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header: Codex-style typography */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/[0.04] text-neutral-600 text-xs font-medium tracking-wide mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>三重视图架构</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-neutral-950 mb-4">
            纯粹为查课体验而设计
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 font-normal leading-relaxed">
            摒弃繁杂广告与无用社交。软件以今日、周视图、更多三维结构，回归课程表最本真的高效状态。
          </p>
        </div>

        {/* Desktop View: Editorial Asymmetric Staging (Hidden on Mobile) */}
        <div className="hidden lg:block relative">
          {/* Subtle Ambient Glow behind showcase */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-indigo-100/40 via-blue-100/30 to-purple-100/40 blur-3xl pointer-events-none rounded-full" />

          {/* Staggered Floating Screens */}
          <div className="relative z-10 flex items-center justify-center gap-6 xl:gap-10 pt-4 pb-12">
            {/* Left: Week View (Secondary Depth) */}
            <div
              onClick={() => setActiveTab('week')}
              className={`relative cursor-pointer transition-all duration-500 transform ${
                activeTab === 'week'
                  ? 'scale-105 z-30 translate-y-0 opacity-100'
                  : 'scale-95 z-10 translate-y-6 opacity-85 hover:opacity-100 hover:scale-[0.98]'
              }`}
            >
              <div className="text-center mb-3">
                <span className="text-xs font-medium tracking-wider text-neutral-400 uppercase">
                  周视图
                </span>
              </div>
              <div className="w-[280px] rounded-[32px] p-2 bg-white/70 backdrop-blur-md ring-1 ring-black/[0.06] secondary-screen-shadow transition-shadow">
                <div className="rounded-[24px] overflow-hidden bg-neutral-100 ring-1 ring-black/[0.05]">
                  <img
                    src="/assets/screen-week.jpg"
                    alt="周视图课表格局"
                    className="w-full h-auto object-cover block"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Center: Today View (Visual Anchor & Hero Center) */}
            <div
              onClick={() => setActiveTab('today')}
              className={`relative cursor-pointer transition-all duration-500 transform ${
                activeTab === 'today'
                  ? 'scale-105 z-30 translate-y-0 opacity-100'
                  : 'scale-95 z-10 translate-y-4 opacity-85 hover:opacity-100 hover:scale-[0.98]'
              }`}
            >
              <div className="text-center mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-900 text-white text-[11px] font-medium tracking-wide">
                  核心 · 今日
                </span>
              </div>
              <div className="w-[310px] rounded-[36px] p-2.5 bg-white ring-1 ring-black/[0.08] hero-screen-shadow transition-shadow">
                <div className="rounded-[28px] overflow-hidden bg-neutral-100 ring-1 ring-black/[0.05]">
                  <img
                    src="/assets/screen-today.jpg"
                    alt="今日课表视图"
                    className="w-full h-auto object-cover block"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Right: More View (Secondary Depth) */}
            <div
              onClick={() => setActiveTab('more')}
              className={`relative cursor-pointer transition-all duration-500 transform ${
                activeTab === 'more'
                  ? 'scale-105 z-30 translate-y-0 opacity-100'
                  : 'scale-95 z-10 translate-y-6 opacity-85 hover:opacity-100 hover:scale-[0.98]'
              }`}
            >
              <div className="text-center mb-3">
                <span className="text-xs font-medium tracking-wider text-neutral-400 uppercase">
                  更多 · 离线
                </span>
              </div>
              <div className="w-[280px] rounded-[32px] p-2 bg-white/70 backdrop-blur-md ring-1 ring-black/[0.06] secondary-screen-shadow transition-shadow">
                <div className="rounded-[24px] overflow-hidden bg-neutral-100 ring-1 ring-black/[0.05]">
                  <img
                    src="/assets/screen-more.jpg"
                    alt="更多与离线设置"
                    className="w-full h-auto object-cover block"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Active Detail Caption Footer */}
          <div className="max-w-xl mx-auto text-center mt-6 transition-all duration-300">
            {screens.map(
              (s) =>
                s.id === activeTab && (
                  <div key={s.id} className="animate-fadeIn">
                    <p className="text-sm font-medium text-neutral-900 mb-1">
                      {s.subtitle}
                    </p>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                )
            )}
          </div>
        </div>

        {/* Mobile / Tablet View: Natural Vertical Product Rhythm (Targeting 390x844 & tablets) */}
        <div className="lg:hidden flex flex-col gap-12 sm:gap-16">
          {screens.map((screen) => {
            const IconComponent = screen.icon
            return (
              <div
                key={screen.id}
                className="flex flex-col items-center bg-white rounded-3xl p-6 sm:p-8 ring-1 ring-black/[0.05] soft-card-shadow"
              >
                {/* Meta details */}
                <div className="w-full flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-neutral-900 text-sm">
                      {screen.name}
                    </span>
                  </div>
                  {screen.id === 'today' && (
                    <span className="px-2 py-0.5 rounded-full bg-neutral-950 text-white text-[11px] font-medium">
                      主要视图
                    </span>
                  )}
                </div>

                {/* UI Screen */}
                <div className="w-full max-w-[280px] sm:max-w-[320px] rounded-[28px] p-2 bg-neutral-50 ring-1 ring-black/[0.06] shadow-md my-2">
                  <div className="rounded-[22px] overflow-hidden bg-neutral-100 ring-1 ring-black/[0.04]">
                    <img
                      src={screen.image}
                      alt={screen.label}
                      className="w-full h-auto object-cover block"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Subtitle & Description */}
                <div className="w-full text-center mt-4">
                  <h3 className="text-sm font-medium text-neutral-900 mb-1">
                    {screen.subtitle}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {screen.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
