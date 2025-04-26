import fs from "fs";
import os from "os";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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

export const generateTempFilePath = (
  originalFilename?: string,
  customFileName?: string
) => {
  const ext = originalFilename ? path.extname(originalFilename) : "";
  const finalKey = customFileName ?? uuidv4() + ext;
  const tmpFilePath = path.join(os.tmpdir(), finalKey);
  return { finalKey, tmpFilePath };
};

export const getFileSize = (filePath: string) => {
  return fs.statSync(filePath).size;
};

export const createReadStream = (filePath: string) => {
  return fs.createReadStream(filePath);
};
