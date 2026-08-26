import { useCallback, useEffect, useState } from 'react';
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

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<MainTab>('overview');

  const [historySubTab, setHistorySubTab] =
    useState<HistorySubTab>('reflections');

  const [filterApprovedSnapshots, setFilterApprovedSnapshots] =
    useState(false);

  const [highlightDiffId, setHighlightDiffId] =
    useState<string | null>(null);

  const [privateSessionMode, setPrivateSessionMode] =
    useState(false);

  const [externalTags, setExternalTags] =
    useState<string[]>([]);

  const [refreshCounter, setRefreshCounter] =
    useState(0);

  const [entries, setEntries] =
    useState<JournalEntry[]>([]);

  const [snapshots, setSnapshots] =
    useState<ThoughtSnapshot[]>([]);

  const [diffs, setDiffs] =
    useState<ThoughtDiff[]>([]);

  const [dataLoading, setDataLoading] =
    useState(false);

  const [dataError, setDataError] =
    useState<string | null>(null);

  /*
   * Firebase Authentication
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        } else {
          setUser(null);

          setEntries([]);
          setSnapshots([]);
          setDiffs([]);

          setActiveTab('overview');
          setHistorySubTab('reflections');
          setFilterApprovedSnapshots(false);
          setHighlightDiffId(null);
          setPrivateSessionMode(false);
        }

        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /*
   * Single source of truth for Overview data.
   */
  const loadData = useCallback(async () => {
    if (!user) {
      return;
    }

    setDataLoading(true);
    setDataError(null);

    try {
      const [
        journalData,
        snapshotData,
        diffData,
      ] = await Promise.all([
        fetchJournalEntries(),
        fetchThoughtSnapshots(),
        fetchThoughtDiffs(),
      ]);

      setEntries(
        Array.isArray(journalData)
          ? journalData
          : []
      );

      setSnapshots(
        Array.isArray(snapshotData)
          ? snapshotData
          : []
      );

      setDiffs(
        Array.isArray(diffData)
          ? diffData
          : []
      );
    } catch (err: unknown) {
      console.error(
        '[MirrorTrace] Dashboard data load failed:',
        err
      );

      setDataError(
        (err as Error)?.message ||
          'Unable to refresh MirrorTrace data.'
      );

      /*
       * Important:
       * We intentionally keep previous data.
       *
       * A temporary API failure must not turn
       * 2 snapshots into a fake "0 snapshots".
       */
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  /*
   * Initial load and refresh after persistent mutations.
   */
  useEffect(() => {
    if (user) {
      void loadData();
    }
  }, [user, refreshCounter, loadData]);

  /*
   * Child components call this whenever Firestore data changed.
   */
  const handleDataChanged = useCallback(() => {
    setRefreshCounter((previous) => previous + 1);
  }, []);

  const handleSignOut = async () => {
    try {
      await logOut();

      setUser(null);
      setEntries([]);
      setSnapshots([]);
      setDiffs([]);
    } catch (err) {
      console.error(
        '[MirrorTrace] Logout error:',
        err
      );
    }
  };

  const handleEntrySaved = (_entry: JournalEntry) => {
    handleDataChanged();
  };

  const handleSuggestedTagClick = (tag: string) => {
    setExternalTags((previous) =>
      previous.includes(tag)
        ? previous
        : [...previous, tag]
    );
  };

  const handleNavigate = (
    tab: MainTab,
    options?: {
      privateSession?: boolean;
      subTab?: HistorySubTab;
      filterApprovedSnapshots?: boolean;
      highlightDiffId?: string;
    }
  ) => {
    /*
     * Normal Reflect & Chat navigation disables
     * Private Session.
     *
     * The Private Session dashboard action enables it.
     */
    if (tab === 'journal') {
      setPrivateSessionMode(
        Boolean(options?.privateSession)
      );
    }

    if (options?.subTab) {
      setHistorySubTab(options.subTab);
    }

    setFilterApprovedSnapshots(
      Boolean(options?.filterApprovedSnapshots)
    );

    setHighlightDiffId(
      options?.highlightDiffId || null
    );

    setActiveTab(tab);
  };

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
          Verifying authentication session...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthView
        onSuccess={handleDataChanged}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-between">
      <div className="w-full">
        <Navbar
          user={user}
          activeTab={activeTab}
          onTabChange={(tab) =>
            handleNavigate(tab)
          }
          onSignOut={handleSignOut}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {dataError && activeTab === 'overview' && (
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs text-amber-950">
                MirrorTrace could not completely refresh
                your dashboard. Your previously loaded
                data is still shown.
              </p>

              <button
                type="button"
                onClick={() => void loadData()}
                className="text-xs font-semibold text-amber-900 underline shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {activeTab === 'overview' && (
            <DashboardOverview
              entries={entries}
              snapshots={snapshots}
              diffs={diffs}
              loading={dataLoading}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'journal' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    Reflective Space
                  </h1>

                  <p className="text-xs text-stone-500 font-sans">
                    Articulate thoughts with the brainstorm
                    companion, or write down your reflection
                    directly.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-6 space-y-6">
                  <JournalEditor
                    onEntrySaved={handleEntrySaved}
                    externalTags={externalTags}
                    onClearExternalTags={() =>
                      setExternalTags([])
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

          {activeTab === 'history' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    Journal History
                  </h1>

                  <p className="text-xs text-stone-500 font-sans">
                    All reflections saved securely under
                    your verified Firebase UID.
                  </p>
                </div>
              </div>

              <JournalList
                onRefreshTrigger={refreshCounter}
                initialSubTab={historySubTab}
                filterApprovedSnapshots={
                  filterApprovedSnapshots
                }
                highlightDiffId={highlightDiffId}
                onDataChanged={handleDataChanged}
              />
            </div>
          )}

          <SecurityBadge />
        </main>
      </div>
    </div>
  );
}