import {
  GetObjectCommand,
  HeadObjectCommand,
  S3ServiceException,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { Upload } from "@aws-sdk/lib-storage";

import { s3 } from "@/config/aws.config";
import { Logger } from "@/shared/logger/logger";
import { HttpError } from "@/shared/errors/http-error";
import { IFileStorageService } from "./file-storage.interface";

const logger = Logger.forContext("S3Service");

const Bucket = process.env.AWS_S3_BUCKET;

const s3ErrorMessages = {
  NoSuchKey: {
    message: "File not found",
    status: 404,
  },
  NoSuchBucket: {
    message: "Bucket doesn’t exist",
    status: 404,
  },
  AccessDenied: {
    message: "Access denied",
    status: 403,
  },
  InvalidObjectState: {
    message: "Invalid file",
    status: 415,
  },
};

export class S3Service implements IFileStorageService {
  securedErrorHandler(err: unknown) {
    const error = err as S3ServiceException;
    const name = error.name as keyof typeof s3ErrorMessages;

    if (name in s3ErrorMessages) {
      const { message, status } = s3ErrorMessages[name] ?? {};
      return new HttpError(message, status);
    }

    return new HttpError("S3 Fail", 502, "S3Service");
  }

  async upload(
    key: string,
    body: Readable,
    contentType: string,
    contentLength: number,
  ) {
    try {
      const start = Date.now();

      const parallelUpload = new Upload({
        client: s3,
        params: {
          Bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          ContentLength: contentLength,
        },
        queueSize: 5,
        partSize: 10 * 1024 * 1024,
      });

      await parallelUpload.done();

      logger.info(`Upload time: ${(Date.now() - start) / 1000} sec`);

      return { success: true };
    } catch (err) {
      throw this.securedErrorHandler(err);
    }
  }

  async get(key: string) {
    try {
      const command = new GetObjectCommand({ Bucket, Key: key });
      const response = await s3.send(command);
      return response.Body as Readable;
    } catch (err) {
      throw this.securedErrorHandler(err);
    }
  }

  async delete(key: string) {
    try {
      const command = new DeleteObjectCommand({ Bucket, Key: key });
      await s3.send(command);
      return { success: true };
    } catch (err) {
      throw this.securedErrorHandler(err);
    }
  }

  async getMetadata(key: string) {
    try {
      const command = new HeadObjectCommand({ Bucket, Key: key });
      return await s3.send(command);
    } catch (err) {
      throw this.securedErrorHandler(err);
      // throw new HttpError("No metadata found", 404);
    }
  }
}
