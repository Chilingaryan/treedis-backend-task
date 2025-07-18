import qs from "qs";
import { IncomingMessage, ServerResponse } from "http";

import { Req } from "../http/types";

export const stringify = (data: unknown): string => {
  if (typeof data === "object") {
    return JSON.stringify(data, null, 2);
  } else {
    return `${data}`;
  }
};

export function send(
  res: ServerResponse,
  statusCode: number = 500,
  data: unknown,
  contentType = "application/json",
) {
  res.writeHead(statusCode, { "Content-Type": contentType });
  res.end(stringify(data));
}

export const queryfy = (req: IncomingMessage): Req => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const query = qs.parse(url.search!, { ignoreQueryPrefix: true });
  return Object.assign(req, { query }) as Req;
};
