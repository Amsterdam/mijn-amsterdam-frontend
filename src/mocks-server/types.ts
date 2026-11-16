import type { Express, NextFunction, Request, Response } from 'express';
import type { RouteParameters } from 'express-serve-static-core';

export type MockHttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD';

export interface MockServerLogger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface MockServerCore {
  logger: MockServerLogger;
}

export interface JsonHandler {
  type: 'json';
  delayMs?: number;
  status: number;
  body: unknown;
}

export interface MiddlewareHandler<Route extends string = string> {
  type: 'middleware';
  delayMs?: number;
  middleware: (
    req: Request<RouteParameters<Route>>,
    res: Response,
    next: NextFunction,
    core: MockServerCore
  ) => unknown;
}

export type SupportedHandler<Route extends string = string> =
  | JsonHandler
  | MiddlewareHandler<Route>;

export interface MockRouteConfig<Route extends string = string> {
  id: string;
  url: Route;
  method: MockHttpMethod;
  handler: SupportedHandler<Route>;
}

export interface RegisteredMockRouteDefinition
  extends Pick<MockRouteConfig, 'id' | 'url' | 'method'> {
  register(app: Express): void;
}

export type MockRouteDefinition =
  | MockRouteConfig
  | RegisteredMockRouteDefinition;
