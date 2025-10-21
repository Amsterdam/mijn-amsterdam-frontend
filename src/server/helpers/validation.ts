import * as z from 'zod';

import type { BSN } from '../services/zorgned/zorgned-types';

// See also: https://github.com/willemverbuyst/bsn-js

const MIN_LEN = 8;
const MAX_LEN = 9;
const RESULT_PROOF = 11;

/**
 * The isValidBSN function takes a string (of numbers)
 *
 * @param bsn the BSN to be validated
 * @returns true if it is a valid BSN else false
 */
export const isValidBSN = (bsn: BSN): boolean => {
  if (bsn.length < MIN_LEN || bsn.length > MAX_LEN) {
    return false;
  }

  const numbers = Array.from(String(bsn), Number);
  const lastNumber = numbers[numbers.length - 1];

  if (typeof lastNumber === 'number' && !numbers.includes(NaN)) {
    return (
      (numbers
        .slice(0, -1)
        .reduce((a, b, i, arr) => b * (arr.length + 1 - i) + a, 0) -
        lastNumber) %
        RESULT_PROOF ===
      0
    );
  }

  return false;
};

const ValidBSN = z.string().refine((n) => isValidBSN(n), {
  message: 'Invalid BSN',
});

export const ZodValidators = {
  BSN: ValidBSN,
};
