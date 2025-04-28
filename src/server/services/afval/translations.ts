// Labels from https://www.amsterdam.nl/aspx/read.aspx?AppIdt=reference-lists&SitIdt=18
export const labels: Record<string, { text: string; html?: string }> = {
  'Zoek informatie afval': { text: 'Zoeken' },
  huisvuil: { text: 'Restafval' },
  grofvuil: { text: 'Grof afval', html: '<p>Grofvuil tekst</p>' },
  'Straatnaam of postcode en huisnummer (zonder toevoeging)': {
    text: 'Vul uw adres met huisnummer in',
  },
  'Zoek op adres': { text: 'Zoek uw adres op' },
  'ophaaldagen:': { text: 'Ophaaldag:' },
  'aanbieden:': { text: 'Aanbieden:' },
  'Maak een afspraak via {{formlink}} of bel 14 020': {
    text: 'Maak een afspraak {{formlink}} of bel 14 020',
  },
  'ons afspraakformulier': { text: 'online' },
  'Aanbiedwijze:': { text: 'Hoe:' },
  Afvalzoeker: { text: 'Afvalwijzer' },
  'Maak een afspraak via': { text: 'Maak een afspraak' },
  'Afvalinformatie voor [adres]': { text: 'Informatie [adres]' },
  'Request failed with status code 500': {
    text: 'Er is een fout opgetreden. Probeer het later nog eens.',
  },
  'vanaf [fromDay] [fromTime] uur tot [untilDay] [untilTime] uur': {
    text: '[fromDay] vanaf [fromTime] uur tot [untilDay] [untilTime] uur',
  },
  '[day] vanaf [fromTime] uur': { text: '[day] vanaf [fromTime] uur' },
  'afval.nearby.container.text {{containerLink}}': {
    text: 'Zoekt u een container voor glas, papier en karton, textiel, gft, brood of restafval? Kijk dan op {{containerLink}} voor een container in de buurt.',
  },
  'afval.nearby.garbagepoint.text {{containerLink}}': {
    text: 'Op een Afvalpunt kunt u gratis uw grof afval, klein chemisch afval en spullen voor de kringloop kwijt. Kijk op {{containerLink}} voor een Afvalpunt in de buurt.',
  },
  'de container kaart': { text: 'de kaart' },
  'de afvalpunt kaart': { text: 'de kaart' },
  'particulier-N': {
    text: 'https://www.amsterdam.nl/afval/afvalinformatie/extra-informatie-noord',
  },
  'particulier-S': {
    text: 'https://www.amsterdam.nl/afval/afvalinformatie/extra-informatie-weesp',
  },
  'particulier-T': {
    text: 'https://www.amsterdam.nl/afval/afvalinformatie/extra-informatie-zuidoost',
  },
  Rest: { text: 'Restafval' },
  'Resultaat voor': { text: 'Informatie' },
  vrijdag: { text: 'Vrijdag' },
  woensdag: { text: 'Woensdag' },
  'woensdag, zaterdag': { text: 'Woensdag en zaterdag' },
  zaterdag: { text: 'Zaterdag' },
  zondag: { text: 'Zondag' },
  maandag: { text: 'Maandag' },
  'De afvalservice is momenteel niet beschikbaar. Probeer het later nog eens.':
    {
      text: 'De afvalservice is momenteel niet beschikbaar. Probeer het later nog eens.',
      html: '<p>De Afvalwijzer is momenteel niet beschikbaar. Probeer het later nog eens.<br></br>Woont u in het Centrum of Watergraafsmeer en wilt u een afspraak maken voor het ophalen van grof afval, klik dan op <a href="https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/grofafval.aspx/Inleiding">deze link</a>.</p>',
    },
  'Wegbrengen naar een Afvalpunt of buiten zetten': {
    text: 'Wegbrengen naar een Afvalpunt of buiten zetten',
    html: '<p>Wegbrengen naar een <a href="https://www.amsterdam.nl/afval/spullen-wegbrengen-naar-een-recyclepunt/">Afvalpunt</a> of buiten zetten</p>',
  },
  'Dit is een bedrijfspand.': { text: 'Dit is geen woonadres.' },
  'In de container voor gfe. Dit kan alleen met een pas.': {
    text: 'In de container voor gfe. Dit kan alleen met een pas.',
    html: '<p>In de container voor gfe. Dit kan alleen met <a href="https://www.amsterdam.nl/gfe">een pas</a>. </p>',
  },
  'Huishoudelijk afval': {
    text: 'Restafval, papier/karton, gfe/t, glas en textiel',
    html: '<p>Restafval, papier/karton, gfe/t, glas en textiel</p>',
  },
  'Ik heb minder dan 9 zakken afval per week en betaal reinigingsrecht.': {
    text: 'Ik heb maximaal 9 zakken afval per week en betaal reinigingsrecht.',
  },
  'dinsdag, donderdag': { text: 'Dinsdag en donderdag' },
  'bedrijfsafval-T': {
    text: 'https://www.amsterdam.nl/afval/afvalinformatie/bedrijfsafval-zuidoost/',
  },
  'De gemeente haalt uw afval aan huis op.': {
    text: 'De gemeente haalt uw afval aan huis op.',
    html: '<p>De gemeente haalt uw afval aan huis op. Lees <a href="https://www.amsterdam.nl/afval/proef-afval-ophalen-afspraak/">hoe dit werkt</a>.</p>',
  },
  dinsdag: { text: 'Dinsdag' },
  'dinsdag, vrijdag': { text: 'Dinsdag en vrijdag' },
  'Dit is een bedrijfspand.Hier klopt iets niet': {
    text: 'Klopt dit niet? Geef het door',
  },
  donderdag: { text: 'Donderdag' },
  GFT: { text: 'Groente-, fruit-, etensresten en tuinafval (gfe/t)' },
  'https://formulieren.amsterdam.nl/TriplEforms/': {
    text: 'https://formulieren.amsterdam.nl/TriplEforms/',
  },
  'In de container voor textiel of bij een Afvalpunt': {
    text: 'Link',
    html: '<div>In de container voor textiel of bij een</div>\r\n<div>\r\n  <a href="https://kaart.amsterdam.nl/afvalpunten">Afvalpunt</a>\r\n</div>',
  },
  'Klopt de informatie niet? Geef het door.': {
    text: 'Klopt dit niet? Geef het door',
  },
  'maandag, dinsdag, woensdag, donderdag, vrijdag': {
    text: 'Maandag tot en met vrijdag',
  },
  'maandag, donderdag': { text: 'Maandag en donderdag' },
  'maandag, vrijdag': { text: 'Maandag en vrijdag' },
  'particulier-A': {
    text: 'https://www.amsterdam.nl/afval/afvalinformatie/extra-informatie-centrum',
  },
  'particulier-B': {
    text: 'https://www.amsterdam.nl/afval/afvalinformatie/extra-informatie-westpoort',
  },
  'particulier-E': {
    text: 'https://www.amsterdam.nl/afval/afvalinformatie/extra-informatie-west',
  },
  'particulier-F': {
    text: 'https://www.amsterdam.nl/afval/afvalinformatie/extra-informatie-nieuw-west',
  },
  'particulier-K': {
    text: 'https://www.amsterdam.nl/afval/afvalinformatie/extra-informatie-zuid',
  },
  'particulier-M': {
    text: 'https://www.amsterdam.nl/afval/afvalinformatie/extra-informatie-oost',
  },
  GA: { text: 'Grof afval' },
  'maandag, dinsdag, woensdag, donderdag, vrijdag, zaterdag': {
    text: 'Maandag tot en met zaterdag',
  },
  Papier: { text: 'Papier en karton' },
  'bedrijfsafval-A': {
    text: 'https://www.amsterdam.nl/afval/afvalinformatie/bedrijfsafval-centrum/',
  },
  'bedrijfsafval-B': {
    text: 'https://www.amsterdam.nl/afval/afvalinformatie/bedrijfsafval-westpoort/',
  },
  'bedrijfsafval-E': {
    text: 'https://www.amsterdam.nl/afval/afvalinformatie/bedrijfsafval-west/',
  },
  'bedrijfsafval-F': {
    text: 'https://www.amsterdam.nl/afval/afvalinformatie/bedrijfsafval-nieuw-west/',
  },
  'bedrijfsafval-K': {
    text: 'https://www.amsterdam.nl/afval/afvalinformatie/bedrijfsafval-zuid/',
  },
  'bedrijfsafval-M': {
    text: 'https://www.amsterdam.nl/afval/afvalinformatie/bedrijfsafval-oost/',
  },
  'bedrijfsafval-N': {
    text: 'https://www.amsterdam.nl/afval/afvalinformatie/bedrijfsafval-noord/',
  },
  'bedrijfsafval-S': {
    text: 'https://www.amsterdam.nl/afval/afvalinformatie/bedrijfsafval-weesp/',
  },
};
