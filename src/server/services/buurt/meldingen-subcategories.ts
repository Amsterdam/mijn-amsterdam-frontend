import { capitalizeFirstLetter } from '../../../universal/helpers';

export function transformSlugToCategorie(slug: string | undefined) {
  if (!slug) {
    return slug;
  }

  let name = meldingenSubCategories.find((c) => c.id === slug)?.name;

  if (!name) {
    name = capitalizeFirstLetter(slug?.replaceAll(/-/g, ' '));
  }

  return name;
}

export const meldingenSubCategories = [
  {
    id: 'asbest-accu',
    name: 'Asbest / accu',
  },
  {
    id: 'bedrijfsafval',
    name: 'Bedrijfsafval',
  },
  {
    id: 'bruin-en-witgoed',
    name: 'Bruin- en witgoed',
  },
  {
    id: 'container-voor-papier-is-stuk',
    name: 'Container papier kapot',
  },
  {
    id: 'container-voor-papier-is-vol',
    name: 'Container papier vol',
  },
  {
    id: 'container-voor-plastic-afval-is-vol',
    name: 'Container plastic afval vol',
  },
  {
    id: 'container-voor-plastic-afval-is-kapot',
    name: 'Container plastic kapot',
  },
  {
    id: 'puin-sloopafval',
    name: 'Puin- / sloopafval',
  },
  {
    id: 'veeg-zwerfvuil',
    name: 'Veeg- / zwerfvuil',
  },
  {
    id: 'kades',
    name: 'Kademuren',
  },
  {
    id: 'riolering-verstopte-kolk',
    name: 'Riolering - verstopte kolk',
  },
  {
    id: 'bruggen',
    name: 'Vaste brug',
  },
  {
    id: 'verzakking-kades',
    name: 'Verzakking van kades',
  },
  {
    id: 'boom-boomstob',
    name: 'Boom - boomstob',
  },
  {
    id: 'boom',
    name: 'Boom - dood',
  },
  {
    id: 'boom-noodkap',
    name: 'Boom - gevaarlijke situatie',
  },
  {
    id: 'boom-illegale-kap',
    name: 'Boom - illegale kap',
  },
  {
    id: 'boom-aanvraag-plaatsing',
    name: 'Boom - ontbreekt',
  },
  {
    id: 'boom-overig',
    name: 'Boom - overig',
  },
  {
    id: 'boom-afval',
    name: 'Boom - plastic en overig afval',
  },
  {
    id: 'boom-spiegel',
    name: 'Boom - spiegel',
  },
  {
    id: 'boom-stormschade',
    name: 'Boom - stormschade',
  },
  {
    id: 'boom-verzoek-inspectie',
    name: 'Boom - verzoek inspectie',
  },
  {
    id: 'boomziekten-en-plagen',
    name: 'Boom - ziekten en plagen',
  },
  {
    id: 'drijfvuil',
    name: 'Drijfvuil bevaarbaar water',
  },
  {
    id: 'maaien-snoeien',
    name: 'Maaien',
  },
  {
    id: 'oever-kade-steiger',
    name: 'Oever',
  },
  {
    id: 'onkruid',
    name: 'Onkruid in het groen',
  },
  {
    id: 'overig-groen-en-water',
    name: 'Overig groen en water',
  },
  {
    id: 'overig-horecabedrijven',
    name: 'Overig bedrijven / horeca',
  },
  {
    id: 'overlast-door-bezoekers-niet-op-terras',
    name: 'Overlast door bezoekers (niet op terras)',
  },
  {
    id: 'stank-horecabedrijven',
    name: 'Stank horeca/bedrijven',
  },
  {
    id: 'auto-scooter-bromfietswrak',
    name: 'Auto- / scooter- / bromfiets(wrak)',
  },
  {
    id: 'bouw-sloopoverlast',
    name: 'Bouw- / sloopoverlast',
  },
  {
    id: 'deelfiets',
    name: 'Deelscooters en -(bak)fietsen',
  },
  {
    id: 'graffiti-wildplak',
    name: 'Graffiti / wildplak',
  },
  {
    id: 'hinderlijk-geplaatst-object',
    name: 'Hinderlijk geplaatst object',
  },
  {
    id: 'lozing-dumping-bodemverontreiniging',
    name: 'Lozing / dumping / bodemverontreiniging',
  },
  {
    id: 'stank-geluidsoverlast',
    name: 'Stank- / geluidsoverlast',
  },
  {
    id: 'blokkade-van-de-vaarweg',
    name: 'Blokkade van de vaarweg',
  },
  {
    id: 'overig-boten',
    name: 'Boten – overige overlast',
  },
  {
    id: 'overlast-op-het-water-geluid',
    name: 'Geluid op het water',
  },
  {
    id: 'olie-op-het-water',
    name: 'Oppervlaktewaterverontreiniging',
  },
  {
    id: 'overlast-op-het-water-vaargedrag',
    name: 'Overlast op het water - Vaargedrag',
  },
  {
    id: 'overlast-vanaf-het-water',
    name: 'Overlast vanaf het water',
  },
  {
    id: 'scheepvaart-nautisch-toezicht',
    name: 'Vaargedrag - overig',
  },
  {
    id: 'overlast-op-het-water-snel-varen',
    name: 'Vaargedrag - snel varen',
  },
  {
    id: 'overlast-op-het-water-gezonken-boot',
    name: 'Wrak in het water',
  },
  {
    id: 'ratten',
    name: 'Ratten – in de openbare ruimte',
  },
  {
    id: 'ratten-in-en-rond-woning',
    name: 'Ratten – in en rond een woning',
  },
  {
    id: 'daklozen-bedelen',
    name: 'Daklozen / bedelen',
  },
  {
    id: 'drank-en-drugsoverlast',
    name: 'Drank- / drugsoverlast',
  },
  {
    id: 'loslopende-agressieve-honden',
    name: 'Loslopende/agressieve honden',
  },
  {
    id: 'overige-overlast-door-personen',
    name: 'Overige overlast door personen',
  },
  {
    id: 'overlast-door-afsteken-vuurwerk',
    name: 'Overlast door afsteken vuurwerk',
  },
  {
    id: 'overlast-van-taxis-bussen-en-fietstaxis',
    name: "Overlast van taxi's, bussen en fietstaxi's",
  },
  {
    id: 'wildplassen-poepen-overgeven',
    name: 'Wildplassen / poepen / overgeven',
  },
  {
    id: 'drijfvuil-niet-bevaarbaar-water',
    name: 'Drijfvuil niet-bevaarbaar water',
  },
  {
    id: 'gladheid-bladeren',
    name: 'Gladheid door blad',
  },
  {
    id: 'gladheid-olie',
    name: 'Gladheid door olie op de weg',
  },
  {
    id: 'graffitiwildplak',
    name: 'Graffiti / wildplak',
  },
  {
    id: 'onkruid-verharding',
    name: 'Onkruid op verharding',
  },
  {
    id: 'prullenbak-kapot',
    name: 'Prullenbak is kapot',
  },
  {
    id: 'prullenbak-vol',
    name: 'Prullenbak is vol',
  },
  {
    id: 'putrioleringverstopt',
    name: 'Put / riolering verstopt',
  },
  {
    id: 'veegzwerfvuil',
    name: 'Veeg- / zwerfvuil',
  },
  {
    id: 'autom-verzinkbare-palen',
    name: 'Autom. Verzinkbare palen',
  },
  {
    id: 'omleiding-belijning-verkeer',
    name: 'Belijning',
  },
  {
    id: 'fietsrek-nietje',
    name: 'Fietsrek / nietje',
  },
  {
    id: 'gladheid',
    name: 'Gladheid winterdienst',
  },
  {
    id: 'onderhoud-stoep-straat-en-fietspad',
    name: 'Onderhoud stoep, rijweg en parkeerplaats',
  },
  {
    id: 'overig-wegen-verkeer-straatmeubilair',
    name: 'Overig Wegen, verkeer, straatmeubilair',
  },
  {
    id: 'prullenbakkapot',
    name: 'Prullenbak is kapot',
  },
  {
    id: 'put-riool-kapot',
    name: 'Put / Riool kapot',
  },
  {
    id: 'put-riolering-verstopt',
    name: 'Put / riolering verstopt',
  },
  {
    id: 'lantaarnpaal-straatverlichting',
    name: 'Straatverlichting',
  },
  {
    id: 'straatverlichting-openbare-klok',
    name: 'Straatverlichting / openbare klok',
  },
  {
    id: 'tijdelijke-verkeersmaatregelen',
    name: 'Tijdelijke Verkeersmaatregelen',
  },
  {
    id: 'verdeelkasten-bekabeling',
    name: 'Verdeelkasten / bekabeling',
  },
  {
    id: 'verkeersbord-verkeersafzetting',
    name: 'Verkeersbord',
  },
  {
    id: 'verkeersoverlast-verkeerssituaties',
    name: 'Verkeersoverlast / Verkeerssituaties',
  },
  {
    id: 'omleiding',
    name: 'Wegwerkzaamheden',
  },
  {
    id: 'wonen-overig',
    name: 'Overige Wonen',
  },
  {
    id: 'woningdelen-spookburgers',
    name: 'Woningdelen',
  },
  {
    id: 'fraude',
    name: 'Woonfraude',
  },
];
