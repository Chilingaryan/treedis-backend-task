import Stream from "stream";
import { parse } from "url";
import { IncomingMessage, ServerResponse } from "http";

import { send } from "@/core/utils";
import { Controller } from "@/core/controller";
import { Logger } from "@/shared/logger/logger";
import { AppError } from "@/shared/errors/app-error";
import { ControllerInstance, Route } from "@/core/types";

const logger = Logger.forContext("Router");

export class Router {
  // private apiPrefix = "";
  // constructor(prefix: string = "") {
  //   this.apiPrefix = prefix;
  // }

  private routes: Route[] = [];

  private middlewares: any[] = [];

  private watchers: any[] = [];

  private normalizePath(path: string = ""): string {
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

    const route = this.routes.find((item) => {
      return (
        req.method === item.method &&
        this.normalizePath(item.path) === this.normalizePath(url.pathname || "")
      );
    });

    if (!route) {
      send(res, 404, { message: "Route not found" });
      return;
    }

    try {
      const result = await Promise.race([
        route.handler!(req, res),
        ...this.watchers.map((watcher) => watcher()),
      ]);

      if (result instanceof Stream) {
        result.pipe(res);
      } else {
        send(res, 200, result);
      }

      logger.success(req.url!);
    } catch (err) {
      if (err instanceof AppError) {
        logger.warn(req.url!, err.message);
        send(res, err.statusCode, { message: err.message });
        return;
      }

      logger.error(req.url!, err);
      send(res, 500, { message: "Internal Server Error" });
      return;
    }
  }

  public registerMiddleware(middleware: any) {
    this.middlewares.push(middleware);
  }

  public registerWatcher(watcher: any) {
    this.watchers.push(watcher);
  }
}
