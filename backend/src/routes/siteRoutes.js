import express from "express";

import {
  getSites,
  createSite,
  getSiteById,
  updateSite,
  deleteSite,
} from "../controllers/siteController.js";

import { validateSite } from "../middleware/validation.js";

const router = express.Router();

router.get("/", getSites);
router.post("/", validateSite, createSite);
router.get("/:id", getSiteById);
router.put("/:id", validateSite, updateSite);
router.delete("/:id", deleteSite);

export default router;