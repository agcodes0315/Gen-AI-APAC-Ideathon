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
  'How is this different from ChatGPT?',
  'How do I navigate the app?',
];


type KnowledgeItem = {
  patterns: string[];
  answer: string;
};


const KNOWLEDGE: KnowledgeItem[] = [
  {
    patterns: [
      'different from chatgpt',
      'difference from chatgpt',
      'vs chatgpt',
      'compare to chatgpt',
      'why not chatgpt',
      'why mirrortrace',
    ],
    answer:
      'MirrorTrace is built around governed personal reflection instead of general conversation. It keeps a private journal archive and lets you approve AI memory before it becomes reusable. It can compare approved reflections over time through Thought Diffs and provenance. It also supports Perspective Watch and selective collaboration through MirrorRoom. ChatGPT is a broad assistant. MirrorTrace is a focused reflection system with explicit memory consent and traceable perspective change.',
  },
  {
    patterns: [
      'what does mirrortrace',
      'what is mirrortrace',
      'about mirrortrace',
      'what does this app',
      'what is this app',
      'application',
      'purpose',
    ],
    answer:
      'MirrorTrace is a privacy-first reflective intelligence app. You can write reflections and brainstorm with Gemini. You decide which AI interpretations may become reusable memory. Thought Diffs can show how your thinking changes over time. Provenance lets you inspect the evidence behind those comparisons. MirrorRoom lets people collaborate by sharing only the thoughts they choose.',
  },
  {
    patterns: [
      'navigate',
      'navigation',
      'where do i go',
      'pages',
      'navbar',
      'menu',
    ],
    answer:
      'Use the navbar after signing in. Overview shows your activity. Reflect & Chat is for writing and Gemini brainstorming. Journal History contains saved reflections and journal tools. Memory contains approved AI memory and perspective controls. Support is for help. Feedback is for product reviews and public consent.',
  },
  {
    patterns: [
      'journal private',
      'privacy',
      'private',
      'secure',
      'security',
      'uid',
      'who can see',
    ],
    answer:
      'Your private MirrorTrace data is scoped to your authenticated Firebase UID. MirrorRoom does not automatically read your private journal or reusable AI memory. Admin operations are designed around operational data and submitted support or review content instead of unrestricted access to private reflections.',
  },
  {
    patterns: [
      'journal history',
      'journal',
      'saved reflection',
      'reflection history',
    ],
    answer:
      'Journal History is your private archive of saved reflections. You can search and filter entries. You can revisit ideas and use tools such as favorites and editing. The journal stays separate from MirrorRoom unless you deliberately share a thought or save your own takeaway.',
  },
  {
    patterns: [
      'thought snapshot',
      'snapshot',
      'approve memory',
      'memory approval',
    ],
    answer:
      'A Thought Snapshot is an AI interpretation proposed from a reflection. It does not become reusable memory automatically. You can accept it or edit it before accepting it. You can also reject it.',
  },
  {
    patterns: [
      'thought diff',
      'diff',
      'what changed',
      'thinking changed',
      'perspective changed',
    ],
    answer:
      'A Thought Diff compares related approved Thought Snapshots from different moments. It can show an earlier position and a current position. It can also explain what changed and what stayed consistent. Provenance links the comparison back to the reflections that support it.',
  },
  {
    patterns: [
      'provenance',
      'why am i seeing this',
      'evidence',
      'source reflection',
    ],
    answer:
      'Provenance is the evidence trail behind a Thought Diff. The feature helps you inspect the source reflections and approved positions that support a generated comparison.',
  },
  {
    patterns: [
      'memory governance',
      'memory center',
      'revoke memory',
      'retention',
      'export memory',
    ],
    answer:
      'Memory Governance is the control center for reusable AI memory. You can inspect approved memories and retention information. You can review active Perspective Watches. You can export governed memory and revoke memory you no longer want reused.',
  },
  {
    patterns: [
      'perspective watch',
      'watch',
      'revisit later',
      'reminder',
    ],
    answer:
      'Perspective Watch lets you intentionally schedule a future revisit of a Thought Diff. It gives you control over when a perspective should be reviewed again instead of letting AI decide that automatically.',
  },
  {
    patterns: [
      'mirrorroom',
      'mirror room',
      'collaborate',
      'room',
      'invite code',
      'share thought',
    ],
    answer:
      'MirrorRoom is temporary consent-based collaborative reflection. Participants think privately and share selected thoughts deliberately. Joining a room does not expose personal journal history or reusable AI memory. A participant can save only their own takeaway back to their private journal.',
  },
  {
    patterns: [
      'support',
      'customer support',
      'help safely',
    ],
    answer:
      'Customer Support lets you submit a support message intentionally. The support workflow is separate from your private journal. Asking for help does not automatically send your journal history.',
  },
  {
    patterns: [
      'feedback',
      'review',
      'public review',
    ],
    answer:
      'Feedback lets you submit a product review. Public display requires the appropriate consent and moderation state. Your review is not automatically made public.',
  },
  {
    patterns: [
      'gemini',
      'brainstorm',
      'reflective brainstorm',
      'ai companion',
      'misspell',
      'typo',
      'spelling',
    ],
    answer:
      'Reflective Brainstorm uses Gemini to help you clarify a decision or perspective. Common misspellings are usually understood from context. MirrorTrace keeps the wording you typed instead of silently rewriting your journal text.',
  },
  {
    patterns: [
      'admin',
      'administrator',
      'control room',
    ],
    answer:
      'The Admin Control Room is for operational management such as service health and moderation. The design keeps private reflection content outside ordinary admin visibility. MirrorRoom admin analytics are limited to operational metadata.',
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


function words(
  value: string
): string[] {
  return normalize(value)
    .split(' ')
    .filter(Boolean);
}


function similarity(
  question: string,
  pattern: string
): number {
  const q =
    normalize(question);

  const p =
    normalize(pattern);

  if (
    q.includes(p)
  ) {
    return 100 +
      p.length;
  }

  const qWords =
    new Set(
      words(q)
    );

  const pWords =
    words(p);

  let matches =
    0;

  for (
    const word
    of pWords
  ) {
    if (
      qWords.has(word)
    ) {
      matches +=
        1;
    }
  }

  return matches;
}


function answerQuestion(
  question: string
): string {
  let bestScore =
    0;

  let bestAnswer =
    '';

  for (
    const item
    of KNOWLEDGE
  ) {
    for (
      const pattern
      of item.patterns
    ) {
      const score =
        similarity(
          question,
          pattern
        );

      if (
        score >
        bestScore
      ) {
        bestScore =
          score;

        bestAnswer =
          item.answer;
      }
    }
  }

  if (
    bestScore >=
    1
  ) {
    return bestAnswer;
  }

  return 'I only explain MirrorTrace and how to use it. Ask me about navigation or Journal History. You can also ask about Reflect & Chat or Thought Snapshots. I can explain Thought Diffs and provenance. I can also explain Memory Governance or Perspective Watch. MirrorRoom and privacy are supported topics too.';
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
          'Hi! I’m TraceBot. I can explain what MirrorTrace does and where features live. I can also explain how its privacy controls work.',
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
                  MirrorTrace navigation
                  and product guide
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
