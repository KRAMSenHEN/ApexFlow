import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Type, 
  Palette, 
  Play, 
  Image as ImageIcon, 
  Send, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Plus, 
  Trash2, 
  RefreshCw,
  ExternalLink,
  Sliders,
  Tv
} from 'lucide-react';
import { RichEmbed, EmbedField, EmbedButton, EmbedTransition, EmbedAmbient } from '../../types';
import { RichEmbedCard } from './RichEmbedCard';

interface EmbedStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelName: string;
  onSendEmbed: (embed: RichEmbed, contentText?: string) => void;
}

export const EmbedStudioModal: React.FC<EmbedStudioModalProps> = ({
  isOpen,
  onClose,
  channelName,
  onSendEmbed,
}) => {
  const [activeTab, setActiveTab] = useState<'typography' | 'design' | 'animations' | 'media'>('typography');
  const [accompanyingText, setAccompanyingText] = useState('');

  // Embed State
  const [title, setTitle] = useState('Sprint 1 Architecture Milestone & Release Roadmap');
  const [titleUrl, setTitleUrl] = useState('https://github.com/apexflow-hq/platform-core');
  const [description, setDescription] = useState(
    'Core WebRTC audio signaling, distributed presence heartbeats, and GitHub PR webhook ingest pipeline are successfully deployed and verified across staging.'
  );

  // Typography (Word-Style)
  const [fontFamily, setFontFamily] = useState<'default' | 'sans' | 'mono' | 'serif' | 'display' | 'orbitron'>('default');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl' | '2xl'>('base');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isGradientText, setIsGradientText] = useState(false);
  const [textColor, setTextColor] = useState('#f8fafc');
  const [highlightColor, setHighlightColor] = useState('');

  // Design (Word Page/Canvas Style)
  const [themePreset, setThemePreset] = useState<'custom' | 'slate' | 'cyberpunk' | 'aurora' | 'sunset' | 'matrix' | 'glass' | 'neon'>('slate');
  const [accentColor, setAccentColor] = useState('#6366f1');
  const [bgType, setBgType] = useState<'solid' | 'linear-gradient' | 'radial-gradient' | 'glassmorphism'>('linear-gradient');
  const [bgColor, setBgColor] = useState('#0f172a');
  const [bgGradientStart, setBgGradientStart] = useState('#1e1b4b');
  const [bgGradientEnd, setBgGradientEnd] = useState('#0f172a');
  const [borderStyle, setBorderStyle] = useState<'solid' | 'dashed' | 'gradient' | 'neon-glow' | 'none'>('solid');
  const [borderRadius, setBorderRadius] = useState<'none' | 'sm' | 'md' | 'lg' | 'full'>('md');

  // Author & Footer
  const [authorName, setAuthorName] = useState('Mehul Patel • Lead Architect');
  const [authorIcon, setAuthorIcon] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
  const [authorUrl, setAuthorUrl] = useState('https://github.com/apexflow-hq');
  const [footerText, setFooterText] = useState('ApexFlow Core Engineering • Automated Notification');
  const [footerIcon, setFooterIcon] = useState('https://api.dicebear.com/7.x/bottts/svg?seed=apex');

  // Media
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=200&auto=format&fit=crop&q=80');
  const [imageUrl, setImageUrl] = useState('');

  // Fields
  const [fields, setFields] = useState<EmbedField[]>([
    { id: '1', name: 'Sprint Status', value: 'Active (Sprint 1)', inline: true },
    { id: '2', name: 'Review Status', value: 'Approved (PR #82)', inline: true },
    { id: '3', name: 'Test Coverage', value: '98.4% passing', inline: true },
    { id: '4', name: 'Deployment Target', value: 'Google Cloud Run (asia-southeast1)', inline: true },
  ]);

  // Buttons
  const [buttons, setButtons] = useState<EmbedButton[]>([
    { id: 'b1', label: 'View Pull Request #82', url: 'https://github.com/apexflow-hq/platform-core/pull/82', style: 'primary' },
    { id: 'b2', label: 'Launch Audio Room', url: '#voice', style: 'success' },
  ]);

  // Animations & Transitions (PowerPoint-Style)
  const [transition, setTransition] = useState<EmbedTransition>('pop-scale');
  const [speed, setSpeed] = useState<'fast' | 'normal' | 'dramatic'>('normal');
  const [ambient, setAmbient] = useState<EmbedAmbient>('pulse-glow');
  const [previewKey, setPreviewKey] = useState(0);

  if (!isOpen) return null;

  // Presets applicator
  const applyPreset = (preset: typeof themePreset) => {
    setThemePreset(preset);
    switch (preset) {
      case 'cyberpunk':
        setAccentColor('#ec4899');
        setBgType('linear-gradient');
        setBgGradientStart('#4a044e');
        setBgGradientEnd('#030712');
        setBorderStyle('neon-glow');
        setFontFamily('orbitron');
        setIsGradientText(true);
        setTransition('liquid-glow');
        setAmbient('pulse-glow');
        break;
      case 'aurora':
        setAccentColor('#10b981');
        setBgType('linear-gradient');
        setBgGradientStart('#064e3b');
        setBgGradientEnd('#0f172a');
        setBorderStyle('solid');
        setFontFamily('display');
        setIsGradientText(false);
        setTransition('slide-up');
        setAmbient('gradient-shift');
        break;
      case 'sunset':
        setAccentColor('#f97316');
        setBgType('linear-gradient');
        setBgGradientStart('#7c2d12');
        setBgGradientEnd('#18181b');
        setBorderStyle('solid');
        setFontFamily('serif');
        setIsGradientText(false);
        setTransition('pop-scale');
        setAmbient('float');
        break;
      case 'matrix':
        setAccentColor('#22c55e');
        setBgType('solid');
        setBgColor('#022c22');
        setBorderStyle('neon-glow');
        setFontFamily('mono');
        setIsGradientText(false);
        setTransition('flip-3d');
        setAmbient('pulse-glow');
        break;
      case 'glass':
        setAccentColor('#38bdf8');
        setBgType('glassmorphism');
        setBorderStyle('solid');
        setFontFamily('default');
        setIsGradientText(true);
        setTransition('fade');
        setAmbient('float');
        break;
      case 'neon':
        setAccentColor('#a855f7');
        setBgType('linear-gradient');
        setBgGradientStart('#3b0764');
        setBgGradientEnd('#020617');
        setBorderStyle('neon-glow');
        setFontFamily('orbitron');
        setIsGradientText(true);
        setTransition('shimmer');
        setAmbient('pulse-glow');
        break;
      default:
        // slate default
        setAccentColor('#6366f1');
        setBgType('linear-gradient');
        setBgGradientStart('#1e1b4b');
        setBgGradientEnd('#0f172a');
        setBorderStyle('solid');
        setFontFamily('default');
        setIsGradientText(false);
        setTransition('slide-up');
        setAmbient('none');
        break;
    }
  };

  const handleAddField = () => {
    const newField: EmbedField = {
      id: Date.now().toString(),
      name: 'New Field',
      value: 'Field Value',
      inline: true,
    };
    setFields([...fields, newField]);
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleAddButton = () => {
    const newBtn: EmbedButton = {
      id: Date.now().toString(),
      label: 'New Action',
      url: 'https://github.com',
      style: 'primary',
    };
    setButtons([...buttons, newBtn]);
  };

  const handleRemoveButton = (id: string) => {
    setButtons(buttons.filter((b) => b.id !== id));
  };

  const currentEmbed: RichEmbed = {
    id: `embed-${Date.now()}`,
    type: 'custom',
    title,
    url: titleUrl,
    description,
    authorName,
    authorIcon,
    authorUrl,
    thumbnailUrl,
    imageUrl,
    footerText,
    footerIcon,
    timestamp: new Date().toISOString(),
    fields,
    buttons,
    typography: {
      fontFamily,
      fontSize,
      alignment,
      isBold,
      isItalic,
      isUnderline,
      isStrikethrough,
      isGradientText,
      textColor,
      highlightColor: highlightColor || undefined,
    },
    design: {
      themePreset,
      accentColor,
      bgType,
      bgColor,
      bgGradientStart,
      bgGradientEnd,
      borderStyle,
      borderRadius,
      elevation: 'float',
    },
    animation: {
      transition,
      speed,
      ambient,
    },
  };

  const handleSend = () => {
    onSendEmbed(currentEmbed, accompanyingText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[90vh] overflow-hidden text-xs animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Studio Top Ribbon Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-100 tracking-tight">Embed Studio & Designer</h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-semibold border border-indigo-500/30">
                  Word + PPTX Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Design custom rich embeds with typography ribbons, gradient themes, and presentation transitions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Tab Navigation (Word & PowerPoint Ribbon Style) */}
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/60 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('typography')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'typography'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Typography & Copy (Word)</span>
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'design'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Design & Themes</span>
          </button>

          <button
            onClick={() => setActiveTab('animations')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'animations'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Transitions & Effects (PPTX)</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'media'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Media & Buttons</span>
          </button>
        </div>

        {/* Studio Body: Responsive Two Column Split Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-w-0">
          {/* Left Column: Form & Tools */}
          <div className="w-full md:w-7/12 border-b md:border-b-0 md:border-r border-slate-800 overflow-y-auto p-4 sm:p-5 space-y-5 min-w-0">
            
            {/* TAB 1: TYPOGRAPHY & COPY (WORD-STYLE) */}
            {activeTab === 'typography' && (
              <div className="space-y-4">
                {/* Word Style Toolbar */}
                <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-2">
                  {/* Font Family */}
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value as any)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-medium"
                  >
                    <option value="default">Default (Plus Jakarta)</option>
                    <option value="orbitron">Futuristic (Orbitron)</option>
                    <option value="serif">Editorial Serif (Playfair)</option>
                    <option value="mono">Code Monospace (JetBrains)</option>
                    <option value="display">Outfit Sans</option>
                  </select>

                  {/* Font Size */}
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value as any)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-medium"
                  >
                    <option value="sm">Small (12px)</option>
                    <option value="base">Normal (14px)</option>
                    <option value="lg">Large (16px)</option>
                    <option value="xl">Title (18px)</option>
                    <option value="2xl">Display (22px)</option>
                  </select>

                  <div className="h-5 w-[1px] bg-slate-800" />

                  {/* Format Toggles */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsBold(!isBold)}
                      className={`p-1.5 rounded-lg ${isBold ? 'bg-indigo-600 text-white' : 'hover:bg-slate-900 text-slate-400'}`}
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsItalic(!isItalic)}
                      className={`p-1.5 rounded-lg ${isItalic ? 'bg-indigo-600 text-white' : 'hover:bg-slate-900 text-slate-400'}`}
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsUnderline(!isUnderline)}
                      className={`p-1.5 rounded-lg ${isUnderline ? 'bg-indigo-600 text-white' : 'hover:bg-slate-900 text-slate-400'}`}
                      title="Underline"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsStrikethrough(!isStrikethrough)}
                      className={`p-1.5 rounded-lg ${isStrikethrough ? 'bg-indigo-600 text-white' : 'hover:bg-slate-900 text-slate-400'}`}
                      title="Strikethrough"
                    >
                      <Strikethrough className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="h-5 w-[1px] bg-slate-800" />

                  {/* Alignment */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAlignment('left')}
                      className={`p-1.5 rounded-lg ${alignment === 'left' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-900 text-slate-400'}`}
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAlignment('center')}
                      className={`p-1.5 rounded-lg ${alignment === 'center' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-900 text-slate-400'}`}
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAlignment('right')}
                      className={`p-1.5 rounded-lg ${alignment === 'right' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-900 text-slate-400'}`}
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="h-5 w-[1px] bg-slate-800" />

                  {/* Gradient Text Effect */}
                  <button
                    type="button"
                    onClick={() => setIsGradientText(!isGradientText)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 ${
                      isGradientText
                        ? 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Gradient Text</span>
                  </button>
                </div>

                {/* Title */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Embed Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Headline title..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Title URL */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Title Hyperlink URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={titleUrl}
                    onChange={(e) => setTitleUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Description Body
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Main text content..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                  />
                </div>

                {/* Accompanying message text */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Chat Message Text (Displayed above embed)
                  </label>
                  <input
                    type="text"
                    value={accompanyingText}
                    onChange={(e) => setAccompanyingText(e.target.value)}
                    placeholder="e.g. @channel Please review this design & architecture spec!"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: DESIGN & THEMES */}
            {activeTab === 'design' && (
              <div className="space-y-4">
                {/* 1-Click Theme Presets */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    One-Click Theme Presets
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'slate', name: 'Atlassian Slate', color: 'from-blue-600 to-indigo-900' },
                      { id: 'cyberpunk', name: 'Cyberpunk Neon', color: 'from-pink-500 to-cyan-500' },
                      { id: 'aurora', name: 'Aurora Borealis', color: 'from-emerald-500 to-teal-800' },
                      { id: 'sunset', name: 'Sunset Glow', color: 'from-orange-500 to-rose-700' },
                      { id: 'matrix', name: 'Matrix Emerald', color: 'from-emerald-600 to-black' },
                      { id: 'glass', name: 'Glassmorphism', color: 'from-sky-400/40 to-slate-900/40' },
                      { id: 'neon', name: 'Ultra Purple', color: 'from-purple-600 to-indigo-950' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyPreset(p.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          themePreset === p.id
                            ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                            : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                        }`}
                      >
                        <div className={`w-full h-3 rounded-md bg-gradient-to-r ${p.color} mb-1.5`} />
                        <div className="font-semibold text-slate-200 truncate">{p.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color & Background Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Accent Color Strip
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Background Type
                    </label>
                    <select
                      value={bgType}
                      onChange={(e) => setBgType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                    >
                      <option value="linear-gradient">Multi-Stop Linear Gradient</option>
                      <option value="radial-gradient">Radial Spotlight Gradient</option>
                      <option value="glassmorphism">Frosted Glass Blur</option>
                      <option value="solid">Solid Background Color</option>
                    </select>
                  </div>
                </div>

                {/* Border Style & Radius */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Border Style</label>
                    <select
                      value={borderStyle}
                      onChange={(e) => setBorderStyle(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                    >
                      <option value="solid">Solid Left Accent Bar</option>
                      <option value="neon-glow">Glowing Neon Border</option>
                      <option value="gradient">Gradient Border</option>
                      <option value="dashed">Dashed Technical Border</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Border Radius</label>
                    <select
                      value={borderRadius}
                      onChange={(e) => setBorderRadius(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                    >
                      <option value="none">Sharp Corners (0px)</option>
                      <option value="sm">Subtle Rounded (8px)</option>
                      <option value="md">Smooth Modern (16px)</option>
                      <option value="lg">High Curve (24px)</option>
                      <option value="full">Ultra Pill (32px)</option>
                    </select>
                  </div>
                </div>

                {/* Author & Footer Metadata */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Author Header</label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Mehul Patel"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Footer Note</label>
                    <input
                      type="text"
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      placeholder="e.g. ApexFlow Core Engine"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ANIMATIONS & PPTX TRANSITIONS */}
            {activeTab === 'animations' && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold text-slate-200">PowerPoint-Grade Entry Transitions & Ambient FX</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewKey((k) => k + 1)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-trigger Animation</span>
                  </button>
                </div>

                {/* Transition Choice */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Entry Transition (Triggered when embed appears)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'pop-scale', label: 'Elastic 3D Zoom Pop', desc: 'Bounces in with 3D depth' },
                      { id: 'flip-3d', label: '3D Card Flip', desc: 'Flips forward along perspective axis' },
                      { id: 'liquid-glow', label: 'Liquid Aura Pulse', desc: 'Pulsing dual neon glow wave' },
                      { id: 'shimmer', label: 'Metallic Shimmer Sheen', desc: 'Light beam gliding across card' },
                      { id: 'slide-up', label: 'Elevation Slide Up', desc: 'Smooth spring rise from bottom' },
                      { id: 'slide-down', label: 'Drop In Slide Down', desc: 'Dynamic entrance from top' },
                      { id: 'fade', label: 'Smooth Dissolve Fade', desc: 'Subtle high-contrast fade' },
                      { id: 'none', label: 'None (Instant)', desc: 'Static appearance' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTransition(t.id as any);
                          setPreviewKey((k) => k + 1);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          transition === t.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-slate-200">{t.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed & Ambient */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Animation Speed</label>
                    <select
                      value={speed}
                      onChange={(e) => {
                        setSpeed(e.target.value as any);
                        setPreviewKey((k) => k + 1);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                    >
                      <option value="fast">Fast (0.35s)</option>
                      <option value="normal">Normal (0.65s)</option>
                      <option value="dramatic">Dramatic Cinema (1.25s)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Continuous Ambient FX</label>
                    <select
                      value={ambient}
                      onChange={(e) => setAmbient(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                    >
                      <option value="none">None (Static)</option>
                      <option value="pulse-glow">Breathing Neon Pulse</option>
                      <option value="float">Gentle Vertical Bob</option>
                      <option value="gradient-shift">Shifting Multi-Stop Gradient</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: MEDIA & BUTTONS */}
            {activeTab === 'media' && (
              <div className="space-y-4">
                {/* Images */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Thumbnail Image URL (Top-Right)
                    </label>
                    <input
                      type="url"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Main Banner Image URL
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Key-Value Fields */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Key-Value Attributes ({fields.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddField}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-medium"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Field</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {fields.map((f, idx) => (
                      <div key={f.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={f.name}
                          onChange={(e) => {
                            const updated = [...fields];
                            updated[idx].name = e.target.value;
                            setFields(updated);
                          }}
                          placeholder="Label (e.g. Sprint)"
                          className="w-1/3 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                        />
                        <input
                          type="text"
                          value={f.value}
                          onChange={(e) => {
                            const updated = [...fields];
                            updated[idx].value = e.target.value;
                            setFields(updated);
                          }}
                          placeholder="Value (e.g. Sprint 1)"
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveField(f.id)}
                          className="p-1.5 rounded text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Interactive Buttons ({buttons.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddButton}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-medium"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Button</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {buttons.map((b, idx) => (
                      <div key={b.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={b.label}
                          onChange={(e) => {
                            const updated = [...buttons];
                            updated[idx].label = e.target.value;
                            setButtons(updated);
                          }}
                          placeholder="Button Label"
                          className="w-1/3 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-semibold"
                        />
                        <input
                          type="url"
                          value={b.url}
                          onChange={(e) => {
                            const updated = [...buttons];
                            updated[idx].url = e.target.value;
                            setButtons(updated);
                          }}
                          placeholder="Target URL"
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-[11px]"
                        />
                        <select
                          value={b.style}
                          onChange={(e) => {
                            const updated = [...buttons];
                            updated[idx].style = e.target.value as any;
                            setButtons(updated);
                          }}
                          className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-[11px]"
                        >
                          <option value="primary">Primary</option>
                          <option value="success">Success</option>
                          <option value="danger">Danger</option>
                          <option value="purple">Purple</option>
                          <option value="secondary">Slate</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveButton(b.id)}
                          className="p-1.5 rounded text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Interactive Card Preview */}
          <div className="w-full md:w-5/12 bg-slate-950/60 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto min-w-0">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Live Render Preview</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Channel: #{channelName}
                </span>
              </div>

              {/* Live Preview Embed Card */}
              <div key={previewKey} className="flex justify-center">
                <RichEmbedCard embed={currentEmbed} />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSend}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Embed to #{channelName}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
