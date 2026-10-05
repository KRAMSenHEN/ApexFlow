import React from 'react';
import { Volume2, Mic, MicOff, Headphones, PhoneOff, Maximize2 } from 'lucide-react';
import { useVoice } from '../../context/VoiceContext';

interface VoiceFloatingBarProps {
  onOpenVoiceTab: () => void;
}

export const VoiceFloatingBar: React.FC<VoiceFloatingBarProps> = ({ onOpenVoiceTab }) => {
  const { 
    isJoined, 
    activeVoiceChannel, 
    isMuted, 
    isDeafened, 
    toggleMute, 
    toggleDeafen, 
    leaveVoiceChannel,
    isSpeaking,
    participants 
  } = useVoice();

  if (!isJoined || !activeVoiceChannel) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4">
      {/* Speaking Indicator & Channel Name */}
      <button 
        onClick={onOpenVoiceTab}
        className="flex items-center gap-2.5 text-left group"
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
          isSpeaking 
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 animate-pulse' 
            : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
        }`}>
          <Volume2 className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5 group-hover:text-indigo-400 transition-colors">
            <span>{activeVoiceChannel.name}</span>
            <Maximize2 className="w-3 h-3 opacity-60" />
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {participants.length} connected {isSpeaking && '• Speaking'}
          </div>
        </div>
      </button>

      <div className="h-6 w-[1px] bg-slate-800" />

      {/* Quick Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleMute}
          className={`p-2 rounded-xl transition-all ${
            isMuted 
              ? 'bg-rose-600 hover:bg-rose-500 text-white' 
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <button
          onClick={toggleDeafen}
          className={`p-2 rounded-xl transition-all ${
            isDeafened 
              ? 'bg-rose-600 hover:bg-rose-500 text-white' 
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title={isDeafened ? 'Undeafen' : 'Deafen'}
        >
          <Headphones className="w-4 h-4" />
        </button>

        <button
          onClick={leaveVoiceChannel}
          className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white transition-all ml-1"
          title="Disconnect Voice"
        >
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
