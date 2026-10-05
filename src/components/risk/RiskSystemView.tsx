import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Table, 
  LayoutGrid, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Clock, 
  User as UserIcon, 
  Bookmark, 
  Tag, 
  FileText,
  ChevronDown,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { ThreadItem, RiskLevel, RiskCategory } from '../../types';
import { RiskMatrixHeatmap } from './RiskMatrixHeatmap';
import { RiskRegisterSheet } from './RiskRegisterSheet';
import { CreateRiskModal } from './CreateRiskModal';
import { ThreadDetailModal } from '../threads/ThreadDetailModal';

export const RiskSystemView: React.FC = () => {
  const { activeProject, threads } = useWorkspace();
  const { currentUser, profile } = useAuth();

  // View mode: 'cards' | 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showMatrix, setShowMatrix] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | RiskLevel>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | RiskCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unsolved' | 'solved'>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');

  // Matrix coordinate filter
  const [matrixProb, setMatrixProb] = useState<number | null>(null);
  const [matrixImpact, setMatrixImpact] = useState<number | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRiskThread, setSelectedRiskThread] = useState<ThreadItem | null>(null);

  // Filter project-scoped risk threads only
  const projectRisks = useMemo(() => {
    const currentProjId = activeProject?.id || 'project-apex-platform';
    return threads.filter((t) => t.projectId === currentProjId && t.type === 'risk');
  }, [threads, activeProject?.id]);

  // Unique owners
  const riskOwners = useMemo(() => {
    const set = new Set<string>();
    projectRisks.forEach((r) => {
      if (r.riskData?.ownerName) set.add(r.riskData.ownerName);
    });
    return Array.from(set);
  }, [projectRisks]);

  // Filtered risks
  const filteredRisks = useMemo(() => {
    return projectRisks.filter((r) => {
      const d = r.riskData;

      // 1. Matrix coordinate filter
      if (matrixProb !== null && d?.probability !== matrixProb) return false;
      if (matrixImpact !== null && d?.impact !== matrixImpact) return false;

      // 2. Risk Level filter
      if (levelFilter !== 'all' && d?.riskLevel !== levelFilter) return false;

      // 3. Category filter
      if (categoryFilter !== 'all' && d?.category !== categoryFilter) return false;

      // 4. Status filter
      if (statusFilter === 'unsolved' && r.status !== 'unsolved') return false;
      if (statusFilter === 'solved' && r.status !== 'solved') return false;

      // 5. Owner filter
      if (ownerFilter !== 'all' && d?.ownerName !== ownerFilter) return false;

      // 6. Search query (Risk ID, Title, Description, Mitigation, Monitoring)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = d?.riskId?.toLowerCase().includes(q);
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesDesc = r.initialContent.toLowerCase().includes(q);
        const matchesMitigation = d?.mitigationPlan?.toLowerCase().includes(q);
        const matchesMonitoring = d?.monitoringStrategy?.toLowerCase().includes(q);
        const matchesManagement = d?.managementPlan?.toLowerCase().includes(q);

        if (!matchesId && !matchesTitle && !matchesDesc && !matchesMitigation && !matchesMonitoring && !matchesManagement) {
          return false;
        }
      }

      return true;
    });
  }, [
    projectRisks,
    matrixProb,
    matrixImpact,
    levelFilter,
    categoryFilter,
    statusFilter,
    ownerFilter,
    searchQuery,
  ]);

  // Analytics KPIs
  const severeCount = projectRisks.filter((r) => r.riskData?.riskLevel === 'severe').length;
  const highCount = projectRisks.filter((r) => r.riskData?.riskLevel === 'high').length;
  const unsolvedCount = projectRisks.filter((r) => r.status === 'unsolved').length;
  const solvedCount = projectRisks.filter((r) => r.status === 'solved').length;

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-[#0b0f19] select-none">
      
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-extrabold uppercase tracking-wider border border-rose-500/30 flex-shrink-0">
              RMMM Framework
            </span>
            <span className="text-xs text-slate-400 font-medium truncate">
              • Risk Mitigation, Monitoring & Management System
            </span>
          </div>

          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Risk System</span>
            <span className="text-xs font-mono font-normal text-rose-300 px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-800/60">
              {projectRisks.length} Registered
            </span>
          </h1>

          <p className="text-xs text-slate-400 mt-0.5">
            Identify software risks, quantify Probability & Impact, execute proactive mitigation, and resolve risks collaboratively.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'cards' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Cards & Threads View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Cards</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="RMMM Information Sheet (Register View)"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden md:inline">RMMM Sheet</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Log RMMM Risk</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Dashboard Bar */}
      <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/50 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Risks Logged</div>
            <div className="text-lg font-black text-white">{projectRisks.length}</div>
          </div>
          <ShieldAlert className="w-5 h-5 text-indigo-400" />
        </div>

        <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-rose-300 uppercase font-semibold">Severe / Critical (17-25)</div>
            <div className="text-lg font-black text-rose-400">{severeCount}</div>
          </div>
          <AlertCircle className="w-5 h-5 text-rose-400 animate-pulse" />
        </div>

        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-amber-300 uppercase font-semibold">Active Unsolved</div>
            <div className="text-lg font-black text-amber-400">{unsolvedCount}</div>
          </div>
          <Activity className="w-5 h-5 text-amber-400" />
        </div>

        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-emerald-300 uppercase font-semibold">Solved / Mitigated</div>
            <div className="text-lg font-black text-emerald-400">{solvedCount}</div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        
        {/* Toggleable 5x5 Heatmap Matrix */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowMatrix(!showMatrix)}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>{showMatrix ? 'Hide' : 'Show'} 5×5 Probability vs Impact Matrix</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMatrix ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showMatrix && (
            <RiskMatrixHeatmap
              risks={projectRisks}
              selectedProbability={matrixProb}
              selectedImpact={matrixImpact}
              onSelectCoordinate={(p, i) => {
                setMatrixProb(p);
                setMatrixImpact(i);
              }}
            />
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Risk Level */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500 font-semibold"
            >
              <option value="all">Severity: All Levels</option>
              <option value="severe">Severe (17-25)</option>
              <option value="high">High (10-16)</option>
              <option value="moderate">Moderate (5-9)</option>
              <option value="low">Low (1-4)</option>
            </select>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="all">Category: All</option>
              <option value="Technical">Technical</option>
              <option value="Security">Security</option>
              <option value="Schedule">Schedule</option>
              <option value="Budget">Budget</option>
              <option value="Resource">Resource</option>
              <option value="Operational">Operational</option>
              <option value="Dependency">Dependency</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="all">Status: All</option>
              <option value="unsolved">Active / Unsolved</option>
              <option value="solved">Mitigated / Solved</option>
            </select>

            {/* Owner */}
            {riskOwners.length > 0 && (
              <select
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="all">Owner: All</option>
                {riskOwners.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Risk ID, triggers, plans..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {(levelFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all' || ownerFilter !== 'all' || matrixProb !== null || searchQuery) && (
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
            <span className="font-semibold text-slate-500">Active Filters:</span>
            {levelFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1">
                <span>Level: {levelFilter}</span>
                <button onClick={() => setLevelFilter('all')} className="hover:text-rose-400">×</button>
              </span>
            )}
            {categoryFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1">
                <span>Category: {categoryFilter}</span>
                <button onClick={() => setCategoryFilter('all')} className="hover:text-rose-400">×</button>
              </span>
            )}
            {matrixProb !== null && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700 flex items-center gap-1">
                <span>Coordinate: P{matrixProb} × I{matrixImpact}</span>
                <button onClick={() => { setMatrixProb(null); setMatrixImpact(null); }} className="hover:text-rose-400">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setLevelFilter('all');
                setCategoryFilter('all');
                setStatusFilter('all');
                setOwnerFilter('all');
                setMatrixProb(null);
                setMatrixImpact(null);
                setSearchQuery('');
              }}
              className="text-[11px] text-rose-400 hover:underline"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Render View: Table or Cards */}
        {viewMode === 'table' ? (
          <RiskRegisterSheet
            risks={filteredRisks}
            onSelectRisk={(r) => setSelectedRiskThread(r)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRisks.map((risk) => {
              const d = risk.riskData;
              const isSolved = risk.status === 'solved';

              return (
                <div
                  key={risk.id}
                  onClick={() => setSelectedRiskThread(risk)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                    isSolved
                      ? 'bg-slate-900/60 border-slate-800/80 hover:border-emerald-500/40'
                      : d?.riskLevel === 'severe'
                      ? 'bg-slate-900/90 border-rose-900/40 hover:border-rose-500 shadow-md shadow-rose-950/20'
                      : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50'
                  }`}
                >
                  <div>
                    {/* Top Identity Row */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                          {d?.riskId || 'RSK'}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase bg-slate-800 px-2 py-0.5 rounded">
                          {d?.category || 'General'}
                        </span>
                      </div>

                      {/* Exposure Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono shadow-sm ${
                        d?.riskLevel === 'severe'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                          : d?.riskLevel === 'high'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                          : d?.riskLevel === 'moderate'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                      }`}>
                        Score {d?.exposureScore || 1} • {d?.riskLevel || 'LOW'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-2 mb-1 break-words min-w-0">
                      {risk.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3 break-words min-w-0">
                      {risk.initialContent}
                    </p>

                    {/* RMMM Breakdown Preview */}
                    <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] mb-3 min-w-0">
                      <div className="flex items-start gap-1.5 text-slate-300 min-w-0">
                        <span className="font-bold text-emerald-400 flex-shrink-0">Mitigation:</span>
                        <span className="line-clamp-2 break-words min-w-0 flex-1">{d?.mitigationPlan || 'Proactive steps logged in thread'}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-slate-400 min-w-0">
                        <span className="font-bold text-yellow-400 flex-shrink-0">Monitoring:</span>
                        <span className="line-clamp-2 break-words min-w-0 flex-1">{d?.monitoringStrategy || 'Telemetry indicators active'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Meta & Status */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-300">{d?.ownerName || risk.authorName}</span>
                      {d?.targetIssueKey && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-indigo-300">
                          {d.targetIssueKey}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {risk.replyCount} replies
                      </span>

                      {isSolved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mitigated</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredRisks.length === 0 && (
              <div className="col-span-1 md:col-span-2 py-16 text-center flex flex-col items-center justify-center gap-2">
                <ShieldAlert className="w-8 h-8 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-300">No risks match criteria</h3>
                <p className="text-xs text-slate-500">
                  Try adjusting filters or log a new risk with the RMMM Framework.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateRiskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <ThreadDetailModal
        thread={selectedRiskThread}
        onClose={() => setSelectedRiskThread(null)}
      />
    </div>
  );
};
