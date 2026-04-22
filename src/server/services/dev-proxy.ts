import type { IncomingHttpHeaders } from 'node:http';

import axios, { HttpStatusCode } from 'axios';
import type { Request, Response } from 'express';

import { getFromEnv } from '../helpers/env.ts';
import { logger } from '../logging.ts';
import { BffEndpoints } from '../routing/bff-routes.ts';

const PROXY_API_KEY = getFromEnv('MA_DEV_API_KEY', true);
const ALLOWED_HOSTS = getFromEnv('MA_PROXY_TARGET_HOST_ALLOWLIST', true);

/** This proxy route handler is for sending requests to external systems -
 * that have us specifically whitelisted.
 *
 * Specify in the environment variable `MA_PROXY_TARGET_HOST_ALLOWLIST` what hosts to allow -
 * seperated by semicolons. For example: foo.com;bar.dev;baz.nl.
 *
 * # Usage
 *
 * Send a request to the proxy route and most things are like sending it to the target directly.
 * Everything after this endpoints route '/proxy</this-part>' will be cut off and sent as the path for the target host -
 * including url parameters.
 *
 * Just supply the required headers:
 * x-ma-dev-api-key for authentication.
 * x-ma-proxy-target-host for where to send the request.
 *
 * Optional headers passed through to the target server start with 'x-ma-pass-'.
 * When receiving these, we will send everything after that prefix as is.
 * For example: 'x-ma-pass-foo: bar' will be send as 'foo: bar'.
 *
 * ## Example request
 *
 * curl https://bff-server.nl/api/v1/proxy/path/foo/bar/baz?a=1&b=2 /
 *   --header 'x-ma-dev-api-key: x'
 *   --header 'x-ma-proxy-target-host: https://someserver.com'
 *   --header 'x-ma-pass-api-key-for-target-server: x'
 */
export async function devProxyHandler(req: Request, res: Response) {
  if (!(PROXY_API_KEY && ALLOWED_HOSTS)) {
    return res
      .status(HttpStatusCode.InternalServerError)
      .send('Missing env variables; check the server logs');
  }

  const apiKeyName = 'x-ma-dev-api-key';
  const apiKey = req.headers[apiKeyName];
  if (apiKey !== PROXY_API_KEY) {
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(`Invalid or missing header '${apiKeyName}'`);
  }

  const proxyTargetHeaderName = 'x-ma-proxy-target-host';
  const proxyTargetHeader = req.headers[proxyTargetHeaderName];
  if (!proxyTargetHeader || typeof proxyTargetHeader !== 'string') {
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        `Host to send request to was not found in header: '${proxyTargetHeaderName}'`
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

  const allowListedHosts = ALLOWED_HOSTS.split(';');
  if (
    !(allowListedHosts.length && allowListedHosts.includes(proxyTarget.origin))
  ) {
    return res
      .status(HttpStatusCode.Forbidden)
      .send(
        `'${proxyTargetHeaderName}: ${proxyTarget}' does not contain an allowed host. Allowed hosts are: ${allowListedHosts}`
      );
  }

  const targetPath = req.url.replace(BffEndpoints.PROXY, '');
  axios({
    url: proxyTarget.origin + targetPath,
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
