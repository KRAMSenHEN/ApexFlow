import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Bell, 
  LogOut, 
  Check, 
  Shield,
  Command
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { APP_CONFIG } from '../../config/appConfig';
import { PresenceStatus } from '../../types';

interface GlobalNavbarProps {
  onOpenCreateIssue: () => void;
  onOpenCommandPalette: () => void;
}

export const GlobalNavbar: React.FC<GlobalNavbarProps> = ({
  onOpenCreateIssue,
  onOpenCommandPalette,
}) => {
  const { profile, presence, currentUser, signOut, updateUserStatus } = useAuth();
  const { notifications, unreadNotificationCount, markNotificationAsRead, activeProject } = useWorkspace();

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
    <nav className="w-14 bg-[#0747A6] hover:bg-[#0747A6] flex flex-col items-center justify-between py-3 flex-shrink-0 z-40 select-none shadow-xl border-r border-[#003882]">
      {/* Top Section: Logo & Quick Actions */}
      <div className="flex flex-col items-center gap-3">
        {/* Brand Icon */}
        <div 
          className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-extrabold text-base cursor-pointer shadow-md transition-all active:scale-95"
          title={APP_CONFIG.name}
        >
          Δ
        </div>

        <div className="w-6 h-[1px] bg-blue-300/20 my-1" />

        {/* Global Search (⌘K) */}
        <button
          onClick={onOpenCommandPalette}
          className="p-2.5 rounded-xl text-blue-100 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
          title="Search issues, channels (⌘K)"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Quick Create Issue (+) */}
        {activeProject && (
          <button
            onClick={onOpenCreateIssue}
            className="w-8 h-8 rounded-full bg-white text-[#0747A6] hover:bg-blue-50 flex items-center justify-center shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Create Issue"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Bottom Section: Notifications, Presence & Sign Out */}
      <div className="flex flex-col items-center gap-3">
        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-blue-100 hover:text-white hover:bg-white/15 transition-all relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-[#0747A6] animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute left-full bottom-0 ml-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-slate-100">Notifications</span>
                <span className="text-[10px] text-slate-400">{notifications.length} recent</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50 mt-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-slate-500">No new notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className="p-2 hover:bg-slate-800/60 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="font-semibold text-slate-200">{n.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar with Presence Ring and Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="relative p-0.5 rounded-full hover:ring-2 hover:ring-white/40 transition-all cursor-pointer"
            title={`${profile?.displayName || currentUser?.email || 'User'} (${presence?.status || 'online'})`}
          >
            <img
              src={profile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.uid || 'user'}`}
              alt=""
              className="w-8 h-8 rounded-full object-cover border border-white/20"
            />
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#0747A6] ${getStatusColor(
                presence?.status
              )}`}
            />
          </button>

          {showStatusMenu && (
            <div className="absolute left-full bottom-0 ml-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2.5 z-50 text-xs space-y-2">
              {/* Profile summary */}
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                <div className="font-bold text-slate-100 truncate">
                  {profile?.displayName || currentUser?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {currentUser?.email}
                </div>
              </div>

              {/* Set Presence Status */}
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Set Live Presence
              </div>
              <div className="space-y-1">
                {(['online', 'away', 'busy'] as PresenceStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      updateUserStatus(st);
                      setShowStatusMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left capitalize transition-colors ${
                      presence?.status === st
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(st)}`} />
                      <span>{st}</span>
                    </div>
                    {presence?.status === st && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>

              {/* Sign Out CTA */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    signOut();
                    setShowStatusMenu(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
