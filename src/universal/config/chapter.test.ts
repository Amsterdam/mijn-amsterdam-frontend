import { getToeristischeVerhuurTitle } from './chapter';

describe('Toeristische verhuur service', () => {
  it('Should give the correct title to the theme', () => {
    const vergunningen1: any = [
      {
        caseType: 'Vakantieverhuur vergunningsaanvraag',
        title: 'Vergunning vakantieverhuur',
      },
      {
        caseType: 'B&B - vergunning',
        title: 'Vergunning bed & breakfast',
      },
    ];

    const vergunningen2: any = [
      {
        caseType: 'B&B - vergunning',
        title: 'Vergunning bed & breakfast',
      },
    ];

    const vergunningen3: any = [
      {
        caseType: 'Vakantieverhuur',
        title: 'Geannuleerde verhuur',
      },
    ];
    expect(getToeristischeVerhuurTitle(vergunningen1)).toBe('Vakantieverhuur');
    expect(getToeristischeVerhuurTitle(vergunningen2)).toBe('Bed & Breakfast');
    expect(getToeristischeVerhuurTitle(vergunningen3)).toBe('Vakantieverhuur');
  });
});
