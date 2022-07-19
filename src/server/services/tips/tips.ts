import { LinkProps } from '../../../universal/types';
import {
  hasStadspasGroeneStip,
  hasValidId,
  hasValidStadspasRequest,
  is18OrOlder,
  isLivingInAmsterdamSindsNumberOfDays,
  not,
  TipsPredicateFN,
} from './predicates';

export type Tip = {
  id: string;
  owner?: string;
  dateActiveStart: string | null;
  dateActiveEnd: string | null;
  active: boolean;
  priority: number;
  datePublished: string;
  title: string;
  audience: string[];
  showOnUrls?: string[];
  description: string;
  predicates?: TipsPredicateFN[];
  reason?: string;
  isPersonalized?: boolean;
  link: LinkProps;
  imgUrl: string;
};

export const tips: Tip[] = [
  {
    id: 'mijn-27',
    owner: '',
    dateActiveStart: '2021-02-02',
    dateActiveEnd: '2021-03-10',
    active: true,
    priority: 80,
    datePublished: '2021-02-02',
    title: 'Gratis ID-kaart om te stemmen',
    audience: ['persoonlijk'],
    showOnUrls: ['/inkomen', '/dashboard'],
    description:
      'U hebt een geldige ID-kaart of geldig paspoort nodig om te stemmen. Hebt u een Stadspas met groene stip? Dan kunt u gratis een nieuwe ID-kaart krijgen.',
    predicates: [is18OrOlder, not(hasValidId), hasStadspasGroeneStip],
    reason:
      'U ziet deze tip omdat u een Stadspas met groene stip hebt en geen geldige ID-kaart of paspoort',
    isPersonalized: true,
    link: {
      title: 'Bekijk de voorwaarden',
      to: 'https://www.amsterdam.nl/veelgevraagd/?caseid=%7B0391171C-BA2E-40D2-8CBE-F013192D09A6%7D',
    },
    imgUrl: '/tips/static/tip_images/stemmen2021.jpg',
  },
  {
    id: 'mijn-2',
    active: true,
    dateActiveStart: null,
    dateActiveEnd: null,
    priority: 20,
    datePublished: '2019-07-24',
    title: 'Vrijwilliger worden?',
    audience: ['persoonlijk'],
    description:
      'Er is altijd vrijwilligerswerk dat bij u past. Bekijk de vacatures.',
    link: {
      title: 'Vrijwilligerscentrale Amsterdam',
      to: 'https://www.vca.nu/vacaturebank/',
    },
    imgUrl: 'api/tips/static/tip_images/vrijwilliger.jpg',
  },
  {
    id: 'mijn-3',
    active: true,
    dateActiveStart: null,
    dateActiveEnd: null,
    priority: 25,
    datePublished: '2019-07-24',
    title: 'Grofvuil',
    audience: ['persoonlijk'],
    description:
      'Op een Afvalpunt kunt u uw grofvuil, klein chemisch afval en tweedehands spullen inleveren.',
    link: {
      title: 'Adressen Afvalpunten',
      to: 'https://www.amsterdam.nl/afval/grofvuil/grofvuil-wegbrengen/',
    },
    imgUrl: 'api/tips/static/tip_images/grofvuil.jpg',
  },
  {
    id: 'mijn-4',
    active: true,
    dateActiveStart: null,
    dateActiveEnd: null,
    priority: 20,
    datePublished: '2019-07-24',
    title: 'Geveltuin',
    audience: ['persoonlijk'],
    description:
      'Bekijk hoe u gratis een geveltuin kunt aanvragen bij uw stadsdeel. Of hoe u de geveltuin kunt laten verwijderen.',
    link: {
      title: 'Meer informatie',
      to: 'https://www.amsterdam.nl/wonen-leefomgeving/medebeheer/geveltuin-aanvragen/',
    },
    imgUrl: 'api/tips/static/tip_images/geveltuin.jpg',
  },
  {
    id: 'mijn-10',
    active: true,
    dateActiveStart: null,
    dateActiveEnd: null,
    priority: 70,
    datePublished: '2019-08-18',
    title: 'Bekijk de afvalpunten in de buurt',
    audience: ['persoonlijk'],
    description: 'Kijk waar het dichtstbijzijnde Afvalpunt is.',
    predicates: [isLivingInAmsterdamSindsNumberOfDays(3)],
    reason: 'U ziet deze tip omdat u net bent verhuisd',
    isPersonalized: true,
    link: {
      title: 'Kijk op de kaart',
      to: '/buurt',
    },
    imgUrl: '/api/tips/static/tip_images/afvalpunt.jpg',
  },
  {
    id: 'mijn-11',
    active: true,
    dateActiveStart: null,
    dateActiveEnd: null,
    priority: 70,
    datePublished: '2019-10-22',
    title: 'Op stap met uw Stadspas',
    audience: ['persoonlijk'],
    description: 'Haalt u alles uit uw Stadspas?',
    predicates: [hasValidStadspasRequest],
    isPersonalized: true,
    link: {
      title: 'Bekijk de aanbiedingen',
      to: 'https://www.amsterdam.nl/toerisme-vrije-tijd/stadspas/',
    },
    imgUrl: '/api/tips/static/tip_images/stadspas.jpg',
  },
  {
    id: 'mijn-12',
    owner: 'Daniel Nagel',
    dateActiveStart: '2020-04-01',
    dateActiveEnd: null,
    active: true,
    priority: 70,
    datePublished: '2020-06-15',
    title: 'Amsterdammers helpen Amsterdammers',
    audience: ['persoonlijk'],
    description:
      'Maakt u mondkapjes? Of zoekt u manieren om te blijven bewegen? Amsterdammers helpen elkaar tijdens de coronacrisis.',

    isPersonalized: false,
    link: {
      title: 'Vind elkaar',
      to: 'https://wijamsterdam.nl/',
    },
    imgUrl: '/api/tips/static/tip_images/mondkapjes.jpg',
  },
  {
    id: 'mijn-13',

    dateActiveStart: '2020-05-18',
    dateActiveEnd: '2020-08-18',
    active: true,
    priority: 70,
    datePublished: '2020-06-15',
    title: 'Gratis energieadvies',
    audience: ['persoonlijk'],
    description:
      'Werkt u thuis? Dan neemt uw energieverbruik toe. Wij geven gratis energieadvies aan Verenigingen van Eigenaren.',

    isPersonalized: false,
    link: {
      title: 'Kijk hoe u energie kunt besparen',
      to: 'https://www.amsterdam.nl/wonen-leefomgeving/duurzaam-amsterdam/vve-advies/',
    },
    imgUrl: '/api/tips/static/tip_images/energieadvies.jpg',
  },
  {
    id: 'mijn-14',
    owner: 'OIS / Chief Science Officer',
    dateActiveStart: '2020-05-26',
    dateActiveEnd: null,
    active: true,
    priority: 70,
    datePublished: '2020-06-15',
    title: 'Voor nieuwsgierige Amsterdammers',
    audience: ['persoonlijk'],
    description:
      'Bent u op zoek naar gegevens of onderzoek over uw stad of buurt? U vindt al deze informatie nu op 1 website.',

    isPersonalized: false,
    link: {
      title: 'Kijk op openresearch.amsterdam',
      to: 'https://openresearch.amsterdam/',
    },
    imgUrl: '/api/tips/static/tip_images/openresearch.jpg',
  },
  {
    id: 'mijn-15',
    owner: 'Diana Le',
    dateActiveStart: '2020-05-20',
    dateActiveEnd: '2020-08-20',
    active: false,
    priority: 70,
    datePublished: '2020-06-15',
    title: 'Gratis uw fiets laten graveren',
    audience: ['persoonlijk'],
    description:
      'Voorkom diefstal van uw fiets en laat een code in uw frame graveren.',

    isPersonalized: false,
    link: {
      title: 'Kijk wanneer de graveeracties zijn',
      to: 'https://www.amsterdam.nl/parkeren-verkeer/fiets/fietsdepot/fiets-graveren/',
    },
    imgUrl: '/api/tips/static/tip_images/fietsgraveren.jpg',
  },
];
