import React from 'react';
import { 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  GitCommit, 
  GitPullRequest, 
  UserPlus, 
  Volume2, 
  Clock 
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ActivityFeedItem } from '../../types';

export const ActivityFeedView: React.FC = () => {
  const { activities } = useWorkspace();

  const getEventIcon = (type: ActivityFeedItem['type']) => {
    switch (type) {
      case 'task_created':
        return <Activity className="w-4 h-4 text-indigo-400" />;
      case 'task_moved':
        return <ArrowRight className="w-4 h-4 text-blue-400" />;
      case 'task_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'comment_added':
        return <MessageSquare className="w-4 h-4 text-amber-400" />;
      case 'code_pushed':
        return <GitCommit className="w-4 h-4 text-cyan-400" />;
      case 'pr_opened':
      case 'pr_updated':
        return <GitPullRequest className="w-4 h-4 text-purple-400" />;
      case 'call_joined':
        return <Volume2 className="w-4 h-4 text-emerald-400" />;
      case 'member_joined':
        return <UserPlus className="w-4 h-4 text-slate-300" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-slate-950 p-6 space-y-6">
      {/* Top Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">Live Workspace Activity</h1>
        <p className="text-xs text-slate-400 mt-1">
          Chronological audit trail of all project events, task lifecycle changes, code pushes, and team communication.
        </p>
      </div>

      {/* Activity Timeline */}
      <div className="max-w-3xl space-y-4">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 rounded-xl border border-slate-800">
            No activity recorded yet. As you create tasks, move items, comment, and push code, updates will stream live here!
          </div>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3.5 hover:border-slate-700 transition-colors text-xs"
            >
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0 mt-0.5">
                {getEventIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{item.userName}</span>
                  <span className="text-slate-400">{item.message}</span>
                </div>

                {item.issueKey && (
                  <div className="text-[11px] text-slate-500 font-mono">
                    Target: <span className="text-indigo-400">{item.issueKey}</span>
                    {item.issueTitle && <span> — {item.issueTitle}</span>}
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 font-mono flex-shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-600" />
                <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
