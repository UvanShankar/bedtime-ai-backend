import { Router } from "express";
import { parentController } from "../modules/parents/parent.controller.js";
import { validateBody, createParentSchema } from "../middleware/validateRequest.js";

const router = Router();

router.post("/", validateBody(createParentSchema), (req, res, next) =>
  parentController.createParent(req, res, next)
);
router.get("/:parentId", (req, res, next) => parentController.getParent(req, res, next));
router.get("/", (req, res, next) => parentController.listParents(req, res, next));

export default router;
