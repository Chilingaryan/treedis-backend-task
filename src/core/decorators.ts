import { Method } from "@/core/types";

const addRoute = (
  method: string,
  path: string,
  target: any,
  propertyKey: string,
) => {
  if (!target.constructor.__routes) {
    target.constructor.__routes = [];
  }

  target.constructor.__routes.push({
    method,
    path,
    handlerName: propertyKey,
  });
};

function decoratorBuilder(method: Method) {
  return function (path: string = "/") {
    return function (target: any, propertyKey: string) {
      addRoute(method, path, target, propertyKey);
    };
  };
}

export const Get = decoratorBuilder("GET");
export const Post = decoratorBuilder("POST");
export const Put = decoratorBuilder("PUT");
export const Delete = decoratorBuilder("DELETE");
