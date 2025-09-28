"use client";

import { useState, useRef, useEffect } from "react";
import "remixicon/fonts/remixicon.css";
import { useChat, Message } from "../context/chatcontext";
import Link from "next/link";

// Component to render bot messages and optional suggestions
function BotMessage({
  text,
  suggestions,
  onSuggestionClick,
  isTyping,
}: {
  text: string;
  suggestions?: string[];
  onSuggestionClick: (q: string) => void;
  isTyping: boolean;
}) {
  const parts = String(text).split(/(\[.*?\]\(.*?\))/g);

  return (
    <div>
      <p className="text-sm leading-relaxed whitespace-pre-line">
        {parts.map((part, i) => {
          const match = part.match(/\[(.*?)\]\((.*?)\)/);
          if (match) {
            const [, label, url] = match;
            return (
              <Link
                key={i}
                href={url}
                className="chatbot-link text-blue-600 underline cursor-pointer"
              >
                {label}
              </Link>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>

      {(suggestions ?? []).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {(suggestions ?? []).map((q, i) => (
            <button
              key={i}
              onClick={() => !isTyping && onSuggestionClick(String(q))}
              disabled={isTyping}
              className={`bg-green-100 hover:bg-green-200 text-green-700 text-xs px-3 py-1 rounded-full transition ${
                isTyping ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Main Chatbot Component
export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, setMessages } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // 🔥 监听首页按钮触发的事件 → 打开 Chatbot
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("openChatbot", handleOpen);
    return () => window.removeEventListener("openChatbot", handleOpen);
  }, []);

  // Reset chat
  const handleReset = () => {
    setMessages([
      {
        id: "1",
        text: "Hello! I am Campeco Assistant 🌿 How can I assist you today?",
        sender: "bot",
        timestamp: new Date(),
        suggestions: [
          "Camping sites in Selangor",
          "Eco-friendly tips",
          "Insights on Malaysia's forests",
        ],
      },
    ]);
    setInputValue("");
    setIsTyping(false);
  };

  // Send message
  const handleSend = async (text?: string) => {
    if (isTyping) return;

    const messageText = String(text || inputValue.trim());
    if (!messageText) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const safeHistory = [...messages, newMessage].slice(-10).map((m) => ({
        text: typeof m.text === "string" ? m.text : "",
        sender: m.sender === "bot" ? "bot" : "user",
        timestamp:
          m.timestamp instanceof Date
            ? m.timestamp.toISOString()
            : String(m.timestamp ?? ""),
      }));

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, history: safeHistory }),
      });

      const data = await res.json();

      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        text:
          typeof data.answer === "string"
            ? data.answer
            : "I am sorry, I didn't quite understand that 😕 Could you please clarify?",
        sender: "bot",
        timestamp: new Date(),
        suggestions: Array.isArray(data.suggestions)
          ? data.suggestions.map(String)
          : [],
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          text: "⚠️ Something went wrong. Please try again.",
          sender: "bot",
          timestamp: new Date(),
          suggestions: [],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full shadow-lg hover:shadow-2xl transition-all transform hover:scale-110 flex items-center justify-center cursor-pointer group"
            title="Campeco Chat Assistant"
          >
            <i className="ri-chat-3-line text-2xl group-hover:animate-pulse"></i>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed right-3 top-30 bottom-3 w-100 z-50 flex">
          <div className="bg-white shadow-2xl w-full flex flex-col animate-in slide-in-from-right duration-300 rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-green-600 text-white rounded-tl-3xl">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="ri-robot-2-line text-lg"></i>
                </div>
                <h3 className="font-bold text-lg">Campeco Assistant</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full cursor-pointer"
                  title="Reset conversation"
                >
                  <i className="ri-refresh-line text-lg"></i>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full cursor-pointer"
                  title="Close conversation"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto pt-4 px-6 pb-6 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="max-w-[90%] flex items-end space-x-2">
                    {message.sender === "bot" && (
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white flex-shrink-0 -ml-2">
                        <i className="ri-robot-2-line text-sm"></i>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        message.sender === "user"
                          ? "bg-green-600 text-white"
                          : "bg-white text-gray-800"
                      }`}
                    >
                      {message.sender === "bot" ? (
                        <BotMessage
                          text={String(message.text)}
                          suggestions={(message.suggestions ?? []).map(String)}
                          onSuggestionClick={handleSend}
                          isTyping={isTyping}
                        />
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-line">
                          {String(message.text)}
                        </p>
                      )}
                      <p
                        className={`text-xs mt-2 ${
                          message.sender === "user"
                            ? "text-white/90"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString(
                          "en-US",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[90%] flex items-end space-x-2">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white -ml-2">
                      <i className="ri-robot-2-line text-sm"></i>
                    </div>
                    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white rounded-bl-3xl">
              <div className="flex items-center space-x-3">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-600 resize-none text-sm border border-gray-300 h-12"
                  rows={1}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isTyping}
                  className={`w-12 h-12 ${
                    isTyping ? "bg-gray-300" : "bg-green-600 hover:bg-green-700"
                  } text-white rounded-xl flex items-center justify-center cursor-pointer`}
                >
                  <i className="ri-send-plane-line text-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
