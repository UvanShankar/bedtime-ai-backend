import OpenAI from "openai";
import { LLMProvider, StoryGenerationContext, LLMStoryResponse } from "../../../types/providers.js";
import { ParentStyleProfile } from "../../../types/models.js";
import { AppError } from "../../../errors/AppError.js";
import { defaultStoryPromptBuilder } from "../../../prompts/StoryPromptBuilder.js";
import { StyleAnalysisPromptBuilder } from "../../../prompts/StyleAnalysisPromptBuilder.js";

export interface OpenAIOptions {
  apiKey?: string;
  storyModel?: string;
  analysisModel?: string;
}

export class OpenAIStoryProvider implements LLMProvider {
  public readonly name = "openai";
  private client?: OpenAI;
  private apiKey?: string;
  private storyModel: string;
  private analysisModel: string;

  constructor(options: OpenAIOptions) {
    this.apiKey = options.apiKey;
    this.storyModel = options.storyModel || "gpt-4o-mini";
    this.analysisModel = options.analysisModel || "gpt-4o-mini";
    if (this.apiKey) {
      this.client = new OpenAI({ apiKey: this.apiKey });
    }
  }

  private getClient(): OpenAI {
    if (!this.client) {
      if (!this.apiKey) {
        throw new AppError(
          "OpenAI API key is missing. Please set OPENAI_API_KEY in your backend .env file to make actual AI calls.",
          "INVALID_REQUEST",
          500
        );
      }
      this.client = new OpenAI({ apiKey: this.apiKey });
    }
    return this.client;
  }

  async generateStructuredStory(context: StoryGenerationContext): Promise<LLMStoryResponse> {
    const systemPrompt = defaultStoryPromptBuilder.buildSystemPrompt(context);
    const userPrompt = defaultStoryPromptBuilder.buildUserPrompt(context);
    const client = this.getClient();

    try {
      const response = await client.chat.completions.create({
        model: this.storyModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AppError("Empty response from OpenAI story model", "STORY_GENERATION_FAILED", 502);
      }

      const rawCleaned = content.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
      const parsed = JSON.parse(rawCleaned) as LLMStoryResponse;
      if (!parsed.title || !Array.isArray(parsed.segments) || parsed.segments.length === 0) {
        throw new AppError(
          "LLM returned invalid story structure missing title or segments",
          "STORY_VALIDATION_FAILED",
          502,
          parsed
        );
      }

      return parsed;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError(
        `OpenAI story generation failed: ${err.message}`,
        "STORY_GENERATION_FAILED",
        502,
        err
      );
    }
  }

  async analyzeParentStyle(
    transcript: string,
    metadata?: Record<string, unknown>
  ): Promise<Partial<ParentStyleProfile>> {
    const systemPrompt = StyleAnalysisPromptBuilder.buildSystemPrompt();
    const userPrompt = StyleAnalysisPromptBuilder.buildUserPrompt(transcript, metadata);
    const client = this.getClient();

    try {
      const response = await client.chat.completions.create({
        model: this.analysisModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AppError("Empty response from OpenAI style analysis model", "STYLE_ANALYSIS_FAILED", 502);
      }

      const rawCleaned = content.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
      return JSON.parse(rawCleaned);
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError(
        `OpenAI style analysis failed: ${err.message}`,
        "STYLE_ANALYSIS_FAILED",
        502,
        err
      );
    }
  }
}
