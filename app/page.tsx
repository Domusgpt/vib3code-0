'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { BlogPost, contentCategories } from '@/lib/blog-config';

interface BlogSection {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  posts?: BlogPost[];
  theme?: typeof contentCategories[keyof typeof contentCategories]['holographicTheme'];
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function hexToRgb(hex: string) {
  const fallback = { r: 34, g: 211, b: 238 };
  if (!hex) {
    return fallback;
  }

  const sanitized = hex.replace('#', '').trim();
  if (!sanitized) {
    return fallback;
  }

  const normalized = sanitized.length === 3
    ? sanitized.split('').map((char) => char + char).join('')
    : sanitized.padEnd(6, sanitized[sanitized.length - 1] ?? '0').slice(0, 6);

  const int = Number.parseInt(normalized, 16);
  if (Number.isNaN(int)) {
    return fallback;
  }

  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255
  };
}

function tintHexColor(hex: string, ratio: number) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (channel: number) => Math.round(clamp(channel + (255 - channel) * ratio, 0, 255));
  return `#${mix(r).toString(16).padStart(2, '0')}${mix(g).toString(16).padStart(2, '0')}${mix(b).toString(16).padStart(2, '0')}`;
}

function rgbaString(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

interface AccentPalette {
  base: string;
  highlight: string;
  soft: string;
  glow: string;
  border: string;
  translucent: string;
}

function createAccentPalette(color?: string): AccentPalette {
  const formatted = color && /^#?[0-9A-Fa-f]{3,8}$/.test(color)
    ? color.startsWith('#')
      ? color
      : `#${color}`
    : '#22d3ee';
  const highlight = tintHexColor(formatted, 0.25);
  const soft = tintHexColor(formatted, 0.5);

  return {
    base: formatted,
    highlight,
    soft,
    glow: rgbaString(formatted, 0.32),
    border: rgbaString(formatted, 0.55),
    translucent: rgbaString(soft, 0.18)
  };
}

const heroStats = [
  {
    label: 'Live geometry feeds',
    value: '08',
    description: 'Simultaneous hyper-surfaces diffusing the editorial signal.'
  },
  {
    label: 'Research frequency',
    value: '24.6Hz',
    description: 'Average cadence of experimental dispatches released each cycle.'
  },
  {
    label: 'Resonance index',
    value: '97%',
    description: 'Audience synchrony measured across avant-garde cohorts.'
  }
];

function AvantGardeBackground({ activeHue }: { activeHue: number }) {
  const normalized = ((activeHue % 1) + 1) % 1;
  const hue = Math.round(normalized * 360);
  const offsetHue = (offset: number) => (hue + offset + 360) % 360;

  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#050510] to-black" />
      <div
        className="absolute inset-0 opacity-80 transition-colors duration-700"
        style={{
          background: `
            radial-gradient(circle at 18% 24%, hsla(${hue}, 95%, 62%, 0.25) 0%, transparent 55%),
            radial-gradient(circle at 82% 16%, hsla(${offsetHue(40)}, 90%, 58%, 0.18) 0%, transparent 52%),
            radial-gradient(circle at 50% 80%, hsla(${offsetHue(-60)}, 88%, 55%, 0.18) 0%, transparent 65%)
          `
        }}
      />
      <div
        className="absolute -inset-[30%] animate-[backgroundOrbit_120s_linear_infinite] blur-3xl opacity-70"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, hsla(${hue}, 95%, 60%, 0.3) 0%, hsla(${offsetHue(90)}, 80%, 60%, 0.22) 45%, hsla(${offsetHue(200)}, 85%, 55%, 0.26) 80%, hsla(${hue}, 95%, 60%, 0.3) 100%)`
        }}
      />
      <div
        className="absolute inset-0 mix-blend-screen opacity-45"
        style={{
          backgroundImage: `linear-gradient(120deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: '160px 160px',
          transform: 'skewY(-6deg)',
          animation: 'gridDrift 60s linear infinite'
        }}
      />
    </div>
  );
}

function HeroSection({
  categories,
  onExplore,
  onNavigate
}: {
  categories: BlogSection[];
  onExplore: () => void;
  onNavigate: (id: string) => void;
}) {
  const previewCategories = categories.slice(0, 4);
  const finalSectionId = categories[categories.length - 1]?.id;

  return (
    <motion.section
      id="hero"
      className="relative flex min-h-screen items-center pt-36 pb-20 md:pt-32"
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-10 hidden h-[160px] w-px -translate-x-1/2 bg-gradient-to-b from-white/0 via-white/30 to-white/0 md:block" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 lg:flex-row">
        <div className="flex-1 space-y-10">
          <motion.span
            className="text-xs uppercase tracking-[0.6em] text-gray-400"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
          >
            Avant-garde research dispatch
          </motion.span>

          <motion.h1
            className="text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease: 'easeOut' }}
          >
            VIB3CODE turns the idea of a blog into a luminous performance instrument.
          </motion.h1>

          <motion.p
            className="max-w-2xl text-lg leading-relaxed text-gray-300"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9, ease: 'easeOut' }}
          >
            Each dispatch fuses research prose with kinetic geometry, orchestrating transitions, hover reactions,
            and sonic pacing that feel more like a live studio than a publication. The framework is precise,
            the execution is indulgently fluid.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
          >
            <button
              type="button"
              onClick={onExplore}
              className="rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-black shadow-[0_20px_60px_rgba(96,245,255,0.4)] transition-transform hover:scale-105"
            >
              Initiate the sequence
            </button>
            {finalSectionId && (
              <button
                type="button"
                onClick={() => onNavigate(finalSectionId)}
                className="rounded-full border border-white/20 px-6 py-3 text-sm uppercase tracking-[0.3em] text-gray-300 transition hover:border-white/40 hover:text-white"
              >
                Immerse deeper
              </button>
            )}
          </motion.div>

          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.9, ease: 'easeOut' }}
          >
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
              >
                <div className="text-xs uppercase tracking-[0.4em] text-gray-400">{stat.label}</div>
                <div className="mt-4 text-3xl font-semibold text-white">{stat.value}</div>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">{stat.description}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="lg:w-[340px] space-y-6"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.9, ease: 'easeOut' }}
        >
          <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.5em] text-gray-400">Signal pathways</div>
            <div className="mt-4 space-y-4">
              {previewCategories.length > 0 ? (
                previewCategories.map((category, index) => {
                  const palette = createAccentPalette(category.theme?.primaryColor);
                  return (
                    <motion.button
                      key={category.id}
                      type="button"
                      onClick={() => onNavigate(category.id)}
                      className="group w-full rounded-2xl border px-5 py-6 text-left transition-all"
                      whileHover={{ x: 8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        borderColor: palette.border,
                        background: `linear-gradient(120deg, ${palette.translucent} 0%, rgba(8,8,20,0.65) 100%)`,
                        boxShadow: `0 18px 45px ${palette.glow}`
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs uppercase tracking-[0.4em] text-gray-400">
                            {String(index + 1).padStart(2, '0')}
                          </div>
                          <div className="mt-2 text-lg font-semibold text-white">{category.title}</div>
                        </div>
                        <span className="text-xs uppercase tracking-[0.3em] text-gray-300">
                          {category.posts && category.posts.length > 0
                            ? `${category.posts.length.toString().padStart(2, '0')} pieces`
                            : 'Curating'}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-gray-300">{category.content}</p>
                    </motion.button>
                  );
                })
              ) : (
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Content calibrating...</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

function ArticleCard({
  post,
  palette,
  index
}: {
  post: BlogPost;
  palette: AccentPalette;
  index: number;
}) {
  const formattedDate = dateFormatter.format(post.publishedAt);
  const initials = post.author.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const tags = post.tags.slice(0, 4);

  return (
    <motion.article
      className="group relative overflow-hidden rounded-3xl border bg-white/[0.02] p-8 backdrop-blur-xl transition"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      whileHover={{ x: 12, y: -6 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        borderColor: palette.border,
        boxShadow: `0 25px 70px ${palette.glow}`
      }}
    >
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `linear-gradient(120deg, ${palette.translucent} 0%, rgba(10,10,22,0.92) 100%)`
        }}
      />
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-gray-400">
          <span className="inline-flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-black"
              style={{ background: palette.highlight }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>{post.category.replace('-', ' ')}</span>
          </span>
          <span style={{ color: palette.highlight }}>{post.readingTime} min read</span>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-white transition-colors group-hover:text-white">
            {post.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-300">{post.excerpt}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{formattedDate}</span>
          <div className="flex items-center gap-3 text-gray-300">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-10 w-10 rounded-full border border-white/20 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-sm text-gray-200">
                {initials}
              </div>
            )}
            <span className="text-sm font-medium text-white">{post.author.name}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-gray-300"
              style={{ borderColor: palette.border }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

function AvantGardeSection({ section, index }: { section: BlogSection; index: number }) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { amount: 0.35, margin: '-20% 0px' });
  const palette = useMemo(() => createAccentPalette(section.theme?.primaryColor), [section.theme?.primaryColor]);
  const contentPosts = section.posts ?? [];
  const averageReadingTime = useMemo(() => {
    if (!contentPosts.length) {
      return null;
    }
    const total = contentPosts.reduce((acc, post) => acc + post.readingTime, 0);
    return Math.round(total / contentPosts.length);
  }, [contentPosts]);

  return (
    <motion.section
      ref={sectionRef}
      id={section.id}
      className="relative py-28"
      initial={{ opacity: 0, y: 120 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0.6, y: 40 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
        <div className="absolute left-[8%] top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-white/20 to-transparent lg:block" />
        <div
          className="absolute right-10 top-12 h-72 w-72 rounded-full blur-3xl"
          style={{ background: rgbaString(palette.highlight, 0.22) }}
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 lg:flex-row">
        <motion.div
          className="lg:w-[420px] space-y-6"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 20 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div
            className="rounded-3xl border border-white/10 bg-black/50 p-8 backdrop-blur-xl"
            style={{ boxShadow: `0 30px 80px ${palette.glow}` }}
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.5em] text-gray-400">
              <span>Sequence {String(index + 1).padStart(2, '0')}</span>
              <span style={{ color: palette.highlight }}>
                {section.theme?.theme ? section.theme.theme.replace(/-/g, ' ') : 'holographic'}
              </span>
            </div>
            <h2 className="mt-6 text-4xl font-black text-white">{section.title}</h2>
            <p className="mt-4 text-base leading-relaxed text-gray-300">{section.subtitle}</p>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">{section.content}</p>

            {averageReadingTime !== null && (
              <div className="mt-8 flex items-center gap-6">
                <div>
                  <div className="text-xs uppercase tracking-[0.4em] text-gray-400">Avg read</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{averageReadingTime} min</div>
                </div>
                <div className="h-12 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />
                <div>
                  <div className="text-xs uppercase tracking-[0.4em] text-gray-400">Pieces</div>
                  <div className="mt-1 text-2xl font-semibold text-white">
                    {contentPosts.length.toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          className="flex-1 space-y-6"
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0.6, y: 30 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          {contentPosts.length > 0 ? (
            contentPosts.map((post, postIndex) => (
              <ArticleCard key={post.id} post={post} palette={palette} index={postIndex} />
            ))
          ) : (
            <motion.div
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-gray-400 backdrop-blur-xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              We are currently sculpting pieces for this sequence. Check back as the resonance builds.
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}

function AvantGardeNavigation({
  sections,
  activeSection,
  onNavigate
}: {
  sections: BlogSection[];
  activeSection: string;
  onNavigate: (id: string) => void;
}) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      const progress = total > 0 ? doc.scrollTop / total : 0;
      setScrollProgress(clamp(progress, 0, 1));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!sections.length) {
    return null;
  }

  const navItems = sections.filter((section) => section.id !== 'hero');

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-black/60 px-5 py-4 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.6em] text-gray-400">VIB3CODE</span>
          <span className="text-xs text-gray-300">
            {sections.find((section) => section.id === activeSection)?.title ?? 'Explorer'}
          </span>
        </div>
        <div className="mt-3 flex overflow-x-auto gap-3">
          {navItems.map((section) => {
            const palette = createAccentPalette(section.theme?.primaryColor);
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onNavigate(section.id)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`}
                style={{
                  borderColor: isActive ? palette.border : 'rgba(255,255,255,0.1)',
                  background: isActive ? palette.translucent : 'rgba(15,15,25,0.6)'
                }}
              >
                {section.title}
              </button>
            );
          })}
        </div>
      </nav>

      {navItems.length > 0 && (
        <aside className="fixed left-10 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-6 md:flex">
          <div className="text-xs uppercase tracking-[0.6em] text-gray-500">Navigate</div>
          <div className="relative pl-6">
            <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-white/10 via-white/30 to-white/5" />
            <motion.div
              className="absolute left-0 top-0 w-[3px] rounded-full bg-gradient-to-b from-cyan-400 via-purple-400 to-fuchsia-500"
              style={{ height: '100%', transformOrigin: 'top' }}
              animate={{ scaleY: Math.max(scrollProgress, 0.05) }}
              transition={{ type: 'spring', stiffness: 60, damping: 20 }}
            />
            <div className="flex flex-col gap-4">
              {navItems.map((section, index) => {
                const palette = createAccentPalette(section.theme?.primaryColor);
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => onNavigate(section.id)}
                    className="group relative text-left"
                  >
                    <div className="absolute -left-6 top-1/2 h-px w-4 -translate-y-1/2 bg-white/10 transition-opacity group-hover:opacity-80" />
                    {isActive && (
                      <div
                        className="absolute -left-[18px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full"
                        style={{ background: palette.base, boxShadow: `0 0 12px ${palette.glow}` }}
                      />
                    )}
                    <div
                      className={`text-sm font-medium transition-colors ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                      }`}
                    >
                      <span className="mr-3 text-xs uppercase tracking-[0.4em] text-gray-500">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span>{section.title}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">{section.subtitle}</div>
                    <div
                      className="mt-2 h-px w-16 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: `linear-gradient(90deg, ${palette.translucent}, transparent)` }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      )}
    </>
  );
}

function AdminLink() {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        type="button"
        onClick={() => {
          window.location.href = '/admin';
        }}
        className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.4em] text-gray-500 transition hover:border-white/30 hover:text-white hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
      >
        Admin
      </button>
    </div>
  );
}

export default function HomePage() {
  const [sections, setSections] = useState<BlogSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      const heroSection: BlogSection = {
        id: 'hero',
        title: 'VIB3CODE',
        subtitle: 'Reactive Hyperjournal',
        content:
          'A manifesto-grade editorial surface weaving AI research, sonic choreography, and luminous interface craft.'
      };

      try {
        const { contentAPI } = await import('@/lib/content-api');
        const categoryKeys = Object.keys(contentCategories) as (keyof typeof contentCategories)[];

        const contentSections: BlogSection[] = await Promise.all(
          categoryKeys.map(async (categoryKey): Promise<BlogSection> => {
            const category = contentCategories[categoryKey];
            try {
              const { posts } = await contentAPI.getPostsByCategory(categoryKey);
              return {
                id: categoryKey,
                title: category.name,
                subtitle: category.description,
                content: category.description,
                posts,
                theme: category.holographicTheme
              };
            } catch (error) {
              console.error(`Failed to load ${categoryKey} posts:`, error);
              return {
                id: categoryKey,
                title: category.name,
                subtitle: category.description,
                content: category.description,
                posts: [],
                theme: category.holographicTheme
              };
            }
          })
        );

        if (isMounted) {
          setSections([heroSection, ...contentSections]);
        }
      } catch (error) {
        console.error('Failed to load content:', error);
        if (isMounted) {
          setSections([heroSection]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!sections.length) {
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY + window.innerHeight / 2;
      let currentId = 'hero';

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollY >= offsetTop && scrollY < offsetTop + offsetHeight) {
            currentId = section.id;
            break;
          }
        }
      }

      setActiveSection(currentId);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const contentSections = useMemo(() => sections.filter((section) => section.id !== 'hero'), [sections]);
  const activeHue = useMemo(() => {
    const current = sections.find((section) => section.id === activeSection);
    return current?.theme?.hue ?? 0.62;
  }, [sections, activeSection]);

  const handleNavigate = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }
    const headerOffset = window.innerWidth < 768 ? 140 : 80;
    const top = element.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  const handleExplore = useCallback(() => {
    const firstSection = contentSections[0];
    if (firstSection) {
      handleNavigate(firstSection.id);
    }
  }, [contentSections, handleNavigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white font-[family-name:var(--font-orbitron)]">
        <div className="flex flex-col items-center gap-8">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border border-white/10">
            <div
              className="absolute inset-0 animate-[backgroundOrbit_6s_linear_infinite]"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(34,211,238,0.4), rgba(168,85,247,0.4), rgba(244,114,182,0.4), rgba(34,211,238,0.4))'
              }}
            />
            <div className="absolute inset-3 rounded-full bg-black/80 backdrop-blur-xl" />
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.6em] text-gray-500">VIB3CODE</p>
            <p className="mt-2 text-sm text-gray-300">Calibrating hyper-surfaces...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white font-[family-name:var(--font-orbitron)]">
      <AvantGardeBackground activeHue={activeHue} />
      <AvantGardeNavigation sections={sections} activeSection={activeSection} onNavigate={handleNavigate} />
      <main className="relative z-10 flex flex-col">
        <HeroSection categories={contentSections} onExplore={handleExplore} onNavigate={handleNavigate} />
        {contentSections.map((section, index) => (
          <AvantGardeSection key={section.id} section={section} index={index} />
        ))}
      </main>
      <AdminLink />
    </div>
  );
}

