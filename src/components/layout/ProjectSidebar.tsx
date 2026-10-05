import React, { useState } from 'react';
import { 
  Kanban, 
  Layers, 
  Hash, 
  Volume2, 
  Github, 
  Activity, 
  Users, 
  Settings, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  UserPlus,
  Mic,
  MicOff,
  Headphones,
  FolderGit2,
  Box,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useVoice } from '../../context/VoiceContext';
import { useAuth } from '../../context/AuthContext';
import { APP_CONFIG } from '../../config/appConfig';
import { ActiveTab } from './Sidebar';
import { CreateProjectModal } from '../modals/CreateProjectModal';
import { InviteMemberModal } from '../modals/InviteMemberModal';

interface ProjectSidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCreateChannel?: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateChannel,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { 
    projects,
    activeProject, 
    setActiveProject,
    channels, 
    activeChannel, 
    setActiveChannel, 
    issues, 
    sprints, 
    teamMembers,
    threads 
  } = useWorkspace();

  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const { 
    isJoined, 
    activeVoiceChannel, 
    joinVoiceChannel, 
    participants, 
    isMuted, 
    isDeafened, 
    toggleMute, 
    toggleDeafen 
  } = useVoice();

  const { profile, presence } = useAuth();

  const textChannels = channels.filter((c) => c.type === 'text');
  const voiceChannels = channels.filter((c) => c.type === 'voice');

  if (isCollapsed) {
    return (
      <div className="w-4 bg-slate-900 border-r border-slate-800 relative group flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors"
           onClick={() => setIsCollapsed(false)}>
        <button
          className="absolute left-2 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-30"
          title="Expand Project Sidebar"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-60 bg-slate-900/90 border-r border-slate-800 flex flex-col flex-shrink-0 select-none h-full relative min-w-0">
      {/* Collapse button on right border */}
      <button
        onClick={() => setIsCollapsed(true)}
        className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-slate-800 hover:bg-indigo-600 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center shadow-md transition-all z-20"
        title="Collapse Sidebar"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {/* Project Identity Header (Figma Jira Style) */}
      <div className="relative border-b border-slate-800/80 min-w-0">
        <button
          onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
          className="w-full p-3.5 flex items-center justify-between gap-2.5 hover:bg-slate-800/50 transition-colors text-left min-w-0 cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex-shrink-0">
              <Box className="w-4 h-4" />
            </div>
            <div className="truncate min-w-0 flex-1">
              <h2 className="text-xs font-bold text-slate-100 truncate tracking-tight">
                {activeProject ? activeProject.name : 'Select Project'}
              </h2>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {activeProject ? `${activeProject.key} · Software` : 'No active project'}
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        </button>

        {/* Project Switcher Dropdown */}
        {isProjectMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-slate-900 border-b border-r border-slate-800 shadow-2xl p-2 z-50 text-xs space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Your Projects ({projects.length})
            </div>
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {projects.length === 0 ? (
                <div className="px-2 py-2 text-slate-500 text-[11px]">No projects yet.</div>
              ) : (
                projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveProject(p);
                      setIsProjectMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                      activeProject?.id === p.id
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-black/30">
                      {p.key}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1">
              <button
                onClick={() => {
                  setIsProjectMenuOpen(false);
                  setIsCreateProjectOpen(true);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-indigo-400 hover:bg-indigo-600/10 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Project</span>
              </button>

              {activeProject && (
                <button
                  onClick={() => {
                    setIsProjectMenuOpen(false);
                    setIsInviteOpen(true);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-emerald-400 hover:bg-emerald-600/10 hover:text-emerald-300 font-semibold cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite Project Member</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-5 text-xs">
        
        {/* PLANNING SECTION */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Planning
          </div>
          
          <button
            onClick={() => setActiveTab('board')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'board'
                ? 'bg-indigo-600/20 text-indigo-400 font-semibold border-l-2 border-indigo-500'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Kanban className="w-4 h-4" />
              <span>Kanban Board</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
              {issues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('backlog')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'backlog'
                ? 'bg-indigo-600/20 text-indigo-400 font-semibold border-l-2 border-indigo-500'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4" />
              <span>Backlog & Sprints</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
              {sprints.length}
            </span>
          </button>
        </div>

        {/* THREADS & RISK MANAGEMENT */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Threads & Risk
          </div>

          <button
            onClick={() => setActiveTab('threads')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'threads'
                ? 'bg-indigo-600/20 text-indigo-400 font-semibold border-l-2 border-indigo-500'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Project Threads</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
              {threads.filter(t => t.type !== 'risk').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('risks')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'risks'
                ? 'bg-rose-500/20 text-rose-300 font-semibold border-l-2 border-rose-500'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <div className="flex items-center gap-1.5">
                <span>Risk System</span>
                <span className="text-[9px] font-extrabold px-1 rounded bg-rose-500/20 text-rose-400 uppercase font-mono">
                  RMMM
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950/80 text-rose-300 border border-rose-800/60">
              {threads.filter(t => t.type === 'risk' && t.status === 'unsolved').length}
            </span>
          </button>
        </div>

        {/* CHANNELS SECTION */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Text Channels
            </span>
            {onOpenCreateChannel && (
              <button
                onClick={onOpenCreateChannel}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                title="Create Channel"
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
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all min-w-0 ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 font-semibold border-l-2 border-indigo-500'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                    <Hash className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{chan.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* VOICE SECTION */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Voice Rooms
          </div>

          <div className="space-y-0.5">
            {voiceChannels.map((chan) => {
              const isCurrent = isJoined && activeVoiceChannel?.id === chan.id;
              return (
                <button
                  key={chan.id}
                  onClick={() => {
                    if (!isCurrent) joinVoiceChannel(chan);
                    setActiveTab('voice');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all min-w-0 ${
                    isCurrent
                      ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                    <Volume2 className={`w-3.5 h-3.5 flex-shrink-0 ${isCurrent ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                    <span className="truncate">{chan.name}</span>
                  </div>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 flex-shrink-0 ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CODE & GITHUB */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Development
          </div>

          <button
            onClick={() => setActiveTab('github')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'github'
                ? 'bg-indigo-600/20 text-indigo-400 font-semibold border-l-2 border-indigo-500'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Github className="w-4 h-4" />
              <span>GitHub & Forks</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'activity'
                ? 'bg-indigo-600/20 text-indigo-400 font-semibold border-l-2 border-indigo-500'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4" />
              <span>Activity Stream</span>
            </div>
          </button>
        </div>

        {/* TEAM & WORKSPACE */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Workspace
          </div>

          <button
            onClick={() => setActiveTab('members')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'members'
                ? 'bg-indigo-600/20 text-indigo-400 font-semibold border-l-2 border-indigo-500'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>Team Members</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
              {teamMembers.length}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Mini Presence Dock */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate max-w-[130px]">
          <div className="relative flex-shrink-0">
            <img
              src={profile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt=""
              className="w-7 h-7 rounded-full object-cover border border-slate-700"
            />
            <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-slate-950 ${
              presence?.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'
            }`} />
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-slate-200 truncate leading-none">
              {profile?.displayName || 'Mehul Patel'}
            </div>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">
              {presence?.currentActivity || 'Active'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleMute}
            className={`p-1.5 rounded-lg ${isMuted ? 'text-rose-400' : 'text-slate-400 hover:text-slate-200'}`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={toggleDeafen}
            className={`p-1.5 rounded-lg ${isDeafened ? 'text-rose-400' : 'text-slate-400 hover:text-slate-200'}`}
            title={isDeafened ? 'Undeafen' : 'Deafen'}
          >
            <Headphones className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
