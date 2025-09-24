'use client';

import { useState } from 'react';

type SectionType = 'article_grid' | 'video_gallery' | 'audio_playlist' | 'image_showcase' | 'custom_layout';

type ScrollType = 'smooth' | 'snap' | 'infinite';
type ScrollDirection = 'vertical' | 'horizontal' | 'both';
type ExpansionTrigger = 'click' | 'hover' | 'auto';
type ExpansionSize = '1.5x' | '2x' | 'fullscreen';

type ContentItem = {
  id: string;
  title: string;
  type: SectionType;
  status: 'draft' | 'published';
};

interface SectionConfiguration {
  sectionType: SectionType;
  scrollingEnabled: boolean;
  scrollType: ScrollType;
  scrollDirection: ScrollDirection;
  expansionEnabled: boolean;
  expansionTrigger: ExpansionTrigger;
  expansionSize: ExpansionSize;
}

const SECTION_OPTIONS: Array<{ label: string; value: SectionType; description: string }> = [
  { label: 'Article Grid', value: 'article_grid', description: 'Responsive grid of written features' },
  { label: 'Video Gallery', value: 'video_gallery', description: 'Immersive video showcase with expansion states' },
  { label: 'Audio Playlist', value: 'audio_playlist', description: 'Reactive audio list with visualizers' },
  { label: 'Image Showcase', value: 'image_showcase', description: 'High-resolution imagery with scroll interplay' },
  { label: 'Custom Layout', value: 'custom_layout', description: 'Fully bespoke layout, manual parameter mapping' }
];

const SCROLL_TYPES: ScrollType[] = ['smooth', 'snap', 'infinite'];
const SCROLL_DIRECTIONS: ScrollDirection[] = ['vertical', 'horizontal', 'both'];
const EXPANSION_TRIGGERS: ExpansionTrigger[] = ['click', 'hover', 'auto'];
const EXPANSION_SIZES: ExpansionSize[] = ['1.5x', '2x', 'fullscreen'];

function createContentItem(type: SectionType): ContentItem {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `content-${Date.now()}`;
  return {
    id,
    title: `${type.replace(/_/g, ' ')} Item`,
    type,
    status: 'draft'
  };
}

export function ContentManagementPanel() {
  const [configuration, setConfiguration] = useState<SectionConfiguration>({
    sectionType: 'article_grid',
    scrollingEnabled: true,
    scrollType: 'smooth',
    scrollDirection: 'vertical',
    expansionEnabled: true,
    expansionTrigger: 'click',
    expansionSize: '1.5x'
  });

  const [items, setItems] = useState<ContentItem[]>([
    createContentItem('article_grid'),
    createContentItem('article_grid')
  ]);

  const updateConfiguration = <Key extends keyof SectionConfiguration>(key: Key, value: SectionConfiguration[Key]) => {
    setConfiguration((current) => ({
      ...current,
      [key]: value
    }));
  };

  const addContentItem = () => {
    setItems((current) => [
      ...current,
      createContentItem(configuration.sectionType)
    ]);
  };

  const updateItemStatus = (id: string, status: ContentItem['status']) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const duplicateItem = (id: string) => {
    setItems((current) => {
      const item = current.find((entry) => entry.id === id);
      if (!item) return current;
      return [
        ...current,
        { ...createContentItem(item.type), title: `${item.title} Copy` }
      ];
    });
  };

  const moveItem = (id: string, direction: -1 | 1) => {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index === -1) return current;
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= current.length) return current;
      const updated = [...current];
      const [removed] = updated.splice(index, 1);
      updated.splice(newIndex, 0, removed);
      return updated;
    });
  };

  return (
    <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Content Management</h2>
        <p className="text-sm text-gray-400">Configure section behavior and manage content ordering.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-emerald-300">Section Type</label>
            <select
              value={configuration.sectionType}
              onChange={(event) => updateConfiguration('sectionType', event.target.value as SectionType)}
              className="mt-2 w-full bg-black/40 border border-emerald-500/40 rounded-lg px-3 py-2 text-sm text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {SECTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-emerald-200/80">
              {SECTION_OPTIONS.find((option) => option.value === configuration.sectionType)?.description}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Scrolling</span>
              <label className="inline-flex items-center space-x-2 text-xs text-emerald-200">
                <input
                  type="checkbox"
                  checked={configuration.scrollingEnabled}
                  onChange={(event) => updateConfiguration('scrollingEnabled', event.target.checked)}
                  className="accent-emerald-400"
                />
                <span>Enabled</span>
              </label>
            </div>

            {configuration.scrollingEnabled && (
              <div className="grid grid-cols-2 gap-3 text-xs text-emerald-200">
                <div>
                  <label className="block text-[10px] uppercase tracking-wide mb-1">Scroll Type</label>
                  <select
                    value={configuration.scrollType}
                    onChange={(event) => updateConfiguration('scrollType', event.target.value as ScrollType)}
                    className="w-full bg-black/50 border border-emerald-500/30 rounded-lg px-2 py-1"
                  >
                    {SCROLL_TYPES.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wide mb-1">Direction</label>
                  <select
                    value={configuration.scrollDirection}
                    onChange={(event) => updateConfiguration('scrollDirection', event.target.value as ScrollDirection)}
                    className="w-full bg-black/50 border border-emerald-500/30 rounded-lg px-2 py-1"
                  >
                    {SCROLL_DIRECTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Expansion</span>
              <label className="inline-flex items-center space-x-2 text-xs text-amber-200">
                <input
                  type="checkbox"
                  checked={configuration.expansionEnabled}
                  onChange={(event) => updateConfiguration('expansionEnabled', event.target.checked)}
                  className="accent-amber-400"
                />
                <span>Enabled</span>
              </label>
            </div>

            {configuration.expansionEnabled && (
              <div className="grid grid-cols-2 gap-3 text-xs text-amber-100">
                <div>
                  <label className="block text-[10px] uppercase tracking-wide mb-1">Trigger</label>
                  <select
                    value={configuration.expansionTrigger}
                    onChange={(event) => updateConfiguration('expansionTrigger', event.target.value as ExpansionTrigger)}
                    className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-2 py-1"
                  >
                    {EXPANSION_TRIGGERS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wide mb-1">Size</label>
                  <select
                    value={configuration.expansionSize}
                    onChange={(event) => updateConfiguration('expansionSize', event.target.value as ExpansionSize)}
                    className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-2 py-1"
                  >
                    {EXPANSION_SIZES.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={addContentItem}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg py-3 text-sm font-semibold hover:from-emerald-400 hover:to-teal-400 transition-all"
          >
            Add Content Item
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-500/20 bg-black/30 overflow-hidden">
        <div className="px-4 py-3 border-b border-emerald-500/20 flex items-center justify-between text-sm text-emerald-100">
          <span>{items.length} content items</span>
        </div>
        <ul className="divide-y divide-emerald-500/10">
          {items.map((item, index) => (
            <li key={item.id} className="px-4 py-3 flex items-center justify-between text-sm text-emerald-100">
              <div>
                <div className="font-semibold text-white">{item.title}</div>
                <div className="text-xs text-emerald-200">
                  {item.type.replace(/_/g, ' ')} · {item.status}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => moveItem(item.id, -1)}
                  disabled={index === 0}
                  className="px-2 py-1 bg-black/40 border border-emerald-500/30 rounded text-xs disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveItem(item.id, 1)}
                  disabled={index === items.length - 1}
                  className="px-2 py-1 bg-black/40 border border-emerald-500/30 rounded text-xs disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  onClick={() => updateItemStatus(item.id, item.status === 'draft' ? 'published' : 'draft')}
                  className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded text-xs"
                >
                  {item.status === 'draft' ? 'Publish' : 'Unpublish'}
                </button>
                <button
                  onClick={() => duplicateItem(item.id)}
                  className="px-2 py-1 bg-black/40 border border-emerald-500/30 rounded text-xs"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="px-2 py-1 bg-red-500/20 border border-red-500/40 rounded text-xs text-red-200"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ContentManagementPanel;
