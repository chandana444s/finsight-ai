/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Full Name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    // Simulate natural processing delay to match premium aesthetic feel
    setTimeout(() => {
      const result = signup(fullName, email);
      setIsSubmitting(false);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Failed to register account');
      }
    }, 850);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col justify-center items-center p-4 relative" id="signup-page-container">
      {/* Background Decorative Glow Panels */}
      <div className="absolute inset-0 bg-[#0f172a] bg-[radial-gradient(#7c3aed_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute right-1/4 top-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute left-1/4 bottom-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-[28px] p-8 relative z-10 shadow-2xl" id="signup-card">
        {/* FinSight Brand Header */}
        <div className="text-center mb-6" id="signup-brand-header">
          <div className="inline-flex items-center justify-center bg-[#7c3aed] p-3 rounded-2xl mb-4 shadow-lg shadow-purple-900/40">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-snug">JOIN FINSIGHT SECURE FINANCIAL ANALYTICS</p>
        </div>

        {/* Dynamic Alerts Banner */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5" id="signup-error-banner">
            <AlertCircle className="w-4 h-4 text-rose-450 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Signup fields interactive form */}
        <form onSubmit={handleSubmit} className="space-y-4.5" id="signup-form">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="Rahul Menon"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-slate-950/60 text-white border border-slate-800 hover:border-slate-700 focus:border-[#7c3aed] focus:bg-slate-950 text-sm py-2.5 pl-11 pr-4 rounded-xl outline-none transition duration-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-slate-950/60 text-white border border-slate-800 hover:border-slate-700 focus:border-[#7c3aed] focus:bg-slate-950 text-sm py-2.5 pl-11 pr-4 rounded-xl outline-none transition duration-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-slate-950/60 text-white border border-slate-800 hover:border-slate-700 focus:border-[#7c3aed] focus:bg-slate-950 text-sm py-2.5 pl-11 pr-4 rounded-xl outline-none transition duration-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Confirm Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-slate-950/60 text-white border border-slate-800 hover:border-slate-700 focus:border-[#7c3aed] focus:bg-slate-950 text-sm py-2.5 pl-11 pr-4 rounded-xl outline-none transition duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            id="signup-submit-btn"
            className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] active:scale-[0.99] disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-155 cursor-pointer shadow-lg shadow-purple-950/25 flex items-center justify-center gap-2 mt-5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Creating Security Profile...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Login redirection footer */}
        <div className="mt-6 text-center border-t border-slate-800/60 pt-4" id="signup-card-footer">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-[#7c3aed] hover:text-[#9055ef] font-semibold transition underline decoration-[#7c3aed]/30 underline-offset-4"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
