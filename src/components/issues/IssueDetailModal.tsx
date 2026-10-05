import React, { useState, useEffect } from 'react';
import { 
  X, 
  GitBranch, 
  GitPullRequest, 
  GitCommit, 
  Clock, 
  Send, 
  Trash2, 
  Calendar, 
  Tag, 
  User as UserIcon,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  History,
  Activity as ActivityIcon,
  Github
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { Issue, Comment, IssueStatus, IssuePriority, IssueType } from '../../types';
import { APP_CONFIG } from '../../config/appConfig';

interface IssueDetailModalProps {
  issue: Issue | null;
  onClose: () => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({ issue, onClose }) => {
  const { 
    updateIssue, 
    deleteIssue, 
    addComment, 
    teamMembers, 
    sprints, 
    githubActivities,
    githubConnection 
  } = useWorkspace();
  const { profile, setCurrentActivity } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<IssueStatus>('todo');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [type, setType] = useState<IssueType>('story');
  const [assigneeId, setAssigneeId] = useState('');
  const [sprintId, setSprintId] = useState('');
  const [storyPoints, setStoryPoints] = useState<number>(3);
  const [dueDate, setDueDate] = useState('');
  const [branchName, setBranchName] = useState('');
  const [prNumber, setPrNumber] = useState<number | ''>('');
  const [forkName, setForkName] = useState('');

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'github' | 'history'>('comments');

  useEffect(() => {
    if (issue) {
      setTitle(issue.title);
      setDescription(issue.description || '');
      setStatus(issue.status);
      setPriority(issue.priority);
      setType(issue.type);
      setAssigneeId(issue.assigneeId || '');
      setSprintId(issue.sprintId || '');
      setStoryPoints(issue.storyPoints || 0);
      setDueDate(issue.dueDate || '');
      setBranchName(issue.branchName || '');
      setPrNumber(issue.prNumber || '');
      setForkName(issue.forkName || '');

      // Set user presence activity to editing this task
      setCurrentActivity(`Reviewing ${issue.key}`, issue.id);

      // Listen to comments on this issue in real time
      const q = query(
        collection(db, 'comments'),
        where('issueId', '==', issue.id)
      );
      const unsub = onSnapshot(q, (snap) => {
        const list: Comment[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Comment));
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setComments(list);
      });

      return () => {
        unsub();
        setCurrentActivity('Active in ApexFlow');
      };
    }
  }, [issue, setCurrentActivity]);

  if (!issue) return null;

  const handleSaveFields = async () => {
    await updateIssue(issue.id, {
      title,
      description,
      status,
      priority,
      type,
      assigneeId: assigneeId || undefined,
      sprintId: sprintId || undefined,
      storyPoints: Number(storyPoints) || 0,
      dueDate: dueDate || undefined,
      branchName: branchName || undefined,
      prNumber: prNumber ? Number(prNumber) : undefined,
      forkName: forkName || undefined,
    });
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await addComment(issue.id, newComment.trim());
    setNewComment('');
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${issue.key}?`)) {
      await deleteIssue(issue.id);
      onClose();
    }
  };

  const assignee = teamMembers.find((m) => m.uid === assigneeId);

  // Relevant GitHub activity for this issue based on branchName
  const relatedGitActivities = githubActivities.filter(
    (act) => (branchName && act.branch === branchName) || (prNumber && act.prNumber === prNumber)
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl text-xs overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Top Bar */}
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span className="font-mono text-indigo-400 font-bold tracking-wider">{issue.key}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 capitalize">{type}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete Issue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Two column layout */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6 min-w-0">
          {/* Main Column */}
          <div className="flex-1 space-y-5 min-w-0">
            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSaveFields}
                className="w-full text-base font-bold text-slate-100 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none py-1 transition-colors"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleSaveFields}
                rows={5}
                placeholder="Add technical specifications, acceptance criteria, or context..."
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-slate-200 text-xs leading-relaxed resize-none"
              />
            </div>

            {/* GitHub Association Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-slate-300" />
                  <span className="font-semibold text-slate-200">GitHub Intelligence</span>
                </div>
                {/* Live Activity indicator */}
                {relatedGitActivities.length > 0 ? (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Active on GitHub
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">○ No recent activity</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Associated Fork</label>
                  <input
                    type="text"
                    value={forkName}
                    placeholder="e.g. mehul/platform-core"
                    onChange={(e) => setForkName(e.target.value)}
                    onBlur={handleSaveFields}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Feature Branch</label>
                  <input
                    type="text"
                    value={branchName}
                    placeholder="e.g. feature/webrtc-signaling"
                    onChange={(e) => setBranchName(e.target.value)}
                    onBlur={handleSaveFields}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Connected PR Details */}
              {issue.prNumber && (
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-slate-200">PR #{issue.prNumber}</div>
                      <div className="text-[10px] text-slate-400">{issue.prStatus || 'Review requested'}</div>
                    </div>
                  </div>
                  {issue.prUrl && (
                    <a
                      href={issue.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-indigo-400"
                      title="Open in GitHub"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Tabs: Discussion & Audit History */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`flex items-center gap-1.5 pb-1 font-semibold text-xs transition-colors ${
                    activeTab === 'comments'
                      ? 'text-indigo-400 border-b-2 border-indigo-500'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discussion ({comments.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('github')}
                  className={`flex items-center gap-1.5 pb-1 font-semibold text-xs transition-colors ${
                    activeTab === 'github'
                      ? 'text-indigo-400 border-b-2 border-indigo-500'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GitCommit className="w-3.5 h-3.5" />
                  <span>Commits & PRs ({relatedGitActivities.length})</span>
                </button>
              </div>

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div className="space-y-3">
                  <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                    {comments.length === 0 ? (
                      <div className="text-center py-4 text-slate-500">No comments yet. Start the thread!</div>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{c.authorName}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-300 text-xs break-words">{c.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add comment form */}
                  <form onSubmit={handlePostComment} className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}

              {/* GitHub Events Tab */}
              {activeTab === 'github' && (
                <div className="space-y-2">
                  {relatedGitActivities.length === 0 ? (
                    <div className="py-4 text-center text-slate-500">
                      No commits or PRs linked to this branch yet.
                    </div>
                  ) : (
                    relatedGitActivities.map((act) => (
                      <div key={act.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs min-w-0">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <GitCommit className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="font-mono text-slate-200 truncate">{act.commitSha || act.eventType}</div>
                            <div className="text-[10px] text-slate-400 break-words">{act.commitMessage || act.prTitle}</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 flex-shrink-0">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Attributes Panel */}
          <div className="w-full md:w-64 space-y-4 border-t md:border-t-0 md:border-l border-slate-800 md:pl-6 pt-4 md:pt-0 flex-shrink-0 min-w-0">
            {/* Status */}
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const val = e.target.value as IssueStatus;
                  setStatus(val);
                  updateIssue(issue.id, { status: val });
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 capitalize font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => {
                  setAssigneeId(e.target.value);
                  updateIssue(issue.id, { assigneeId: e.target.value });
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m.uid} value={m.uid}>
                    {m.displayName} ({m.presence?.status || 'offline'})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  const val = e.target.value as IssuePriority;
                  setPriority(val);
                  updateIssue(issue.id, { priority: val });
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 capitalize focus:outline-none focus:border-indigo-500"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Story Points */}
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Story Points
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={storyPoints}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setStoryPoints(val);
                  updateIssue(issue.id, { storyPoints: val });
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Sprint */}
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Sprint
              </label>
              <select
                value={sprintId}
                onChange={(e) => {
                  setSprintId(e.target.value);
                  updateIssue(issue.id, { sprintId: e.target.value });
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">No Sprint (Backlog)</option>
                {sprints.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  updateIssue(issue.id, { dueDate: e.target.value });
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
