import React from 'react'

export const ProductShowcase: React.FC = () => {
  const screens = [
    {
      id: 'week',
      name: '周视图',
      image: `${import.meta.env.BASE_URL}assets/screen-week.jpg`,
    },
    {
      id: 'today',
      name: '今日',
      image: `${import.meta.env.BASE_URL}assets/screen-today.jpg`,
      isCenter: true,
    },
    {
      id: 'more',
      name: '更多',
      image: `${import.meta.env.BASE_URL}assets/screen-more.jpg`,
    },
  ]

  return (
    <section
      id="showcase"
      className="relative w-full py-20 sm:py-28 md:py-36 px-4 sm:px-8 bg-[#FBFBFD] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Desktop View: Today Centered & Dominant, Week and More Flanking (Hidden on Mobile) */}
        <div className="hidden lg:flex items-end justify-center gap-8 xl:gap-12 pt-6 pb-12">
          {/* Left: Week View */}
          <div className="flex flex-col items-center">
            <span className="text-[13px] font-medium tracking-wide text-neutral-400 mb-3 select-none">
              周视图
            </span>
            <div className="w-[280px] rounded-[28px] overflow-hidden bg-white ring-1 ring-black/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <img
                src={`${import.meta.env.BASE_URL}assets/screen-week.jpg`}
                alt="周视图"
                className="w-full h-auto object-cover block"
                loading="lazy"
              />
            </div>
          </div>

          {/* Center: Today View (Visual Anchor) */}
          <div className="flex flex-col items-center -translate-y-4">
            <span className="text-[13px] font-medium tracking-wide text-neutral-900 mb-3 select-none">
              今日
            </span>
            <div className="w-[325px] rounded-[30px] overflow-hidden bg-white ring-1 ring-black/[0.05] shadow-[0_6px_28px_rgba(0,0,0,0.05)]">
              <img
                src={`${import.meta.env.BASE_URL}assets/screen-today.jpg`}
                alt="今日"
                className="w-full h-auto object-cover block"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right: More View */}
          <div className="flex flex-col items-center">
            <span className="text-[13px] font-medium tracking-wide text-neutral-400 mb-3 select-none">
              更多
            </span>
            <div className="w-[280px] rounded-[28px] overflow-hidden bg-white ring-1 ring-black/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <img
                src={`${import.meta.env.BASE_URL}assets/screen-more.jpg`}
                alt="更多"
                className="w-full h-auto object-cover block"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Mobile / Tablet View: Pure Vertical Flow directly on page, no wrapper cards */}
        <div className="lg:hidden flex flex-col items-center gap-14 sm:gap-20">
          {/* Order: Today first, then Week, then More */}
          {[screens[1], screens[0], screens[2]].map((screen) => (
            <div key={screen.id} className="w-full flex flex-col items-center">
              <span className="text-[13px] font-medium tracking-wide text-neutral-500 mb-3 select-none">
                {screen.name}
              </span>
              <div className="w-full max-w-[270px] sm:max-w-[310px] rounded-[26px] overflow-hidden bg-white ring-1 ring-black/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <img
                  src={screen.image}
                  alt={screen.name}
                  className="w-full h-auto object-cover block"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
