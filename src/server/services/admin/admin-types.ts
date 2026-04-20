import type { Request } from 'express';
export type RequestWithSession = Request &
  Omit<Request, 'session'> & {
    session?: Request['session'] & {
      isAuthenticated: boolean;
      username: string;
    };
  };
