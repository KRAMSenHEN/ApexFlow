import React, { useState } from 'react';
import { Search, Sparkles, X, Flame, CheckCircle, Code, ShieldAlert, Coffee, ThumbsUp } from 'lucide-react';
import { ImageAttachment } from '../../types';

interface GifPickerPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (gif: ImageAttachment) => void;
}

interface CuratedGif {
  id: string;
  name: string;
  category: string;
  url: string;
  previewUrl: string;
}

const CURATED_GIFS: CuratedGif[] = [
  {
    id: 'gif-ship-1',
    name: 'Ship It Rocket',
    category: 'Ship It',
    url: 'https://media.giphy.com/media/mi6t83LFq2abpxlXY9/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/mi6t83LFq2abpxlXY9/giphy.gif',
  },
  {
    id: 'gif-lfg',
    name: 'LFG Celebration',
    category: 'Ship It',
    url: 'https://media.giphy.com/media/l41JGlWa1xYFU955K/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/l41JGlWa1xYFU955K/giphy.gif',
  },
  {
    id: 'gif-coding-fast',
    name: 'Typing at Mach 5',
    category: 'Coding',
    url: 'https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif',
  },
  {
    id: 'gif-hacker-mode',
    name: 'Matrix Code Stream',
    category: 'Coding',
    url: 'https://media.giphy.com/media/ule4akeXnY9Mb2kfTM/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/ule4akeXnY9Mb2kfTM/giphy.gif',
  },
  {
    id: 'gif-bug-hunt',
    name: 'Catching Bugs',
    category: 'Bugs',
    url: 'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif',
  },
  {
    id: 'gif-facepalm',
    name: 'Picard Facepalm',
    category: 'Bugs',
    url: 'https://media.giphy.com/media/6yRVg0HWzgS88/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/6yRVg0HWzgS88/giphy.gif',
  },
  {
    id: 'gif-lgtm',
    name: 'Stamp of Approval (LGTM)',
    category: 'Review',
    url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
  },
  {
    id: 'gif-review-nod',
    name: 'Approving Nod',
    category: 'Review',
    url: 'https://media.giphy.com/media/NEvPzZ8bd1V4Y/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/NEvPzZ8bd1V4Y/giphy.gif',
  },
  {
    id: 'gif-celebrate-dance',
    name: 'Release Day Dance',
    category: 'Celebration',
    url: 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif',
  },
  {
    id: 'gif-coffee-fuel',
    name: 'Coffee Refuel Required',
    category: 'Work',
    url: 'https://media.giphy.com/media/3oriO04qxVReM5rJEA/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/3oriO04qxVReM5rJEA/giphy.gif',
  },
  {
    id: 'gif-risk-alert',
    name: 'Red Alert Sirens',
    category: 'Bugs',
    url: 'https://media.giphy.com/media/HUkOv6BNWcKA0/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/HUkOv6BNWcKA0/giphy.gif',
  },
  {
    id: 'gif-mind-blown',
    name: 'Mind Blown',
    category: 'Celebration',
    url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
  },
];

const CATEGORIES = ['All', 'Ship It', 'Coding', 'Bugs', 'Review', 'Celebration', 'Work'];

export const GifPickerPopover: React.FC<GifPickerPopoverProps> = ({
  isOpen,
  onClose,
  onSelectGif,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  if (!isOpen) return null;

  const filteredGifs = CURATED_GIFS.filter((gif) => {
    const matchesCategory = selectedCategory === 'All' || gif.category === selectedCategory;
    const matchesQuery = !searchQuery.trim() || 
      gif.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gif.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleSelect = (gif: CuratedGif) => {
    onSelectGif({
      id: `gif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      url: gif.url,
      name: `${gif.name}.gif`,
      isGif: true,
      mediaType: 'gif',
    });
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    onSelectGif({
      id: `gif-custom-${Date.now()}`,
      url: customUrl.trim(),
      name: 'Custom Animated GIF.gif',
      isGif: true,
      mediaType: 'gif',
    });
    setCustomUrl('');
    onClose();
  };

  return (
    <div className="absolute bottom-16 right-4 sm:right-16 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[460px] animate-in fade-in slide-in-from-bottom-2 duration-150">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-extrabold text-[10px] tracking-wider uppercase border border-purple-500/30">
            GIF
          </span>
          <span className="font-bold text-xs text-white">GIF Embed Picker</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 pb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search animated GIFs (e.g. ship it, bug, lgtm)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GIF Grid */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2 max-h-56 bg-slate-950/40">
        {filteredGifs.map((gif) => (
          <button
            key={gif.id}
            onClick={() => handleSelect(gif)}
            className="group relative rounded-xl overflow-hidden border border-slate-800 hover:border-purple-500/80 aspect-video bg-slate-900 transition-all text-left focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <img
              src={gif.previewUrl}
              alt={gif.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <span className="text-[10px] font-semibold text-white truncate drop-shadow">
                {gif.name}
              </span>
            </div>
            <span className="absolute top-1.5 right-1.5 px-1 py-0.5 rounded bg-black/70 text-[9px] font-mono text-purple-300 font-bold uppercase pointer-events-none">
              GIF
            </span>
          </button>
        ))}

        {filteredGifs.length === 0 && (
          <div className="col-span-2 py-8 text-center text-xs text-slate-500">
            No matching GIFs found. Paste a custom GIF URL below!
          </div>
        )}
      </div>

      {/* Direct URL input footer */}
      <form onSubmit={handleCustomSubmit} className="p-2.5 bg-slate-950 border-t border-slate-800/80 flex gap-2">
        <input
          type="url"
          placeholder="Or paste direct .gif link..."
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
          className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          disabled={!customUrl.trim()}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-colors flex-shrink-0"
        >
          Add
        </button>
      </form>
    </div>
  );
};
