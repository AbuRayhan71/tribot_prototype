// src/components/ConsentForm.tsx
import React, { useState } from 'react';

interface ConsentFormProps {
  onConsent: (consented: boolean) => void;
}

const ConsentForm: React.FC<ConsentFormProps> = ({ onConsent }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = () => {
    const audio = new Audio('/consent.mp3'); // Add audio file to public folder
    audio.play();
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Digital Consent Form</h2>
        <div className="mb-4">
          <p className="text-sm mb-2">
            By using TRIBOT, you consent to the collection and processing of your data for medical triage purposes. 
            This includ symptom analysis, cultural consideesrations, and emergency response coordination.
          </p>
          <button
            onClick={handlePlayAudio}
            disabled={isPlaying}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isPlaying ? 'Playing Audio...' : 'Listen to Audio'}
          </button>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => onConsent(true)}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            Yes, I Consent
          </button>
          <button
            onClick={() => onConsent(false)}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
          >
            No, I Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentForm;