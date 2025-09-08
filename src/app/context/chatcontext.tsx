"use client";
import { createContext, useContext, useState } from "react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

type ChatContextType = {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  clearMessages: () => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I am MYEcoLens Assistant 🌿 How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  const clearMessages = () =>
    setMessages([
      {
        id: "1",
        text: "Hello! I am MYEcoLens Assistant 🌿 How can I assist you today?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);

  return (
    <ChatContext.Provider value={{ messages, setMessages, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used inside ChatProvider");
  }
  return context;
}
