import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Send,
  Bot,
  User,
  Sparkles,
  Plus,
  AlertCircle,
  RefreshCw,
  MessageSquarePlus,
} from 'lucide-react';

import {
  createConversation,
  sendConversationMessage,
  ApiError,
} from '../lib/api.ts';

import type {
  ConversationMessage,
} from '../types.ts';



interface BrainstormChatProps {
  onSuggestedTagClick?: (
    tag: string
  ) => void;
}


function getReadableError(
  err: unknown,
  fallback: string
): string {
  if (
    err instanceof
    ApiError
  ) {
    if (
      err.status ===
      401
    ) {
      return 'Your session could not be verified. Please sign in again.';
    }

    if (
      err.status ===
      403
    ) {
      return 'You do not have permission to access this conversation.';
    }

    if (
      err.status ===
      404
    ) {
      return 'The requested conversation could not be found.';
    }

    if (
      err.status ===
      429
    ) {
      return 'The AI service is temporarily busy. Please wait a moment and retry.';
    }

    if (
      err.status ===
      503
    ) {
      return 'The AI service is temporarily unavailable. Please retry shortly.';
    }

    if (
      err.code
    ) {
      return `${err.message} (${err.code})`;
    }

    return (
      err.message ||
      fallback
    );
  }

  if (
    err instanceof Error &&
    err.message
  ) {
    return err.message;
  }

  return fallback;
}


export const BrainstormChat:
  React.FC<BrainstormChatProps> = ({
    onSuggestedTagClick,
  }) => {
    const [
      conversationId,
      setConversationId,
    ] =
      useState<
        string | null
      >(null);

    const [
      messages,
      setMessages,
    ] =
      useState<
        ConversationMessage[]
      >([]);

    const [
      input,
      setInput,
    ] =
      useState('');

    const [
      loading,
      setLoading,
    ] =
      useState(false);

    const [
      initLoading,
      setInitLoading,
    ] =
      useState(true);

    const [
      error,
      setError,
    ] =
      useState<
        string | null
      >(null);

    const [
      lastFailedMessage,
      setLastFailedMessage,
    ] =
      useState<
        string | null
      >(null);

    const [
      suggestedTags,
      setSuggestedTags,
    ] =
      useState<
        string[]
      >([]);

    const messagesEndRef =
      useRef<
        HTMLDivElement
      >(null);


    const initializeConversation =
      async () => {
        setInitLoading(
          true
        );

        setError(
          null
        );

        try {
          console.info(
            '[MirrorTrace] Initializing conversation...'
          );

          const response =
            await createConversation(
              'Journal Brainstorm Dialogue'
            );

          if (
            !response?.conversationId
          ) {
            throw new Error(
              'The server did not return a conversation ID.'
            );
          }

          console.info(
            '[MirrorTrace] Conversation initialized:',
            response.conversationId
          );

          setConversationId(
            response.conversationId
          );

          return (
            response.conversationId
          );
        } catch (
          err: unknown
        ) {
          console.error(
            '[MirrorTrace] Conversation initialization failed:',
            err
          );

          const message =
            getReadableError(
              err,
              'Could not initialize your secure conversation.'
            );

          setConversationId(
            null
          );

          setError(
            message
          );

          return null;
        } finally {
          setInitLoading(
            false
          );
        }
      };


    useEffect(
      () => {
        void initializeConversation();
      },
      []
    );


    useEffect(
      () => {
        messagesEndRef.current
          ?.scrollIntoView({
            behavior:
              'smooth',
          });
      },
      [
        messages,
        loading,
      ]
    );


    const handleStartNewThread =
      async () => {
        if (
          loading ||
          initLoading
        ) {
          return;
        }

        setMessages(
          []
        );

        setSuggestedTags(
          []
        );

        setLastFailedMessage(
          null
        );

        setConversationId(
          null
        );

        await initializeConversation();
      };


    const handleRetryInitialization =
      async () => {
        await initializeConversation();
      };


    const handleSend =
      async (
        messageToSend?: string
      ) => {
        const text =
          (
            messageToSend ??
            input
          ).trim();

        if (
          !text ||
          loading ||
          initLoading
        ) {
          return;
        }

        if (
          !conversationId
        ) {
          setError(
            'The secure conversation has not initialized yet. Please retry initialization.'
          );

          return;
        }

        const tempUserMessage:
          ConversationMessage =
          {
            id:
              `temp-user-${Date.now()}`,

            role:
              'user',

            content:
              text,

            createdAt:
              new Date()
                .toISOString(),
          };

        setMessages(
          (
            previous
          ) => [
            ...previous,
            tempUserMessage,
          ]
        );

        setInput(
          ''
        );

        setLoading(
          true
        );

        setError(
          null
        );

        setLastFailedMessage(
          null
        );

        try {
          console.info(
            '[MirrorTrace] Sending reflection message...',
            {
              conversationId,
            }
          );

          const response =
            await sendConversationMessage(
              conversationId,
              text
            );

          if (
            !response?.reply
          ) {
            throw new Error(
              'Gemini returned an empty response.'
            );
          }

          const modelMessage:
            ConversationMessage =
            {
              id:
                response.messageId ??
                `model-${Date.now()}`,

              role:
                'model',

              content:
                response.reply,

              createdAt:
                new Date()
                  .toISOString(),
            };

          setMessages(
            (
              previous
            ) => [
              ...previous,
              modelMessage,
            ]
          );

          if (
            Array.isArray(
              response.suggestedTags
            )
          ) {
            setSuggestedTags(
              response.suggestedTags
            );
          } else {
            setSuggestedTags(
              []
            );
          }
        } catch (
          err: unknown
        ) {
          console.error(
            '[MirrorTrace] Gemini message failed:',
            err
          );

          const message =
            getReadableError(
              err,
              'Gemini could not process your reflection. Please retry.'
            );

          setError(
            message
          );

          setLastFailedMessage(
            text
          );

          setMessages(
            (
              previous
            ) =>
              previous.filter(
                (
                  message
                ) =>
                  message.id !==
                  tempUserMessage.id
              )
          );

          setInput(
            text
          );
        } finally {
          setLoading(
            false
          );
        }
      };


    return (
      <div className="mirrortrace-brainstorm-shell rounded-xl border shadow-xs flex flex-col h-full min-h-[520px]">
        {/* Header */}
        <div className="mirrortrace-brainstorm-header px-5 py-4 border-b flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-2.5">
            <div className="mirrortrace-brainstorm-icon w-7 h-7 rounded-md flex items-center justify-center border">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            </div>

            <div>
              <h3 className="font-serif text-sm font-semibold text-white">
                Reflective Brainstorm Companion
              </h3>

              <p className="text-[11px] text-white/65 font-sans">
                Powered by Server-Side Gemini
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              handleStartNewThread
            }
            disabled={
              initLoading ||
              loading
            }
            className="mirrortrace-brainstorm-thread-btn flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-white/70 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Start a fresh conversation"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>
              New Thread
            </span>
          </button>
        </div>

        {/* Messages */}
        <div className="mirrortrace-brainstorm-body flex-1 p-5 overflow-y-auto space-y-4 max-h-[380px]">
          {initLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-white/50 space-y-2 py-12">
              <div className="w-5 h-5 border-2 border-white/20 border-t-amber-300 rounded-full animate-spin" />

              <p className="text-xs">
                Initializing secure dialogue thread...
              </p>
            </div>
          ) : messages.length ===
              0 &&
            !error ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 py-10">
              <div className="mirrortrace-brainstorm-empty-icon w-10 h-10 rounded-full flex items-center justify-center text-white/70">
                <Bot className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-white/80">
                  Need help untangling a thought?
                </p>

                <p className="text-xs text-white/65 max-w-xs leading-relaxed">
                  Describe a decision, conflict, or question. MirrorTrace asks focused questions to help you clarify your perspective.
                </p>
              </div>
            </div>
          ) : (
            messages.map(
              (
                msg
              ) => (
                <div
                  key={
                    msg.id
                  }
                  className={`flex items-start gap-3 ${
                    msg.role ===
                    'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  {msg.role ===
                    'model' && (
                    <div className="w-6 h-6 rounded-full bg-amber-800 flex items-center justify-center text-amber-50 shrink-0 shadow-xs mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-3 text-xs leading-relaxed ${
                      msg.role ===
                      'user'
                        ? 'mirrortrace-brainstorm-message-user text-white'
                        : 'mirrortrace-brainstorm-message-model text-white/85 border'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">
                      {
                        msg.content
                      }
                    </div>
                  </div>

                  {msg.role ===
                    'user' && (
                    <div className="mirrortrace-brainstorm-user-icon w-6 h-6 rounded-full flex items-center justify-center text-white/75 shrink-0 shadow-xs mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              )
            )
          )}

          {loading && (
            <div className="flex items-start gap-3 justify-start">
              <div className="w-6 h-6 rounded-full bg-amber-800 flex items-center justify-center text-amber-50 shrink-0 shadow-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>

              <div className="mirrortrace-brainstorm-loading rounded-lg px-4 py-3 border flex items-center gap-1.5 text-xs text-white/65">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />

                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />

                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />

                <span className="ml-1 text-[11px]">
                  Reflecting...
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-400/25 rounded-lg text-xs text-red-100">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-300 shrink-0 mt-0.5" />

                <div className="flex-1">
                  <p className="font-medium">
                    {
                      error
                    }
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    {!conversationId && (
                      <button
                        type="button"
                        onClick={
                          handleRetryInitialization
                        }
                        disabled={
                          initLoading
                        }
                        className="flex items-center gap-1 text-red-200 font-medium hover:underline disabled:opacity-50"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Retry initialization
                      </button>
                    )}

                    {conversationId &&
                      lastFailedMessage && (
                        <button
                          type="button"
                          onClick={() =>
                            handleSend(
                              lastFailedMessage
                            )
                          }
                          disabled={
                            loading
                          }
                          className="flex items-center gap-1 text-red-200 font-medium hover:underline disabled:opacity-50"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Retry message
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            ref={
              messagesEndRef
            }
          />
        </div>

        {suggestedTags.length >
          0 && (
          <div className="mirrortrace-brainstorm-tags px-5 py-2 border-t flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium text-amber-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Suggested tags:
            </span>

            {suggestedTags.map(
              (
                tag
              ) => (
                <button
                  key={
                    tag
                  }
                  type="button"
                  onClick={() =>
                    onSuggestedTagClick?.(
                      tag
                    )
                  }
                  className="mirrortrace-brainstorm-tag inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-amber-100 border transition-colors shadow-2xs cursor-pointer"
                  title="Add this tag to your journal editor"
                >
                  <Plus className="w-3 h-3 text-amber-300" />
                  #{tag}
                </button>
              )
            )}
          </div>
        )}

        {/* Input */}
        <div className="mirrortrace-brainstorm-footer p-4 border-t rounded-b-xl">
          <form
            onSubmit={(
              e
            ) => {
              e.preventDefault();
              void handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="chat-input-field"
              type="text"
              value={
                input
              }
              onChange={(
                e
              ) =>
                setInput(
                  e.target.value
                )
              }
              placeholder={
                conversationId
                  ? 'Ask a reflective question or describe a thought...'
                  : 'Initialize conversation before sending...'
              }
              disabled={
                loading ||
                initLoading ||
                !conversationId
              }
              className="mirrortrace-brainstorm-input flex-1 px-3.5 py-2.5 rounded-lg border text-white placeholder:text-white/45 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-amber-300/20 focus:border-amber-300/40 disabled:opacity-50"
            />

            <button
              id="btn-chat-send"
              type="submit"
              disabled={
                loading ||
                initLoading ||
                !conversationId ||
                !input.trim()
              }
              className="mirrortrace-brainstorm-send p-2.5 rounded-lg text-white transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  };

