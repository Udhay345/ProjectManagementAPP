'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { apiClient } from '../../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.data && response.data.success) {
        localStorage.setItem('pms_current_user', JSON.stringify(response.data.data));
        router.push('/dashboard');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setError('');
    setLoading(true);
    const demoEmail = 'a.mercer@proflow.in';
    const demoPassword = 'password123';
    
    try {
      let response;
      try {
        response = await apiClient.post('/auth/login', { email: demoEmail, password: demoPassword });
      } catch (loginErr) {
        await apiClient.post('/auth/register', {
          name: 'Alex Mercer',
          email: demoEmail,
          password: demoPassword,
          role: 'Engineering Lead'
        });
        response = await apiClient.post('/auth/login', { email: demoEmail, password: demoPassword });
      }

      if (response.data && response.data.success) {
        localStorage.setItem('pms_current_user', JSON.stringify(response.data.data));
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to authenticate demo user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Form Card */}
      <div className="w-full bg-white border border-slate-200 rounded-xl p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Sign In</h2>
        
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Address */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600 block uppercase tracking-wider" htmlFor="email">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-600 block uppercase tracking-wider" htmlFor="password">Password</label>
              <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">Forgot?</a>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
              </button>
            </div>
          </div>

          {/* Sign In Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-600/20"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Secondary Link */}
      <footer className="mt-8 text-center">
        <p className="text-sm text-slate-600">
          New to the workspace? 
          <Link href="/register" className="text-blue-600 font-semibold hover:underline ml-1">
            Create an account
          </Link>
        </p>
      </footer>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={demoLogin}
          className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
        >
          Login as Demo Admin
        </button>
      </div>
    </div>
  );
}

