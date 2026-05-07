import React, { useState, useEffect } from 'react';
import {
    Sprout,
    Mail,
    Lock,
    User,
    ArrowRight,
    Loader2,
    ShieldCheck
} from 'lucide-react';

export default function AuthScreen({ onLoginSuccess }) {
    // 'login' | 'signup'
    const [authMode, setAuthMode] = useState('login');

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Optional: Pre-fill a demo account if none exist so the judges have something easy to test
    useEffect(() => {
        const existingUsers = JSON.parse(localStorage.getItem('vertiSync_users') || '[]');
        if (existingUsers.length === 0) {
            const demoUser = { name: 'Judge', email: 'admin@vertisync.com', password: 'password123' };
            localStorage.setItem('vertiSync_users', JSON.stringify([demoUser]));
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // 1. Basic Field Validation
        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        if (authMode === 'signup' && !name) {
            setError('Please enter your full name.');
            return;
        }

        setIsLoading(true);

        // 2. Fetch our saved users from the browser's hard drive
        const savedUsers = JSON.parse(localStorage.getItem('vertiSync_users') || '[]');

        setTimeout(() => {
            if (authMode === 'signup') {
                // --- SIGN UP LOGIC ---
                // Check if email is already taken
                const userExists = savedUsers.find(u => u.email === email);
                if (userExists) {
                    setError('An account with this email already exists.');
                    setIsLoading(false);
                    return;
                }

                // Create new user and save to the list
                const newUser = { name, email, password };
                savedUsers.push(newUser);
                localStorage.setItem('vertiSync_users', JSON.stringify(savedUsers));

                // Log them in immediately after signing up
                localStorage.setItem('vertiSync_auth', 'true');
                localStorage.setItem('vertiSync_activeUserName', name); // Save their name for the app if needed

                setIsLoading(false);
                onLoginSuccess();

            } else {
                // --- LOG IN LOGIC ---
                // Find a user that matches BOTH the email and the password
                const matchedUser = savedUsers.find(u => u.email === email && u.password === password);

                if (!matchedUser) {
                    setError('Invalid email or password. Please try again.');
                    setIsLoading(false);
                    return;
                }

                // Success! Let them in.
                localStorage.setItem('vertiSync_auth', 'true');
                localStorage.setItem('vertiSync_activeUserName', matchedUser.name);

                setIsLoading(false);
                onLoginSuccess();
            }
        }, 1200); // Simulated network delay
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px]"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md relative z-10">

                {/* Logo Header */}
                <div className="mb-8 flex flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-neon">
                        <Sprout className="h-8 w-8" />
                    </div>
                    <h1 className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                        VertiSync
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Precision Urban Agriculture Platform
                    </p>
                </div>

                {/* Auth Card */}
                <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-white">
                            {authMode === 'login' ? 'Welcome Back' : 'Create an Account'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {authMode === 'login'
                                ? 'Enter your credentials to access the dashboard.'
                                : 'Register to manage your vertical farm data.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-400 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Name Field (Sign Up Only) */}
                        {authMode === 'signup' && (
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-400">Full Name</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <User className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="e.g. Jane Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950/50 py-2.5 pl-10 pr-4 text-sm text-slate-200 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-400">Email Address</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Mail className="h-4 w-4 text-slate-500" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="admin@vertisync.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950/50 py-2.5 pl-10 pr-4 text-sm text-slate-200 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label className="block text-xs font-medium text-slate-400">Password</label>
                                {authMode === 'login' && (
                                    <a href="#" className="text-xs text-emerald-400 hover:underline">Forgot password?</a>
                                )}
                            </div>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lock className="h-4 w-4 text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950/50 py-2.5 pl-10 pr-4 text-sm text-slate-200 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 text-sm font-bold text-slate-950 shadow-neon transition-all hover:scale-[1.02] hover:brightness-110 disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <><Loader2 className="h-4 w-4 animate-spin text-slate-950" /> Authenticating...</>
                            ) : (
                                <>{authMode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="h-4 w-4" /></>
                            )}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <div className="mt-6 text-center text-sm text-slate-400">
                        {authMode === 'login' ? (
                            <p>
                                New to VertiSync?{' '}
                                <button
                                    onClick={() => {setAuthMode('signup'); setError(''); setPassword('');}}
                                    className="font-medium text-emerald-400 hover:underline"
                                >
                                    Sign up here
                                </button>
                            </p>
                        ) : (
                            <p>
                                Already have an account?{' '}
                                <button
                                    onClick={() => {setAuthMode('login'); setError(''); setPassword('');}}
                                    className="font-medium text-emerald-400 hover:underline"
                                >
                                    Log in here
                                </button>
                            </p>
                        )}
                    </div>

                </div>

                {/* Footer info */}
                <p className="mt-8 text-center text-xs text-slate-600">
                    UTMxHackathon'26 Prototype • Edge Node v2.4.1
                </p>

            </div>
        </div>
    );
}