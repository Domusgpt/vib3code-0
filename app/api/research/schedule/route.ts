/**
 * Daily Research Schedule API
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 *
 * Automated daily research ingestion and publishing
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIResearchAutomation } from '@/lib/ai-research-automation';

// This would be triggered by:
// 1. GitHub Actions (scheduled workflow)
// 2. Vercel Cron Jobs
// 3. External scheduler service
// 4. Manual trigger from admin panel

export async function POST(request: NextRequest) {
  try {
    // Simple auth check
    const authHeader = request.headers.get('authorization');
    const secret = process.env.SCHEDULE_SECRET || 'schedule-secret';

    if (!authHeader || !authHeader.includes(secret)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 Starting scheduled research ingestion...');

    // Configure sources based on environment variables
    const sources = [];

    // Add Claude source if configured
    if (process.env.CLAUDE_EXPORT_PATH) {
      sources.push({
        type: 'file' as const,
        filePath: process.env.CLAUDE_EXPORT_PATH
      });
    }

    // Add API source if configured
    if (process.env.RESEARCH_API_ENDPOINT) {
      sources.push({
        type: 'api' as const,
        endpoint: process.env.RESEARCH_API_ENDPOINT,
        apiKey: process.env.RESEARCH_API_KEY
      });
    }

    // Add default mock source for testing
    if (sources.length === 0) {
      sources.push({
        type: 'claude' as const
      });
    }

    const automation = new AIResearchAutomation(sources);

    // Run the automation
    await automation.runDailyAutomation();

    return NextResponse.json({
      success: true,
      message: 'Daily research automation completed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to run scheduled automation' },
      { status: 500 }
    );
  }
}

// GET endpoint for status and next run info
export async function GET(request: NextRequest) {
  const now = new Date();
  const tomorrow9AM = new Date(now);
  tomorrow9AM.setDate(tomorrow9AM.getDate() + 1);
  tomorrow9AM.setHours(9, 0, 0, 0);

  if (tomorrow9AM.getTime() < now.getTime()) {
    tomorrow9AM.setDate(tomorrow9AM.getDate() + 1);
  }

  return NextResponse.json({
    status: 'active',
    currentTime: now.toISOString(),
    nextRun: tomorrow9AM.toISOString(),
    schedule: 'Daily at 9:00 AM',
    sources: {
      claude: !!process.env.CLAUDE_EXPORT_PATH,
      api: !!process.env.RESEARCH_API_ENDPOINT,
      mock: true
    }
  });
}