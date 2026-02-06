import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake can make it very hard to debug
    // issues with users being randomly logged out.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname
    const isLoginRoute = pathname.startsWith('/login')
    const isAuthCallbackRoute = pathname.startsWith('/auth')
    const isProtectedRoute = pathname.startsWith('/dashboard')
    const isAdminRoute = pathname.startsWith('/admin')

    // ============================================
    // ADMIN ROUTE PROTECTION
    // ============================================
    if (isAdminRoute) {
        // Not authenticated → redirect to login
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            url.searchParams.set('redirect', pathname)
            return NextResponse.redirect(url)
        }

        // Check if user is super_admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'super_admin') {
            // Not a super_admin → return 404 to hide admin route existence
            const url = request.nextUrl.clone()
            url.pathname = '/not-found'
            return NextResponse.rewrite(url)
        }
    }

    // ============================================
    // DASHBOARD ROUTE PROTECTION (commented out for now)
    // ============================================
    // If user is trying to access protected route but hasn't logged in, redirect to login
    /*
    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }
    */

    // If user is already logged in and tries to access login page, redirect to dashboard
    /*
    if (user && isLoginRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }
    */

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response logic, you must step through the supabaseResponse object.
    return supabaseResponse
}
