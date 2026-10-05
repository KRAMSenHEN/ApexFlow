import React, { useState, useRef } from 'react';
import { 
  X, 
  MessageSquare, 
  Tag, 
  UploadCloud, 
  Sparkles, 
  Send, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ImageAttachment, RichEmbed, Message } from '../../types';
import { EmbedFormatToolbar } from '../chat/EmbedFormatToolbar';
import { GifPickerPopover } from '../chat/GifPickerPopover';
import { EmbedStudioModal } from '../chat/EmbedStudioModal';
import { detectLinkPreviews } from '../../utils/linkEmbedUtils';
import { RichEmbedCard } from '../chat/RichEmbedCard';

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentMessage?: Message | null;
}

const COMMON_TAGS = ['Architecture', 'Frontend', 'Backend', 'Database', 'Performance', 'Security', 'Discussion', 'Bug Triage'];

export const CreateThreadModal: React.FC<CreateThreadModalProps> = ({
  isOpen,
  onClose,
  parentMessage,
}) => {
  const { activeProject, createThread } = useWorkspace();

  const [title, setTitle] = useState(parentMessage ? `Discussion: ${parentMessage.content.slice(0, 45)}...` : '');
  const [content, setContent] = useState(parentMessage ? `Referencing message by ${parentMessage.authorName}:\n> ${parentMessage.content}\n\n` : '');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Discussion']);
  const [customTagInput, setCustomTagInput] = useState('');
  
  // Attachments
  const [stagedImages, setStagedImages] = useState<ImageAttachment[]>([]);
  const [stagedEmbeds, setStagedEmbeds] = useState<RichEmbed[]>([]);
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
  const [isEmbedStudioOpen, setIsEmbedStudioOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      const clean = customTagInput.trim().replace(/^#/, '');
      if (!selectedTags.includes(clean)) {
        setSelectedTags([...selectedTags, clean]);
      }
      setCustomTagInput('');
    }
  };

  // Image & GIF file processor
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleInsertMarkdown = (prefix: string, suffix = '', defaultText = '') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = content.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
      }
    }, 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || submitting) return;

    setSubmitting(true);
    try {
      await createThread({
        title: title.trim(),
        initialContent: content.trim(),
        type: 'normal',
        parentMessageId: parentMessage?.id,
        channelId: parentMessage?.channelId,
        tags: selectedTags,
        images: stagedImages.length ? stagedImages : undefined,
        embeds: stagedEmbeds.length ? stagedEmbeds : undefined,
      });
      onClose();
    } catch (err) {
      console.error('Failed to create thread:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const liveLinkPreviews = detectLinkPreviews(content);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150 min-w-0"
        onDragEnter={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
        onDragOver={(e) => { e.preventDefault(); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDraggingOver(false); }}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                <span>Create Project Thread</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono truncate">
                  {activeProject?.name || 'Project'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                Isolated to this project. Visible only to team members of this project.
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

        {/* Drag overlay */}
        {isDraggingOver && (
          <div className="p-6 bg-indigo-950/80 border-2 border-dashed border-indigo-500 text-center animate-pulse">
            <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-1" />
            <span className="text-xs font-bold text-white">Drop images or GIFs here to attach to this thread</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Thread Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Thread Subject / Question <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Migration strategy to WebSocket peer rooms in Sprint 2..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tags & Categories</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={handleAddCustomTag}
              placeholder="Type custom tag and press Enter..."
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description & Rich Markdown Composer */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Thread Content / Specifications <span className="text-rose-400">*</span></span>
              <span className="text-[10px] text-slate-500">Supports Markdown, Drag & Drop Images/GIFs</span>
            </label>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 focus-within:border-indigo-500 transition-colors">
              <EmbedFormatToolbar
                onInsertMarkdown={handleInsertMarkdown}
                onOpenImageUpload={() => fileInputRef.current?.click()}
                onToggleGifPicker={() => setIsGifPickerOpen(!isGifPickerOpen)}
                onOpenEmbedStudio={() => setIsEmbedStudioOpen(true)}
              />

              <textarea
                ref={textareaRef}
                required
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Explain the background, code snippets, requirements, or reproduction details. Paste URLs for instant live link embeds..."
                className="w-full p-3.5 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-y font-mono"
              />

              {/* Hidden file input */}
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
            </div>
          </div>

          {/* Staged Images and GIFs */}
          {stagedImages.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                Attached Images & GIFs ({stagedImages.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {stagedImages.map((img) => (
                  <div key={img.id} className="relative group w-24 h-20 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    {img.isGif && (
                      <span className="absolute top-1 left-1 px-1 py-0.5 rounded bg-purple-600 text-white font-mono text-[9px] font-bold">
                        GIF
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setStagedImages(stagedImages.filter((i) => i.id !== img.id))}
                      className="absolute top-1 right-1 p-1 rounded-full bg-slate-950/80 hover:bg-rose-600 text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Staged Embeds */}
          {stagedEmbeds.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                Custom Embeds ({stagedEmbeds.length})
              </div>
              {stagedEmbeds.map((emb) => (
                <div key={emb.id} className="relative group">
                  <RichEmbedCard embed={emb} />
                  <button
                    type="button"
                    onClick={() => setStagedEmbeds(stagedEmbeds.filter((e) => e.id !== emb.id))}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/80 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Live Link Previews */}
          {liveLinkPreviews.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Detected Live Link Embeds</span>
              </div>
              <div className="space-y-2">
                {liveLinkPreviews.map((prev, idx) => (
                  <RichEmbedCard key={idx} linkPreview={prev} />
                ))}
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Thread will start as <strong>Unsolved</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!title.trim() || !content.trim() || submitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Creating...' : 'Start Thread'}</span>
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

        <EmbedStudioModal
          isOpen={isEmbedStudioOpen}
          onClose={() => setIsEmbedStudioOpen(false)}
          channelName="Thread Embed"
          onSendEmbed={(embed) => {
            setStagedEmbeds((prev) => [...prev, embed]);
            setIsEmbedStudioOpen(false);
          }}
        />
      </div>
    </div>
  );
};
