import React from 'react';
import { 
  Kanban, 
  Layers, 
  Hash, 
  Volume2, 
  GitBranch, 
  Activity, 
  Users, 
  Settings, 
  Plus, 
  ChevronRight,
  Mic,
  MicOff,
  Headphones,
  Radio,
  Github
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useVoice } from '../../context/VoiceContext';
import { useAuth } from '../../context/AuthContext';
import { Channel } from '../../types';

export type ActiveTab = 'board' | 'backlog' | 'chat' | 'threads' | 'risks' | 'voice' | 'github' | 'activity' | 'members';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCreateChannel?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateChannel,
}) => {
  const { 
    channels, 
    activeChannel, 
    setActiveChannel, 
    teamMembers,
    issues,
    sprints,
  } = useWorkspace();

  const { 
    isJoined, 
    activeVoiceChannel, 
    joinVoiceChannel, 
    leaveVoiceChannel, 
    isMuted, 
    isDeafened, 
    toggleMute, 
    toggleDeafen,
    isSpeaking,
    participants 
  } = useVoice();

  const { profile, presence } = useAuth();

  const textChannels = channels.filter((c) => c.type === 'text');
  const voiceChannels = channels.filter((c) => c.type === 'voice');

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/80 flex flex-col flex-shrink-0 select-none h-[calc(100vh-3.5rem)]">
      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        
        {/* SECTION: PLANNING */}
        <div>
          <div className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Planning & Agile
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('board')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'board'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Kanban className="w-4 h-4" />
                <span>Kanban Board</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                activeTab === 'board' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {issues.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('backlog')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'backlog'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" />
                <span>Backlog & Sprints</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                activeTab === 'backlog' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {sprints.length}
              </span>
            </button>
          </div>
        </div>

        {/* SECTION: COLLABORATION - TEXT CHANNELS */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Text Channels
            </span>
            {onOpenCreateChannel && (
              <button
                onClick={onOpenCreateChannel}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Create Text Channel"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="space-y-0.5">
            {textChannels.map((chan) => {
              const isActive = activeTab === 'chat' && activeChannel?.id === chan.id;
              return (
                <button
                  key={chan.id}
                  onClick={() => {
                    setActiveChannel(chan);
                    setActiveTab('chat');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-indigo-400 font-semibold border-l-2 border-indigo-500'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Hash className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{chan.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION: COLLABORATION - VOICE CHANNELS */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Voice Rooms
            </span>
          </div>
          <div className="space-y-1">
            {voiceChannels.map((chan) => {
              const isCurrent = isJoined && activeVoiceChannel?.id === chan.id;
              return (
                <div key={chan.id} className="space-y-1">
                  <button
                    onClick={() => {
                      if (!isCurrent) {
                        joinVoiceChannel(chan);
                      }
                      setActiveTab('voice');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group ${
                      isCurrent
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Volume2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                      <span className="truncate">{chan.name}</span>
                    </div>
                    {isCurrent && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                  </button>

                  {/* If connected to this voice channel, show participant list with speaking indicator */}
                  {isCurrent && participants.length > 0 && (
                    <div className="pl-6 pr-2 py-1 space-y-1">
                      {participants.map((p) => (
                        <div key={p.userId} className="flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full ${p.isSpeaking ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                            <span className="truncate">{p.displayName}</span>
                          </div>
                          {p.isMuted && <MicOff className="w-3 h-3 text-rose-400" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION: ENGINEERING & REPOS */}
        <div>
          <div className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Engineering & Code
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('github')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'github'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Github className="w-4 h-4" />
                <span>GitHub Repos & Forks</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Connected" />
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'activity'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4" />
                <span>Live Activity Feed</span>
              </div>
            </button>
          </div>
        </div>

        {/* SECTION: TEAM & MEMBERS */}
        <div>
          <div className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('members')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'members'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Team Presence Roster</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                {teamMembers.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom User Audio & Activity Bar */}
      <div className="p-2 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate max-w-[140px]">
          <div className="relative flex-shrink-0">
            <img
              src={profile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.uid || 'user'}`}
              alt=""
              className="w-7 h-7 rounded-full object-cover border border-slate-700"
            />
            <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-slate-950 ${
              presence?.status === 'online' ? 'bg-emerald-500' : presence?.status === 'away' ? 'bg-amber-500' : 'bg-slate-500'
            }`} />
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-slate-200 truncate leading-none">
              {profile?.displayName || 'Engineer'}
            </div>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">
              {presence?.currentActivity || 'Active'}
            </div>
          </div>
        </div>

        {/* Quick Audio Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMute}
            className={`p-1.5 rounded-lg transition-colors ${
              isMuted ? 'text-rose-400 hover:bg-rose-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={toggleDeafen}
            className={`p-1.5 rounded-lg transition-colors ${
              isDeafened ? 'text-rose-400 hover:bg-rose-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
            title={isDeafened ? 'Undeafen' : 'Deafen'}
          >
            <Headphones className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
