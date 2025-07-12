import Busboy from "busboy";

import {
  getFileSize,
  saveToTempStream,
  generateTempFilePath,
} from "./upload.utils";
import type {
  ProcessUploadData,
  ProcessUploadOptions,
} from "./upload.interface";
import { Req } from "@/core/http/types";
import { HttpError } from "@/shared/errors/http-error";
import { Logger } from "@/shared/logger/logger";

const logger = Logger.forContext("process-upload");

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10 GB

export const processUpload = (
  req: Req,
  options?: ProcessUploadOptions,
): Promise<ProcessUploadData> => {
  const { allowedMimeTypes = [] } = options || {};

  const busboy = Busboy({
    headers: req.headers,
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 1,
    },
  });

  const uploadPromise = new Promise<ProcessUploadData>((resolve, reject) => {
    busboy.on("file", (name, fileStream, file) => {
      if (
        allowedMimeTypes.length &&
        !allowedMimeTypes.includes(file.mimeType)
      ) {
        fileStream.resume();
        return reject(
          new HttpError(
            `Unsupported file type ${file.mimeType}`,
            415,
            "processUpload",
          ),
        );
      }

      const { uploadId, finalKey, tmpFilePath } = generateTempFilePath(
        file.filename,
        options?.customFileName,
      );

      saveToTempStream(fileStream, tmpFilePath)
        .then(async () => {
          const contentLength = await getFileSize(tmpFilePath);

          resolve({
            fileName: finalKey,
            mimeType: file.mimeType,
            contentLength,
            tmpFilePath, // keep for later deletion
            uploadId,
          });
        })
        .catch((err) => {
          reject(new HttpError("File processing failed", 500));
        });
    });

    busboy.on("error", (e) => logger.error(e as string));
  });

  req.pipe(busboy);

  return uploadPromise;
};
