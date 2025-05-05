"use client"

import * as React from "react"

type CodeBlockContextType = {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const CodeBlockContext = React.createContext<CodeBlockContextType | undefined>(undefined)

export function CodeBlockProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTabState] = React.useState<string>("pnpm")
  const [mounted, setMounted] = React.useState(false)

  // Handle localStorage after component mounts to avoid SSR issues
  React.useEffect(() => {
    setMounted(true)
    try {
      const savedTab = localStorage.getItem("code-block-active-tab")
      if (savedTab) {
        setActiveTabState(savedTab)
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error)
    }
  }, [])

  // Save to localStorage when activeTab changes
  const setActiveTab = React.useCallback((tab: string) => {
    setActiveTabState(tab)
    if (mounted) {
      try {
        localStorage.setItem("code-block-active-tab", tab)
      } catch (error) {
        console.error("Failed to write to localStorage:", error)
      }
    }
  }, [mounted])

  return (
    <CodeBlockContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </CodeBlockContext.Provider>
  )
}

export function useCodeBlockContext() {
  const context = React.useContext(CodeBlockContext)
  if (context === undefined) {
    throw new Error("useCodeBlockContext must be used within a CodeBlockProvider")
  }
  return context
} 