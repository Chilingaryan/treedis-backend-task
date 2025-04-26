import Busboy from "busboy";
import { Readable } from "stream";

import {
  getFileSize,
  saveToTemp,
  createReadStream,
  generateTempFilePath,
} from "./upload.utils";
import { Req } from "@/core/types";
import { httpError } from "@/core/utils";

export interface ProcessUploadData {
  fileName: string;
  mimeType: string;
  contentLength: number;
  readStream: Buffer | Readable;
}

export interface ProcessUploadOptions {
  allowedMimeTypes?: string[];
  customFileName?: string;
}

export async function processUpload(
  req: Req,
  options?: ProcessUploadOptions
): Promise<ProcessUploadData> {
  const { allowedMimeTypes = [] } = options || {};

  const busboy = Busboy({ headers: req.headers });

  const uploadPromise = new Promise<ProcessUploadData>((resolve, reject) => {
    busboy.on("file", async (name, fileStream, file) => {
      try {
        // prettier-ignore
        if (allowedMimeTypes.length && !allowedMimeTypes.includes(file.mimeType)) {
          return reject(
            httpError(`Unsupported file type: ${file.mimeType}`, 400)
          );
        }

        const { finalKey, tmpFilePath } = generateTempFilePath(
          file.filename,
          options?.customFileName
        );

        await saveToTemp(fileStream, tmpFilePath);

        const contentLength = getFileSize(tmpFilePath);
        const readStream = createReadStream(tmpFilePath);

        resolve({
          fileName: finalKey,
          mimeType: file.mimeType,
          readStream,
          contentLength,
        });
      } catch (err) {
        reject(httpError("File processing failed", 500));
      }
    });

    busboy.on("error", () => reject(httpError("Upload error", 500)));
  });

  req.pipe(busboy);
  return uploadPromise;
}
