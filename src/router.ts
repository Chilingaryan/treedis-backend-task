import { parse } from "url";
import Stream from "stream";
import { IncomingMessage, ServerResponse } from "http";

import { send, stringify } from "@/core/utils";
import { Controller } from "@/core/controller";
import { Logger } from "@/services/logger.service";
import { ControllerInstance, HttpError, Route } from "@/core/types";

export class Router {
  // private apiPrefix = "";
  // constructor(prefix: string = "") {
  //   this.apiPrefix = prefix;
  // }

  private routes: Route[] = [];

  normalizePath(path: string = ""): string {
    return "/" + path.trim().replace(/\/+$/, "").replace(/^\/+/, "");
  }

  public add(path: string, controller: ControllerInstance) {
    const controllerRoutes =
      (controller.constructor as unknown as Controller).__routes || [];

    for (const route of controllerRoutes) {
      const handlerName = route.handlerName as Route["handlerName"];
      this.routes.push({
        ...route,
        path: path + route.path,
        handler: controller[handlerName].bind(controller),
      });
    }
  }

  public async handle(req: IncomingMessage, res: ServerResponse) {
    const url = parse(req.url!, true);

    const exactController = this.routes.find((item) => {
      return (
        req.method === item.method &&
        this.normalizePath(item.path) === this.normalizePath(url.pathname || "")
      );
    });

    if (exactController) {
      try {
        const data = await exactController.handler!(req, res);

        if (data instanceof Stream) {
          data.pipe(res);
        } else {
          send(res, 200, data);
        }

        Logger.success(req.url!);
      } catch (e: unknown) {
        const httpError = e as HttpError;
        const basicError = e as ErrorEvent;

        if (httpError.type !== "HttpError") {
          send(res, httpError.status, httpError.message);
          Logger.error(req.url!, stringify(httpError.message));
        } else {
          send(res, 500, basicError);
          Logger.error(req.url!, stringify(basicError.message));
        }
      }
      return;
    }

    send(res, 404, { message: "Route not found" });
  }
}
