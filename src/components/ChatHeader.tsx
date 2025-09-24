import React from 'react';
import { Shield, Globe, Activity, Users } from 'lucide-react';

export const ChatHeader: React.FC = () => {
  return (
    <div className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <img 
                src="/image.png" 
                alt="UNSW Sydney Logo" 
                className="h-12 md:h-16 w-auto"
              />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                TRIBOT Multilingual Triage Assistant
              </h1>
              <p className="text-xs md:text-sm lg:text-base text-blue-600 font-medium">
                NHMRC Research Study - AI-Powered Chat Interface
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Research Prototype</span>
            </div>
          </div>
        </div>
        
        {/* Feature Pills */}
        <div className="flex flex-wrap gap-2 md:gap-3 mt-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 rounded-full border border-blue-200">
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-xs md:text-sm font-medium text-blue-800">6 Languages</span>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1 rounded-full border border-green-200">
            <Activity className="w-4 h-4 text-green-600" />
            <span className="text-xs md:text-sm font-medium text-green-800">AI-Powered</span>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-1 rounded-full border border-purple-200">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-xs md:text-sm font-medium text-purple-800">Emergency Care</span>
          </div>
        </div>
      </div>
    </div>
  );
};