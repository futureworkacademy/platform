import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useDemoTour } from "./demo-tour-provider";
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  Loader2,
  HelpCircle,
  ChevronDown
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

export function GeminiQAWidget() {
  const { isDemoUser } = useDemoTour();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

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

  if (!isDemoUser) return null;

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
          data-testid="button-open-gemini-qa"
        >
          <Sparkles className="h-5 w-5" />
        </Button>
        <Badge 
          className="absolute -top-1 -right-1 text-[10px]"
          data-testid="badge-ask-ai"
        >
          Ask AI
        </Badge>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-[380px] shadow-2xl border-primary/20" data-testid="card-gemini-qa">
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Demo Guide</CardTitle>
                <p className="text-xs text-muted-foreground">Powered by Gemini</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsMinimized(!isMinimized)}
                data-testid="button-minimize-qa"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${isMinimized ? "rotate-180" : ""}`} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                data-testid="button-close-qa"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0">
            <ScrollArea className="h-[300px] p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                      data-testid={`message-${msg.role}-${idx}`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {askMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" />
                  Quick questions:
                </p>
                <div className="flex flex-wrap gap-1">
                  {QUICK_QUESTIONS.map((q, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
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

            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Textarea
                  ref={inputRef}
                  placeholder="Ask about the simulation..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[40px] max-h-[100px] resize-none text-sm"
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
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
