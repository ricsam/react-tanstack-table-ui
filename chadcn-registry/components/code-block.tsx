"use client"

import * as React from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useCodeBlockContext } from "./code-block-context"

interface CodeBlockProps {
  commands: Record<string, string>
  className?: string
}

export function CodeBlock({ commands, className }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)
  const { activeTab, setActiveTab } = useCodeBlockContext()
  
  // If the active tab isn't in the available commands, default to the first one
  const availableTabs = Object.keys(commands)
  const effectiveActiveTab = availableTabs.includes(activeTab) ? activeTab : availableTabs[0]
  
  const copyToClipboard = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(commands[effectiveActiveTab])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }, [commands, effectiveActiveTab])

  return (
    <div className={cn("relative", className)}>
      <div data-rehype-pretty-code-fragment="">
        <div className="relative mt-6 max-h-[650px] overflow-x-auto rounded-xl bg-zinc-950 dark:bg-zinc-900">
          <Tabs value={effectiveActiveTab} onValueChange={setActiveTab}>
            <div dir="ltr" data-orientation="horizontal">
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 pt-2.5">
                <TabsList className="inline-flex items-center justify-center rounded-lg text-muted-foreground h-7 translate-y-[2px] gap-3 bg-transparent p-0 pl-1">
                  {availableTabs.map((manager) => (
                    <TabsTrigger 
                      key={manager}
                      value={manager}
                      className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-none border-b border-transparent bg-transparent p-0 pb-1.5 font-mono text-zinc-400 data-[state=active]:border-b-zinc-50 data-[state=active]:bg-transparent data-[state=active]:text-zinc-50"
                    >
                      {manager}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <div className="overflow-x-auto">
                {Object.entries(commands).map(([manager, command]) => (
                  <TabsContent key={manager} value={manager} className="mt-0">
                    <pre className="px-4 py-5">
                      <code className="relative font-mono text-sm leading-none text-white">
                        {command}
                      </code>
                    </pre>
                  </TabsContent>
                ))}
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2.5 top-2 z-10 h-6 w-6 text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50 cursor-pointer"
              onClick={copyToClipboard}
            >
              <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 