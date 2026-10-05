import React, { useState } from 'react';
import { 
  ExternalLink, 
  Maximize2, 
  X, 
  Download, 
  Eye, 
  GitPullRequest, 
  Github, 
  FileText, 
  Layers, 
  Play, 
  Sparkles,
  Tv
} from 'lucide-react';
import { RichEmbed, LinkPreview, ImageAttachment } from '../../types';

interface RichEmbedCardProps {
  embed?: RichEmbed;
  linkPreview?: LinkPreview;
  image?: ImageAttachment;
  onImageClick?: (image: ImageAttachment) => void;
}

export const RichEmbedCard: React.FC<RichEmbedCardProps> = ({
  embed,
  linkPreview,
  image,
  onImageClick,
}) => {
  const [isPresenting, setIsPresenting] = useState(false);

  // 1. Image / Animated GIF Attachment Card
  if (image) {
    const isAnimatedGif = image.isGif || image.mediaType === 'gif' || image.name.toLowerCase().endsWith('.gif');
    return (
      <div className="mt-2 max-w-md rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 shadow-lg group relative cursor-pointer"
           onClick={() => onImageClick?.(image)}>
        <img
          src={image.url}
          alt={image.name}
          className="max-h-72 w-auto object-cover rounded-lg group-hover:opacity-95 transition-opacity"
        />
        {isAnimatedGif && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-purple-600/90 text-white font-mono font-extrabold text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1 backdrop-blur-sm border border-purple-400/40">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            GIF
          </span>
        )}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-white font-medium text-xs flex items-center gap-1.5 shadow-xl border border-slate-700">
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>Click to expand ({image.name})</span>
          </span>
        </div>
      </div>
    );
  }

  // 2. Smart Link Preview Card (GitHub, Figma, YouTube, Web)
  if (linkPreview) {
    return (
      <div className="mt-2.5 w-full max-w-xl min-w-0 rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-xl hover:border-slate-700 transition-all flex flex-col sm:flex-row gap-4 group overflow-hidden break-words">
        {linkPreview.imageUrl && (
          <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden flex-shrink-0 relative">
            <img
              src={linkPreview.imageUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-1.5 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
              {linkPreview.favicon ? (
                <img src={linkPreview.favicon} alt="" className="w-3.5 h-3.5 rounded flex-shrink-0" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              )}
              <span className="font-semibold text-slate-300 uppercase tracking-wider truncate">{linkPreview.siteName}</span>
              <span>•</span>
              <span className="font-mono text-slate-500 truncate">{linkPreview.domain}</span>
            </div>

            <h4 className="font-bold text-xs text-slate-100 line-clamp-1 mt-1 group-hover:text-indigo-400 transition-colors break-words">
              {linkPreview.title}
            </h4>

            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed break-words">
              {linkPreview.description}
            </p>
          </div>

          <div className="pt-1">
            <a
              href={linkPreview.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-indigo-300 hover:text-white transition-colors"
            >
              <span>Open in {linkPreview.siteName}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3. Fully Customizable Word + PPTX-Style Rich Embed Card
  if (embed) {
    const typo = embed.typography;
    const design = embed.design;
    const anim = embed.animation;

    // Font Family
    const getFontFamilyClass = () => {
      switch (typo?.fontFamily) {
        case 'orbitron': return 'font-orbitron';
        case 'serif': return 'font-serif-display';
        case 'mono': return 'font-mono';
        case 'display': return 'font-outfit';
        default: return 'font-sans';
      }
    };

    // Transition Class
    const getTransitionClass = () => {
      if (!anim || anim.transition === 'none') return '';
      const speedClass = `speed-${anim.speed || 'normal'}`;
      switch (anim.transition) {
        case 'fade': return `embed-trans-fade ${speedClass}`;
        case 'slide-up': return `embed-trans-slide-up ${speedClass}`;
        case 'slide-down': return `embed-trans-slide-down ${speedClass}`;
        case 'pop-scale': return `embed-trans-pop-scale ${speedClass}`;
        case 'flip-3d': return `embed-trans-flip-3d ${speedClass}`;
        case 'liquid-glow': return `embed-trans-liquid-glow ${speedClass}`;
        case 'shimmer': return `embed-trans-shimmer ${speedClass}`;
        default: return '';
      }
    };

    // Ambient Looping Animation Class
    const getAmbientClass = () => {
      switch (anim?.ambient) {
        case 'pulse-glow': return 'embed-amb-pulse-glow';
        case 'float': return 'embed-amb-float';
        case 'gradient-shift': return 'embed-amb-gradient-shift';
        default: return '';
      }
    };

    // Border Radius
    const getBorderRadius = () => {
      switch (design?.borderRadius) {
        case 'none': return 'rounded-none';
        case 'sm': return 'rounded-lg';
        case 'lg': return 'rounded-3xl';
        case 'full': return 'rounded-[32px]';
        default: return 'rounded-2xl';
      }
    };

    // Background Style
    const getBackgroundStyle = (): React.CSSProperties => {
      if (design?.bgType === 'linear-gradient') {
        return {
          background: `linear-gradient(135deg, ${design.bgGradientStart || '#1e1b4b'}, ${design.bgGradientEnd || '#0f172a'})`,
        };
      }
      if (design?.bgType === 'radial-gradient') {
        return {
          background: `radial-gradient(circle at top left, ${design.bgGradientStart || '#312e81'}, ${design.bgColor || '#0b0f19'} 80%)`,
        };
      }
      if (design?.bgType === 'glassmorphism') {
        return {
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        };
      }
      return {
        backgroundColor: design?.bgColor || '#0f172a',
      };
    };

    const getBorderStyle = (): React.CSSProperties => {
      const color = design?.accentColor || '#6366f1';
      if (design?.borderStyle === 'dashed') {
        return { border: `1.5px dashed ${color}80` };
      }
      if (design?.borderStyle === 'neon-glow') {
        return {
          border: `1.5px solid ${color}`,
          boxShadow: `0 0 20px ${color}50, inset 0 0 15px ${color}20`,
        };
      }
      if (design?.borderStyle === 'gradient') {
        return { border: `1.5px solid ${color}90` };
      }
      return {
        borderLeft: `4px solid ${color}`,
        borderTop: '1px solid rgba(51, 65, 85, 0.5)',
        borderRight: '1px solid rgba(51, 65, 85, 0.5)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
      };
    };

    const buttonColorStyles: Record<string, string> = {
      primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30',
      secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
      success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30',
      danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30',
      purple: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30',
      outline: 'bg-transparent hover:bg-white/10 text-slate-200 border border-slate-600',
    };

    const contentNode = (
      <div
        className={`w-full max-w-xl min-w-0 p-4 sm:p-5 my-2.5 text-xs transition-all shadow-xl overflow-hidden relative break-words ${getFontFamilyClass()} ${getBorderRadius()} ${getTransitionClass()} ${getAmbientClass()}`}
        style={{
          ...getBackgroundStyle(),
          ...getBorderStyle(),
        }}
      >
        {/* Author header */}
        {embed.authorName && (
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 min-w-0 gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {embed.authorIcon && (
                <img src={embed.authorIcon} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
              )}
              {embed.authorUrl ? (
                <a
                  href={embed.authorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-slate-200 hover:underline flex items-center gap-1 text-[11px] truncate"
                >
                  <span className="truncate">{embed.authorName}</span>
                  <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                </a>
              ) : (
                <span className="font-bold text-slate-200 text-[11px] truncate">{embed.authorName}</span>
              )}
            </div>

            {/* Present button toggle */}
            <button
              onClick={() => setIsPresenting(true)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
              title="Present Slide Fullscreen"
            >
              <Tv className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Thumbnail top right */}
        {embed.thumbnailUrl && (
          <img
            src={embed.thumbnailUrl}
            alt=""
            className="w-16 h-16 rounded-xl object-cover float-right ml-3 mb-2 border border-white/20 shadow-md flex-shrink-0"
          />
        )}

        {/* Title */}
        {embed.title && (
          <h3
            className={`font-bold mb-1.5 leading-snug tracking-tight break-words min-w-0 ${
              typo?.fontSize === '2xl'
                ? 'text-lg sm:text-xl'
                : typo?.fontSize === 'xl'
                ? 'text-base sm:text-lg'
                : typo?.fontSize === 'lg'
                ? 'text-sm sm:text-base'
                : 'text-xs sm:text-sm'
            } ${typo?.isUnderline ? 'underline' : ''} ${typo?.isStrikethrough ? 'line-through' : ''} ${
              typo?.isItalic ? 'italic' : ''
            }`}
            style={{
              textAlign: typo?.alignment || 'left',
              color: typo?.isGradientText ? undefined : typo?.textColor || '#ffffff',
              backgroundImage: typo?.isGradientText
                ? 'linear-gradient(90deg, #60a5fa, #c084fc, #f472b6)'
                : undefined,
              WebkitBackgroundClip: typo?.isGradientText ? 'text' : undefined,
              WebkitTextFillColor: typo?.isGradientText ? 'transparent' : undefined,
            }}
          >
            {embed.url ? (
              <a href={embed.url} target="_blank" rel="noreferrer" className="hover:underline break-words">
                {embed.title}
              </a>
            ) : (
              embed.title
            )}
          </h3>
        )}

        {/* Description / Body Text */}
        {embed.description && (
          <div
            className={`leading-relaxed whitespace-pre-wrap break-words min-w-0 ${
              typo?.isItalic ? 'italic' : ''
            } ${typo?.isBold ? 'font-bold' : 'font-normal'}`}
            style={{
              textAlign: typo?.alignment || 'left',
              color: typo?.textColor ? `${typo.textColor}dd` : 'rgba(226, 232, 240, 0.9)',
              backgroundColor: typo?.highlightColor || undefined,
            }}
          >
            {embed.description}
          </div>
        )}

        {/* Key-Value Fields Grid */}
        {embed.fields && embed.fields.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/10 min-w-0">
            {embed.fields.map((f) => (
              <div
                key={f.id}
                className={`space-y-0.5 min-w-0 ${f.inline ? 'col-span-1' : 'col-span-1 sm:col-span-2'}`}
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                  {f.name}
                </div>
                <div className="font-semibold text-slate-200 text-xs break-words">{f.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Main Embed Image */}
        {embed.imageUrl && (
          <div className="mt-3 rounded-xl overflow-hidden border border-white/15 shadow-md">
            <img src={embed.imageUrl} alt="" className="w-full max-h-64 object-cover" />
          </div>
        )}

        {/* Action Buttons Row */}
        {embed.buttons && embed.buttons.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-2 min-w-0">
            {embed.buttons.map((btn) => (
              <a
                key={btn.id}
                href={btn.url}
                target="_blank"
                rel="noreferrer"
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 max-w-full truncate ${
                  buttonColorStyles[btn.style] || buttonColorStyles.primary
                }`}
              >
                <span className="truncate">{btn.label}</span>
                <ExternalLink className="w-3 h-3 opacity-70 flex-shrink-0" />
              </a>
            ))}
          </div>
        )}

        {/* Footer */}
        {(embed.footerText || embed.timestamp) && (
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/10 text-[10px] text-slate-400">
            {embed.footerIcon && (
              <img src={embed.footerIcon} alt="" className="w-3.5 h-3.5 rounded-full" />
            )}
            {embed.footerText && <span>{embed.footerText}</span>}
            {embed.footerText && embed.timestamp && <span>•</span>}
            {embed.timestamp && <span>{new Date(embed.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
          </div>
        )}
      </div>
    );

    // Full-screen Slide Presentation Overlay if presenting
    if (isPresenting) {
      return (
        <>
          {contentNode}
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-8 animate-in fade-in duration-300">
            <button
              onClick={() => setIsPresenting(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-slate-800 text-white hover:bg-slate-700 shadow-2xl transition-all"
              title="Close Presentation"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-full max-w-4xl aspect-video rounded-3xl p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300"
                 style={{
                   ...getBackgroundStyle(),
                   ...getBorderStyle(),
                 }}>
              <div>
                <div className="flex items-center gap-2 text-sm text-indigo-400 font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>ApexFlow Interactive Slide Presentation</span>
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight mb-4">
                  {embed.title}
                </h1>
                <p className="text-base text-slate-200 leading-relaxed max-w-2xl">
                  {embed.description}
                </p>
              </div>

              {embed.fields && embed.fields.length > 0 && (
                <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl bg-black/30 border border-white/10">
                  {embed.fields.map((f) => (
                    <div key={f.id} className="space-y-1">
                      <div className="text-xs font-bold text-slate-400 uppercase">{f.name}</div>
                      <div className="text-lg font-bold text-white">{f.value}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-400">
                <span>{embed.footerText || 'ApexFlow Cloud Engineering'}</span>
                <span>Press ESC or click close to exit slide</span>
              </div>
            </div>
          </div>
        </>
      );
    }

    return contentNode;
  }

  return null;
};
