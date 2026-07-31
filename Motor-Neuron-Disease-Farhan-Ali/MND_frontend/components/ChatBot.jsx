import { useState, useEffect, useRef } from "react";
import {
  MessageCircle, X, Send, Brain, Volume2, VolumeX, 
  Minimize2, Mic, MicOff, Copy, Check, RefreshCw, ChevronUp, Loader2
} from "lucide-react";

// API Configuration - Direct Key for stability
const GROQ_API_KEY = "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";

const SYSTEM_PROMPT = `You are NeuroBot, a STRICT specialized AI for Motor Neuron Disease (MND) only.
Your expertise is limited to ALS, PBP, PMA, and PLS.

STRICT RULES:
1. ONLY answer questions related to MND symptoms, caregiving, neurology, and treatments.
2. If the user asks about ANYTHING else (cooking, coding, sports, general chat), you MUST politely refuse.
3. Refusal message: "I am specialized only in Motor Neuron Disease (MND). I cannot assist with other topics. Please ask me about MND symptoms, care, or research."
4. Use bullet points for medical advice and always include a small medical disclaimer.`;

export default function NeuroBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 👋 I'm NeuroBot — your specialized AI for MND.\n\nHow can I help you with symptoms, daily care, or research today?",
      sender: "bot",
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll logic
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // --- AI Logic (Groq Llama 3.3) ---
  const callGroqAPI = async (userChatHistory) => {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...userChatHistory
          ],
          temperature: 0.3, // Low temperature for higher accuracy/strictness
          max_tokens: 1024,
        }),
      });

      const data = await response.json();

      if (data?.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      } else if (data.error) {
        return `AI Error: ${data.error.message}`;
      }
      return "I couldn't process that. Please try again.";
    } catch (error) {
      return "Connection error. Please check your internet.";
    }
  };

  const handleSend = async (textOverride = null) => {
    const text = (textOverride || input).trim();
    if (!text) return;

    const userMsg = { id: Date.now(), text, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setShowPopup(false);

    // Memory: Last 6 messages
    const context = messages.slice(-6).map(m => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text
    }));
    context.push({ role: "user", content: text });

    const aiResponse = await callGroqAPI(context);
    
    setMessages((prev) => [...prev, { 
      id: Date.now() + 1, 
      text: aiResponse, 
      sender: "bot" 
    }]);
    setIsTyping(false);
  };

  // --- Utilities ---
  const handleVoiceInput = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported in this browser."); return; }
    const recognition = new SR();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setInput(t);
      setTimeout(() => handleSend(t), 600);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const speakMessage = (text) => {
    if (!("speechSynthesis" in window)) return;
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ""));
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const resetChat = () => {
    setMessages([{
      id: Date.now(),
      text: "Chat reset! 🔄 Ask me anything about MND.",
      sender: "bot"
    }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
      
      {/* Online Notification Popup */}
      {showPopup && !isOpen && (
        <div className="mb-3 bg-white p-3 rounded-xl shadow-lg border border-slate-200 w-48 animate-in fade-in slide-in-from-right-5">
          <p className="text-xs text-slate-700 font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            NeuroBot is Online!
          </p>
        </div>
      )}

      {/* Main Chat Window */}
      {isOpen && (
        <div className={`mb-4 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 fixed right-6
          ${isMinimized 
            ? "w-72 h-[56px] bottom-24" 
            : "w-[380px] md:w-[400px] h-[580px] max-h-[80vh] bottom-24" 
          }`}>

          {/* Header */}
          <div className="bg-slate-900 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm leading-none">NeuroBot AI</h3>
                <span className="text-[10px] text-blue-400 uppercase tracking-tighter">MND Specialist</span>
              </div>
            </div>
            <div className="flex gap-2 items-center text-slate-400">
              <button onClick={resetChat} title="Clear Chat"><RefreshCw className="w-3.5 h-3.5 hover:text-white transition-colors" /></button>
              <button onClick={() => setIsMinimized(!isMinimized)} className="hover:text-white">
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button onClick={() => setIsOpen(false)} className="hover:text-white"><X className="w-4 h-4" /></button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 no-scrollbar">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`relative group max-w-[85%] p-3 rounded-2xl text-[13.5px] shadow-sm leading-relaxed
                      ${msg.sender === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"}`}>
                      
                      <p className="whitespace-pre-line">{msg.text}</p>

                      {msg.sender === "bot" && (
                        <div className="absolute -bottom-6 left-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => speakMessage(msg.text)} className="text-slate-400 hover:text-blue-500">
                             {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => { navigator.clipboard.writeText(msg.text); setCopiedId(msg.id); setTimeout(() => setCopiedId(null), 2000); }} 
                                  className="text-slate-400 hover:text-green-500">
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex items-center gap-2">
                      <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                      <span className="text-xs text-slate-400 italic">Processing...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                <div className="flex gap-2 items-center bg-slate-100 rounded-xl px-3 py-1 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 transition-all shadow-inner">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask about ALS, PBP, Symptoms..."
                    className="flex-1 bg-transparent py-2 text-sm outline-none text-slate-700"
                  />
                  <button onClick={handleVoiceInput} className={`${isListening ? "text-red-500 animate-pulse" : "text-slate-400 hover:text-blue-500"}`}>
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleSend()} disabled={!input.trim() || isTyping} className="text-blue-600 disabled:text-slate-300">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 text-center mt-2 uppercase tracking-tighter">
                  NeuroGuard AI • Generative Mode • 2026 Updated
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Toggle Button (FAB) */}
      <button
        onClick={() => { setIsOpen(!isOpen); setShowPopup(false); setIsMinimized(false); }}
        className={`p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border-4 border-white
          ${isOpen ? "bg-slate-800 rotate-90" : "bg-blue-600 ring-4 ring-blue-50/50"}`}>
        {isOpen ? <X className="text-white w-6 h-6" /> : <MessageCircle className="text-white w-6 h-6" />}
      </button>
    </div>
  );
}