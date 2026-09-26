import { LLMStoryResponse } from "../types/providers.js";
import { ParentStyleProfile, StorySegment } from "../types/models.js";

export interface NarrationDirector {
  createNarrationPlan(
    story: LLMStoryResponse,
    style: ParentStyleProfile,
    bedtimeCalmness?: number
  ): Promise<StorySegment[]>;
}

export class DefaultNarrationDirector implements NarrationDirector {
  async createNarrationPlan(
    story: LLMStoryResponse,
    style: ParentStyleProfile,
    bedtimeCalmness = 0.8
  ): Promise<StorySegment[]> {
    const totalSegments = story.segments.length;
    const basePacing = style.pacing?.value || "slow";

    return story.segments.map((seg, index) => {
      const progress = index / Math.max(1, totalSegments - 1); // 0.0 at start, 1.0 at ending

      // Bedtime adaptation: Pacing slows down, pauses lengthen, energy lowers as story winds down
      let pace = seg.pace || basePacing;
      let energy = seg.energy || "low";
      let emotion = seg.emotion || "warm";

      if (progress > 0.6) {
        pace = "slow";
        energy = "gentle";
        emotion = "soothing";
      }

      if (progress >= 0.85) {
        pace = "deliberate";
        energy = "calm";
        emotion = "peaceful";
      }

      // Compute pauses with progressive slowdown scaled by bedtime calmness
      const pauseMultiplier = 1 + bedtimeCalmness * progress;
      const pauseBeforeMs = Math.round((seg.pauseBeforeMs || 300) * pauseMultiplier);
      const pauseAfterMs = Math.round((seg.pauseAfterMs || 600) * pauseMultiplier);

      return {
        id: seg.id || `seg_${index + 1}`,
        order: index + 1,
        text: seg.text.trim(),
        emotion,
        pace,
        energy,
        pauseBeforeMs,
        pauseAfterMs,
        emphasis: seg.emphasis || [],
      };
    });
  }
}

export const narrationDirector = new DefaultNarrationDirector();
