import { Router } from "express";
import { childController } from "../modules/children/child.controller.js";
import { validateBody, createChildSchema } from "../middleware/validateRequest.js";

const router = Router();

router.post("/", validateBody(createChildSchema), (req, res, next) =>
  childController.createChild(req, res, next)
);
router.get("/:childId", (req, res, next) => childController.getChild(req, res, next));
router.get("/parent/:parentId", (req, res, next) =>
  childController.listChildrenForParent(req, res, next)
);

export default router;
