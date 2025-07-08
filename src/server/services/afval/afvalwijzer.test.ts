import { LatLngLiteral } from 'leaflet';

import type { AfvalFractionData, AFVALSourceData } from './afval.types.ts';
import { exportedForTesting, transformAfvalDataResponse } from './afvalwijzer.ts';

const today = new Date();
const dateStr = today.toISOString();
const dateTimeStr = today.getTime();

describe('Afvalwijzer service', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(dateTimeStr);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test('formatKalenderMelding', () => {
    const fractionData: Partial<AfvalFractionData> = {
      afvalwijzerAfvalkalenderMelding:
        'Kerstbomen kun je van 2 t/m 13 januari kwijt op een <a href="https://kaart.amsterdam.nl/ophaalpunten-kerstbomen-2023">inleverplek in de buurt</a>',
      afvalwijzerAfvalkalenderVan: dateStr,
      afvalwijzerAfvalkalenderTot: dateStr,
    };
    expect(
      exportedForTesting.formatKalenderMelding(
        fractionData as AfvalFractionData
      )
    ).toMatchInlineSnapshot(
      `"Kerstbomen kun je van 2 t/m 13 januari kwijt op een <a href="https://kaart.amsterdam.nl/ophaalpunten-kerstbomen-2023">inleverplek in de buurt</a>"`
    );
  });

  test('formatKalenderMelding.2', () => {
    const fractionData: Partial<AfvalFractionData> = {
      afvalwijzerAfvalkalenderMelding:
        '<p>dingen <a class="test" tabindex href="https://amsterdam.nl">test</a></p>',
      afvalwijzerAfvalkalenderVan: dateStr,
      afvalwijzerAfvalkalenderTot: dateStr,
    };
    expect(
      exportedForTesting.formatKalenderMelding(
        fractionData as AfvalFractionData
      )
    ).toMatchInlineSnapshot(
      `"<p>dingen <a href="https://amsterdam.nl">test</a></p>"`
    );
  });

  test('getAfvalPuntKaartUrl', () => {
    expect(
      exportedForTesting.getAfvalPuntKaartUrl({
        lat: 5.123456789,
        lng: 6.789012345,
      })
    ).toMatchInlineSnapshot(
      `"https://kaart.amsterdam.nl/afvalpunten/#13/5.12346/6.78901/brt/14324///5.12346,6.78901"`
    );
  });

  test('getText', () => {
    expect(exportedForTesting.getText('ophaaldagen:')).toBe('Ophaaldag:');
    expect(exportedForTesting.getText('test:')).toBe('test:');
    expect(exportedForTesting.getText('test:', 'hoi')).toBe('hoi');
    expect(
      exportedForTesting.getHtml(
        'De afvalservice is momenteel niet beschikbaar. Probeer het later nog eens.'
      )
    ).toBe(
      '<p>De Afvalwijzer is momenteel niet beschikbaar. Probeer het later nog eens.<br></br>Woont u in het Centrum of Watergraafsmeer en wilt u een afspraak maken voor het ophalen van grof afval, klik dan op <a href="https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/grofafval.aspx/Inleiding">deze link</a>.</p>'
    );
  });

  test('getBuurtLink', () => {
    const fractionData: Partial<AfvalFractionData> = {
      afvalwijzerFractieCode: 'Textiel',
      afvalwijzerWaar: 'Somewhere in a galaxy far away',
    };
    expect(exportedForTesting.getBuurtLink(fractionData as AfvalFractionData))
      .toMatchInlineSnapshot(`
        {
          "title": "Somewhere in a galaxy far away",
          "to": "/buurt?datasetIds=["afvalcontainers"]&zoom=14&filters={"afvalcontainers"%3A{"fractie_omschrijving"%3A{"values"%3A{"Textiel"%3A1}}}}",
        }
      `);
  });

  test('transformFractionData', () => {
    const fractionData1: Partial<AfvalFractionData> = {
      afvalwijzerPerXWeken: '1',
      afvalwijzerBuitenzettenVanafTot: 'Tussen 06.00 en 07.30 uur',
      afvalwijzerAfvalkalenderOpmerking:
        'Of breng het naar <a href="https://kaart.amsterdam.nl/afvalpunten">een Afvalpunt</a>',
      afvalwijzerFractieCode: 'GA',
      afvalwijzerInstructie2: 'In vuilniszak',
      afvalwijzerOphaaldagen2: 'maandag, donderdag',
      afvalwijzerWaar: 'Aan de rand van de stoep of op de vaste plek',
      afvalwijzerBuitenzetten: 'Tussen 06.00 en 07.30 uur',
      afvalwijzerUrl: 'https://www.afvalgids.nl/afval/inzamelaar/',
      bagNummeraanduidingId: '0363200012145295',
      gbdBuurtCode: 'AF09',
      afvalwijzerButtontekst: 'Hej klik',
      gebruiksdoelWoonfunctie: false,
    };
    const centroid: LatLngLiteral = {
      lat: 5.123456789,
      lng: 6.789012345,
    };
    expect(
      exportedForTesting.transformFractionData(
        fractionData1 as AfvalFractionData,
        centroid
      )
    ).toMatchInlineSnapshot(`
      {
        "buitenzetten": "Tussen 06.00 en 07.30 uur",
        "fractieCode": "GA",
        "gebruiksdoelWoonfunctie": false,
        "instructie": "In vuilniszak",
        "instructieCTA": {
          "title": "Hej klik",
          "to": "https://www.afvalgids.nl/afval/inzamelaar/",
        },
        "kalendermelding": null,
        "ophaaldagen": "Maandag en donderdag",
        "opmerking": "Of breng het naar <a href="https://kaart.amsterdam.nl/afvalpunten">een Afvalpunt</a>",
        "titel": "Grof afval",
        "waar": "Aan de rand van de stoep of op de vaste plek",
      }
    `);
  });

  test('transformAfvalDataResponse', () => {
    const centroid: LatLngLiteral = {
      lat: 5.123456789,
      lng: 6.789012345,
    };
    const fractions = [
      {
        afvalwijzerFractieCode: 'Textiel',
        afvalwijzerWaar: 'Somewhere in a galaxy far away',
      },
      {
        afvalwijzerFractieCode: 'Plastic',
        afvalwijzerWaar: 'Somewhere in time',
      },
      {
        afvalwijzerPerXWeken: '1',
        afvalwijzerBuitenzettenVanafTot: 'Tussen 06.00 en 07.30 uur',
        afvalwijzerAfvalkalenderOpmerking:
          'Of breng het naar <a href="https://kaart.amsterdam.nl/afvalpunten">een Afvalpunt</a>',
        afvalwijzerFractieCode: 'GA',
        afvalwijzerBasisroutetypeOmschrijving: 'Grofvuil Route op afspraak',
        afvalwijzerInstructie2: 'In vuilniszak',
        afvalwijzerOphaaldagen2: ['maandag', 'donderdag'],
        afvalwijzerWaar: 'Aan de rand van de stoep of op de vaste plek',
        afvalwijzerBuitenzetten: 'Tussen 06.00 en 07.30 uur',
        afvalwijzerUrl: 'https://www.afvalgids.nl/afval/inzamelaar/',
        bagNummeraanduidingId: '0363200012145295',
        gbdBuurtCode: 'AF09',
        afvalwijzerButtontekst: 'Hej klik',
        gebruiksdoelWoonfunctie: true,
      },
    ];

    const response: AFVALSourceData = {
      _embedded: { afvalwijzer: fractions as unknown as AfvalFractionData[] },
    };

    expect(transformAfvalDataResponse(response, centroid))
      .toMatchInlineSnapshot(`
        [
          {
            "buitenzetten": null,
            "fractieCode": "Textiel",
            "gebruiksdoelWoonfunctie": undefined,
            "instructie": null,
            "instructieCTA": null,
            "kalendermelding": null,
            "ophaaldagen": "",
            "opmerking": null,
            "titel": "Textiel",
            "waar": "Somewhere in a galaxy far away",
          },
          {
            "buitenzetten": "Tussen 06.00 en 07.30 uur",
            "fractieCode": "GA",
            "gebruiksdoelWoonfunctie": true,
            "instructie": "In vuilniszak",
            "instructieCTA": {
              "title": "Hej klik",
              "to": "https://www.afvalgids.nl/afval/inzamelaar/",
            },
            "kalendermelding": null,
            "ophaaldagen": "Maandag en donderdag",
            "opmerking": "Of breng het naar <a href="https://kaart.amsterdam.nl/afvalpunten">een Afvalpunt</a>",
            "titel": "Grof afval",
            "waar": "Aan de rand van de stoep of op de vaste plek",
          },
        ]
      `);
  });
});
