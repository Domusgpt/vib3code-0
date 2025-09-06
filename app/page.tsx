/**
 * VIB3CODE-0 Holographic AI Blog
 * 
 * Professional AI blog with subtle holographic effects
 * Clean, readable layout focused on content
 */

'use client';

import { useEffect, useState } from 'react';
import { BlogPost, contentCategories } from '@/lib/blog-config';

interface BlogSection {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  posts?: BlogPost[];
  theme?: typeof contentCategories[keyof typeof contentCategories]['holographicTheme'];
}

// Simple holographic background effect (no complex visualizers)
function HolographicBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-500/5 to-transparent animate-pulse" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  );
}

// Article card component
function ArticleCard({ post }: { post: BlogPost }) {
  return (
    <article className="bg-black/40 backdrop-blur-sm rounded-lg border border-cyan-500/20 p-6 hover:border-cyan-400/40 transition-all duration-300 group cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
          {post.title}
        </h3>
        <span className="text-sm text-gray-400 whitespace-nowrap ml-4">
          {post.readingTime} min read
        </span>
      </div>
      <p className="text-gray-300 mb-4 leading-relaxed">
        {post.excerpt}
      </p>
      <div className="flex justify-between items-center mb-4">
        <time className="text-sm text-cyan-400">
          {post.publishedAt.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </time>
        <div className="flex items-center space-x-2">
          {post.author.avatar && (
            <img 
              src={post.author.avatar} 
              alt={post.author.name}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span className="text-sm text-gray-400">{post.author.name}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {post.tags.slice(0, 3).map((tag) => (
          <span 
            key={tag}
            className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

// Section component
function BlogSection({ section, isHero = false }: { section: BlogSection, isHero?: boolean }) {
  if (isHero) {
    return (
      <section className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center max-w-4xl mx-auto px-6">
          <h1 className="text-8xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            {section.title}
          </h1>
          <h2 className="text-3xl font-light text-gray-200 mb-8">
            {section.subtitle}
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            {section.content}
          </p>
          <div className="mt-12">
            <button 
              onClick={() => document.getElementById('ai-news')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white px-8 py-4 rounded-lg font-medium hover:from-cyan-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105"
            >
              Explore Articles
            </button>
          </div>
        </div>
      </section>
    );
  }

  const themeColors = section.theme ? {
    from: section.theme.primaryColor + '40',
    to: section.theme.primaryColor + '60'
  } : { from: 'cyan-400', to: 'purple-400' };

  return (
    <section id={section.id} className="min-h-screen py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className={`text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent`}>
            {section.title}
          </h2>
          <h3 className="text-2xl font-light text-gray-300 mb-6">
            {section.subtitle}
          </h3>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {section.content}
          </p>
        </div>

        {section.posts && section.posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {section.posts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {(!section.posts || section.posts.length === 0) && (
          <div className="text-center py-12">
            <div className="text-gray-400">Loading articles...</div>
          </div>
        )}
      </div>
    </section>
  );
}

// Navigation component
function Navigation({ sections }: { sections: BlogSection[] }) {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    if (sections.length === 0) return;
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && scrollPosition >= element.offsetTop && scrollPosition < element.offsetTop + element.offsetHeight) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-black text-cyan-400">
            VIB3CODE
          </div>
          
          <div className="hidden md:flex space-x-8">
            {sections.slice(1).map((section) => (
              <button
                key={section.id}
                onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })}
                className={`text-sm font-medium transition-colors ${
                  activeSection === section.id 
                    ? 'text-cyan-400' 
                    : 'text-gray-400 hover:text-cyan-300'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-cyan-400 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Admin link (hidden, accessible via URL)
function AdminLink() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => window.location.href = '/admin'}
        className="opacity-20 hover:opacity-100 transition-opacity duration-300 text-xs text-gray-500 hover:text-cyan-400"
      >
        Admin
      </button>
    </div>
  );
}

export default function HomePage() {
  const [sections, setSections] = useState<BlogSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        // Hero section (static content)
        const heroSection: BlogSection = {
          id: 'hero',
          title: 'VIB3CODE',
          subtitle: 'AI Research & Development Blog',
          content: 'Exploring the frontiers of artificial intelligence, machine learning, and computational creativity.'
        };

        // Load content for each category
        const categoryKeys = Object.keys(contentCategories) as (keyof typeof contentCategories)[];
        const contentSections: BlogSection[] = [];

        for (const categoryKey of categoryKeys) {
          const category = contentCategories[categoryKey];
          
          try {
            // Fetch posts for this category
            const response = await fetch(`/api/posts?category=${categoryKey}&limit=6`);
            const data = await response.json();
            
            contentSections.push({
              id: categoryKey,
              title: category.name.split(' &')[0], // Shorten for display
              subtitle: category.name,
              content: category.description,
              posts: data.posts || [],
              theme: category.holographicTheme
            });
          } catch (error) {
            console.error(`Failed to load ${categoryKey} posts:`, error);
            // Add section without posts
            contentSections.push({
              id: categoryKey,
              title: category.name.split(' &')[0],
              subtitle: category.name,
              content: category.description,
              posts: [],
              theme: category.holographicTheme
            });
          }
        }

        setSections([heroSection, ...contentSections]);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load content:', error);
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-[family-name:var(--font-orbitron)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-cyan-400 mb-4 animate-pulse">VIB3CODE</div>
          <div className="text-gray-400">Loading holographic blog...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-orbitron)]">
      <HolographicBackground />
      <Navigation sections={sections} />
      
      {/* Hero Section */}
      {sections.length > 0 && (
        <BlogSection section={sections[0]} isHero={true} />
      )}
      
      {/* Content Sections */}
      {sections.slice(1).map((section) => (
        <BlogSection key={section.id} section={section} />
      ))}

      <AdminLink />
    </div>
  );
}