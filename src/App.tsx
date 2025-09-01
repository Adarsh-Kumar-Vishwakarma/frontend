import React, { useState } from 'react';
import AIchat from './components/AIchat';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { 
  MessageCircle, 
  Bot, 
  Settings2, 
  Plus,
  Menu,
  X,
  Clock,
  Sparkles,
  Brain,
  Zap
} from 'lucide-react';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-black/40 backdrop-blur-xl border-r border-white/10 transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bot className="h-8 w-8 text-cyan-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-white font-bold text-lg">AI Assistant</span>
                <div className="text-cyan-400 text-xs font-medium">Neural Network v2.0</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-400 hover:text-white hover:bg-white/10"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-6">
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('startNewChat'));
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Conversation
              <Sparkles className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="px-6 mb-6">
            <div className="text-gray-400 text-sm font-medium mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" className="text-xs text-gray-300 hover:text-white hover:bg-white/10 p-2 h-auto">
                <Brain className="h-3 w-3 mr-1" />
                Brainstorm
              </Button>
              <Button variant="ghost" className="text-xs text-gray-300 hover:text-white hover:bg-white/10 p-2 h-auto">
                <MessageCircle className="h-3 w-3 mr-1" />
                Chat
              </Button>
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
            <div className="space-y-3">
              <div className="text-gray-400 text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Conversations
              </div>
              <div className="space-y-2">
                <div id="recent-chats-container" className="space-y-2">
                  {/* Recent chats will be dynamically inserted here */}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <Button 
              variant="ghost" 
              className="w-full text-gray-400 hover:text-white hover:bg-white/10 justify-start transition-all duration-200"
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Settings & Preferences
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Bar */}
        <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-white/10"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <MessageCircle className="h-6 w-6 text-cyan-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <span className="font-semibold text-white text-lg">AI Neural Chat</span>
                <div className="text-cyan-400 text-sm">Powered by Advanced AI</div>
              </div>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Online</span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden relative">
          <div className="h-full max-w-5xl mx-auto relative z-10">
            <AIchat />
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;