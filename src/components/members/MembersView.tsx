import React, { useState } from 'react';
import { 
  Users, 
  Github, 
  Clock, 
  CheckCircle, 
  Activity, 
  ShieldCheck, 
  Mail, 
  UserPlus, 
  Search,
  ExternalLink
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { PresenceStatus } from '../../types';
import { InviteMemberModal } from '../modals/InviteMemberModal';

export const MembersView: React.FC = () => {
  const { teamMembers, issues } = useWorkspace();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const getStatusBadge = (status?: PresenceStatus) => {
    switch (status) {
      case 'online':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        );
      case 'away':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Away
          </span>
        );
      case 'busy':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Busy
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700/60">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Offline
          </span>
        );
    }
  };

  const filteredMembers = teamMembers.filter((m) =>
    m.displayName.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-slate-950 p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Team Members & Presence</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status indicators, current active tasks, and GitHub fork assignments for all workspace collaborators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members by name or email..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />

      {/* Members Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const assignedCount = issues.filter((i) => i.assigneeId === member.uid).length;
          const completedCount = issues.filter((i) => i.assigneeId === member.uid && i.status === 'done').length;

          return (
            <div
              key={member.uid}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-lg text-xs"
            >
              {/* Member Card Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={member.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${member.uid}`}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ring-2 ring-slate-900 ${
                      member.presence?.status === 'online' ? 'bg-emerald-500' : member.presence?.status === 'away' ? 'bg-amber-500' : 'bg-slate-500'
                    }`} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100">{member.displayName}</div>
                    <div className="text-[11px] text-slate-400 capitalize">{member.role || 'Member'}</div>
                  </div>
                </div>

                {getStatusBadge(member.presence?.status)}
              </div>

              {/* Current Activity Pill */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Current Activity
                </span>
                <div className="text-slate-300 font-medium truncate">
                  {member.presence?.currentActivity || 'Active in ApexFlow'}
                </div>
              </div>

              {/* Tasks & GitHub Overview */}
              <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-800/60">
                <div className="p-2 rounded bg-slate-950/60">
                  <div className="text-base font-bold text-indigo-400 font-mono">{assignedCount}</div>
                  <div className="text-[10px] text-slate-500">Assigned Tasks</div>
                </div>
                <div className="p-2 rounded bg-slate-950/60">
                  <div className="text-base font-bold text-emerald-400 font-mono">{completedCount}</div>
                  <div className="text-[10px] text-slate-500">Shipped / Done</div>
                </div>
              </div>

              {/* GitHub Handle */}
              {member.githubUsername && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Github className="w-3.5 h-3.5 text-slate-400" />
                    <span>github.com/{member.githubUsername}</span>
                  </div>
                  <a
                    href={`https://github.com/${member.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-indigo-400"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
