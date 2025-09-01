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
  Trash2,
  Clock
} from 'lucide-react';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-green-400" />
              <span className="text-white font-semibold">AI Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button 
              className="w-full bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
              onClick={() => {
                // This will be handled by the AIchat component
                window.dispatchEvent(new CustomEvent('startNewChat'));
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" style={{ 
            scrollbarWidth: 'thin', 
            scrollbarColor: '#4B5563 #1F2937'
          }}>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Chats
              </div>
              <div className="space-y-1">
                {/* This will be populated by the AIchat component */}
                <div id="recent-chats-container" className="space-y-1">
                  {/* Recent chats will be dynamically inserted here */}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <Button 
              variant="ghost" 
              className="w-full text-gray-400 hover:text-white justify-start"
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium text-gray-900">Chat with AI Assistant</span>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white overflow-hidden">
          <div className="h-full max-w-4xl mx-auto">
            <AIchat />
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
