import combined from '../../mock-data/json/focus-combined.json';
import { createBbzResult } from './focus-bbz';

describe('Focus BBZ service', () => {
  it('Transforms data correctly and matches snapshot', () => {
    expect(
      createBbzResult(combined.content.tozodocumenten as any)
    ).toMatchSnapshot();
  });
});