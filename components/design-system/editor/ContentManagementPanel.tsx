'use client';

import { useState } from 'react';
import { useDesignSystem } from '@/lib/design-system/context';
import type { ManagedContentItem } from '@/lib/design-system/types';

const sectionTypeOptions = ['article_grid', 'video_gallery', 'audio_playlist', 'image_showcase', 'custom_layout'];
const scrollTypes = ['smooth', 'snap', 'infinite'] as const;
const scrollDirections = ['vertical', 'horizontal', 'both'] as const;
const expansionTriggers = ['click', 'hover', 'auto'] as const;
const expansionSizes = ['1.5x', '2x', 'fullscreen'] as const;
const itemTypes: ManagedContentItem['type'][] = ['article', 'video', 'audio', 'image', 'custom'];

interface NewItemState {
  title: string;
  type: ManagedContentItem['type'];
}

const createId = () => Math.random().toString(36).slice(2, 10);

export function ContentManagementPanel() {
  const {
    sections,
    addSection,
    updateSection,
    removeSection,
    addContentItem,
    updateContentItem,
    removeContentItem,
  } = useDesignSystem();

  const [newSectionName, setNewSectionName] = useState('New Section');
  const [newSectionType, setNewSectionType] = useState<string>('article_grid');
  const [newItemState, setNewItemState] = useState<Record<string, NewItemState>>({});

  const handleAddSection = () => {
    const id = `section-${createId()}`;
    addSection({
      id,
      name: newSectionName || 'Untitled Section',
      section_type: newSectionType,
      scrolling: {
        enabled: true,
        scroll_type: 'smooth',
        scroll_direction: 'vertical',
      },
      expansion: {
        enabled: true,
        expansion_trigger: 'click',
        expansion_size: '2x',
      },
      items: [],
    });
    setNewSectionName('New Section');
  };

  const handleAddItem = (sectionId: string) => {
    const draft = newItemState[sectionId] ?? { title: 'Untitled Item', type: 'article' };
    addContentItem(sectionId, {
      id: `item-${createId()}`,
      title: draft.title,
      type: draft.type,
    });
    setNewItemState((prev) => ({
      ...prev,
      [sectionId]: { title: 'Untitled Item', type: 'article' },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-cyan-200 uppercase tracking-widest">Content Management</h3>
        <p className="text-xs text-cyan-200/70">Configure sections, scroll behavior, and interactive expansion.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/80">Add Section</div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs text-cyan-100/80">
            Section Name
            <input
              type="text"
              value={newSectionName}
              onChange={(event) => setNewSectionName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none"
            />
          </label>
          <label className="text-xs text-cyan-100/80">
            Section Type
            <select
              value={newSectionType}
              onChange={(event) => setNewSectionType(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none"
            >
              {sectionTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          onClick={handleAddSection}
          className="mt-3 inline-flex items-center rounded-full bg-cyan-500/30 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500/50"
        >
          Add Section
        </button>
      </div>

      <div className="space-y-5">
        {sections.map((section) => (
          <div key={section.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold text-white/90">{section.name}</div>
                <div className="text-xs text-cyan-200/70">
                  {section.section_type.replace(/_/g, ' ')} · {section.items.length} items
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => removeSection(section.id)}
                  className="rounded-full border border-red-400/40 px-3 py-1 text-red-200/80 hover:bg-red-500/20"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-xs text-cyan-100/80">
                Section Type
                <select
                  value={section.section_type}
                  onChange={(event) =>
                    updateSection(section.id, (prev) => ({ ...prev, section_type: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none"
                >
                  {sectionTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-cyan-100/80">
                Scrolling Enabled
                <input
                  type="checkbox"
                  checked={section.scrolling.enabled}
                  onChange={(event) =>
                    updateSection(section.id, (prev) => ({
                      ...prev,
                      scrolling: { ...prev.scrolling, enabled: event.target.checked },
                    }))
                  }
                  className="ml-2"
                />
              </label>
              <label className="text-xs text-cyan-100/80">
                Scroll Type
                <select
                  value={section.scrolling.scroll_type}
                  onChange={(event) =>
                    updateSection(section.id, (prev) => ({
                      ...prev,
                      scrolling: { ...prev.scrolling, scroll_type: event.target.value as typeof scrollTypes[number] },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none"
                >
                  {scrollTypes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-cyan-100/80">
                Scroll Direction
                <select
                  value={section.scrolling.scroll_direction}
                  onChange={(event) =>
                    updateSection(section.id, (prev) => ({
                      ...prev,
                      scrolling: { ...prev.scrolling, scroll_direction: event.target.value as typeof scrollDirections[number] },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none"
                >
                  {scrollDirections.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-cyan-100/80">
                Expansion Enabled
                <input
                  type="checkbox"
                  checked={section.expansion.enabled}
                  onChange={(event) =>
                    updateSection(section.id, (prev) => ({
                      ...prev,
                      expansion: { ...prev.expansion, enabled: event.target.checked },
                    }))
                  }
                  className="ml-2"
                />
              </label>
              <label className="text-xs text-cyan-100/80">
                Expansion Trigger
                <select
                  value={section.expansion.expansion_trigger}
                  onChange={(event) =>
                    updateSection(section.id, (prev) => ({
                      ...prev,
                      expansion: {
                        ...prev.expansion,
                        expansion_trigger: event.target.value as typeof expansionTriggers[number],
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none"
                >
                  {expansionTriggers.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-cyan-100/80">
                Expansion Size
                <select
                  value={section.expansion.expansion_size}
                  onChange={(event) =>
                    updateSection(section.id, (prev) => ({
                      ...prev,
                      expansion: {
                        ...prev.expansion,
                        expansion_size: event.target.value as typeof expansionSizes[number],
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none"
                >
                  {expansionSizes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Content Items</div>
              <div className="grid gap-3">
                {section.items.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/5 p-3 text-xs text-cyan-100/80 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-semibold text-white/90">{item.title}</div>
                      <div className="text-[10px] uppercase tracking-widest text-cyan-200/70">{item.type}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          updateContentItem(section.id, item.id, (prev) => ({
                            ...prev,
                            title: `${prev.title} • duplicate`,
                          }))
                        }
                        className="rounded-full border border-cyan-400/40 px-3 py-1 text-cyan-200 hover:bg-cyan-500/20"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() => removeContentItem(section.id, item.id)}
                        className="rounded-full border border-red-400/40 px-3 py-1 text-red-200 hover:bg-red-500/20"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-white/70">Add Content Item</div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <input
                    type="text"
                    value={newItemState[section.id]?.title ?? 'Untitled Item'}
                    onChange={(event) =>
                      setNewItemState((prev) => ({
                        ...prev,
                        [section.id]: {
                          title: event.target.value,
                          type: prev[section.id]?.type ?? 'article',
                        },
                      }))
                    }
                    className="rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none"
                  />
                  <select
                    value={newItemState[section.id]?.type ?? 'article'}
                    onChange={(event) =>
                      setNewItemState((prev) => ({
                        ...prev,
                        [section.id]: {
                          title: prev[section.id]?.title ?? 'Untitled Item',
                          type: event.target.value as ManagedContentItem['type'],
                        },
                      }))
                    }
                    className="rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none"
                  >
                    {itemTypes.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => handleAddItem(section.id)}
                  className="mt-3 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-cyan-200 hover:bg-white/20"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-center text-xs text-cyan-200/70">
            No sections yet. Use the form above to create your first content section.
          </div>
        )}
      </div>
    </div>
  );
}
