import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { Tooltip, TooltipProvider } from './ui/tooltip';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  BarChart3,
  Download,
  Trash2,
  Bot,
  User,
  Sparkles,
  Brain,
  Heart,
  Gamepad2,
  Shield,
  Zap,
  MessageSquare,
  TrendingUp,
  Clock,
  X,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  personality?: string;
}

interface Analytics {
  totalMessages: number;
  userMessages: number;
  aiMessages: number;
  popularTopics: { name: string; count: number }[];
  conversationLength: number;
}

const AIchat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [defensiveMode, setDefensiveMode] = useState(false);
  const [personality, setPersonality] = useState<'friendly' | 'logical' | 'playful' | 'confident'>('friendly');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const personalities = {
    friendly: { icon: Heart, color: 'text-pink-400', name: 'Friendly' },
    logical: { icon: Brain, color: 'text-blue-400', name: 'Logical' },
    playful: { icon: Gamepad2, color: 'text-purple-400', name: 'Playful' },
    confident: { icon: Shield, color: 'text-orange-400', name: 'Confident' }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleNewChat = () => {
      setMessages([]);
      setInputValue('');
      setIsOpen(true);
    };

    window.addEventListener('startNewChat', handleNewChat);
    return () => window.removeEventListener('startNewChat', handleNewChat);
  }, []);

  const generateAIResponse = (userMessage: string, currentPersonality: string): string => {
    const responses = {
      greeting: [
        "Hello! I'm your AI assistant, ready to help with anything you need. What's on your mind today?",
        "Hi there! I'm excited to chat with you. How can I assist you today?",
        "Welcome! I'm here to help you with questions, tasks, or just have a great conversation.",
      ],
      help: [
        "I can help you with a wide variety of tasks! I can answer questions, help with coding, provide explanations, assist with writing, solve problems, and much more. What would you like to explore?",
        "I'm designed to be your helpful AI companion. Whether you need technical help, creative assistance, or just want to chat, I'm here for you!",
      ],
      tech: [
        "I love discussing technology! From programming languages and frameworks to AI, machine learning, web development, and emerging tech trends. What tech topic interests you?",
        "Technology is fascinating! I can help with coding, explain complex concepts, discuss latest trends, or dive deep into any tech subject you're curious about.",
      ],
      code: [
        "Ready to code! I can help with debugging, explain algorithms, review code, suggest best practices, or help you learn new programming languages. What are you working on?",
        "Let's build something amazing! I can assist with frontend, backend, databases, APIs, or any coding challenge you're facing.",
      ],
      default: [
        "That's an interesting point! Let me think about that...",
        "I understand what you're asking. Here's my perspective...",
        "Great question! Based on what you've shared...",
      ]
    };

    const personalityModifiers = {
      friendly: (response: string) => `😊 ${response} I'm here to help make this as easy as possible for you!`,
      logical: (response: string) => `🤔 ${response} Let me break this down systematically for you.`,
      playful: (response: string) => `🎉 ${response} This is going to be fun to explore together!`,
      confident: (response: string) => `💪 ${response} I'm confident we can tackle this effectively.`
    };

    let responseArray = responses.default;
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      responseArray = responses.greeting;
    } else if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
      responseArray = responses.help;
    } else if (lowerMessage.includes('tech') || lowerMessage.includes('technology') || lowerMessage.includes('programming')) {
      responseArray = responses.tech;
    } else if (lowerMessage.includes('code') || lowerMessage.includes('coding') || lowerMessage.includes('debug')) {
      responseArray = responses.code;
    }

    let response = responseArray[Math.floor(Math.random() * responseArray.length)];
    
    if (defensiveMode) {
      response += " (Note: I've considered multiple perspectives on this topic and believe this approach addresses the key concerns while remaining practical and effective.)";
    }

    return personalityModifiers[currentPersonality](response);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(inputValue, personality),
        sender: 'ai',
        timestamp: new Date(),
        personality,
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);

      if (isSpeaking) {
        speakText(aiResponse.text);
      }
    }, 1000 + Math.random() * 2000);
  };

  const handleQuickAction = (action: string) => {
    const quickMessages = {
      hello: "Hello! How are you today?",
      help: "Can you help me understand how to use this chat effectively?",
      tech: "What are the latest trends in AI and technology?",
      code: "Can you help me with a coding problem?"
    };

    setInputValue(quickMessages[action as keyof typeof quickMessages]);
    setTimeout(() => handleSendMessage(), 100);
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
      };

      recognitionRef.current.start();
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      synthesisRef.current = new SpeechSynthesisUtterance(text.replace(/[😊🤔🎉💪]/g, ''));
      synthesisRef.current.rate = 0.95;
      synthesisRef.current.pitch = 1;
      synthesisRef.current.volume = 0.9;
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => voice.name.includes('Google') || voice.name.includes('Microsoft'));
      if (preferredVoice) {
        synthesisRef.current.voice = preferredVoice;
      }

      window.speechSynthesis.speak(synthesisRef.current);
    }
  };

  const calculateAnalytics = (): Analytics => {
    const userMessages = messages.filter(m => m.sender === 'user').length;
    const aiMessages = messages.filter(m => m.sender === 'ai').length;
    
    const topics = messages
      .filter(m => m.sender === 'user')
      .map(m => m.text.toLowerCase())
      .join(' ')
      .split(' ')
      .filter(word => word.length > 4)
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const popularTopics = Object.entries(topics)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      totalMessages: messages.length,
      userMessages,
      aiMessages,
      popularTopics,
      conversationLength: messages.length > 0 ? 
        Math.round((new Date().getTime() - messages[0].timestamp.getTime()) / 60000) : 0
    };
  };

  const downloadTranscript = () => {
    const transcript = messages
      .map(m => `[${m.timestamp.toLocaleTimeString()}] ${m.sender.toUpperCase()}: ${m.text}`)
      .join('\n');
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-transcript-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const analytics = calculateAnalytics();

  if (!isOpen) {
    return (
      <div className="fixed bottom-8 right-8 z-50">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative"
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="h-20 w-20 rounded-full bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 hover:from-cyan-400 hover:via-purple-500 hover:to-pink-400 shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 transform hover:scale-110 neon-cyan relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-400/20 animate-pulse"></div>
            <Bot className="h-10 w-10 text-white relative z-10 group-hover:animate-bounce" />
            <Sparkles className="h-4 w-4 text-white absolute top-2 right-2 animate-pulse" />
          </Button>
          
          {/* Enhanced floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="particle w-3 h-3 top-1 left-1 bg-cyan-400/60" style={{ animationDelay: '0s' }}></div>
            <div className="particle w-2 h-2 top-12 right-1 bg-purple-400/60" style={{ animationDelay: '2s' }}></div>
            <div className="particle w-2 h-2 bottom-1 left-12 bg-pink-400/60" style={{ animationDelay: '4s' }}></div>
            <div className="particle w-1 h-1 top-4 right-8 bg-cyan-300/80" style={{ animationDelay: '1s' }}></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed inset-4 z-50 flex flex-col lg:inset-8"
      >
        <Card className="flex-1 flex flex-col glass-dark border-white/20 shadow-2xl overflow-hidden backdrop-blur-2xl">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-black/30 via-purple-900/20 to-black/30">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur-md opacity-75 animate-pulse"></div>
                <Bot className="h-10 w-10 text-white relative z-10 ai-badge" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
                  AI Neural Assistant
                </h2>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-medium">Neural Network Active</span>
                  </div>
                  <div className="w-1 h-4 bg-white/20"></div>
                  <div className="flex items-center space-x-1">
                    {React.createElement(personalities[personality].icon, { 
                      className: `h-4 w-4 ${personalities[personality].color}` 
                    })}
                    <span className="text-gray-300">{personalities[personality].name} Mode</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Tooltip content="View Analytics Dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="text-gray-400 hover:text-cyan-400 hover:bg-white/10 transition-all duration-200 hover:scale-105"
                >
                  <BarChart3 className="h-5 w-5" />
                </Button>
              </Tooltip>
              
              <Tooltip content="Download Chat Transcript">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadTranscript}
                  disabled={messages.length === 0}
                  className="text-gray-400 hover:text-purple-400 hover:bg-white/10 transition-all duration-200 hover:scale-105 disabled:opacity-30"
                >
                  <Download className="h-5 w-5" />
                </Button>
              </Tooltip>

              <Tooltip content="Clear Conversation">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  disabled={messages.length === 0}
                  className="text-gray-400 hover:text-red-400 hover:bg-white/10 transition-all duration-200 hover:scale-105 disabled:opacity-30"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </Tooltip>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <ScrollArea className="flex-1 p-6 chat-scrollbar">
                <AnimatePresence>
                  {messages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center h-full text-center space-y-6"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
                        <Bot className="h-24 w-24 text-cyan-400 relative z-10 float-animation" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
                          Welcome to AI Neural Chat
                        </h3>
                        <p className="text-gray-400 max-w-md leading-relaxed">
                          I'm your advanced AI assistant, powered by neural networks. Ask me anything, and I'll provide intelligent, contextual responses.
                        </p>
                      </div>
                      
                      {/* Enhanced Quick Actions */}
                      <div className="grid grid-cols-2 gap-3 mt-8">
                        <Button
                          onClick={() => handleQuickAction('hello')}
                          className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Say Hello
                        </Button>
                        <Button
                          onClick={() => handleQuickAction('help')}
                          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Get Help
                        </Button>
                        <Button
                          onClick={() => handleQuickAction('tech')}
                          className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 text-blue-300 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Tech Talk
                        </Button>
                        <Button
                          onClick={() => handleQuickAction('code')}
                          className="bg-gradient-to-r from-green-500/20 to-teal-500/20 hover:from-green-500/30 hover:to-teal-500/30 text-green-300 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105"
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          Code Help
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} message-enter`}
                        >
                          <div className={`flex items-start space-x-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {/* Avatar */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              message.sender === 'user' 
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg' 
                                : 'bg-gradient-to-r from-cyan-500 to-teal-500 shadow-lg neon-cyan'
                            }`}>
                              {message.sender === 'user' ? (
                                <User className="h-5 w-5 text-white" />
                              ) : (
                                <Bot className="h-5 w-5 text-white" />
                              )}
                            </div>
                            
                            {/* Message Bubble */}
                            <div className={`rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm ${
                              message.sender === 'user'
                                ? 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white border border-blue-400/30'
                                : 'bg-gradient-to-r from-gray-800/80 to-gray-900/80 text-gray-100 border border-cyan-400/20'
                            }`}>
                              <p className="text-sm leading-relaxed">{message.text}</p>
                              <div className={`text-xs mt-2 opacity-70 ${
                                message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                              }`}>
                                {message.timestamp.toLocaleTimeString()}
                                {message.personality && (
                                  <span className="ml-2">• {personalities[message.personality as keyof typeof personalities].name}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Enhanced Typing Indicator */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="flex justify-start"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg neon-cyan">
                              <Bot className="h-5 w-5 text-white" />
                            </div>
                            <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-2xl px-6 py-4 border border-cyan-400/20 backdrop-blur-sm">
                              <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <div className="text-xs text-gray-400 mt-2">AI is thinking...</div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Enhanced Input Area */}
              <div className="p-6 border-t border-white/10 bg-gradient-to-r from-black/20 via-purple-900/10 to-black/20">
                {/* Controls Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {/* Personality Selector */}
                    <Tooltip content={`Current: ${personalities[personality].name}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const keys = Object.keys(personalities) as Array<keyof typeof personalities>;
                          const currentIndex = keys.indexOf(personality);
                          const nextIndex = (currentIndex + 1) % keys.length;
                          setPersonality(keys[nextIndex]);
                        }}
                        className={`${personalities[personality].color} hover:bg-white/10 transition-all duration-200 hover:scale-105`}
                      >
                        {React.createElement(personalities[personality].icon, { className: "h-4 w-4 mr-2" })}
                        {personalities[personality].name}
                      </Button>
                    </Tooltip>

                    {/* Voice Controls */}
                    <div className="flex items-center space-x-2">
                      <Tooltip content={isListening ? "Stop Listening" : "Start Voice Input"}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={startListening}
                          className={`transition-all duration-200 hover:scale-105 ${
                            isListening 
                              ? 'text-red-400 hover:text-red-300 bg-red-500/10' 
                              : 'text-gray-400 hover:text-cyan-400 hover:bg-white/10'
                          }`}
                        >
                          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                      </Tooltip>

                      <Tooltip content={isSpeaking ? "Disable Voice Output" : "Enable Voice Output"}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsSpeaking(!isSpeaking)}
                          className={`transition-all duration-200 hover:scale-105 ${
                            isSpeaking 
                              ? 'text-green-400 hover:text-green-300 bg-green-500/10' 
                              : 'text-gray-400 hover:text-purple-400 hover:bg-white/10'
                          }`}
                        >
                          {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                        </Button>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Defensive Mode Toggle */}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-400">Defensive Mode</span>
                    <Switch
                      checked={defensiveMode}
                      onCheckedChange={setDefensiveMode}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-red-500"
                    />
                    <Shield className={`h-4 w-4 transition-colors duration-200 ${defensiveMode ? 'text-orange-400' : 'text-gray-500'}`} />
                  </div>
                </div>

                {/* Enhanced Input Field */}
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything... I'm powered by advanced AI"
                      className="bg-black/40 border-white/20 text-white placeholder-gray-400 focus:border-cyan-400/50 focus:ring-cyan-400/25 rounded-xl px-6 py-4 text-base backdrop-blur-sm transition-all duration-200 focus-enhanced"
                      disabled={isTyping}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Sparkles className="h-4 w-4 text-cyan-400/60 animate-pulse" />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-xl px-6 py-4 shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed neon-cyan"
                  >
                    {isTyping ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Analytics Panel */}
            <AnimatePresence>
              {showAnalytics && (
                <motion.div
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 300 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="w-80 border-l border-white/10 bg-gradient-to-b from-black/30 to-purple-900/20 backdrop-blur-xl analytics-slide"
                >
                  <div className="p-6 h-full overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-white flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-cyan-400" />
                        Analytics Dashboard
                      </h3>
                    </div>

                    <div className="space-y-6">
                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-400/20 backdrop-blur-sm">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-cyan-400">{analytics.totalMessages}</div>
                            <div className="text-xs text-gray-400">Total Messages</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-400/20 backdrop-blur-sm">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-400">{analytics.conversationLength}</div>
                            <div className="text-xs text-gray-400">Minutes</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Message Distribution Chart */}
                      {analytics.totalMessages > 0 && (
                        <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
                          <CardContent className="p-4">
                            <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                              <MessageSquare className="h-4 w-4 mr-2 text-cyan-400" />
                              Message Distribution
                            </h4>
                            <ResponsiveContainer width="100%" height={120}>
                              <BarChart data={[
                                { name: 'You', value: analytics.userMessages, fill: '#3b82f6' },
                                { name: 'AI', value: analytics.aiMessages, fill: '#06b6d4' }
                              ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}

                      {/* Popular Topics */}
                      {analytics.popularTopics.length > 0 && (
                        <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
                          <CardContent className="p-4">
                            <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                              <TrendingUp className="h-4 w-4 mr-2 text-purple-400" />
                              Popular Topics
                            </h4>
                            <div className="space-y-2">
                              {analytics.popularTopics.map((topic, index) => (
                                <div key={topic.name} className="flex items-center justify-between">
                                  <span className="text-sm text-gray-300 capitalize">{topic.name}</span>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-500"
                                        style={{ width: `${(topic.count / Math.max(...analytics.popularTopics.map(t => t.count))) * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-400 w-6 text-right">{topic.count}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Settings */}
                      <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
                        <CardContent className="p-4">
                          <h4 className="text-sm font-medium text-white mb-4 flex items-center">
                            <Brain className="h-4 w-4 mr-2 text-green-400" />
                            AI Configuration
                          </h4>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-300">Defensive Responses</span>
                              <Switch
                                checked={defensiveMode}
                                onCheckedChange={setDefensiveMode}
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-red-500"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-300">Voice Output</span>
                              <Switch
                                checked={isSpeaking}
                                onCheckedChange={setIsSpeaking}
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
};

export default AIchat;