/**
 * Posts API Route
 * 
 * Handles blog post operations with proper caching, pagination, and filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { contentAPI } from '@/lib/content-api';
import { contentCategories } from '@/lib/blog-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const category = searchParams.get('category') as keyof typeof contentCategories | null;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const sortBy = searchParams.get('sortBy') as 'publishedAt' | 'updatedAt' | 'readingTime' || 'publishedAt';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const author = searchParams.get('author') || undefined;
    const featured = searchParams.get('featured') === 'true';

    let posts;

    if (featured) {
      // Get featured posts for homepage
      posts = await contentAPI.getFeaturedPosts();
    } else if (category) {
      // Get posts by category with theme
      const result = await contentAPI.getPostsByCategory(category);
      posts = result.posts;
    } else {
      // Get all posts with filters
      posts = await contentAPI.getPosts({
        category: category || undefined,
        limit,
        offset,
        sortBy,
        sortOrder,
        tags: tags.length > 0 ? tags : undefined,
        author
      });
    }

    // Add cache headers for performance
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600'); // 5min cache, 10min stale
    headers.set('Content-Type', 'application/json');

    return NextResponse.json({
      posts,
      pagination: {
        limit,
        offset,
        total: posts.length // In real implementation, get total count separately
      },
      meta: {
        category: category ? {
          name: contentCategories[category]?.name,
          theme: contentCategories[category]?.holographicTheme
        } : null
      }
    }, { headers });

  } catch (error) {
    console.error('Posts API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // This would require authentication in production
    const postData = await request.json();
    
    // Validate post data
    if (!postData.title || !postData.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const newPost = await contentAPI.createPost(postData);
    
    return NextResponse.json(newPost, { status: 201 });
    
  } catch (error) {
    console.error('Create Post Error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

// Helper function to validate category
function isValidCategory(category: string): category is keyof typeof contentCategories {
  return category in contentCategories;
}