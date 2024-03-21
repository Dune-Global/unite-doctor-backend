import { Request, Response } from "express";
import { containerClient } from "./../../../utils/fileUpload";
import { v4 as uuid4 } from "uuid";
import { deleteBlob } from "./../../../utils/fileDelete";

const BLOB_URL = process.env.BLOB_URL;

export const handleUpload = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    const fileExtension = file.originalname.split(".").pop();

    const blobName = `${uuid4()}-${Date.now()}.${fileExtension}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    let contentType = "application/octet-stream";
    if (file.mimetype === "image/jpeg") {
      contentType = "image/jpeg";
    } else if (file.mimetype === "image/png") {
      contentType = "image/png";
    }

    const uploadBlobResponse = await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: contentType,
      },
    });

    console.log(
      `Upload block blob ${blobName} successfully`,
      uploadBlobResponse.requestId
    );
    return res.status(201).json({
      message: "File uploaded successfully!",
      imgUrl: `${BLOB_URL}/${blobName}`,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const handleDelete = async (req: Request, res: Response) => {
  const imgUrl: string = req.body.imgUrl;

  try {
    if (!imgUrl) {
      return res.status(400).json({ message: "Please fill required fields!" });
    }
    const pathSegments = imgUrl.split("/");
    const blobName = pathSegments[pathSegments.length - 1];

    // Delete the blob
    await deleteBlob(blobName);
    console.log(`Blob "${blobName}" deleted successfully.`);
    return res
      .status(201)
      .json({ message: `Blob "${blobName}" deleted successfully.` });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
