import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Tag, 
  Clock, 
  User as UserIcon,
  Sparkles,
  Image as ImageIcon,
  MessageCircle,
  FolderGit2,
  Check
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { ThreadItem } from '../../types';
import { CreateThreadModal } from './CreateThreadModal';
import { ThreadDetailModal } from './ThreadDetailModal';

export const ProjectThreadsView: React.FC = () => {
  const { activeProject, threads, canCloseThread, closeThread, reopenThread } = useWorkspace();
  const { currentUser, profile } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unsolved' | 'solved' | 'mine'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedThread, setSelectedThread] = useState<ThreadItem | null>(null);

  // Strictly filter to active project!
  const projectThreads = useMemo(() => {
    const currentProjId = activeProject?.id || 'project-apex-platform';
    return threads.filter((t) => t.projectId === currentProjId && t.type !== 'risk');
  }, [threads, activeProject?.id]);

  // Extract all tags across project threads
  const allTags = useMemo(() => {
    const set = new Set<string>();
    projectThreads.forEach((t) => t.tags?.forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [projectThreads]);

  // Filtered threads list
  const filteredThreads = useMemo(() => {
    return projectThreads.filter((t) => {
      // 1. Status Filter
      if (statusFilter === 'unsolved' && t.status !== 'unsolved') return false;
      if (statusFilter === 'solved' && t.status !== 'solved') return false;
      if (statusFilter === 'mine') {
        const uid = profile?.uid || currentUser?.uid;
        if (t.authorId !== uid) return false;
      }

      // 2. Tag Filter
      if (selectedTag && !t.tags?.includes(selectedTag)) return false;

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesContent = t.initialContent.toLowerCase().includes(q);
        const matchesAuthor = t.authorName.toLowerCase().includes(q);
        const matchesTags = t.tags?.some((tag) => tag.toLowerCase().includes(q));
        if (!matchesTitle && !matchesContent && !matchesAuthor && !matchesTags) return false;
      }

      return true;
    });
  }, [projectThreads, statusFilter, selectedTag, searchQuery, profile?.uid, currentUser?.uid]);

  const unsolvedCount = projectThreads.filter((t) => t.status === 'unsolved').length;
  const solvedCount = projectThreads.filter((t) => t.status === 'solved').length;

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-[#0b0f19] select-none">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider flex-shrink-0">
              {activeProject?.key || 'PROJECT'}
            </span>
            <span className="text-xs text-slate-400 truncate">• Project-Scoped Discussions</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Project Threads</span>
            <span className="text-xs font-mono font-normal text-slate-400 px-2 py-0.5 rounded-full bg-slate-800">
              {projectThreads.length}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Threads created here are strictly scoped to {activeProject?.name || 'this project'} and resolved by thread author or project owners.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex-shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Thread</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-800/80 bg-slate-900/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 min-w-0">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none min-w-0 flex-1 pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            All Threads ({projectThreads.length})
          </button>

          <button
            onClick={() => setStatusFilter('unsolved')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'unsolved'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Unsolved ({unsolvedCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('solved')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'solved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Solved ({solvedCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('mine')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'mine'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            My Threads
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 flex-shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search threads, tags, authors..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tags Quick Filter Bar */}
      {allTags.length > 0 && (
        <div className="px-4 sm:px-5 py-2 border-b border-slate-800/40 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs min-w-0">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mr-1 flex-shrink-0">
            <Tag className="w-3 h-3" />
            <span>Tags:</span>
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors flex-shrink-0 ${
              selectedTag === null ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors flex-shrink-0 ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Threads List Stage */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 min-w-0">
        {filteredThreads.map((th) => {
          const isSolved = th.status === 'solved';
          const canClose = canCloseThread(th);

          return (
            <div
              key={th.id}
              onClick={() => setSelectedThread(th)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:shadow-xl min-w-0 ${
                isSolved
                  ? 'bg-slate-900/60 border-slate-800/80 hover:border-emerald-500/40'
                  : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                  {/* Status Pill */}
                  {isSolved ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] uppercase tracking-wider flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Solved</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[10px] uppercase tracking-wider flex-shrink-0">
                      <AlertCircle className="w-3 h-3" />
                      <span>Unsolved</span>
                    </span>
                  )}

                  {/* Title */}
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors break-words min-w-0 flex-1">
                    {th.title}
                  </h3>
                </div>

                {/* Reply count and activity */}
                <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-semibold text-slate-200">{th.replyCount}</span>
                    <span>{th.replyCount === 1 ? 'reply' : 'replies'}</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(th.updatedAt || th.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Content snippet */}
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3 break-words">
                {th.initialContent}
              </p>

              {/* Bottom metadata footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src={th.authorPhotoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${th.authorId}`}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover border border-slate-700"
                  />
                  <span className="text-[11px] font-medium text-slate-300">{th.authorName}</span>
                  {isSolved && th.solvedByName && (
                    <span className="text-[10px] text-emerald-400/90 font-medium">
                      • Resolved by {th.solvedByName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {th.tags?.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[10px] font-medium text-slate-400"
                    >
                      #{t}
                    </span>
                  ))}

                  {th.images && th.images.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-indigo-300 font-mono">
                      <ImageIcon className="w-3 h-3" />
                      <span>{th.images.length}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredThreads.length === 0 && (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">No project threads found</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {searchQuery || selectedTag || statusFilter !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Start a new project thread to discuss architecture, code reviews, and technical solutions.'}
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              Start First Thread
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateThreadModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <ThreadDetailModal
        thread={selectedThread}
        onClose={() => setSelectedThread(null)}
      />
    </div>
  );
};
