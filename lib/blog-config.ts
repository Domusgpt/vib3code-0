/**
 * VIB3CODE-0 Blog Configuration
 * 
 * Central configuration for content types, integrations, and system settings
 */

export interface BlogConfig {
  site: {
    name: string;
    description: string;
    url: string;
    author: string;
  };
  content: {
    postsPerPage: number;
    excerptLength: number;
    enableComments: boolean;
    enableNewsletter: boolean;
  };
  integrations: {
    cms?: 'sanity' | 'strapi' | 'contentful';
    analytics?: 'google' | 'plausible' | 'fathom';
    comments?: 'disqus' | 'giscus' | 'custom';
    newsletter?: 'mailchimp' | 'convertkit' | 'substack';
    search?: 'algolia' | 'elasticsearch' | 'built-in';
  };
  ai: {
    contentGeneration: boolean;
    semanticSearch: boolean;
    autoTagging: boolean;
    researchIntegration: boolean;
  };
  holographic: {
    enabled: boolean;
    adminControlsOnly: boolean;
    subtleEffects: boolean;
    themeResponsive: boolean;
  };
}

export const defaultBlogConfig: BlogConfig = {
  site: {
    name: 'VIB3CODE',
    description: 'AI Research & Development Blog',
    url: 'https://vib3code.com',
    author: 'VIB3CODE Team'
  },
  content: {
    postsPerPage: 12,
    excerptLength: 160,
    enableComments: true,
    enableNewsletter: true
  },
  integrations: {
    cms: 'sanity',
    analytics: 'plausible', 
    comments: 'giscus',
    newsletter: 'convertkit',
    search: 'algolia'
  },
  ai: {
    contentGeneration: true,
    semanticSearch: true,
    autoTagging: true,
    researchIntegration: true
  },
  holographic: {
    enabled: true,
    adminControlsOnly: true,
    subtleEffects: true,
    themeResponsive: true
  }
};

// Content types for the blog
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // MDX content
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  publishedAt: Date;
  updatedAt: Date;
  tags: string[];
  category: 'ai-news' | 'vibe-coding' | 'info-theory' | 'philosophy';
  readingTime: number;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  holographicParams?: {
    hue: number;
    density: number;
    intensity: number;
    theme: string;
  };
}

// User management types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'editor' | 'writer' | 'subscriber';
  avatar?: string;
  bio?: string;
  social?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  preferences: {
    newsletter: boolean;
    notifications: boolean;
    theme: 'auto' | 'light' | 'dark';
  };
}

// Content categories with holographic themes
export const contentCategories = {
  'ai-news': {
    name: 'AI News & Research',
    description: 'Latest developments in artificial intelligence',
    holographicTheme: {
      hue: 0.6, // Cyan-blue
      density: 0.4,
      intensity: 0.3,
      theme: 'cyan-tech',
      primaryColor: '#00bcd4'
    }
  },
  'vibe-coding': {
    name: 'Creative Programming', 
    description: 'Code as art and creative expression',
    holographicTheme: {
      hue: 0.8, // Purple-pink
      density: 0.6,
      intensity: 0.5,
      theme: 'purple-creative',
      primaryColor: '#9c27b0'
    }
  },
  'info-theory': {
    name: 'Information Theory',
    description: 'Mathematical foundations of AI systems',
    holographicTheme: {
      hue: 0.2, // Green-yellow
      density: 0.3,
      intensity: 0.2,
      theme: 'green-theory',
      primaryColor: '#4caf50'
    }
  },
  'philosophy': {
    name: 'AI Philosophy & Ethics',
    description: 'Philosophical implications of artificial intelligence',
    holographicTheme: {
      hue: 0.9, // Deep purple
      density: 0.2,
      intensity: 0.1,
      theme: 'deep-purple-philosophy',
      primaryColor: '#673ab7'
    }
  }
} as const;

// API integration endpoints
export const apiEndpoints = {
  content: {
    posts: '/api/posts',
    categories: '/api/categories',
    search: '/api/search',
    related: '/api/posts/related'
  },
  ai: {
    generate: '/api/ai/generate',
    tag: '/api/ai/tag',
    research: '/api/ai/research',
    summarize: '/api/ai/summarize'
  },
  user: {
    auth: '/api/auth',
    profile: '/api/user/profile',
    preferences: '/api/user/preferences',
    subscription: '/api/user/subscription'
  },
  admin: {
    analytics: '/api/admin/analytics',
    moderation: '/api/admin/moderation',
    settings: '/api/admin/settings',
    holographic: '/api/admin/holographic'
  }
};

// External service configurations
export const serviceConfig = {
  sanity: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2023-05-03'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    maxTokens: 2000
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-sonnet-20240229'
  },
  algolia: {
    appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    searchKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY,
    adminKey: process.env.ALGOLIA_ADMIN_KEY
  },
  stripe: {
    publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY
  }
};