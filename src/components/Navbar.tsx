import React from 'react';
import {
  ShieldCheck,
  LogOut,
  User as UserIcon,
  BookOpen,
  MessageSquareText,
  Compass,
} from 'lucide-react';
import type { UserProfile } from '../types.ts';

interface NavbarProps {
  user: UserProfile;
  activeTab: 'overview' | 'journal' | 'history';
  onTabChange: (tab: 'overview' | 'journal' | 'history') => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  onTabChange,
  onSignOut,
}) => {
  return (
    <header className="border-b border-stone-200 bg-stone-50/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onTabChange('overview')}
          >
            <div className="w-9 h-9 rounded-lg bg-amber-800 flex items-center justify-center text-amber-50 shadow-xs">
              <span className="font-serif font-bold text-lg">M</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-semibold tracking-tight text-stone-900">
                  MirrorTrace
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100/70 text-amber-900 border border-amber-200/60">
                  <ShieldCheck className="w-3 h-3 text-amber-700" />
                  Isolated UID
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-sans hidden sm:block">
                Version control for your thinking
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              id="tab-overview"
              type="button"
              onClick={() => onTabChange('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
              }`}
            >
              <Compass className="w-4 h-4 text-stone-600" />
              <span>Overview</span>
            </button>

            <button
              id="tab-reflect"
              type="button"
              onClick={() => onTabChange('journal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'journal'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
              }`}
            >
              <MessageSquareText className="w-4 h-4 text-stone-600" />
              <span>Reflect & Chat</span>
            </button>

            <button
              id="tab-history"
              type="button"
              onClick={() => onTabChange('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-stone-600" />
              <span>Journal History</span>
            </button>
          </div>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 pr-2 border-r border-stone-200">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-full border border-stone-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-stone-600">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
              <span className="text-xs font-medium text-stone-700 max-w-[120px] truncate">
                {user.displayName || user.email || 'Authenticated User'}
              </span>
            </div>

            <button
              id="btn-sign-out"
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
