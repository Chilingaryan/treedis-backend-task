import { IncomingMessage, ServerResponse } from "http";
import { Controller } from "./controller";

export type Method = "GET" | "POST" | "PUT" | "DELETE";

export interface Route {
  method: Method;
  path: string;
  handler?: Function;
  handlerName: string;
}

export type ControllerInstance = Controller & Record<string, any>;

export interface Req extends IncomingMessage {
  query: Record<string, string>;
}

export interface Res extends ServerResponse {}
