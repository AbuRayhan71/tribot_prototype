import React from 'react';
import { MessageCircle, Globe, Stethoscope, Shield } from 'lucide-react';

export const WelcomeMessage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-20 px-4 min-h-[50vh] md:min-h-[60vh]">
      <div className="max-w-2xl mx-auto text-center">
        {/* Welcome Icon */}
        <div className="mx-auto h-16 w-16 md:h-20 md:w-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-6 md:mb-8 shadow-lg">
          <Stethoscope className="h-8 w-8 md:h-10 md:w-10 text-white" />
        </div>
        
        {/* Welcome Text */}
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
          TRIBOT Multilingual Triage Assistant
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed">
          NHMRC Research Study - AI-powered emergency department support for multilingual patients
        </p>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-blue-100 rounded-full mb-4">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Natural Conversation</h3>
              <p className="text-sm text-gray-600">Chat naturally about your symptoms</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-green-100 rounded-full mb-4">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">2 Languages</h3>
              <p className="text-sm text-gray-600">English, Arabic</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-purple-100 rounded-full mb-4">
                <Stethoscope className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">AI Triage</h3>
              <p className="text-sm text-gray-600">Intelligent symptom assessment</p>
            </div>
          </div>
        </div>
        
        {/* Getting Started */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 md:p-8 border border-blue-200 mb-6 md:mb-8">
          <h3 className="font-semibold text-blue-800 mb-4 flex items-center justify-center gap-2 text-sm md:text-base">
            <MessageCircle className="w-5 h-5" />
            How can I help you today?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm">
            <div className="bg-white/70 rounded-lg p-3 md:p-4 text-blue-700">
              <strong>Describe your symptoms:</strong><br />
              "I have chest pain and feel dizzy"
            </div>
            <div className="bg-white/70 rounded-lg p-3 md:p-4 text-blue-700">
              <strong>Ask for guidance:</strong><br />
              "Should I go to the emergency room?"
            </div>
            <div className="bg-white/70 rounded-lg p-3 md:p-4 text-blue-700">
              <strong>Use your language:</strong><br />
              "أشعر بألم في الصدر" (Arabic)
            </div>
            <div className="bg-white/70 rounded-lg p-3 md:p-4 text-blue-700">
              <strong>Cultural support:</strong><br />
              "I need to discuss this with my family"
            </div>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-yellow-600" />
            <p className="text-xs md:text-sm text-yellow-800 font-medium">
              Research Prototype - Not for Clinical Decision Making
            </p>
          </div>
          <p className="text-xs text-yellow-700">
            This AI assistant provides culturally-sensitive guidance but always consult healthcare professionals for medical decisions.
          </p>
        </div>
      </div>
    </div>
  );
};