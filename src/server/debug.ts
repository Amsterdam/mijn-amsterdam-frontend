import createDebugger from 'debug';

export const debugRequest = createDebugger('source-api-request:request');
export const debugResponse = createDebugger('source-api-request:response');
export const debugResponseError = createDebugger(
  'source-api-request:response-error-object'
);
export const debugCacheHit = createDebugger('source-api-request:cache-hit');
export const debugCacheKey = createDebugger('source-api-request:cache-key');
