"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: "assistant", content: "Hi! I am Saral's AI assistant. Ask me about any government schemes or documents." }
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user" as const, content: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I am having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#2b5a3f] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#224732] hover:scale-105 transition-all z-50"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] h-[500px] max-h-[80vh] bg-white rounded-[20px] shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-5">
          <div className="bg-[#2b5a3f] text-white p-4 flex justify-between items-center">
            <div className="font-semibold flex items-center gap-2">
              <MessageSquare size={18} />
              Ask AI
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-[#f7f9f8] space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-[16px] px-4 py-2.5 text-[14px] leading-relaxed ${
                  msg.role === "user" ? "bg-[#2b5a3f] text-white rounded-tr-sm" : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 text-gray-800 rounded-[16px] rounded-tl-sm px-4 py-3 shadow-sm">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          <div className="p-3 bg-white border-t border-gray-100">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 bg-[#f7f9f8] rounded-full px-4 py-2.5 text-[14px] outline-none border border-transparent focus:border-[#2b5a3f]/30"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 shrink-0 bg-[#2b5a3f] text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-[#224732]"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
