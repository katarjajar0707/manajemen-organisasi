import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function redirectWithSessionCookies(url: URL, responseWithSession: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);

  // Supabase may refresh the session while this proxy is running. Keep those
  // cookies when redirecting so a valid administrator session is not lost.
  responseWithSession.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  // Refresh auth token if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith('/login');
  const isPublicRoute = pathname === '/'; // Dashboard publik di /
  const isHealthRoute = pathname === '/api/health';
  const isSystemRoute = isHealthRoute || pathname === '/api/keep-alive';

  // Maintenance mode is enforced here, before a page, route handler, or
  // server action can be reached. The setting is intentionally queried
  // directly rather than through the app cache so activating it takes effect
  // on the next request.
  const { data: maintenanceSettings, error: maintenanceError } = await supabase
    .from('pengaturan_sistem')
    .select('mode_maintenance')
    .eq('id', 'default')
    .maybeSingle();

  if (!maintenanceError && maintenanceSettings?.mode_maintenance) {
    let isAdministrator = false;

    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      isAdministrator = profile?.role === 'admin';
    }

    // Keep the sign-in form reachable for an unauthenticated administrator.
    // The login action below verifies the role and signs non-admin users out.
    const isUnauthenticatedLogin = !user && isAuthRoute;
    if (!isAdministrator && pathname !== '/maintenance' && !isUnauthenticatedLogin && !isSystemRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/maintenance';
      url.search = '';
      return redirectWithSessionCookies(url, supabaseResponse);
    }
  } else if (pathname === '/maintenance') {
    // Do not expose a stale maintenance page once the mode is disabled.
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return redirectWithSessionCookies(url, supabaseResponse);
  }

  if (!user && !isAuthRoute && !isPublicRoute && !isHealthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return redirectWithSessionCookies(url, supabaseResponse);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return redirectWithSessionCookies(url, supabaseResponse);
  }

  return supabaseResponse;
}
