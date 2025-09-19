"use client";

import { createContext, useContext, useState } from "react";

// Chat Message Interface
export interface Message {
  id: string; 
  text: string; 
  sender: "user" | "bot"; 
  timestamp: Date;  
  suggestions?: string[];   // Optional suggestions from bot
}

// Context Type
type ChatContextType = {
  messages: Message[];  // All chat messages
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>; // Function to update messages
  clearMessages: () => void; // Function to reset chat to initial greeting
};

// Create Context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Chat Provider Component
export function ChatProvider({ children }: { children: React.ReactNode }) {
  // Initial greeting message from bot
  const defaultGreeting: Message = {
    id: "1",
    text: "Hello! I am Campeco Assistant 🌿 How can I assist you today?",
    sender: "bot",
    timestamp: new Date(),
    suggestions: [
      "Camping sites in Selangor",
      "Eco-friendly tips",
      "Insights on Malaysia's forests",
    ],
  };

  // State to hold all chat messages
  const [messages, setMessages] = useState<Message[]>([defaultGreeting]);

  // Reset chat to initial greeting
  const clearMessages = () => setMessages([defaultGreeting]);

  return (
    <ChatContext.Provider value={{ messages, setMessages, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

// Custom hook to use chat context
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used inside ChatProvider");
  }
  return context;
}
