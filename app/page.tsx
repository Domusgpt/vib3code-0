'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import type { BlogPost } from '@/lib/blog-config';
import { contentCategories } from '@/lib/blog-config';
import { contentAPI } from '@/lib/content-api';

type CategoryKey = keyof typeof contentCategories;
type CategoryTheme = typeof contentCategories[keyof typeof contentCategories]['holographicTheme'];

interface CategoryScene {
  id: string;
  key: CategoryKey;
  label: string;
  summary: string;
  theme: CategoryTheme;
  posts: BlogPost[];
}

function hexToRgba(hex: string, alpha: number): string {
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized
      .split('')
      .map((char) => char + char)
      .join('');
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  return `rgba(${Number.isFinite(r) ? r : 0}, ${Number.isFinite(g) ? g : 0}, ${
    Number.isFinite(b) ? b : 0
  }, ${alpha})`;
}

function AvantBackdrop() {
  const [cursor, setCursor] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handle = (event: PointerEvent) => {
      const { innerWidth, innerHeight } = window;
      if (!innerWidth || !innerHeight) return;

      const x = (event.clientX / innerWidth) * 100;
      const y = (event.clientY / innerHeight) * 100;
      setCursor({ x, y });
    };

    window.addEventListener('pointermove', handle);
    return () => window.removeEventListener('pointermove', handle);
  }, []);

  const auroraStyle: CSSProperties = {
    background: `radial-gradient(circle at ${cursor.x}% ${cursor.y}%, rgba(34, 211, 238, 0.18), transparent 60%)`,
  };

  const pulseStyle: CSSProperties = {
    background: `radial-gradient(circle at ${cursor.x}% ${cursor.y}%, rgba(168, 85, 247, 0.25), transparent 55%)`,
  };

  const gridStyle: CSSProperties = {
    backgroundImage:
      'linear-gradient(120deg, rgba(148, 163, 184, 0.07) 1px, transparent 1px), linear-gradient(0deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px)',
    backgroundSize: '160px 160px',
    transform: `translate(${(cursor.x - 50) * 0.2}px, ${(cursor.y - 50) * 0.2}px)`,
  };

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-950" />
      <div className="absolute inset-0 mix-blend-screen blur-3xl opacity-70" style={pulseStyle} />
      <div className="absolute inset-0 mix-blend-screen opacity-70" style={auroraStyle} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(59,130,246,0.16),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_78%,rgba(236,72,153,0.16),transparent_68%)]" />
      <div className="absolute inset-0 opacity-60" style={gridStyle} />
    </div>
  );
}

function LoadingChoreography() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative h-32 w-32">
          <div className="absolute inset-0 rounded-full border border-cyan-500/40 animate-spin" style={{ animationDuration: '18s' }} />
          <div
            className="absolute inset-4 rounded-full border border-purple-500/40 animate-spin"
            style={{ animationDuration: '24s', animationDirection: 'reverse' }}
          />
          <div className="absolute inset-10 rounded-full bg-cyan-500/20 blur-2xl" />
          <div className="absolute inset-[38%] rounded-full bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.6)]" />
        </div>
        <p className="text-xs uppercase tracking-[0.6em] text-gray-400">Initializing sequences</p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="max-w-lg rounded-3xl border border-red-500/30 bg-red-500/10 px-10 py-12 text-center backdrop-blur-xl">
        <h2 className="text-3xl font-semibold text-red-200">Signal disrupted</h2>
        <p className="mt-4 text-sm text-red-100/80">{message}</p>
      </div>
    </div>
  );
}

function AvantNavigation({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '');

  useEffect(() => {
    if (!items.length) return;
    setActive(items[0].id);
  }, [items]);

  useEffect(() => {
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { threshold: 0.45 }
    );

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [items]);

  if (!items.length) {
    return null;
  }

  return (
    <div className="fixed top-8 right-8 z-50 hidden lg:block">
      <div className="relative rounded-[28px] border border-white/10 bg-black/60 px-6 py-6 backdrop-blur-xl">
        <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20 opacity-80 blur-xl" />
        <div className="relative flex flex-col gap-4 text-[0.65rem] uppercase tracking-[0.5em] text-gray-400">
          {items.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  setActive(item.id);
                }}
                className={`group text-left transition-all duration-300 ${isActive ? 'text-white' : 'hover:text-cyan-200'}`}
              >
                <span className="flex items-center gap-3">
                  <span className={`h-px w-8 transition-all duration-300 ${isActive ? 'bg-cyan-300' : 'bg-white/20 group-hover:bg-cyan-200'}`} />
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FeaturedOrbit({ featured }: { featured: BlogPost[] }) {
  if (!featured.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-gray-400 backdrop-blur-xl">
        Featured transmissions are calibrating.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 blur-3xl" />
      <div className="relative overflow-x-auto pb-4">
        <div className="flex min-w-max gap-6">
          {featured.map((post) => (
            <article key={post.id} className="group relative w-72 shrink-0">
              <div className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-br from-cyan-400/40 via-transparent to-purple-500/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative h-full rounded-[26px] border border-white/10 bg-black/60 p-6 backdrop-blur-xl transition-transform duration-500 group-hover:-translate-y-2">
                <div className="text-[0.6rem] uppercase tracking-[0.55em] text-gray-500">
                  {post.category.replace('-', ' ')}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white transition-colors duration-300 group-hover:text-cyan-200">
                  {post.title}
                </h3>
                <p className="mt-3 text-sm text-gray-300">{post.excerpt}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span>
                    {post.publishedAt.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-gray-500" />
                  <span>{post.readingTime} min read</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero({ featured, scenes }: { featured: BlogPost[]; scenes: CategoryScene[] }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center px-6 py-32">
      <div className="absolute inset-x-1/2 top-24 h-[60vh] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent" />
      <div className="relative z-10 w-full max-w-6xl space-y-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-8">
            <p className="text-[0.7rem] uppercase tracking-[0.8em] text-cyan-200/70">VIB3CODE — Reactive Hypertext Studio</p>
            <h1 className="text-6xl font-black leading-[0.95] text-white md:text-8xl">
              Avant-Garde
              <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
                Intelligence Dispatch
              </span>
            </h1>
            <p className="text-lg text-gray-300 md:text-xl">
              A polished chronicle of neural aesthetics, critical thought, and creative code. Each dispatch rethinks how AI stories are told—balancing radical experimentation with precise editorial choreography.
            </p>
          </div>
          <div className="flex flex-col items-end gap-4 text-right">
            <span className="text-[0.65rem] uppercase tracking-[0.5em] text-gray-500">Current cycle</span>
            <span className="font-mono text-2xl text-cyan-200 md:text-3xl">{time}</span>
            <span className="text-[0.65rem] uppercase tracking-[0.45em] text-gray-500">
              {scenes.length.toString().padStart(2, '0')} synchronised sequences
            </span>
          </div>
        </div>
        <FeaturedOrbit featured={featured} />
        <div className="flex flex-wrap gap-3">
          {scenes.map((scene) => (
            <span
              key={scene.id}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.65rem] uppercase tracking-[0.45em] text-white/80 backdrop-blur-md"
            >
              {scene.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategorySceneSection({ scene }: { scene: CategoryScene }) {
  const accent = scene.theme?.primaryColor ?? '#22d3ee';
  const accentSoft = hexToRgba(accent, 0.18);
  const accentMedium = hexToRgba(accent, 0.35);
  const accentLine = hexToRgba(accent, 0.6);
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(scene.posts[0]?.id ?? null);

  useEffect(() => {
    setHoveredPostId(scene.posts[0]?.id ?? null);
  }, [scene.posts]);

  const activePost = useMemo(() => {
    if (!scene.posts.length) return null;
    return scene.posts.find((post) => post.id === hoveredPostId) ?? scene.posts[0];
  }, [scene.posts, hoveredPostId]);

  const [primary, ...rest] = scene.posts;

  return (
    <section id={scene.id} className="relative py-32">
      <div
        className="absolute inset-0 -z-10 opacity-60"
        style={{ background: `radial-gradient(circle at 30% 20%, ${accentSoft}, transparent 65%)` }}
      />
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{ background: `radial-gradient(circle at 80% 70%, ${accentMedium}, transparent 70%)` }}
      />
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,2.8fr)_minmax(0,4.2fr)]">
          <div className="space-y-10">
            <div className="space-y-3">
              <p className="text-[0.65rem] uppercase tracking-[0.6em] text-white/60">
                Sequence — {scene.key.toUpperCase()}
              </p>
              <h2 className="text-4xl font-bold text-white md:text-5xl">{scene.label}</h2>
              <p className="text-base text-gray-300 md:text-lg">{scene.summary}</p>
            </div>
            {activePost ? (
              <div
                className="rounded-3xl border bg-black/60 p-8 backdrop-blur-xl"
                style={{ borderColor: accentLine }}
              >
                <div className="text-[0.6rem] uppercase tracking-[0.55em] text-gray-400">Active dispatch</div>
                <div className="mt-4 text-2xl font-semibold text-white">{activePost.title}</div>
                <p className="mt-3 text-sm text-gray-300 md:text-base">{activePost.excerpt}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span>{activePost.author.name}</span>
                  <span className="h-1 w-1 rounded-full bg-gray-500" />
                  <span>
                    {activePost.publishedAt.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-gray-500" />
                  <span>{activePost.readingTime} min read</span>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {activePost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 px-3 py-1 text-[0.6rem] uppercase tracking-[0.4em] text-white/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/15 p-8 text-sm text-gray-400">
                We're preparing the next dispatch.
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-[0.65rem] uppercase tracking-[0.5em] text-white transition-colors duration-300 hover:border-white/40 hover:bg-white/20"
              >
                Enter sequence
              </button>
              <button
                type="button"
                className="rounded-full border border-white/10 px-5 py-3 text-[0.65rem] uppercase tracking-[0.5em] text-gray-300 transition-colors duration-300 hover:border-white/20 hover:text-white"
              >
                Archive index
              </button>
            </div>
          </div>
          <div className="space-y-8">
            {primary ? (
              <div
                key={primary.id}
                onMouseEnter={() => setHoveredPostId(primary.id)}
                onFocus={() => setHoveredPostId(primary.id)}
                tabIndex={0}
                className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-black/60 p-8 outline-none backdrop-blur-2xl transition-transform duration-500 hover:-translate-y-2 focus-visible:-translate-y-2"
                style={{ boxShadow: `0 20px 60px ${hexToRgba(accent, 0.18)}` }}
              >
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: `linear-gradient(135deg, ${accentSoft}, transparent 60%)` }}
                />
                <div className="relative space-y-4">
                  <div className="text-[0.6rem] uppercase tracking-[0.5em] text-gray-400">Prime feature</div>
                  <h3 className="text-3xl font-semibold text-white md:text-4xl">{primary.title}</h3>
                  <p className="text-sm text-gray-300 md:text-base">{primary.excerpt}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span>{primary.author.name}</span>
                    <span className="h-1 w-1 rounded-full bg-gray-500" />
                    <span>
                      {primary.publishedAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-gray-500" />
                    <span>{primary.readingTime} min read</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/15 p-12 text-center text-sm text-gray-400">
                Awaiting first feature.
              </div>
            )}
            {rest.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {rest.map((post) => (
                  <article
                    key={post.id}
                    onMouseEnter={() => setHoveredPostId(post.id)}
                    onFocus={() => setHoveredPostId(post.id)}
                    tabIndex={0}
                    className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-black/50 p-6 outline-none backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1 focus-visible:-translate-y-1"
                  >
                    <div
                      className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{ background: `linear-gradient(135deg, transparent, ${accentSoft})` }}
                    />
                    <div className="relative space-y-3">
                      <h4 className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-cyan-200">{post.title}</h4>
                      <p className="text-sm text-gray-300">{post.excerpt}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[0.6rem] uppercase tracking-[0.4em] text-gray-400">
                        <span>
                          {post.publishedAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span>{post.readingTime}m</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function TransmissionPanel() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section id="dispatch" className="relative py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(14,165,233,0.18),transparent_70%)]" />
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-12 px-6 text-center">
        <div className="space-y-5">
          <p className="text-[0.65rem] uppercase tracking-[0.6em] text-gray-400">Stay in the signal</p>
          <h2 className="text-4xl font-bold text-white md:text-5xl">Subscribe to the avant-garde dispatch</h2>
          <p className="text-base text-gray-300 md:text-lg">
            Receive curated releases, behind-the-scenes prototypes, and philosophical riffs. Zero spam—just meticulously engineered transmissions.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-[30px] border border-white/10 bg-black/60 p-6 backdrop-blur-xl sm:flex-row sm:items-center"
        >
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="your@email"
            className="w-full rounded-full border border-white/10 bg-black/40 px-6 py-3 text-sm text-white placeholder:text-gray-500 focus:border-cyan-400 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="rounded-full border border-white/20 bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 text-sm uppercase tracking-[0.4em] text-white transition-all duration-300 hover:from-cyan-400 hover:to-purple-400"
          >
            Join
          </button>
        </form>
        {submitted ? (
          <div className="text-sm text-cyan-200">Transmission confirmed. Watch your inbox for the next drop.</div>
        ) : (
          <div className="text-sm text-gray-400">We only send when something truly shifts the paradigm.</div>
        )}
        <div className="overflow-hidden rounded-full border border-white/10 bg-white/5 py-4 backdrop-blur-xl">
          <div
            className="flex min-w-max items-center gap-8 text-[0.6rem] uppercase tracking-[0.6em] text-white/70"
            style={{ animation: 'holoMarquee 26s linear infinite' }}
          >
            <span>Meta-Structures</span>
            <span>Neural Poetry</span>
            <span>Counterfactuals</span>
            <span>Synth Designers</span>
            <span>Meta-Structures</span>
            <span>Neural Poetry</span>
            <span>Counterfactuals</span>
            <span>Synth Designers</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterSignature() {
  return (
    <footer className="border-t border-white/10 bg-black/60 py-12 text-center text-sm text-gray-400 backdrop-blur-xl">
      <div className="mx-auto max-w-4xl space-y-3 px-6">
        <p>VIB3CODE — Reactive HyperAV Studio</p>
        <p className="text-xs uppercase tracking-[0.5em] text-gray-500">
          Crafted with deliberate futurism · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const [scenes, setScenes] = useState<CategoryScene[]>([]);
  const [featured, setFeatured] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const categoryKeys = Object.keys(contentCategories) as CategoryKey[];
        const [featuredPosts, sceneResults] = await Promise.all([
          contentAPI.getFeaturedPosts(),
          Promise.all(
            categoryKeys.map(async (key): Promise<CategoryScene> => {
              const { posts, theme } = await contentAPI.getPostsByCategory(key);
              return {
                id: key,
                key,
                label: contentCategories[key].name,
                summary: contentCategories[key].description,
                theme,
                posts,
              };
            })
          ),
        ]);

        if (!active) return;

        setFeatured(featuredPosts);
        setScenes(sceneResults);
      } catch (err) {
        console.error('Failed to load blog content', err);
        if (active) {
          setError('Our transmissions are recalibrating. Please refresh soon.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const navigationItems = useMemo(() => {
    if (!scenes.length) {
      return [
        { id: 'hero', label: 'Origin' },
        { id: 'dispatch', label: 'Dispatch' },
      ];
    }

    return [
      { id: 'hero', label: 'Origin' },
      ...scenes.map((scene) => ({ id: scene.id, label: scene.label })),
      { id: 'dispatch', label: 'Dispatch' },
    ];
  }, [scenes]);

  if (loading) {
    return <LoadingChoreography />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <AvantBackdrop />
      <AvantNavigation items={navigationItems} />
      <main className="relative z-10">
        <Hero featured={featured} scenes={scenes} />
        <div className="space-y-32">
          {scenes.map((scene) => (
            <CategorySceneSection key={scene.id} scene={scene} />
          ))}
        </div>
        <TransmissionPanel />
      </main>
      <FooterSignature />
    </div>
  );
}
