import type { Request } from 'express';
export type RequestWithSession = Omit<Request, 'session'> & {
  session?: Request['session'] & {
    isAuthenticated: boolean;
    account?: {
      username: string;
    };
  };
};
