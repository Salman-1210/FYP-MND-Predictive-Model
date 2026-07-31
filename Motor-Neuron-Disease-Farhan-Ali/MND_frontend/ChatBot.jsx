import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am NeuroBot. How can I help you with MND today?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Getting API key from .env.local
  const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // --- AI GENERATIVE LOGIC ---
  const fetchAIResponse = async (userText) => {
    if (!GROQ_API_KEY) {
      return "System: API Key is missing. Please restart your server after adding it to .env.local";
    }

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { 
              role: "system", 
              content: "You are NeuroBot, a medical AI assistant for Motor Neuron Disease (MND). Be empathetic and accurate. If asked about doctors, mention specialists in Karachi. Always add a disclaimer that you are an AI, not a doctor." 
            },
            { role: "user", content: userText }
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();

      // FIXED: Added safe checks to prevent "Cannot read properties of undefined (reading '0')"
      if (data?.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      } else {
        console.error("API Response Issue:", data);
        return "I'm having trouble thinking right now. Please try again.";
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      return "Connection error. Please check your internet.";
    }
  };

  const handleSend = async (overrideText = null) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim()) return;

    // 1. User Message add karein
    setMessages((prev) => [...prev, { id: Date.now(), text: textToSend, sender: "user" }]);
    setInput("");
    setIsTyping(true);

    // 2. AI Response mangwayein
    const aiReply = await fetchAIResponse(textToSend);
    
    setMessages((prev) => [...prev, { id: Date.now() + 1, text: aiReply, sender: "bot" }]);
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const suggestions = ["Early symptoms?", "MND treatments", "Register as patient", "Doctors in Karachi"];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {isOpen && (
        <div className="bg-white w-80 md:w-96 h-[550px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg shadow-inner">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">NeuroBot AI</h3>
                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Generative
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4 no-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                  msg.sender === "user" 
                    ? "bg-blue-600 text-white rounded-br-none" 
                    : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Thinking Loader */}
            {isTyping && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                  <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
                  <span className="text-[11px] text-slate-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Chips */}
          <div className="px-4 py-2 bg-slate-50 flex gap-2 overflow-x-auto no-scrollbar border-t border-slate-100">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => handleSend(s)} className="whitespace-nowrap px-3 py-1 bg-white border border-blue-100 text-blue-600 text-[11px] rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                {s}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button 
              onClick={() => handleSend()} 
              disabled={isTyping || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2.5 rounded-xl transition-all shadow-md"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center ring-4 ring-white"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}