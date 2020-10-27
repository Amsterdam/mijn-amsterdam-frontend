import proj4 from 'proj4';

// Amsterdam center
export const DEFAULT_LAT: Lat = 52.3717228;
export const DEFAULT_LNG: Lng = 4.8927377;

export const MAP_URL = process.env.REACT_APP_EMBED_MAP_URL;
export const HOOD_LAYERS_CONFIG =
  'lagen=gembek-overig%3A1%7Cgembek-verreg%3A1%7Cgembek-verbes%3A1%7Cgembek-terras%3A1%7Cgembek-splits%3A1%7Cgembek-speela%3A1%7Cgembek-rectif%3A1%7Cgembek-optijd%3A1%7Cgembek-onttre%3A1%7Cgembek-omgver%3A1%7Cgembek-meldin%3A1%7Cgembek-medede%3A1%7Cgembek-ligpla%3A1%7Cgembek-kapver%3A1%7Cgembek-inspra%3A1%7Cgembek-exploi%3A1%7Cgembek-evever%3A1%7Cgembek-drahor%3A1%7Cgembek-bespla%3A1%7Cafvlc-wlokca%3A1%7Cafvlc-wlotxtl%3A1%7Cafvlc-wlopls%3A1%7Cafvlc-wlogls%3A1%7Cafvlc-wloppr%3A1%7Cafvlc-wlorst%3A1%7Cevnmt-tcevt%3A1%7Cparkrn-pvrgeb%3A0';
export const CITY_LAYERS_CONFIG =
  'lagen=gembek-overig%3A0|gembek-verreg%3A0|gembek-verbes%3A0|gembek-terras%3A0|gembek-splits%3A0|gembek-speela%3A0|gembek-rectif%3A0|gembek-optijd%3A0|gembek-onttre%3A0|gembek-omgver%3A0|gembek-meldin%3A0|gembek-medede%3A0|gembek-ligpla%3A0|gembek-kapver%3A0|gembek-inspra%3A0|gembek-exploi%3A0|gembek-evever%3A0|gembek-drahor%3A0|gembek-bespla%3A0|afvlc-wlokca%3A0|afvlc-wlotxtl%3A0|afvlc-wlopls%3A0|afvlc-wlogls%3A0|afvlc-wloppr%3A0|afvlc-wlorst%3A0|evnmt-tcevt%3A0|parkrn-pvrgeb%3A0';

export const CITY_ZOOM = 8;
export const HOOD_ZOOM = 12;
export const LOCATION_ZOOM = 16;

export const projDefinition = `+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.4171,50.3319,465.5524,-0.398957,0.343988,-1.87740,4.0725 +units=m +no_defs`;
export const proj4RD = proj4('WGS84', projDefinition);

export const DATASETS: Record<string, string[]> = {
  afvalcontainers: ['rest', 'papier', 'glas', 'plastic', 'textiel', 'gft'],
  parkeren: ['parkeerzones', 'parkeerzones_uitzondering'],
  bekendmakingen: [
    'apv vergunning',
    'evenementenvergunning',
    'exploitatievergunning',
    'inspraak',
    'kapvergunning',
    'ligplaatsvergunning',
    'meldingen',
    'omgevingsvergunning',
    'onttrekkingsvergunning',
    'openingstijden',
    'rectificatie',
    'speelautomaten',
    'splitsingsvergunning',
    'terrasvergunning',
    'verkeersbesluit',
    'overig',
    'geluidvergunning',
    'bestemmingsplan',
    'drank- en horecavergunning',
  ],
  evenementen: ['evenementen'],
  sport: [
    'zwembad',
    'sportpark',
    'sportveld',
    'gymsportzaal',
    'sporthal',
    'sportaanbieder',
    'openbaresportplek',
    'hardlooproute',
  ],
};
