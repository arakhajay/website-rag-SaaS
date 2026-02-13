'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ShieldCheck } from 'lucide-react'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { lookupEmailByUsername, saveUsernameToProfile } from '@/app/actions/auth'

function LoginForm() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    // Check if redirecting to admin
    const redirectTo = searchParams.get('redirect')
    const isAdminLogin = redirectTo?.startsWith('/admin')

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (isSignUp) {
            // --- SIGN UP ---
            if (!username.trim()) {
                alert('Username is required')
                setLoading(false)
                return
            }

            if (username.trim().length < 3) {
                alert('Username must be at least 3 characters')
                setLoading(false)
                return
            }

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        username: username.trim(),
                    },
                },
            })
            if (error) {
                alert(error.message)
            } else {
                // Save username to profiles table
                if (data.user) {
                    const result = await saveUsernameToProfile(data.user.id, username.trim(), email)
                    if (result.error) {
                        console.error('Username save error:', result.error)
                    }
                }
                alert('Account created! Please sign in with your credentials.')
                // Switch to sign-in view
                setIsSignUp(false)
                setUsername('')
                setPassword('')
            }
        } else {
            // --- SIGN IN ---
            let signInEmail = email.trim()

            // If input doesn't contain @, treat it as a username and look up the email
            if (!signInEmail.includes('@')) {
                const result = await lookupEmailByUsername(signInEmail)
                if (result.error || !result.email) {
                    alert(result.error || 'No account found with that username')
                    setLoading(false)
                    return
                }
                signInEmail = result.email
            }

            const { error } = await supabase.auth.signInWithPassword({
                email: signInEmail,
                password,
            })
            if (error) {
                alert(error.message)
            } else {
                // Redirect to the original destination or dashboard
                // Force a hard navigation to ensure cookies are sent to the server
                window.location.href = redirectTo || '/dashboard'
            }
        }
        setLoading(false)
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                {isAdminLogin && (
                    <div className="mb-4 mx-auto h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <ShieldCheck className="h-6 w-6 text-purple-500" />
                    </div>
                )}
                <CardTitle className="text-2xl font-bold">
                    {isAdminLogin ? 'Admin Login' : 'Welcome to Sitebot'}
                </CardTitle>
                <CardDescription>
                    {isAdminLogin
                        ? 'Sign in with your admin credentials'
                        : (isSignUp ? 'Create an account' : 'Sign in') + ' to continue'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAuth} className="space-y-4">
                    {/* Username field - only shown on Sign Up */}
                    {isSignUp && (
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="johndoe"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">
                            {isSignUp ? 'Email' : 'Email or Username'}
                        </Label>
                        <Input
                            id="email"
                            type={isSignUp ? 'email' : 'text'}
                            placeholder={isSignUp ? 'm@example.com' : 'Email or username'}
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </Button>
                </form>

                {/* Sign in/up toggle */}
                {!isAdminLogin && (
                    <div className="mt-4 text-center text-sm">
                        <span className="text-muted-foreground">
                            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                        </span>
                        <button
                            className="font-medium underline"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? 'Sign in' : 'Sign up'}
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function LoginPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
            <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    )
}
