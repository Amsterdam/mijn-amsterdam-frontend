import type { NextFunction, Request, Response } from 'express';

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

export interface MiddlewareHandler {
  type: 'middleware';
  delayMs?: number;
  middleware: (
    req: Request,
    res: Response,
    next: NextFunction,
    core: MockServerCore
  ) => unknown;
}

export type SupportedHandler = JsonHandler | MiddlewareHandler;

export interface MockRouteDefinition {
  id: string;
  url: string;
  method: MockHttpMethod;
  handler: SupportedHandler;
}
