import express from "express";

import {
  getInstallations,
  createInstallation,
  getInstallationById,
  updateInstallation,
  deleteInstallation,
} from "../controllers/installationController.js";

import { validateInstallation } from "../middleware/validation.js";

const router = express.Router();

router.get("/", getInstallations);
router.post("/", validateInstallation, createInstallation);
router.get("/:id", getInstallationById);
router.put("/:id",validateInstallation, updateInstallation);
router.delete("/:id", deleteInstallation);

export default router;