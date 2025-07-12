import { HttpError } from "@/shared/errors/http-error";

export const hasFile = (file?: string) => {
  if (!file) {
    throw new HttpError("No file provided", 400);
  }

  return true;
};
