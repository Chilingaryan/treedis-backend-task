import { httpError } from "@/core/utils";

export const hasFile = (file?: string) => {
  if (!file) {
    throw httpError("No file provided", 400);
  }

  return true;
};
