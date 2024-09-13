import type { Response } from 'express';
import { IS_DEBUG } from '../config/app';
import { sendMessage } from '../routing/middleware';

// const { encryption: deriveKey } = require('express-openid-connect/lib/crypto');

export function addServiceResultHandler(
  res: Response,
  servicePromise: Promise<any>,
  serviceName: string
) {
  if (IS_DEBUG) {
    console.log(
      'Service-controller: adding service result handler for ',
      serviceName
    );
  }
  return servicePromise.then((data) => {
    sendMessage(res, serviceName, 'message', data);
    if (IS_DEBUG) {
      console.log(
        'Service-controller: service result message sent for',
        serviceName
      );
    }
    return data;
  });
}
