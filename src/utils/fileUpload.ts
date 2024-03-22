import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const BLOB_CONTAINER_NAME = process.env.BLOB_CONTAINER_NAME!;

const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

export const containerClient =
  blobServiceClient.getContainerClient(BLOB_CONTAINER_NAME);

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadFile = upload.single("file");