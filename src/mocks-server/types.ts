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

export interface JsonVariant {
  type: 'json';
  options: {
    delayMs?: number;
    status: number;
    body: unknown;
  };
}

export interface MiddlewareVariant {
  type: 'middleware';
  options: {
    delayMs?: number;
    middleware: (
      req: Request,
      res: Response,
      next: NextFunction,
      core: MockServerCore
    ) => unknown;
  };
}

export type SupportedVariant = JsonVariant | MiddlewareVariant;

export interface MockRouteDefinition {
  id: string;
  url: string;
  method: MockHttpMethod;
  variants: [SupportedVariant, ...SupportedVariant[]];
}
