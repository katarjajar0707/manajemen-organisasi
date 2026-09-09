import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get('authorization');

  if (cronSecret && authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createPublicClient();
  const { error } = await supabase.from('kalender_kegiatan').select('id').limit(1);

  if (error) {
    console.error('Supabase keep-alive query failed:', error);
    return NextResponse.json({ status: 'error', error: 'Supabase query failed' }, { status: 503 });
  }

  return NextResponse.json({ status: 'ok', time: new Date().toISOString() });
}
