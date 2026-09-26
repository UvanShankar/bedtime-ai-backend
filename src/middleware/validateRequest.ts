import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { AppError } from "../errors/AppError.js";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return next(AppError.badRequest(`Validation failed: ${messages}`, "INVALID_REQUEST", result.error.errors));
    }
    req.body = result.data;
    next();
  };
}

export const createParentSchema = z.object({
  name: z.string().min(1, "Parent name is required"),
  relationship: z.enum(["mother", "father", "grandparent", "guardian", "other"]),
  language: z.string().min(1, "Language is required"),
  languageCode: z.string().min(2, "Language code is required (e.g. en-US, ta-IN)"),
  dialect: z.string().optional(),
  script: z.string().optional(),
});

export const createChildSchema = z.object({
  parentId: z.string().min(1, "parentId is required"),
  name: z.string().min(1, "Child name is required"),
  age: z.number().int().min(1).max(18),
  interests: z.array(z.string()).default([]),
  personality: z.array(z.string()).default([]),
  avoidTopics: z.array(z.string()).default([]),
  favoriteCharacters: z.array(z.string()).optional().default([]),
});

export const generateStorySchema = z.object({
  parentId: z.string().min(1, "parentId is required"),
  childId: z.string().min(1, "childId is required"),
  topic: z.string().min(1, "Topic is required"),
  storyType: z.string().default("bedtime"),
  mood: z.string().default("warm_and_gentle"),
  durationMinutes: z.number().min(1).max(30).default(5),
  educationalGoal: z.string().nullable().optional(),
  bedtimeCalmness: z.number().min(0).max(1).default(0.9),
  includeChildName: z.boolean().default(true),
  realWorldFacts: z.boolean().default(false),
  additionalInstruction: z.string().optional(),
});
