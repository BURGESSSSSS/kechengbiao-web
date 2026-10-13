import React from 'react'
import { Header } from './components/Header/Header'
import { Hero } from './components/Hero/Hero'
import { PerformanceSection } from './components/Performance/PerformanceSection'
import { TodayScrollDemo } from './components/TodayDemo/TodayScrollDemo'
import { WeekScrollDemo } from './components/WeekDemo/WeekScrollDemo'
import { ReminderScrollDemo } from './components/ReminderDemo/ReminderScrollDemo'
import { SchoolImportDemo } from './components/SchoolImportDemo/SchoolImportDemo'
import { Footer } from './components/Footer/Footer'
import { DownloadModal } from './components/DownloadModal/DownloadModal'
import { DownloadProvider } from './context/DownloadContext'
import { useSmoothScroll } from './hooks/useSmoothScroll'

export const App: React.FC = () => {
  // Initialize Lenis momentum smooth scroll
  useSmoothScroll()

  return (
    <DownloadProvider>
      <div className="min-h-screen flex flex-col bg-[#FBFBFD] text-neutral-900 selection:bg-neutral-900 selection:text-white">
        <Header />
        <main className="flex-1">
          <Hero />
          <PerformanceSection />
          <TodayScrollDemo />
          <WeekScrollDemo />
          <ReminderScrollDemo />
          <SchoolImportDemo />
        </main>
        <Footer />
        <DownloadModal />
      </div>
    </DownloadProvider>
  )
}

export default App
