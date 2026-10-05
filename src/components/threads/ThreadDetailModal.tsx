import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Reply, 
  Sparkles, 
  UploadCloud, 
  Clock, 
  User as UserIcon, 
  Tag, 
  RotateCcw,
  Lock,
  Smile,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { ThreadItem, ThreadMessage, ImageAttachment, RichEmbed } from '../../types';
import { EmbedFormatToolbar } from '../chat/EmbedFormatToolbar';
import { GifPickerPopover } from '../chat/GifPickerPopover';
import { EmbedStudioModal } from '../chat/EmbedStudioModal';
import { RichEmbedCard } from '../chat/RichEmbedCard';
import { ImageLightboxModal } from '../chat/ImageLightboxModal';
import { detectLinkPreviews } from '../../utils/linkEmbedUtils';

interface ThreadDetailModalProps {
  thread: ThreadItem | null;
  onClose: () => void;
}

export const ThreadDetailModal: React.FC<ThreadDetailModalProps> = ({
  thread,
  onClose,
}) => {
  const { closeThread, reopenThread, sendThreadMessage, canCloseThread, activeProject } = useWorkspace();
  const { profile, currentUser } = useAuth();

  const [replies, setReplies] = useState<ThreadMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [stagedImages, setStagedImages] = useState<ImageAttachment[]>([]);
  const [stagedEmbeds, setStagedEmbeds] = useState<RichEmbed[]>([]);
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
  const [isEmbedStudioOpen, setIsEmbedStudioOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<ImageAttachment | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const repliesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Subscribe to thread replies in real-time
  useEffect(() => {
    if (!thread) return;

    const q = query(
      collection(db, 'threadMessages'),
      where('threadId', '==', thread.id)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: ThreadMessage[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as ThreadMessage));
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setReplies(list);
    });

    return () => unsub();
  }, [thread?.id]);

  useEffect(() => {
    repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies]);

  if (!thread) return null;

  const isAllowedToClose = canCloseThread(thread);

  // Process files (Image & Animated GIF)
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
    const selected = replyText.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;
    const newText = replyText.substring(0, start) + replacement + replyText.substring(end);
    setReplyText(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
      }
    }, 10);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && stagedImages.length === 0 && stagedEmbeds.length === 0) return;

    await sendThreadMessage(thread.id, replyText.trim(), {
      images: stagedImages.length ? stagedImages : undefined,
      embeds: stagedEmbeds.length ? stagedEmbeds : undefined,
    });

    setReplyText('');
    setStagedImages([]);
    setStagedEmbeds([]);
  };

  const handleToggleClose = async () => {
    if (!isAllowedToClose || actionLoading) return;
    setActionLoading(true);
    try {
      if (thread.status === 'unsolved') {
        await closeThread(thread.id);
      } else {
        await reopenThread(thread.id);
      }
    } catch (err: any) {
      console.error('Error updating thread status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div 
        className="w-full max-w-3xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 min-w-0"
        onDragEnter={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
        onDragOver={(e) => { e.preventDefault(); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDraggingOver(false); }}
        onDrop={handleDrop}
      >
        {/* Top Header Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {thread.status === 'solved' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[11px] shadow-sm flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Solved</span>
                  {thread.solvedByName && (
                    <span className="text-emerald-500/80 font-normal">by {thread.solvedByName}</span>
                  )}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[11px] shadow-sm flex-shrink-0">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Unsolved</span>
                </span>
              )}

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 flex-shrink-0">
                {activeProject?.key || 'PROJECT'}
              </span>

              {thread.tags?.map((t) => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/50 text-indigo-300 border border-indigo-800/40 flex-shrink-0">
                  #{t}
                </span>
              ))}
            </div>

            <h2 className="text-sm sm:text-base font-bold text-white break-words">
              {thread.title}
            </h2>
          </div>

          {/* Close / Solve Thread Action Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isAllowedToClose ? (
              <button
                type="button"
                onClick={handleToggleClose}
                disabled={actionLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-md ${
                  thread.status === 'unsolved'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                }`}
                title={thread.status === 'unsolved' ? 'Mark thread as Solved' : 'Reopen thread as Unsolved'}
              >
                {thread.status === 'unsolved' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Close & Solve</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reopen Thread</span>
                  </>
                )}
              </button>
            ) : (
              <div 
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-500 text-[11px] cursor-not-allowed"
                title="Only the thread creator or project owner can close this thread"
              >
                <Lock className="w-3 h-3" />
                <span>Restricted</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drag Overlay */}
        {isDraggingOver && (
          <div className="p-4 bg-indigo-950/80 border-2 border-dashed border-indigo-500 text-center animate-pulse">
            <UploadCloud className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
            <span className="text-xs font-bold text-white">Drop Image or GIF to embed in this thread</span>
          </div>
        )}

        {/* Scrollable Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-[#0b0f19]/60">
          
          {/* ROOT THREAD MESSAGE */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <img
                  src={thread.authorPhotoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${thread.authorId}`}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <div className="text-xs font-bold text-slate-200">{thread.authorName}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Started {new Date(thread.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 font-semibold border border-indigo-800/40">
                Author
              </span>
            </div>

            {/* Content text */}
            <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans break-words min-w-0">
              {thread.initialContent}
            </div>

            {/* Attached Images & GIFs */}
            {thread.images && thread.images.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {thread.images.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setLightboxImage(img)}
                    className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer aspect-video"
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    {img.isGif && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-purple-600 text-white font-mono text-[9px] font-extrabold uppercase">
                        GIF
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Custom Embeds */}
            {thread.embeds?.map((emb) => (
              <RichEmbedCard key={emb.id} embed={emb} />
            ))}

            {/* Link Previews */}
            {thread.linkPreviews?.map((prev, idx) => (
              <RichEmbedCard key={idx} linkPreview={prev} />
            ))}
          </div>

          {/* DIVIDER: REPLIES */}
          <div className="flex items-center gap-3">
            <span className="w-full h-[1px] bg-slate-800" />
            <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap px-2">
              {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
            </span>
            <span className="w-full h-[1px] bg-slate-800" />
          </div>

          {/* REPLIES LIST */}
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-3 group min-w-0">
              <img
                src={reply.authorPhotoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${reply.authorId}`}
                alt=""
                className="w-7 h-7 rounded-full object-cover border border-slate-700 flex-shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-slate-200 truncate">{reply.authorName}</span>
                  <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                    {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="mt-1 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed break-words min-w-0">
                  {reply.content}

                  {/* Attached images & GIFs */}
                  {reply.images && reply.images.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {reply.images.map((img) => (
                        <div
                          key={img.id}
                          onClick={() => setLightboxImage(img)}
                          className="relative rounded-lg overflow-hidden border border-slate-800 cursor-pointer max-w-xs"
                        >
                          <img src={img.url} alt="" className="max-h-48 object-cover rounded-lg" />
                          {img.isGif && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-purple-600 text-white font-mono text-[9px] font-bold">
                              GIF
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rich Embeds */}
                  {reply.embeds?.map((emb) => (
                    <RichEmbedCard key={emb.id} embed={emb} />
                  ))}

                  {/* Link Previews */}
                  {reply.linkPreviews?.map((prev, idx) => (
                    <RichEmbedCard key={idx} linkPreview={prev} />
                  ))}
                </div>
              </div>
            </div>
          ))}

          {replies.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center gap-1">
              <MessageSquare className="w-5 h-5 text-slate-600" />
              <span>No replies yet. Be the first to answer this thread!</span>
            </div>
          )}

          <div ref={repliesEndRef} />
        </div>

        {/* Staged Reply Attachments */}
        {(stagedImages.length > 0 || stagedEmbeds.length > 0) && (
          <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
            {stagedImages.map((img) => (
              <div key={img.id} className="relative group w-16 h-12 rounded-lg overflow-hidden border border-slate-800 flex-shrink-0">
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

            {stagedEmbeds.map((emb) => (
              <div key={emb.id} className="px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-500/40 text-[11px] text-indigo-200 flex items-center gap-1.5 flex-shrink-0">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span className="font-semibold">{emb.title || 'Embed Attached'}</span>
                <button
                  type="button"
                  onClick={() => setStagedEmbeds(stagedEmbeds.filter((e) => e.id !== emb.id))}
                  className="text-slate-400 hover:text-rose-400 ml-1"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Reply Composer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80">
          <form onSubmit={handleSendReply} className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/80 focus-within:border-indigo-500 transition-colors">
            <EmbedFormatToolbar
              onInsertMarkdown={handleInsertMarkdown}
              onOpenImageUpload={() => fileInputRef.current?.click()}
              onToggleGifPicker={() => setIsGifPickerOpen(!isGifPickerOpen)}
              onOpenEmbedStudio={() => setIsEmbedStudioOpen(true)}
              isCompact={true}
            />

            <div className="p-2.5 flex items-end gap-2">
              <textarea
                ref={textareaRef}
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Reply to this thread... (Drop images/GIFs, paste URLs for instant previews)"
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none font-sans"
              />

              <button
                type="submit"
                disabled={!replyText.trim() && stagedImages.length === 0 && stagedEmbeds.length === 0}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold transition-all shadow-md shadow-indigo-600/30 flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

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
          </form>
        </div>

        {/* Popovers & Modals */}
        <GifPickerPopover
          isOpen={isGifPickerOpen}
          onClose={() => setIsGifPickerOpen(false)}
          onSelectGif={(gif) => setStagedImages((prev) => [...prev, gif])}
        />

        <EmbedStudioModal
          isOpen={isEmbedStudioOpen}
          onClose={() => setIsEmbedStudioOpen(false)}
          channelName="Thread Reply Embed"
          onSendEmbed={(embed) => {
            setStagedEmbeds((prev) => [...prev, embed]);
            setIsEmbedStudioOpen(false);
          }}
        />

        <ImageLightboxModal
          image={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      </div>
    </div>
  );
};
