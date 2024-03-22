import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";

dotenv.config();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const BLOB_CONTAINER_NAME = process.env.BLOB_CONTAINER_NAME!;

const azureBlobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);
const containerClient =
  azureBlobServiceClient.getContainerClient(BLOB_CONTAINER_NAME);

export const deleteBlob = async (blobName: string) => {
  const blobClient = containerClient.getBlockBlobClient(blobName);
  await blobClient.delete();
};
