import {
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

import {
  onAuthStateChanged,
} from 'firebase/auth';

import {
  auth,
  logOut,
} from './lib/firebase.ts';

import {
  Navbar,
} from './components/Navbar.tsx';

import {
  AuthView,
} from './components/AuthView.tsx';

import {
  DashboardOverview,
} from './components/DashboardOverview.tsx';

import {
  JournalEditor,
} from './components/JournalEditor.tsx';

import {
  BrainstormChat,
} from './components/BrainstormChat.tsx';

import {
  JournalList,
} from './components/JournalList.tsx';

import {
  SecurityBadge,
} from './components/SecurityBadge.tsx';

import {
  MemoryGovernanceCenter,
} from './components/MemoryGovernanceCenter.tsx';

import SupportCenter from './components/SupportCenter.tsx';

import ProductReviews from './components/ProductReviews.tsx';

import AdminPanelLauncher from './components/AdminPanelLauncher.tsx';

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

import './styles/mirrortrace-authenticated-black-final.css';

export type MainTab =
  | 'overview'
  | 'journal'
  | 'history'
  | 'memory'
  | 'support'
  | 'feedback';

type HistorySubTab =
  | 'reflections'
  | 'diffs';

const scrollPageToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'auto',
  });

  document.documentElement.scrollTop =
    0;

  document.body.scrollTop =
    0;
};

export default function App() {
  const [
    user,
    setUser,
  ] =
    useState<UserProfile | null>(
      null
    );

  const [
    authLoading,
    setAuthLoading,
  ] =
    useState(true);

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<MainTab>(
      'overview'
    );

  const [
    historySubTab,
    setHistorySubTab,
  ] =
    useState<HistorySubTab>(
      'reflections'
    );

  const [
    filterApprovedSnapshots,
    setFilterApprovedSnapshots,
  ] =
    useState(false);

  const [
    highlightDiffId,
    setHighlightDiffId,
  ] =
    useState<string | null>(
      null
    );

  const [
    privateSessionMode,
    setPrivateSessionMode,
  ] =
    useState(false);

  const [
    externalTags,
    setExternalTags,
  ] =
    useState<string[]>([]);

  const [
    refreshCounter,
    setRefreshCounter,
  ] =
    useState(0);

  const [
    entries,
    setEntries,
  ] =
    useState<JournalEntry[]>([]);

  const [
    snapshots,
    setSnapshots,
  ] =
    useState<ThoughtSnapshot[]>([]);

  const [
    diffs,
    setDiffs,
  ] =
    useState<ThoughtDiff[]>([]);

  const [
    dataLoading,
    setDataLoading,
  ] =
    useState(true);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (
          firebaseUser
        ) => {
          if (
            firebaseUser
          ) {
            setUser({
              uid:
                firebaseUser.uid,

              email:
                firebaseUser.email,

              displayName:
                firebaseUser.displayName,

              photoURL:
                firebaseUser.photoURL,
            });
          } else {
            setUser(
              null
            );
          }

          setAuthLoading(
            false
          );
        }
      );

    return () =>
      unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    document.documentElement.setAttribute(
      'data-theme',
      'dark'
    );

    document.documentElement.style.colorScheme =
      'dark';

    try {
      localStorage.setItem(
        'mirrortrace-theme',
        'dark'
      );

      localStorage.setItem(
        'theme',
        'dark'
      );
    } catch {
      // Ignore storage errors.
    }
  }, [user]);

  useLayoutEffect(() => {
    scrollPageToTop();
  }, [
    activeTab,
    historySubTab,
    user?.uid,
  ]);

  const loadData =
    async () => {
      if (!user) {
        return;
      }

      try {
        setDataLoading(
          true
        );

        const [
          journalData,
          snapshotData,
          diffData,
        ] =
          await Promise.all([
            fetchJournalEntries()
              .catch(
                () => []
              ),

            fetchThoughtSnapshots()
              .catch(
                () => []
              ),

            fetchThoughtDiffs()
              .catch(
                () => []
              ),
          ]);

        setEntries(
          journalData
        );

        setSnapshots(
          snapshotData
        );

        setDiffs(
          diffData
        );
      } catch (
        err
      ) {
        console.error(
          'Failed to load user data:',
          err
        );
      } finally {
        setDataLoading(
          false
        );
      }
    };

  useEffect(() => {
    if (user) {
      void loadData();
    }
  }, [
    user,
    refreshCounter,
  ]);

  const handleSignOut =
    async () => {
      try {
        await logOut();

        setUser(
          null
        );

        setEntries(
          []
        );

        setSnapshots(
          []
        );

        setDiffs(
          []
        );

        setActiveTab(
          'overview'
        );

        setHistorySubTab(
          'reflections'
        );

        setFilterApprovedSnapshots(
          false
        );

        setHighlightDiffId(
          null
        );

        setPrivateSessionMode(
          false
        );

        setExternalTags(
          []
        );

        requestAnimationFrame(
          () => {
            scrollPageToTop();
          }
        );
      } catch (
        err
      ) {
        console.error(
          'Logout error:',
          err
        );
      }
    };

  const handleEntrySaved =
    (
      _entry:
        JournalEntry
    ) => {
      setRefreshCounter(
        (
          previous
        ) =>
          previous +
          1
      );
    };

  const handleSuggestedTagClick =
    (
      tag:
        string
    ) => {
      setExternalTags(
        (
          previous
        ) =>
          previous.includes(
            tag
          )
            ? previous
            : [
                ...previous,
                tag,
              ]
      );
    };

  const handleNavigate =
    (
      tab:
        MainTab,

      options?: {
        privateSession?:
          boolean;

        subTab?:
          HistorySubTab;

        filterApprovedSnapshots?:
          boolean;

        highlightDiffId?:
          string;
      }
    ) => {
      if (
        options
          ?.privateSession
      ) {
        setPrivateSessionMode(
          true
        );
      } else if (
        tab ===
        'journal'
      ) {
        setPrivateSessionMode(
          false
        );
      }

      if (
        options?.subTab
      ) {
        setHistorySubTab(
          options.subTab
        );
      }

      setFilterApprovedSnapshots(
        Boolean(
          options
            ?.filterApprovedSnapshots
        )
      );

      setHighlightDiffId(
        options
          ?.highlightDiffId ??
          null
      );

      setActiveTab(
        tab
      );

      requestAnimationFrame(
        () => {
          scrollPageToTop();
        }
      );
    };

  if (
    authLoading
  ) {
    return (
      <div className="min-h-screen bg-[#090d11] flex flex-col items-center justify-center space-y-3 text-white">

        <div className="w-10 h-10 rounded-xl bg-[#617057] flex items-center justify-center text-white shadow-xs">

          <span className="font-serif font-bold text-lg">
            M
          </span>
        </div>

        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />

        <p className="text-xs text-white/60 font-sans">
          Verifying authentication
          session...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthView
        onSuccess={() => {
          setActiveTab(
            'overview'
          );

          setRefreshCounter(
            (
              previous
            ) =>
              previous +
              1
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

  return (
    <div
      className="
        mirrortrace-app-shell
        mirrortrace-authenticated-shell
        min-h-screen
        flex
        flex-col
        justify-between
      "
    >

      <div className="w-full">

        <Navbar
          user={
            user
          }
          activeTab={
            activeTab
          }
          onTabChange={(
            tab
          ) =>
            handleNavigate(
              tab
            )
          }
          onSignOut={
            handleSignOut
          }
        />

        <main
          className="
            mirrortrace-authenticated-main
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            py-8
          "
        >

          {activeTab ===
            'overview' && (
            <div className="mirrortrace-overview-page">
              <DashboardOverview
                entries={
                  entries
                }
                snapshots={
                  snapshots
                }
                diffs={
                  diffs
                }
                loading={
                  dataLoading
                }
                onNavigate={
                  handleNavigate
                }
              />
            </div>
          )}

          {activeTab ===
            'journal' && (
            <div
              className="
                mirrortrace-reflect-page
                space-y-6
                animate-fade-in
              "
            >

              <div
                className="
                  mirrortrace-page-heading
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  justify-between
                  gap-2
                  border-b
                  pb-4
                "
              >

                <div>

                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    Reflective Space
                  </h1>

                  <p className="text-xs text-white/65 font-sans">
                    Articulate thoughts with the brainstorm
                    companion, or write down your reflection
                    directly.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                <div
                  className="
                    mirrortrace-compose-column
                    lg:col-span-6
                    space-y-6
                  "
                >

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

                <div
                  className="
                    mirrortrace-brainstorm-column
                    lg:col-span-6
                  "
                >

                  <BrainstormChat
                    onSuggestedTagClick={
                      handleSuggestedTagClick
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab ===
            'history' && (
            <div
              className="
                mirrortrace-history-page
                space-y-6
                animate-fade-in
              "
            >

              <div
                className="
                  mirrortrace-page-heading
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  justify-between
                  gap-2
                  border-b
                  pb-4
                "
              >

                <div>

                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    Journal History
                  </h1>

                  <p className="text-xs text-white/65 font-sans">
                    All reflections saved securely under your
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
                onDataChanged={() => {
                  setRefreshCounter(
                    (
                      previous
                    ) =>
                      previous +
                      1
                  );
                }}
              />
            </div>
          )}

          {activeTab ===
            'memory' && (
            <div
              className="
                mirrortrace-memory-governance
                mirrortrace-memory-page
              "
            >
              <MemoryGovernanceCenter
                onMemoryChanged={() => {
                  setRefreshCounter(
                    (
                      previous
                    ) =>
                      previous +
                      1
                  );
                }}
              />
            </div>
          )}

          {activeTab ===
            'support' && (
            <div
              className="
                mirrortrace-support-page
                space-y-6
                animate-fade-in
              "
            >

              <div
                className="
                  mirrortrace-page-heading
                  border-b
                  pb-4
                "
              >

                <div className="flex flex-wrap items-center gap-2">

                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    Customer Support
                  </h1>

                  <span className="rounded-full border border-emerald-200/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
                    Privacy-aware
                  </span>
                </div>

                <p className="mt-1 text-xs text-white/65">
                  Ask for help without exposing your private
                  reflection history.
                </p>
              </div>

              <SupportCenter />
            </div>
          )}

          {activeTab ===
            'feedback' && (
            <div
              className="
                mirrortrace-feedback-page
                space-y-6
                animate-fade-in
              "
            >

              <div
                className="
                  mirrortrace-page-heading
                  border-b
                  pb-4
                "
              >

                <div className="flex flex-wrap items-center gap-2">

                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    Feedback
                  </h1>

                  <span className="rounded-full border border-amber-200/25 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-200">
                    Consent controlled
                  </span>
                </div>

                <p className="mt-1 text-xs text-white/65">
                  Share product feedback and decide whether your
                  review may be considered for public display.
                </p>
              </div>

              <ProductReviews />
            </div>
          )}

          <SecurityBadge />
        </main>
      </div>

      <AdminPanelLauncher />
    </div>
  );
}
