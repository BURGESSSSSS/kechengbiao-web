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
      className="relative w-full flex flex-col items-center select-none overflow-hidden"
    >
      {/* Living Ethereal Ambient Canvas (Continuous across Hero & Showcase) */}
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
    </section>
  )
}
