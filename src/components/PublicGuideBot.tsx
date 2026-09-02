import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Bot,
  Send,
  X,
} from 'lucide-react';


type GuideMessage = {
  id: number;
  role: 'bot' | 'user';
  text: string;
};


const QUICK_QUESTIONS = [
  'What does MirrorTrace do?',
  'How is my journal private?',
  'What is a Thought Diff?',
  'What is Memory Governance?',
  'What is MirrorRoom?',
  'How do I navigate the app?',
];


const ANSWERS: Array<{
  keywords: string[];
  answer: string;
}> = [
  {
    keywords: [
      'what does mirrortrace',
      'what is mirrortrace',
      'application',
      'app',
      'purpose',
    ],
    answer:
      'MirrorTrace is a privacy-first reflective intelligence app. You can write reflections, brainstorm with Gemini, approve what AI memory is allowed to persist, compare how your thinking changes through Thought Diffs, revisit perspectives later, and selectively collaborate through MirrorRoom.',
  },
  {
    keywords: [
      'navigate',
      'navigation',
      'pages',
      'navbar',
      'overview',
    ],
    answer:
      'After signing in, use the navbar: Overview shows your reflection activity; Reflect & Chat is where you write or brainstorm; Journal History contains saved reflections and tools; Memory controls approved AI memory and perspective tracking; Support is for privacy-aware help; Feedback lets you submit product reviews with consent.',
  },
  {
    keywords: [
      'journal',
      'history',
      'reflection',
      'write',
    ],
    answer:
      'Journal History is your owner-isolated archive of saved reflections. You can search, filter, revisit, edit, favorite, review decisions, inspect reflection chains, use version history, and explore other journal tools without automatically exposing those entries to other users or MirrorRoom.',
  },
  {
    keywords: [
      'private',
      'privacy',
      'secure',
      'security',
      'uid',
    ],
    answer:
      'Private MirrorTrace data is scoped to your authenticated Firebase UID. MirrorRoom does not automatically read your journal, Thought Snapshots, Thought Diffs, conversations, or reusable AI memory. Admin operations are designed around operational metadata instead of unrestricted access to private reflection content.',
  },
  {
    keywords: [
      'thought snapshot',
      'snapshot',
      'memory approval',
      'approve memory',
    ],
    answer:
      'A Thought Snapshot is Gemini’s proposed interpretation of a reflection. It does not become reusable AI memory until you explicitly accept it. You can accept it, edit the wording before accepting, or reject it.',
  },
  {
    keywords: [
      'thought diff',
      'diff',
      'changed',
      'perspective',
    ],
    answer:
      'A Thought Diff compares related approved Thought Snapshots from different moments in time. It can show your earlier position, current position, what changed, what stayed consistent, and the evidence behind that comparison.',
  },
  {
    keywords: [
      'provenance',
      'why am i seeing',
      'evidence',
    ],
    answer:
      'Provenance is MirrorTrace’s evidence trail. When a Thought Diff is shown, “Why am I seeing this?” lets you inspect the source reflections and approved positions that support the comparison.',
  },
  {
    keywords: [
      'memory governance',
      'memory',
      'revoke',
      'retention',
      'export',
    ],
    answer:
      'Memory Governance is your control center for reusable AI memory. You can inspect approved memories, see retention status, manage Perspective Watches, export governed memory, and revoke memory you no longer want reused.',
  },
  {
    keywords: [
      'perspective watch',
      'watch',
      'reminder',
      'revisit',
    ],
    answer:
      'Perspective Watch lets you intentionally schedule a future revisit of a Thought Diff. It can remind you later using safe topic-level context, rather than automatically deciding which beliefs matter.',
  },
  {
    keywords: [
      'mirrorroom',
      'room',
      'collaborate',
      'invite',
      'share thought',
    ],
    answer:
      'MirrorRoom is temporary, consent-based collaborative reflection. Participants think privately first and explicitly share selected thoughts. Joining a room does not expose personal journal history or reusable AI memory. You can also save only your own takeaway back into your private journal.',
  },
  {
    keywords: [
      'support',
      'help',
      'customer support',
    ],
    answer:
      'Customer Support lets you intentionally submit a support message. The support workflow is separate from your private journal, so asking for help does not automatically submit your reflection history.',
  },
  {
    keywords: [
      'feedback',
      'review',
      'public review',
    ],
    answer:
      'Feedback lets you submit a product review and decide whether it may be considered for public display. Public appearance is consent-controlled and also requires moderation approval.',
  },
  {
    keywords: [
      'gemini',
      'brainstorm',
      'reflective brainstorm',
      'ai companion',
    ],
    answer:
      'Reflective Brainstorm is the Gemini-powered thinking companion. It helps you clarify a decision, conflict, question, or perspective. Ordinary misspellings are usually understood by Gemini, while MirrorTrace keeps the wording you actually typed instead of silently rewriting your journal text.',
  },
  {
    keywords: [
      'admin',
      'administrator',
      'control room',
    ],
    answer:
      'The Admin Control Room is for operational management such as service health, support, moderation, audit activity, and MirrorRoom metadata. The privacy design avoids turning administrators into unrestricted readers of private reflection content.',
  },
];


function normalize(
  value: string
): string {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9\s]/g,
      ' '
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}


function answerQuestion(
  question: string
): string {
  const normalized =
    normalize(
      question
    );

  let best:
    {
      score: number;
      answer: string;
    } | null =
    null;

  for (
    const candidate
    of ANSWERS
  ) {
    const score =
      candidate.keywords
        .reduce(
          (
            total,
            keyword
          ) =>
            normalized.includes(
              keyword
            )
              ? total +
                keyword
                  .split(
                    ' '
                  )
                  .length
              : total,
          0
        );

    if (
      score >
      (
        best?.score ??
        0
      )
    ) {
      best = {
        score,
        answer:
          candidate.answer,
      };
    }
  }

  if (
    best &&
    best.score >
    0
  ) {
    return best.answer;
  }

  return 'I’m TraceBot, so I only explain MirrorTrace itself. Ask me about navigation, Journal History, Reflect & Chat, Thought Snapshots, Thought Diffs, provenance, Memory Governance, Perspective Watch, MirrorRoom, privacy, Support, Feedback, or the Admin privacy boundary.';
}


export default function PublicGuideBot() {
  const [
    publicPageVisible,
    setPublicPageVisible,
  ] =
    useState(false);

  const [
    open,
    setOpen,
  ] =
    useState(false);

  const [
    sloganVisible,
    setSloganVisible,
  ] =
    useState(true);

  const [
    input,
    setInput,
  ] =
    useState('');

  const [
    messages,
    setMessages,
  ] =
    useState<
      GuideMessage[]
    >([
      {
        id:
          1,
        role:
          'bot',
        text:
          'Hi! I’m TraceBot. I can explain what MirrorTrace does, where features live, and how its privacy controls work.',
      },
    ]);


  useEffect(
    () => {
      const updateVisibility =
        () => {
          const visible =
            Boolean(
              document.querySelector(
                '.mirrortrace-auth-page'
              )
            );

          setPublicPageVisible(
            visible
          );

          if (
            !visible
          ) {
            setOpen(
              false
            );
          }
        };

      updateVisibility();

      const observer =
        new MutationObserver(
          updateVisibility
        );

      observer.observe(
        document.body,
        {
          childList:
            true,
          subtree:
            true,
        }
      );

      return () => {
        observer.disconnect();
      };
    },
    []
  );


  useEffect(
    () => {
      if (
        !publicPageVisible
      ) {
        return;
      }

      setSloganVisible(
        true
      );

      const timeout =
        window.setTimeout(
          () => {
            if (
              !open
            ) {
              setSloganVisible(
                false
              );
            }
          },
          7000
        );

      return () =>
        window.clearTimeout(
          timeout
        );
    },
    [
      publicPageVisible,
      open,
    ]
  );


  const nextId =
    useMemo(
      () =>
        messages.reduce(
          (
            max,
            message
          ) =>
            Math.max(
              max,
              message.id
            ),
          0
        ) +
        1,
      [
        messages,
      ]
    );


  const ask =
    (
      question: string
    ) => {
      const clean =
        question.trim();

      if (
        !clean
      ) {
        return;
      }

      const response =
        answerQuestion(
          clean
        );

      setMessages(
        (
          current
        ) => [
          ...current,
          {
            id:
              nextId,
            role:
              'user',
            text:
              clean,
          },
          {
            id:
              nextId +
              1,
            role:
              'bot',
            text:
              response,
          },
        ]
      );

      setInput('');
      setOpen(true);
      setSloganVisible(false);
    };


  const submit =
    (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();
      ask(input);
    };


  if (
    !publicPageVisible
  ) {
    return null;
  }


  return (
    <aside
      className="
        mirrortrace-guidebot
      "
      aria-label="
        MirrorTrace guide assistant
      "
    >
      {!open &&
        sloganVisible && (
          <div
            className="
              mirrortrace-guidebot-slogan
            "
          >
            Hi, wanna know more
            about the application?
          </div>
        )}


      {open && (
        <section
          className="
            mirrortrace-guidebot-panel
          "
          aria-label="
            TraceBot conversation
          "
        >
          <header
            className="
              mirrortrace-guidebot-header
            "
          >
            <div
              className="
                mirrortrace-guidebot-title
              "
            >
              <div
                className="
                  mirrortrace-guidebot-robot
                "
              >
                <Bot
                  className="
                    h-5
                    w-5
                  "
                />
              </div>

              <div>
                <h2
                  className="
                    mirrortrace-guidebot-heading
                  "
                >
                  TraceBot
                </h2>

                <p
                  className="
                    mirrortrace-guidebot-subtitle
                  "
                >
                  MirrorTrace
                  navigation & product guide
                </p>
              </div>
            </div>

            <button
              type="
                button
              "
              className="
                mirrortrace-guidebot-close
              "
              onClick={() =>
                setOpen(
                  false
                )
              }
              aria-label="
                Close TraceBot
              "
            >
              <X
                className="
                  h-4
                  w-4
                "
              />
            </button>
          </header>


          <div
            className="
              mirrortrace-guidebot-body
            "
          >
            {messages.map(
              (
                message
              ) => (
                <div
                  key={
                    message.id
                  }
                  className={`
                    mirrortrace-guidebot-message
                    ${
                      message.role ===
                      'bot'
                        ? 'mirrortrace-guidebot-message-bot'
                        : 'mirrortrace-guidebot-message-user'
                    }
                  `}
                >
                  {
                    message.text
                  }
                </div>
              )
            )}


            <div
              className="
                mirrortrace-guidebot-quick
              "
            >
              {QUICK_QUESTIONS.map(
                (
                  question
                ) => (
                  <button
                    key={
                      question
                    }
                    type="
                      button
                    "
                    onClick={() =>
                      ask(
                        question
                      )
                    }
                  >
                    {
                      question
                    }
                  </button>
                )
              )}
            </div>
          </div>


          <form
            className="
              mirrortrace-guidebot-form
            "
            onSubmit={
              submit
            }
          >
            <input
              className="
                mirrortrace-guidebot-input
              "
              value={
                input
              }
              onChange={(
                event
              ) =>
                setInput(
                  event
                    .target
                    .value
                )
              }
              placeholder="
                Ask about MirrorTrace...
              "
              aria-label="
                Ask TraceBot about MirrorTrace
              "
            />

            <button
              type="
                submit
              "
              className="
                mirrortrace-guidebot-send
              "
              aria-label="
                Send question
              "
            >
              <Send
                className="
                  h-4
                  w-4
                "
              />
            </button>
          </form>
        </section>
      )}


      {!open && (
        <button
          type="
            button
          "
          className="
            mirrortrace-guidebot-launcher
          "
          onClick={() => {
            setOpen(
              true
            );

            setSloganVisible(
              false
            );
          }}
          aria-label="
            Open TraceBot
          "
          title="
            Ask TraceBot about MirrorTrace
          "
        >
          <Bot
            className="
              h-7
              w-7
            "
          />
        </button>
      )}
    </aside>
  );
}
