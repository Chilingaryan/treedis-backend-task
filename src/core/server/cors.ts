import { ServerResponse } from "http";

export function applyCorsHeaders(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // This would be replaced in real life
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
