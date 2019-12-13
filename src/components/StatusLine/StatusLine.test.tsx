import React from 'react';
import { shallow } from 'enzyme';
import StatusLine from './StatusLine';
import { formatWmoApiResponse, WmoItem } from 'data-formatting/wmo';

describe('StatusLine', () => {
  it('Renders the correct html', () => {
    const [item]: WmoItem[] = formatWmoApiResponse(
      [
        {
          Omschrijving: 'ambulante ondersteuning',
          Wet: 1,
          Actueel: false,
          Volume: 1,
          Eenheid: '82',
          Frequentie: 3,
          Leveringsvorm: 'ZIN',
          Omvang: '1 stuks per vier weken',
          Leverancier: '2Learn B.V.',
          Checkdatum: '2019-01-10T00:00:00',
          Voorzieningsoortcode: 'AO5',
          Voorzieningcode: '021',
          Aanvraagdatum: '2018-02-21T00:00:00',
          Beschikkingsdatum: '2018-03-22T00:00:00',
          VoorzieningIngangsdatum: '2018-02-21T00:00:00',
          VoorzieningEinddatum: '2019-02-21T00:00:00',
          Levering: {
            Opdrachtdatum: '2018-03-22T00:00:00',
            Leverancier: 'Z00187',
            IngangsdatumGeldigheid: '2018-02-21T00:00:00',
            EinddatumGeldigheid: '2019-02-21T00:00:00',
            StartdatumLeverancier: '2018-02-21T00:00:00',
            EinddatumLeverancier: '2019-02-21T00:00:00',
          },
        },
      ],
      new Date()
    );
    expect(
      shallow(
        <StatusLine
          id="unittest"
          trackCategory="unittest"
          items={item.process}
        />
      ).html()
    ).toMatchSnapshot();
  });
});
