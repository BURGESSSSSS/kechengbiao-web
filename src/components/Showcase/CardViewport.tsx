import React from 'react'

export interface CardItem {
  id: string
  name: string
  image: string
}

interface CardViewportProps {
  card: CardItem
  isCenter: boolean
}

export const CardViewport: React.FC<CardViewportProps> = ({ card, isCenter }) => {
  return (
    <div
      className={`relative w-[240px] sm:w-[270px] md:w-[300px] lg:w-[320px] aspect-[1280/2642] rounded-[28px] sm:rounded-[32px] overflow-hidden bg-white ring-1 select-none pointer-events-none transition-shadow duration-300 ${
        isCenter
          ? 'shadow-[0_16px_44px_-10px_rgba(15,23,42,0.12),0_4px_16px_-4px_rgba(15,23,42,0.04)] ring-black/[0.06]'
          : 'shadow-[0_6px_22px_-6px_rgba(15,23,42,0.05)] ring-black/[0.03]'
      }`}
    >
      {/* 
        Image Cropping Strategy:
        Original screenshot is 1280 x 2772.
        Top ~130px contains Android system status bar (10:30, battery, 5G).
        Bottom contains App navigation bar ("今日 / 周视图 / 更多").
        
        CardViewport has aspect-ratio: 1280 / 2642.
        Image height set to 104.92% (2772 / 2642) pinned to bottom (bottom: 0).
        This crops exactly the top ~130px Android status bar while completely
        preserving the bottom App navigation.
      */}
      <img
        src={card.image}
        alt={card.name}
        draggable={false}
        className="absolute bottom-0 left-0 w-full h-[104.92%] object-cover object-bottom block select-none pointer-events-none"
        loading="eager"
      />
    </div>
  )
}
