import { DefaultNarrationDirector } from "../../src/services/NarrationDirector.js";
import { LLMStoryResponse } from "../../src/types/providers.js";
import { ParentStyleProfile } from "../../src/types/models.js";

describe("NarrationDirector", () => {
  const director = new DefaultNarrationDirector();

  const mockStory: LLMStoryResponse = {
    title: "Sleepy Elephant",
    languageCode: "en-US",
    summary: "Elephant bedtime",
    segments: [
      { id: "s1", order: 1, text: "The little elephant stepped outside.", pauseBeforeMs: 200, pauseAfterMs: 400 },
      { id: "s2", order: 2, text: "Stars began to shine above the savanna.", pauseBeforeMs: 250, pauseAfterMs: 500 },
      { id: "s3", order: 3, text: "He laid his head gently upon the grass.", pauseBeforeMs: 300, pauseAfterMs: 600 },
      { id: "s4", order: 4, text: "Closing his eyes, he fell fast asleep.", pauseBeforeMs: 400, pauseAfterMs: 800 },
    ],
    ending: { style: "peaceful", emotion: "soothing" },
  };

  const mockStyle: ParentStyleProfile = {
    id: "style1",
    parentId: "p1",
    language: "English",
    pacing: { value: "slow", confidence: 0.9, source: "system_default" },
    createdAt: "2026-09-23T00:00:00Z",
    updatedAt: "2026-09-23T00:00:00Z",
  };

  it("should progressively increase pauses and slow down energy toward the end of the story", async () => {
    const plan = await director.createNarrationPlan(mockStory, mockStyle, 0.9);

    expect(plan.length).toBe(4);
    expect(plan[0].order).toBe(1);
    expect(plan[3].order).toBe(4);

    // Final segment should be deliberate pace and soothing/peaceful emotion
    expect(plan[3].pace).toBe("deliberate");
    expect(plan[3].emotion).toBe("peaceful");

    // Pauses should have expanded from the bedtime slowdown factor
    expect(plan[3].pauseAfterMs!).toBeGreaterThan(plan[0].pauseAfterMs!);
  });
});
