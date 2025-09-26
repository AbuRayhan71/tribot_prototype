import React, { useState } from 'react';
import { Phone, Users, Clock, AlertTriangle, CheckCircle, Globe, Loader2 } from 'lucide-react';

interface InterpreterServicesProps {
  onConnect: () => void;
  language: string;
}

export const InterpreterServices: React.FC<InterpreterServicesProps> = ({ onConnect, language }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      onConnect();
      
      // Open phone dialer
      if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
        window.open('tel:0287386088', '_self');
      }
    }, 2000);
  };

  const getLanguageName = (lang: string): string => {
    const languages: { [key: string]: string } = {
      'english': 'English',
      'arabic': 'Arabic (العربية)',
      'bengali': 'Bengali (বাংলা)',
      'hindi': 'Hindi (हिंदी)',
      'vietnamese': 'Vietnamese (Tiếng Việt)',
      'chinese': 'Chinese (中文)'
    };
    return languages[lang] || 'English';
  };

  const getLanguageFlag = (lang: string): string => {
    const flags: { [key: string]: string } = {
      'english': '🇺🇸',
      'arabic': '🇸🇦',
      'bengali': '🇧🇩',
      'hindi': '🇮🇳',
      'vietnamese': '🇻🇳',
      'chinese': '🇨🇳'
    };
    return flags[lang] || '🇺🇸';
  };

  if (isConnected) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-green-200">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connected to Interpreter Services</h2>
          <p className="text-gray-600 mb-6">
            You are now connected to our human interpreter service. A qualified interpreter will assist you shortly.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-800 font-medium">
              📞 Calling: <span className="font-bold">02 8738 6088</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-orange-200">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-6">
          <Users className="h-8 w-8 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Human Interpreter Services</h2>
        
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
            <p className="text-sm font-semibold text-orange-800">
              TRIBOT is having difficulty understanding your conversation
            </p>
          </div>
          <p className="text-xs text-orange-700">
            We're connecting you to a qualified human interpreter for better assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-center mb-2">
              <Globe className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-semibold text-blue-800">Your Language</span>
            </div>
            <p className="text-lg font-bold text-blue-900">
              {getLanguageFlag(language)} {getLanguageName(language)}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-semibold text-purple-800">Availability</span>
            </div>
            <p className="text-sm font-bold text-purple-900">24/7 Service</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">What happens next?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• You'll be connected to a qualified interpreter</li>
            <li>• They will help communicate your symptoms clearly</li>
            <li>• Medical staff will receive accurate information</li>
            <li>• Your privacy and confidentiality are protected</li>
          </ul>
        </div>

        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
            isConnecting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isConnecting ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Connecting to Interpreter...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Phone className="h-5 w-5 mr-2" />
              Connect to Human Interpreter (02 8738 6088)
            </div>
          )}
        </button>

        <div className="mt-4 text-xs text-gray-500">
          <p>Free service • Available 24/7 • Confidential</p>
        </div>
      </div>
    </div>
  );
};
