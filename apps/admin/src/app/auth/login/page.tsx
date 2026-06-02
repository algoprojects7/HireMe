"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@repo/ui';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { getDashboardRedirect } from '@/lib/navigation';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

function LoginForm() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  const { user, setAuth } = useAuthStore();
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    setIsLoaded(true);
  }, []);

  React.useEffect(() => {
    if (isLoaded && user) {
      router.push(getDashboardRedirect(user.role));
    }
  }, [user, router, isLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recaptchaVerified) {
      setError('Please verify that you are not a robot');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', {
        mobileNumber,
        password,
      });
      const { user, access_token } = response.data;
      setAuth(user, access_token);
      router.push(getDashboardRedirect(user.role));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl relative z-10">
      <div className="flex justify-center mb-6">
        <Link href="/" className="text-2xl font-extrabold text-white tracking-tight">
          Hire<span className="text-[#f5c518]">Me</span>
        </Link>
      </div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-gray-400">Sign in to your account</p>
      </div>

      {/* Registration success banner */}
      {registered && (
        <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          Account created successfully! Please sign in.
        </div>
      )}

      {/* Session expired banner */}
      {searchParams.get('expired') && (
        <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
          Your session has expired. Please sign in again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">+91</span>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              placeholder="10-digit mobile number"
              maxLength={10}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all pr-12"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ReCAPTCHA */}
        <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-xl">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="recaptcha"
              checked={recaptchaVerified}
              onChange={(e) => setRecaptchaVerified(e.target.checked)}
              className="w-5 h-5 rounded border-gray-400 text-blue-500 focus:ring-blue-500 focus:ring-offset-[#0a0a0a] cursor-pointer"
            />
            <label htmlFor="recaptcha" className="text-sm font-medium text-gray-300 cursor-pointer">
              I&apos;m not a robot
            </label>
          </div>
          <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="w-7 h-7 opacity-70" />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Authenticating...
            </>
          ) : 'Sign In'}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
        <p className="text-gray-400 text-sm mb-4">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors">
            Register
          </Link>
        </p>
        <p className="text-gray-500 text-xs">
          © 2026 HireMe Management System
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]" />
      
      <Suspense fallback={
        <div className="w-full max-w-md p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl animate-pulse flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-32 h-8 bg-white/10 rounded mb-8" />
          <div className="w-full h-12 bg-white/5 rounded mb-4" />
          <div className="w-full h-12 bg-white/5 rounded" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}

