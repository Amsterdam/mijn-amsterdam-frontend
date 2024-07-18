import { NextFunction, Request, Response } from 'express';
import { sendUnauthorized } from './helpers/app';

export function apiKeyVerificationHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers['x-api-key'] as string;

  const externalKeys: Array<string | undefined> = [
    process.env.BFF_EXTERNAL_CONSUMER_API_KEY_1,
    process.env.BFF_EXTERNAL_CONSUMER_API_KEY_2,
  ];

  if (apiKey && externalKeys.includes(apiKey)) {
    return next();
  }

  res.send('Api key ongeldig');
  return sendUnauthorized(res);
}
