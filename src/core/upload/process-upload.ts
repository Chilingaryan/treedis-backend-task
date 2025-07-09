import Busboy from "busboy";
import { Readable } from "stream";

import {
  getFileSize,
  createReadStream,
  saveToTempStream,
  generateTempFilePath,
} from "./upload.utils";
import { Req } from "@/core/types";
import { httpError } from "@/core/utils";

export interface ProcessUploadData {
  fileName: string;
  mimeType: string;
  contentLength: number;
  tmpFilePath: string;
  readStream: Buffer | Readable;
}

export interface ProcessUploadOptions {
  allowedMimeTypes?: string[];
  customFileName?: string;
}

export async function processUpload(
  req: Req,
  options?: ProcessUploadOptions,
): Promise<ProcessUploadData> {
  const { allowedMimeTypes = [] } = options || {};

  const busboy = Busboy({ headers: req.headers });

  const uploadPromise = new Promise<ProcessUploadData>((resolve, reject) => {
    busboy.on("file", (name, fileStream, file) => {
      if (
        allowedMimeTypes.length &&
        !allowedMimeTypes.includes(file.mimeType)
      ) {
        fileStream.resume(); // prevent stream hang
        return reject(
          httpError(`Unsupported file type: ${file.mimeType}`, 400),
        );
      }

      const { finalKey, tmpFilePath } = generateTempFilePath(
        file.filename,
        options?.customFileName,
      );

      saveToTempStream(fileStream, tmpFilePath)
        .then(() => {
          const contentLength = getFileSize(tmpFilePath);
          const readStream = createReadStream(tmpFilePath);

          resolve({
            fileName: finalKey,
            mimeType: file.mimeType,
            readStream,
            contentLength,
            tmpFilePath, // keep for later deletion
          });
        })
        .catch((err) => {
          reject(httpError("File processing failed", 500));
          console.log(2222);
        });
    });
  });

  req.pipe(busboy);
  return uploadPromise;
}
