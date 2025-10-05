// src/components/KillSwitch.tsx
import React from 'react';

interface KillSwitchProps {
  onStop: () => void;
}

const KillSwitch: React.FC<KillSwitchProps> = ({ onStop }) => {
  const handleStop = () => {
    onStop();
    alert('System halted. Please restart to continue.');
  };

  return (
    <button
      onClick={handleStop}
      className="fixed top-4 right-4 z-50 bg-red-600 text-white font-bold text-lg px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
      style={{ minWidth: '120px', minHeight: '50px' }}
      aria-label="Stop system"
    >
      <span className="text-2xl">✋</span>
      <span>STOP</span>
    </button>
  );
};

export default KillSwitch;