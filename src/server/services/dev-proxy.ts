import type { IncomingHttpHeaders } from 'node:http';

import axios, { HttpStatusCode } from 'axios';
import type { Request, Response } from 'express';

import { getFromEnv } from '../helpers/env.ts';
import { logger } from '../logging.ts';


const PROXY_API_KEY = getFromEnv('MA_DEV_API_KEY', false);

export async function devProxyHandler(req: Request, res: Response) {
  // This proxy route aims to closely mimic the server's behavior, making it appear as though the server itself initiated these requests.
  // All functional headers needed are prefixed with 'x-ma-' to prevent conflicts.
  const apiKeyName = 'x-ma-dev-api-key';
  const apiKey = req.headers[apiKeyName];
  if (apiKey !== PROXY_API_KEY) {
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(`Invalid or missing header '${apiKeyName}'`);
  }

  const urlHeaderName = 'x-ma-proxy-target';
  const url = req.headers[urlHeaderName];
  if (!url || typeof url !== 'string') {
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        `Url to send request to was not found in header: '${urlHeaderName}'`
      );
  }

  axios({
    url,
    method: req.method,
    headers: getPassthroughHeaders(req),
    data: req.body,
    // Prevent parsing of responses.
    transformResponse: (res) => res,
    // No errors, all statuscodes are valid and will be sent back. This also prevents json parsing on data when erroring.
    validateStatus: () => true,
  })
    .then((incomingResponse) => {
      res
        .status(incomingResponse.status)
        .setHeaders(new Map(Object.entries(incomingResponse.headers)))
        .send(incomingResponse.data);
    })
    .catch((err) => {
      if (err.request) {
        res
          .status(HttpStatusCode.BadRequest)
          .send(
            `Proxy: Request send to ${url} but no response has been recieved`
          );
      } else {
        logger.error(err);
      }
    });
}

function getPassthroughHeaders(req: Request): IncomingHttpHeaders {
  const passthroughPrefix = 'x-ma-pass-';
  const headers = Object.entries(req.headers)
    .filter(([name]) => {
      return name.startsWith(passthroughPrefix);
    })
    .map(([name, val]) => {
      return [name.replace(passthroughPrefix, ''), val];
    });
  return Object.fromEntries(headers);
}
