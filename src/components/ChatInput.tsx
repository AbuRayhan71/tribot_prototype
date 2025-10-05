import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Square } from 'lucide-react';
import { whisperService } from '../services/whisperService';

interface ChatInputProps {
  onSendMessage: (message: string, language: string) => void;
  isLoading: boolean;
  language: string;
  onLanguageChange: (language: string) => void;
  isDisabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  language,
  isDisabled = false}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getPlaceholderText = (language: string): string => {
    const placeholders: { [key: string]: string } = {
      'english': 'How are you feeling?',
      'arabic': 'كيف تشعر؟',
      'bangla': 'আপনি কেমন অনুভব করছেন?',
      'tamil': 'நீங்கள் எப்படி உணர்கிறீர்கள்?',
      'hindi': 'आप कैसा महसूस कर रहे हैं?'
    };
    return placeholders[language] || placeholders['english'];
  };

  const isRTLLanguage = (language: string): boolean => {
    return language === 'arabic';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    if (!whisperService.isConfigured()) {
      alert('Voice transcription is not configured. Please check your Whisper API credentials.');
      return;
    }

    setIsTranscribing(true);
    
    try {
      const transcription = await whisperService.transcribeAudio(audioBlob);
      
      if (transcription.text.trim()) {
        setMessage(transcription.text.trim());
      } else {
        alert('No speech detected. Please try speaking more clearly.');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to transcribe audio';
      alert(`Voice transcription failed: ${errorMessage}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    onSendMessage(message.trim(), language);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div>
      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholderText(language)}
            className="w-full px-4 py-3 md:py-4 pr-12 md:pr-14 border border-gray-200 rounded-2xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none bg-white min-h-[48px] md:min-h-[56px] max-h-32 text-gray-800 placeholder-gray-400 text-sm md:text-base"
            dir={isRTLLanguage(language) ? 'rtl' : 'ltr'}
            rows={1}
            disabled={isLoading || isTranscribing || isDisabled}
          />
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`absolute top-1/2 transform -translate-y-1/2 ${isRTLLanguage(language) ? 'left-3 md:left-4' : 'right-3 md:right-4'} p-1.5 md:p-2 rounded-full transition-all duration-200 ${
              isRecording 
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg' 
                : isTranscribing
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isRecording ? "Stop recording" : isTranscribing ? "Transcribing..." : "Voice input"}
            disabled={isLoading || isTranscribing || isDisabled}
          >
            {isRecording ? <Square size={16} className="md:w-[18px] md:h-[18px]" /> : <Mic size={16} className="md:w-[18px] md:h-[18px]" />}
          </button>
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || isLoading || isTranscribing || isDisabled}
          className="p-3 md:p-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl min-w-[48px] md:min-w-[56px]"
          title="Send message"
        >
          <Send size={18} className="md:w-5 md:h-5" />
        </button>
      </form>

      {/* Voice Input Status */}
      <div className="mt-2 md:mt-3 flex items-center gap-2 text-xs text-gray-500">
        <Mic className="w-3 h-3" />
        <span>Voice input • Secure & Private</span>
        
        {isRecording && (
          <div className="flex items-center gap-2 text-red-600 ml-2 md:ml-4">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
            <span className="font-medium">Recording...</span>
          </div>
        )}
        
        {isTranscribing && (
          <div className="flex items-center gap-2 text-blue-600 ml-2 md:ml-4">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span className="font-medium">Transcribing...</span>
          </div>
        )}
      </div>
    </div>
  );
};