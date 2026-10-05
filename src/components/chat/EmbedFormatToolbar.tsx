import React from 'react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Quote, 
  List, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface EmbedFormatToolbarProps {
  onInsertMarkdown: (prefix: string, suffix?: string, defaultText?: string) => void;
  onOpenImageUpload: () => void;
  onToggleGifPicker: () => void;
  onOpenEmbedStudio: () => void;
  onOpenRiskModal?: () => void;
  isCompact?: boolean;
}

export const EmbedFormatToolbar: React.FC<EmbedFormatToolbarProps> = ({
  onInsertMarkdown,
  onOpenImageUpload,
  onToggleGifPicker,
  onOpenEmbedStudio,
  onOpenRiskModal,
  isCompact = false,
}) => {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-t border-slate-800/80 rounded-t-xl text-slate-400 select-none overflow-x-auto scrollbar-none">
      {/* Left Text Formatting Tools */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <button
          type="button"
          onClick={() => onInsertMarkdown('**', '**', 'bold text')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-100 transition-colors"
          title="Bold (**text**)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onInsertMarkdown('*', '*', 'italic text')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-100 transition-colors"
          title="Italic (*text*)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onInsertMarkdown('~~', '~~', 'strikethrough')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-100 transition-colors"
          title="Strikethrough (~~text~~)"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <span className="w-[1px] h-3.5 bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={() => onInsertMarkdown('`', '`', 'code')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-100 transition-colors"
          title="Inline Code (`code`)"
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onInsertMarkdown('> ', '', 'quoted message')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-100 transition-colors"
          title="Quote Block (> text)"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onInsertMarkdown('- ', '', 'list item')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-100 transition-colors"
          title="Bullet List (- item)"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onInsertMarkdown('[Link title](', ')', 'https://example.com')}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-100 transition-colors"
          title="Insert Link [title](url)"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Embed & Media Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Upload Image / Drag hint */}
        <button
          type="button"
          onClick={onOpenImageUpload}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors"
          title="Upload or Drag & Drop Image"
        >
          <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Image</span>
        </button>

        {/* Animated GIF Picker */}
        <button
          type="button"
          onClick={onToggleGifPicker}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 hover:text-purple-200 text-[11px] font-bold transition-colors"
          title="Pick Animated GIF"
        >
          <span className="text-[10px] font-mono uppercase bg-purple-500/30 px-1 rounded">GIF</span>
        </button>

        {/* Word + PPTX Embed Studio */}
        <button
          type="button"
          onClick={onOpenEmbedStudio}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 border border-indigo-500/40 text-indigo-200 hover:text-white text-[11px] font-semibold transition-all shadow-sm"
          title="Open Word & PPTX Embed Studio"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Embed Studio</span>
        </button>

        {/* Optional Risk Thread Shortcut */}
        {onOpenRiskModal && !isCompact && (
          <button
            type="button"
            onClick={onOpenRiskModal}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 hover:text-rose-100 text-[11px] font-semibold transition-colors"
            title="Log RMMM Risk"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden lg:inline">Log Risk</span>
          </button>
        )}
      </div>
    </div>
  );
};
