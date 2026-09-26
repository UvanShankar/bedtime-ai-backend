import { v4 as uuidv4 } from "uuid";
import { ParentStyleProfile } from "../types/models.js";
import { LLMProvider } from "../types/providers.js";

export interface StyleAnalysisMetadata {
  parentId: string;
  language?: string;
  dialect?: string;
  sourceAudioKey?: string;
  [key: string]: unknown;
}

export interface StyleAnalyzer {
  analyzeTranscript(
    transcript: string,
    metadata: StyleAnalysisMetadata
  ): Promise<ParentStyleProfile>;
}

export class DefaultStyleAnalyzer implements StyleAnalyzer {
  constructor(private llmProvider: LLMProvider) {}

  async analyzeTranscript(
    transcript: string,
    metadata: StyleAnalysisMetadata
  ): Promise<ParentStyleProfile> {
    const rawAnalysis = await this.llmProvider.analyzeParentStyle(transcript, metadata);
    const now = new Date().toISOString();

    const profile: ParentStyleProfile = {
      id: uuidv4(),
      parentId: metadata.parentId,
      language: rawAnalysis.language || metadata.language || "English",
      dialect: rawAnalysis.dialect || metadata.dialect || undefined,
      accentDescription: rawAnalysis.accentDescription || {
        value: "Conversational parent voice",
        confidence: 0.7,
        source: "transcript_analysis",
      },
      vocabularyComplexity: rawAnalysis.vocabularyComplexity || {
        value: "moderate",
        confidence: 0.8,
        source: "transcript_analysis",
      },
      preferredWords: rawAnalysis.preferredWords || {
        value: [],
        confidence: 0.5,
        source: "transcript_analysis",
      },
      avoidedWords: rawAnalysis.avoidedWords || {
        value: [],
        confidence: 0.5,
        source: "transcript_analysis",
      },
      slang: rawAnalysis.slang || {
        value: [],
        confidence: 0.5,
        source: "transcript_analysis",
      },
      familyExpressions: rawAnalysis.familyExpressions || {
        value: [],
        confidence: 0.5,
        source: "transcript_analysis",
      },
      codeSwitching: rawAnalysis.codeSwitching || {
        value: false,
        confidence: 0.5,
        source: "transcript_analysis",
      },
      sentenceLength: rawAnalysis.sentenceLength || {
        value: "medium",
        confidence: 0.8,
        source: "transcript_analysis",
      },
      questionFrequency: rawAnalysis.questionFrequency || {
        value: "medium",
        confidence: 0.7,
        source: "transcript_analysis",
      },
      repetition: rawAnalysis.repetition || {
        value: "low",
        confidence: 0.7,
        source: "transcript_analysis",
      },
      directChildAddressing: rawAnalysis.directChildAddressing || {
        value: true,
        confidence: 0.9,
        source: "transcript_analysis",
      },
      warmth: rawAnalysis.warmth || {
        value: 0.9,
        confidence: 0.85,
        source: "transcript_analysis",
      },
      affection: rawAnalysis.affection || {
        value: 0.9,
        confidence: 0.85,
        source: "transcript_analysis",
      },
      calmness: rawAnalysis.calmness || {
        value: 0.85,
        confidence: 0.85,
        source: "transcript_analysis",
      },
      playfulness: rawAnalysis.playfulness || {
        value: 0.7,
        confidence: 0.8,
        source: "transcript_analysis",
      },
      humor: rawAnalysis.humor || {
        value: 0.6,
        confidence: 0.7,
        source: "transcript_analysis",
      },
      pacing: rawAnalysis.pacing || {
        value: "slow",
        confidence: 0.85,
        source: "transcript_analysis",
      },
      pauses: rawAnalysis.pauses || {
        value: "long",
        confidence: 0.8,
        source: "transcript_analysis",
      },
      emphasis: rawAnalysis.emphasis || {
        value: [],
        confidence: 0.6,
        source: "transcript_analysis",
      },
      interactionStyle: rawAnalysis.interactionStyle || {
        value: "cozy and comforting",
        confidence: 0.8,
        source: "transcript_analysis",
      },
      examplePhrases: rawAnalysis.examplePhrases || {
        value: [],
        confidence: 0.7,
        source: "transcript_analysis",
      },
      forbiddenPhrases: rawAnalysis.forbiddenPhrases || {
        value: [],
        confidence: 0.5,
        source: "transcript_analysis",
      },
      rawSummary: rawAnalysis.rawSummary || "Parent bedtime storytelling style analyzed from voice transcript.",
      createdAt: now,
      updatedAt: now,
    };

    return profile;
  }
}
