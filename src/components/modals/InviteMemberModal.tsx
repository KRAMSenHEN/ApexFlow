import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle2, Mail, Shield } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose }) => {
  const { activeProject, addProjectMember } = useWorkspace();
  const [emailOrUid, setEmailOrUid] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !activeProject) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUid.trim()) return;

    setSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await addProjectMember(activeProject.id, emailOrUid.trim());
      setStatusMessage({
        type: res.success ? 'success' : 'error',
        text: res.message,
      });
      if (res.success) {
        setEmailOrUid('');
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to add member to project.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Add Member to {activeProject.name}</h2>
              <p className="text-[11px] text-slate-400">Grant project access to a team member</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`m-4 p-3 rounded-xl flex items-start gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <span className="break-words">{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              User Email or Firebase UID *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={emailOrUid}
                onChange={(e) => setEmailOrUid(e.target.value)}
                placeholder="colleague@domain.com or user-uid"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              The user will immediately gain access to this project board, backlog, chat channels, and RMMM risks.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>Project isolation ensures users cannot access projects they are not added to.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              <span>{submitting ? 'Adding...' : 'Add to Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
