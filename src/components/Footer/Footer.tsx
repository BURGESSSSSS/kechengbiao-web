import React from 'react'
import { Download, MessageSquare } from 'lucide-react'
import { useDownloadModal } from '../../context/DownloadContext'

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

export const Footer: React.FC = () => {
  const { openDownloadModal } = useDownloadModal()

  return (
    <footer id="download" className="w-full bg-[#FBFBFD] border-t border-neutral-900/[0.06] select-none">
      {/* Top CTA & Summary Box */}
      <div className="w-full max-w-6xl mx-auto px-5 sm:px-8 md:px-14 lg:px-20 pt-16 sm:pt-20 md:pt-24 pb-14 sm:pb-16 text-center flex flex-col items-center">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-neutral-950 mb-3 sm:mb-4">
          为真实校园查课场景构建。
        </h2>
        <p className="text-[14.5px] sm:text-base md:text-[17px] text-neutral-600 font-normal leading-relaxed max-w-2xl mx-auto mb-2 sm:mb-2.5">
          一个面向山东商务职业学院学生的开源 Android 原生项目。日常课程数据保存在本机。
        </p>
        <p className="text-[14.5px] sm:text-base md:text-[17px] text-neutral-600 font-normal leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-10">
          使用过程中遇到问题，或有任何改进建议，欢迎通过邮箱联系开发者：
          <a
            href="mailto:suyu20651@gmail.com"
            className="text-neutral-900 hover:underline underline-offset-4 transition-colors"
          >
            suyu20651@gmail.com
          </a>
        </p>

        {/* Primary Download CTA */}
        <div className="mb-10 sm:mb-12">
          <button
            type="button"
            onClick={openDownloadModal}
            className="group inline-flex items-center gap-2 px-7 py-3 sm:px-8 sm:py-3.5 rounded-full bg-neutral-950 text-white text-[14px] sm:text-[15px] font-medium tracking-tight shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:bg-neutral-800 hover:shadow-[0_6px_20px_rgba(0,0,0,0.16)] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 duration-200" />
            <span>下载 Android</span>
          </button>
        </div>

        {/* Secondary Links Row */}
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-[13.5px] sm:text-[14px] font-medium text-neutral-600 mb-8 sm:mb-10">
          <a
            href="https://github.com/BURGESSSSSS/schedule-app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-neutral-950 transition-colors"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub 开源仓库</span>
          </a>
          <a
            href="https://github.com/BURGESSSSSS/schedule-app/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-neutral-950 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>问题反馈</span>
          </a>
        </div>

        {/* Technology Stack Credits */}
        <div className="text-[12px] sm:text-[13px] text-neutral-400 font-normal tracking-wide">
          Built with Kotlin, Jetpack Compose, Material 3, Room & Google ML Kit.
        </div>
      </div>

      {/* Bottom Bar: Copyright & Version */}
      <div className="w-full border-t border-black/[0.04] py-5 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[12px] text-neutral-400">
          <div>
            课程表 · 山东商务职业学院学生原生项目
          </div>
          <div>
            本地优先 · 开源安全
          </div>
        </div>
      </div>
    </footer>
  )
}
