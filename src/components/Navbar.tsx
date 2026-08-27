import React, {
  useEffect,
  useState,
} from 'react';

import {
  ShieldCheck,
  LogOut,
  User as UserIcon,
  BookOpen,
  MessageSquareText,
  Compass,
  Moon,
  Sun,
} from 'lucide-react';

import type {
  UserProfile,
} from '../types.ts';

interface NavbarProps {
  user: UserProfile;

  activeTab:
    | 'overview'
    | 'journal'
    | 'history';

  onTabChange: (
    tab:
      | 'overview'
      | 'journal'
      | 'history'
  ) => void;

  onSignOut: () => void;
}

type ThemeMode =
  | 'light'
  | 'dark';

const STORAGE_KEY =
  'mirrortrace-theme';

const getInitialTheme =
  (): ThemeMode => {
    if (
      typeof window ===
      'undefined'
    ) {
      return 'light';
    }

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (
      saved === 'light' ||
      saved === 'dark'
    ) {
      return saved;
    }

    return window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
      ? 'dark'
      : 'light';
  };

export const Navbar:
  React.FC<NavbarProps> = ({
    user,
    activeTab,
    onTabChange,
    onSignOut,
  }) => {
    const [
      theme,
      setTheme,
    ] =
      useState<ThemeMode>(
        getInitialTheme
      );

    /*
     * Global application theme.
     */
    useEffect(() => {
      const root =
        document.documentElement;

      root.setAttribute(
        'data-theme',
        theme
      );

      if (
        theme === 'dark'
      ) {
        root.classList.add(
          'dark'
        );
      } else {
        root.classList.remove(
          'dark'
        );
      }

      localStorage.setItem(
        STORAGE_KEY,
        theme
      );
    }, [theme]);

    const toggleTheme =
      () => {
        setTheme(
          (current) =>
            current === 'dark'
              ? 'light'
              : 'dark'
        );
      };

    const navClass = (
      tab:
        | 'overview'
        | 'journal'
        | 'history'
    ) => {
      const active =
        activeTab === tab;

      return [
        'mirrortrace-nav-button',
        active
          ? 'mirrortrace-nav-button-active'
          : '',
      ]
        .filter(Boolean)
        .join(' ');
    };

    return (
      <header className="mirrortrace-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mirrortrace-navbar-inner">

            {/* Brand */}
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

              <div className="min-w-0">
                <div className="flex items-center gap-2">

                  <span className="mirrortrace-brand-name">
                    MirrorTrace
                  </span>

                  <span className="mirrortrace-uid-chip">
                    <ShieldCheck className="w-3 h-3" />
                    Isolated UID
                  </span>
                </div>

                <p className="mirrortrace-brand-subtitle">
                  Version control for
                  your thinking
                </p>
              </div>
            </button>

            {/* Navigation */}
            <nav
              className="mirrortrace-main-nav"
              aria-label="Primary navigation"
            >
              <button
                id="tab-overview"
                type="button"
                onClick={() =>
                  onTabChange(
                    'overview'
                  )
                }
                className={navClass(
                  'overview'
                )}
              >
                <Compass className="w-4 h-4" />

                <span>
                  Overview
                </span>
              </button>

              <button
                id="tab-reflect"
                type="button"
                onClick={() =>
                  onTabChange(
                    'journal'
                  )
                }
                className={navClass(
                  'journal'
                )}
              >
                <MessageSquareText className="w-4 h-4" />

                <span>
                  Reflect & Chat
                </span>
              </button>

              <button
                id="tab-history"
                type="button"
                onClick={() =>
                  onTabChange(
                    'history'
                  )
                }
                className={navClass(
                  'history'
                )}
              >
                <BookOpen className="w-4 h-4" />

                <span>
                  Journal History
                </span>
              </button>
            </nav>

            {/* Right controls */}
            <div className="mirrortrace-navbar-actions">

              {/* Theme toggle */}
              <button
                id="btn-theme-toggle"
                type="button"
                onClick={
                  toggleTheme
                }
                className="mirrortrace-theme-toggle"
                title={
                  theme === 'dark'
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                }
                aria-label={
                  theme === 'dark'
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                }
              >
                {theme ===
                'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>

              {/* Profile */}
              <div className="mirrortrace-profile">

                {user.photoURL ? (
                  <img
                    src={
                      user.photoURL
                    }
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

              {/* Sign out */}
              <button
                id="btn-sign-out"
                type="button"
                onClick={
                  onSignOut
                }
                className="mirrortrace-signout"
              >
                <LogOut className="w-3.5 h-3.5" />

                <span className="hidden xl:inline">
                  Sign Out
                </span>
              </button>
            </div>
          </div>

          {/* Small-screen nav */}
          <nav className="mirrortrace-mobile-nav">
            <button
              type="button"
              onClick={() =>
                onTabChange(
                  'overview'
                )
              }
              className={navClass(
                'overview'
              )}
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
              className={navClass(
                'journal'
              )}
            >
              <MessageSquareText className="w-4 h-4" />
              Reflect & Chat
            </button>

            <button
              type="button"
              onClick={() =>
                onTabChange(
                  'history'
                )
              }
              className={navClass(
                'history'
              )}
            >
              <BookOpen className="w-4 h-4" />
              Journal History
            </button>
          </nav>
        </div>
      </header>
    );
  };