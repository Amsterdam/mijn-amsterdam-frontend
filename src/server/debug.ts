import { logger } from './logging';

const debug = process.env.DEBUG;

const debugResponseDataTerms = process.env.DEBUG_RESPONSE_DATA;
if (debugResponseDataTerms && !debug?.includes('source-api-request:response')) {
  logger.info(
    `Enabling debug for source-api-request:response because DEBUG_RESPONSE_DATA is set (${debugResponseDataTerms})`
  );
  process.env.DEBUG = `source-api-request:response,${process.env.DEBUG ?? ''}`;
}

const debugRequestDataTerms = process.env.DEBUG_REQUEST_DATA;
if (debugRequestDataTerms && !debug?.includes('source-api-request:request')) {
  logger.info(
    `Enabling debug for source-api-request:request because DEBUG_REQUEST_DATA is set (${debugRequestDataTerms})`
  );
  process.env.DEBUG = `source-api-request:request,${process.env.DEBUG ?? ''}`;
}
