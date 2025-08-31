/** 
 * The chatbot for our website
 * - The users prompts are sent to the api endpoint and the chatbots' responses are returned to the user.
 * - The user can click the reset button to return the conversation to its initial state.
 * - The user and the chatbot will have different coloured messages for usability.
 * - "Typing..." will be displayed while the chatbot's message is being fetched.
*/

"use client";

import { useState } from "react";
import "remixicon/fonts/remixicon.css";


export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const getTimeString = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const initialMessage = { from: "bot", text: "Hello! I'm MYEcoLens Assistant. How can I help you today?", time: getTimeString() };
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
  const newMessages = [...messages, { from: "user", text: input, time: getTimeString() }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botReply = data.answer || "Sorry, I couldn’t understand that.";

  setMessages([...newMessages, { from: "bot", text: botReply, time: getTimeString() }]);
    } catch (error) {
      console.error(error);
      setMessages([
        ...newMessages,
        { from: "bot", text: "Oops! Something went wrong. Please try again.", time: getTimeString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Reset conversation handler
  const handleReset = () => {
    setMessages([{ ...initialMessage, time: getTimeString() }]);
    setInput("");
    setLoading(false);
  };

  return (
    <div>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-green-600 text-white w-16 h-16 rounded-full shadow-lg hover:bg-green-700 flex items-center justify-center cursor-pointer"
        >
          <i className="ri-chat-3-line text-2xl"></i>
        </button>
      )}

      {/* Chat Overlay */}
    {isOpen && (
  <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[480px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '90vh' }}>
          {/* Header */}
          <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center">
            <h2 className="font-semibold">MYEcoLens Assistant</h2>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="text-white hover:text-gray-200 px-2 py-1 rounded text-xs flex items-center justify-center cursor-pointer"
                title="Reset conversation"
              >
                <i className="ri-refresh-line text-lg"></i>
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 ml-1 cursor-pointer">
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm bg-gray-100">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-end gap-2 ${msg.from === "bot" ? "justify-start" : "justify-end"}`}
              >
                {msg.from === "bot" && (
                  <i className="ri-robot-2-line text-2xl text-green-600"></i>
                )}
                <div
                  className={`p-2 border border-gray-300 rounded-lg max-w-fit shadow-xs ${
                    msg.from === "bot"
                      ? "bg-white text-gray-800 self-start"
                      : "bg-green-600 text-white self-end ml-auto"
                  }`}
                >
                  <div>{msg.text}</div>
                  <div className={`text-xs mt-1 ${msg.from === "bot" ? "text-gray-400" : "text-gray-200 text-right"}`}>{msg.time}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <i className="ri-robot-2-line text-2xl text-green-600"></i>
                <div className="bg-white text-gray-800 p-2 border border-gray-300 shadow-xs rounded-lg max-w-fit">
                  Typing...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-300 px-4 py-6 flex bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask anything..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="ml-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 cursor-pointer"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
