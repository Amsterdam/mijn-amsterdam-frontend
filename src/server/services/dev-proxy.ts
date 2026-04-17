import type { IncomingHttpHeaders } from 'node:http';

import axios, { HttpStatusCode } from 'axios';
import type { Request, Response } from 'express';

import { getFromEnv } from '../helpers/env.ts';
import { logger } from '../logging.ts';

// Controls which headers get filtered out by supplying a prefix or a full name.
const EXCLUDED_HEADERS = [
  'x-ma-', // Functional headers for the route handler.
  'host', // Overwriting the host will cause the target to not send the request back to the BFF.
  'cookie', // Part of this is for application proxy authentication. For simplicity the whole cookie is stripped.
];

/** This proxy route handler is for sending requests to external systems -
 * that have us specifically whitelisted.
 *
 * Specify in the environment variable `MA_PROXY_TARGET_HOST_ALLOWLIST` what hosts to allow -
 * seperated by semicolons. For example: foo.com;bar.dev;baz.nl.
 * Or use a wildcard to allow all: '*', but it is better to explicitly set hosts for security reasons.
 *
 * # Usage
 *
 * Send a request to the proxy route and most things are like sending it to the target directly.
 *
 * Just supply the required headers:
 * x-ma-dev-api-key for authentication.
 * x-ma-proxy-target for where to send the request.
 * And add any other header you need as usual, these will be passed through unless they are in EXCLUDED_HEADERS.
 *
 * ## Example request
 *
 * curl https://bff-server.nl/api/v1/proxy /
 *   --header 'x-ma-dev-api-key: x'
 *   --header 'x-ma-proxy-target: https://someserver.com/foo/bar/data'
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
    // Disable redirects to prevent bypassing the allowlist.
    maxRedirects: 0,
  })
    .then((incomingResponse) => {
      res
        .status(incomingResponse.status)
        .setHeaders(new Map(Object.entries(incomingResponse.headers)))
        .send(incomingResponse.data);
    })
    .catch((err) => {
      logger.error(err);
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
  const headers = Object.entries(req.headers).filter(
    ([name]) => !EXCLUDED_HEADERS.some((h) => name.startsWith(h))
  );
  return Object.fromEntries(headers);
}
