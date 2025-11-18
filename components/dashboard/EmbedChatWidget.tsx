"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { chatWithAgent } from "@/services/agentService";
import Markdown from "@/components/markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, X, Copy, Download } from "lucide-react";

const MAX_INPUT = 4000;

type Message = { role: "user" | "assistant"; content: string; ts: number };

interface EmbedChatWidgetProps {
  agentId: string;
  agentName?: string;
  className?: string;
  onClose?: () => void;
}

export default function EmbedChatWidget({
  agentId,
  agentName = "AI Assistant",
  className = "",
  onClose,
}: EmbedChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    if (agentId) {
      const stored = localStorage.getItem(`chat:${agentId}`);
      if (stored) {
        try {
          setMessages(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to load chat history", e);
        }
      }
    }
  }, [agentId]);

  // Save chat history to localStorage
  useEffect(() => {
    if (agentId && messages.length > 0) {
      localStorage.setItem(`chat:${agentId}`, JSON.stringify(messages));
    }
  }, [messages, agentId]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (text.length > MAX_INPUT) {
      toast.error(`Message too long. Maximum ${MAX_INPUT} characters.`);
      return;
    }

    // Add user message
    const userMessage: Message = { role: "user", content: text, ts: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await chatWithAgent(agentId, { message: text });
      const reply = res.data?.response || res.data?.message || "(no response)";
      const assistantMessage: Message = { role: "assistant", content: reply, ts: Date.now() };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e: any) {
      const errorMsg = e?.response?.data?.message || e?.message || "Chat failed";
      toast.error(errorMsg);
      // Add error message to chat
      const errorMessage: Message = {
        role: "assistant",
        content: `❌ Error: ${errorMsg}`,
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(`chat:${agentId}`);
    toast.success("Chat cleared");
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const exportChat = () => {
    const lines: string[] = [];
    lines.push(`# Chat with ${agentName}`);
    lines.push("");
    lines.push(`**Date:** ${new Date().toLocaleString()}`);
    lines.push("");
    messages.forEach((m) => {
      lines.push(`## ${m.role === "user" ? "User" : "Assistant"}`);
      lines.push("");
      lines.push(m.content);
      lines.push("");
      lines.push("---");
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${agentName}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat exported");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-full bg-background border rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="font-semibold text-sm">{agentName}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={exportChat}
            disabled={messages.length === 0}
            title="Export chat"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            disabled={messages.length === 0}
            title="Clear chat"
          >
            Clear
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} title="Close">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              <div className="text-center space-y-2">
                <p className="font-medium">Start a conversation</p>
                <p className="text-xs">Type a message below to begin chatting with {agentName}</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 items-start group ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-semibold text-primary">AI</span>
                  </div>
                )}
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted border"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity self-start"
                    onClick={() => copyMessage(msg.content)}
                    title="Copy message"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-semibold">You</span>
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Assistant is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT))}
            onKeyDown={handleKeyPress}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            rows={2}
            className="resize-none"
            disabled={loading}
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim() || input.length > MAX_INPUT}
            size="icon"
            className="flex-shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>
            {input.length} / {MAX_INPUT} characters
          </span>
          <span className="text-xs">Press Enter to send</span>
        </div>
      </div>
    </div>
  );
}

