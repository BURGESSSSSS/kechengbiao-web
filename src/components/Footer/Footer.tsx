import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-12 px-6 sm:px-10 bg-white border-t border-neutral-900/[0.04]">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span>课程表 v1.3.6</span>
          <span>·</span>
          <span>专为山东商务职业学院学子打造</span>
        </div>
        <div className="flex items-center gap-4 text-neutral-500">
          <span>数据仅保存在本机</span>
          <span>·</span>
          <span>开源与离线优先</span>
        </div>
      </div>
    </footer>
  )
}
