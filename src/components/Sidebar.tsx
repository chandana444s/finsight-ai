/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UploadCloud, 
  TrendingUp, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X, 
  Sparkles,
  ArrowUpRight,
  User as UserIcon,
  ShieldCheck,
  Mail,
  Key,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Generate a deterministic elegant mock user UID based on their email
  const getDeterministicUID = (email: string) => {
    const code = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `FNS-SEC-${1000 + (code % 9000)}-${code.toString(16).toUpperCase()}`;
  };

  const currentUID = user ? getDeterministicUID(user.email) : 'FNS-SEC-GUEST-0';

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Upload Statement', path: '/upload', icon: UploadCloud },
    { name: 'Insights', path: '/insights', icon: TrendingUp },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare },
  ];

  return (
    <>
      {/* Mobile Burger Trigger Header */}
      <div className="md:hidden flex items-center justify-between bg-[#0f172a] text-white p-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2" id="mobile-brand-wrapper">
          <div className="bg-[#7c3aed] p-1.5 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-lg">FinSight AI</span>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider -mt-1">AI-POWERED FINANCE</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
          id="mobile-menu-toggle"
          aria-label="Toggle Navigation Side-Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
          id="sidebar-backdrop"
        />
      )}

      {/* Primary Navigation Sidebar Drawer */}
      <aside
        id="side-nav-bar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-[260px] bg-[#0f172a] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky h-screen border-r border-slate-800
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Top Branding Section */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8" id="sidebar-brand-container">
            <div className="bg-[#7c3aed] p-2.5 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold tracking-tight font-sans text-xl block">FinSight AI</span>
              <p className="text-[9px] text-slate-400 font-mono tracking-widest mt-0.5">AI-POWERED FINANCE</p>
            </div>
          </div>

          {/* Navigation Path Links */}
          <nav className="space-y-1.5" id="nav-routes-container">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-[#7c3aed] text-white font-semibold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105
                    ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} 
                  />
                  <span>{item.name}</span>
                  
                  {/* Visual Left Line Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Action Button & User Profile Footer */}
        <div className="p-5 border-t border-slate-800/80 space-y-6">
          {/* Quick upload statement action button */}
          <button
            onClick={() => {
              navigate('/upload');
              setIsOpen(false);
            }}
            id="sidebar-upload-shortcut-btn"
            className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] active:scale-[0.98] text-white text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 shadow-md shadow-purple-900/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Statement</span>
          </button>

          {/* User badge */}
          <div className="flex items-center justify-between" id="user-badge-profile shadow-sm">
            <div 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 cursor-pointer group hover:bg-slate-850/80 p-1.5 rounded-xl transition duration-150 flex-1 min-w-0"
              title="Click to view full security profile"
              id="sidebar-profile-trigger"
            >
              <div className="w-10 h-10 rounded-full bg-[#7c3aed] text-white font-bold flex items-center justify-center border-2 border-[#7c3aed]/20 group-hover:border-[#7c3aed]/50 overflow-hidden shrink-0 transition duration-150">
                {(user?.name || 'G')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-sm block leading-none truncate group-hover:text-[#9055ef] transition duration-150" title={user?.name || 'Guest'}>
                  {user?.name || 'Guest'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block truncate mt-1" title={user?.email || 'guest@example.com'}>
                  {user?.email || 'guest@example.com'}
                </span>
              </div>
            </div>
            <button 
              id="sidebar-logout-button"
              className="text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800/60 transition-colors pointer-events-auto shrink-0 ml-1"
              title="Logout"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* FULL SECURITY PROFILE PORTAL MODAL */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
          id="profile-portal-modal"
          onClick={() => setIsProfileOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[28px] p-6 text-white shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            id="profile-modal-container"
          >
            {/* Background ambient glow accents */}
            <div className="absolute right-0 top-0 w-48 h-48 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute left-0 bottom-0 w-48 h-48 bg-cyan-600/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Header section with Close Trigger */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80 relative z-10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#7c3aed]" />
                <span className="font-bold tracking-tight text-base font-sans">User Profile Information</span>
              </div>
              <button 
                onClick={() => setIsProfileOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                id="close-profile-modal-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar Centered Brand Presentation */}
            <div className="text-center mb-6 relative z-10">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#9055ef] text-white text-3xl font-extrabold flex items-center justify-center border-4 border-slate-800 mx-auto shadow-xl">
                {(user?.name || 'G')[0].toUpperCase()}
              </div>
              <h3 className="text-lg font-bold mt-3 text-white tracking-tight">{user?.name || 'Authorized Guest'}</h3>
              <p className="text-xs text-slate-450 mt-1 flex items-center justify-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="font-semibold text-amber-400 uppercase tracking-widest text-[9px] bg-amber-500/10 px-2 py-0.5 rounded">FinSight Premium Member</span>
              </p>
            </div>

            {/* Profile Data Attributes */}
            <div className="space-y-4 mb-6 relative z-10" id="profile-details-table">
              {/* Name Field */}
              <div className="bg-slate-950/45 p-3 rounded-xl border border-slate-850 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <UserIcon className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-xs text-slate-400">Full Name</span>
                </div>
                <span className="text-xs font-semibold text-slate-100 truncate max-w-[200px]">{user?.name || 'N/A'}</span>
              </div>

              {/* Email Address Field */}
              <div className="bg-slate-950/45 p-3 rounded-xl border border-slate-850 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-xs text-slate-400">Email Address</span>
                </div>
                <span className="text-xs font-semibold text-slate-100 truncate max-w-[200px]">{user?.email || 'N/A'}</span>
              </div>

              {/* Secure UUID Token */}
              <div className="bg-slate-950/45 p-3 rounded-xl border border-slate-850 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Key className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-xs text-slate-400">Secure Identifier</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/30 border border-cyan-900/40 px-2 py-0.5 rounded uppercase tracking-wider">
                  {currentUID}
                </span>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex flex-col gap-2.5 relative z-10" id="profile-actions-options">
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                  navigate('/login');
                }}
                id="profile-portal-logout-btn"
                className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/20 rounded-xl py-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Account</span>
              </button>
              
              <button
                onClick={() => setIsProfileOpen(false)}
                className="w-full bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl py-2.5 text-xs font-semibold transition cursor-pointer"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
