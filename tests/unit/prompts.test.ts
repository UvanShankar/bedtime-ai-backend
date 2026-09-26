import { DefaultStoryPromptBuilder } from "../../src/prompts/StoryPromptBuilder.js";
import { StoryGenerationContext } from "../../src/types/providers.js";

describe("StoryPromptBuilder", () => {
  const promptBuilder = new DefaultStoryPromptBuilder();

  const mockContext: StoryGenerationContext = {
    parent: {
      id: "p1",
      name: "Lakshmi",
      relationship: "mother",
      language: "Tamil",
      languageCode: "ta-IN",
      dialect: "Madurai",
      createdAt: "2026-09-23T00:00:00Z",
      updatedAt: "2026-09-23T00:00:00Z",
    },
    child: {
      id: "c1",
      parentId: "p1",
      name: "Aarav",
      age: 4,
      interests: ["trains", "stars"],
      personality: ["curious", "gentle"],
      avoidTopics: ["monsters", "dark caves"],
      createdAt: "2026-09-23T00:00:00Z",
      updatedAt: "2026-09-23T00:00:00Z",
    },
    style: {
      id: "s1",
      parentId: "p1",
      language: "Tamil",
      dialect: "Madurai",
      warmth: { value: 0.95, confidence: 0.9, source: "transcript_analysis" },
      calmness: { value: 0.9, confidence: 0.9, source: "transcript_analysis" },
      pacing: { value: "slow", confidence: 0.9, source: "transcript_analysis" },
      slang: { value: ["machan"], confidence: 0.6, source: "transcript_analysis" },
      familyExpressions: { value: ["kanna"], confidence: 0.85, source: "transcript_analysis" },
      directChildAddressing: { value: true, confidence: 0.9, source: "transcript_analysis" },
      createdAt: "2026-09-23T00:00:00Z",
      updatedAt: "2026-09-23T00:00:00Z",
    },
    request: {
      id: "r1",
      parentId: "p1",
      childId: "c1",
      topic: "The Little Train on the Moon",
      storyType: "bedtime",
      mood: "warm and peaceful",
      durationMinutes: 5,
      bedtimeCalmness: 0.95,
      includeChildName: true,
      realWorldFacts: true,
      additionalInstruction: "Emphasize winding down",
    },
    externalKnowledge: "The Moon has low gravity and no atmosphere.",
  };

  it("should build a system prompt that enforces schema and injection boundaries", () => {
    const sysPrompt = promptBuilder.buildSystemPrompt(mockContext);
    expect(sysPrompt).toContain("children's bedtime story writer");
    expect(sysPrompt).toContain("ta-IN");
    expect(sysPrompt).toContain("Untrusted External Knowledge Boundaries");
    expect(sysPrompt).toContain("JSON Schema format");
  });

  it("should construct user prompt including child profile and parent style without raw voice characteristics", () => {
    const userPrompt = promptBuilder.buildUserPrompt(mockContext);
    expect(userPrompt).toContain("Aarav");
    expect(userPrompt).toContain("4 years old");
    expect(userPrompt).toContain("trains, stars");
    expect(userPrompt).toContain("kanna");
    expect(userPrompt).toContain("monsters, dark caves");
    expect(userPrompt).toContain("UNTRUSTED EXTERNAL KNOWLEDGE CONTEXT");
    expect(userPrompt).toContain("The Moon has low gravity");
  });
});
