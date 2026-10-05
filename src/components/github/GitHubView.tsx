import React, { useState } from 'react';
import { 
  Github, 
  GitBranch, 
  GitPullRequest, 
  GitCommit, 
  Clock, 
  ExternalLink, 
  Radio, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Shield,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { GitHubActivityItem } from '../../types';

export const GitHubView: React.FC = () => {
  const { 
    githubConnection, 
    githubActivities, 
    teamMembers, 
    triggerSimulatedGitHubEvent,
    associateMemberFork 
  } = useWorkspace();
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'forks' | 'webhooks'>('overview');
  const [selectedMember, setSelectedMember] = useState(teamMembers[0]?.uid || '');
  const [forkInput, setForkInput] = useState(`${profile?.githubUsername || 'dev'}/platform-core`);
  const [branchInput, setBranchInput] = useState('feature/authentication');

  const [customCommitMsg, setCustomCommitMsg] = useState('feat(auth): rotate JWT session secret and add tests');
  const [customPRTitle, setCustomPRTitle] = useState('feat(audio): WebRTC ICE candidate signaling');

  const handleSaveFork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !forkInput) return;
    associateMemberFork(selectedMember, forkInput, branchInput);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-slate-950 p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-lg">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">GitHub Infrastructure</h1>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Integration
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Associated repository: <span className="font-mono text-indigo-400">apexflow-hq/platform-core</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Activity & Commits
          </button>
          <button
            onClick={() => setActiveTab('forks')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'forks' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Member Fork Mappings
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'webhooks' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Webhook Simulator
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & REAL-TIME ACTIVITY STREAM */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Repository Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Repository</span>
              <div className="text-sm font-bold text-slate-100 font-mono">apexflow-hq/platform-core</div>
              <div className="text-[11px] text-slate-400">Default branch: <span className="text-indigo-400 font-mono">main</span></div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Latest Activity</span>
              <div className="text-sm font-bold text-slate-100 font-mono">
                {githubActivities[0]?.eventType || 'Push to main'}
              </div>
              <div className="text-[11px] text-emerald-400 font-medium">● Webhooks synced in real-time</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Connected Team</span>
              <div className="text-sm font-bold text-slate-100">{teamMembers.length} Members</div>
              <div className="text-[11px] text-slate-400">Fork associations active</div>
            </div>
          </div>

          {/* GitHub Activity Timeline */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200">Normalized Repository Events</h3>
              <span className="text-[11px] text-slate-400 font-mono">{githubActivities.length} total events recorded</span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {githubActivities.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No GitHub activity captured yet. Use the Webhook Simulator tab to trigger events!
                </div>
              ) : (
                githubActivities.map((act) => (
                  <div key={act.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-800/30 transition-colors text-xs">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg mt-0.5 ${
                        act.eventType.includes('pull_request')
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {act.eventType.includes('pull_request') ? (
                          <GitPullRequest className="w-4 h-4" />
                        ) : (
                          <GitCommit className="w-4 h-4" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">{act.author}</span>
                          <span className="text-slate-500">•</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300">
                            {act.eventType.replace(/_/g, ' ')}
                          </span>
                          {act.branch && (
                            <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                              <GitBranch className="w-3 h-3 text-slate-500" />
                              {act.branch}
                            </span>
                          )}
                        </div>

                        <p className="text-slate-300 font-mono text-[11px]">
                          {act.commitMessage || act.prTitle || 'Repository event'}
                        </p>

                        {act.prNumber && (
                          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                            <span>Pull Request #{act.prNumber}</span>
                            {act.prState && <span>({act.prState})</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-500 font-mono flex-shrink-0">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEAM MEMBER FORK MAPPINGS */}
      {activeTab === 'forks' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Associate Member with Personal Fork</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                When a member is assigned an issue, ApexFlow maps the task directly to their GitHub fork and feature branch.
              </p>
            </div>

            <form onSubmit={handleSaveFork} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Team Member</label>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {teamMembers.map((m) => (
                    <option key={m.uid} value={m.uid}>{m.displayName} (@{m.githubUsername || 'dev'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">GitHub Fork Repository</label>
                <input
                  type="text"
                  value={forkInput}
                  onChange={(e) => setForkInput(e.target.value)}
                  placeholder="username/platform-core"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Default Feature Branch</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={branchInput}
                    onChange={(e) => setBranchInput(e.target.value)}
                    placeholder="feature/authentication"
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Roster of Fork Associations */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <div className="p-4 bg-slate-900/80 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-200">Current Member Fork Associations</h3>
            </div>
            <div className="divide-y divide-slate-800/60">
              {teamMembers.map((m) => (
                <div key={m.uid} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.uid}`}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="font-semibold text-slate-200">{m.displayName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">@{m.githubUsername || 'engineer'}</div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-indigo-400 font-semibold">{m.githubUsername || 'dev'}/platform-core</div>
                    <div className="text-[10px] text-slate-500">Branch: feature/{m.displayName.toLowerCase().split(' ')[0]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WEBHOOK SIMULATOR */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <Shield className="w-4 h-4" />
              <span>Real-Time Webhook Simulator & Event Ingestion Pipeline</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              In production, GitHub webhooks deliver payload signatures verifying repository pushes, PR lifecycle events, and reviews. 
              Click the actions below to trigger live webhooks, which normalize events and immediately update Firestore and assigned tasks in real time!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Action 1: Push Commits */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
                <GitCommit className="w-4 h-4 text-indigo-400" />
                <span>Simulate Push Event</span>
              </div>
              <input
                type="text"
                value={customCommitMsg}
                onChange={(e) => setCustomCommitMsg(e.target.value)}
                className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
              />
              <button
                onClick={() => triggerSimulatedGitHubEvent('push', { message: customCommitMsg, branch: 'feature/authentication' })}
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors"
              >
                Trigger Push Webhook
              </button>
            </div>

            {/* Action 2: Open PR */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
                <GitPullRequest className="w-4 h-4 text-purple-400" />
                <span>Simulate Open PR</span>
              </div>
              <input
                type="text"
                value={customPRTitle}
                onChange={(e) => setCustomPRTitle(e.target.value)}
                className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
              />
              <button
                onClick={() => triggerSimulatedGitHubEvent('pull_request_opened', { title: customPRTitle })}
                className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition-colors"
              >
                Trigger PR Opened Webhook
              </button>
            </div>

            {/* Action 3: Review PR */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Simulate PR Review</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Approves PR #82 on branch feature/webrtc-signaling with zero blocking remarks.
              </p>
              <button
                onClick={() => triggerSimulatedGitHubEvent('pull_request_review')}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors"
              >
                Trigger PR Review Webhook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
