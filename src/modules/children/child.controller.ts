import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { childRepository } from "../../repositories/ChildRepository.js";
import { parentRepository } from "../../repositories/ParentRepository.js";
import { AppError } from "../../errors/AppError.js";
import { ChildProfile } from "../../types/models.js";

export class ChildController {
  async createChild(req: Request, res: Response, next: NextFunction) {
    try {
      const parent = await parentRepository.findById(req.body.parentId);
      if (!parent) {
        throw AppError.notFound(`Parent with id '${req.body.parentId}' not found`);
      }

      const now = new Date().toISOString();
      const child: ChildProfile = {
        id: uuidv4(),
        parentId: req.body.parentId,
        name: req.body.name,
        age: req.body.age,
        interests: req.body.interests || [],
        personality: req.body.personality || [],
        avoidTopics: req.body.avoidTopics || [],
        favoriteCharacters: req.body.favoriteCharacters || [],
        createdAt: now,
        updatedAt: now,
      };

      const saved = await childRepository.create(child);
      res.status(201).json(saved);
    } catch (err) {
      next(err);
    }
  }

  async getChild(req: Request, res: Response, next: NextFunction) {
    try {
      const { childId } = req.params;
      const child = await childRepository.findById(childId);
      if (!child) {
        throw AppError.notFound(`Child with id '${childId}' not found`);
      }
      res.json(child);
    } catch (err) {
      next(err);
    }
  }

  async listChildrenForParent(req: Request, res: Response, next: NextFunction) {
    try {
      const { parentId } = req.params;
      const children = await childRepository.findByParentId(parentId);
      res.json(children);
    } catch (err) {
      next(err);
    }
  }
}

export const childController = new ChildController();
