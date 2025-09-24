'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { BlogPost, contentCategories } from '@/lib/blog-config';

type CategoryKey = keyof typeof contentCategories;

interface CategoryBundle {
  key: CategoryKey;
  name: string;
  description: string;
  posts: BlogPost[];
  theme: (typeof contentCategories)[CategoryKey]['holographicTheme'];
}

type CSSPropertiesWithVars = CSSProperties & Record<string, string | number>;

const NAV_SECTIONS = [
  { id: 'hero', label: 'Prologue' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'resonance', label: 'Resonance' },
  { id: 'chronicle', label: 'Chronicle' },
  { id: 'epilogue', label: 'Epilogue' }
] as const;

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return `rgba(255, 255, 255, ${alpha})`;
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function AvantGardeBackground() {
  return (
    <div className="avant-background" aria-hidden="true">
      <div className="aurora-blob aurora-blob--cyan" />
      <div className="aurora-blob aurora-blob--magenta" />
      <div className="aurora-blob aurora-blob--amber" />
      <div className="avant-grid" />
      <div className="avant-noise" />
    </div>
  );
}

function CategoryOrbit({
  label,
  description,
  theme,
  index
}: {
  label: string;
  description: string;
  theme: CategoryBundle['theme'];
  index: number;
}) {
  const orbitStyle: CSSProperties = {
    backgroundColor: hexToRgba(theme.primaryColor, 0.12),
    borderColor: hexToRgba(theme.primaryColor, 0.45),
    boxShadow: `0 18px 42px -30px ${hexToRgba(theme.primaryColor, 0.65)}`,
    animationDelay: `${index * 0.35}s`
  };

  return (
    <div className="avant-orbit" style={orbitStyle}>
      <span className="block text-[0.65rem] uppercase tracking-[0.45em] text-white/70">
        {label}
      </span>
      <p className="mt-1 text-sm leading-relaxed text-white/60">{description}</p>
    </div>
  );
}

type FeatureCardProps = {
  post: BlogPost;
  accent: string;
  size?: 'default' | 'compact';
};

function FeatureCard({ post, accent, size = 'default' }: FeatureCardProps) {
  const style: CSSPropertiesWithVars = {
    '--avant-border': hexToRgba(accent, 0.4),
    '--avant-border-hover': hexToRgba(accent, 0.65),
    '--avant-background': `linear-gradient(135deg, ${hexToRgba(accent, 0.08)} 0%, rgba(8, 10, 24, 0.78) 70%)`,
    '--avant-shadow': `0 30px 80px -60px ${hexToRgba(accent, 0.45)}`,
    '--avant-shadow-hover': `0 45px 120px -60px ${hexToRgba(accent, 0.55)}`
  };

  const headingClass = size === 'compact' ? 'text-xl' : 'text-2xl';
  const padding = size === 'compact' ? 'p-6' : 'p-8';

  return (
    <div
      className={`avant-card group relative overflow-hidden rounded-[24px] border ${padding}`}
      style={style}
    >
      <div className="flex flex-wrap items-center justify-between text-[0.65rem] uppercase tracking-[0.35em] text-white/50">
        <span>{contentCategories[post.category].name}</span>
        <span>{formatDate(post.publishedAt)}</span>
      </div>
      <h3 className={`mt-4 font-semibold leading-snug text-white transition-colors duration-300 group-hover:text-white ${headingClass}`}>
        {post.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-white/60">{post.excerpt}</p>
      <div className="mt-5 flex flex-wrap items-center justify-between text-[0.6rem] uppercase tracking-[0.45em] text-white/35">
        <span>{post.readingTime} min read</span>
        <span>{post.tags.slice(0, 2).join(' / ')}</span>
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${hexToRgba(accent, 0.35)} 0%, transparent 60%)`
        }}
      />
    </div>
  );
}
function TimelineEntry({ post, index }: { post: BlogPost; index: number }) {
  const theme = contentCategories[post.category].holographicTheme;
  const style: CSSPropertiesWithVars = {
    '--avant-border': hexToRgba(theme.primaryColor, 0.35),
    '--avant-border-hover': hexToRgba(theme.primaryColor, 0.55),
    '--avant-background': `linear-gradient(135deg, rgba(7, 9, 20, 0.88) 0%, ${hexToRgba(theme.primaryColor, 0.12)} 100%)`,
    '--avant-shadow': `0 30px 80px -60px ${hexToRgba(theme.primaryColor, 0.45)}`,
    '--avant-shadow-hover': `0 50px 120px -65px ${hexToRgba(theme.primaryColor, 0.6)}`
  };

  return (
    <div className="relative pl-14">
      <span
        className="absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold tracking-[0.25em]"
        style={{
          borderColor: hexToRgba(theme.primaryColor, 0.55),
          background: hexToRgba(theme.primaryColor, 0.18),
          color: hexToRgba(theme.primaryColor, 0.9),
          boxShadow: `0 0 18px ${hexToRgba(theme.primaryColor, 0.5)}`
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="avant-card overflow-hidden rounded-[24px] border p-7" style={style}>
        <div className="flex flex-wrap items-center justify-between text-[0.65rem] uppercase tracking-[0.35em] text-white/45">
          <span>{formatDate(post.publishedAt)}</span>
          <span>{contentCategories[post.category].name}</span>
        </div>
        <h3 className="mt-4 text-2xl font-semibold leading-snug text-white">{post.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/60">{post.excerpt}</p>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-[0.6rem] uppercase tracking-[0.4em] text-white/35">
          <span>{post.readingTime} min read</span>
          <span>{post.tags.slice(0, 3).join(' · ')}</span>
        </div>
      </div>
    </div>
  );
}

function AvantLoading() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
      <AvantGardeBackground />
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <span className="text-xs uppercase tracking-[0.6em] text-white/50">Initializing Hyper Magazine</span>
        <h1 className="text-5xl font-black tracking-[0.4em] text-white">VIB3CODE</h1>
        <div className="h-px w-40 animate-pulse bg-gradient-to-r from-cyan-400/0 via-cyan-400 to-cyan-400/0" />
        <p className="max-w-md text-sm text-white/50">
          Rendering avant-garde surfaces, synchronizing datasets, and tuning holographic presets.
        </p>
      </div>
    </div>
  );
}

function AdminLink() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        onClick={() => {
          window.location.href = '/admin';
        }}
        className="avant-card rounded-full border px-5 py-2 text-[0.55rem] uppercase tracking-[0.5em] text-white/60 transition-colors hover:text-white"
        style={{
          '--avant-background': 'rgba(12, 16, 30, 0.65)',
          '--avant-border': 'rgba(255, 255, 255, 0.18)',
          '--avant-border-hover': 'rgba(255, 255, 255, 0.28)',
          '--avant-shadow': '0 20px 40px -30px rgba(56, 189, 248, 0.4)',
          '--avant-shadow-hover': '0 30px 60px -35px rgba(56, 189, 248, 0.6)'
        } as CSSPropertiesWithVars}
      >
        Admin Console
      </button>
    </div>
  );
}
export default function HomePage() {
  const [categoryBundles, setCategoryBundles] = useState<CategoryBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<(typeof NAV_SECTIONS)[number]['id']>(NAV_SECTIONS[0].id);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { contentAPI } = await import('@/lib/content-api');
        const keys = Object.keys(contentCategories) as CategoryKey[];
        const bundles: CategoryBundle[] = [];

        for (const key of keys) {
          const category = contentCategories[key];
          const result = await contentAPI.getPostsByCategory(key);
          const posts = [...(result.posts || [])].sort(
            (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
          );

          bundles.push({
            key,
            name: category.name,
            description: category.description,
            posts,
            theme: result.theme
          });
        }

        setCategoryBundles(bundles);
      } catch (err) {
        console.error('Failed to load content:', err);
        setError('We could not reach the reactive archives. Please retry in a few moments.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const body = document.body;
      const html = document.documentElement;
      const height = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );

      const progress = height > window.innerHeight
        ? (window.scrollY / (height - window.innerHeight)) * 100
        : 0;

      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (loading) return;

    const observers: IntersectionObserver[] = [];

    NAV_SECTIONS.forEach((section) => {
      const element = document.getElementById(section.id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(section.id);
            }
          });
        },
        {
          rootMargin: '-35% 0px -35% 0px',
          threshold: 0.2
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [loading]);

  const allPosts = useMemo(
    () => categoryBundles.flatMap((bundle) => bundle.posts),
    [categoryBundles]
  );

  const sortedPosts = useMemo(
    () => [...allPosts].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()),
    [allPosts]
  );

  const heroPost = sortedPosts[0] ?? null;
  const editorialPicks = sortedPosts.slice(1, 5);
  const timelinePosts = sortedPosts.slice(0, 9);
  const averageReadingTime = useMemo(() => {
    if (!allPosts.length) return 0;
    const totalMinutes = allPosts.reduce((total, post) => total + post.readingTime, 0);
    return Math.round(totalMinutes / allPosts.length);
  }, [allPosts]);

  const lastUpdatedAt = useMemo(() => {
    if (!sortedPosts.length) return null;
    return sortedPosts.reduce<Date>((latest, post) => {
      return post.updatedAt.getTime() > latest.getTime() ? post.updatedAt : latest;
    }, sortedPosts[0].updatedAt);
  }, [sortedPosts]);

  const handleNavigate = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return <AvantLoading />;
  }
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <AvantGardeBackground />

      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-blue-400 transition-[width] duration-300"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
        <div className="border-b border-white/10 bg-black/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.7)]" />
              <span className="text-xs uppercase tracking-[0.6em] text-white/60">VIB3CODE</span>
            </Link>
            <div className="hidden items-center gap-6 md:flex">
              {NAV_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => handleNavigate(section.id)}
                  className={`text-[0.6rem] uppercase tracking-[0.45em] transition-colors ${
                    activeSection === section.id
                      ? 'text-white'
                      : 'text-white/45 hover:text-white/80'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="rounded-full border border-white/15 px-5 py-2 text-[0.6rem] uppercase tracking-[0.5em] text-white/60 transition-colors hover:text-white"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <main className="relative z-10 pt-32">
        {error && (
          <div className="mx-auto mb-6 max-w-3xl px-6">
            <div className="avant-card border px-6 py-4 text-sm text-red-200"
              style={{
                '--avant-background': 'rgba(60, 12, 21, 0.6)',
                '--avant-border': 'rgba(248, 113, 113, 0.45)',
                '--avant-shadow': '0 30px 70px -50px rgba(248, 113, 113, 0.4)',
                '--avant-shadow-hover': '0 40px 80px -45px rgba(248, 113, 113, 0.5)'
              } as CSSPropertiesWithVars}
            >
              {error}
            </div>
          </div>
        )}
        <section id="hero" className="relative min-h-screen pb-24">
          <div className="mx-auto grid max-w-7xl gap-16 px-6 pt-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div className="space-y-12">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-2 text-[0.6rem] uppercase tracking-[0.6em] text-white/60">
                Avant-Garde AI Magazine
              </div>
              <h1 className="text-5xl font-black leading-tight tracking-tight text-white drop-shadow-[0_25px_70px_rgba(45,212,191,0.3)] md:text-7xl">
                Reactive HyperAV Chronicles
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl">
                A living publication orchestrating research artefacts, code rituals, and philosophical dispatches from the VIB3CODE collective. Every scroll reveals new harmonics between synthetic cognition and human intuition.
              </p>
              <div className="flex flex-wrap gap-4">
                {categoryBundles.map((bundle, index) => (
                  <CategoryOrbit
                    key={bundle.key}
                    label={bundle.name}
                    description={bundle.description}
                    theme={bundle.theme}
                    index={index}
                  />
                ))}
              </div>
              <div className="grid w-full grid-cols-1 gap-4 pt-12 sm:grid-cols-3">
                <div
                  className="avant-card border p-6 text-center"
                  style={{
                    '--avant-border': 'rgba(56, 189, 248, 0.35)',
                    '--avant-border-hover': 'rgba(56, 189, 248, 0.5)',
                    '--avant-background': 'linear-gradient(135deg, rgba(6, 14, 32, 0.8) 0%, rgba(34, 211, 238, 0.16) 100%)',
                    '--avant-shadow': '0 30px 70px -55px rgba(56, 189, 248, 0.45)',
                    '--avant-shadow-hover': '0 45px 100px -60px rgba(56, 189, 248, 0.55)'
                  } as CSSPropertiesWithVars}
                >
                  <div className="text-3xl font-semibold text-white">{allPosts.length}</div>
                  <div className="mt-2 text-[0.6rem] uppercase tracking-[0.45em] text-white/45">
                    Published Works
                  </div>
                </div>
                <div
                  className="avant-card border p-6 text-center"
                  style={{
                    '--avant-border': 'rgba(190, 242, 100, 0.35)',
                    '--avant-border-hover': 'rgba(190, 242, 100, 0.55)',
                    '--avant-background': 'linear-gradient(135deg, rgba(12, 22, 14, 0.85) 0%, rgba(190, 242, 100, 0.15) 100%)',
                    '--avant-shadow': '0 30px 70px -55px rgba(190, 242, 100, 0.35)',
                    '--avant-shadow-hover': '0 45px 100px -60px rgba(190, 242, 100, 0.45)'
                  } as CSSPropertiesWithVars}
                >
                  <div className="text-3xl font-semibold text-white">{averageReadingTime || 1}m</div>
                  <div className="mt-2 text-[0.6rem] uppercase tracking-[0.45em] text-white/45">
                    Avg. Reading Ritual
                  </div>
                </div>
                <div
                  className="avant-card border p-6 text-center"
                  style={{
                    '--avant-border': 'rgba(167, 139, 250, 0.4)',
                    '--avant-border-hover': 'rgba(167, 139, 250, 0.6)',
                    '--avant-background': 'linear-gradient(135deg, rgba(16, 8, 32, 0.85) 0%, rgba(167, 139, 250, 0.18) 100%)',
                    '--avant-shadow': '0 30px 70px -55px rgba(167, 139, 250, 0.45)',
                    '--avant-shadow-hover': '0 45px 100px -60px rgba(167, 139, 250, 0.55)'
                  } as CSSPropertiesWithVars}
                >
                  <div className="text-3xl font-semibold text-white">
                    {lastUpdatedAt ? formatDate(lastUpdatedAt) : '—'}
                  </div>
                  <div className="mt-2 text-[0.6rem] uppercase tracking-[0.45em] text-white/45">
                    Latest Update
                  </div>
                </div>
              </div>
            </div>

            {heroPost && (
              <div
                className="avant-card relative h-full overflow-hidden rounded-[32px] border p-10"
                style={{
                  '--avant-border': hexToRgba(contentCategories[heroPost.category].holographicTheme.primaryColor, 0.4),
                  '--avant-border-hover': hexToRgba(contentCategories[heroPost.category].holographicTheme.primaryColor, 0.6),
                  '--avant-background': `linear-gradient(160deg, ${hexToRgba(contentCategories[heroPost.category].holographicTheme.primaryColor, 0.12)} 0%, rgba(6, 10, 24, 0.82) 60%)`,
                  '--avant-shadow': `0 45px 90px -60px ${hexToRgba(contentCategories[heroPost.category].holographicTheme.primaryColor, 0.55)}`,
                  '--avant-shadow-hover': `0 55px 110px -65px ${hexToRgba(contentCategories[heroPost.category].holographicTheme.primaryColor, 0.65)}`
                } as CSSPropertiesWithVars}
              >
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3 text-[0.6rem] uppercase tracking-[0.5em] text-white/60">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        background: hexToRgba(contentCategories[heroPost.category].holographicTheme.primaryColor, 0.8),
                        boxShadow: `0 0 18px ${hexToRgba(contentCategories[heroPost.category].holographicTheme.primaryColor, 0.7)}`
                      }}
                    />
                    Lead Chronicle
                  </div>
                  <h2 className="text-3xl font-semibold leading-tight text-white md:text-4xl">{heroPost.title}</h2>
                  <p className="text-base leading-relaxed text-white/70">{heroPost.excerpt}</p>
                  <div className="flex flex-wrap items-center gap-6 text-[0.6rem] uppercase tracking-[0.45em] text-white/40">
                    <span>{formatDate(heroPost.publishedAt)}</span>
                    <span>{heroPost.readingTime} min read</span>
                    <span>{contentCategories[heroPost.category].name}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-4">
                    {heroPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/20 px-3 py-1 text-[0.55rem] uppercase tracking-[0.4em] text-white/55"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        <section id="editorial" className="relative py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">Editorial Constellations</h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
                  Curated dispatches that braid together field notes, theoretical frameworks, and creative prototypes. These are the anchors for the VIB3CODE worldview.
                </p>
              </div>
              <div className="text-[0.6rem] uppercase tracking-[0.45em] text-white/40">
                Updated {lastUpdatedAt ? formatDate(lastUpdatedAt) : 'recently'}
              </div>
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
              {heroPost && (
                <div
                  className="avant-card relative overflow-hidden rounded-[32px] border p-10"
                  style={{
                    '--avant-border': hexToRgba(contentCategories[heroPost.category].holographicTheme.primaryColor, 0.4),
                    '--avant-border-hover': hexToRgba(contentCategories[heroPost.category].holographicTheme.primaryColor, 0.55),
                    '--avant-background': `linear-gradient(145deg, ${hexToRgba(contentCategories[heroPost.category].holographicTheme.primaryColor, 0.16)} 0%, rgba(5, 9, 22, 0.85) 55%)`,
                    '--avant-shadow': `0 40px 90px -55px ${hexToRgba(contentCategories[heroPost.category].holographicTheme.primaryColor, 0.5)}`,
                    '--avant-shadow-hover': `0 55px 110px -60px ${hexToRgba(contentCategories[heroPost.category].holographicTheme.primaryColor, 0.65)}`
                  } as CSSPropertiesWithVars}
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap items-center gap-3 text-[0.6rem] uppercase tracking-[0.45em] text-white/60">
                      Lead Feature • {contentCategories[heroPost.category].name}
                    </div>
                    <h3 className="text-3xl font-semibold leading-snug text-white md:text-4xl">{heroPost.title}</h3>
                    <p className="text-base leading-relaxed text-white/70">{heroPost.excerpt}</p>
                    <div className="grid gap-3 sm:grid-cols-3 text-[0.6rem] uppercase tracking-[0.45em] text-white/40">
                      <span>{formatDate(heroPost.publishedAt)}</span>
                      <span>{heroPost.readingTime} minute dive</span>
                      <span>{heroPost.tags.slice(0, 2).join(' • ')}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {editorialPicks.map((post) => (
                  <FeatureCard
                    key={post.id}
                    post={post}
                    accent={contentCategories[post.category].holographicTheme.primaryColor}
                    size="compact"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
        <section id="resonance" className="relative py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col gap-6 text-center">
              <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">Resonant Fields</h2>
              <p className="mx-auto max-w-3xl text-base leading-relaxed text-white/65 md:text-lg">
                Each category operates as a sonic field with its own colour, cadence, and intensity. Explore the capsules to experience how research, creativity, information theory, and philosophy entwine.
              </p>
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-2">
              {categoryBundles.map((bundle) => (
                <div
                  key={bundle.key}
                  className="avant-card relative overflow-hidden rounded-[32px] border p-10"
                  style={{
                    '--avant-border': hexToRgba(bundle.theme.primaryColor, 0.38),
                    '--avant-border-hover': hexToRgba(bundle.theme.primaryColor, 0.6),
                    '--avant-background': `linear-gradient(135deg, ${hexToRgba(bundle.theme.primaryColor, 0.12)} 0%, rgba(8, 10, 24, 0.82) 65%)`,
                    '--avant-shadow': `0 45px 100px -60px ${hexToRgba(bundle.theme.primaryColor, 0.55)}`,
                    '--avant-shadow-hover': `0 55px 120px -60px ${hexToRgba(bundle.theme.primaryColor, 0.65)}`
                  } as CSSPropertiesWithVars}
                >
                  <div className="flex flex-wrap items-center justify-between text-[0.6rem] uppercase tracking-[0.45em] text-white/50">
                    <span>{bundle.name}</span>
                    <span>{bundle.posts.length} entries</span>
                  </div>
                  <p className="mt-4 text-base leading-relaxed text-white/70">{bundle.description}</p>
                  <div className="mt-8 space-y-5">
                    {bundle.posts.slice(0, 3).map((post) => (
                      <div
                        key={post.id}
                        className="group flex items-start justify-between gap-6 border-b border-white/10 pb-4 last:border-b-0 last:pb-0"
                      >
                        <div>
                          <p className="text-[0.6rem] uppercase tracking-[0.45em] text-white/35">{formatDate(post.publishedAt)}</p>
                          <h4 className="mt-2 text-lg font-semibold leading-snug text-white transition-colors duration-300 group-hover:text-white">
                            {post.title}
                          </h4>
                        </div>
                        <span className="text-[0.6rem] uppercase tracking-[0.45em] text-white/35">{post.readingTime}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="chronicle" className="relative py-32">
          <div className="mx-auto max-w-4xl px-6">
            <div className="text-center">
              <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">Chronicle Timeline</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
                Follow the pulse of our releases. Each entry marks a shift in how we choreograph intelligence, design, and ethics.
              </p>
            </div>
            <div className="avant-timeline mt-16 space-y-12">
              {timelinePosts.map((post, index) => (
                <TimelineEntry key={post.id} post={post} index={index} />
              ))}
            </div>
          </div>
        </section>
        <section id="epilogue" className="relative py-32">
          <div className="mx-auto max-w-4xl px-6">
            <div
              className="avant-card overflow-hidden rounded-[36px] border p-12 text-center"
              style={{
                '--avant-border': 'rgba(59, 130, 246, 0.45)',
                '--avant-border-hover': 'rgba(59, 130, 246, 0.6)',
                '--avant-background': 'linear-gradient(135deg, rgba(9, 13, 32, 0.85) 0%, rgba(59, 130, 246, 0.18) 100%)',
                '--avant-shadow': '0 50px 110px -70px rgba(59, 130, 246, 0.45)',
                '--avant-shadow-hover': '0 60px 130px -75px rgba(59, 130, 246, 0.55)'
              } as CSSPropertiesWithVars}
            >
              <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">Become part of the chorus</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
                Join our dispatches to receive sonic prototypes, research invitations, and editorial essays before they surface on the site.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <input
                  type="email"
                  placeholder="your@email"
                  className="w-full max-w-sm rounded-full border border-white/15 bg-black/60 px-5 py-3 text-sm text-white placeholder:text-white/30 focus:border-cyan-400 focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  className="rounded-full border border-cyan-400/60 bg-cyan-500/20 px-6 py-3 text-sm uppercase tracking-[0.5em] text-white transition-colors hover:bg-cyan-500/30"
                >
                  Join the Signal
                </button>
              </div>
              <p className="mt-6 text-[0.6rem] uppercase tracking-[0.45em] text-white/40">
                No spam. Only luminous transmissions.
              </p>
            </div>
          </div>
        </section>
      </main>

      <AdminLink />
    </div>
  );
}
