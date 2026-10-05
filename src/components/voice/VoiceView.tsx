import React, { useRef, useEffect } from 'react';
import { 
  Volume2, 
  Mic, 
  MicOff, 
  Headphones, 
  Video, 
  VideoOff, 
  Monitor, 
  PhoneOff, 
  Users, 
  Radio, 
  ShieldCheck,
  Signal
} from 'lucide-react';
import { useVoice } from '../../context/VoiceContext';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';

export const VoiceView: React.FC = () => {
  const { 
    activeVoiceChannel, 
    participants, 
    isJoined, 
    isMuted, 
    isDeafened, 
    isCameraOn, 
    isScreenSharing, 
    isSpeaking, 
    speakingLevel, 
    localStream, 
    screenStream,
    toggleMute, 
    toggleDeafen, 
    toggleCamera, 
    toggleScreenShare, 
    leaveVoiceChannel 
  } = useVoice();

  const { profile } = useAuth();
  const { channels } = useWorkspace();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  // Bind video stream to DOM video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isCameraOn]);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream, isScreenSharing]);

  if (!activeVoiceChannel || !isJoined) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-xl shadow-indigo-950/20">
          <Volume2 className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-100">No Active Voice Channel</h2>
        <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6">
          Connect to a voice room from the left sidebar to start audio and video communication.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-950">
      {/* Top Header */}
      <div className="h-14 px-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 leading-none">{activeVoiceChannel.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Signal className="w-3 h-3 text-emerald-400" /> WebRTC Connected
              </span>
              <span>•</span>
              <span>{participants.length} connected</span>
            </div>
          </div>
        </div>

        {/* Live Speaking Level Meter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Mic Level</span>
          <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden flex items-center">
            <div
              className={`h-full transition-all duration-75 ${
                isMuted ? 'bg-rose-500 w-0' : isSpeaking ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-indigo-500'
              }`}
              style={{ width: `${isMuted ? 0 : Math.max(8, speakingLevel)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Screen Share / Video / Audio Tiles */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center gap-6">
        
        {/* Screen Share Tile if active */}
        {isScreenSharing && (
          <div className="w-full max-w-4xl aspect-video rounded-2xl bg-black border border-indigo-500/40 overflow-hidden relative shadow-2xl">
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5 text-indigo-400" />
              <span>Screen Share — {profile?.displayName}</span>
            </div>
          </div>
        )}

        {/* Participant Video/Audio Grid */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {participants.map((p) => {
            const isMe = p.userId === profile?.uid;
            return (
              <div
                key={p.userId}
                className={`aspect-video rounded-xl bg-slate-900/80 border p-4 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200 ${
                  (isMe ? isSpeaking : p.isSpeaking)
                    ? 'border-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800'
                }`}
              >
                {/* Camera Feed or Avatar */}
                {isMe && isCameraOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <img
                        src={p.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.userId}`}
                        alt=""
                        className={`w-16 h-16 rounded-full object-cover border-2 transition-all ${
                          (isMe ? isSpeaking : p.isSpeaking)
                            ? 'border-emerald-400 scale-105 shadow-xl shadow-emerald-400/40'
                            : 'border-slate-700'
                        }`}
                      />
                      {(isMe ? isSpeaking : p.isSpeaking) && (
                        <div className="absolute -inset-1.5 rounded-full border-2 border-emerald-400/60 animate-ping" />
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom Participant Bar */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-xs">
                  <span className="font-semibold text-slate-200 truncate">{p.displayName}</span>
                  <div className="flex items-center gap-1.5">
                    {(isMe ? isMuted : p.isMuted) ? (
                      <MicOff className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Mic className={`w-3.5 h-3.5 ${(isMe ? isSpeaking : p.isSpeaking) ? 'text-emerald-400' : 'text-slate-400'}`} />
                    )}
                    {(isMe ? isDeafened : p.isDeafened) && (
                      <Headphones className="w-3.5 h-3.5 text-rose-400" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Voice Controls Dock */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-center gap-3">
        {/* Mute */}
        <button
          onClick={toggleMute}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md active:scale-95 ${
            isMuted
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>{isMuted ? 'Muted' : 'Mute'}</span>
        </button>

        {/* Deafen */}
        <button
          onClick={toggleDeafen}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md active:scale-95 ${
            isDeafened
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>{isDeafened ? 'Deafened' : 'Deafen'}</span>
        </button>

        {/* Video / Camera */}
        <button
          onClick={toggleCamera}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md active:scale-95 ${
            isCameraOn
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          <span>{isCameraOn ? 'Stop Video' : 'Video'}</span>
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md active:scale-95 ${
            isScreenSharing
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
        </button>

        {/* Disconnect */}
        <button
          onClick={leaveVoiceChannel}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/25 transition-all active:scale-95 ml-2"
        >
          <PhoneOff className="w-4 h-4" />
          <span>Disconnect</span>
        </button>
      </div>
    </div>
  );
};
