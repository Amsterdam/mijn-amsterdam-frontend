import type { Request } from 'express';

import type { LinkProps } from '../../../universal/types/App.types.ts';
export type RequestWithSession = Request &
  Omit<Request, 'session'> & {
    session?: Request['session'] & {
      isAuthenticated: boolean;
      username: string;
    };
  };

export type AdminIndexLocals = {
  links: LinkProps[];
};
