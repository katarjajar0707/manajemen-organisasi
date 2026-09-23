import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    let isOffline = false;
    try {
      const body = await request.json();
      isOffline = body?.status === 'offline';
    } catch {
      // Body may be empty or non-JSON from beacon
    }

    const now = new Date().toISOString();

    // Perbarui waktu terakhir aktif di profiles
    await supabase.from('profiles').update({ last_seen_at: now }).eq('id', user.id);

    // Jika sinyal offline (tab ditutup atau pengguna meninggalkan halaman)
    if (isOffline) {
      const { data: latestLogin } = await supabase
        .from('login_history')
        .select('id')
        .eq('user_id', user.id)
        .is('logged_out_at', null)
        .order('logged_in_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestLogin) {
        await supabase
          .from('login_history')
          .update({ logged_out_at: now })
          .eq('id', latestLogin.id);
      }
    }

    return NextResponse.json({ ok: true, time: now });
  } catch (error) {
    console.error('Error handling presence heartbeat:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
