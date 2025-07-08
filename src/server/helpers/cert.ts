import { Buffer } from 'node:buffer';
import fs from 'node:fs';

import { getFromEnv } from './env.ts';
import { IS_DEVELOPMENT } from '../../universal/config/env.ts';
import { logger } from '../logging.ts';

export function getCertificateSync(envVarName: string | undefined) {
  const path = envVarName && getFromEnv(envVarName, false);
  if (path) {
    try {
      const fileContents = fs.readFileSync(path).toString();
      return fileContents;
    } catch (error) {
      logger.error(error);
    }
  }

  return undefined;
}

function decodeBase64EncodedCertificateFromEnv(name: string | undefined) {
  const data = name && getFromEnv(name);
  if (data) {
    return Buffer.from(data, 'base64').toString('utf-8');
  }
  return undefined;
}

export function getCert(envVarName: string) {
  return IS_DEVELOPMENT
    ? getCertificateSync(envVarName)
    : decodeBase64EncodedCertificateFromEnv(envVarName);
}
