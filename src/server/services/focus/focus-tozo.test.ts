import combined from '../../mock-data/json/focus-combined.json';
import { createTozoResult } from './focus-tozo-helpers';

describe('Focus Tozo service', () => {
  it('Transforms data correctly and matches snapshot', () => {
    expect(
      createTozoResult(combined.content.tozodocumenten as any)
    ).toMatchSnapshot();
  });
});
