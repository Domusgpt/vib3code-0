/**
 * Research Ingestion API Route
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 *
 * Endpoint for automated research ingestion from AI conversations
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIResearchAutomation, ResearchSession } from '@/lib/ai-research-automation';
import { contentAPI } from '@/lib/content-api';

// Simple auth check (replace with proper auth in production)
const INGEST_SECRET = process.env.INGEST_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes(INGEST_SECRET)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Handle different input formats
    let session: ResearchSession;

    if (data.type === 'claude') {
      // Parse Claude export format
      session = parseClaude(data);
    } else if (data.type === 'chatgpt') {
      // Parse ChatGPT format
      session = parseChatGPT(data);
    } else if (data.type === 'raw') {
      // Direct markdown/text input
      session = {
        id: `manual-${Date.now()}`,
        timestamp: new Date(data.timestamp || Date.now()),
        topic: data.topic || 'Research Session',
        rawContent: data.content,
        metadata: data.metadata
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid input type' },
        { status: 400 }
      );
    }

    // Convert to blog post
    const automation = new AIResearchAutomation([]);
    const post = await automation.convertToPost(session);

    // Optionally auto-publish or save as draft
    const autoPublish = data.autoPublish !== false;

    if (autoPublish) {
      const created = await contentAPI.createPost(post);
      return NextResponse.json({
        success: true,
        published: true,
        post: created
      });
    } else {
      // Save as draft (would store in database)
      return NextResponse.json({
        success: true,
        published: false,
        draft: post
      });
    }

  } catch (error) {
    console.error('Research ingestion error:', error);
    return NextResponse.json(
      { error: 'Failed to ingest research' },
      { status: 500 }
    );
  }
}

function parseClaude(data: any): ResearchSession {
  // Parse Claude's export format
  const messages = data.messages || [];
  const content = messages.map((msg: any) => {
    const role = msg.role === 'human' ? '**You:**' : '**Claude:**';
    return `${role}\n\n${msg.content}\n\n---\n`;
  }).join('\n');

  return {
    id: `claude-${Date.now()}`,
    timestamp: new Date(data.timestamp || Date.now()),
    topic: data.title || extractTopic(messages),
    rawContent: content,
    messages: messages.map((msg: any) => ({
      role: msg.role === 'human' ? 'user' : 'assistant',
      content: msg.content
    })),
    metadata: data.metadata
  };
}

function parseChatGPT(data: any): ResearchSession {
  // Parse ChatGPT's export format
  const messages = data.messages || data.conversation || [];
  const content = messages.map((msg: any) => {
    const role = msg.author?.role === 'user' ? '**You:**' : '**ChatGPT:**';
    return `${role}\n\n${msg.content?.parts?.[0] || msg.content || ''}\n\n---\n`;
  }).join('\n');

  return {
    id: `chatgpt-${Date.now()}`,
    timestamp: new Date(data.create_time || Date.now()),
    topic: data.title || extractTopic(messages),
    rawContent: content,
    messages: messages.map((msg: any) => ({
      role: msg.author?.role || 'user',
      content: msg.content?.parts?.[0] || msg.content || ''
    })),
    metadata: data.metadata
  };
}

function extractTopic(messages: any[]): string {
  // Try to extract topic from first user message
  const firstMessage = messages.find(m =>
    m.role === 'user' || m.role === 'human' || m.author?.role === 'user'
  );

  if (firstMessage) {
    const content = firstMessage.content?.parts?.[0] || firstMessage.content || '';
    // Take first line or first 100 characters
    const firstLine = content.split('\n')[0];
    return firstLine.substring(0, 100);
  }

  return 'AI Research Session';
}

// GET endpoint to check status
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ready',
    endpoint: '/api/research/ingest',
    methods: ['POST'],
    formats: ['claude', 'chatgpt', 'raw'],
    authentication: 'Bearer token required'
  });
}