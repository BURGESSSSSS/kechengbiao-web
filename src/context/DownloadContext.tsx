import React, { createContext, useContext, useState, useCallback } from 'react'

interface DownloadContextType {
  isDownloadOpen: boolean
  openDownloadModal: () => void
  closeDownloadModal: () => void
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined)

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false)

  const openDownloadModal = useCallback(() => {
    setIsDownloadOpen(true)
  }, [])

  const closeDownloadModal = useCallback(() => {
    setIsDownloadOpen(false)
  }, [])

  return (
    <DownloadContext.Provider value={{ isDownloadOpen, openDownloadModal, closeDownloadModal }}>
      {children}
    </DownloadContext.Provider>
  )
}

export const useDownloadModal = (): DownloadContextType => {
  const context = useContext(DownloadContext)
  if (!context) {
    throw new Error('useDownloadModal must be used within a DownloadProvider')
  }
  return context
}
