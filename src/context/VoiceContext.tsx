import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { doc, setDoc, deleteDoc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { Channel, VoiceParticipant } from '../types';

interface VoiceContextType {
  activeVoiceChannel: Channel | null;
  participants: VoiceParticipant[];
  isJoined: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  speakingLevel: number;
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  joinVoiceChannel: (channel: Channel) => Promise<void>;
  leaveVoiceChannel: () => Promise<void>;
  toggleMute: () => void;
  toggleDeafen: () => void;
  toggleCamera: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, currentUser, setCurrentActivity } = useAuth();

  const [activeVoiceChannel, setActiveVoiceChannel] = useState<Channel | null>(null);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingLevel, setSpeakingLevel] = useState(0);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  // Clean up streams & audio context
  const cleanupMedia = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    localStream?.getTracks().forEach((track) => track.stop());
    screenStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setScreenStream(null);
    setIsSpeaking(false);
    setSpeakingLevel(0);
  }, [localStream, screenStream]);

  // Audio level analyzer loop
  const setupAudioAnalysis = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setSpeakingLevel(normalized);
        setIsSpeaking(normalized > 14 && !isMuted);

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn('Audio analysis initialization note:', err);
    }
  }, [isMuted]);

  // Join voice channel
  const joinVoiceChannel = async (channel: Channel) => {
    try {
      setActiveVoiceChannel(channel);
      setIsJoined(true);
      await setCurrentActivity(`In Voice: #${channel.name}`);

      // Request actual microphone media stream
      let stream: MediaStream | null = null;
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
            video: false,
          });
          setLocalStream(stream);
          setupAudioAnalysis(stream);
        }
      } catch (mediaErr) {
        console.warn('Microphone permission info: Operating with default virtual audio node in preview mode', mediaErr);
      }

      // Register presence in Firestore call room
      const uid = profile?.uid || currentUser?.uid || `anon-${Date.now()}`;
      const participantRef = doc(db, 'calls', channel.id, 'peers', uid);
      const participantData: VoiceParticipant = {
        userId: uid,
        displayName: profile?.displayName || 'Engineer',
        photoURL: profile?.photoURL || '',
        isMuted: false,
        isDeafened: false,
        isCameraOn: false,
        isScreenSharing: false,
        isSpeaking: false,
        joinedAt: new Date().toISOString(),
      };
      await setDoc(participantRef, participantData);
    } catch (err) {
      console.error('Failed to join voice channel:', err);
    }
  };

  // Leave voice channel
  const leaveVoiceChannel = async () => {
    if (!activeVoiceChannel) return;
    const uid = profile?.uid || currentUser?.uid;
    const channelId = activeVoiceChannel.id;

    cleanupMedia();
    setIsJoined(false);
    setActiveVoiceChannel(null);
    setIsCameraOn(false);
    setIsScreenSharing(false);
    await setCurrentActivity('Active in ApexFlow');

    if (uid) {
      try {
        const participantRef = doc(db, 'calls', channelId, 'peers', uid);
        await deleteDoc(participantRef);
      } catch (e) {
        // ignore
      }
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
    }
    // Update participant record in Firestore
    if (activeVoiceChannel && (profile?.uid || currentUser?.uid)) {
      const uid = profile?.uid || currentUser?.uid;
      setDoc(doc(db, 'calls', activeVoiceChannel.id, 'peers', uid!), { isMuted: nextMuted }, { merge: true });
    }
  };

  // Toggle Deafen
  const toggleDeafen = () => {
    const nextDeaf = !isDeafened;
    setIsDeafened(nextDeaf);
    if (nextDeaf && !isMuted) {
      toggleMute();
    }
    if (activeVoiceChannel && (profile?.uid || currentUser?.uid)) {
      const uid = profile?.uid || currentUser?.uid;
      setDoc(doc(db, 'calls', activeVoiceChannel.id, 'peers', uid!), { isDeafened: nextDeaf }, { merge: true });
    }
  };

  // Toggle Camera
  const toggleCamera = async () => {
    if (!isJoined) return;
    if (isCameraOn) {
      // Turn off
      localStream?.getVideoTracks().forEach((t) => t.stop());
      setIsCameraOn(false);
      if (activeVoiceChannel && (profile?.uid || currentUser?.uid)) {
        const uid = profile?.uid || currentUser?.uid;
        setDoc(doc(db, 'calls', activeVoiceChannel.id, 'peers', uid!), { isCameraOn: false }, { merge: true });
      }
    } else {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = videoStream.getVideoTracks()[0];
        if (localStream) {
          localStream.addTrack(videoTrack);
        } else {
          setLocalStream(videoStream);
        }
        setIsCameraOn(true);
        if (activeVoiceChannel && (profile?.uid || currentUser?.uid)) {
          const uid = profile?.uid || currentUser?.uid;
          setDoc(doc(db, 'calls', activeVoiceChannel.id, 'peers', uid!), { isCameraOn: true }, { merge: true });
        }
      } catch (err) {
        console.warn('Camera access could not be acquired:', err);
      }
    }
  };

  // Toggle Screen Share
  const toggleScreenShare = async () => {
    if (!isJoined) return;
    if (isScreenSharing) {
      screenStream?.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      if (activeVoiceChannel && (profile?.uid || currentUser?.uid)) {
        const uid = profile?.uid || currentUser?.uid;
        setDoc(doc(db, 'calls', activeVoiceChannel.id, 'peers', uid!), { isScreenSharing: false }, { merge: true });
      }
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
          setScreenStream(screen);
          setIsScreenSharing(true);
          screen.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
            setScreenStream(null);
          };
          if (activeVoiceChannel && (profile?.uid || currentUser?.uid)) {
            const uid = profile?.uid || currentUser?.uid;
            setDoc(doc(db, 'calls', activeVoiceChannel.id, 'peers', uid!), { isScreenSharing: true }, { merge: true });
          }
        }
      } catch (err) {
        console.warn('Screen sharing cancelled or unavailable:', err);
      }
    }
  };

  // Sync isSpeaking to Firestore for other peers to see wave ring
  useEffect(() => {
    if (activeVoiceChannel && (profile?.uid || currentUser?.uid)) {
      const uid = profile?.uid || currentUser?.uid;
      setDoc(doc(db, 'calls', activeVoiceChannel.id, 'peers', uid!), { isSpeaking }, { merge: true }).catch(() => {});
    }
  }, [isSpeaking, activeVoiceChannel, profile?.uid, currentUser?.uid]);

  // Listen to participants in active voice channel
  useEffect(() => {
    if (!activeVoiceChannel) {
      setParticipants([]);
      return;
    }

    const unsub = onSnapshot(collection(db, 'calls', activeVoiceChannel.id, 'peers'), (snap) => {
      const list: VoiceParticipant[] = [];
      snap.forEach((d) => {
        list.push({ ...d.data() } as VoiceParticipant);
      });
      setParticipants(list);
    });

    return () => unsub();
  }, [activeVoiceChannel]);

  return (
    <VoiceContext.Provider
      value={{
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
        joinVoiceChannel,
        leaveVoiceChannel,
        toggleMute,
        toggleDeafen,
        toggleCamera,
        toggleScreenShare,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) throw new Error('useVoice must be used within a VoiceProvider');
  return context;
};
