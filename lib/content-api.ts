/**
 * VIB3CODE-0 Content API
 * 
 * Unified content management system that can integrate with:
 * - Headless CMS (Sanity, Strapi, Contentful)
 * - Local MDX files for development
 * - Database for user-generated content
 * - AI services for content generation
 */

import { BlogPost, User, contentCategories } from './blog-config';

export interface ContentProvider {
  getPosts(options?: GetPostsOptions): Promise<BlogPost[]>;
  getPost(slug: string): Promise<BlogPost | null>;
  createPost(post: Omit<BlogPost, 'id'>): Promise<BlogPost>;
  updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost>;
  deletePost(id: string): Promise<void>;
  searchPosts(query: string): Promise<BlogPost[]>;
}

export interface GetPostsOptions {
  category?: keyof typeof contentCategories;
  limit?: number;
  offset?: number;
  sortBy?: 'publishedAt' | 'updatedAt' | 'readingTime';
  sortOrder?: 'asc' | 'desc';
  tags?: string[];
  author?: string;
}

// Unified Content API that abstracts different content sources
export class ContentAPI {
  private provider: ContentProvider;

  constructor(provider: ContentProvider) {
    this.provider = provider;
  }

  // Get featured posts for homepage
  async getFeaturedPosts(): Promise<BlogPost[]> {
    return this.provider.getPosts({
      limit: 6,
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    });
  }

  // Get posts by category with holographic theming
  async getPostsByCategory(category: keyof typeof contentCategories): Promise<{
    posts: BlogPost[];
    theme: typeof contentCategories[keyof typeof contentCategories]['holographicTheme'];
  }> {
    const posts = await this.provider.getPosts({ category });
    const theme = contentCategories[category].holographicTheme;
    
    return { posts, theme };
  }

  // Get related posts using AI-powered similarity
  async getRelatedPosts(postId: string, limit: number = 3): Promise<BlogPost[]> {
    // This would integrate with semantic search API
    // For now, return posts from same category
    const currentPost = await this.provider.getPost(postId);
    if (!currentPost) return [];
    
    return this.provider.getPosts({
      category: currentPost.category,
      limit: limit + 1
    }).then(posts => posts.filter(p => p.id !== postId).slice(0, limit));
  }

  // AI-powered content generation
  async generatePostDraft(prompt: string, category: keyof typeof contentCategories): Promise<Partial<BlogPost>> {
    // Integration with OpenAI/Anthropic
    const theme = contentCategories[category];
    
    // This would call AI API with category-specific prompts
    return {
      title: `AI Generated: ${prompt}`,
      excerpt: `Draft article about ${prompt} in ${theme.name}`,
      content: `# ${prompt}\n\nThis is an AI-generated draft that needs human review and editing.`,
      category,
      tags: [category.replace('-', ' ')],
      holographicParams: theme.holographicTheme
    };
  }

  // Search with AI semantic understanding
  async searchPosts(query: string): Promise<BlogPost[]> {
    // This would integrate with Algolia or custom semantic search
    return this.provider.searchPosts(query);
  }

  // Direct provider methods (delegated)
  async getPosts(options?: GetPostsOptions): Promise<BlogPost[]> {
    return this.provider.getPosts(options);
  }

  async getPost(slug: string): Promise<BlogPost | null> {
    return this.provider.getPost(slug);
  }

  async createPost(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
    return this.provider.createPost(post);
  }

  async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    return this.provider.updatePost(id, updates);
  }

  async deletePost(id: string): Promise<void> {
    return this.provider.deletePost(id);
  }
}

// MDX File Provider (for development/static content)
export class MDXContentProvider implements ContentProvider {
  private posts: BlogPost[] = [];

  constructor() {
    // In real implementation, this would read MDX files from filesystem
    this.loadMDXFiles();
  }

  private loadMDXFiles() {
    // Mock data for now - in production, read from /content directory
    this.posts = [
      {
        id: '1',
        title: 'The Future of Large Language Models',
        slug: 'future-of-llms',
        excerpt: 'Exploring the next generation of AI language models and their potential impact on society.',
        content: `# The Future of Large Language Models\n\nLarge Language Models (LLMs) have revolutionized...`,
        author: {
          name: 'AI Research Team',
          avatar: '/avatars/ai-team.jpg'
        },
        publishedAt: new Date('2025-09-05'),
        updatedAt: new Date('2025-09-05'),
        tags: ['AI', 'LLM', 'Research'],
        category: 'ai-news',
        readingTime: 8,
        seo: {
          metaTitle: 'The Future of Large Language Models - VIB3CODE',
          metaDescription: 'Exploring the next generation of AI language models and their potential impact on society.',
          ogImage: '/og/future-of-llms.jpg'
        },
        holographicParams: contentCategories['ai-news'].holographicTheme
      }
    ];
  }

  async getPosts(options: GetPostsOptions = {}): Promise<BlogPost[]> {
    let posts = [...this.posts];

    // Filter by category
    if (options.category) {
      posts = posts.filter(post => post.category === options.category);
    }

    // Filter by tags
    if (options.tags?.length) {
      posts = posts.filter(post => 
        post.tags.some(tag => options.tags!.includes(tag))
      );
    }

    // Sort posts
    if (options.sortBy) {
      posts.sort((a, b) => {
        const aVal = a[options.sortBy!];
        const bVal = b[options.sortBy!];
        
        if (aVal instanceof Date && bVal instanceof Date) {
          return options.sortOrder === 'desc' ? bVal.getTime() - aVal.getTime() : aVal.getTime() - bVal.getTime();
        }
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return options.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
        }
        
        return 0;
      });
    }

    // Apply limit and offset
    if (options.offset) {
      posts = posts.slice(options.offset);
    }
    
    if (options.limit) {
      posts = posts.slice(0, options.limit);
    }

    return posts;
  }

  async getPost(slug: string): Promise<BlogPost | null> {
    return this.posts.find(post => post.slug === slug) || null;
  }

  async createPost(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
    const newPost: BlogPost = {
      ...post,
      id: Math.random().toString(36).substr(2, 9)
    };
    this.posts.push(newPost);
    return newPost;
  }

  async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    const index = this.posts.findIndex(post => post.id === id);
    if (index === -1) {
      throw new Error('Post not found');
    }
    
    this.posts[index] = { ...this.posts[index], ...updates, updatedAt: new Date() };
    return this.posts[index];
  }

  async deletePost(id: string): Promise<void> {
    this.posts = this.posts.filter(post => post.id !== id);
  }

  async searchPosts(query: string): Promise<BlogPost[]> {
    const lowercaseQuery = query.toLowerCase();
    return this.posts.filter(post =>
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.excerpt.toLowerCase().includes(lowercaseQuery) ||
      post.content.toLowerCase().includes(lowercaseQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
}

// Sanity CMS Provider (for production)
export class SanityCMSProvider implements ContentProvider {
  private client: any; // SanityClient type

  constructor(config: { projectId: string; dataset: string; apiVersion: string; token?: string }) {
    // Initialize Sanity client
    // this.client = createClient(config);
  }

  async getPosts(options: GetPostsOptions = {}): Promise<BlogPost[]> {
    // Implement Sanity GROQ queries
    throw new Error('Sanity integration not implemented yet');
  }

  async getPost(slug: string): Promise<BlogPost | null> {
    // Implement single post fetch
    throw new Error('Sanity integration not implemented yet');
  }

  async createPost(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
    // Create post in Sanity
    throw new Error('Sanity integration not implemented yet');
  }

  async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    // Update post in Sanity
    throw new Error('Sanity integration not implemented yet');
  }

  async deletePost(id: string): Promise<void> {
    // Delete post from Sanity
    throw new Error('Sanity integration not implemented yet');
  }

  async searchPosts(query: string): Promise<BlogPost[]> {
    // Implement Sanity search
    throw new Error('Sanity integration not implemented yet');
  }
}

// Export singleton instance
export const contentAPI = new ContentAPI(new MDXContentProvider());

// Utility functions for content operations
export const contentUtils = {
  // Generate SEO-friendly slug
  generateSlug: (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  },

  // Calculate reading time
  calculateReadingTime: (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  },

  // Extract excerpt from content
  extractExcerpt: (content: string, length: number = 160): string => {
    const plainText = content.replace(/[#*`_~\[\]()]/g, '').trim();
    return plainText.length > length 
      ? plainText.substring(0, length) + '...'
      : plainText;
  },

  // Generate Open Graph image URL
  generateOGImage: (title: string, category: keyof typeof contentCategories): string => {
    const theme = contentCategories[category];
    const encodedTitle = encodeURIComponent(title);
    const color = theme.holographicTheme.primaryColor.replace('#', '');
    
    return `/api/og?title=${encodedTitle}&category=${category}&color=${color}`;
  }
};