import React from 'react';
import { shallow } from 'enzyme';
import StatusLine from './StatusLine';
import { formatWmoApiResponse, WmoItem } from 'data-formatting/wmo';
import { formatFocusProduct } from '../../data-formatting/focus';

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

  it('Renders the correct html for a different item', () => {
    const item = formatFocusProduct(
      {
        _id: '0-2',
        _meest_recent: 'herstelTermijn',
        dienstverleningstermijn: 42,
        naam: 'Stadspas xxxx herstelTermijn',
        processtappen: {
          aanvraag: {
            datum: '2019-07-03T15:05:52+02:00',
            document: [
              {
                $ref: 'focus/document?id=4400000004&isBulk=true&isDms=false',
                id: 4400000004,
                isBulk: true,
                isDms: false,
                omschrijving: 'Aanvraag Stadspas (papier)',
              },
              {
                $ref: 'focus/document?id=4400000005&isBulk=true&isDms=false',
                id: 4400000005,
                isBulk: true,
                isDms: false,
                omschrijving: 'Aanvraag Stadspas (balie)',
              },
              {
                $ref: 'focus/document?id=4400000006&isBulk=true&isDms=false',
                id: 4400000006,
                isBulk: true,
                isDms: false,
                omschrijving: 'Aanvraag Stadspas (digitaal)',
              },
            ],
          },
          beslissing: null,
          bezwaar: null,
          herstelTermijn: {
            aantalDagenHerstelTermijn: '10',
            datum: '2019-07-06T15:05:52+02:00',
            document: [],
          },
          inBehandeling: {
            datum: '2019-07-04T15:05:52+02:00',
            document: [],
          },
        },
        soortProduct: 'Minimafonds',
      },
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
