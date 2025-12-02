"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { chat as chatApi } from "@/services/chatService";
import { listAgents } from "@/services/agentService";
import { toast } from "sonner";
import Markdown from "@/components/markdown";
import { trackEvent, reportError } from "@/services/observabilityService";
import { MessageSquare, Plus, Trash2, History, X, Copy, Check, Bot, User as UserIcon, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const MAX_INPUT = 4000;
const MAX_CONTEXT = 2000;

type Msg = { role: "user" | "assistant"; content: string; ts: number };

interface Conversation {
  id: string;
  title: string;
  messages: Msg[];
  createdAt: number;
  updatedAt: number;
}

export default function ChatPage() {
  const search = useSearchParams();
  const initialAgentId = search.get("agentId") || "";
  const lockedAgent = Boolean(initialAgentId);

  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([]);
  const [agentId, setAgentId] = useState<string>(initialAgentId);
  const [input, setInput] = useState<string>("");
  const [context, setContext] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);

  // Load conversations from localStorage
  const loadConversations = (agentId: string) => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(`conversations:${agentId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConversations(Array.isArray(parsed) ? parsed : []);
      } else {
        setConversations([]);
      }
    } catch {
      setConversations([]);
    }
  };

  // Save conversations to localStorage
  const saveConversations = (agentId: string, convs: Conversation[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`conversations:${agentId}`, JSON.stringify(convs));
    } catch (e) {
      console.error("Failed to save conversations:", e);
    }
  };

  // Create new conversation
  const createNewConversation = () => {
    if (!agentId) return;
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      title: "New Conversation",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newConv, ...conversations];
    setConversations(updated);
    saveConversations(agentId, updated);
    setCurrentConversationId(newConv.id);
    setMessages([]);
  };

  // Load conversation
  const loadConversation = (convId: string) => {
    const conv = conversations.find(c => c.id === convId);
    if (conv) {
      setMessages(conv.messages);
      setCurrentConversationId(convId);
    }
  };

  // Open delete dialog
  const openDeleteDialog = (convId: string) => {
    setConversationToDelete(convId);
    setDeleteDialogOpen(true);
  };

  // Delete conversation
  const deleteConversation = () => {
    if (!agentId || !conversationToDelete) return;
    const conv = conversations.find(c => c.id === conversationToDelete);
    const updated = conversations.filter(c => c.id !== conversationToDelete);
    setConversations(updated);
    saveConversations(agentId, updated);
    if (currentConversationId === conversationToDelete) {
      setCurrentConversationId(null);
      setMessages([]);
    }
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
    toast.success(`Conversation "${conv?.title || 'Untitled'}" deleted`);
  };

  // Update conversation title from first message
  const updateConversationTitle = (convId: string, title: string) => {
    const updated = conversations.map(c => 
      c.id === convId ? { ...c, title, updatedAt: Date.now() } : c
    );
    setConversations(updated);
    if (agentId) saveConversations(agentId, updated);
  };

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const res = await listAgents({ page: 1, pageSize: 50 });
        const data = (res as { data?: { agents?: Array<{ id: string; name: string }>; data?: { agents?: Array<{ id: string; name: string }> } } }).data;
        const agentsList = data?.agents || data?.data?.agents || [];
        setAgents(agentsList.map((a) => ({ id: a.id, name: a.name })));
        if (initialAgentId) {
          setAgentId(initialAgentId);
        } else if (!agentId) {
          const last = typeof window !== "undefined" ? localStorage.getItem("last_agent") : null;
          if (last && agentsList.some((a) => a.id === last)) {
            setAgentId(last);
          } else if (agentsList[0]) {
            setAgentId(agentsList[0].id);
          }
        }
      } catch (e) {
        const err = e as { response?: { data?: { message?: string } }; message?: string };
        toast.error(err.response?.data?.message || err.message || "Failed to load agents");
      }
    };
    // intentionally ignore deps to only run on first mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadAgents();
  }, []);

  useEffect(() => {
    // Load conversations when agent changes
    if (agentId) {
      loadConversations(agentId);
      localStorage.setItem(`last_agent`, agentId);
    }
  }, [agentId]);

  useEffect(() => {
    // Save current conversation when messages change
    if (agentId && currentConversationId && messages.length > 0) {
      const updated = conversations.map(c => {
        if (c.id === currentConversationId) {
          // Update title from first user message if it's still "New Conversation"
          let title = c.title;
          if (title === "New Conversation" || title === "") {
            const firstUserMsg = messages.find(m => m.role === "user");
            if (firstUserMsg) {
              title = firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? "..." : "");
              updateConversationTitle(currentConversationId, title);
            }
          }
          return {
            ...c,
            messages,
            updatedAt: Date.now(),
            title,
          };
        }
        return c;
      });
      setConversations(updated);
      saveConversations(agentId, updated);
    }
    // scroll to bottom on new message
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, agentId, currentConversationId]);

  useEffect(() => {
    // Reset when switching agent
    if (!agentId) return;
    setCurrentConversationId(null);
    setMessages([]);
    loadConversations(agentId);
  }, [agentId]);

  const exportMarkdown = () => {
    const lines: string[] = [];
    lines.push(`# Chat with Agent ${agents.find((a) => a.id === agentId)?.name || ""}`);
    lines.push("");
    messages.forEach((m) => {
      lines.push(`**${m.role.toUpperCase()}**:`);
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
    a.download = `chat-${agentId}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const send = async () => {
    if (!agentId) return toast.error("Please select an agent");
    const text = input.trim();
    if (!text) return;
    
    // Create new conversation if none exists
    if (!currentConversationId) {
      const newConv: Conversation = {
        id: `conv_${Date.now()}`,
        title: text.slice(0, 50) + (text.length > 50 ? "..." : ""),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const updated = [newConv, ...conversations];
      setConversations(updated);
      saveConversations(agentId, updated);
      setCurrentConversationId(newConv.id);
    }
    
    const userMsg: Msg = { role: "user", content: text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await chatApi(agentId, { message: text, context: context || undefined });
      const reply =
        (res as { data?: { response?: string; message?: string }; message?: string }).data?.response ||
        (res as { data?: { response?: string; message?: string }; message?: string }).data?.message ||
        (res as { data?: { response?: string; message?: string }; message?: string }).message ||
        "(no response)";
      
      // Create placeholder message for streaming
      const assistantMsg: Msg = { role: "assistant", content: "", ts: Date.now() };
      let messageIndex: number;
      setMessages((prev) => {
        const newMessages = [...prev, assistantMsg];
        messageIndex = newMessages.length - 1;
        setStreamingMessageId(messageIndex);
        return newMessages;
      });
      setLoading(false);
      
      // Start typing animation
      let currentIndex = 0;
      const typeNextChar = () => {
        if (currentIndex < reply.length) {
          setStreamingContent(reply.slice(0, currentIndex + 1));
          currentIndex++;
          streamingTimeoutRef.current = setTimeout(typeNextChar, 30); // 30ms per character
        } else {
          // Animation complete, update the actual message
          setMessages((prev) => {
            const updated = [...prev];
            if (messageIndex !== undefined && updated[messageIndex]) {
              updated[messageIndex] = {
                ...updated[messageIndex],
                content: reply,
              };
            }
            return updated;
          });
          setStreamingMessageId(null);
          setStreamingContent("");
        }
      };
      typeNextChar();
    void trackEvent("chat_message_sent", {
      agentId,
      hasContext: Boolean(context),
      length: text.length,
      page: "dashboard_chat",
    });
    } catch (e) {
      const err = e as { message?: string; response?: { data?: { message?: string } } };
      // Clear streaming state on error
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
      setStreamingMessageId(null);
      setStreamingContent("");
      if (err?.message === "CHAT_TIMEOUT") {
        toast.error("Phản hồi mất hơn 20 giây, vui lòng thử lại.");
      } else {
        toast.error(err.response?.data?.message || err.message || "Chat failed");
      }
    void reportError(err, {
      component: "DashboardChatPage",
      extra: { agentId },
    });
    } finally {
      // Don't set loading to false here if streaming is active
      if (!streamingMessageId) {
        setLoading(false);
      }
    }
  };

  // Cleanup streaming timeout on unmount
  useEffect(() => {
    return () => {
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex gap-4 h-[calc(100vh-200px)]">
      {/* Conversation History Sidebar */}
      <div className={cn(
        "w-64 border-r bg-gradient-to-b from-background to-muted/30 transition-all duration-300 flex flex-col",
        !sidebarOpen && "hidden lg:block"
      )}>
        <div className="p-4 border-b bg-background/50 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Conversations</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={createNewConversation}
            className="h-7 w-7 p-0 hover:bg-primary/10"
            title="New Conversation"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="text-xs text-muted-foreground p-4 text-center">
                No conversations yet. Start chatting to create one.
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "group relative p-3 rounded-lg cursor-pointer hover:bg-muted/80 transition-all border border-transparent hover:border-muted-foreground/20",
                    currentConversationId === conv.id && "bg-primary/5 border-primary/20 shadow-sm"
                  )}
                  onClick={() => loadConversation(conv.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-sm font-medium truncate mb-1",
                        currentConversationId === conv.id && "text-primary"
                      )}>
                        {conv.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{conv.messages.length} messages</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(conv.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b">
          <div className="flex items-center gap-3 flex-1">
            <Label className="text-sm font-medium">Agent</Label>
            {!lockedAgent ? (
              <Select value={agentId} onValueChange={(v) => setAgentId(v)}>
                <SelectTrigger className="w-[260px] border-2">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted">
                <Bot className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {agents.find((a) => a.id === agentId)?.name || agentId}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <History className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={createNewConversation}>
              <Plus className="h-4 w-4 mr-2" />
              New chat
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => { setMessages([]); setCurrentConversationId(null); }}
              disabled={messages.length === 0}
            >
              Clear
            </Button>
            <Button 
              size="sm"
              onClick={exportMarkdown} 
              disabled={messages.length === 0}
              variant="secondary"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Export .md
            </Button>
          </div>
        </div>

        <div ref={listRef} className="h-[520px] overflow-y-auto rounded-2xl border bg-gradient-to-b from-background to-muted/20 p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Start a conversation</h3>
                <p className="text-sm text-muted-foreground">Send a message to begin chatting with your AI agent</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m, i) => {
                const isUser = m.role === "user";
                const isCopied = copiedMessageId === i;
                return (
                  <div
                    key={i}
                    className={cn(
                      "group flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                      isUser ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {/* Avatar */}
                    <Avatar className={cn(
                      "h-9 w-9 shrink-0 border-2",
                      isUser 
                        ? "bg-primary text-primary-foreground border-primary/20" 
                        : "bg-muted border-muted-foreground/20"
                    )}>
                      <AvatarFallback className={cn(
                        "text-xs font-semibold",
                        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>

                    {/* Message Content */}
                    <div className={cn(
                      "flex flex-col gap-2 max-w-[75%]",
                      isUser ? "items-end" : "items-start"
                    )}>
                      {/* Message Bubble */}
                      <div className={cn(
                        "rounded-2xl px-4 py-3 shadow-sm transition-all hover:shadow-md",
                        isUser
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-background border rounded-bl-sm"
                      )}>
                        {m.role === "assistant" ? (
                          streamingMessageId === i ? (
                            // Đang streaming: hiển thị plain text để tránh parse Markdown liên tục
                            <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                              {streamingContent}
                            </div>
                          ) : (
                            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
                              <Markdown>{m.content}</Markdown>
                            </div>
                          )
                        ) : (
                          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.content}</div>
                        )}
                      </div>

                      {/* Timestamp and Actions */}
                      <div className={cn(
                        "flex items-center gap-2 text-xs text-muted-foreground",
                        isUser ? "flex-row-reverse" : "flex-row"
                      )}>
                        <span className="opacity-70">{new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all hover:bg-muted"
                          onClick={() => {
                            navigator.clipboard.writeText(m.content);
                            setCopiedMessageId(i);
                            toast.success("Copied to clipboard");
                            setTimeout(() => setCopiedMessageId(null), 2000);
                          }}
                        >
                          {isCopied ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing Indicator */}
              {loading && streamingMessageId === null && (
                <div className="flex gap-4 animate-in fade-in">
                  <Avatar className="h-9 w-9 shrink-0 border-2 bg-muted border-muted-foreground/20">
                    <AvatarFallback className="bg-muted">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2 bg-background border rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">Assistant is typing...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Textarea
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT))}
              placeholder="Type your message... (Press Enter to send, Ctrl+Enter for new line)"
              className="pr-12 resize-none border-2 focus:border-primary/50 transition-colors"
              onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  // Ctrl+Enter: chủ động chèn xuống dòng
                  e.preventDefault();
                  const target = e.currentTarget;
                  const { selectionStart, selectionEnd, value } = target;
                  const nextValue =
                    value.slice(0, selectionStart ?? value.length) +
                    "\n" +
                    value.slice(selectionEnd ?? value.length);
                  setInput(nextValue.slice(0, MAX_INPUT));
                  // Đưa caret xuống dòng mới
                  requestAnimationFrame(() => {
                    const pos = (selectionStart ?? 0) + 1;
                    target.selectionStart = target.selectionEnd = pos;
                  });
                  return;
                }

                if (e.key === "Enter" && !e.shiftKey) {
                  // Enter: gửi tin nhắn
                  e.preventDefault();
                  if (!loading && agentId && input.trim()) {
                    void send();
                  }
                }
              }}
            />
            <Button
              onClick={send}
              disabled={loading || !agentId || !input.trim()}
              size="sm"
              className="absolute bottom-2 right-2 h-8 w-8 p-0 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className={cn(
              "transition-colors",
              input.length > MAX_INPUT * 0.9 && "text-orange-600",
              input.length >= MAX_INPUT && "text-red-600"
            )}>
              {input.length} / {MAX_INPUT}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-normal">
                Enter to send
              </Badge>
              <Badge variant="outline" className="text-xs font-normal">
                Ctrl+Enter for new line
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Context Sidebar */}
      <div className="w-64 border-l bg-muted/30 p-4 space-y-3 hidden lg:block">
        <div className="text-sm font-semibold">Advanced</div>
        <div className="space-y-2">
          <Label htmlFor="ctx">Context (optional)</Label>
          <Textarea id="ctx" rows={8} value={context} onChange={(e) => setContext(e.target.value.slice(0, MAX_CONTEXT))} placeholder="Provide extra context for the model..." />
          <div className="text-xs text-muted-foreground">{context.length} / {MAX_CONTEXT}</div>
        </div>
      </div>

      {/* Delete Conversation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle>Delete Conversation</DialogTitle>
                <DialogDescription className="mt-1">
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                &quot;{conversations.find(c => c.id === conversationToDelete)?.title || "this conversation"}&quot;
              </span>?
              <br />
              <span className="text-xs mt-2 block">
                All messages in this conversation will be permanently removed.
              </span>
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setConversationToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteConversation}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
