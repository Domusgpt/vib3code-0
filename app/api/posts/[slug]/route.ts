/**
 * Individual Post API Route
 * 
 * Handles fetching, updating, and deleting individual blog posts
 */

import { NextRequest, NextResponse } from 'next/server';
import { contentAPI } from '@/lib/content-api';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await contentAPI.getPost(params.slug);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Get related posts
    const relatedPosts = await contentAPI.getRelatedPosts(post.id, 3);

    // Add cache headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=600, stale-while-revalidate=1200'); // 10min cache, 20min stale
    headers.set('Content-Type', 'application/json');

    return NextResponse.json({
      post,
      relatedPosts,
      meta: {
        readingTime: post.readingTime,
        wordCount: post.content.split(/\s+/).length,
        lastModified: post.updatedAt
      }
    }, { headers });

  } catch (error) {
    console.error('Get Post Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // This would require authentication and authorization in production
    const updates = await request.json();
    
    // Find post by slug first (in production, you'd have a better way to do this)
    const existingPost = await contentAPI.getPost(params.slug);
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const updatedPost = await contentAPI.updatePost(existingPost.id, updates);
    
    return NextResponse.json(updatedPost);
    
  } catch (error) {
    console.error('Update Post Error:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // This would require authentication and authorization in production
    const existingPost = await contentAPI.getPost(params.slug);
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    await contentAPI.deletePost(existingPost.id);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Delete Post Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}