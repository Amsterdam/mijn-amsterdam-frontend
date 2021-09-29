import combined from '../../mock-data/json/focus-combined.json';
import { createBBZResult } from './focus-bbz';

describe('Focus BBZ service', () => {
  it('Transforms data correctly and matches snapshot', () => {
    expect(
      createBBZResult(combined.content.tozodocumenten as any)
    ).toMatchSnapshot();
  });
});
