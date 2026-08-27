import { useEffect, useLayoutEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import { auth, logOut } from './lib/firebase.ts';

import { Navbar } from './components/Navbar.tsx';
import { AuthView } from './components/AuthView.tsx';
import { DashboardOverview } from './components/DashboardOverview.tsx';
import { JournalEditor } from './components/JournalEditor.tsx';
import { BrainstormChat } from './components/BrainstormChat.tsx';
import { JournalList } from './components/JournalList.tsx';
import { SecurityBadge } from './components/SecurityBadge.tsx';

import {
  fetchJournalEntries,
  fetchThoughtSnapshots,
  fetchThoughtDiffs,
} from './lib/api.ts';

import type {
  UserProfile,
  JournalEntry,
  ThoughtSnapshot,
  ThoughtDiff,
} from './types.ts';

type MainTab = 'overview' | 'journal' | 'history';
type HistorySubTab = 'reflections' | 'diffs';

const scrollPageToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'auto',
  });

  // Extra fallback for embedded/preview environments.
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] =
    useState<MainTab>('overview');

  const [historySubTab, setHistorySubTab] =
    useState<HistorySubTab>('reflections');

  const [
    filterApprovedSnapshots,
    setFilterApprovedSnapshots,
  ] = useState(false);

  const [
    highlightDiffId,
    setHighlightDiffId,
  ] = useState<string | null>(null);

  const [
    privateSessionMode,
    setPrivateSessionMode,
  ] = useState(false);

  const [externalTags, setExternalTags] =
    useState<string[]>([]);

  const [refreshCounter, setRefreshCounter] =
    useState(0);

  // Global dashboard data
  const [entries, setEntries] =
    useState<JournalEntry[]>([]);

  const [snapshots, setSnapshots] =
    useState<ThoughtSnapshot[]>([]);

  const [diffs, setDiffs] =
    useState<ThoughtDiff[]>([]);

  const [dataLoading, setDataLoading] =
    useState(true);

  /*
   * Authentication listener
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName:
              firebaseUser.displayName,
            photoURL:
              firebaseUser.photoURL,
          });
        } else {
          setUser(null);
        }

        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /*
   * Reset scroll whenever visible page changes.
   */
  useLayoutEffect(() => {
    scrollPageToTop();
  }, [
    activeTab,
    historySubTab,
    user?.uid,
  ]);

  /*
   * Load authenticated user's dashboard data.
   */
  const loadData = async () => {
    if (!user) {
      return;
    }

    try {
      setDataLoading(true);

      const [
        journalData,
        snapshotData,
        diffData,
      ] = await Promise.all([
        fetchJournalEntries().catch(
          () => []
        ),
        fetchThoughtSnapshots().catch(
          () => []
        ),
        fetchThoughtDiffs().catch(
          () => []
        ),
      ]);

      setEntries(journalData);
      setSnapshots(snapshotData);
      setDiffs(diffData);
    } catch (err) {
      console.error(
        'Failed to load user data:',
        err
      );
    } finally {
      setDataLoading(false);
    }
  };

  /*
   * Reload global data whenever:
   * - user changes
   * - refreshCounter changes
   */
  useEffect(() => {
    if (user) {
      void loadData();
    }
  }, [user, refreshCounter]);

  /*
   * Sign out
   */
  const handleSignOut = async () => {
    try {
      await logOut();

      setUser(null);
      setEntries([]);
      setSnapshots([]);
      setDiffs([]);

      setActiveTab('overview');
      setHistorySubTab('reflections');
      setFilterApprovedSnapshots(false);
      setHighlightDiffId(null);
      setPrivateSessionMode(false);
      setExternalTags([]);

      requestAnimationFrame(() => {
        scrollPageToTop();
      });
    } catch (err) {
      console.error(
        'Logout error:',
        err
      );
    }
  };

  /*
   * Trigger global refresh after a journal entry is saved.
   */
  const handleEntrySaved = (
    _entry: JournalEntry
  ) => {
    setRefreshCounter(
      (previous) => previous + 1
    );
  };

  /*
   * Trigger global refresh whenever JournalList
   * changes persisted state such as:
   *
   * - snapshot approval
   * - snapshot deletion
   * - journal deletion
   * - Thought Diff generation
   */
  const handleDataChanged = () => {
    setRefreshCounter(
      (previous) => previous + 1
    );
  };

  /*
   * Suggested BrainstormChat tag -> JournalEditor
   */
  const handleSuggestedTagClick = (
    tag: string
  ) => {
    setExternalTags((previous) =>
      previous.includes(tag)
        ? previous
        : [...previous, tag]
    );
  };

  /*
   * Central application navigation.
   */
  const handleNavigate = (
    tab: MainTab,
    options?: {
      privateSession?: boolean;
      subTab?: HistorySubTab;
      filterApprovedSnapshots?: boolean;
      highlightDiffId?: string;
    }
  ) => {
    if (options?.privateSession) {
      setPrivateSessionMode(true);
    } else if (
      tab === 'journal'
    ) {
      setPrivateSessionMode(false);
    }

    if (options?.subTab) {
      setHistorySubTab(
        options.subTab
      );
    }

    setFilterApprovedSnapshots(
      Boolean(
        options?.filterApprovedSnapshots
      )
    );

    setHighlightDiffId(
      options?.highlightDiffId ??
        null
    );

    setActiveTab(tab);

    /*
     * Handles navigation where React state
     * may already contain the same tab value.
     */
    requestAnimationFrame(() => {
      scrollPageToTop();
    });
  };

  /*
   * Authentication loading screen
   */
  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-amber-800 flex items-center justify-center text-amber-50 shadow-xs">
          <span className="font-serif font-bold text-lg">
            M
          </span>
        </div>

        <div className="w-6 h-6 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin" />

        <p className="text-xs text-stone-500 font-sans">
          Verifying authentication
          session...
        </p>
      </div>
    );
  }

  /*
   * Public landing/authentication screen
   */
  if (!user) {
    return (
      <AuthView
        onSuccess={() => {
          setActiveTab('overview');

          setRefreshCounter(
            (previous) =>
              previous + 1
          );

          requestAnimationFrame(
            () => {
              scrollPageToTop();
            }
          );
        }}
      />
    );
  }

  /*
   * Authenticated application
   */
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-between">
      <div className="w-full">
        <Navbar
          user={user}
          activeTab={activeTab}
          onTabChange={(tab) =>
            handleNavigate(tab)
          }
          onSignOut={
            handleSignOut
          }
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Overview */}
          {activeTab ===
            'overview' && (
            <DashboardOverview
              entries={entries}
              snapshots={snapshots}
              diffs={diffs}
              loading={
                dataLoading
              }
              onNavigate={
                handleNavigate
              }
            />
          )}

          {/* Reflect & Chat */}
          {activeTab ===
            'journal' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    Reflective Space
                  </h1>

                  <p className="text-xs text-stone-500 font-sans">
                    Articulate thoughts
                    with the brainstorm
                    companion, or write
                    down your reflection
                    directly.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                <div className="lg:col-span-6 space-y-6">
                  <JournalEditor
                    onEntrySaved={
                      handleEntrySaved
                    }
                    externalTags={
                      externalTags
                    }
                    onClearExternalTags={() =>
                      setExternalTags(
                        []
                      )
                    }
                    initialPrivateSession={
                      privateSessionMode
                    }
                  />
                </div>

                <div className="lg:col-span-6">
                  <BrainstormChat
                    onSuggestedTagClick={
                      handleSuggestedTagClick
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Journal History */}
          {activeTab ===
            'history' && (
            <div className="space-y-6 animate-fade-in">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    Journal History
                  </h1>

                  <p className="text-xs text-stone-500 font-sans">
                    All reflections saved
                    securely under your
                    verified Firebase UID.
                  </p>
                </div>
              </div>

              <JournalList
                onRefreshTrigger={
                  refreshCounter
                }
                initialSubTab={
                  historySubTab
                }
                filterApprovedSnapshots={
                  filterApprovedSnapshots
                }
                highlightDiffId={
                  highlightDiffId
                }
                onDataChanged={
                  handleDataChanged
                }
              />
            </div>
          )}

          <SecurityBadge />
        </main>
      </div>
    </div>
  );
}