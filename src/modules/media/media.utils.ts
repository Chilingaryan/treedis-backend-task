import { httpError } from "@/core/utils";
import fs from "fs";

export const hasFile = (file?: string) => {
  if (!file) {
    throw httpError("No file provided", 400);
  }

  return true;
};

export const isAllowedMimeType = (mimetype: string) => {
  const allowedMimeTypes = [
    "image/png",
    "image/jpeg",
    "application/pdf",
    "video/mp4",
  ];

  return allowedMimeTypes.includes(mimetype);
};

export const saveToTemp = (
  fileStream: NodeJS.ReadableStream,
  path: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(path);
    fileStream.pipe(writeStream);
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });
};
