import { useState, useEffect, useRef } from "react";

import {

  MessageCircle, X, Send, Bot, User, Loader2, Sparkles,

  Brain, Activity, AlertCircle, Copy,

  Volume2, VolumeX, Minimize2, Maximize2, RotateCcw, Mic, MicOff

} from "lucide-react";



export default function AdvancedChatBot() {

  const [isOpen, setIsOpen] = useState(false);

  const [isMinimized, setIsMinimized] = useState(false);

  const [messages, setMessages] = useState([

    {

      id: 1,

      text: "Hello! I'm NeuroBot!!. You can speak to me or type! Ask about specific types of MND (ALS, PBP), genetics, or exercises.",

      sender: "bot",

      timestamp: new Date(),

      confidence: 1.0

    }

  ]);

  const [input, setInput] = useState("");

  const [isTyping, setIsTyping] = useState(false);

  const [conversationContext, setConversationContext] = useState([]);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const [isListening, setIsListening] = useState(false);

  const [showSuggestions, setShowSuggestions] = useState(true);

  const [availableVoices, setAvailableVoices] = useState([]);

   

  const messagesEndRef = useRef(null);

  const inputRef = useRef(null);



  // --- 🔊 VOICE SETUP

  useEffect(() => {

    const loadVoices = () => {

      const voices = window.speechSynthesis.getVoices();

      setAvailableVoices(voices);

    };

   

    window.speechSynthesis.onvoiceschanged = loadVoices;

    loadVoices();

  }, []);



  const speakMessage = (text) => {

    if ('speechSynthesis' in window) {

      if (isSpeaking) {

        window.speechSynthesis.cancel();

        setIsSpeaking(false);

        return;

      }



      // Removing Markdown (**bold**) for cleaner speech

      const cleanText = text.replace(/\*\*/g, "").replace(/•/g, "").replace(/⚠️/g, "");

     

      const utterance = new SpeechSynthesisUtterance(cleanText);

     

      // 🎯 FIND A CALM VOICE

      const calmVoice = availableVoices.find(

        v => v.name.includes("Google US English Female") ||

             v.name.includes("Zira") ||

             v.name.includes("Female")

      );



      if (calmVoice) utterance.voice = calmVoice;

     

      utterance.lang = "en-US";

      utterance.rate = 0.9; // Slower speed = Calmer

      utterance.pitch = 1.0;



      utterance.onstart = () => setIsSpeaking(true);

      utterance.onend = () => setIsSpeaking(false);

      utterance.onerror = () => setIsSpeaking(false);



      window.speechSynthesis.speak(utterance);

    }

  };



  // --- 🎤 VOICE INPUT (Speech-to-Text) ---

  const handleVoiceInput = () => {

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      alert("Voice input requires Google Chrome.");

      return;

    }



    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';

    recognition.interimResults = false;



    recognition.onstart = () => setIsListening(true);

   

    recognition.onresult = (event) => {

      const transcript = event.results[0][0].transcript;

      setInput(transcript);

      setTimeout(() => handleSend(transcript), 500); // Auto send after speaking

    };



    recognition.onend = () => setIsListening(false);

    recognition.start();

  };



  // Auto-scroll

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [messages, isTyping]);



  useEffect(() => {

    if (isOpen && inputRef.current && !isMinimized) inputRef.current.focus();

  }, [isOpen, isMinimized]);



  // --- 🧠 KNOWLEDGE BASE (English) ---

  const knowledgeBase = [

    {

      intent: "greeting",

      keywords: ["hello", "hi", "hey", "start", "greetings"],

      patterns: ["^(hi|hello|hey)", "good (morning|evening|afternoon)"],

      answer: "Hello! I am ready to help. You can ask me: 'What are the types of MND?', 'Is ALS genetic?', or 'Diet tips'.",

      confidence: 0.95,

      category: "general"

    },

    {

      intent: "types_general",

      keywords: ["types", "kind", "variant", "forms", "classification"],

      patterns: ["types of mnd", "different types", "kinds of mnd"],

      answer: "📋 **There are 4 Main Types of MND:**\n\n1. **ALS (Amyotrophic Lateral Sclerosis):** The most common form (60-70%). Affects both upper and lower nerves.\n2. **PBP (Progressive Bulbar Palsy):** Affects speech and swallowing first.\n3. **PMA:** Affects lower motor neurons only (weakness/wasting).\n4. **PLS:** Affects upper motor neurons only (stiffness).\n\nAsk me about a specific type for more details.",

      confidence: 0.99,

      followUp: ["What is ALS?", "What is PBP?"],

      category: "medical-info"

    },

    {

      intent: "als_info",

      keywords: ["als", "amyotrophic", "lou gehrig"],

      patterns: ["what is als", "define als", "tell me about als"],

      answer: "🔵 **ALS (Amyotrophic Lateral Sclerosis):**\n\nThis is the most common form of MND. It affects nerves in the brain and spinal cord.\n\n• **Symptoms:** Weakness in hands/feet, tripping, and eventually difficulty speaking.\n• **Progression:** Average survival is 2-5 years, though some live much longer (like Stephen Hawking).",

      confidence: 0.99,

      followUp: ["Is ALS genetic?", "Treatment options"],

      category: "medical-info"

    },

    {

      intent: "pbp_info",

      keywords: ["pbp", "bulbar", "speech", "swallow"],

      patterns: ["what is pbp", "define pbp", "bulbar palsy"],

      answer: "🗣️ **PBP (Progressive Bulbar Palsy):**\n\nThis type targets the muscles of the face, throat, and tongue first.\n\n• **Symptoms:** Slurred speech and difficulty swallowing are the first signs.\n• **Tip:** Speech therapy and texture-modified diets are very helpful.",

      confidence: 0.99,

      category: "medical-info"

    },

    {

      intent: "exercises",

      keywords: ["exercise", "workout", "yoga", "physical therapy", "activity"],

      patterns: ["what exercises", "safe exercises", "physical therapy"],

      answer: "💪 **Recommended Exercises:**\n\n1. **ROM (Range of Motion):** Gentle stretching to prevent joint stiffness.\n2. **Aquatic Therapy:** Walking in a warm pool reduces strain on muscles.\n3. **Deep Breathing:** Helps maintain lung capacity.\n\n⚠️ **Note:** Avoid heavy cardio or weights that cause exhaustion.",

      confidence: 0.98,

      category: "lifestyle"

    },

    {

      intent: "games",

      keywords: ["game", "play", "fun", "videogame", "hobby"],

      patterns: ["what games", "games for patients"],

      answer: "🎮 **Therapeutic Games:**\n\n• **Physical:** Wii Sports (Bowling/Golf) requires minimal movement.\n• **Cognitive:** Sudoku, Wordle, and Memory apps keep the brain sharp.\n• **Eye-Gaze:** If hand movement is limited, use Tobii Eye Tracker to play Minecraft or Solitaire with your eyes!",

      confidence: 0.97,

      category: "lifestyle"

    },

    {

      intent: "diet",

      keywords: ["diet", "food", "eat", "nutrition", "meal"],

      patterns: ["diet plan", "what to eat", "food list"],

      answer: "🥗 **Dietary Advice:**\n\n• **Soft Foods:** Yogurt, mashed potatoes, and scrambled eggs are easier to swallow.\n• **High Calorie:** Smoothies and peanut butter help prevent weight loss.\n• **Hydration:** Use thickeners in water if choking is a concern.",

      confidence: 0.96,

      category: "lifestyle"

    },

    {

      intent: "genetics",

      keywords: ["genetic", "inherit", "family", "dna"],

      patterns: ["is it genetic", "is als genetic", "family history"],

      answer: "🧬 **Is it Genetic?**\n\n• **Sporadic (90%):** Most cases happen randomly with no family history.\n• **Familial (10%):** Inherited through genes like C9orf72 or SOD1.\n\nIf you have a family history of MND, genetic counseling is recommended.",

      confidence: 0.98,

      category: "medical-info"

    },

    {

      intent: "treatment",

      keywords: ["cure", "treat", "medicine", "riluzole"],

      patterns: ["is there a cure", "treatment options", "medication"],

      answer: "💊 **Treatment Options:**\n\nThere is no cure yet, but treatments help manage symptoms:\n1. **Riluzole:** Can slow disease progression.\n2. **Therapies:** Physical, Speech, and Occupational therapy are crucial.\n3. **Breathing Support:** Non-invasive ventilation (BiPAP).",

      confidence: 0.98,

      category: "treatment"

    },

    // Fallback

    {

      intent: "definition",

      keywords: ["mnd", "disease"],

      patterns: ["what is mnd", "define mnd"],

      answer: "**MND (Motor Neuron Disease)** is a progressive condition that damages the nervous system, leading to muscle weakness and wasting.",

      confidence: 0.8,

      category: "medical-info"

    }

  ];



  // --- NLP UTILS ---

  const normalizeWord = (word) => {

    return word.toLowerCase().replace(/[^\w\s]/gi, '');

  };



  const findBestMatch = (userInput) => {

    const lowerInput = userInput.toLowerCase();

    const words = lowerInput.split(/\s+/).map(normalizeWord);

   

    let bestMatch = null;

    let highestScore = 0;



    knowledgeBase.forEach((topic) => {

      let score = 0;

     

      // Keyword Match

      topic.keywords.forEach((keyword) => {

        if (lowerInput.includes(keyword)) score += 3;

        else if (words.includes(keyword)) score += 1;

      });

     

      // Pattern Match (High Priority)

      if (topic.patterns) {

        topic.patterns.forEach(p => {

            if (new RegExp(p, "i").test(lowerInput)) score += 10;

        });

      }



      if (score > highestScore) {

        highestScore = score;

        bestMatch = topic;

      }

    });



    if (highestScore >= 1 && bestMatch) {

      return { match: bestMatch, confidence: 0.9 };

    }



    return {

      match: {

        answer: "I didn't quite catch that. Try asking: 'What are the types of MND?', 'Is it genetic?', or 'Diet tips'.",

        confidence: 0.3,

        intent: "fallback",

        followUp: ["What is ALS?", "Safe exercises"]

      },

      confidence: 0.3

    };

  };



  const handleSend = async (textOverride = null) => {

    const textToSend = textOverride || input;

    if (!textToSend.trim()) return;

   

    const userMessage = { id: Date.now(), text: textToSend, sender: "user", timestamp: new Date() };

    setMessages(prev => [...prev, userMessage]);

    setInput("");

    setIsTyping(true);



    setTimeout(() => {

      const { match } = findBestMatch(textToSend);

     

      if (match.intent && match.intent !== "fallback") {

        setConversationContext(prev => [...prev, match.intent]);

      }



      const botMessage = {

        id: Date.now() + 1,

        text: match.answer,

        sender: "bot",

        timestamp: new Date(),

        confidence: match.confidence,

        followUp: match.followUp || []

      };

     

      setMessages(prev => [...prev, botMessage]);

      setIsTyping(false);

     

    }, 1000);

  };



  const handleKeyPress = (e) => {

    if (e.key === "Enter" && !e.shiftKey) {

      e.preventDefault();

      handleSend();

    }

  };



  const handleChipClick = (text) => {

    setInput(text);

    setTimeout(() => handleSend(text), 100);

  };



  const copyMessage = (text) => navigator.clipboard.writeText(text);



  const resetChat = () => {

    setMessages([{ id: 1, text: "Chat reset. Ask me: 'What is ALS?'", sender: "bot", timestamp: new Date(), confidence: 1.0 }]);

    setConversationContext([]);

  };



  // --- UI RENDER ---

  return (

    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end font-sans">

     

      {isOpen && (

        <div className={`mb-3 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 flex flex-col ${isMinimized ? 'w-72 h-14' : 'w-[90vw] sm:w-[380px] h-[500px] max-h-[80vh]'}`}>

         

          {/* Header */}

          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-3.5 flex items-center justify-between relative overflow-hidden shrink-0">

            <div className="flex items-center gap-3 relative z-10">

              <div className="bg-white/20 p-1.5 rounded-xl backdrop-blur-sm"><Brain className="w-5 h-5 text-white" /></div>

              <div className="text-white">

                <div className="font-bold text-base flex items-center gap-2">NeuroBot <Sparkles className="w-3 h-3 text-yellow-300" /></div>

                <div className="text-[10px] text-white/80 flex items-center gap-1"><Activity className="w-3 h-3" /> Voice Assistant</div>

              </div>

            </div>

            <div className="flex items-center gap-1 relative z-10">

              <button onClick={resetChat} className="hover:bg-white/20 p-1.5 rounded-lg"><RotateCcw className="w-4 h-4 text-white" /></button>

              <button onClick={() => setIsMinimized(!isMinimized)} className="hover:bg-white/20 p-1.5 rounded-lg">{isMinimized ? <Maximize2 className="w-4 h-4 text-white" /> : <Minimize2 className="w-4 h-4 text-white" />}</button>

              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg"><X className="w-4 h-4 text-white" /></button>

            </div>

          </div>



          {!isMinimized && (

            <>

              {/* Messages Area */}

              <div className="flex-1 overflow-y-auto p-3 bg-slate-50 space-y-3 scrollbar-thin scrollbar-thumb-slate-200">

                {messages.map((msg) => (

                  <div key={msg.id} className={`flex gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"} group`}>

                    <div className={`flex-shrink-0 ${msg.sender === "bot" ? "bg-gradient-to-br from-indigo-500 to-purple-600" : "bg-slate-600"} w-7 h-7 rounded-full flex items-center justify-center shadow-lg mt-1`}>

                      {msg.sender === "bot" ? <Brain className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-white" />}

                    </div>



                    <div className={`flex-1 ${msg.sender === "user" ? "items-end" : "items-start"} flex flex-col`}>

                      <div className={`${

                          msg.sender === "bot" ? "bg-white border border-slate-200 text-slate-800 rounded-tl-sm" : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm"

                        } px-3.5 py-2.5 rounded-2xl max-w-[95%] shadow-sm relative text-xs sm:text-sm leading-relaxed whitespace-pre-line`}

                      >

                        {msg.text}

                       

                        {/* 🔊 SPEAKER BUTTON FOR BOT */}

                        {msg.sender === "bot" && (

                          <div className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">

                            <button onClick={() => copyMessage(msg.text)} className="bg-white p-1.5 rounded-full shadow-md border hover:bg-slate-50" title="Copy"><Copy className="w-3 h-3 text-slate-500"/></button>

                            <button onClick={() => speakMessage(msg.text)} className="bg-white p-1.5 rounded-full shadow-md border hover:bg-slate-50" title="Listen (Calm Voice)">

                                {isSpeaking ? <VolumeX className="w-3 h-3 text-red-500"/> : <Volume2 className="w-3 h-3 text-blue-500"/>}

                            </button>

                          </div>

                        )}

                      </div>

                     

                      {msg.sender === "bot" && msg.followUp && msg.followUp.length > 0 && (

                        <div className="mt-1.5 flex flex-wrap gap-1.5">

                          {msg.followUp.map((chip, idx) => (

                            <button key={idx} onClick={() => handleChipClick(chip)} className="text-[10px] font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 rounded-full transition-colors">

                              {chip}

                            </button>

                          ))}

                        </div>

                      )}

                    </div>

                  </div>

                ))}



                {isTyping && (

                  <div className="flex gap-2">

                    <div className="bg-indigo-500 w-7 h-7 rounded-full flex items-center justify-center mt-1"><Brain className="w-3.5 h-3.5 text-white" /></div>

                    <div className="bg-white border border-slate-200 px-3 py-2.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">

                      <Loader2 className="w-3 h-3 text-indigo-600 animate-spin" />

                      <span className="text-xs text-slate-500">Thinking...</span>

                    </div>

                  </div>

                )}

                <div ref={messagesEndRef} />

              </div>



              {/* Input Area */}

              <div className="p-3 bg-white border-t border-slate-200 shrink-0">

                <div className="flex gap-2 items-center">

                  <div className="relative flex-1">

                      <input

                        ref={inputRef}

                        value={input}

                        onChange={(e) => setInput(e.target.value)}

                        onKeyDown={handleKeyPress}

                        placeholder={isListening ? "Listening..." : "Type or say 'What is ALS?'..."}

                        className={`w-full pl-4 pr-10 py-2.5 border rounded-xl focus:outline-none focus:ring-2 text-sm transition-all ${isListening ? "border-red-400 ring-red-100 bg-red-50" : "border-slate-200 ring-indigo-100 focus:border-indigo-500"}`}

                      />

                      {/* 🎤 MIC BUTTON */}

                      <button

                        onClick={handleVoiceInput}

                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${isListening ? "bg-red-500 text-white animate-pulse" : "text-slate-400 hover:bg-slate-100 hover:text-indigo-600"}`}

                        title="Speak (Voice Input)"

                      >

                        {isListening ? <MicOff className="w-4 h-4"/> : <Mic className="w-4 h-4"/>}

                      </button>

                  </div>

                 

                  <button onClick={() => handleSend()} disabled={!input.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">

                    <Send className="w-4 h-4" />

                  </button>

                </div>

                <div className="text-center mt-1.5">

                   <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3"/> AI info is for guidance only.</span>

                </div>

              </div>

            </>

          )}

        </div>

      )}



      {/* Toggle Button */}

      <button

        onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); }}

        className={`${isOpen ? "bg-red-500 rotate-90" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-110"} text-white p-4 sm:p-5 rounded-full shadow-2xl transition-all duration-300 border-4 border-white flex items-center justify-center`}

      >

        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}

      </button>

    </div>

  );

}