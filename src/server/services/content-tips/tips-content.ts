import {
  hasBijstandsuitkering,
  hasBnBTransitionRight,
  hasBnBVergunning,
  hasDutchNationality,
  hasKidsBetweenAges2And18,
  hasKidsBetweenAges4And11,
  hasOldestKidBornFrom2016,
  hasStadspasGroeneStip,
  hasToeristicheVerhuurVergunningen,
  hasTozo,
  hasValidId,
  hasValidIdForVoting,
  hasValidRecentStadspasRequest,
  hasVerhuurRegistrations,
  is18OrOlder,
  isBetween4and12,
  isBetween17and18,
  isLivingInAmsterdamLessThanNumberOfDays,
  isMarriedOrLivingTogether,
  isMokum,
  isReceivingSubsidy,
  not,
  or,
  previouslyLivingInAmsterdam,
  hasBudget,
} from './predicates';
import { ContentTipSource } from './tip-types';
import { themaId as profileThemaId } from '../../../client/pages/Profile/Profile-thema-config';
import { Themas } from '../../../universal/config/thema';

const DAYS = 90;

export const tips: ContentTipSource[] = [
  {
    id: 'mijn-10',
    active: true,
    dateActiveStart: null,
    dateActiveEnd: null,
    datePublished: '2019-08-18',
    title: 'Tip: Bekijk de afvalpunten in de buurt',
    profileTypes: ['private'] as ProfileType[],
    thema: Themas.AFVAL,
    description: 'Kijk waar het dichtstbijzijnde Afvalpunt is.',
    predicates: [isLivingInAmsterdamLessThanNumberOfDays(DAYS)],
    reason: 'U ziet deze tip omdat u in Amsterdam woont.',
    link: {
      title: 'Kijk op de kaart',
      to: '/buurt',
    },
  },
  {
    id: 'mijn-11',
    active: true,
    dateActiveStart: null,
    dateActiveEnd: null,
    datePublished: '2019-10-22',
    title: 'Tip: Op stap met uw Stadspas',
    profileTypes: ['private'] as ProfileType[],
    thema: Themas.HLI,
    description: 'Haalt u alles uit uw Stadspas?',
    reason: 'U ziet deze tip omdat u een Stadspas hebt aangevraagd.',
    predicates: [hasValidRecentStadspasRequest],
    link: {
      title: 'Bekijk de aanbiedingen',
      to: 'https://www.amsterdam.nl/toerisme-vrije-tijd/stadspas/',
    },
  },

  {
    id: 'mijn-23',
    owner: '',
    dateActiveStart: '2020-11-16',
    dateActiveEnd: '2021-11-16',
    active: true,
    datePublished: '2020-11-25',
    title: 'Tip: Download de 020werkt-app',
    thema: Themas.INKOMEN,
    profileTypes: ['private', 'commercial'] as ProfileType[],
    description:
      'Via de 020werkt-app krijgt u informatie  over werk, inkomen en meedoen in de wijk. De app is gratis, anoniem en makkelijk in gebruik.',
    predicates: [
      or([hasValidRecentStadspasRequest, hasTozo, hasBijstandsuitkering]),
    ],
    reason: 'U ziet deze tip omdat u TOZO, stadspas of bijstandsuitkering hebt',
    link: {
      title: 'Bekijk het filmpje',
      to: 'https://vimeo.com/436735156',
    },
  },
  {
    id: 'mijn-25',
    owner: '',
    dateActiveStart: '2021-01-01',
    dateActiveEnd: '2021-12-31',
    active: true,
    datePublished: '2020-11-26',
    title: 'Tip: Sporten met korting',
    thema: Themas.HLI,
    profileTypes: ['private'] as ProfileType[],
    description:
      'Met de Stadspas krijgt u maximaal € 300 korting op een sportabonnement voor uw kind.',
    predicates: [hasValidRecentStadspasRequest, hasKidsBetweenAges2And18],

    reason:
      'U ziet deze tip omdat u een Stadspas hebt en u een kind tussen de 2 en 18 hebt.',
    link: {
      title: 'Kies een sportvereniging',
      to: 'https://www.amsterdam.nl/svjeugd',
    },
  },
  {
    id: 'mijn-26',
    owner: '',
    dateActiveStart: '2020-11-16',
    dateActiveEnd: '2021-11-16',
    active: true,
    datePublished: '2020-12-20',
    title: 'Tip: Hulp bij geldproblemen',
    thema: Themas.INKOMEN,
    profileTypes: ['private', 'commercial'] as ProfileType[],
    description:
      'Is uw inkomen te laag om alle rekeningen te betalen of hebt u schulden? Meld u aan voor gratis hulp',
    predicates: [
      or([hasValidRecentStadspasRequest, hasTozo, hasBijstandsuitkering]),
    ],
    reason: 'U ziet deze tip omdat u TOZO, stadspas of bijstandsuitkering hebt',
    link: {
      title: 'Vind hulp bij u in de buurt',
      to: 'https://www.buurtteamamsterdam.nl/',
    },
  },
  {
    id: 'mijn-27',
    owner: '',
    dateActiveStart: '2023-10-16',
    dateActiveEnd: '2023-11-20',
    active: true,
    datePublished: '2023-10-16',
    title: 'Tip: Gratis ID-kaart om te stemmen',
    thema: profileThemaId.BRP,
    profileTypes: ['private'] as ProfileType[],
    description:
      'U heeft een geldige ID-kaart of geldig paspoort nodig om te stemmen. Hebt u een Stadspas met groene stip? Dan kunt u gratis een nieuwe ID-kaart krijgen.',
    predicates: [
      not(hasValidIdForVoting),
      is18OrOlder,
      hasStadspasGroeneStip,
      hasDutchNationality,
    ],
    reason:
      'U ziet deze tip omdat u een Stadspas hebt en geen geldige ID-kaart of paspoort',
    link: {
      title: 'Bekijk de voorwaarden',
      to: 'https://www.amsterdam.nl/veelgevraagd/gratis-identiteitskaart-aanvragen-d09a6-kp',
    },
  },
  {
    id: 'mijn-16',
    owner: '',
    dateActiveStart: null,
    dateActiveEnd: null,
    active: true,
    datePublished: '2020-07-03',
    title: 'Tip: Welkom in Amsterdam',
    thema: profileThemaId.BRP,
    profileTypes: ['private'] as ProfileType[],
    description:
      'U woont in Amsterdam, welkom! Blijf op de hoogte van de producten en diensten die u heeft bij de gemeente Amsterdam.nl.',
    predicates: [
      isLivingInAmsterdamLessThanNumberOfDays(DAYS),
      not(previouslyLivingInAmsterdam),
    ],
    reason: 'U ziet deze tip omdat u in Amsterdam woont.',
    link: {
      title: 'Lees meer in deze nieuwsbrief',
      to: 'https://www.amsterdam.nl/nieuwsbrief/',
    },
  },
  {
    id: 'mijn-43',
    owner: '',
    dateActiveStart: '2023-11-23',
    dateActiveEnd: null,
    active: true,
    datePublished: '2023-11-23',
    title: 'Vraag een gratis ID-kaart aan',
    thema: profileThemaId.BRP,
    profileTypes: ['private'] as ProfileType[],
    description:
      'Uw ID-kaart en/of paspoort zijn niet meer geldig. Met de Stadspas krijgt u gratis een nieuwe ID-kaart.',
    predicates: [
      not(hasValidId),
      is18OrOlder,
      hasStadspasGroeneStip,
      hasDutchNationality,
    ],
    reason:
      'U ziet deze tip omdat u een Stadspas hebt en geen geldige ID-kaart of paspoort',
    link: {
      title: 'Bekijk de voorwaarden',
      to: 'https://www.amsterdam.nl/veelgevraagd/gratis-identiteitskaart-aanvragen-d09a6-kp',
    },
  },
  {
    id: 'mijn-44',
    owner: '',
    dateActiveStart: '2024-01-01',
    dateActiveEnd: '2024-12-31',
    active: true,
    datePublished: '2024-04-04',
    title: 'Overgangsregeling: achternaam van kind kiezen',
    thema: profileThemaId.BRP,
    profileTypes: ['private'] as ProfileType[],
    description:
      'Op 1 januari 2024 is de wet Gecombineerde achternaam ingegaan. In 2024 is hiervoor een overgangsregeling. Dit betekent dat u als ouders de achternaam van uw kinderen kunt wijzigen naar een combinatie van allebei uw achternamen.',
    predicates: [hasOldestKidBornFrom2016, isMarriedOrLivingTogether],
    reason:
      'U ziet deze tip omdat uw oudste kind geboren is tussen 1 januari 2016 - 31 december 2023 en u gehuwd bent of een geregisterd partnerschap hebt.',
    link: {
      title: 'Hoe vraagt u het aan?',
      to: 'https://www.amsterdam.nl/veelgevraagd/achternaam-van-kind-kiezen-2f07e',
    },
  },
  {
    id: 'mijn-28',
    owner: '',
    dateActiveStart: null,
    dateActiveEnd: null,
    active: false,
    datePublished: '2021-02-02',
    title: 'Tip: Breng je basis op orde',
    thema: Themas.INKOMEN,
    profileTypes: ['private'] as ProfileType[],
    description:
      'Met Ping Ping weet je precies wat je moet regelen als je 18 wordt, gaat werken, gaat studeren of op jezelf gaat wonen.',
    predicates: [isBetween17and18],
    reason:
      'Je ziet deze tip omdat je net 18 bent geworden of binnenkort 18 wordt',
    link: {
      title: 'Download de app',
      to: 'https://pingping.amsterdam.nl/',
    },
  },
  {
    id: 'mijn-33',
    owner: '',
    dateActiveStart: null,
    dateActiveEnd: '2023-12-31',
    active: true,
    datePublished: '2023-10-15',
    title: 'Tip: Particuliere vakantieverhuur',
    thema: Themas.TOERISTISCHE_VERHUUR,
    profileTypes: ['private'] as ProfileType[],
    description:
      'Bij vakantieverhuur moet u naast het eenmalige registratienummer ook jaarlijks een vergunning bij de gemeente aanvragen. Ook moet u iedere keer dat u de woning verhuurt dit bij ons melden.',
    predicates: [
      hasToeristicheVerhuurVergunningen,
      not(hasVerhuurRegistrations),
    ],
    reason: 'U ziet deze tip omdat u een vergunning vakantieverhuur hebt',
    link: {
      title: 'U leest hier wat de voorwaarden zijn',
      to: 'https://www.amsterdam.nl/vakantieverhuur',
    },
  },
  {
    id: 'mijn-34',
    owner: '',
    dateActiveStart: null,
    dateActiveEnd: '2026-01-07',
    active: true,
    datePublished: '2021-06-15',
    title: 'Tip: Overgangsrecht bij Bed and breakfast',
    thema: Themas.TOERISTISCHE_VERHUUR,
    profileTypes: ['private'] as ProfileType[],
    description:
      'Hebt u uw B&B voor 1 januari 2019 aangevraagd? Dan mag u tot 1 juli 2026 verhuren volgens deze regels.',
    predicates: [hasBnBTransitionRight],
    reason:
      'U ziet deze tip omdat u een B&B vergunning aangevraagd heeft voor 2019',
    link: {
      title: 'Lees hier de voorwaarde',
      to: 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/bedandbreakfast/oude-regels/',
    },
  },
  {
    id: 'mijn-35',
    owner: '',
    dateActiveStart: null,
    dateActiveEnd: '2022-12-31',
    active: true,
    datePublished: '2021-06-15',
    title: 'Tip: Bed & breakfast',
    thema: Themas.TOERISTISCHE_VERHUUR,
    profileTypes: ['private'] as ProfileType[],
    description:
      'Vanaf 1 april 2021 moet u naast een vergunning ook een registratienummer aanvragen voor een bed & breakfast.',
    predicates: [hasBnBVergunning, not(hasVerhuurRegistrations), isMokum],
    reason: 'U ziet deze tip omdat u een Vergunning bed & breakfast hebt',
    link: {
      title: 'U leest hier wat de voorwaarden zijn',
      to: 'https://www.amsterdam.nl/bedandbreakfast ',
    },
  },
  {
    id: 'mijn-36',
    owner: '',
    dateActiveStart: '2021-08-01',
    dateActiveEnd: '2021-12-31',
    active: true,
    datePublished: '2021-08-01',
    title: 'Tip: Sportvergoeding voor kinderen',
    thema: Themas.INKOMEN,
    profileTypes: ['private'] as ProfileType[],
    description:
      'Hebt u moeite om sportactiviteiten voor uw kind te betalen? Regel de vergoeding via Stichting SINA (Samen is niet alleen).',
    predicates: [not(hasStadspasGroeneStip), isReceivingSubsidy],
    reason: 'u heeft een bijstand, TOZO of TONK en geen Stadspas Groene Stip',
    link: {
      title: 'Vraag direct vergoeding aan',
      to: 'https://www.stichtingsina.nl/sport/',
    },
  },
  {
    id: 'mijn-42',
    owner: '',
    dateActiveStart: '2023-07-22',
    dateActiveEnd: '2023-11-30',
    active: true,
    datePublished: '2023-07-28',
    title: 'Tip: Gratis openbaar vervoer voor kinderen',
    predicates: [hasKidsBetweenAges4And11, isMokum],
    profileTypes: ['private'] as ProfileType[],
    isNotification: true,
    thema: Themas.INKOMEN,
    description:
      'Kinderen van 4 tot en met 11 jaar kunnen van 22 juli tot en met 30 november gratis reizen met het openbaar vervoer in Amsterdam. Elk kind heeft een ov-chipkaart nodig.',
    reason:
      'U ziet deze tip omdat u kinderen heeft in de leeftijd van 4 t/m 11 en woonachtig bent in Amsterdam.',
    link: {
      title: 'Hoe vraag je het aan?',
      to: 'https://www.amsterdam.nl/nieuws/nieuwsoverzicht/gratis-ov-kinderen/',
    },
  },

  {
    id: 'mijn-48',
    owner: '',
    dateActiveStart: '2024-07-01',
    dateActiveEnd: '2025-01-04',
    active: true,
    datePublished: '2024-07-01',
    title: 'Gratis openbaar vervoer voor kinderen',
    thema: Themas.INKOMEN,
    profileTypes: ['private'] as ProfileType[],
    description:
      'Amsterdamse kinderen van 4 tot en met 11 jaar kunnen van 20 juli 2024 tot en met 4 januari 2025 gratis reizen met het openbaar vervoer van GVB in Amsterdam. U kunt het gratis reizen voor uw kind vanaf 1 juli 2024 aanvragen.',
    predicates: [hasKidsBetweenAges4And11, isMokum],
    reason:
      'U ziet deze tip omdat u kinderen heeft in de leeftijd van 4 tot en met 11 en in Amsterdam woont.',
    link: {
      title: 'Hoe vraagt u het aan?',
      to: 'https://www.amsterdam.nl/verkeer-vervoer/kinderen-gratis-openbaar-vervoer/#h24924a59-2782-410a-b9fd-d56aedabbdf2',
    },
  },
  {
    id: 'mijn-58',
    owner: '',
    dateActiveStart: '2024-07-01',
    dateActiveEnd: '2025-01-04',
    active: true,
    datePublished: '2024-07-01',
    title: 'Gratis openbaar vervoer voor kinderen',
    thema: Themas.INKOMEN,
    profileTypes: ['private'] as ProfileType[],
    description:
      'Je kunt van 20 juli 2024 tot en met 4 januari 2025 gratis reizen met het openbaar vervoer van GVB in Amsterdam. Hiervoor heb je een ov-chipkaart nodig. Gratis reizen kun je vanaf 1 juli 2024 aanvragen.',
    predicates: [isBetween4and12, isMokum],
    reason:
      'Je ziet deze tip omdat je de leeftijd heb tussen de 4 en 12 jaar en woonachtig bent in Amsterdam',
    link: {
      title: 'Hoe vraag je het aan?',
      to: 'https://www.amsterdam.nl/verkeer-vervoer/kinderen-gratis-openbaar-vervoer/#h24924a59-2782-410a-b9fd-d56aedabbdf2',
    },
  },
  {
    id: 'mijn-59',
    owner: '',
    dateActiveStart: '2025-01-01',
    dateActiveEnd: '2025-03-31',
    active: true,
    datePublished: '2025-01-16',
    title: '€300 korting op witgoed',
    thema: Themas.HLI,
    profileTypes: ['private'] as ProfileType[],
    description:
      'Met je Stadspas krijg je € 300,- korting op een nieuwe energiezuinige wasmachine of koelkast. Dit helpt je om geld te besparen op je energierekening.',
    predicates: [is18OrOlder, hasStadspasGroeneStip, hasBudget('witgoed')],
    reason:
      'U ziet deze tip omdat u ouder bent dan 18 jaar en woonachtig bent in Amsterdam en een Stadspas heeft.',
    link: {
      title: 'Meer informatie en aanvraagformulier',
      to: 'https://www.amsterdam.nl/stadspas/stadspasacties/korting-energiezuinige-wasmachine/',
    },
  },
];
