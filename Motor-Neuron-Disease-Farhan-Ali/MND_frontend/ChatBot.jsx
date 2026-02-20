import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am NeuroBot. How can I help you with MND today?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Predefined Knowledge Base (Rule-Based)
  const getBotResponse = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("hello") || lowerText.includes("hi")) 
      return "Hi there! Feel free to ask me about symptoms, registration, or doctors.";
    
    if (lowerText.includes("symptom") || lowerText.includes("sign")) 
      return "Common early symptoms of MND include muscle weakness, twitching (fasciculations), slurred speech, and difficulty gripping objects.";
    
    if (lowerText.includes("cure") || lowerText.includes("treatment")) 
      return "Currently, there is no complete cure for MND, but treatments and therapies can manage symptoms and improve quality of life.";
    
    if (lowerText.includes("register") || lowerText.includes("sign up")) 
      return "You can register by clicking the 'Patient Portal' card on the home screen and selecting 'New User? Register'.";
    
    if (lowerText.includes("doctor") || lowerText.includes("appointment")) 
      return "Once logged in, you can view your report analysis. Our system will recommend top neurologists in Karachi based on your results.";

    if (lowerText.includes("risk") || lowerText.includes("high")) 
      return "Our AI analyzes your report to detect risk levels. 'High Risk' suggests you should consult a specialist immediately.";

    return "I am still learning! Please ask about symptoms, cures, registration, or risk levels.";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // 1. Add User Message
    const newMsg = { id: Date.now(), text: input, sender: "user" };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    // 2. Simulate Bot Typing Delay
    setTimeout(() => {
      const botReply = { id: Date.now() + 1, text: getBotResponse(newMsg.text), sender: "bot" };
      setMessages((prev) => [...prev, botReply]);
    }, 600);
  };

  // Handle Enter Key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  // Suggested Chips
  const suggestions = ["What are the symptoms?", "Is there a cure?", "How to register?", "Contact a Doctor"];

  const handleChipClick = (text) => {
    const newMsg = { id: Date.now(), text: text, sender: "user" };
    setMessages((prev) => [...prev, newMsg]);
    setTimeout(() => {
      const botReply = { id: Date.now() + 1, text: getBotResponse(text), sender: "bot" };
      setMessages((prev) => [...prev, botReply]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">NeuroBot AI</h3>
                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.sender === "user" 
                    ? "bg-blue-600 text-white rounded-br-none" 
                    : "bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-none"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Chips */}
          <div className="px-4 py-2 bg-slate-50 flex gap-2 overflow-x-auto no-scrollbar">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => handleChipClick(s)} className="whitespace-nowrap px-3 py-1 bg-white border border-blue-100 text-blue-600 text-xs rounded-full hover:bg-blue-50 transition-colors shadow-sm">
                {s}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-colors">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-blue-500/40 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}