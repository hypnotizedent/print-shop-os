/**
 * AI Assistant Chat Interface
 * Powered by Ollama (llama3.2) via dashboard-api
 *
 * Features:
 * - Session-based chat with context
 * - Knowledge base integration (pricing, turnaround, products)
 * - Order/customer context awareness
 * - Feedback collection (thumbs up/down)
 */

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  PaperPlaneTilt,
  Brain,
  User,
  ArrowsClockwise,
  ThumbsUp,
  ThumbsDown,
  Warning,
  Info,
  Lightning,
  Robot,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface ChatMessage {
  id: string
  messageId?: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  sentiment?: "positive" | "neutral" | "negative" | "very_negative"
  category?: string
  sources?: Array<{ title: string; type: string }>
  isFallback?: boolean
  feedback?: "positive" | "negative" | null
  responseTimeMs?: number
}

interface AIAssistantProps {
  className?: string
  embedded?: boolean
  context?: {
    order?: {
      visual_id: string | number
      status: string
      customer_name?: string
      due_date?: string
      total?: number
    }
    customer?: {
      first_name: string
      last_name: string
      company?: string
      order_count?: number
    }
  }
  userType?: "admin" | "customer" | "employee" | "guest"
  userId?: number
}

const API_BASE = import.meta.env.VITE_DASHBOARD_API_URL || "https://mintprints-api.ronny.works"

export function AIAssistant({
  className,
  embedded = false,
  context,
  userType = "admin",
  userId,
}: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your Mint Prints AI assistant. I can help you with:\n\n* **Pricing questions** - Get instant estimates\n* **Turnaround times** - Know when orders will be ready\n* **Design requirements** - File formats, colors, and resolution\n* **Product recommendations** - Find the right blank for your project\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/ai/health`)
        const data = await response.json()
        setIsOnline(data.ollama?.connected ?? false)
      } catch {
        setIsOnline(false)
      }
    }
    checkHealth()
  }, [])

  const ensureSession = async (): Promise<string> => {
    if (sessionId) return sessionId

    try {
      const response = await fetch(`${API_BASE}/api/ai/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_type: userType,
          user_id: userId,
          context_type: context?.order ? "order" : context?.customer ? "customer" : null,
          context_id: context?.order
            ? Number(context.order.visual_id)
            : context?.customer
            ? userId
            : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create session")
      }

      const data = await response.json()
      setSessionId(data.session_id)
      return data.session_id
    } catch (err) {
      console.error("Session creation error:", err)
      const fallbackId = `local-${Date.now()}`
      setSessionId(fallbackId)
      return fallbackId
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      const sid = await ensureSession()

      if (sid.startsWith("local-")) {
        const response = await fetch(`${API_BASE}/api/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage.content,
            context: context,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to get response")
        }

        const data = await response.json()

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.response_text,
          timestamp: new Date(),
          isFallback: data.is_fallback,
          category: data.category,
          responseTimeMs: data.response_time_ms,
        }

        setMessages((prev) => [...prev, assistantMessage])
        return
      }

      const response = await fetch(`${API_BASE}/api/ai/sessions/${sid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        messageId: data.message_id,
        role: "assistant",
        content: data.response_text,
        timestamp: new Date(),
        isFallback: data.is_fallback,
        responseTimeMs: data.response_time_ms,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error("Chat error:", err)
      setError("Unable to connect to AI service. Please try again.")
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const submitFeedback = async (messageId: string, feedback: "positive" | "negative") => {
    if (!sessionId || sessionId.startsWith("local-")) return

    try {
      await fetch(`${API_BASE}/api/ai/sessions/${sessionId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_id: messageId, feedback }),
      })

      setMessages((prev) =>
        prev.map((m) =>
          m.messageId === messageId ? { ...m, feedback } : m
        )
      )
    } catch (err) {
      console.error("Feedback error:", err)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([messages[0]])
    setSessionId(null)
    setError(null)
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/10 text-green-600"
      case "negative":
        return "bg-orange-500/10 text-orange-600"
      case "very_negative":
        return "bg-red-500/10 text-red-600"
      default:
        return "bg-blue-500/10 text-blue-600"
    }
  }

  const formatMessageContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      const parts = line.split(/\*\*(.+?)\*\*/)
      const formattedParts = parts.map((part, j) => {
        if (j % 2 === 1) {
          return <strong key={j}>{part}</strong>
        }
        return part
      })

      if (line.startsWith("* ")) {
        return (
          <div key={i} className="flex gap-2 ml-2">
            <span>*</span>
            <span>{formattedParts.slice(0).map((p) =>
              typeof p === 'string' ? p.replace(/^\* /, '') : p
            )}</span>
          </div>
        )
      }

      if (!line.trim()) {
        return <div key={i}>&nbsp;</div>
      }

      return <div key={i}>{formattedParts}</div>
    })
  }

  const containerClass = embedded
    ? "w-full h-full"
    : "max-w-2xl mx-auto"

  return (
    <Card className={cn(containerClass, className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Brain className="text-white" size={22} weight="fill" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Assistant</CardTitle>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {isOnline ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Powered by Ollama</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span>Offline mode</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={clearChat} title="Clear chat">
            <ArrowsClockwise size={18} />
          </Button>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-0 flex flex-col" style={{ height: embedded ? "calc(100% - 80px)" : "500px" }}>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Brain className="text-white" size={16} weight="fill" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="text-sm leading-relaxed">
                    {formatMessageContent(message.content)}
                  </div>

                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Info size={12} />
                        Sources:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {message.sources.map((source, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {source.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {message.category && message.role === "assistant" && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge className={cn("text-xs", getSentimentColor(message.sentiment))}>
                        {message.category}
                      </Badge>
                    </div>
                  )}

                  {message.role === "assistant" && message.id !== "welcome" && message.messageId && (
                    <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                      <button
                        className={cn(
                          "hover:text-green-600 transition-colors",
                          message.feedback === "positive" && "text-green-600"
                        )}
                        title="Helpful"
                        onClick={() => message.messageId && submitFeedback(message.messageId, "positive")}
                        disabled={!!message.feedback}
                      >
                        <ThumbsUp size={14} weight={message.feedback === "positive" ? "fill" : "regular"} />
                      </button>
                      <button
                        className={cn(
                          "hover:text-red-600 transition-colors",
                          message.feedback === "negative" && "text-red-600"
                        )}
                        title="Not helpful"
                        onClick={() => message.messageId && submitFeedback(message.messageId, "negative")}
                        disabled={!!message.feedback}
                      >
                        <ThumbsDown size={14} weight={message.feedback === "negative" ? "fill" : "regular"} />
                      </button>
                      {message.responseTimeMs && (
                        <span className="text-xs opacity-50">{(message.responseTimeMs / 1000).toFixed(1)}s</span>
                      )}
                    </div>
                  )}
                  {message.isFallback && message.role === "assistant" && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        <Robot size={10} className="mr-1" />
                        Offline response
                      </Badge>
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="text-primary" size={16} weight="fill" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Brain className="text-white animate-pulse" size={16} weight="fill" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lightning className="animate-pulse" size={14} />
                    Thinking...
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/20 rounded-lg px-4 py-2">
                <Warning size={16} />
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about pricing, turnaround, designs..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <PaperPlaneTilt size={18} weight="fill" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI responses may not be 100% accurate. Verify important details with our team.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
