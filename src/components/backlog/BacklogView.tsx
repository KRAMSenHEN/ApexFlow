import React, { useState } from 'react';
import { 
  Plus, 
  Play, 
  CheckCircle, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal,
  Bookmark,
  CheckSquare,
  AlertCircle,
  Zap,
  ArrowUpRight,
  Target
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Issue, Sprint, IssueType } from '../../types';

interface BacklogViewProps {
  onSelectIssue: (issue: Issue) => void;
  onOpenCreateIssue: () => void;
}

export const BacklogView: React.FC<BacklogViewProps> = ({ onSelectIssue, onOpenCreateIssue }) => {
  const { 
    issues, 
    sprints, 
    createSprint, 
    startSprint, 
    completeSprint, 
    updateIssue, 
    teamMembers 
  } = useWorkspace();

  const [showNewSprintModal, setShowNewSprintModal] = useState(false);
  const [newSprintName, setNewSprintName] = useState(`Sprint ${sprints.length + 1}`);
  const [newSprintGoal, setNewSprintGoal] = useState('');

  const activeSprint = sprints.find((s) => s.status === 'active');
  const futureSprints = sprints.filter((s) => s.status === 'future');
  const completedSprints = sprints.filter((s) => s.status === 'completed');

  // Issues not in any active/future sprint or specifically marked backlog
  const backlogIssues = issues.filter(
    (i) => !i.sprintId || (!sprints.some((s) => s.id === i.sprintId && s.status !== 'completed'))
  );

  const getTypeIcon = (type: IssueType) => {
    switch (type) {
      case 'story': return <Bookmark className="w-3.5 h-3.5 text-emerald-400" />;
      case 'task': return <CheckSquare className="w-3.5 h-3.5 text-blue-400" />;
      case 'bug': return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
      case 'epic': return <Zap className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprintName.trim()) return;
    await createSprint(newSprintName, newSprintGoal);
    setShowNewSprintModal(false);
    setNewSprintName(`Sprint ${sprints.length + 2}`);
    setNewSprintGoal('');
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto bg-[#0b0f19] p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 min-w-0">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Sprints & Backlog</h1>
          <p className="text-xs text-slate-400 mt-1">
            Plan agile iterations, manage backlog velocity, and assign issues to active sprints.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewSprintModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Create Sprint</span>
          </button>
          <button
            onClick={onOpenCreateIssue}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Issue</span>
          </button>
        </div>
      </div>

      {/* Active Sprint Section */}
      {activeSprint && (
        <div className="rounded-xl border border-indigo-500/30 bg-slate-900/60 overflow-hidden shadow-xl shadow-indigo-950/20">
          <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Active Sprint
                </span>
                <h2 className="text-sm font-bold text-slate-100">{activeSprint.name}</h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  {activeSprint.goal}
                </span>
                {activeSprint.endDate && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Calendar className="w-3 h-3" />
                    Ends {activeSprint.endDate}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => completeSprint(activeSprint.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Complete Sprint</span>
              </button>
            </div>
          </div>

          {/* Issues in active sprint */}
          <div className="divide-y divide-slate-800/60">
            {issues.filter((i) => i.sprintId === activeSprint.id).map((issue) => {
              const assignee = teamMembers.find((m) => m.uid === issue.assigneeId);
              return (
                <div
                  key={issue.id}
                  onClick={() => onSelectIssue(issue)}
                  className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-800/40 cursor-pointer transition-colors text-xs min-w-0"
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0 flex-1">
                    {getTypeIcon(issue.type)}
                    <span className="font-mono text-slate-400 font-semibold flex-shrink-0">{issue.key}</span>
                    <span className="text-slate-200 truncate">{issue.title}</span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-slate-800 text-slate-300">
                      {issue.status.replace('_', ' ')}
                    </span>
                    {issue.storyPoints !== undefined && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                        {issue.storyPoints} pts
                      </span>
                    )}
                    {assignee && (
                      <img
                        src={assignee.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${assignee.uid}`}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover border border-slate-700"
                        title={assignee.displayName}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Future Sprints */}
      {futureSprints.map((sprint) => {
        const sprintIssues = issues.filter((i) => i.sprintId === sprint.id);
        return (
          <div key={sprint.id} className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400">
                    Future Sprint
                  </span>
                  <h3 className="text-sm font-semibold text-slate-200">{sprint.name}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">{sprint.goal || 'No sprint goal set.'}</p>
              </div>

              <button
                onClick={() => startSprint(sprint.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Sprint</span>
              </button>
            </div>

            <div className="divide-y divide-slate-800/60">
              {sprintIssues.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500">Plan issues into this sprint from the backlog below</div>
              ) : (
                sprintIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => onSelectIssue(issue)}
                    className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-800/40 cursor-pointer transition-colors text-xs min-w-0"
                  >
                    <div className="flex items-center gap-2.5 truncate min-w-0 flex-1">
                      {getTypeIcon(issue.type)}
                      <span className="font-mono text-slate-400 font-semibold flex-shrink-0">{issue.key}</span>
                      <span className="text-slate-200 truncate">{issue.title}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}

      {/* Backlog Section */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden">
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-200">Backlog</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-400">
              {backlogIssues.length} issues
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {backlogIssues.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">Backlog is empty. All issues are scheduled!</div>
          ) : (
            backlogIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-800/40 cursor-pointer transition-colors text-xs group min-w-0"
              >
                <div className="flex items-center gap-2.5 truncate min-w-0 flex-1">
                  {getTypeIcon(issue.type)}
                  <span className="font-mono text-slate-400 font-semibold flex-shrink-0">{issue.key}</span>
                  <span className="text-slate-200 truncate">{issue.title}</span>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {activeSprint && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateIssue(issue.id, { sprintId: activeSprint.id });
                      }}
                      className="px-2 py-1 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white text-[11px] transition-colors"
                    >
                      Move to {activeSprint.name}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Create Sprint */}
      {showNewSprintModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">Create New Sprint</h3>
            <form onSubmit={handleCreateSprint} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Sprint Name</label>
                <input
                  type="text"
                  value={newSprintName}
                  onChange={(e) => setNewSprintName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Sprint Goal</label>
                <textarea
                  value={newSprintGoal}
                  onChange={(e) => setNewSprintGoal(e.target.value)}
                  placeholder="What is the team targeting to ship this sprint?"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 h-20 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewSprintModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
                >
                  Create Sprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
