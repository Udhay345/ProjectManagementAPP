'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import Image from 'next/image';
import { apiClient } from '../../../lib/api';
import logoImg from '../../../assets/logo.png';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Senior Frontend Engineer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        password,
        role
      });

      if (response.data && response.data.success) {
        localStorage.setItem('pms_current_user', JSON.stringify(response.data.data));
        router.push('/dashboard');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Failed to create account. Try another email.');
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
      {/* Sign Up Card */}
      <div className="w-full bg-white border border-slate-200 rounded-xl p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">Sign Up</h2>
          <p className="text-sm text-slate-500">Join the next generation of knowledge workers.</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name Field */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600 block uppercase tracking-wider" htmlFor="full_name">Full Name</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
              <input
                id="full_name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Email Field */}
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
                placeholder="workmail@company.com"
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Role Field (hidden in new design but we keep it here just for registering logically or show it minimally) */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600 block uppercase tracking-wider" htmlFor="role">Role / Title</label>
            <div className="relative group">
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-11 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all appearance-none"
              >
                <option value="Lead Product Designer">Lead Product Designer</option>
                <option value="Senior Frontend Engineer">Senior Frontend Engineer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Engineering Lead">Engineering Lead</option>
                <option value="UX Researcher">UX Researcher</option>
              </select>
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600 block uppercase tracking-wider" htmlFor="password">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-12 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
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

          {/* Primary Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-600/20"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        {/* Secondary Action */}
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-600">
            Already have an account? 
            <Link href="/login" className="text-blue-600 font-semibold hover:underline decoration-2 underline-offset-4 ml-1">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={demoLogin}
          className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
        >
          Login as Demo Admin
        </button>
      </div>

      {/* Footer Identity (Subtle) */}
      <footer className="py-6 flex justify-center items-center mt-4">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs font-medium">Secure Infrastructure by ProFlow</span>
        </div>
      </footer>
    </div>
  );
}

