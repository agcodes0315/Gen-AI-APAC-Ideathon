import { GoogleGenAI } from '@google/genai';

/**
 * Server-Side Gemini AI Resilient Fallback Manager
 * Operational credentials are kept server-side only via GEMINI_API_KEY.
 * Never logs raw prompt or reflection content.
 */

// Resilient Fallback Ladder ordered by latency and availability
export const MODEL_FALLBACK_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
] as const;

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing on server.');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export interface FallbackGenerateOptions {
  contents: Array<{ role: string; parts: Array<{ text: string }> }> | string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
  responseSchema?: Record<string, unknown>;
}

export interface FallbackGenerateResult {
  text: string;
  modelUsed: string;
}

export interface ParsedThoughtSnapshot {
  positionStatement: string;
  topic: string;
  tags: string[];
}

export class SnapshotParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SnapshotParseError';
  }
}

/**
 * Safe parser for Gemini Thought Snapshot responses.
 * Strips code fences, parses JSON safely, and verifies required schema fields.
 */
export function parseSnapshotJson(raw: string | undefined | null): ParsedThoughtSnapshot {
  if (!raw || !raw.trim()) {
    throw new SnapshotParseError('Gemini returned an empty snapshot response.');
  }

  let cleaned = raw.trim();

  // Strip markdown code fences if present
  cleaned = cleaned
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new SnapshotParseError('Gemini returned malformed snapshot JSON.');
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    typeof (parsed as Record<string, unknown>).positionStatement !== 'string' ||
    !(parsed as Record<string, unknown>).positionStatement?.toString().trim() ||
    typeof (parsed as Record<string, unknown>).topic !== 'string' ||
    !(parsed as Record<string, unknown>).topic?.toString().trim() ||
    !Array.isArray((parsed as Record<string, unknown>).tags)
  ) {
    throw new SnapshotParseError('Gemini returned an invalid Thought Snapshot structure.');
  }

  const record = parsed as {
    positionStatement: string;
    topic: string;
    tags: unknown[];
  };

  const positionStatement = record.positionStatement.trim();
  const topic = record.topic.trim();
  const tags = record.tags
    .filter((tag: unknown): tag is string => typeof tag === 'string')
    .map((tag: string) => tag.trim().toLowerCase().replace(/^#+/, ''))
    .filter(Boolean)
    .slice(0, 5);

  if (!positionStatement || !topic) {
    throw new SnapshotParseError('Position statement and topic cannot be empty.');
  }

  return {
    positionStatement,
    topic,
    tags,
  };
}

export const THOUGHT_SNAPSHOT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    positionStatement: {
      type: 'STRING',
      description: 'A concise single sentence stating the user stance or perspective on the topic.',
    },
    topic: {
      type: 'STRING',
      description: 'The primary topic (1-3 words).',
    },
    tags: {
      type: 'ARRAY',
      items: {
        type: 'STRING',
      },
      description: 'Up to 5 lowercase tags without hash prefix.',
    },
  },
  required: ['positionStatement', 'topic', 'tags'],
};

/**
 * Dedicated Thought Snapshot generator with fallback and structured validation
 */
export async function generateSnapshotProposal(
  journalContent: string,
  journalTags: string[] = []
): Promise<{ proposal: ParsedThoughtSnapshot; modelUsed: string }> {
  const ai = getGeminiClient();
  let lastError: unknown = null;

  const systemInstruction = `
You are MirrorTrace's evidence-grounded reflection analyzer.
Your task is to analyze a private journal reflection and propose a single, concise Suggested Thought Snapshot representing the user's apparent current stance, position, perspective, or consideration on the central topic.

STRICT INSTRUCTIONS:
1. Return ONLY a valid JSON object matching the requested schema.
2. Do not use Markdown.
3. Do not use code fences.
4. Do not add commentary before or after the JSON.
5. Ground the position statement solely on explicit statements and context in the user's reflection.
6. The positionStatement must be a single concise sentence.
7. The topic must be a concise 1-3 word primary topic name.
8. The tags array must contain up to 5 clean lowercase topic tags without '#' prefix.
9. NEVER make psychological, psychiatric, personality, subconscious, or clinical diagnoses.
10. NEVER claim certainty about internal beliefs.
`.trim();

  const userPrompt = `
User's Saved Reflection:
"""
${journalContent}
"""

Associated Tags: ${journalTags.join(', ') || 'None'}
`.trim();

  for (const modelName of MODEL_FALLBACK_LADDER) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.1,
          maxOutputTokens: 512,
          responseMimeType: 'application/json',
          responseSchema: THOUGHT_SNAPSHOT_SCHEMA,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        console.warn(`[Gemini Engine] Model ${modelName} returned empty text. Advancing ladder.`);
        continue;
      }

      // Validate structured output immediately
      try {
        const parsed = parseSnapshotJson(responseText);
        return {
          proposal: parsed,
          modelUsed: modelName,
        };
      } catch (parseErr: unknown) {
        console.warn(
          `[Gemini Engine] Model ${modelName} output failed schema validation: ${
            (parseErr as Error)?.message
          }. Advancing ladder.`
        );
        lastError = parseErr;
        continue;
      }
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      const message = String((err as { message?: string })?.message || '');

      console.warn(
        `[Gemini Engine] Model ${modelName} call failed (Status: ${
          status || 'unknown'
        }, Message: ${message}). Advancing ladder.`
      );
    }
  }

  if (lastError instanceof SnapshotParseError) {
    throw lastError;
  }

  throw new Error(
    `Could not generate thought snapshot across fallback models. ${
      (lastError as Error)?.message || ''
    }`
  );
}

/**
 * Thought Diff Parsed Output Structure
 */
export interface ParsedThoughtDiff {
  isRelated: boolean;
  hasEnoughEvidence: boolean;
  topic: string;
  earlierPosition: string;
  laterPosition: string;
  apparentShift: string;
  apparentContinuity: string;
  relationshipAssessment: string;
}

export class ThoughtDiffParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ThoughtDiffParseError';
  }
}

/**
 * Schema for Thought Diff JSON output
 */
export const THOUGHT_DIFF_SCHEMA = {
  type: 'OBJECT',
  properties: {
    isRelated: {
      type: 'BOOLEAN',
      description:
        'Whether the two reflections concern substantially the same topic or continuous decision context, beyond just a superficial shared keyword.',
    },
    hasEnoughEvidence: {
      type: 'BOOLEAN',
      description:
        'Whether there is sufficient evidence across both approved reflections to identify a meaningful shift or continuity.',
    },
    topic: {
      type: 'STRING',
      description: 'The core normalized topic connecting these reflections.',
    },
    earlierPosition: {
      type: 'STRING',
      description: 'Concise summary of the earlier position grounded in the earlier reflection.',
    },
    laterPosition: {
      type: 'STRING',
      description: 'Concise summary of the later position grounded in the later reflection.',
    },
    apparentShift: {
      type: 'STRING',
      description:
        'Evidence-grounded description of what appears to have changed. If not enough evidence or no change, specify "Not enough evidence to identify a meaningful change."',
    },
    apparentContinuity: {
      type: 'STRING',
      description:
        'Evidence-grounded description of what appears to have remained consistent between reflections.',
    },
    relationshipAssessment: {
      type: 'STRING',
      description:
        'Short explanation of why these reflections are considered related or how they connect.',
    },
  },
  required: [
    'isRelated',
    'hasEnoughEvidence',
    'topic',
    'earlierPosition',
    'laterPosition',
    'apparentShift',
    'apparentContinuity',
    'relationshipAssessment',
  ],
};

export function parseThoughtDiffJson(rawText: string): ParsedThoughtDiff {
  const clean = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(clean);
  } catch (err: unknown) {
    throw new ThoughtDiffParseError(
      `Failed to parse JSON response: ${(err as Error)?.message || 'Invalid JSON'}`
    );
  }

  if (typeof data !== 'object' || data === null) {
    throw new ThoughtDiffParseError('Parsed JSON is not an object.');
  }

  const isRelated = Boolean(data.isRelated);
  const hasEnoughEvidence = Boolean(data.hasEnoughEvidence);
  const topic = typeof data.topic === 'string' ? data.topic.trim() : '';
  const earlierPosition =
    typeof data.earlierPosition === 'string' ? data.earlierPosition.trim() : '';
  const laterPosition =
    typeof data.laterPosition === 'string' ? data.laterPosition.trim() : '';
  let apparentShift =
    typeof data.apparentShift === 'string' ? data.apparentShift.trim() : '';
  const apparentContinuity =
    typeof data.apparentContinuity === 'string' ? data.apparentContinuity.trim() : '';
  const relationshipAssessment =
    typeof data.relationshipAssessment === 'string'
      ? data.relationshipAssessment.trim()
      : '';

  if (!isRelated || !hasEnoughEvidence) {
    apparentShift = 'Not enough evidence to identify a meaningful change.';
  }

  return {
    isRelated,
    hasEnoughEvidence,
    topic: topic || 'Reflection Comparison',
    earlierPosition,
    laterPosition,
    apparentShift: apparentShift || 'Not enough evidence to identify a meaningful change.',
    apparentContinuity: apparentContinuity || 'Core consideration context appears ongoing.',
    relationshipAssessment:
      relationshipAssessment || 'Earlier and later reflections address related thematic reflections.',
  };
}

/**
 * Dedicated Thought Diff generator with candidate verification and fallback ladder
 */
export async function generateThoughtDiffComparison(params: {
  earlierSnapshot: { positionStatement: string; topic: string; tags: string[]; createdAt: string };
  earlierJournalExcerpt: string;
  laterSnapshot: { positionStatement: string; topic: string; tags: string[]; createdAt: string };
  laterJournalExcerpt: string;
}): Promise<{ diff: ParsedThoughtDiff; modelUsed: string }> {
  const ai = getGeminiClient();
  let lastError: unknown = null;

  const systemInstruction = `
You are MirrorTrace's evidence-grounded Thought Diff analyzer.
Your task is to compare two approved thought reflections from the same user to identify whether they are genuinely related, and if so, describe any apparent perspective shift and continuity using strictly evidence-grounded language.

CRITICAL PRODUCT & SAFETY DIRECTIVES:
1. Return ONLY a valid JSON object matching the requested schema. No markdown, no code fences, no extra commentary.
2. Relevance First: Determine if both reflections concern substantially the same topic or continuous decision context. NEVER generate a comparison merely because two entries share a generic keyword (e.g. "work" or "life"). If they are not truly related, set "isRelated": false and "hasEnoughEvidence": false.
3. Evidence Standard: Only compare what is explicitly stated in the approved snapshots and excerpts. If evidence is insufficient to detect a clear change, set "apparentShift" to EXACTLY "Not enough evidence to identify a meaningful change."
4. Tone & Non-Judgment: NEVER make clinical, psychological, psychiatric, cognitive distortion, emotional disorder, or subconscious claims. Use grounded phrases like "Your earlier reflection indicated...", "Your later reflection suggests...", "Perspective appears to have expanded toward...".
5. Never claim certainty about internal hidden beliefs.
`.trim();

  const userPrompt = `
EARLIER APPROVED REFLECTION (Older In Time):
Date/Time: ${params.earlierSnapshot.createdAt}
Topic: ${params.earlierSnapshot.topic}
Tags: ${params.earlierSnapshot.tags.join(', ') || 'None'}
Approved Stance: "${params.earlierSnapshot.positionStatement}"
Source Journal Excerpt:
"""
${params.earlierJournalExcerpt}
"""

LATER APPROVED REFLECTION (Newer In Time):
Date/Time: ${params.laterSnapshot.createdAt}
Topic: ${params.laterSnapshot.topic}
Tags: ${params.laterSnapshot.tags.join(', ') || 'None'}
Approved Stance: "${params.laterSnapshot.positionStatement}"
Source Journal Excerpt:
"""
${params.laterJournalExcerpt}
"""

Evaluate if these reflections are genuinely related.
Analyze the perspective evolution strictly chronologically moving from the EARLIER stance to the LATER stance.
Produce the structured Thought Diff JSON according to the schema:
- isRelated: boolean
- hasEnoughEvidence: boolean
- topic: string
- earlierPosition: summary of the earlier reflection stance
- laterPosition: summary of the later reflection stance
- apparentShift: describe how perspective evolved FROM the earlier stance TO the later stance (or "Not enough evidence to identify a meaningful change.")
- apparentContinuity: what remained consistent between reflections
- relationshipAssessment: why they are considered related
`.trim();

  for (const modelName of MODEL_FALLBACK_LADDER) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.1,
          maxOutputTokens: 768,
          responseMimeType: 'application/json',
          responseSchema: THOUGHT_DIFF_SCHEMA,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        console.warn(`[Gemini Diff Engine] Model ${modelName} returned empty text. Advancing ladder.`);
        continue;
      }

      try {
        const parsed = parseThoughtDiffJson(responseText);
        return {
          diff: parsed,
          modelUsed: modelName,
        };
      } catch (parseErr: unknown) {
        console.warn(
          `[Gemini Diff Engine] Model ${modelName} output failed schema validation: ${
            (parseErr as Error)?.message
          }. Advancing ladder.`
        );
        lastError = parseErr;
        continue;
      }
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      const message = String((err as { message?: string })?.message || '');

      console.warn(
        `[Gemini Diff Engine] Model ${modelName} call failed (Status: ${
          status || 'unknown'
        }, Message: ${message}). Advancing ladder.`
      );
    }
  }

  if (lastError instanceof ThoughtDiffParseError) {
    throw lastError;
  }

  throw new Error(
    `Could not generate thought diff across fallback models. ${
      (lastError as Error)?.message || ''
    }`
  );
}

/**
 * Executes content generation with automatic model fallback and error recovery
 */
export async function generateContentWithFallback(
  options: FallbackGenerateOptions
): Promise<FallbackGenerateResult> {
  const ai = getGeminiClient();
  let lastError: unknown = null;

  for (const modelName of MODEL_FALLBACK_LADDER) {
    try {
      const config: {
        systemInstruction?: string;
        temperature: number;
        maxOutputTokens: number;
        responseMimeType?: string;
        responseSchema?: Record<string, unknown>;
      } = {
        systemInstruction: options.systemInstruction,
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxOutputTokens ?? 2048,
      };

      if (options.responseMimeType) {
        config.responseMimeType = options.responseMimeType;
      }
      if (options.responseSchema) {
        config.responseSchema = options.responseSchema;
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: typeof options.contents === 'string' ? options.contents : options.contents,
        config,
      });

      const responseText = response.text;
      if (responseText) {
        return {
          text: responseText,
          modelUsed: modelName,
        };
      }
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      const message = String((err as { message?: string })?.message || '');

      // Log non-sensitive metadata only (status, model) - never log contents
      console.warn(`[Gemini Engine] Model ${modelName} call failed (Status: ${status || 'unknown'}). Advancing ladder.`);

      // Check if it's a known recoverable or model-not-found error, or if we have further models
      const isRecoverable =
        status === 404 ||
        status === 429 ||
        status === 500 ||
        status === 503 ||
        message.includes('NOT_FOUND') ||
        message.includes('RESOURCE_EXHAUSTED') ||
        message.includes('UNAVAILABLE');

      if (!isRecoverable) {
        // If not standard recoverable, still try remaining models in the ladder before failing
        continue;
      }
    }
  }

  throw new Error(
    `Gemini generation failed across all fallback models. Last error: ${
      (lastError as Error)?.message || 'Unknown generation failure'
    }`
  );
}
