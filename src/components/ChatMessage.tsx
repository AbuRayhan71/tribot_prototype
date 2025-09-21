import React from 'react';
import { Bot, User, Globe, Activity, AlertCircle, Stethoscope, MessageCircle, Users, Shield } from 'lucide-react';
import { TriageAnalysis } from '../services/openaiService';

interface ChatMessageProps {
  message: {
    id: string;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
    language?: string;
    analysis?: TriageAnalysis;
  };
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const getTriageColor = (level: number): string => {
    switch (level) {
      case 1: return 'text-red-600 bg-red-50 border-red-200';
      case 2: return 'text-orange-600 bg-orange-50 border-orange-200';
      case 3: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 4: return 'text-green-600 bg-green-50 border-green-200';
      case 5: return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTriageDescription = (level: number): string => {
    switch (level) {
      case 1: return 'Immediate (Resuscitation)';
      case 2: return 'Emergency (10 minutes)';
      case 3: return 'Urgent (30 minutes)';
      case 4: return 'Semi-urgent (60 minutes)';
      case 5: return 'Non-urgent (120 minutes)';
      default: return 'Assessment required';
    }
  };

  const isRTL = message.language === 'arabic';

  return (
    <div className={`flex gap-3 md:gap-4 mb-4 md:mb-6 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.type === 'bot' && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
            <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
        </div>
      )}
      
      <div className={`max-w-[85%] md:max-w-3xl ${message.type === 'user' ? 'order-1' : ''}`}>
        <div className={`rounded-2xl px-4 md:px-6 py-3 md:py-4 shadow-lg ${
          message.type === 'user' 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-200' 
            : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 shadow-emerald-100'
        }`}>
          {message.type === 'user' ? (
            <div className={`${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
              {message.language && message.language !== 'english' && (
                <div className="flex items-center gap-2 mb-2 text-purple-100 text-sm">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs md:text-sm capitalize">{message.language}</span>
                </div>
              )}
              <p className="text-white leading-relaxed font-medium text-sm md:text-base">{message.content}</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {/* Conversational Response - Separate from Analysis */}
              {message.analysis?.conversationalResponse ? (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 md:p-5 border-2 border-purple-200 shadow-lg mb-4 md:mb-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <MessageCircle className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-900 mb-2 text-xs md:text-sm">
                        TRIBOT is talking with you
                        {message.analysis?.detectedLanguage !== 'english' && (
                          <span className="ml-2 text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full block sm:inline mt-1 sm:mt-0">
                            {message.analysis.detectedLanguage}
                          </span>
                        )}:
                      </h4>
                      <p className="text-purple-800 leading-relaxed font-medium text-sm md:text-base">{message.analysis.conversationalResponse}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-800 leading-relaxed font-medium text-sm md:text-base">{message.content}</p>
              )}
              
              {/* Clinical Analysis Section - Clearly Separated */}
              {message.analysis && (
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 md:p-5 border-2 border-gray-300 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 md:mb-4 pb-2 md:pb-3 border-b border-gray-300">
                    <Stethoscope className="w-5 h-5 text-gray-600" />
                    <h3 className="font-bold text-gray-800 text-base md:text-lg">Clinical Assessment</h3>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-medium">AI Analysis</span>
                  </div>
                  
                  <div className="space-y-3 md:space-y-4">
                  {/* Language Detection */}
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-3 md:p-4 border-2 border-violet-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Globe className="w-4 h-4 text-violet-600" />
                        <span className="font-semibold text-violet-800 text-xs md:text-sm">Language & Cultural Context:</span>
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <p className="text-violet-700 font-medium text-sm">
                          <span className="font-semibold">Language:</span> {message.analysis.detectedLanguage.charAt(0).toUpperCase() + message.analysis.detectedLanguage.slice(1)}
                        </p>
                        <p className="text-violet-700 text-xs md:text-sm">
                          <span className="font-semibold">Communication Style:</span> {message.analysis.communicationStyle}
                        </p>
                        <p className="text-violet-700 text-xs md:text-sm">
                          <span className="font-semibold">Family Involvement:</span> {message.analysis.familyInvolvement}
                        </p>
                        {message.analysis.religiousConsiderations && (
                          <p className="text-violet-700 text-xs md:text-sm">
                            <span className="font-semibold">Religious Considerations:</span> {message.analysis.religiousConsiderations}
                          </p>
                        )}
                      </div>
                    </div>

                  {/* Translated Summary */}
                  {message.analysis.detectedLanguage !== 'english' && (
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-3 md:p-4 border-2 border-slate-200 shadow-sm">
                    <h4 className="font-semibold text-slate-700 mb-2 text-xs md:text-sm">
                      English Translation for Medical Records:
                    </h4>
                    <p className="text-slate-800 text-xs md:text-sm leading-relaxed font-medium">{message.analysis.translatedText}</p>
                  </div>
                  )}

                  {/* Cultural Considerations */}
                  {message.analysis.culturalConsiderations && message.analysis.culturalConsiderations.length > 0 && (
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-3 md:p-4 border-2 border-teal-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-teal-600" />
                        <span className="font-semibold text-teal-800 text-xs md:text-sm">Cultural Considerations:</span>
                      </div>
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        {message.analysis.culturalConsiderations.map((consideration, index) => (
                          <span
                            key={index}
                            className="px-2 md:px-3 py-1 bg-white text-teal-800 rounded-lg text-xs font-semibold shadow-sm border-2 border-teal-200"
                          >
                            {consideration}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Clinical Indicators */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-3 md:p-4 border-2 border-cyan-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Stethoscope className="w-4 h-4 text-cyan-600" />
                      <span className="font-semibold text-cyan-800 text-xs md:text-sm">Clinical Indicators:</span>
                    </div>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {message.analysis.clinicalIndicators.map((indicator, index) => (
                        <span
                          key={index}
                          className="px-2 md:px-3 py-1 bg-white text-cyan-800 rounded-lg text-xs font-semibold shadow-sm border-2 border-cyan-200"
                        >
                          {indicator}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Triage Level */}
                  <div className={`rounded-xl p-3 md:p-4 border-2 shadow-lg ${getTriageColor(message.analysis.triageLevel)}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-bold text-xs md:text-sm">AI-Suggested Triage Level:</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xl md:text-2xl font-bold">ATS {message.analysis.triageLevel}</span>
                        <span className="ml-2 md:ml-3 text-base md:text-lg font-semibold block sm:inline">
                          {getTriageDescription(message.analysis.triageLevel)}
                        </span>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-xs opacity-75 font-medium">AI Confidence</div>
                        <div className="text-lg md:text-xl font-bold">{message.analysis.confidence}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Follow-up Questions */}
                  {message.analysis.followUpQuestions && message.analysis.followUpQuestions.length > 0 && !message.analysis.isFinalAssessment && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 md:p-4 border-2 border-blue-200 shadow-sm">
                      <h4 className="font-semibold text-blue-800 mb-3 text-xs md:text-sm flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Questions I asked in our conversation:
                      </h4>
                      <div className="space-y-1 md:space-y-2">
                        {message.analysis.followUpQuestions.map((question, index) => (
                          <div key={index} className="flex items-start gap-2 text-blue-700 text-xs md:text-sm bg-white/50 rounded-lg p-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span className="font-medium">{question}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fallback Mechanism Status */}
                  {message.analysis.fallbackMechanism && message.analysis.fallbackMechanism.isActivated && (
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 md:p-4 border-2 border-orange-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-orange-600" />
                        <span className="font-semibold text-orange-800 text-xs md:text-sm">Cultural Adaptation Active:</span>
                      </div>
                      <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                        <p className="text-orange-700 text-xs md:text-sm">
                          <span className="font-semibold">Reason:</span> {message.analysis.fallbackMechanism.reason}
                        </p>
                        <p className="text-orange-700 text-xs md:text-sm">
                          <span className="font-semibold">Approach:</span> {message.analysis.fallbackMechanism.alternativeApproach}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Clinical Explanation */}
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 p-3 md:p-4 rounded-r-xl shadow-sm">
                    <h4 className="font-semibold text-amber-800 mb-2 text-xs md:text-sm">Clinical Reasoning:</h4>
                    <p className="text-amber-700 text-xs md:text-sm leading-relaxed font-medium">{message.analysis.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className={`mt-2 text-xs text-gray-500 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {message.type === 'user' && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
            <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};