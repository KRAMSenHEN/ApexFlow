import React, { useState, useEffect } from 'react';
import { Search, Kanban, Layers, Hash, Volume2, Github, Users, X, ArrowRight, MessageSquare, ShieldAlert } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Issue, Channel } from '../../types';
import { ActiveTab } from '../layout/Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIssue: (issue: Issue) => void;
  onSelectTab: (tab: ActiveTab) => void;
  onSelectChannel: (channel: Channel) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectIssue,
  onSelectTab,
  onSelectChannel,
}) => {
  const { issues, channels, teamMembers } = useWorkspace();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredIssues = query
    ? issues.filter(
        (i) => i.title.toLowerCase().includes(query.toLowerCase()) || i.key.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : issues.slice(0, 4);

  const filteredChannels = query
    ? channels.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    : channels.slice(0, 3);

  const filteredMembers = query
    ? teamMembers.filter((m) => m.displayName.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3 border-b border-slate-800 flex items-center gap-3 bg-slate-950/80">
          <Search className="w-4 h-4 text-indigo-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, task key, or channel..."
            className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none text-sm"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          <div>
            <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Quick Navigation
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  onSelectTab('board');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Kanban className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Go to Kanban Board</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  onSelectTab('backlog');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Go to Sprints & Backlog</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  onSelectTab('threads');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Go to Project Threads</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  onSelectTab('risks');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Go to Risk System (RMMM Framework)</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  onSelectTab('github');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Github className="w-3.5 h-3.5 text-indigo-400" />
                  <span>View GitHub Repositories</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Issues */}
          {filteredIssues.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Issues ({filteredIssues.length})
              </div>
              <div className="space-y-0.5">
                {filteredIssues.map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => {
                      onSelectIssue(issue);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-indigo-400 font-bold">{issue.key}</span>
                      <span className="truncate">{issue.title}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold bg-slate-800 text-slate-400 flex-shrink-0">
                      {issue.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Channels */}
          {filteredChannels.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Channels
              </div>
              <div className="space-y-0.5">
                {filteredChannels.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectChannel(c);
                      onSelectTab(c.type === 'voice' ? 'voice' : 'chat');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      {c.type === 'voice' ? (
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Hash className="w-3.5 h-3.5 text-indigo-400" />
                      )}
                      <span>{c.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{c.type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Members */}
          {filteredMembers.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Team Members
              </div>
              <div className="space-y-0.5">
                {filteredMembers.map((m) => (
                  <button
                    key={m.uid}
                    onClick={() => {
                      onSelectTab('members');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.displayName}</span>
                      <span className="text-slate-500">(@{m.githubUsername || 'dev'})</span>
                    </div>
                    <span className="text-[10px] text-emerald-400">{m.presence?.status || 'offline'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
