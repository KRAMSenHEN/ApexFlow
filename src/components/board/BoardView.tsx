import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  GitBranch, 
  GitPullRequest, 
  Bookmark, 
  CheckSquare, 
  AlertCircle, 
  Zap, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  ExternalLink,
  Github,
  CheckCircle,
  X
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { Issue, IssueStatus, IssueType, IssuePriority } from '../../types';
import { APP_CONFIG } from '../../config/appConfig';

interface BoardViewProps {
  onSelectIssue: (issue: Issue) => void;
  onOpenCreateIssue: (defaultStatus?: IssueStatus) => void;
}

const COLUMNS: { id: IssueStatus; label: string; bg: string }[] = [
  { id: 'backlog', label: 'BACKLOG', bg: 'bg-slate-900/60' },
  { id: 'todo', label: 'TO DO', bg: 'bg-slate-900/60' },
  { id: 'in_progress', label: 'IN PROGRESS', bg: 'bg-slate-900/60' },
  { id: 'in_review', label: 'IN REVIEW', bg: 'bg-slate-900/60' },
  { id: 'done', label: 'DONE', bg: 'bg-slate-900/60' },
];

export const BoardView: React.FC<BoardViewProps> = ({ onSelectIssue, onOpenCreateIssue }) => {
  const { 
    issues, 
    moveIssueStatus, 
    activeSprint, 
    completeSprint, 
    teamMembers, 
    activeProject 
  } = useWorkspace();
  const { profile } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [onlyMyIssues, setOnlyMyIssues] = useState(false);
  const [recentlyUpdated, setRecentlyUpdated] = useState(false);

  // Filter issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = issue.title.toLowerCase().includes(q);
        const matchKey = issue.key.toLowerCase().includes(q);
        if (!matchTitle && !matchKey) return false;
      }
      if (onlyMyIssues) {
        if (issue.assigneeId !== profile?.uid) return false;
      } else if (selectedAssignee) {
        if (issue.assigneeId !== selectedAssignee) return false;
      }
      if (recentlyUpdated) {
        const diffHours = (Date.now() - new Date(issue.updatedAt || issue.createdAt).getTime()) / 3600000;
        if (diffHours > 24) return false;
      }
      return true;
    });
  }, [issues, searchQuery, selectedAssignee, onlyMyIssues, recentlyUpdated, profile?.uid]);

  const getTypeIcon = (type: IssueType) => {
    switch (type) {
      case 'story':
        return (
          <div className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center" title="Story">
            <Bookmark className="w-3 h-3 fill-current" />
          </div>
        );
      case 'task':
        return (
          <div className="w-4 h-4 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center" title="Task">
            <CheckSquare className="w-3 h-3" />
          </div>
        );
      case 'bug':
        return (
          <div className="w-4 h-4 rounded bg-rose-500/20 text-rose-400 flex items-center justify-center" title="Bug">
            <AlertCircle className="w-3 h-3 fill-current" />
          </div>
        );
      case 'epic':
        return (
          <div className="w-4 h-4 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center" title="Epic">
            <Zap className="w-3 h-3 fill-current" />
          </div>
        );
    }
  };

  const getPriorityIcon = (priority: IssuePriority) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return (
          <span title="High Priority">
            <ArrowUp className="w-3.5 h-3.5 text-rose-400" />
          </span>
        );
      case 'medium':
        return (
          <span title="Medium Priority">
            <Minus className="w-3.5 h-3.5 text-amber-400" />
          </span>
        );
      case 'low':
        return (
          <span title="Low Priority">
            <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
          </span>
        );
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedAssignee(null);
    setOnlyMyIssues(false);
    setRecentlyUpdated(false);
  };

  const hasActiveFilters = searchQuery || selectedAssignee || onlyMyIssues || recentlyUpdated;

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-[#0b0f19]">
      {/* Top Figma Jira Breadcrumb & Header */}
      <div className="px-8 pt-6 pb-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-2">
          <span>Projects</span>
          <span>/</span>
          <span className="text-slate-300 font-semibold">{activeProject?.name || APP_CONFIG.defaultProjectName}</span>
          <span>/</span>
          <span className="text-indigo-400 font-semibold">Kanban board</span>
        </div>

        {/* Title & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              {activeSprint?.name || 'Kanban Board'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeSprint?.goal || 'Sprint backlog, work-in-progress limits, and real-time task progression.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="https://github.com/apexflow-hq/platform-core"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Repo</span>
            </a>

            {activeSprint && (
              <button
                onClick={() => completeSprint(activeSprint.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Complete Sprint</span>
              </button>
            )}

            <button
              onClick={() => onOpenCreateIssue('todo')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Issue</span>
            </button>
          </div>
        </div>

        {/* Figma Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mt-5 text-xs">
          {/* Search box */}
          <div className="relative w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Member Avatar circle filters (Figma Jira style) */}
          <div className="flex items-center -space-x-1.5">
            {teamMembers.slice(0, 5).map((member) => {
              const isSelected = selectedAssignee === member.uid;
              return (
                <button
                  key={member.uid}
                  onClick={() => {
                    setSelectedAssignee(isSelected ? null : member.uid);
                    setOnlyMyIssues(false);
                  }}
                  className={`relative p-0.5 rounded-full transition-transform hover:scale-110 hover:z-20 cursor-pointer ${
                    isSelected ? 'ring-2 ring-indigo-500 z-10' : 'ring-1 ring-slate-800'
                  }`}
                  title={`Filter by ${member.displayName}`}
                >
                  <img
                    src={member.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${member.uid}`}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-slate-900 ${
                      member.presence?.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* "Only my issues" toggle */}
          <button
            onClick={() => {
              setOnlyMyIssues(!onlyMyIssues);
              setSelectedAssignee(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              onlyMyIssues
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Only my issues
          </button>

          {/* "Recently updated" toggle */}
          <button
            onClick={() => setRecentlyUpdated(!recentlyUpdated)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              recentlyUpdated
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Recently updated
          </button>

          {/* Clear Filters Link */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 pl-2 border-l border-slate-800"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Kanban Board Columns Stage */}
      <div className="flex-1 min-w-0 overflow-x-auto px-4 sm:px-8 pb-8 flex gap-4 items-start select-none">
        {COLUMNS.map((col) => {
          const colIssues = filteredIssues.filter((i) => i.status === col.id);

          return (
            <div
              key={col.id}
              className="w-72 flex-shrink-0 flex flex-col max-h-full rounded-2xl bg-slate-900/50 border border-slate-800/80 overflow-hidden"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const issueId = e.dataTransfer.getData('text/plain');
                if (issueId) moveIssueStatus(issueId, col.id);
              }}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[11px] text-slate-400 tracking-wider">
                    {col.label}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] font-semibold">
                    {colIssues.length}
                  </span>
                </div>

                <button
                  onClick={() => onOpenCreateIssue(col.id)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  title={`Create issue in ${col.label}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Column Issue Cards List */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                {colIssues.map((issue) => {
                  const assignee = teamMembers.find((m) => m.uid === issue.assigneeId);

                  return (
                    <div
                      key={issue.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', issue.id)}
                      onClick={() => onSelectIssue(issue)}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-black/20 cursor-pointer transition-all space-y-2.5 group"
                    >
                      {/* Issue Title */}
                      <p className="text-xs font-medium text-slate-100 leading-snug break-words">
                        {issue.title}
                      </p>

                      {/* GitHub Branch/PR Pill */}
                      {issue.branchName && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono">
                          <GitBranch className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                          <span className="truncate">{issue.branchName}</span>
                          {issue.prNumber && (
                            <span className="ml-auto text-emerald-400 font-semibold flex items-center gap-0.5">
                              <GitPullRequest className="w-2.5 h-2.5" />
                              #{issue.prNumber}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Card Footer: Type, Key, Priority, Assignee */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <div className="flex items-center gap-1.5">
                          {getTypeIcon(issue.type)}
                          <span className="font-mono text-[11px] font-semibold text-slate-400 group-hover:text-indigo-400 transition-colors">
                            {issue.key}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {getPriorityIcon(issue.priority)}

                          {assignee ? (
                            <div className="relative">
                              <img
                                src={assignee.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${assignee.uid}`}
                                alt=""
                                className="w-5 h-5 rounded-full object-cover border border-slate-700"
                                title={assignee.displayName}
                              />
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ring-1 ring-slate-900 ${
                                  assignee.presence?.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'
                                }`}
                              />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-500">
                              ?
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
