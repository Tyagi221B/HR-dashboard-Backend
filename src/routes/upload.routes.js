import express from "express";
import upload from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/", upload.single("pdfFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({ message: "PDF uploaded successfully", file: req.file });
});

export default router;
