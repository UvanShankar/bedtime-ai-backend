import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { parentRepository } from "../../repositories/ParentRepository.js";
import { AppError } from "../../errors/AppError.js";
import { ParentProfile } from "../../types/models.js";

export class ParentController {
  async createParent(req: Request, res: Response, next: NextFunction) {
    try {
      const now = new Date().toISOString();
      const parent: ParentProfile = {
        id: uuidv4(),
        name: req.body.name,
        relationship: req.body.relationship,
        language: req.body.language,
        languageCode: req.body.languageCode,
        dialect: req.body.dialect,
        script: req.body.script,
        createdAt: now,
        updatedAt: now,
      };

      const saved = await parentRepository.create(parent);
      res.status(201).json(saved);
    } catch (err) {
      next(err);
    }
  }

  async getParent(req: Request, res: Response, next: NextFunction) {
    try {
      const { parentId } = req.params;
      const parent = await parentRepository.findById(parentId);
      if (!parent) {
        throw AppError.notFound(`Parent with id '${parentId}' not found`);
      }
      res.json(parent);
    } catch (err) {
      next(err);
    }
  }

  async listParents(_req: Request, res: Response, next: NextFunction) {
    try {
      const parents = await parentRepository.list();
      res.json(parents);
    } catch (err) {
      next(err);
    }
  }
}

export const parentController = new ParentController();
