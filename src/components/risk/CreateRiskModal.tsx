import React, { useState, useRef } from 'react';
import { 
  X, 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle, 
  Send, 
  UploadCloud, 
  Sliders, 
  Calendar, 
  User as UserIcon,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { RiskCategory, RiskLevel, RMMMRiskData, ImageAttachment, RichEmbed } from '../../types';
import { EmbedFormatToolbar } from '../chat/EmbedFormatToolbar';
import { GifPickerPopover } from '../chat/GifPickerPopover';
import { EmbedStudioModal } from '../chat/EmbedStudioModal';

interface CreateRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: RiskCategory[] = [
  'Technical',
  'Schedule',
  'Budget',
  'Resource',
  'Security',
  'Operational',
  'Dependency',
];

export const CreateRiskModal: React.FC<CreateRiskModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeProject, createThread, teamMembers, issues, sprints } = useWorkspace();
  const { currentUser, profile } = useAuth();

  // RMMM Fields
  const nextNum = Math.floor(Math.random() * 80) + 104;
  const [riskId, setRiskId] = useState(`${activeProject?.key || 'APEX'}-RSK-${nextNum}`);
  const [category, setCategory] = useState<RiskCategory>('Technical');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Quantification (1-5)
  const [probability, setProbability] = useState<number>(3);
  const [impact, setImpact] = useState<number>(4);

  // RMMM Core Strategy Fields
  const [mitigationPlan, setMitigationPlan] = useState('');
  const [monitoringStrategy, setMonitoringStrategy] = useState('');
  const [managementPlan, setManagementPlan] = useState('');

  // Ownership & Links
  const [ownerName, setOwnerName] = useState(profile?.displayName || currentUser?.displayName || 'Project Lead');
  const [reviewDate, setReviewDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [targetIssueKey, setTargetIssueKey] = useState<string>('');
  const [targetSprintId, setTargetSprintId] = useState<string>('');

  // Attachments
  const [stagedImages, setStagedImages] = useState<ImageAttachment[]>([]);
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
  const [isEmbedStudioOpen, setIsEmbedStudioOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Calculate Exposure & Level
  const exposureScore = probability * impact;
  const getRiskLevel = (score: number): RiskLevel => {
    if (score >= 17) return 'severe';
    if (score >= 10) return 'high';
    if (score >= 5) return 'moderate';
    return 'low';
  };
  const riskLevel = getRiskLevel(exposureScore);

  const processFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        if (url) {
          const newImg: ImageAttachment = {
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            url,
            name: file.name,
            size: file.size,
            isGif,
            mediaType: isGif ? 'gif' : 'image',
          };
          setStagedImages((prev) => [...prev, newImg]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || submitting) return;

    setSubmitting(true);
    try {
      const riskData: RMMMRiskData = {
        riskId: riskId.trim(),
        category,
        probability,
        impact,
        exposureScore,
        riskLevel,
        mitigationPlan: mitigationPlan.trim(),
        monitoringStrategy: monitoringStrategy.trim(),
        managementPlan: managementPlan.trim(),
        ownerName: ownerName.trim(),
        ownerId: currentUser?.uid,
        reviewDate,
        targetSprintId: targetSprintId || undefined,
        targetIssueKey: targetIssueKey || undefined,
      };

      await createThread({
        title: `[${riskData.riskId}] ${title.trim()}`,
        initialContent: description.trim(),
        type: 'risk',
        tags: [category, `Score:${exposureScore}`, riskLevel.toUpperCase()],
        images: stagedImages.length ? stagedImages : undefined,
        riskData,
      });

      onClose();
    } catch (err) {
      console.error('Failed to create RMMM risk:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 min-w-0">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 flex-shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                <span>RMMM Risk Information Sheet & Protocol</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-extrabold uppercase">
                  RMMM Framework
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                Risk Mitigation, Monitoring, and Management workflow for high-velocity software engineering.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          
          {/* SECTION 1: RISK IDENTIFICATION */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>1. Risk Identification</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Scoped to {activeProject?.name}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Risk ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={riskId}
                  onChange={(e) => setRiskId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">
                  Risk Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RiskCategory)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Risk Title / Threat Vector <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Memory leak in WebRTC audio buffer causing browser tab crash"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Risk Description & Condition Statement <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what condition could occur, why it could happen, and the consequence on project delivery..."
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-mono"
              />
            </div>
          </div>

          {/* SECTION 2: RISK QUANTIFICATION (5x5 PROBABILITY & IMPACT) */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>2. Risk Analysis & Quantification (Exposure: P × I)</span>
              </span>

              {/* Dynamic Exposure Score Badge */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Exposure Score:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-xs shadow-md ${
                  riskLevel === 'severe'
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50'
                    : riskLevel === 'high'
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50'
                    : riskLevel === 'moderate'
                    ? 'bg-yellow-500/25 text-yellow-300 border border-yellow-500/50'
                    : 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50'
                }`}>
                  {exposureScore} / 25 • {riskLevel.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Probability */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Probability / Likelihood (P):</span>
                  <span className="font-bold font-mono text-indigo-400">Level {probability}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={probability}
                  onChange={(e) => setProbability(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1: &lt;10%</span>
                  <span>2: 10-30%</span>
                  <span>3: 30-50%</span>
                  <span>4: 50-70%</span>
                  <span>5: &gt;70%</span>
                </div>
              </div>

              {/* Impact */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Impact / Severity (I):</span>
                  <span className="font-bold font-mono text-rose-400">Level {impact}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={impact}
                  onChange={(e) => setImpact(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1: Negligible</span>
                  <span>2: Marginal</span>
                  <span>3: Signif.</span>
                  <span>4: Critical</span>
                  <span>5: Catastrophic</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: RMMM CORE FRAMEWORK (MITIGATION, MONITORING, MANAGEMENT) */}
          <div className="space-y-3.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>3. RMMM Action Plans</span>
              </span>
            </div>

            {/* Mitigation Strategy */}
            <div>
              <label className="block font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mitigation Strategy (Proactive Preventive Measures)</span>
              </label>
              <textarea
                required
                rows={2}
                value={mitigationPlan}
                onChange={(e) => setMitigationPlan(e.target.value)}
                placeholder="What architectural changes, unit test gates, or engineering practices will be implemented BEFORE occurrence to reduce probability?"
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Monitoring Strategy */}
            <div>
              <label className="block font-semibold text-yellow-400 mb-1 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Monitoring Strategy (Telemetry, Triggers & Early Warning Signs)</span>
              </label>
              <textarea
                required
                rows={2}
                value={monitoringStrategy}
                onChange={(e) => setMonitoringStrategy(e.target.value)}
                placeholder="What telemetry metrics, CI logs, or alerts will trigger when this risk starts developing?"
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 resize-none"
              />
            </div>

            {/* Management / Contingency Plan */}
            <div>
              <label className="block font-semibold text-rose-400 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Management / Contingency Plan (Reactive Damage Containment)</span>
              </label>
              <textarea
                required
                rows={2}
                value={managementPlan}
                onChange={(e) => setManagementPlan(e.target.value)}
                placeholder="Step-by-step fallback action plan if the risk triggers in production or staging..."
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>
          </div>

          {/* SECTION 4: OWNERSHIP & SPRINT LINKS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Risk Owner / Lead
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Target Review Date
              </label>
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Linked Issue / Task
              </label>
              <select
                value={targetIssueKey}
                onChange={(e) => setTargetIssueKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">None (Stand-alone Risk)</option>
                {issues.map((i) => (
                  <option key={i.id} value={i.key}>
                    {i.key} — {i.title.slice(0, 30)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Attachments & GIF tray */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-300">Diagnostic Attachments (Images & GIFs)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setIsGifPickerOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-bold font-mono uppercase"
                >
                  Add GIF
                </button>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) processFiles(e.target.files);
              }}
            />

            {stagedImages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {stagedImages.map((img) => (
                  <div key={img.id} className="relative w-20 h-16 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    {img.isGif && (
                      <span className="absolute top-0.5 left-0.5 px-1 rounded bg-purple-600 text-white font-mono text-[8px] font-bold">
                        GIF
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setStagedImages(stagedImages.filter((i) => i.id !== img.id))}
                      className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/80 hover:bg-rose-600 text-white"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              Risk will be assigned status <strong>Unsolved / Active</strong> with attached real-time thread.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!title.trim() || !description.trim() || submitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-semibold shadow-lg shadow-rose-600/30 transition-all"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{submitting ? 'Registering...' : 'Register RMMM Risk'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Popovers */}
        <GifPickerPopover
          isOpen={isGifPickerOpen}
          onClose={() => setIsGifPickerOpen(false)}
          onSelectGif={(gif) => setStagedImages((prev) => [...prev, gif])}
        />
      </div>
    </div>
  );
};
