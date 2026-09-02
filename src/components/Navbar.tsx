import React, {
  useEffect,
} from 'react';

import {
  ShieldCheck,
  LogOut,
  User as UserIcon,
  BookOpen,
  MessageSquareText,
  Compass,
  Database,
  LifeBuoy,
  Star,
} from 'lucide-react';

import type {
  UserProfile,
} from '../types.ts';

type MainTab =
  | 'overview'
  | 'journal'
  | 'history'
  | 'memory'
  | 'support'
  | 'feedback';

interface NavbarProps {
  user: UserProfile;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onSignOut: () => void;
}

export const Navbar:
  React.FC<NavbarProps> = ({
    user,
    activeTab,
    onTabChange,
    onSignOut,
  }) => {
    useEffect(() => {
      const root =
        document.documentElement;

      root.setAttribute(
        'data-theme',
        'dark'
      );

      root.classList.add(
        'dark'
      );

      localStorage.setItem(
        'mirrortrace-theme',
        'dark'
      );
    }, []);

    const navClass =
      (tab: MainTab) => [
        'mirrortrace-nav-button',
        activeTab === tab
          ? 'mirrortrace-nav-button-active'
          : '',
      ]
        .filter(Boolean)
        .join(' ');

    return (
      <header className="mirrortrace-navbar">
        <div className="mirrortrace-navbar-container">
          <div className="mirrortrace-navbar-inner">

            {/* BRAND */}
            <button
              type="button"
              onClick={() =>
                onTabChange(
                  'overview'
                )
              }
              className="mirrortrace-brand"
              aria-label="MirrorTrace Overview"
            >
              <div className="mirrortrace-logo">
                M
              </div>

              <div className="mirrortrace-brand-copy">
                <div className="mirrortrace-brand-title-row">
                  <span className="mirrortrace-brand-name">
                    MirrorTrace
                  </span>

                  <span className="mirrortrace-uid-chip">
                    <ShieldCheck className="w-3 h-3" />
                    <span>
                      Isolated UID
                    </span>
                  </span>
                </div>

                <p className="mirrortrace-brand-subtitle">
                  Version control for your thinking
                </p>
              </div>
            </button>

            {/* DESKTOP NAV */}
            <nav
              className="mirrortrace-main-nav"
              aria-label="Primary navigation"
            >
              <button
                type="button"
                onClick={() =>
                  onTabChange(
                    'overview'
                  )
                }
                className={
                  navClass(
                    'overview'
                  )
                }
              >
                <Compass className="w-4 h-4" />
                <span>
                  Overview
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onTabChange(
                    'journal'
                  )
                }
                className={
                  navClass(
                    'journal'
                  )
                }
              >
                <MessageSquareText className="w-4 h-4" />
                <span>
                  Reflect & Chat
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onTabChange(
                    'history'
                  )
                }
                className={
                  navClass(
                    'history'
                  )
                }
              >
                <BookOpen className="w-4 h-4" />
                <span>
                  Journal History
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onTabChange(
                    'memory'
                  )
                }
                className={
                  navClass(
                    'memory'
                  )
                }
              >
                <Database className="w-4 h-4" />
                <span>
                  Memory
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onTabChange(
                    'support'
                  )
                }
                className={
                  navClass(
                    'support'
                  )
                }
              >
                <LifeBuoy className="w-4 h-4" />
                <span>
                  Support
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onTabChange(
                    'feedback'
                  )
                }
                className={
                  navClass(
                    'feedback'
                  )
                }
              >
                <Star className="w-4 h-4" />
                <span>
                  Feedback
                </span>
              </button>
            </nav>

            {/* PROFILE / SIGN OUT */}
            <div className="mirrortrace-navbar-actions">
              <div className="mirrortrace-profile">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={
                      user.displayName ||
                      'User'
                    }
                    className="mirrortrace-avatar"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="mirrortrace-avatar mirrortrace-avatar-fallback">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}

                <span className="mirrortrace-profile-name">
                  {user.displayName ||
                    user.email ||
                    'User'}
                </span>
              </div>

              <button
                id="btn-sign-out"
                type="button"
                onClick={onSignOut}
                className="mirrortrace-signout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>
                  Sign Out
                </span>
              </button>
            </div>
          </div>

          {/* MOBILE NAV */}
          <nav
            className="mirrortrace-mobile-nav"
            aria-label="Mobile navigation"
          >
            <button
              type="button"
              onClick={() =>
                onTabChange(
                  'overview'
                )
              }
              className={
                navClass(
                  'overview'
                )
              }
            >
              <Compass className="w-4 h-4" />
              Overview
            </button>

            <button
              type="button"
              onClick={() =>
                onTabChange(
                  'journal'
                )
              }
              className={
                navClass(
                  'journal'
                )
              }
            >
              <MessageSquareText className="w-4 h-4" />
              Reflect
            </button>

            <button
              type="button"
              onClick={() =>
                onTabChange(
                  'history'
                )
              }
              className={
                navClass(
                  'history'
                )
              }
            >
              <BookOpen className="w-4 h-4" />
              History
            </button>

            <button
              type="button"
              onClick={() =>
                onTabChange(
                  'memory'
                )
              }
              className={
                navClass(
                  'memory'
                )
              }
            >
              <Database className="w-4 h-4" />
              Memory
            </button>

            <button
              type="button"
              onClick={() =>
                onTabChange(
                  'support'
                )
              }
              className={
                navClass(
                  'support'
                )
              }
            >
              <LifeBuoy className="w-4 h-4" />
              Support
            </button>

            <button
              type="button"
              onClick={() =>
                onTabChange(
                  'feedback'
                )
              }
              className={
                navClass(
                  'feedback'
                )
              }
            >
              <Star className="w-4 h-4" />
              Feedback
            </button>
          </nav>
        </div>
      </header>
    );
  };

