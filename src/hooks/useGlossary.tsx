import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type GlossaryContextValue = {
  isOpen: boolean
  activeId: string | null
  open: (id?: string) => void
  close: () => void
}

const GlossaryContext = createContext<GlossaryContextValue | null>(null)

export function GlossaryProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const open = useCallback((id?: string) => {
    setActiveId(id ?? null)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <GlossaryContext.Provider value={{ isOpen, activeId, open, close }}>
      {children}
    </GlossaryContext.Provider>
  )
}

export function useGlossary() {
  const ctx = useContext(GlossaryContext)
  if (!ctx) throw new Error('useGlossary must be used inside GlossaryProvider')
  return ctx
}
