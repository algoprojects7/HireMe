"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@repo/ui';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@repo/types';
import { Eye, EyeOff, Briefcase, Wrench, ChevronRight } from 'lucide-react';

const roles = [
  {
    value: UserRole.PROVIDER,
    label: 'Provider',
    description: 'Hire skilled workers for your projects',
    icon: Briefcase,
    gradient: 'from-blue-500 to-cyan-400',
    border: 'border-blue-500/60',
    glow: 'shadow-blue-500/20',
    bg: 'bg-blue-500/10',
  },
  {
    value: UserRole.WORKER,
    label: 'Worker',
    description: 'Find work opportunities near you',
    icon: Wrench,
    gradient: 'from-purple-500 to-pink-400',
    border: 'border-purple-500/60',
    glow: 'shadow-purple-500/20',
    bg: 'bg-purple-500/10',
  },
];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<string>(UserRole.PROVIDER);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recaptchaVerified) {
      setError('Please verify that you are not a robot');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register', {
        mobileNumber,
        gender,
        password,
        name,
        role,
      });
      // const { user, access_token } = response.data;
      // setAuth(user, access_token);
      router.push('/auth/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find((r) => r.value === role)!;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden py-10 px-4">
      {/* Ambient background effects */}
      <div className="absolute top-[-15%] right-[-10%] w-[45%] h-[45%] bg-blue-500/15 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-[-15%] left-[-10%] w-[45%] h-[45%] bg-purple-500/15 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[30%] h-[30%] bg-cyan-500/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-lg p-8 md:p-10 bg-white/[0.03] border border-white/[0.08] rounded-3xl backdrop-blur-2xl shadow-2xl relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-5">
          <Link href="/" className="text-2xl font-extrabold text-white tracking-tight">
            Hire<span className="text-[#f5c518]">Me</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-400 text-sm">Choose your role and join the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selector Cards */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">I want to join as</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`
                      relative group p-4 rounded-xl border-2 transition-all duration-300 text-left cursor-pointer
                      ${isSelected
                        ? `${r.border} ${r.bg} shadow-lg ${r.glow}`
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                      }
                    `}
                  >
                    {/* Selection indicator */}
                    <div className={`
                      absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300
                      ${isSelected ? `${r.border} bg-gradient-to-r ${r.gradient}` : 'border-white/20'}
                    `}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Icon */}
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all duration-300
                      ${isSelected
                        ? `bg-gradient-to-br ${r.gradient} shadow-md`
                        : 'bg-white/5 group-hover:bg-white/10'
                      }
                    `}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`} />
                    </div>

                    {/* Text */}
                    <p className={`font-semibold text-sm mb-1 transition-colors ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {r.label}
                    </p>
                    <p className={`text-xs leading-relaxed transition-colors ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                      {r.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-xs text-gray-500 uppercase tracking-widest">Details</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Mobile Number */}
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

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
            <div className="relative">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all appearance-none cursor-pointer"
                required
              >
                <option value="" disabled className="text-gray-500">Select Gender</option>
                <option value="Male" className="bg-[#0a0a0a]">Male</option>
                <option value="Female" className="bg-[#0a0a0a]">Female</option>
                <option value="Third Gender" className="bg-[#0a0a0a]">Third Gender</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all pr-12"
                placeholder="Min 6 characters"
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

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className={`
              w-full py-6 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2
              bg-gradient-to-r ${selectedRole.gradient}
              hover:shadow-xl hover:brightness-110
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Account...
              </>
            ) : (
              <>
                Get Started as {selectedRole.label}
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
