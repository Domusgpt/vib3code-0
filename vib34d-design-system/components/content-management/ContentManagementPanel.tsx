'use client';

import { useState } from 'react';
import { useDesignSystem } from '../../core/design-system-context';
import { SectionConfiguration, SectionType, ContentItem } from '../../core/types';

const sectionTypeLabels: Record<SectionType, string> = {
  article_grid: 'Article Grid',
  video_gallery: 'Video Gallery',
  audio_playlist: 'Audio Playlist',
  image_showcase: 'Image Showcase',
  custom_layout: 'Custom Layout'
};

const scrollTypes = ['smooth', 'snap', 'infinite'] as const;
const scrollDirections = ['vertical', 'horizontal', 'both'] as const;
const expansionTriggers = ['click', 'hover', 'auto'] as const;
const expansionSizes = ['1.5x', '2x', 'fullscreen'] as const;

export function ContentManagementPanel() {
  const {
    sections,
    addSection,
    updateSection,
    removeSection,
    addContentItem,
    updateContentItem,
    removeContentItem
  } = useDesignSystem();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSectionExpand = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSectionTypeChange = (section: SectionConfiguration, type: SectionType) => {
    updateSection(section.id, { type, name: sectionTypeLabels[type] });
  };

  const handleAddContent = (section: SectionConfiguration) => {
    const newItem: ContentItem = {
      id: `${section.id}-item-${section.items.length + 1}`,
      title: `Content ${section.items.length + 1}`,
      description: 'Tap to edit description',
      mediaType: section.type === 'video_gallery' ? 'video' : section.type === 'audio_playlist' ? 'audio' : 'text'
    };
    addContentItem(section.id, newItem);
  };

  const handleContentChange = (sectionId: string, item: ContentItem, field: keyof ContentItem, value: string) => {
    updateContentItem(sectionId, item.id, { [field]: value });
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const isExpanded = expandedSections[section.id] ?? true;
        return (
          <div key={section.id} className="bg-black/50 border border-cyan-500/30 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
              <button
                onClick={() => toggleSectionExpand(section.id)}
                className="flex-1 text-left text-sm font-semibold text-cyan-200 hover:text-cyan-100"
              >
                {section.name}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddContent(section)}
                  className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30"
                >
                  Add Content
                </button>
                <button
                  onClick={() => removeSection(section.id)}
                  className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-200 hover:bg-red-500/30"
                >
                  Remove
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="text-xs uppercase tracking-wide text-cyan-100/80">
                    Section Type
                    <select
                      value={section.type}
                      onChange={(event) => handleSectionTypeChange(section, event.target.value as SectionType)}
                      className="mt-1 w-full bg-black/70 border border-cyan-500/40 rounded-lg px-3 py-2 text-sm"
                    >
                      {Object.entries(sectionTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-xs uppercase tracking-wide text-cyan-100/80">
                    Scroll Enabled
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() => updateSection(section.id, { scrolling: { ...section.scrolling, enabled: true } })}
                        className={`px-3 py-1 rounded-full text-xs ${
                          section.scrolling.enabled
                            ? 'bg-emerald-500/30 text-emerald-200'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        On
                      </button>
                      <button
                        onClick={() => updateSection(section.id, { scrolling: { ...section.scrolling, enabled: false } })}
                        className={`px-3 py-1 rounded-full text-xs ${
                          !section.scrolling.enabled
                            ? 'bg-red-500/30 text-red-200'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </label>
                </div>

                {section.scrolling.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="text-xs uppercase tracking-wide text-cyan-100/80">
                      Scroll Type
                      <select
                        value={section.scrolling.scrollType}
                        onChange={(event) =>
                          updateSection(section.id, {
                            scrolling: { ...section.scrolling, scrollType: event.target.value as typeof scrollTypes[number] }
                          })
                        }
                        className="mt-1 w-full bg-black/70 border border-cyan-500/40 rounded-lg px-3 py-2 text-sm"
                      >
                        {scrollTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-xs uppercase tracking-wide text-cyan-100/80">
                      Scroll Direction
                      <select
                        value={section.scrolling.direction}
                        onChange={(event) =>
                          updateSection(section.id, {
                            scrolling: { ...section.scrolling, direction: event.target.value as typeof scrollDirections[number] }
                          })
                        }
                        className="mt-1 w-full bg-black/70 border border-cyan-500/40 rounded-lg px-3 py-2 text-sm"
                      >
                        {scrollDirections.map((direction) => (
                          <option key={direction} value={direction}>
                            {direction}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="text-xs uppercase tracking-wide text-cyan-100/80">
                    Expansion Enabled
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() => updateSection(section.id, { expansion: { ...section.expansion, enabled: true } })}
                        className={`px-3 py-1 rounded-full text-xs ${
                          section.expansion.enabled
                            ? 'bg-emerald-500/30 text-emerald-200'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        Enabled
                      </button>
                      <button
                        onClick={() => updateSection(section.id, { expansion: { ...section.expansion, enabled: false } })}
                        className={`px-3 py-1 rounded-full text-xs ${
                          !section.expansion.enabled
                            ? 'bg-white/20 text-white/70'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        Disabled
                      </button>
                    </div>
                  </label>

                  {section.expansion.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="text-xs uppercase tracking-wide text-cyan-100/80">
                        Trigger
                        <select
                          value={section.expansion.trigger}
                          onChange={(event) =>
                            updateSection(section.id, {
                              expansion: { ...section.expansion, trigger: event.target.value as typeof expansionTriggers[number] }
                            })
                          }
                          className="mt-1 w-full bg-black/70 border border-cyan-500/40 rounded-lg px-3 py-2 text-sm"
                        >
                          {expansionTriggers.map((trigger) => (
                            <option key={trigger} value={trigger}>
                              {trigger}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-xs uppercase tracking-wide text-cyan-100/80">
                        Expansion Size
                        <select
                          value={section.expansion.size}
                          onChange={(event) =>
                            updateSection(section.id, {
                              expansion: { ...section.expansion, size: event.target.value as typeof expansionSizes[number] }
                            })
                          }
                          className="mt-1 w-full bg-black/70 border border-cyan-500/40 rounded-lg px-3 py-2 text-sm"
                        >
                          {expansionSizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-wide text-cyan-100/80">Content Items</h3>
                  {section.items.length === 0 && (
                    <div className="text-xs text-white/50 bg-white/5 border border-white/10 rounded-lg p-4">
                      No content items yet. Use "Add Content" to populate this section.
                    </div>
                  )}

                  {section.items.map((item) => (
                    <div key={item.id} className="bg-black/40 border border-cyan-500/20 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(event) => handleContentChange(section.id, item, 'title', event.target.value)}
                          className="bg-black/70 border border-cyan-500/40 rounded px-3 py-2 text-sm flex-1"
                        />
                        <button
                          onClick={() => removeContentItem(section.id, item.id)}
                          className="ml-3 text-xs px-2 py-1 rounded bg-red-500/20 text-red-200"
                        >
                          Remove
                        </button>
                      </div>
                      <textarea
                        value={item.description}
                        onChange={(event) => handleContentChange(section.id, item, 'description', event.target.value)}
                        className="w-full bg-black/70 border border-cyan-500/40 rounded px-3 py-2 text-sm"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={() => addSection()}
        className="w-full py-3 rounded-xl border border-dashed border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 text-sm"
      >
        Add Section
      </button>
    </div>
  );
}

export default ContentManagementPanel;
