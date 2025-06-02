import { NextResponse } from 'next/server';
import { checkUpcomingEvents } from '@/lib/notifications';

// This endpoint should be called by a cron job every hour
export async function GET() {
  try {
    await checkUpcomingEvents();
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Failed to check upcoming events:', error);
    return NextResponse.json(
      { error: 'Failed to check upcoming events' },
      { status: 500 }
    );
  }
} 