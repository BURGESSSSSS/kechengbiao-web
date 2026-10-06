import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { AmbientBackground } from './AmbientBackground'
import { HeroIntro } from './HeroIntro'
import { ThreeCardShowcase } from '../Showcase/ThreeCardShowcase'

export const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null)
  const showcaseWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        showcaseWrapperRef.current,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.35, ease: 'power2.out' }
      )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative w-full flex flex-col items-center select-none overflow-hidden pb-12 sm:pb-16 md:pb-20"
    >
      {/* Living Ethereal Ambient Canvas (Extends across Hero, Showcase, and Bottom Fade Zone) */}
      <AmbientBackground />

      {/* HeroIntro: strictly controlled viewport-relative geometry */}
      <HeroIntro />

      {/* The Three-Card Showcase in normal document flow */}
      <div
        id="showcase"
        ref={showcaseWrapperRef}
        className="relative z-10 w-full max-w-6xl mx-auto"
      >
        <ThreeCardShowcase />
      </div>

      {/* Bottom Visual Fade Zone (200-260px): smoothly dissolves blue-purple aura into #FBFBFD */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[200px] sm:h-[230px] md:h-[260px] z-[5]"
        style={{
          background:
            'linear-gradient(180deg, rgba(251,251,253,0) 0%, rgba(251,251,253,0.16) 24%, rgba(251,251,253,0.44) 50%, rgba(251,251,253,0.76) 74%, rgba(251,251,253,0.94) 90%, #FBFBFD 100%)',
        }}
      />
    </section>
  )
}
