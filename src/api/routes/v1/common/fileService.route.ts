import express from "express";
import {
  handleDelete,
  handleUpload,
} from "./../../../controllers/common/fileService.controller";
import { uploadFile } from "./../../../../utils/fileUpload";

const router = express.Router();

router.post("/upload", uploadFile, handleUpload);
router.post("/delete", handleDelete);

export default router;
