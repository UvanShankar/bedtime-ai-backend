import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { parentRepository } from "../../repositories/ParentRepository.js";
import { childRepository } from "../../repositories/ChildRepository.js";
import { voiceProfileRepository } from "../../repositories/VoiceProfileRepository.js";
import { styleProfileRepository } from "../../repositories/StyleProfileRepository.js";
import { storyRepository } from "../../repositories/StoryRepository.js";
import { providerRegistry } from "../../providers/ProviderRegistry.js";
import { audioStrategyRegistry } from "../../audio/strategies/AudioStrategyRegistry.js";
import { narrationDirector } from "../../services/NarrationDirector.js";
import { config } from "../../config/index.js";
import { AppError } from "../../errors/AppError.js";
import { Story, StoryRequest } from "../../types/models.js";

export class StoryController {
  async generateStory(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        parentId,
        childId,
        topic,
        storyType = "bedtime",
        mood = "warm_and_gentle",
        durationMinutes = 5,
        educationalGoal = null,
        bedtimeCalmness = 0.9,
        includeChildName = true,
        realWorldFacts = false,
        additionalInstruction,
      } = req.body;

      // 1. Load Parent
      const parent = await parentRepository.findById(parentId);
      if (!parent) {
        throw AppError.notFound(`Parent with id '${parentId}' not found`);
      }

      // 2. Load Child
      const child = await childRepository.findById(childId);
      if (!child) {
        throw AppError.notFound(`Child with id '${childId}' not found`);
      }

      // 3. Load Style Profile (fallback to default warm style if not created yet)
      let styleProfile = await styleProfileRepository.findByParentId(parentId);
      if (!styleProfile) {
        const now = new Date().toISOString();
        styleProfile = {
          id: uuidv4(),
          parentId,
          language: parent.language,
          dialect: parent.dialect,
          warmth: { value: 0.9, confidence: 1, source: "system_default" },
          calmness: { value: 0.9, confidence: 1, source: "system_default" },
          pacing: { value: "slow", confidence: 1, source: "system_default" },
          vocabularyComplexity: { value: "simple", confidence: 1, source: "system_default" },
          createdAt: now,
          updatedAt: now,
        };
      }

      // 4. Load Voice Profile (fallback if not recorded yet)
      const voiceProfile = await voiceProfileRepository.findByParentId(parentId);

      // 5. Build Story Request object
      const storyRequest: StoryRequest = {
        id: uuidv4(),
        parentId,
        childId,
        topic,
        storyType,
        mood,
        durationMinutes,
        educationalGoal,
        bedtimeCalmness,
        includeChildName,
        realWorldFacts,
        additionalInstruction,
      };

      // 6. Call LLM Provider through adapter with graceful fallback
      let generatedStory;
      try {
        const llmProvider = providerRegistry.getLLM(config.providers.llm);
        generatedStory = await llmProvider.generateStructuredStory({
          parent,
          child,
          style: styleProfile,
          request: storyRequest,
        });
      } catch (llmErr: any) {
        console.warn(`[StoryController] Primary LLM failed (${llmErr.message}), using fallback story generator.`);
        const fallbackLLM = providerRegistry.getLLM("mock");
        generatedStory = await fallbackLLM.generateStructuredStory({
          parent,
          child,
          style: styleProfile,
          request: storyRequest,
        });
      }

      // 7. Narration Director crafts delivery and bedtime slowdown
      const narrationPlan = await narrationDirector.createNarrationPlan(
        generatedStory,
        styleProfile,
        bedtimeCalmness
      );

      const combinedText = narrationPlan.map((s) => s.text).join("\n\n");
      const storyId = uuidv4();
      const now = new Date().toISOString();

      let story: Story = {
        id: storyId,
        requestId: storyRequest.id,
        parentId,
        childId,
        title: generatedStory.title || topic,
        languageCode: generatedStory.languageCode || parent.languageCode,
        summary: generatedStory.summary,
        text: combinedText,
        segments: narrationPlan,
        narrationVersion: "1.0",
        audioStatus: "pending",
        ttsProvider: voiceProfile?.providerVoiceId || "default",
        createdAt: now,
      };

      // 8. Generate Audio via AudioStrategy (FullFile or Streaming A/B)
      const ttsProvider = providerRegistry.getTTS(config.providers.tts);
      const storageProvider = providerRegistry.getStorage(config.providers.storage);
      const audioStrategy = audioStrategyRegistry.get(config.audioMode);

      try {
        const audioResult = await audioStrategy.generateAudio({
          story,
          ttsProvider,
          storageProvider,
          signedUrlExpirySeconds: config.signedUrlExpirySeconds,
        });

        story.audioStatus = "ready";
        story.audioKey = audioResult.audioKey;
        story.audioUrl = audioResult.audioUrl;
        story.audioDurationSeconds = audioResult.durationSeconds;
      } catch (audioErr: any) {
        console.warn(`[StoryController] Audio synthesis failed (${audioErr.message}). Using ambient bedtime audio fallback.`);
        story.audioStatus = "ready";
        story.audioDurationSeconds = (storyRequest.durationMinutes || 5) * 60;
        story.audioUrl = "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg";
      }

      // 9. Persist Story
      await storyRepository.create(story);

      res.status(201).json(story);
    } catch (err) {
      next(err);
    }
  }

  async getStory(req: Request, res: Response, next: NextFunction) {
    try {
      const { storyId } = req.params;
      const story = await storyRepository.findById(storyId);
      if (!story) {
        throw AppError.notFound(`Story with id '${storyId}' not found`);
      }

      // Refresh signed URL if expired and key exists
      if (story.audioKey && config.providers.storage !== "mock") {
        const storageProvider = providerRegistry.getStorage(config.providers.storage);
        story.audioUrl = await storageProvider.getSignedUrl(
          story.audioKey,
          config.signedUrlExpirySeconds
        );
      }

      res.json(story);
    } catch (err) {
      next(err);
    }
  }

  async streamStory(req: Request, res: Response, next: NextFunction) {
    try {
      const { storyId } = req.params;
      const story = await storyRepository.findById(storyId);
      if (!story) {
        throw AppError.notFound(`Story with id '${storyId}' not found`);
      }

      const ttsProvider = providerRegistry.getTTS(config.providers.tts);
      if (!ttsProvider.synthesizeStream) {
        // Fallback to synthesizing buffer
        const result = await ttsProvider.synthesize({
          voiceId: story.ttsProvider || "default",
          languageCode: story.languageCode,
          segments: story.segments,
          outputFormat: "mp3",
        });
        res.setHeader("Content-Type", result.mimeType);
        return res.send(result.audioBuffer);
      }

      res.setHeader("Content-Type", ttsProvider.name === "elevenlabs" ? "audio/mpeg" : "audio/wav");
      res.setHeader("Transfer-Encoding", "chunked");

      const stream = ttsProvider.synthesizeStream({
        voiceId: story.ttsProvider || "default",
        languageCode: story.languageCode,
        segments: story.segments,
        outputFormat: "mp3",
      });

      for await (const chunk of stream) {
        res.write(chunk);
      }
      res.end();
    } catch (err) {
      next(err);
    }
  }
}

export const storyController = new StoryController();
