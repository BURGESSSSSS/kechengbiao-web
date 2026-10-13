import React, { useEffect } from 'react'
import { ChevronRight, CloudDownload, ShieldCheck, X } from 'lucide-react'
import { useDownloadModal } from '../../context/DownloadContext'
import { DOWNLOAD_CONFIG } from '../../config/download'

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

export const DownloadModal: React.FC = () => {
  const { isDownloadOpen, closeDownloadModal } = useDownloadModal()

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDownloadModal()
      }
    }

    if (isDownloadOpen) {
      window.addEventListener('keydown', handleKeyDown)
      // Prevent background scrolling
      document.body.style.overflow = 'hidden'
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isDownloadOpen, closeDownloadModal])

  if (!isDownloadOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Blurred Backdrop */}
      <div
        onClick={closeDownloadModal}
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-[420px] bg-[#FBFBFD] rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 border border-black/[0.08] shadow-[0_24px_48px_-12px_rgba(15,23,42,0.22)] select-none animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeDownloadModal}
          aria-label="关闭弹窗"
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-[16px] bg-white ring-1 ring-black/[0.08] shadow-xs p-1 flex items-center justify-center shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}assets/app-icon-circle.png`}
              alt="课程表 App 图标"
              className="w-full h-full object-cover rounded-[13px]"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 id="download-modal-title" className="text-[17px] sm:text-[19px] font-bold text-neutral-950 tracking-tight leading-tight">
                下载课程表 Android
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-neutral-200/70 text-neutral-800 text-[11px] font-mono font-semibold">
                v{DOWNLOAD_CONFIG.latestVersion}
              </span>
            </div>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 font-normal mt-0.5">
              选择适合你的下载方式 · 官方正版保证
            </p>
          </div>
        </div>

        {/* Download Option 1: GitHub Releases */}
        <div className="space-y-3 mb-5">
          <a
            href={DOWNLOAD_CONFIG.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeDownloadModal}
            className="group w-full p-4 rounded-[20px] bg-white border border-neutral-200/80 hover:border-neutral-950/40 hover:shadow-sm transition-all duration-200 flex items-center justify-between text-left cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-neutral-950 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                <GithubIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[14.5px] sm:text-[15.5px] text-neutral-900 group-hover:text-neutral-950">
                    GitHub 下载
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10.5px] font-medium font-mono">
                    Releases
                  </span>
                </div>
                <div className="text-[11.5px] sm:text-[12.5px] text-neutral-500 font-normal mt-0.5">
                  官方开源仓库发布 · 需顺畅网络访问
                </div>
              </div>
            </div>
            <div className="flex items-center text-neutral-400 group-hover:text-neutral-900 transition-colors pl-2">
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 duration-200" />
            </div>
          </a>

          {/* Download Option 2: Domestic Cloud Pan */}
          <a
            href={DOWNLOAD_CONFIG.panUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeDownloadModal}
            className="group w-full p-4 rounded-[20px] bg-white border border-neutral-200/80 hover:border-neutral-950/40 hover:shadow-sm transition-all duration-200 flex items-center justify-between text-left cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                <CloudDownload className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[14.5px] sm:text-[15.5px] text-neutral-900 group-hover:text-neutral-950">
                    123云盘下载
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10.5px] font-medium border border-emerald-100">
                    高速免登
                  </span>
                </div>
                <div className="text-[11.5px] sm:text-[12.5px] text-neutral-500 font-normal mt-0.5">
                  国内不限速下载通道 · 免登录即开即下
                </div>
              </div>
            </div>
            <div className="flex items-center text-neutral-400 group-hover:text-neutral-900 transition-colors pl-2">
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 duration-200" />
            </div>
          </a>
        </div>

        {/* Modal Footer Notes */}
        <div className="pt-3 border-t border-black/[0.05] flex items-center justify-between text-[11.5px] text-neutral-400 font-normal">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>无广告 · 无常驻后台 · 纯本地运行</span>
          </div>
          <span>Android 7.0+</span>
        </div>
      </div>
    </div>
  )
}

export default DownloadModal
