import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Key, Loader2, Globe, Activity, MessageSquare, Users } from 'lucide-react';
import { openaiService, type TriageAnalysis } from './services/openaiService';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { WelcomeMessage } from './components/WelcomeMessage';
import { InterpreterServices } from './components/InterpreterServices';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  language?: string;
  analysis?: TriageAnalysis;
  isUnderstandingFailure?: boolean;
}

type TabType = 'chat' | 'interpreter';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [language, setLanguage] = useState<string>('english');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [showInterpreterServices, setShowInterpreterServices] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      console.log('App component mounted, checking OpenAI configuration...');
      const configured = openaiService.isConfigured();
      console.log('OpenAI configured:', configured);
      setIsConfigured(configured);
    } catch (err) {
      console.error('Error checking OpenAI configuration:', err);
      setIsConfigured(false);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleSendMessage = async (content: string, selectedLanguage: string) => {
    const userMessage: Message = {
      id: generateId(),
      type: 'user',
      content,
      timestamp: new Date(),
      language: selectedLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError('');

    try {
      const conversationHistory = messages.slice(-6);
      const analysis = await openaiService.analyzeSymptoms(content, selectedLanguage, conversationHistory);
      
      // Check if AI has low confidence or indicates understanding issues
      const isLowConfidence = analysis.confidence < 70;
      const hasUnderstandingIssues = analysis.fallbackMechanism.isActivated;
      
      if (isLowConfidence || hasUnderstandingIssues) {
        setFailedAttempts(prev => prev + 1);
        
        let fallbackMessage = '';
        
        if (failedAttempts === 0) {
          // First attempt - ask to repeat
          fallbackMessage = "Sorry, I can't fully understand your conversation. Can you please repeat this or try describing your symptoms in a different way?";
        } else if (failedAttempts >= 1) {
          // Second attempt - offer interpreter services
          fallbackMessage = "Sorry, I still can't understand the conversation completely. I am now going to connect you to our Human Interpreter services for better assistance.";
          setShowInterpreterServices(true);
          setActiveTab('interpreter');
        }
        
        const botMessage: Message = {
          id: generateId(),
          type: 'bot',
          content: fallbackMessage,
          timestamp: new Date(),
          analysis,
          isUnderstandingFailure: true
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Reset failed attempts on successful understanding
        setFailedAttempts(0);
        
        const botMessage: Message = {
          id: generateId(),
          type: 'bot',
          content: analysis.conversationalResponse || `I've analyzed your symptoms and here's my assessment:`,
          timestamp: new Date(),
          analysis
        };
        
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (err) {
      setFailedAttempts(prev => prev + 1);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during analysis';
      setError(errorMessage);
      
      let fallbackContent = '';
      
      if (failedAttempts === 0) {
        fallbackContent = "Sorry, I can't understand your conversation. Can you please repeat this or try describing your symptoms in a different way?";
      } else {
        fallbackContent = "Sorry, I still can't understand the conversation completely. I am now going to connect you to our Human Interpreter services for better assistance.";
        setShowInterpreterServices(true);
        setActiveTab('interpreter');
      }
      
      const errorBotMessage: Message = {
        id: generateId(),
        type: 'bot',
        content: fallbackContent,
        timestamp: new Date(),
        isUnderstandingFailure: true
      };

      setMessages(prev => [...prev, errorBotMessage]);
      console.error('Triage analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
    setFailedAttempts(0);
    setShowInterpreterServices(false);
    setActiveTab('chat');
  };

  const handleInterpreterConnect = () => {
    const connectionMessage: Message = {
      id: generateId(),
      type: 'bot',
      content: "You are being connected to our Human Interpreter service at 02 8738 6088. Please hold while we establish the connection.",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, connectionMessage]);
  };

  // Debug: Log render
  console.log('App rendering - isConfigured:', isConfigured);

  if (!isConfigured) {
    console.log('Rendering configuration screen');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <Key className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Azure OpenAI Configuration Required</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              To use the AI-powered triage assistant, you need to configure your Azure OpenAI API credentials.
            </p>
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 mb-6 text-left">
              <p className="text-sm font-semibold text-gray-800 mb-3">
                Required Environment Variables:
              </p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs font-bold mr-3 mt-0.5">1</span>
                  <code className="bg-gray-200 px-2 py-1 rounded text-xs">VITE_OPENAI_API_KEY</code>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs font-bold mr-3 mt-0.5">2</span>
                  <code className="bg-gray-200 px-2 py-1 rounded text-xs">VITE_OPENAI_BASE_URL</code>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs font-bold mr-3 mt-0.5">3</span>
                  <code className="bg-gray-200 px-2 py-1 rounded text-xs">VITE_DEPLOYMENT_NAME</code>
                </li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">
              Please provide your Azure OpenAI credentials to continue.
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering main app interface');
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      <ChatHeader />
      
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'chat'
                  ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 border-transparent hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                AI Triage Chat
              </div>
            </button>
            <button
              onClick={() => setActiveTab('interpreter')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 relative ${
                activeTab === 'interpreter'
                  ? 'text-orange-600 border-orange-600 bg-orange-50/50'
                  : 'text-gray-600 border-transparent hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Human Interpreter
                {showInterpreterServices && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'chat' ? (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-4 py-6">
                {messages.length === 0 ? (
                  <WelcomeMessage />
                ) : (
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                    {isLoading && (
                      <div className="flex gap-4 mb-6">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                          </div>
                        </div>
                        <div className="max-w-3xl">
                          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl px-6 py-4 shadow-lg">
                            <div className="flex items-center gap-3 text-emerald-700">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="font-medium">Let me think about your symptoms...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="max-w-4xl mx-auto px-4 pb-4">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl shadow-sm">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-red-800">I encountered an issue</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Input Area */}
            <div className="bg-white border-t border-gray-200 p-4 md:p-6 shadow-lg">
              <div className="max-w-4xl mx-auto">
                {/* Language Selector and AI Status */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-600" />
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white text-sm font-medium min-w-[200px]"
                    >
                      <option value="english">🇺🇸 English</option>
                      <option value="arabic">🇸🇦 العربية (Arabic)</option>
                      <option value="bengali">🇧🇩 বাংলা (Bengali)</option>
                      <option value="hindi">🇮🇳 हिंदी (Hindi)</option>
                      <option value="vietnamese">🇻🇳 Tiếng Việt (Vietnamese)</option>
                      <option value="chinese">🇨🇳 中文 (Chinese)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs md:text-sm text-green-600 font-medium">AI Ready</span>
                    </div>
                    {messages.length > 0 && (
                      <button
                        onClick={clearChat}
                        className="text-xs md:text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100"
                      >
                        New Chat
                      </button>
                    )}
                  </div>
                </div>

                {/* Chat Input */}
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  language={language}
                  onLanguageChange={setLanguage}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <InterpreterServices
                onConnect={handleInterpreterConnect}
                language={language}
              />
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-blue-900 text-white py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            {/* Main Warning */}
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="mr-2 text-red-400" size={20} />
              <p className="text-sm md:text-lg font-bold text-red-300">
                AI Prototype for research use only – not for clinical decision-making
              </p>
            </div>
            
            {/* Research Context */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-lg border border-white/20 max-w-3xl mx-auto mb-4 md:mb-6">
              <h3 className="text-sm md:text-base font-bold text-blue-200 mb-2">NHMRC Research Study</h3>
              <p className="text-gray-200 mb-2 md:mb-3 leading-relaxed text-xs md:text-sm">
                This TRIBOT prototype is developed as part of NHMRC-funded research by <strong>Dr Padmanesan Narasimhan</strong> at UNSW Sydney, 
                focusing on improving emergency department communication for multilingual patients.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 text-xs text-blue-200">
                <span className="flex items-center">
                  <Activity className="mr-1" size={14} />
                  Azure OpenAI
                </span>
                <span className="flex items-center">
                  <Globe className="mr-1" size={14} />
                  React & Tailwind
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
