import React, { useState, useEffect } from 'react'
import { Download } from 'lucide-react'

const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      // Hysteresis threshold to prevent flickering around boundary
      if (scrollY > 16) {
        setIsScrolled(true)
      } else if (scrollY < 8) {
        setIsScrolled(false)
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 h-13 sm:h-14 transition-[background-color,border-color,box-shadow] duration-150 ease-out select-none ${
        isScrolled
          ? 'bg-[#FBFBFD] border-b border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      {/* Brand Identity */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[9px] sm:rounded-[10px] overflow-hidden ring-1 ring-black/[0.08] shadow-xs bg-white p-0.5 flex items-center justify-center">
          <img
            src="/assets/app-icon-circle.png"
            alt="课程表 Logo"
            className="w-full h-full object-cover rounded-[7px] sm:rounded-[8px]"
          />
        </div>
        <span className="font-semibold tracking-[-0.015em] text-neutral-950 text-[14.5px] sm:text-[15.5px]">
          课程表
        </span>
      </div>

      {/* Navigation & Secondary Actions */}
      <div className="flex items-center gap-3 sm:gap-6">
        <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-[14px] font-medium text-neutral-600">
          <a
            href="#hero"
            className="hover:text-neutral-950 transition-colors duration-150"
          >
            概览
          </a>
          <a
            href="#showcase"
            className="hover:text-neutral-950 transition-colors duration-150"
          >
            界面展示
          </a>
          <a
            href="#performance"
            className="hover:text-neutral-950 transition-colors duration-150"
          >
            原生性能
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Subtle Github/Open Source indicator */}
          <a
            href="#download"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[13px] sm:text-[13.5px] font-medium text-neutral-700 hover:text-neutral-950 rounded-full hover:bg-neutral-900/[0.04] transition-colors duration-150"
            aria-label="开源仓库"
          >
            <GithubIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">开源</span>
          </a>

          {/* Quick Header CTA */}
          <a
            href="#download"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-1.5 text-[13px] sm:text-[13.5px] font-medium text-white bg-neutral-950 rounded-full shadow-xs hover:bg-neutral-800 transition-colors duration-150 active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>下载</span>
          </a>
        </div>
      </div>
    </header>
  )
}
