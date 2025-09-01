import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipProvider } from '@/components/ui/tooltip';
import {
  Send,
  Bot as AIIcon,
  User as UserIcon,
  Mic,
  MicOff,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Download,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer } from 'recharts';

// =====================
// Types
// =====================
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'AI';
  timestamp: string;
  isAI?: boolean;
  meta?: {
    defenseQuality?: 'low' | 'medium' | 'high';
    hallucinationRisk?: 'low' | 'medium' | 'high';
    tone?: 'friendly' | 'logical' | 'playful' | 'confident';
    taskType?: string; // Added for task type
  };
}

interface Analytics {
  totalMessages: number;
  userMessages: number;
  AIMessages: number;
  popularTopics: { [key: string]: number };
  sessionStart: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  lastModified: string;
}

// =====================
// Component
// =====================
const ChatAI: React.FC = () => {
  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: "Hello! I'm your advanced AI assistant with comprehensive capabilities. I can help you with:\n\n• **Programming** - Code in any language, debug, optimize\n• **Writing** - Essays, emails, reports, creative content\n• **Analysis** - Data analysis, research, problem-solving\n• **Math** - Equations, calculations, statistics\n• **Creative** - Brainstorming, design ideas, innovation\n• **Learning** - Tutorials, explanations, step-by-step guides\n\nWhat would you like to work on today?",
    sender: 'AI',
    timestamp: new Date().toISOString(),
    isAI: true,
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [backendAnalytics, setBackendAnalytics] = useState<any>(null);
  const [defensiveMode, setDefensiveMode] = useState(false);
  const [personality, setPersonality] = useState<'friendly' | 'logical' | 'playful' | 'confident'>('friendly');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('current');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o-mini');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Analytics
  const [analytics, setAnalytics] = useState<Analytics>(() => ({
    totalMessages: 0,
    userMessages: 0,
    AIMessages: 0,
    popularTopics: {},
    sessionStart: new Date().toISOString(),
  }));

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chatAIRef = useRef<HTMLDivElement>(null);

  // =====================
  // Helpers: UI
  // =====================
  const quickActions = [
    { label: 'Code', query: 'Help me write a Python function to sort a list' },
    { label: 'Write', query: 'Write a professional email for a job application' },
    { label: 'Analyze', query: 'Analyze the pros and cons of remote work' },
    { label: 'Math', query: 'Solve this equation: 2x + 5 = 13' },
    { label: 'Creative', query: 'Give me creative ideas for a startup business' },
    { label: 'Learn', query: 'Explain machine learning in simple terms' },
    { label: 'Design', query: 'Help me design a user interface for a mobile app' },
    { label: 'Research', query: 'Research the latest trends in AI technology' },
  ];

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatAIRef.current && !chatAIRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.classList.add('chatAI-open');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.classList.remove('chatAI-open');
    };
  }, [isOpen]);

  // Speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  // Speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthesisRef.current = new SpeechSynthesisUtterance();
      synthesisRef.current.rate = 0.95;
      synthesisRef.current.pitch = 1;
      synthesisRef.current.volume = 0.9;
    }
  }, []);

  const speakText = (text: string) => {
    if (synthesisRef.current && 'speechSynthesis' in window) {
      setIsSpeaking(true);
      synthesisRef.current.text = text;
      synthesisRef.current.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(synthesisRef.current);
    }
  };

  // =====================
  // Analytics helpers
  // =====================
  const updateAnalytics = (message: string, sender: 'user' | 'AI') => {
    setAnalytics((prev) => {
      const next = { ...prev };
      next.totalMessages++;
      if (sender === 'user') {
        next.userMessages++;
        const topics = [
          'code', 'program', 'script', 'function', 'algorithm', 'debug', 'fix', 'optimize',
          'write', 'essay', 'article', 'story', 'email', 'letter', 'report', 'blog',
          'analyze', 'explain', 'compare', 'evaluate', 'review', 'assess', 'examine',
          'calculate', 'solve', 'equation', 'math', 'statistics', 'probability', 'formula',
          'create', 'design', 'imagine', 'brainstorm', 'idea', 'creative', 'art',
          'learn', 'teach', 'tutorial', 'guide', 'how to', 'step by step', 'explain',
          'research', 'study', 'investigate', 'explore', 'discover', 'understand'
        ];
        topics.forEach((topic) => {
          if (message.toLowerCase().includes(topic)) {
            next.popularTopics[topic] = (next.popularTopics[topic] || 0) + 1;
          }
        });
      } else next.AIMessages++;
      return next;
    });
  };

  const getPopularTopics = () =>
    Object.entries(analytics.popularTopics)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic, count]) => ({ name: topic, value: count }));

  // Persist analytics in localStorage (optional)
  useEffect(() => {
    try {
      localStorage.setItem("chatAI_analytics", JSON.stringify(analytics));
    } catch { }
  }, [analytics]);

  // Load recent chats from localStorage on component mount
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem("chatAI_recentChats");
      if (savedChats) {
        setRecentChats(JSON.parse(savedChats));
      }
    } catch { }
  }, []);

  // Load available AI models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/ai-models');
        if (response.ok) {
          const data = await response.json();
          setAvailableModels(data.models || []);
        }
      } catch (error) {
        console.error('Failed to load models:', error);
      }
    };
    loadModels();
  }, []);

  // Load backend analytics
  useEffect(() => {
    const loadBackendAnalytics = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/analytics/overview');
        if (response.ok) {
          const data = await response.json();
          setBackendAnalytics(data);
        }
      } catch (error) {
        console.error('Failed to load backend analytics:', error);
      }
    };
    
    // Load immediately
    loadBackendAnalytics();
    
    // Refresh every 5 seconds
    const interval = setInterval(loadBackendAnalytics, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Set initialization flag after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000); // Wait 1 second after mount
    
    return () => clearTimeout(timer);
  }, []);

  // Save recent chats to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("chatAI_recentChats", JSON.stringify(recentChats));
    } catch { }
  }, [recentChats]);

  // Listen for new chat events from the sidebar
  useEffect(() => {
    const handleNewChat = () => {
      startNewChat();
    };

    window.addEventListener('startNewChat', handleNewChat);
    return () => {
      window.removeEventListener('startNewChat', handleNewChat);
    };
  }, []);

  // Update sidebar with recent chats
  useEffect(() => {
    const updateSidebar = () => {
      const container = document.getElementById('recent-chats-container');
      if (container) {
        container.innerHTML = '';
        
        if (recentChats.length === 0) {
          container.innerHTML = `
            <div class="text-gray-500 text-xs p-2 text-center">
              No recent chats
            </div>
          `;
          return;
        }

        recentChats.forEach(chat => {
          const chatElement = document.createElement('div');
          chatElement.className = `group relative text-gray-300 text-sm p-2 rounded hover:bg-gray-700 cursor-pointer ${
            chat.id === currentChatId ? 'bg-gray-700 border-l-2 border-green-400' : ''
          }`;
          
          const title = chat.title || 'Untitled Chat';
          const date = new Date(chat.lastModified).toLocaleDateString();
          
          chatElement.innerHTML = `
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="truncate">${title}</div>
                <div class="text-xs text-gray-500">${date}</div>
              </div>
              <button 
                class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1 rounded transition-opacity"
                onclick="window.dispatchEvent(new CustomEvent('deleteChat', { detail: '${chat.id}' }))"
                title="Delete chat"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          `;
          
          chatElement.addEventListener('click', (e) => {
            if (!(e.target as HTMLElement).closest('button')) {
              loadChat(chat.id);
            }
          });
          
          container.appendChild(chatElement);
        });
      }
    };

    updateSidebar();
  }, [recentChats, currentChatId]);

  // Listen for delete chat events
  useEffect(() => {
    const handleDeleteChat = (event: CustomEvent) => {
      deleteChat(event.detail);
    };

    window.addEventListener('deleteChat', handleDeleteChat as EventListener);
    return () => {
      window.removeEventListener('deleteChat', handleDeleteChat as EventListener);
    };
  }, []);

  // =====================
  // Chat Management Functions
  // =====================
  const generateChatTitle = (messages: Message[]): string => {
    // Find the first user message to use as title
    const firstUserMessage = messages.find(m => m.sender === 'user');
    if (firstUserMessage) {
      const text = firstUserMessage.text.trim();
      return text.length > 50 ? text.substring(0, 50) + '...' : text;
    }
    return 'New Chat';
  };

  const saveCurrentChat = () => {
    // Don't save during initialization or if no user messages
    if (!isInitialized) return;
    
    const hasUserMessages = messages.some(m => m.sender === 'user');
    
    if (hasUserMessages) {
      const chatTitle = generateChatTitle(messages);
      const chatSession: ChatSession = {
        id: currentChatId,
        title: chatTitle,
        messages: [...messages],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      setRecentChats(prev => {
        const existingIndex = prev.findIndex(chat => chat.id === currentChatId);
        if (existingIndex >= 0) {
          // Update existing chat
          const updated = [...prev];
          updated[existingIndex] = chatSession;
          return updated;
        } else {
          // Add new chat
          return [chatSession, ...prev].slice(0, 10); // Keep only 10 recent chats
        }
      });
    }
  };

  const startNewChat = () => {
    // Only save current chat if it has user messages
    const hasUserMessages = messages.some(m => m.sender === 'user');
    if (hasUserMessages) {
    saveCurrentChat();
    }

    // Create new chat
    const newChatId = `chat_${Date.now()}`;
    setCurrentChatId(newChatId);
    
    // Reset messages to welcome message
    setMessages([{
      id: '1',
      text: "Hello! I'm your advanced AI assistant with comprehensive capabilities. I can help you with:\n\n• **Programming** - Code in any language, debug, optimize\n• **Writing** - Essays, emails, reports, creative content\n• **Analysis** - Data analysis, research, problem-solving\n• **Math** - Equations, calculations, statistics\n• **Creative** - Brainstorming, design ideas, innovation\n• **Learning** - Tutorials, explanations, step-by-step guides\n\nWhat would you like to work on today?",
      sender: 'AI',
      timestamp: new Date().toISOString(),
      isAI: true,
    }]);

    // Reset analytics
    setAnalytics({
      totalMessages: 0,
      userMessages: 0,
      AIMessages: 0,
      popularTopics: {},
      sessionStart: new Date().toISOString(),
    });

    // Clear input and states
    setInputValue('');
    setIsTyping(false);
    setError(null);
    setRetryCount(0);
  };

  const loadChat = (chatId: string) => {
    // Only save current chat if it has user messages
    const hasUserMessages = messages.some(m => m.sender === 'user');
    if (hasUserMessages) {
    saveCurrentChat();
    }

    const chatToLoad = recentChats.find(chat => chat.id === chatId);
    if (chatToLoad) {
      setCurrentChatId(chatId);
      setMessages(chatToLoad.messages);
      
      // Recalculate analytics for loaded chat
      const userMessages = chatToLoad.messages.filter(m => m.sender === 'user').length;
      const aiMessages = chatToLoad.messages.filter(m => m.sender === 'AI').length;
      const totalMessages = chatToLoad.messages.length;
      
      // Recalculate popular topics
      const topics: { [key: string]: number } = {};
      chatToLoad.messages.forEach(m => {
        if (m.sender === 'user') {
          const topicKeywords = [
            'code', 'program', 'script', 'function', 'algorithm', 'debug', 'fix', 'optimize',
            'write', 'essay', 'article', 'story', 'email', 'letter', 'report', 'blog',
            'analyze', 'explain', 'compare', 'evaluate', 'review', 'assess', 'examine',
            'calculate', 'solve', 'equation', 'math', 'statistics', 'probability', 'formula',
            'create', 'design', 'imagine', 'brainstorm', 'idea', 'creative', 'art',
            'learn', 'teach', 'tutorial', 'guide', 'how to', 'step by step', 'explain',
            'research', 'study', 'investigate', 'explore', 'discover', 'understand'
          ];
          topicKeywords.forEach((topic) => {
            if (m.text.toLowerCase().includes(topic)) {
              topics[topic] = (topics[topic] || 0) + 1;
            }
          });
        }
      });

      setAnalytics({
        totalMessages,
        userMessages,
        AIMessages: aiMessages,
        popularTopics: topics,
        sessionStart: chatToLoad.createdAt,
      });

      // Clear input and states
      setInputValue('');
      setIsTyping(false);
      setError(null);
      setRetryCount(0);
    }
  };

  const deleteChat = (chatId: string) => {
    setRecentChats(prev => prev.filter(chat => chat.id !== chatId));
    
    // If we're deleting the current chat, start a new one
    if (chatId === currentChatId) {
      startNewChat();
    }
  };

  // =====================
  // AI Response Generation
  // =====================
  const detectChallenge = (text: string) => {
    const t = text.toLowerCase();
    const triggers = ['defend', 'why', 'how is that', "i disagree", 'not true', 'prove', 'evidence', 'source'];
    return triggers.some((w) => t.includes(w));
  };

  const detectTaskType = (text: string) => {
    const t = text.toLowerCase();
    
    // Code-related tasks
    if (t.includes('code') || t.includes('program') || t.includes('script') || t.includes('function') || 
        t.includes('algorithm') || t.includes('debug') || t.includes('fix') || t.includes('optimize')) {
      return 'coding';
    }
    
    // Writing tasks
    if (t.includes('write') || t.includes('essay') || t.includes('article') || t.includes('story') || 
        t.includes('email') || t.includes('letter') || t.includes('report') || t.includes('blog')) {
      return 'writing';
    }
    
    // Analysis tasks
    if (t.includes('analyze') || t.includes('explain') || t.includes('compare') || t.includes('evaluate') || 
        t.includes('review') || t.includes('assess') || t.includes('examine')) {
      return 'analysis';
    }
    
    // Math tasks
    if (t.includes('calculate') || t.includes('solve') || t.includes('equation') || t.includes('math') || 
        t.includes('statistics') || t.includes('probability') || t.includes('formula')) {
      return 'math';
    }
    
    // Creative tasks
    if (t.includes('create') || t.includes('design') || t.includes('imagine') || t.includes('brainstorm') || 
        t.includes('idea') || t.includes('creative') || t.includes('art')) {
      return 'creative';
    }
    
    // Learning/Education
    if (t.includes('learn') || t.includes('teach') || t.includes('tutorial') || t.includes('guide') || 
        t.includes('how to') || t.includes('step by step') || t.includes('explain')) {
      return 'education';
    }
    
    return 'general';
  };

  const buildSystemPrompt = () => `
You are an advanced AI assistant with comprehensive capabilities across multiple domains. You can help with:

**Technical Skills:**
- Programming in all major languages (Python, JavaScript, Java, C++, etc.)
- Web development (frontend, backend, full-stack)
- Data science and machine learning
- Database design and optimization
- System architecture and DevOps
- Mobile app development
- Game development

**Writing & Communication:**
- Creative writing (stories, poems, scripts)
- Professional writing (emails, reports, proposals)
- Academic writing (essays, research papers)
- Content creation (blogs, articles, social media)
- Technical documentation
- Translation and language learning

**Analysis & Problem Solving:**
- Data analysis and visualization
- Mathematical problem solving
- Logical reasoning and critical thinking
- Research and fact-checking
- Business analysis and strategy
- Scientific explanations

**Creative & Design:**
- Brainstorming and ideation
- Design concepts and mockups
- Creative problem solving
- Art and music concepts
- Marketing and branding ideas

**Education & Learning:**
- Tutoring in any subject
- Step-by-step explanations
- Study guides and summaries
- Quiz and test preparation
- Skill development guidance

**Behavioral Guidelines:**
- Persona: ${personality} but always professional and helpful
- Provide accurate, well-researched information
- When coding, include comments and explanations
- For complex topics, break down into digestible parts
- Always consider best practices and current standards
- If uncertain, acknowledge limitations and suggest alternatives
- Be encouraging and supportive in learning scenarios
- Maintain ethical standards and safety guidelines
- In defensive mode, provide thorough reasoning and evidence
- Use appropriate formatting (code blocks, lists, tables) when helpful
`;

  const buildUserPrompt = (userMessage: string, wantDefense: boolean, taskType: string) => `
Task: Provide a comprehensive, helpful response to the user's request.

Task Type Detected: ${taskType}

User Message: """${userMessage}"""

Instructions:
- If this is a coding task, provide complete, working code with explanations
- If this is a writing task, create high-quality, well-structured content
- If this is an analysis task, provide thorough analysis with supporting reasoning
- If this is a math task, show step-by-step solutions
- If this is a creative task, provide imaginative and innovative ideas
- If this is an education task, create clear, educational explanations
- For any task, be comprehensive and detailed

Return STRICT JSON with keys:
  answer: string (complete response with proper formatting),
  defense: string (reasoning and methodology; empty if not needed),
  hallucination_risk: 'low'|'medium'|'high',
  defense_quality: 'low'|'medium'|'high',
  tone: 'friendly'|'logical'|'playful'|'confident',
  task_type: string (coding|writing|analysis|math|creative|education|general)

${wantDefense ? 'Include detailed defense and methodology.' : 'Include defense only if helpful.'}
Ensure the JSON is valid. No Markdown, no backticks.`;

  const callAIJSON = async (systemPrompt: string, userPrompt: string) => {
    try {
      console.log('🔄 Calling AI API...', { userPrompt: userPrompt.substring(0, 100) + '...' });
      
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: userPrompt,
          systemPrompt: systemPrompt,
          userPrompt: userPrompt,
          conversationId: currentChatId,
          modelId: selectedModel
        }),
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`AI API call failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ API Response:', data);
      
      // Track analytics
      if (data.usage) {
        trackAnalytics('tokens_used', { tokens: data.usage.totalTokens });
      }
      
      return (data && typeof data.reply === 'string') ? data.reply : '';
    } catch (e) {
      console.error('💥 callAIJSON Error:', e);
      trackAnalytics('error_occurred', { error: e instanceof Error ? e.message : 'Unknown error' });
      return '';
    }
  };

  const safeParse = <T,>(raw: string, fallback: T): T => {
    try { return JSON.parse(raw) as T; } catch { return fallback; }
  };

  const generateResponse = async (userMessage: string) => {
    const wantDefense = defensiveMode || detectChallenge(userMessage);
    const taskType = detectTaskType(userMessage);
    const sys = buildSystemPrompt();
    const u1 = buildUserPrompt(userMessage, wantDefense, taskType);

    // Always call AI API
    const raw1 = await callAIJSON(sys, u1);
    const draft = safeParse<{
      answer: string; 
      defense: string; 
      hallucination_risk: 'low' | 'medium' | 'high'; 
      defense_quality: 'low' | 'medium' | 'high'; 
      tone: 'friendly' | 'logical' | 'playful' | 'confident';
      task_type: string;
    }>(raw1, { 
      answer: '', 
      defense: '', 
      hallucination_risk: 'medium', 
      defense_quality: 'medium', 
      tone: personality,
      task_type: taskType
    });

    // If the API did not return the requested JSON, provide a fallback
    if (!draft.answer) {
      return {
        text: "I'm here to help with any task! Whether you need coding help, writing assistance, analysis, math solutions, creative ideas, or educational guidance, I'm ready to assist. What would you like to work on?",
        meta: { 
          defenseQuality: 'low' as const, 
          hallucinationRisk: 'low' as const, 
          tone: personality,
          taskType: taskType
        },
      };
    }

    // Optional Pass 2: self-critique to strengthen response
    let final = draft;
    if (wantDefense || taskType === 'coding' || taskType === 'analysis') {
      const critiquePrompt = `You wrote this response: ${JSON.stringify(draft)}\nImprove the response: make it more comprehensive, accurate, and helpful. For coding tasks, ensure code is complete and well-commented. For analysis, provide deeper insights. Return the SAME JSON shape only.`;
      const raw2 = await callAIJSON(sys, critiquePrompt);
      const improved = safeParse<typeof draft>(raw2, draft);
      final = improved;
    }

    return {
      text: [final.answer, final.defense ? `\n\n🛡️ Methodology:\n${final.defense}` : ''].join(''),
      meta: {
        defenseQuality: final.defense_quality,
        hallucinationRisk: final.hallucination_risk,
        tone: final.tone || personality,
        taskType: final.task_type || taskType,
      },
    };
  };

  // =====================
  // Messaging logic
  // =====================
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    // Create new messages array with the user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    updateAnalytics(inputValue, 'user');
    setInputValue('');
    setIsTyping(true);

    // Save chat immediately with the updated messages
    if (isInitialized) {
      const chatTitle = generateChatTitle(updatedMessages);
      const chatSession: ChatSession = {
        id: currentChatId,
        title: chatTitle,
        messages: updatedMessages,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      setRecentChats(prev => {
        const existingIndex = prev.findIndex(chat => chat.id === currentChatId);
        if (existingIndex >= 0) {
          // Update existing chat
          const updated = [...prev];
          updated[existingIndex] = chatSession;
          return updated;
        } else {
          // Add new chat
          return [chatSession, ...prev].slice(0, 10); // Keep only 10 recent chats
        }
      });
    }

    const { text, meta } = await generateResponse(userMessage.text);

    const AIMessage: Message = {
      id: (Date.now() + 1).toString(),
      text,
      sender: 'AI',
      timestamp: new Date().toISOString(),
      isAI: true,
      meta,
    };

    setMessages((prev) => [...prev, AIMessage]);
    updateAnalytics(text, 'AI');
    setIsTyping(false);

    // Refresh backend analytics after message
    setTimeout(() => {
      fetch('http://localhost:3001/api/analytics/overview')
        .then(response => response.ok ? response.json() : null)
        .then(data => data && setBackendAnalytics(data))
        .catch(error => console.error('Failed to refresh analytics:', error));
    }, 1000);

    // auto voice
    if (!isSpeaking) speakText(AIMessage.text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (query: string) => {
    setInputValue(query);
    setTimeout(() => handleSendMessage(), 80);
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Export transcript
  const downloadTranscript = () => {
    const text = messages
      .map((m) => {
        const time = new Date(m.timestamp).toLocaleString();
        const who = m.sender === "AI" ? "AI Assistant" : "You";
        return `[${time}] ${who}:\n${m.text}\n`;
      })
      .join("\n");

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-transcript-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const COLORS = ["#4fd1c5", "#f6e05e", "#68d391", "#63b3ed", "#f56565"]; // used by recharts cells

  // Analytics tracking function
  const trackAnalytics = async (event: string, data?: any) => {
    try {
      await fetch('http://localhost:3001/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ event, data })
      });
    } catch (error) {
      console.error('Failed to track analytics:', error);
    }
  };

  // =====================
  // Render
  // =====================
  return (
    <TooltipProvider>
      {/* Full Screen Chat Interface */}
      <div className="h-full flex flex-col bg-white">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <AIIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
                <p className="text-sm text-gray-500">Always here to help</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
                             {/* Defensive mode */}
               <Tooltip content="Anticipate pushback and add short defenses.">
                 <Button
                   onClick={() => setDefensiveMode((v) => !v)}
                   className={cn(
                     "relative bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 h-8 px-2 rounded-md flex items-center gap-1 transition-all duration-200",
                     defensiveMode && "bg-green-100 text-green-700 border-green-300"
                   )}
                   title={defensiveMode ? "Defensive mode: ON" : "Defensive mode: OFF"}
                 >
                   <ShieldCheck className="h-4 w-4" />
                   <span className="text-xs">Defend</span>
                   {defensiveMode && (
                     <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                   )}
                 </Button>
               </Tooltip>

                             {/* Personality cycle */}
               <Tooltip content="Cycle response tone">
                 <Button
                   onClick={() => {
                    const order: ('friendly' | 'logical' | 'playful' | 'confident')[] = [
                       "friendly",
                       "logical",
                       "playful",
                       "confident",
                     ];
                     const idx = order.indexOf(personality);
                    setPersonality(order[(idx + 1) % order.length]);
                   }}
                   className="relative bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 h-8 px-2 rounded-md flex items-center gap-1 transition-all duration-200"
                   title={`Personality: ${personality}`}
                 >
                   <Sparkles className="h-4 w-4" />
                   <span className="text-xs capitalize">{personality}</span>
                 </Button>
               </Tooltip>

               {/* Analytics */}
               <Tooltip content="Toggle chat analytics">
                 <Button
                   onClick={() => setShowAnalytics(!showAnalytics)}
                   className={cn(
                     "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 p-2 h-8 w-8 rounded-md transition-all duration-200 relative",
                     showAnalytics && "bg-blue-100 text-blue-700 border-blue-300"
                   )}
                   title="Analytics"
                   aria-pressed={showAnalytics}
                 >
                   <BarChart3 className="h-4 w-4" />
                   {showAnalytics && (
                     <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                   )}
                 </Button>
               </Tooltip>

                               {/* Model Selector */}
               <Tooltip content="Select AI Model">
                 <Button
                   onClick={() => setShowModelSelector(!showModelSelector)}
                   className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 h-8 px-2 rounded-md flex items-center gap-1"
                 >
                   <Sparkles className="h-4 w-4" />
                   <span className="text-xs">{selectedModel}</span>
                 </Button>
               </Tooltip>

                               {/* Download transcript */}
                <Tooltip content="Download transcript">
                  <Button
                    onClick={downloadTranscript}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 p-2 h-8 w-8 rounded-md"
                    aria-label="Download transcript"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </Tooltip>
            </div>
          </div>
        </div>

        {/* Model Selector Dropdown */}
        {showModelSelector && (
          <div className="absolute top-16 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-64">
            <h3 className="font-semibold text-gray-900 mb-3">Select AI Model</h3>
            <div className="space-y-2">
              {availableModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setShowModelSelector(false);
                  }}
                  className={`w-full text-left p-2 rounded-md transition-colors ${
                    selectedModel === model.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs text-gray-500">{model.description}</div>
                  <div className="text-xs text-gray-400">
                    Cost: ${model.costPer1kTokens}/1k tokens
            </div>
                </button>
              ))}
          </div>
            <button
              onClick={() => setShowModelSelector(false)}
              className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
        </div>
        )}

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-hidden">
          {showAnalytics ? (
            <div className="h-full p-6 bg-gray-50 overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">📊 Chat Analytics</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Defend</span>
                      <Switch checked={defensiveMode} onCheckedChange={setDefensiveMode} />
                    </div>
                    <Button
                      onClick={() => setShowAnalytics(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-300 px-3 py-1 rounded text-sm"
                      title="Back to Chat"
                    >
                      ← Back to Chat
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-medium text-gray-900 mb-4">Frontend Statistics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Messages</span>
                        <span className="font-semibold text-blue-600">{analytics.totalMessages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">User Messages</span>
                        <span className="font-semibold text-green-600">{analytics.userMessages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">AI Messages</span>
                        <span className="font-semibold text-purple-600">{analytics.AIMessages}</span>
                      </div>
                    </div>
                  </div>

                  {backendAnalytics && (
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h4 className="font-medium text-gray-900 mb-4">Backend Statistics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Requests</span>
                          <span className="font-semibold text-blue-600">{backendAnalytics.totalRequests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Tokens</span>
                          <span className="font-semibold text-green-600">{backendAnalytics.totalTokens}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Response Time</span>
                          <span className="font-semibold text-purple-600">{backendAnalytics.averageResponseTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Errors</span>
                          <span className="font-semibold text-red-600">{backendAnalytics.errorCount}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-medium text-gray-900 mb-4">Popular Topics</h4>
                    <div className="w-full h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getPopularTopics()}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={80}
                            innerRadius={40}
                            isAnimationActive
                          >
                            {getPopularTopics().map((_entry, index) => (
                              <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ReTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Conversation Management */}
                <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="font-medium text-gray-900 mb-4">Conversation Management</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{recentChats.length}</div>
                      <div className="text-sm text-gray-600">Total Conversations</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{currentChatId}</div>
                      <div className="text-sm text-gray-600">Current Chat ID</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{messages.length}</div>
                      <div className="text-sm text-gray-600">Messages in Current Chat</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-sm text-gray-500">
                  <div>Session started: {new Date(analytics.sessionStart).toLocaleString()}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Settings2 className="h-4 w-4" />
                    <span>Personality: <span className="capitalize text-gray-700">{personality}</span></span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Selected Model: <span className="text-gray-700">{selectedModel}</span></span>
                </div>
                  {backendAnalytics && (
                    <div className="flex items-center gap-2 mt-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Backend Uptime: <span className="text-gray-700">{Math.round(backendAnalytics.uptime)}s</span></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
                         <div className="h-full overflow-y-auto chat-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e0 #f7fafc' }}>
              <div className="p-6 pb-20">
                <div className="max-w-3xl mx-auto space-y-6">
                  {messages.map((m) => (
                    <div key={m.id} className={cn("flex gap-4", m.sender === "user" ? "justify-end" : "justify-start")}>
                      {m.sender === "AI" && (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <AIIcon className="h-5 w-5 text-white" />
                        </div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                        className={cn(
                          "max-w-[80%] p-4 rounded-lg text-sm relative shadow-sm",
                          m.sender === "user"
                            ? "bg-blue-500 text-white rounded-br-md"
                            : "bg-gray-100 text-gray-900 border border-gray-200 rounded-bl-md"
                        )}
                      >
                        <div className="whitespace-pre-line leading-relaxed">{m.text}</div>

                        {m.isAI && m.meta?.defenseQuality && (
                          <>
                            <div className="mt-3 text-xs text-gray-500 border-t border-gray-200 pt-2">
                              <span>🧠 Tone: {m.meta?.tone || 'default'}</span>
                              <span className="mx-2">•</span>
                              <span>🛡️ Defense: {m.meta.defenseQuality}</span>
                              <span className="mx-2">•</span>
                              <span>🎯 Risk: {m.meta.hallucinationRisk}</span>
                              {m.meta.taskType && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>📋 Task: {m.meta.taskType}</span>
                                </>
                              )}
                            </div>
                            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              AI
                            </div>
                          </>
                        )}
                      </motion.div>

                      {m.sender === "user" && (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <UserIcon className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-4 justify-start">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <AIIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="bg-gray-100 text-gray-900 border border-gray-200 p-4 rounded-lg text-sm">
                        <span className="animate-pulse">
                          Thinking<span className="loading-dots">.</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded">
                      <span>⚠️ {error}</span>
                      <Button
                        size="sm"
                        className="h-6 px-2 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300"
                        onClick={handleSendMessage}
                        disabled={isTyping || retryCount > 2}
                      >
                        Retry
                      </Button>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

                 {/* Input Area - Only show when not in analytics mode */}
         {!showAnalytics && (
           <div className="border-t border-gray-200 bg-white p-6">
             <div className="max-w-3xl mx-auto">
               {/* Quick Actions */}
               <div className="grid grid-cols-4 gap-2 mb-4">
                 {quickActions.slice(0, 4).map((qa) => (
                   <Button
                     key={qa.label}
                     onClick={() => handleQuickAction(qa.query)}
                     disabled={isTyping}
                     className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 text-xs h-8 rounded-md"
                   >
                     {qa.label}
                   </Button>
                 ))}
               </div>
               <div className="grid grid-cols-4 gap-2 mb-4">
                 {quickActions.slice(4, 8).map((qa) => (
                   <Button
                     key={qa.label}
                     onClick={() => handleQuickAction(qa.query)}
                     disabled={isTyping}
                     className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 text-xs h-8 rounded-md"
                   >
                     {qa.label}
                   </Button>
                 ))}
               </div>

               <div className="flex gap-3 items-center">
                 <Input
                   ref={inputRef}
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   onKeyDown={handleKeyPress}
                   placeholder="Type your message..."
                   className="flex-1 bg-white border-2 border-gray-300 text-gray-900 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 rounded-lg h-12"
                 />
                                <Tooltip content="Dictate with your voice">
                    <Button
                      onClick={toggleVoiceInput}
                      disabled={isTyping}
                      className={cn(
                        "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-3 h-12 w-12 rounded-lg",
                        isListening && "bg-red-500 text-white border-red-500"
                      )}
                      title="Voice Input"
                      aria-pressed={isListening}
                    >
                      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                  </Tooltip>

                 <Button
                   onClick={handleSendMessage}
                   disabled={!inputValue.trim() || isTyping}
                   className="bg-blue-500 hover:bg-blue-600 text-white px-4 h-12 rounded-lg disabled:opacity-50"
                   aria-label="Send message"
                 >
                   <Send className="h-5 w-5" />
                 </Button>
               </div>
             </div>
           </div>
         )}
      </div>
    </TooltipProvider>
  );
};

export default ChatAI;
