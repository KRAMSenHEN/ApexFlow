import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Hash, 
  Send, 
  Smile, 
  Trash2, 
  Reply, 
  Search, 
  Users, 
  Pin, 
  Paperclip,
  Check,
  ChevronDown,
  Sparkles,
  UploadCloud,
  X,
  Image as ImageIcon,
  ExternalLink,
  Plus,
  MessageSquarePlus,
  ShieldAlert
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { Channel, Message, RichEmbed, ImageAttachment, LinkPreview } from '../../types';
import { RichEmbedCard } from './RichEmbedCard';
import { EmbedStudioModal } from './EmbedStudioModal';
import { ImageLightboxModal } from './ImageLightboxModal';
import { EmbedFormatToolbar } from './EmbedFormatToolbar';
import { GifPickerPopover } from './GifPickerPopover';
import { CreateThreadModal } from '../threads/CreateThreadModal';
import { CreateRiskModal } from '../risk/CreateRiskModal';

const COMMON_EMOJIS = ['👍', '❤️', '🚀', '🔥', '👀', '🎉'];

export const ChatView: React.FC = () => {
  const { activeChannel, teamMembers, sendMessage, deleteMessage } = useWorkspace();
  const { profile, currentUser } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<string | null>(null);

  // Drag and Drop & Staged Uploads
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [stagedImages, setStagedImages] = useState<ImageAttachment[]>([]);
  const [stagedEmbeds, setStagedEmbeds] = useState<RichEmbed[]>([]);

  // Modals
  const [isEmbedStudioOpen, setIsEmbedStudioOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<ImageAttachment | null>(null);
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
  const [isCreateThreadOpen, setIsCreateThreadOpen] = useState(false);
  const [threadParentMessage, setThreadParentMessage] = useState<Message | null>(null);
  const [isCreateRiskOpen, setIsCreateRiskOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time Firestore subscription to channel messages
  useEffect(() => {
    if (!activeChannel) return;

    const q = query(
      collection(db, 'messages'),
      where('channelId', '==', activeChannel.id)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: Message[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Message));
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      // If messages are empty for this channel, provide rich sample embed
      if (list.length === 0) {
        setMessages([
          {
            id: 'msg-seed-sample-1',
            channelId: activeChannel.id,
            authorId: 'user-apex-mehul',
            authorName: 'Mehul Patel',
            authorPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            content: '🚀 Welcome to #' + activeChannel.name + '! Check out our GitHub PR #82 and the Figma architecture design board below:',
            linkPreviews: [
              {
                url: 'https://github.com/apexflow-hq/platform-core/pull/82',
                siteName: 'GitHub',
                domain: 'github.com',
                title: 'apexflow-hq/platform-core • Pull Request #82',
                description: 'Implement WebRTC audio room and peer signaling with Cloud Firestore integration. Review requested.',
                favicon: 'https://github.githubassets.com/favicons/favicon.svg',
                imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80',
              },
              {
                url: 'https://www.figma.com/make/Zxn1VxlDbDpO3yQ8jouGWN/JIRA-clone',
                siteName: 'Figma',
                domain: 'figma.com',
                title: 'JIRA-clone — UI Design & Workspace Specs',
                description: 'Interactive Jira-clone Figma board created by soulinfinityx with Kanban boards, sprint backlogs, and navigation layouts.',
                favicon: 'https://static.figma.com/app/icon/1/favicon.svg',
                imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
              },
            ],
            embeds: [
              {
                id: 'emb-seed-1',
                type: 'custom',
                title: 'Sprint 1 Architecture Milestone & Core Deliverables',
                description: 'WebRTC audio frequency analysis, 25-second presence heartbeat loops, and Jira-clone double-rail layout verified across multi-user environments.',
                authorName: 'ApexFlow Engineering Hub',
                authorIcon: 'https://api.dicebear.com/7.x/bottts/svg?seed=apex',
                fields: [
                  { id: 'f1', name: 'Sprint', value: 'Sprint 1', inline: true },
                  { id: 'f2', name: 'Status', value: 'Active', inline: true },
                  { id: 'f3', name: 'PR #82', value: 'Review requested', inline: true },
                  { id: 'f4', name: 'Presence', value: 'Online (25s ping)', inline: true },
                ],
                buttons: [
                  { id: 'b1', label: 'View Pull Request', url: 'https://github.com/apexflow-hq/platform-core/pull/82', style: 'primary' },
                  { id: 'b2', label: 'Open Figma Canvas', url: 'https://www.figma.com/make/Zxn1VxlDbDpO3yQ8jouGWN/JIRA-clone', style: 'purple' },
                ],
                typography: {
                  fontFamily: 'default',
                  fontSize: 'base',
                  alignment: 'left',
                  isBold: false,
                  textColor: '#f8fafc',
                },
                design: {
                  themePreset: 'slate',
                  accentColor: '#6366f1',
                  bgType: 'linear-gradient',
                  bgColor: '#0f172a',
                  bgGradientStart: '#1e1b4b',
                  bgGradientEnd: '#0f172a',
                  borderStyle: 'solid',
                  borderRadius: 'md',
                  elevation: 'float',
                },
                animation: {
                  transition: 'pop-scale',
                  speed: 'normal',
                  ambient: 'pulse-glow',
                },
              },
            ],
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        setMessages(list);
      }
    });

    return () => unsub();
  }, [activeChannel]);

  if (!activeChannel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-500 text-sm">
        Select a channel to join the conversation
      </div>
    );
  }

  // File processing helper (Images & Animated GIFs)
  const processImageFiles = (files: FileList | File[]) => {
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

  const handleInsertMarkdown = (prefix: string, suffix = '', defaultText = '') => {
    const snippet = `${prefix}${defaultText}${suffix}`;
    setInputText((prev) => (prev ? `${prev} ${snippet}` : snippet));
  };

  // Drag and drop event handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDraggingOver(false);
      dragCounter.current = 0;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFiles(e.dataTransfer.files);
    }
  };

  // Paste screenshots directly from clipboard
  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      processImageFiles(e.clipboardData.files);
    }
  };

  // Submit message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && stagedImages.length === 0 && stagedEmbeds.length === 0) return;

    await sendMessage(
      activeChannel.id,
      inputText.trim(),
      replyingTo
        ? {
            id: replyingTo.id,
            author: replyingTo.authorName,
            content: replyingTo.content.slice(0, 80),
          }
        : undefined,
      {
        images: stagedImages.length ? stagedImages : undefined,
        embeds: stagedEmbeds.length ? stagedEmbeds : undefined,
      }
    );

    setInputText('');
    setReplyingTo(null);
    setStagedImages([]);
    setStagedEmbeds([]);
  };

  const handleSendEmbedFromStudio = (embed: RichEmbed, text?: string) => {
    sendMessage(
      activeChannel.id,
      text || '',
      undefined,
      {
        embeds: [embed],
      }
    );
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    const uid = profile?.uid || currentUser?.uid;
    if (!uid) return;

    const targetMsg = messages.find((m) => m.id === messageId);
    if (!targetMsg) return;

    const currentReactions = { ...(targetMsg.reactions || {}) };
    const currentUsers = currentReactions[emoji] || [];

    if (currentUsers.includes(uid)) {
      currentReactions[emoji] = currentUsers.filter((u) => u !== uid);
      if (currentReactions[emoji].length === 0) {
        delete currentReactions[emoji];
      }
    } else {
      currentReactions[emoji] = [...currentUsers, uid];
    }

    try {
      await updateDoc(doc(db, 'messages', messageId), {
        reactions: currentReactions,
      });
    } catch (e) {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions: currentReactions } : m))
      );
    }
    setShowEmojiPickerFor(null);
  };

  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  if (!activeChannel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs">
        <Hash className="w-10 h-10 mb-2 text-slate-600" />
        <span className="font-semibold text-slate-400">No Channel Selected</span>
        <p className="text-[11px] mt-1 text-slate-500">Select or create a channel in the project sidebar to start chatting.</p>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 min-w-0 flex h-full overflow-hidden bg-[#0b0f19] relative select-none"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Visual Drag and Drop Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-indigo-950/80 backdrop-blur-md border-4 border-dashed border-indigo-500 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-150 p-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-indigo-600/30 border border-indigo-400 flex items-center justify-center text-indigo-300 mb-4 animate-bounce">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight break-words">
            Drop Image to Embed in #{activeChannel.name}
          </h2>
          <p className="text-xs text-indigo-200 mt-1 max-w-md">
            PNG, JPG, WebP, GIF, or SVG supported. Image will be embedded with full zoom lightbox.
          </p>
        </div>
      )}

      {/* Main Chat Thread Area */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Channel Header Bar */}
        <div className="h-14 px-4 sm:px-6 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Hash className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-100 truncate">{activeChannel.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono text-[10px] flex-shrink-0">
                  Text Channel
                </span>
              </div>
              {activeChannel.topic && (
                <p className="text-[11px] text-slate-400 truncate max-w-lg mt-0.5">
                  {activeChannel.topic}
                </p>
              )}
            </div>
          </div>

          {/* Search messages & Embed Studio Button */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsEmbedStudioOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Embed Studio</span>
            </button>

            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channel..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Welcome Channel Banner */}
          <div className="py-6 border-b border-slate-800/80 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 shadow-lg shadow-indigo-950/20">
              <Hash className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-100">Welcome to #{activeChannel.name}!</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              Real-time Firestore collaboration channel. Supports drag & drop images, auto-generated GitHub & Figma link previews, and customizable Word/PPTX embeds.
            </p>
          </div>

          {filteredMessages.map((msg) => {
            const isMe = msg.authorId === (profile?.uid || currentUser?.uid);
            return (
              <div
                key={msg.id}
                className="flex items-start gap-3.5 group hover:bg-slate-900/40 p-2.5 rounded-2xl transition-colors relative"
              >
                <img
                  src={msg.authorPhotoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.authorId}`}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover border border-slate-700 flex-shrink-0 mt-0.5"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  {/* Reply Reference Preview */}
                  {msg.replyToContent && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 border-l-2 border-indigo-500/60 pl-2 font-mono">
                      <Reply className="w-3 h-3 text-slate-600" />
                      <span className="font-semibold text-slate-400">{msg.replyToAuthor}:</span>
                      <span className="truncate max-w-md">{msg.replyToContent}</span>
                    </div>
                  )}

                  {/* Header: Author + Timestamp */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-200">{msg.authorName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Message Text Content */}
                  {msg.content && (
                    <p className="text-xs text-slate-300 leading-relaxed break-words whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  )}

                  {/* 1. Drag & Drop Image Embeds */}
                  {msg.images && msg.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.images.map((img) => (
                        <RichEmbedCard
                          key={img.id}
                          image={img}
                          onImageClick={(i) => setLightboxImage(i)}
                        />
                      ))}
                    </div>
                  )}

                  {/* 2. Smart Link Previews (GitHub, Figma, YouTube, Web) */}
                  {msg.linkPreviews && msg.linkPreviews.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {msg.linkPreviews.map((lp, idx) => (
                        <RichEmbedCard key={idx} linkPreview={lp} />
                      ))}
                    </div>
                  )}

                  {/* 3. Fully Customizable Word / PPTX Embeds */}
                  {msg.embeds && msg.embeds.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {msg.embeds.map((emb) => (
                        <RichEmbedCard key={emb.id} embed={emb} />
                      ))}
                    </div>
                  )}

                  {/* Reactions Bar */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                      {Object.entries(msg.reactions).map(([emoji, uids]) => {
                        const hasReacted = uids.includes(profile?.uid || currentUser?.uid || '');
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(msg.id, emoji)}
                            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs transition-colors cursor-pointer ${
                              hasReacted
                                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="font-mono text-[10px] font-semibold">{uids.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Floating Message Action Toolbar */}
                <div className="absolute right-3 top-2 hidden group-hover:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-xl z-20">
                  <button
                    onClick={() => {
                      setThreadParentMessage(msg);
                      setIsCreateThreadOpen(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
                    title="Start Project Thread from Message"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setReplyingTo(msg)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Reply"
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowEmojiPickerFor(showEmojiPickerFor === msg.id ? null : msg.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="React"
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </button>

                    {showEmojiPickerFor === msg.id && (
                      <div className="absolute right-0 bottom-full mb-1 flex items-center gap-1 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-30">
                        {COMMON_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(msg.id, emoji)}
                            className="p-1 hover:bg-slate-800 rounded text-sm transition-transform hover:scale-125 cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {isMe && (
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Replying Preview Banner */}
        {replyingTo && (
          <div className="px-6 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2 truncate">
              <Reply className="w-3.5 h-3.5 text-indigo-400" />
              <span>Replying to <span className="font-bold text-slate-200">{replyingTo.authorName}</span></span>
              <span className="truncate italic text-slate-500 text-[11px]">"{replyingTo.content.slice(0, 60)}"</span>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-slate-500 hover:text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Staged Images & Embeds Preview Tray before Sending */}
        {(stagedImages.length > 0 || stagedEmbeds.length > 0) && (
          <div className="px-6 py-3 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center gap-3">
            {stagedImages.map((img) => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden border border-indigo-500/50 shadow-md w-20 h-16 bg-slate-950">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                {img.isGif && (
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-purple-600 text-white font-mono text-[9px] font-extrabold uppercase">
                    GIF
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setStagedImages(stagedImages.filter((i) => i.id !== img.id))}
                  className="absolute top-1 right-1 p-1 rounded-full bg-slate-950/80 text-white hover:bg-rose-600 transition-colors"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {stagedEmbeds.map((emb) => (
              <div key={emb.id} className="px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-xs text-indigo-200 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold">{emb.title || 'Custom Embed Attached'}</span>
                <button
                  type="button"
                  onClick={() => setStagedEmbeds(stagedEmbeds.filter((e) => e.id !== emb.id))}
                  className="p-1 hover:text-rose-400 text-slate-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Message Input Box & Embed Format Toolbar */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800/80">
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 focus-within:border-indigo-500 transition-colors shadow-lg">
            <EmbedFormatToolbar
              onInsertMarkdown={handleInsertMarkdown}
              onOpenImageUpload={() => fileInputRef.current?.click()}
              onToggleGifPicker={() => setIsGifPickerOpen(!isGifPickerOpen)}
              onOpenEmbedStudio={() => setIsEmbedStudioOpen(true)}
              onOpenRiskModal={() => setIsCreateRiskOpen(true)}
            />

            <form onSubmit={handleSend} className="relative flex items-center p-2.5">
              {/* Hidden native file input for image/gif uploads */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    processImageFiles(e.target.files);
                  }
                }}
              />

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onPaste={handlePaste}
                placeholder={`Message #${activeChannel.name} (Drop images/GIFs, paste URLs for live link embeds)...`}
                className="w-full pl-3 pr-14 py-2 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none font-sans"
              />

              {/* Right Submit Button */}
              <button
                type="submit"
                disabled={!inputText.trim() && stagedImages.length === 0 && stagedEmbeds.length === 0}
                className="absolute right-2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all shadow-md shadow-indigo-600/25 active:scale-95 cursor-pointer flex-shrink-0"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Channel Members Panel */}
      <div className="w-56 border-l border-slate-800/80 bg-slate-900/40 hidden lg:flex flex-col p-4 space-y-4 flex-shrink-0 min-w-0">
        <div className="min-w-0">
          <div className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
            Online — {teamMembers.filter((m) => m.presence?.status === 'online').length}
          </div>
          <div className="space-y-1">
            {teamMembers
              .filter((m) => m.presence?.status === 'online')
              .map((member) => (
                <div key={member.uid} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/40 text-xs min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={member.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${member.uid}`}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover border border-slate-700"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                  </div>
                  <div className="truncate min-w-0 flex-1">
                    <div className="font-semibold text-slate-200 truncate">{member.displayName}</div>
                    <div className="text-[10px] text-slate-500 truncate">{member.presence?.currentActivity || 'Active'}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="min-w-0">
          <div className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
            Offline — {teamMembers.filter((m) => m.presence?.status !== 'online').length}
          </div>
          <div className="space-y-1 opacity-60">
            {teamMembers
              .filter((m) => m.presence?.status !== 'online')
              .map((member) => (
                <div key={member.uid} className="flex items-center gap-2 p-1.5 rounded-xl text-xs min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={member.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${member.uid}`}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover border border-slate-700 grayscale"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-slate-600 ring-2 ring-slate-900" />
                  </div>
                  <div className="truncate min-w-0 flex-1">
                    <div className="font-semibold text-slate-400 truncate">{member.displayName}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Embed Studio Modal */}
      <EmbedStudioModal
        isOpen={isEmbedStudioOpen}
        onClose={() => setIsEmbedStudioOpen(false)}
        channelName={activeChannel.name}
        onSendEmbed={handleSendEmbedFromStudio}
      />

      {/* Image Lightbox Modal */}
      <ImageLightboxModal
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />

      {/* Animated GIF Picker Popover */}
      <GifPickerPopover
        isOpen={isGifPickerOpen}
        onClose={() => setIsGifPickerOpen(false)}
        onSelectGif={(gif) => setStagedImages((prev) => [...prev, gif])}
      />

      {/* Create Project Thread Modal */}
      <CreateThreadModal
        isOpen={isCreateThreadOpen}
        onClose={() => {
          setIsCreateThreadOpen(false);
          setThreadParentMessage(null);
        }}
        parentMessage={threadParentMessage}
      />

      {/* Create Risk Modal */}
      <CreateRiskModal
        isOpen={isCreateRiskOpen}
        onClose={() => setIsCreateRiskOpen(false)}
      />
    </div>
  );
};
