/** 
 * The chatbot for our website
 * - The users prompts are sent to the api endpoint and the chatbots' responses are returned to the user.
 * - The user can click the reset button to return the conversation to its initial state.
 * - The user and the chatbot will have different coloured messages for usability.
*/

"use client";

import { useState, useRef, useEffect } from "react";
import "remixicon/fonts/remixicon.css";

// Message type definition
interface Message {
	id: string;
	text: string;
	sender: "user" | "bot";
	timestamp: Date;
}
 
// Function to convert Markdown links to HTML
function convertMarkdownLinks(text: string): string {
	// Convert [text](url) to HTML anchor tags
	return text.replace(
		/\[([^\]]+)\]\(([^)]+)\)/g, 
		'<a href="$2" class="chatbot-link" style="color: #2563eb; text-decoration: underline; cursor: pointer;">$1</a>'
	);
}

// Function to render bot messages with HTML links 
function BotMessage({ text }: { text: string }) {
	const htmlContent = convertMarkdownLinks(text);
	return (
		<p 
			className="text-sm leading-relaxed whitespace-pre-line"
			dangerouslySetInnerHTML={{ __html: htmlContent }}
		/>
	);
}

export default function Chatbot() {
	// State: is the chat window open?
	const [isOpen, setIsOpen] = useState(false);

	// State: array of all messages in the conversation
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			text: "Hello! I am MYEcoLens Assistant. How can I assist you today?",
			sender: "bot",
			timestamp: new Date(),
		},
	]);

	// State: current user input text
	const [inputValue, setInputValue] = useState("");

	// State: whether bot is typing
	const [isTyping, setIsTyping] = useState(false);

	// Ref: Scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
	// Scroll to bottom whenever messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

	// Reset chat to initial state
	const handleReset = () => {
		setMessages([
			{
				id: "1",
				text: "Hello! I am MYEcoLens Assistant. How can I assist you today?",
				sender: "bot",
				timestamp: new Date(),
			},
		]);
		setInputValue("");
		setIsTyping(false);
	};

	// Handle sending a user message
	const handleSend = async (text?: string) => {
		const messageText = text || inputValue.trim();
		if (!messageText) return;

		// Add user message to chat
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
			// Send message to backend API
			const res = await fetch("/api/chatbot", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: messageText }),
			});
			// Response from API
			const data = await res.json();
			const botText = data.answer || "I am sorry, I didn't quite understand that. Could you please clarify?";
			// Add bot response to chat
			const botReply: Message = {
				id: (Date.now() + 1).toString(),
				text: botText,
				sender: "bot",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, botReply]);
		} catch (err) {
			// Handle API error
			console.error(err);
			setMessages((prev) => [
				...prev,
				{
					id: (Date.now() + 2).toString(),
					text: "Oops! Something went wrong. Please try again.",
					sender: "bot",
					timestamp: new Date(),
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
					className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-lg hover:shadow-2xl transition-all transform hover:scale-110 flex items-center justify-center cursor-pointer group"
					title="MYEcoLens Chat Assistant"
					>
						<i className="ri-chat-3-line text-2xl group-hover:animate-pulse"></i>
					</button>
				</div>
			)}
	
			{/* Chat Interface */}
			{isOpen && (
				<div className="fixed bottom-6 right-6 w-100 h-[480px] z-50 flex">
					<div className="bg-white shadow-2xl w-full flex flex-col animate-in slide-in-from-right duration-300 rounded-xl overflow-hidden">
						{/* Header */}
						<div className="flex items-center justify-between py-3 px-4 bg-green-600 text-white rounded-tl-xl">
							<div className="flex items-center space-x-4">
								<h3 className="font-bold text-lg">MYEcoLens Assistant</h3>
							</div>
							{/* Reset & Close Buttons */}
							<div className="flex items-center gap-2">
								<button
								onClick={handleReset}
								className="w-8 h-8 flex items-center justify-center hover:text-gray-200 transition-colors cursor-pointer"
								title="Reset conversation"
								>
									<i className="ri-refresh-line text-lg"></i>
								</button>
								<button
								onClick={() => setIsOpen(false)}
								className="w-10 h-10 flex items-center justify-center hover:text-gray-200 transition-colors cursor-pointer"
								title="Close conversation"
								>
									<i className="ri-close-line text-xl"></i>
								</button>
							</div>
						</div>

						{/* Messages */}
						<div className="flex-1 overflow-y-auto pt-4 px-6 pb-6 space-y-4 bg-gray-50 border-b border-b-gray-300">
							{messages.map((message) => (
								<div
								key={message.id}
								className={`flex ${
									message.sender === "user" ? "justify-end" : "justify-start"
								}`}
								>
									<div className="max-w-[90%] flex items-end space-x-2">
										{/* Bot Icon */}
										{message.sender === "bot" && (
											<div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white flex-shrink-0 -ml-2">
												<i className="ri-robot-2-line text-sm"></i>
											</div>
										)}
										
										{/* Message Bubble */}
										<div className={`rounded-2xl px-4 py-2 shadow-sm ${
											message.sender === "user"
											? "bg-green-600 text-white"
											: "bg-white text-gray-800"
										} max-w-[600px]`}
										>
											{/* Render message content - different for bot vs user */}
											{message.sender === "bot" ? (
												<BotMessage text={message.text} />
											) : (
												<p className="text-sm leading-relaxed whitespace-pre-line">
													{message.text}
												</p>
											)}
											<p className={`text-xs mt-2 ${
												message.sender === "user"
													? "text-white/90 w-full flex justify-end text-right"
													: "text-gray-500"
											}`}
											style={message.sender === "user" ? { marginLeft: "auto" } : {}}
											>
												{message.timestamp.toLocaleTimeString("en-US", {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</p>
										</div>
									</div>
								</div>
							))}
							
							{/* Typing Indicator */}
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
												></div>
												<div
												className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
												style={{ animationDelay: "0.2s" }}
												></div>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Anchor for scroll */}
            	<div ref={messagesEndRef} />
            </div>

						{/* Input */}
						<div className="p-6 bg-white rounded-bl-3xl">
							<div className="flex items-center space-x-3">
								<textarea
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											if (!isTyping) handleSend();
										}
									}}
									placeholder="Ask me anything..."
									className="flex-1 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-sm border border-gray-300 h-12"
									rows={1}
								/>
								{/* Send button */}
								<button
								onClick={() => !isTyping && handleSend()}
								disabled={!inputValue.trim() || isTyping}
								className={`w-12 h-12 ${
									isTyping
									? "bg-gray-300"
									: "bg-green-600 hover:bg-green-700"
								} text-white rounded-xl flex items-center justify-center cursor-pointer`}
								>
									<i className="ri-send-plane-fill text-lg"></i>
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}