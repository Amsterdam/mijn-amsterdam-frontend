export function transformSlugToCategorie(slug: string | undefined) {
  return meldingenSubCategories.find((c) => c.id === slug)?.name;
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
    id: 'container-bijplaatsing',
    name: 'Container bijplaatsing',
  },
  {
    id: 'container-glas-kapot',
    name: 'Container glas kapot',
  },
  {
    id: 'container-glas-vol',
    name: 'Container glas vol',
  },
  {
    id: 'container-is-kapot',
    name: 'Container is kapot',
  },
  {
    id: 'container-is-vol',
    name: 'Container is vol',
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
    id: 'grofvuil',
    name: 'Grofvuil',
  },
  {
    id: 'handhaving-op-afval',
    name: 'Handhaving op afval',
  },
  {
    id: 'huisafval',
    name: 'Huisafval',
  },
  {
    id: 'kerstbomen',
    name: 'Kerstbomen',
  },
  {
    id: 'overig-afval',
    name: 'Overig afval',
  },
  {
    id: 'prullenbak-is-kapot',
    name: 'Prullenbak is kapot',
  },
  {
    id: 'prullenbak-is-vol',
    name: 'Prullenbak is vol',
  },
  {
    id: 'puin-sloopafval',
    name: 'Puin- / sloopafval',
  },
  {
    id: 'rolcontainer-is-kapot',
    name: 'Rolcontainer is kapot',
  },
  {
    id: 'rolcontainer-is-vol',
    name: 'Rolcontainer is vol',
  },
  {
    id: 'veeg-zwerfvuil',
    name: 'Veeg- / zwerfvuil',
  },
  {
    id: 'afwatering-brug',
    name: 'Afwatering brug',
  },
  {
    id: 'brug-bediening',
    name: 'Beweegbare brug',
  },
  {
    id: 'kades',
    name: 'Kademuren',
  },
  {
    id: 'oevers',
    name: 'Oevers',
  },
  {
    id: 'riolering-verstopte-kolk',
    name: 'Riolering - verstopte kolk',
  },
  {
    id: 'sluis',
    name: 'Sluis',
  },
  {
    id: 'steiger',
    name: 'Steiger',
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
    id: 'watergangen',
    name: 'Watergangen',
  },
  {
    id: 'vermoeden',
    name: 'Vermoeden',
  },
  {
    id: 'beplanting',
    name: 'Beplanting',
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
    id: 'eikenprocessierups',
    name: 'Eikenprocessierups',
  },
  {
    id: 'japanse-duizendknoop',
    name: 'Japanse duizendknoop',
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
    id: 'snoeien',
    name: 'Snoeien',
  },
  {
    id: 'overig',
    name: 'Overig',
  },
  {
    id: 'overige-dienstverlening',
    name: 'Overige dienstverlening',
  },
  {
    id: 'geluidsoverlast-installaties',
    name: 'Geluidsoverlast installaties',
  },
  {
    id: 'geluidsoverlast-muziek',
    name: 'Geluidsoverlast muziek',
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
    id: 'overlast-terrassen',
    name: 'Overlast terrassen',
  },
  {
    id: 'stank-horecabedrijven',
    name: 'Stank horeca/bedrijven',
  },
  {
    id: 'stankoverlast',
    name: 'Stankoverlast',
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
    id: 'fietswrak',
    name: 'Fietswrak',
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
    id: 'markten',
    name: 'Markten',
  },
  {
    id: 'overig-openbare-ruimte',
    name: 'Overig openbare ruimte',
  },
  {
    id: 'parkeeroverlast',
    name: 'Parkeeroverlast',
  },
  {
    id: 'stank-geluidsoverlast',
    name: 'Stank- / geluidsoverlast',
  },
  {
    id: 'hondenpoep',
    name: 'Uitwerpselen',
  },
  {
    id: 'wegsleep',
    name: 'Wegsleep',
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
    id: 'dode-dieren',
    name: 'Dode dieren',
  },
  {
    id: 'duiven',
    name: 'Duiven',
  },
  {
    id: 'ganzen',
    name: 'Ganzen',
  },
  {
    id: 'meeuwen',
    name: 'Meeuwen',
  },
  {
    id: 'overig-dieren',
    name: 'Overig dieren',
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
    id: 'wespen',
    name: 'Wespen',
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
    id: 'jongerenoverlast',
    name: 'Jongerenoverlast',
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
    id: 'personen-op-het-water',
    name: 'Personen op het water',
  },
  {
    id: 'vuurwerkoverlast',
    name: 'Vuurwerkoverlast',
  },
  {
    id: 'wildplassen-poepen-overgeven',
    name: 'Wildplassen / poepen / overgeven',
  },
  {
    id: 'drijfvuil-bevaarbaar-water',
    name: 'Drijfvuil bevaarbaar water',
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
    id: 'gladheid-winterdienst',
    name: 'Gladheid winterdienst',
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
    id: 'uitwerpselen',
    name: 'Uitwerpselen',
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
    id: 'bewegwijzering',
    name: 'Bewegwijzering',
  },
  {
    id: 'brug',
    name: 'Brug',
  },
  {
    id: 'camerasystemen',
    name: 'Camerasystemen',
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
    id: 'klok',
    name: 'Klok',
  },
  {
    id: 'lichthinder',
    name: 'Lichthinder',
  },
  {
    id: 'onderhoud-fietspad',
    name: 'Onderhoud fietspad',
  },
  {
    id: 'onderhoud-stoep-straat-en-fietspad',
    name: 'Onderhoud stoep, rijweg en parkeerplaats',
  },
  {
    id: 'oplaadpunt',
    name: 'Oplaadpunt',
  },
  {
    id: 'overig-wegen-verkeer-straatmeubilair',
    name: 'Overig Wegen, verkeer, straatmeubilair',
  },
  {
    id: 'parkeer-verwijssysteem',
    name: 'Parkeer verwijssysteem',
  },
  {
    id: 'parkeerautomaten',
    name: 'Parkeerautomaten',
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
    id: 'speelplaats',
    name: 'Speelplaats',
  },
  {
    id: 'sportvoorziening',
    name: 'Sportvoorziening',
  },
  {
    id: 'stadsplattegronden',
    name: 'Stadsplattegronden',
  },
  {
    id: 'straatmeubilair',
    name: 'Straatmeubilair',
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
    id: 'verkeerslicht',
    name: 'Verkeerslicht',
  },
  {
    id: 'verkeersoverlast',
    name: 'Verkeersoverlast',
  },
  {
    id: 'verkeersoverlast-verkeerssituaties',
    name: 'Verkeersoverlast / Verkeerssituaties',
  },
  {
    id: 'verkeerssituaties',
    name: 'Verkeerssituaties',
  },
  {
    id: 'verlichting-netstoring',
    name: 'Verlichting netstoring',
  },
  {
    id: 'omleiding',
    name: 'Wegwerkzaamheden',
  },
  {
    id: 'leegstand',
    name: 'Leegstand',
  },
  {
    id: 'onderhuur-en-adreskwaliteit',
    name: 'Onderhuur en adreskwaliteit',
  },
  {
    id: 'wonen-overig',
    name: 'Overige Wonen',
  },
  {
    id: 'vakantieverhuur',
    name: 'Vakantieverhuur',
  },
  {
    id: 'wonen-ondermijning',
    name: 'Wonen ondermijning',
  },
  {
    id: 'woningdelen-spookburgers',
    name: 'Woningdelen',
  },
  {
    id: 'woningkwaliteit',
    name: 'Woningkwaliteit',
  },
  {
    id: 'fraude',
    name: 'Woonfraude',
  },
];
