import combined from '../../mock-data/json/focus-combined.json';
import { createTonkResult } from './focus-tonk';

describe('Focus TONK service', () => {
  it('Transforms data correctly and matches snapshot', () => {
    expect(
      createTonkResult(combined.content.tozodocumenten as any)
    ).toMatchSnapshot();
  });
});
