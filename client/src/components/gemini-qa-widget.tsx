import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { useDemoTour } from "./demo-tour-provider";
import { 
  Send, 
  Sparkles, 
  Loader2,
  HelpCircle,
  ChevronUp,
  X
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface QAResponse {
  answer: string;
  context?: string;
}

const QUICK_QUESTIONS = [
  "How do decisions affect my scores?",
  "What is the Phone-a-Friend feature?",
  "How does the AI grade my rationale?",
  "What happens when the week advances?",
];

export function GeminiQASidebar() {
  const { isDemoUser } = useDemoTour();
  const [isExpanded, setIsExpanded] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your simulation guide. Ask me anything about how Future Work Academy works, the scoring system, or how to navigate the platform.",
      timestamp: new Date(),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const askMutation = useMutation({
    mutationFn: async (q: string): Promise<QAResponse> => {
      const response = await apiRequest("POST", "/api/demo/ask-gemini", { question: q });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          timestamp: new Date(),
        },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSend = () => {
    if (!question.trim() || askMutation.isPending) return;
    
    const userMessage: Message = {
      role: "user",
      content: question.trim(),
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    askMutation.mutate(question.trim());
    setQuestion("");
  };

  const handleQuickQuestion = (q: string) => {
    setQuestion(q);
    const userMessage: Message = {
      role: "user",
      content: q,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    askMutation.mutate(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });
  const isPreviewUser = currentUser?.inStudentPreview === true || currentUser?.previewRole === "student";

  if (!isDemoUser && !isPreviewUser) return null;

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full bg-primary/10 border-primary/20 text-primary"
        onClick={() => setIsExpanded(true)}
        data-testid="button-open-gemini-qa"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Ask AI Guide
      </Button>
    );
  }

  return (
    <div className="flex flex-col border border-sidebar-border rounded-md bg-sidebar-accent/30 overflow-hidden" data-testid="card-gemini-qa">
      <div className="flex items-center justify-between px-3 py-2 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-sidebar-foreground">AI Guide</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => setIsExpanded(false)}
            data-testid="button-close-qa"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[200px] p-2" ref={scrollRef}>
        <div className="space-y-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-md px-2 py-1.5 text-xs ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
                data-testid={`message-${msg.role}-${idx}`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {askMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-md px-2 py-1.5 text-xs flex items-center gap-1 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {messages.length === 1 && (
        <div className="px-2 pb-1">
          <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
            <HelpCircle className="h-2.5 w-2.5" />
            Try asking:
          </p>
          <div className="flex flex-wrap gap-1">
            {QUICK_QUESTIONS.map((q, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="outline"
                className="text-[10px] h-auto py-0.5 px-1.5"
                onClick={() => handleQuickQuestion(q)}
                disabled={askMutation.isPending}
                data-testid={`button-quick-question-${idx}`}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="p-2 border-t border-sidebar-border">
        <div className="flex gap-1.5">
          <Textarea
            ref={inputRef}
            placeholder="Ask about the simulation..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[32px] max-h-[60px] resize-none text-xs"
            disabled={askMutation.isPending}
            data-testid="input-gemini-question"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!question.trim() || askMutation.isPending}
            data-testid="button-send-question"
          >
            {askMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Send className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
