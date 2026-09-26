export interface InferredAttribute<T> {
  value: T;
  confidence: number;
  source:
    | "voice_analysis"
    | "transcript_analysis"
    | "parent_input"
    | "parent_correction"
    | "story_feedback"
    | "system_default";
}

export interface ParentProfile {
  id: string;
  name: string;
  relationship: "mother" | "father" | "grandparent" | "guardian" | "other";
  language: string;
  languageCode: string; // e.g. "en-US", "ta-IN", "hi-IN"
  dialect?: string;
  script?: string;
  styleProfileId?: string;
  voiceProfileId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChildProfile {
  id: string;
  parentId: string;
  name: string;
  age: number;
  interests: string[];
  personality: string[];
  avoidTopics: string[];
  favoriteCharacters?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ParentStyleProfile {
  id: string;
  parentId: string;
  language: string;
  dialect?: string;
  accentDescription?: InferredAttribute<string>;
  vocabularyComplexity?: InferredAttribute<"simple" | "moderate" | "rich">;
  preferredWords?: InferredAttribute<string[]>;
  avoidedWords?: InferredAttribute<string[]>;
  slang?: InferredAttribute<string[]>;
  familyExpressions?: InferredAttribute<string[]>;
  codeSwitching?: InferredAttribute<boolean>;
  sentenceLength?: InferredAttribute<"short" | "medium" | "varied">;
  questionFrequency?: InferredAttribute<"low" | "medium" | "high">;
  repetition?: InferredAttribute<"low" | "medium" | "high">;
  directChildAddressing?: InferredAttribute<boolean>;
  warmth?: InferredAttribute<number>; // 0 to 1
  affection?: InferredAttribute<number>; // 0 to 1
  calmness?: InferredAttribute<number>; // 0 to 1
  playfulness?: InferredAttribute<number>; // 0 to 1
  humor?: InferredAttribute<number>; // 0 to 1
  pacing?: InferredAttribute<"slow" | "moderate" | "dynamic">;
  pauses?: InferredAttribute<"long" | "moderate" | "short">;
  emphasis?: InferredAttribute<string[]>;
  interactionStyle?: InferredAttribute<string>;
  examplePhrases?: InferredAttribute<string[]>;
  forbiddenPhrases?: InferredAttribute<string[]>;
  rawSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceProfile {
  id: string;
  parentId: string;
  provider: string; // "sarvam" | "elevenlabs" | "mock"
  providerVoiceId: string;
  sourceAudioKey: string;
  languageCode: string;
  status: "pending" | "processing" | "ready" | "failed";
  consentAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoryRequest {
  id: string;
  parentId: string;
  childId: string;
  topic: string;
  storyType: string;
  mood: string;
  durationMinutes: number;
  educationalGoal?: string | null;
  bedtimeCalmness: number; // 0 to 1
  includeChildName: boolean;
  realWorldFacts: boolean;
  additionalInstruction?: string;
}

export interface StorySegment {
  id: string;
  order: number;
  text: string;
  emotion?: string; // e.g. "warm", "curious", "soothing", "playful"
  pace?: string; // e.g. "slow", "moderate", "deliberate"
  energy?: string; // e.g. "low", "medium", "gentle"
  pauseBeforeMs?: number;
  pauseAfterMs?: number;
  emphasis?: string[];
}

export interface Story {
  id: string;
  requestId: string;
  parentId: string;
  childId: string;
  title: string;
  languageCode: string;
  summary?: string;
  text: string;
  segments: StorySegment[];
  narrationVersion: string;
  audioStatus: "pending" | "processing" | "ready" | "failed";
  audioKey?: string;
  audioUrl?: string; // Pre-signed or streaming URL
  audioDurationSeconds?: number;
  ttsProvider?: string;
  createdAt: string;
}

export type AudioSource =
  | {
      type: "file";
      url: string;
    }
  | {
      type: "stream";
      streamUrl: string;
    };
