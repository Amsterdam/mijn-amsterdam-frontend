import { describe, it, expect } from 'vitest';

import { isValidBSN, ZodValidators } from './validation';

describe('isValidBSN', () => {
  it('should return true for valid BSNs', () => {
    expect(isValidBSN('123456782')).toBe(true);
    expect(isValidBSN('111222333')).toBe(true);
    expect(isValidBSN('111222333')).toBe(true);
  });

  it('should return false for invalid BSNs', () => {
    expect(isValidBSN('123456789')).toBe(false); // Invalid BSN
    expect(isValidBSN('abcdefgh')).toBe(false); // Non-numeric input
    expect(isValidBSN('123')).toBe(false); // Too short
    expect(isValidBSN('1234567890')).toBe(false); // Too long
  });
});

describe('ZodValidators.BSN', () => {
  it('should validate a correct BSN', () => {
    expect(() => ZodValidators.BSN.parse('123456782')).not.toThrow(); // Valid BSN
  });

  it('should throw an error for an invalid BSN', () => {
    expect(() => ZodValidators.BSN.parse(123456789)).toThrow(); // Invalid type format
    expect(() => ZodValidators.BSN.parse('123456789')).toThrow('Invalid BSN'); // Invalid BSN
    expect(() => ZodValidators.BSN.parse('abcdefgh')).toThrow('Invalid BSN'); // Non-numeric input
    expect(() => ZodValidators.BSN.parse('123')).toThrow('Invalid BSN'); // Too short
    expect(() => ZodValidators.BSN.parse('1234567890')).toThrow('Invalid BSN'); // Too long
  });
});
