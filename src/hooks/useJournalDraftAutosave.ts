import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

import { getAuth } from 'firebase/auth';

interface UseJournalDraftAutosaveInput {
  content: string;
  tags: string[];

  setContent:
    Dispatch<
      SetStateAction<string>
    >;

  setTags:
    Dispatch<
      SetStateAction<string[]>
    >;

  enabled: boolean;
}

export function useJournalDraftAutosave(
  input: UseJournalDraftAutosaveInput
) {
  const [restored, setRestored] =
    useState(false);

  const initialized =
    useRef(false);

  const uid =
    getAuth().currentUser?.uid ||
    'authenticated-user';

  const key =
    `mirrortrace:draft:${uid}`;

  useEffect(() => {
    if (
      initialized.current ||
      !input.enabled
    ) {
      return;
    }

    initialized.current = true;

    try {
      const raw =
        localStorage.getItem(key);

      if (!raw) {
        return;
      }

      const parsed =
        JSON.parse(raw) as {
          content?: string;
          tags?: string[];
        };

      const savedContent =
        typeof parsed.content === 'string'
          ? parsed.content
          : '';

      const savedTags =
        Array.isArray(parsed.tags)
          ? parsed.tags.filter(
              (
                tag
              ): tag is string =>
                typeof tag === 'string'
            )
          : [];

      if (
        savedContent ||
        savedTags.length > 0
      ) {
        input.setContent(
          savedContent
        );

        input.setTags(
          savedTags
        );

        setRestored(true);
      }
    } catch (error) {
      console.warn(
        '[MirrorTrace Draft] restore failed',
        error
      );
    }
  }, [
    input.enabled,
    key,
  ]);

  useEffect(() => {
    if (!input.enabled) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          try {
            if (
              !input.content.trim() &&
              input.tags.length === 0
            ) {
              localStorage.removeItem(key);
              return;
            }

            localStorage.setItem(
              key,
              JSON.stringify({
                content: input.content,
                tags: input.tags,
                updatedAt:
                  new Date().toISOString(),
              })
            );
          } catch (error) {
            console.warn(
              '[MirrorTrace Draft] save failed',
              error
            );
          }
        },
        450
      );

    return () =>
      window.clearTimeout(timer);
  }, [
    input.content,
    input.tags,
    input.enabled,
    key,
  ]);

  return {
    restored,
  };
}
