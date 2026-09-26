import { LLMProvider, StoryGenerationContext, LLMStoryResponse } from "../../../types/providers.js";
import { ParentStyleProfile } from "../../../types/models.js";

export class MockLLMProvider implements LLMProvider {
  public readonly name = "mock";

  async generateStructuredStory(context: StoryGenerationContext): Promise<LLMStoryResponse> {
    const childName = context.child.name;
    const topic = context.request.topic || "The Moonbeam Adventure";
    const languageCode = context.parent.languageCode || "en-US";

    return {
      title: `${topic} - A Bedtime Tale for ${childName}`,
      languageCode,
      summary: `A soothing bedtime tale about ${topic} crafted with care for ${childName}.`,
      segments: [
        {
          id: "seg_1",
          order: 1,
          text: `Once upon a quiet evening, as the silver stars began to twinkle in the velvety sky, little ${childName} tucked into a cozy, warm bed.`,
          emotion: "warm",
          pace: "slow",
          energy: "low",
          pauseBeforeMs: 300,
          pauseAfterMs: 600,
          emphasis: ["cozy", "warm"],
        },
        {
          id: "seg_2",
          order: 2,
          text: `Far beyond the window, gentle night breezes rustled the leaves, whispering secrets about ${topic}.`,
          emotion: "gentle",
          pace: "slow",
          energy: "low",
          pauseBeforeMs: 400,
          pauseAfterMs: 700,
          emphasis: ["gentle"],
        },
        {
          id: "seg_3",
          order: 3,
          text: `A tiny, friendly owl hovered nearby, blinking sleepily and sharing that it was time for dreams to take flight.`,
          emotion: "playful",
          pace: "moderate",
          energy: "gentle",
          pauseBeforeMs: 300,
          pauseAfterMs: 800,
          emphasis: ["dreams"],
        },
        {
          id: "seg_4",
          order: 4,
          text: `With each soft breath, eyelids grew heavier and peace settled over the whole room. Goodnight, sweet ${childName}. Sweet dreams.`,
          emotion: "soothing",
          pace: "deliberate",
          energy: "calm",
          pauseBeforeMs: 500,
          pauseAfterMs: 1000,
          emphasis: ["Goodnight", "peace"],
        },
      ],
      ending: {
        style: "peaceful",
        emotion: "soothing",
      },
    };
  }

  async analyzeParentStyle(
    transcript: string,
    metadata?: Record<string, unknown>
  ): Promise<Partial<ParentStyleProfile>> {
    return {
      language: "English",
      accentDescription: { value: "Warm conversational style", confidence: 0.85, source: "transcript_analysis" },
      vocabularyComplexity: { value: "moderate", confidence: 0.9, source: "transcript_analysis" },
      preferredWords: { value: ["sweetheart", "look", "listen"], confidence: 0.8, source: "transcript_analysis" },
      slang: { value: ["chilled out"], confidence: 0.6, source: "transcript_analysis" },
      familyExpressions: { value: ["my little star"], confidence: 0.85, source: "transcript_analysis" },
      warmth: { value: 0.95, confidence: 0.95, source: "transcript_analysis" },
      calmness: { value: 0.9, confidence: 0.9, source: "transcript_analysis" },
      pacing: { value: "slow", confidence: 0.85, source: "transcript_analysis" },
      pauses: { value: "long", confidence: 0.8, source: "transcript_analysis" },
      directChildAddressing: { value: true, confidence: 0.9, source: "transcript_analysis" },
      examplePhrases: {
        value: ["Once upon a time in our cozy home", "Let's close our eyes together"],
        confidence: 0.85,
        source: "transcript_analysis",
      },
      rawSummary: "Loving, gentle, patient parent with soothing tone and frequent affectionate phrases.",
    };
  }
}
