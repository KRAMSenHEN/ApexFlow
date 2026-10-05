/**
 * Central Configuration for Product Branding and Defaults
 * Any rebranding or workspace customization can be updated here centrally.
 */
export const APP_CONFIG = {
  name: 'ApexFlow',
  shortName: 'Apex',
  tagline: 'High-Velocity Collaborative Workspace & Engineering Hub',
  version: '2.4.0',
  defaultProjectKey: 'APEX',
  defaultProjectName: 'Apex Cloud Platform',
  defaultWorkspaceName: 'ApexFlow Core Engineering',
  githubOrg: 'apexflow-hq',
  primaryRepo: 'apexflow-hq/platform-core',
  supportEmail: 'support@apexflow.dev',
  issueTypes: [
    { id: 'story', label: 'Story', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: 'Bookmark' },
    { id: 'task', label: 'Task', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: 'CheckSquare' },
    { id: 'bug', label: 'Bug', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', icon: 'AlertCircle' },
    { id: 'epic', label: 'Epic', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: 'Zap' },
  ],
  priorities: [
    { id: 'urgent', label: 'Urgent', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { id: 'high', label: 'High', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
    { id: 'medium', label: 'Medium', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { id: 'low', label: 'Low', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
  ],
  statuses: [
    { id: 'backlog', label: 'Backlog', color: 'bg-slate-800 text-slate-300 border-slate-700' },
    { id: 'todo', label: 'To Do', color: 'bg-slate-800 text-slate-200 border-slate-700' },
    { id: 'in_progress', label: 'In Progress', color: 'bg-blue-900/40 text-blue-300 border-blue-700/50' },
    { id: 'in_review', label: 'In Review', color: 'bg-amber-900/40 text-amber-300 border-amber-700/50' },
    { id: 'done', label: 'Done', color: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50' },
  ],
};
