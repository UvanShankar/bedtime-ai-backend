import request from "supertest";
import { createApp } from "../../src/app.js";
import { parentRepository } from "../../src/repositories/ParentRepository.js";
import { childRepository } from "../../src/repositories/ChildRepository.js";
import { voiceProfileRepository } from "../../src/repositories/VoiceProfileRepository.js";
import { styleProfileRepository } from "../../src/repositories/StyleProfileRepository.js";
import { storyRepository } from "../../src/repositories/StoryRepository.js";

import { config } from "../../src/config/index.js";

// Ensure tests use isolated mock providers as mandated by spec section 25
config.providers.llm = "mock";
config.providers.tts = "mock";
config.providers.voice = "mock";
config.providers.storage = "mock";
config.providers.speech = "mock";

const app = createApp();

describe("Bedtime AI Backend API Integration", () => {
  beforeEach(() => {
    parentRepository.clear();
    childRepository.clear();
    voiceProfileRepository.clear();
    styleProfileRepository.clear();
    storyRepository.clear();
  });

  it("should complete the full flow: Parent -> Child -> Voice Upload -> Story Generation", async () => {
    // 1. Create Parent Profile
    const parentRes = await request(app)
      .post("/api/v1/parents")
      .send({
        name: "Devi",
        relationship: "mother",
        language: "Tamil",
        languageCode: "ta-IN",
        dialect: "Coimbatore",
      })
      .expect(201);

    expect(parentRes.body.id).toBeDefined();
    expect(parentRes.body.name).toBe("Devi");
    const parentId = parentRes.body.id;

    // 2. Create Child Profile
    const childRes = await request(app)
      .post("/api/v1/children")
      .send({
        parentId,
        name: "Kavin",
        age: 5,
        interests: ["jungle animals", "stars"],
        personality: ["playful"],
        avoidTopics: ["darkness"],
      })
      .expect(201);

    expect(childRes.body.id).toBeDefined();
    expect(childRes.body.name).toBe("Kavin");
    const childId = childRes.body.id;

    // 3. Upload Voice Sample with Consent
    const dummyAudio = Buffer.from("RIFF....WAVEfmt ....data....");
    const voiceRes = await request(app)
      .post(`/api/v1/parents/${parentId}/voice`)
      .field("consent", "true")
      .attach("audio", dummyAudio, "sample.wav")
      .expect(201);

    expect(voiceRes.body.voiceProfile).toBeDefined();
    expect(voiceRes.body.voiceProfile.status).toBe("ready");
    expect(voiceRes.body.styleProfile).toBeDefined();
    expect(voiceRes.body.styleProfile.warmth.value).toBeGreaterThan(0);

    // 4. Generate Bedtime Story
    const storyRes = await request(app)
      .post("/api/v1/stories/generate")
      .send({
        parentId,
        childId,
        topic: "The Baby Elephant and the Sleepy Star",
        storyType: "bedtime adventure",
        mood: "warm and peaceful",
        durationMinutes: 4,
        bedtimeCalmness: 0.9,
        includeChildName: true,
        realWorldFacts: false,
      })
      .expect(201);

    expect(storyRes.body.id).toBeDefined();
    expect(storyRes.body.title).toBeDefined();
    expect(storyRes.body.segments.length).toBeGreaterThan(0);
    expect(storyRes.body.audioUrl).toBeDefined();
    expect(storyRes.body.audioStatus).toBe("ready");
    const storyId = storyRes.body.id;

    // 5. Fetch Generated Story
    const getStoryRes = await request(app).get(`/api/v1/stories/${storyId}`).expect(200);
    expect(getStoryRes.body.id).toBe(storyId);
    expect(getStoryRes.body.title).toBe(storyRes.body.title);

    // 6. Delete Voice Profile
    const deleteVoiceRes = await request(app)
      .delete(`/api/v1/parents/${parentId}/voice`)
      .expect(200);
    expect(deleteVoiceRes.body.success).toBe(true);

    // Verify voice profile is cleared
    await request(app).get(`/api/v1/parents/${parentId}/voice`).expect(404);
  });

  it("should reject voice upload when explicit consent is not provided", async () => {
    const parentRes = await request(app)
      .post("/api/v1/parents")
      .send({
        name: "Arun",
        relationship: "father",
        language: "English",
        languageCode: "en-US",
      })
      .expect(201);

    const dummyAudio = Buffer.from("RIFF....WAVEfmt ....data....");
    const res = await request(app)
      .post(`/api/v1/parents/${parentRes.body.id}/voice`)
      .field("consent", "false")
      .attach("audio", dummyAudio, "sample.wav")
      .expect(400);

    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe("VOICE_CONSENT_REQUIRED");
  });

  it("should reject invalid child creation payload", async () => {
    const res = await request(app).post("/api/v1/children").send({ age: -1 }).expect(400);

    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe("INVALID_REQUEST");
  });
});
