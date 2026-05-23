import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/AppLayout";
import {
  Brain,
  Send,
  Loader2,
  User,
  Sparkles,
  
  
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const SUGGESTED_PROMPTS = [
  "Help me prioritize my tasks",
  "How should I handle a conflicting deadline?",
  "Analyze the pros and cons of remote work",
  "Create a decision framework for choosing a career path",
];

export default function AIAdvisor() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMutation = trpc.chat.send.useMutation();

  // Load initial history
  const { data: historyMessages } = trpc.chat.getHistory.useQuery(
    { limit: 50 },
    { enabled: !!user },
  );

  useEffect(() => {
    if (historyMessages) {
      setLocalMessages(
        historyMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      );
    }
  }, [historyMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const handleSend = async () => {
    if (!message.trim() || chatMutation.isPending) return;

    const userMsg = message.trim();
    setMessage("");
    setLocalMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    try {
      const result = await chatMutation.mutateAsync({ message: userMsg });
      setLocalMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.response },
      ]);
    } catch {
      toast.error("Failed to get AI response. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-56px)]">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 lg:p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {localMessages.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00e5c0]/20 to-[#a855f7]/20 flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-[#00e5c0]" />
                </div>
                <h2 className="text-xl font-bold mb-2">AI Decision Advisor</h2>
                <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto">
                  Ask me anything about your decisions. I can help you analyze options,
                  weigh trade-offs, and develop strategies.
                </p>

                {/* Suggested Prompts */}
                <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        setMessage(prompt);
                      }}
                      className="p-3 text-left text-sm text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-[#00e5c0]/30 transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {localMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-[#00e5c0]/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="w-4 h-4 text-[#00e5c0]" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#00e5c0]/10 border border-[#00e5c0]/20 text-white"
                          : "glass-card"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-invert prose-sm max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00e5c0] to-[#a855f7] flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {chatMutation.isPending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00e5c0]/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-[#00e5c0]" />
                </div>
                <div className="glass-card px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#00e5c0]" />
                    <span className="text-sm text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-white/10 bg-[#02040a]/80 backdrop-blur-md p-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask the AI Advisor..."
                rows={1}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e5c0]/50 resize-none max-h-32"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!message.trim() || chatMutation.isPending}
              className="p-3 bg-gradient-to-r from-[#00e5c0] to-[#33ebcd] text-[#02040a] rounded-xl hover:shadow-[0_0_20px_rgba(0,229,192,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {chatMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-600 mt-2">
            AI responses are generated to assist your decision-making process
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

function formatMarkdown(text: string): string {
  return text
    .replace(/^### (.*$)/gim, "<h3 class=\"text-lg font-semibold mt-4 mb-2\">$1</h3>")
    .replace(/^## (.*$)/gim, "<h2 class=\"text-xl font-semibold mt-5 mb-3\">$1</h2>")
    .replace(/^# (.*$)/gim, "<h1 class=\"text-2xl font-bold mt-6 mb-4\">$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong class=\"text-white\">$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^- (.*$)/gim, "<li class=\"ml-4 mb-1\">$1</li>")
    .replace(/\n/g, "<br />");
}
