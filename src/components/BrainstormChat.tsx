import React, { useEffect, useRef, useState } from 'react';
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

import type { ConversationMessage } from '../types.ts';

interface BrainstormChatProps {
  onSuggestedTagClick?: (tag: string) => void;
}

function getReadableError(
  err: unknown,
  fallback: string
): string {
  if (err instanceof ApiError) {
    if (err.status === 401) {
      return 'Your session could not be verified. Please sign in again.';
    }

    if (err.status === 403) {
      return 'You do not have permission to access this conversation.';
    }

    if (err.status === 404) {
      return 'The requested conversation could not be found.';
    }

    if (err.status === 429) {
      return 'The AI service is temporarily busy. Please wait a moment and retry.';
    }

    if (err.status === 503) {
      return 'The AI service is temporarily unavailable. Please retry shortly.';
    }

    if (err.code) {
      return `${err.message} (${err.code})`;
    }

    return err.message || fallback;
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}

export const BrainstormChat: React.FC<BrainstormChatProps> = ({
  onSuggestedTagClick,
}) => {
  const [conversationId, setConversationId] =
    useState<string | null>(null);

  const [messages, setMessages] =
    useState<ConversationMessage[]>([]);

  const [input, setInput] = useState('');

  const [loading, setLoading] = useState(false);

  const [initLoading, setInitLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [lastFailedMessage, setLastFailedMessage] =
    useState<string | null>(null);

  const [suggestedTags, setSuggestedTags] =
    useState<string[]>([]);

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  /**
   * Initialize a secure Firestore-backed conversation.
   *
   * IMPORTANT:
   * This endpoint does NOT call Gemini.
   * It only creates the authenticated user's conversation container.
   */
  const initializeConversation = async () => {
    setInitLoading(true);
    setError(null);

    try {
      console.info(
        '[MirrorTrace] Initializing conversation...'
      );

      const response = await createConversation(
        'Journal Brainstorm Dialogue'
      );

      if (!response?.conversationId) {
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

      return response.conversationId;
    } catch (err: unknown) {
      console.error(
        '[MirrorTrace] Conversation initialization failed:',
        err
      );

      const message = getReadableError(
        err,
        'Could not initialize your secure conversation.'
      );

      setConversationId(null);
      setError(message);

      return null;
    } finally {
      setInitLoading(false);
    }
  };

  /**
   * Create the first conversation once.
   */
  useEffect(() => {
    void initializeConversation();
  }, []);

  /**
   * Scroll to the latest message.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, loading]);

  /**
   * Start a completely new conversation.
   */
  const handleStartNewThread = async () => {
    if (loading || initLoading) {
      return;
    }

    setMessages([]);
    setSuggestedTags([]);
    setLastFailedMessage(null);
    setConversationId(null);

    await initializeConversation();
  };

  /**
   * Retry conversation initialization separately from
   * retrying a Gemini message.
   */
  const handleRetryInitialization =
    async () => {
      await initializeConversation();
    };

  /**
   * Send one message to Gemini.
   *
   * Conversation creation and Gemini generation are
   * intentionally separate failure boundaries.
   */
  const handleSend = async (
    messageToSend?: string
  ) => {
    const text = (
      messageToSend ?? input
    ).trim();

    if (!text || loading || initLoading) {
      return;
    }

    if (!conversationId) {
      setError(
        'The secure conversation has not initialized yet. Please retry initialization.'
      );
      return;
    }

    const tempUserMessage: ConversationMessage =
      {
        id: `temp-user-${Date.now()}`,
        role: 'user',
        content: text,
        createdAt: new Date().toISOString(),
      };

    setMessages((previous) => [
      ...previous,
      tempUserMessage,
    ]);

    setInput('');
    setLoading(true);
    setError(null);
    setLastFailedMessage(null);

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

      if (!response?.reply) {
        throw new Error(
          'Gemini returned an empty response.'
        );
      }

      const modelMessage: ConversationMessage =
        {
          id:
            response.messageId ??
            `model-${Date.now()}`,
          role: 'model',
          content: response.reply,
          createdAt:
            new Date().toISOString(),
        };

      setMessages((previous) => [
        ...previous,
        modelMessage,
      ]);

      if (
        Array.isArray(
          response.suggestedTags
        )
      ) {
        setSuggestedTags(
          response.suggestedTags
        );
      } else {
        setSuggestedTags([]);
      }
    } catch (err: unknown) {
      console.error(
        '[MirrorTrace] Gemini message failed:',
        err
      );

      const message = getReadableError(
        err,
        'Gemini could not process your reflection. Please retry.'
      );

      setError(message);
      setLastFailedMessage(text);

      /**
       * Remove optimistic message because the server did
       * not confirm successful persistence.
       *
       * Restore the text into the editor so the user
       * never loses their input.
       */
      setMessages((previous) =>
        previous.filter(
          (message) =>
            message.id !==
            tempUserMessage.id
        )
      );

      setInput(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col h-full min-h-[520px]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70 rounded-t-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-amber-100 flex items-center justify-center text-amber-900 border border-amber-200/70">
            <Sparkles className="w-3.5 h-3.5 text-amber-800" />
          </div>

          <div>
            <h3 className="font-serif text-sm font-semibold text-stone-900">
              Reflective Brainstorm Companion
            </h3>

            <p className="text-[11px] text-stone-500 font-sans">
              Powered by Server-Side Gemini
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartNewThread}
          disabled={
            initLoading || loading
          }
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          title="Start a fresh conversation"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          <span>New Thread</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[380px]">
        {initLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-2 py-12">
            <div className="w-5 h-5 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin" />

            <p className="text-xs">
              Initializing secure dialogue
              thread...
            </p>
          </div>
        ) : messages.length === 0 &&
          !error ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 py-10">
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
              <Bot className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-stone-700">
                Need help untangling a
                thought?
              </p>

              <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                Describe a decision,
                conflict, or question.
                MirrorTrace asks focused
                questions to help you clarify
                your perspective.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'user'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              {msg.role === 'model' && (
                <div className="w-6 h-6 rounded-full bg-amber-800 flex items-center justify-center text-amber-50 shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-stone-900 text-stone-50'
                    : 'bg-stone-100/90 text-stone-800 border border-stone-200/60'
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-stone-300 flex items-center justify-center text-stone-700 shrink-0 shadow-xs mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Gemini loading indicator */}
        {loading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-6 h-6 rounded-full bg-amber-800 flex items-center justify-center text-amber-50 shrink-0 shadow-xs">
              <Bot className="w-3.5 h-3.5" />
            </div>

            <div className="bg-stone-100 rounded-lg px-4 py-3 border border-stone-200/60 flex items-center gap-1.5 text-xs text-stone-500">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-700 animate-bounce" />

              <span className="w-1.5 h-1.5 rounded-full bg-amber-700 animate-bounce [animation-delay:0.2s]" />

              <span className="w-1.5 h-1.5 rounded-full bg-amber-700 animate-bounce [animation-delay:0.4s]" />

              <span className="ml-1 text-[11px]">
                Reflecting...
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />

              <div className="flex-1">
                <p className="font-medium">
                  {error}
                </p>

                <div className="flex items-center gap-3 mt-2">
                  {!conversationId && (
                    <button
                      type="button"
                      onClick={
                        handleRetryInitialization
                      }
                      disabled={initLoading}
                      className="flex items-center gap-1 text-red-700 font-medium hover:underline disabled:opacity-50"
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
                        disabled={loading}
                        className="flex items-center gap-1 text-red-700 font-medium hover:underline disabled:opacity-50"
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

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested tags */}
      {suggestedTags.length > 0 && (
        <div className="px-5 py-2 bg-amber-50/60 border-t border-amber-200/50 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-medium text-amber-900 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-700" />
            Suggested tags:
          </span>

          {suggestedTags.map(
            (tag) => (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  onSuggestedTagClick?.(
                    tag
                  )
                }
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors shadow-2xs cursor-pointer"
                title="Add this tag to your journal editor"
              >
                <Plus className="w-3 h-3 text-amber-700" />
                #{tag}
              </button>
            )
          )}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-stone-200 bg-stone-50/50 rounded-b-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="chat-input-field"
            type="text"
            value={input}
            onChange={(e) =>
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
            className="flex-1 px-3.5 py-2.5 rounded-lg bg-white border border-stone-300 text-stone-900 placeholder:text-stone-400 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 disabled:opacity-50"
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
            className="p-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};