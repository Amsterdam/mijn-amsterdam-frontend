import type { IncomingHttpHeaders } from 'node:http';

import axios, { HttpStatusCode } from 'axios';
import type { Request, Response } from 'express';

import { getFromEnv } from '../helpers/env.ts';
import { logger } from '../logging.ts';

// TODO
// - pass headers, filter current
// - disable localhost (might be overkill)
// - disable redirects

/** This proxy route handler is for sending requests to external systems -
 * that have us specifically whitelisted.
 * All functional headers needed are prefixed with 'x-ma-' to prevent conflicts.
 *
 * Specify in environment variable `MA_PROXY_TARGET_HOST_ALLOWLIST` what hosts to allow -
 * seperated by semicolons. For example: foo.com;bar.dev;baz.nl.
 * Or use a wildcard to allow all: '*', but it is better to explicitly set hosts for security reasons.
 *
 * # Usage
 *
 * Supply the required headers:
 * x-ma-dev-api-key for authentication.
 * x-ma-proxy-target for where to send the request.
 *
 * Optional headers passed through to the target server start with 'x-ma-pass-'.
 * When receiving these, we will send everything after that prefix as is.
 * For example: 'x-ma-pass-foo: bar' will be send as 'foo: bar'.
 *
 * ## Example request
 *
 * curl https://bff-server.nl/api/v1/proxy /
 *   --header 'x-ma-dev-api-key: x'
 *   --header 'x-ma-proxy-target: https://someserver.com/foo/bar/data'
 *   --header 'x-ma-pass-api-key-for-target-server: x'
 */
export async function devProxyHandler(req: Request, res: Response) {
  const proxyApiKey = getFromEnv('MA_DEV_API_KEY', true);

  const apiKeyName = 'x-ma-dev-api-key';
  const apiKey = req.headers[apiKeyName];
  if (apiKey !== proxyApiKey) {
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(`Invalid or missing header '${apiKeyName}'`);
  }

  const proxyTargetHeaderName = 'x-ma-proxy-target';
  const proxyTargetHeader = req.headers[proxyTargetHeaderName];
  if (!proxyTargetHeader || typeof proxyTargetHeader !== 'string') {
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        `Url to send request to was not found in header: '${proxyTargetHeaderName}'`
      );
  }
  let proxyTarget;
  try {
    proxyTarget = new URL(proxyTargetHeader);
  } catch (_) {
    return res
      .status(HttpStatusCode.BadRequest)
      .send(`Invalid URL in: '${proxyTargetHeaderName}'`);
  }

  const allowListedHosts = getFromEnv(
    'MA_PROXY_TARGET_HOST_ALLOWLIST',
    true
  )!.split(';');
  if (
    !(
      allowListedHosts.length &&
      (allowListedHosts.includes('*') ||
        allowListedHosts.includes(proxyTarget.host))
    )
  ) {
    return res
      .status(HttpStatusCode.Forbidden)
      .send(
        `'${proxyTargetHeaderName}: ${proxyTarget}' does not contain an allowed host. Allowed hosts are: ${allowListedHosts}`
      );
  }

  axios({
    url: proxyTarget.href,
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
            `Proxy: Request send to ${proxyTarget.href} but no response has been received`
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
