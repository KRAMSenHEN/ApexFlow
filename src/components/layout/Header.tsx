import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Check, 
  LogOut, 
  Radio, 
  Volume2, 
  MicOff, 
  Headphones, 
  ChevronDown, 
  Users, 
  ExternalLink,
  Sparkles,
  Command
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useVoice } from '../../context/VoiceContext';
import { APP_CONFIG } from '../../config/appConfig';
import { PresenceStatus } from '../../types';

interface HeaderProps {
  onOpenCreateIssue: () => void;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateIssue, onOpenCommandPalette }) => {
  const { profile, presence, updateUserStatus, signOut } = useAuth();
  const { activeProject, notifications, unreadNotificationCount, markNotificationAsRead } = useWorkspace();
  const { isJoined, activeVoiceChannel, leaveVoiceChannel, isSpeaking, isMuted } = useVoice();

  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getStatusColor = (status?: PresenceStatus) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'away': return 'bg-amber-500';
      case 'busy': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-4 flex items-center justify-between z-30 sticky top-0">
      {/* Left: Brand & Active Project */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-sm">
            Δ
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              {APP_CONFIG.name}
            </span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

        {/* Project Selector Badge */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-xs">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          <span className="font-semibold text-slate-200">{activeProject?.name || APP_CONFIG.defaultProjectName}</span>
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] border border-indigo-500/30">
            {activeProject?.key || APP_CONFIG.defaultProjectKey}
          </span>
        </div>
      </div>

      {/* Center: Search & Command Palette Trigger */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
            <span>Search tasks, channels, commits...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700 font-mono flex items-center gap-0.5">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Quick Create Issue Button */}
        <button
          onClick={onOpenCreateIssue}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Create Issue</span>
        </button>

        {/* Live Voice Status Indicator if connected */}
        {isJoined && activeVoiceChannel && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs animate-pulse">
            <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-emerald-300 scale-110' : ''}`} />
            <span className="font-medium hidden lg:inline">{activeVoiceChannel.name}</span>
            <button
              onClick={leaveVoiceChannel}
              className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-[10px] transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-semibold text-xs text-slate-200">Notifications</span>
                <span className="text-[10px] text-slate-400">{notifications.length} recent</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50 mt-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">No new notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer text-xs ${n.read ? 'opacity-60' : 'font-medium'}`}
                    >
                      <div className="text-slate-200">{n.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>



        {/* User Presence Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="relative">
              <img
                src={profile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.uid || 'user'}`}
                alt={profile?.displayName || 'User'}
                className="w-8 h-8 rounded-full border border-slate-700 object-cover"
              />
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${getStatusColor(
                  presence?.status
                )}`}
              />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200 leading-none">
                {profile?.displayName || 'Mehul Patel'}
              </span>
              <span className="text-[10px] text-slate-400 capitalize mt-0.5">
                {presence?.status || 'online'}
              </span>
            </div>
          </button>

          {showStatusMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
              <div className="px-2 py-1.5 text-[11px] text-slate-400 font-medium">Set Presence Status</div>
              <div className="space-y-0.5">
                {(['online', 'away', 'busy', 'offline'] as PresenceStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      updateUserStatus(st);
                      setShowStatusMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-slate-800 text-slate-300 capitalize text-left transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(st)}`} />
                    <span>{st}</span>
                    {presence?.status === st && <Check className="w-3.5 h-3.5 ml-auto text-indigo-400" />}
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    signOut();
                    setShowStatusMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-rose-500/10 text-rose-400 text-left transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
