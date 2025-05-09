import {
  type AanbiedenDiensten,
  type ERVV,
  type EvenementMelding,
  type EvenementVergunning,
  type Flyeren,
  type Omzettingsvergunning,
  type OnttrekkingsvergunningSloop,
  type Onttrekkingsvergunning,
  type RVVHeleStad,
  type RVVSloterweg,
  type Samenvoegingsvergunning,
  type Splitsingsvergunning,
  type TVMRVVObject,
  type VormenVanWoonruimte,
  type ZwaarVerkeer,
  caseTypeVergunningen,
  type Nachtwerkontheffing,
  type Ligplaatsvergunning,
  type WerkzaamhedenEnVervoerOpStraat,
  type WVOSActiviteit,
  type Straatartiesten,
} from './config-and-types';
import { IS_PRODUCTION } from '../../../universal/config/env';
import {
  SELECT_FIELDS_TRANSFORM_BASE,
  transformDecision,
  description,
  dateStart,
  dateEnd,
  timeEnd,
  timeStart,
  kentekens,
  location,
  MA_DECISION_ZIE_BESLUIT,
} from '../decos/decos-field-transformers';
import { getCustomTitleForDecosZaakWithLicensePlates } from '../decos/decos-helpers';
import {
  DecosZaakTransformer,
  DecosFieldNameSource,
} from '../decos/decos-types';

const TVMRVVObject: DecosZaakTransformer<TVMRVVObject> = {
  isActive: true,
  caseType: caseTypeVergunningen.TVMRVVObject,
  title: 'Tijdelijke verkeersmaatregel (TVM-RVV-Object)',
  requirePayment: true,
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    dfunction: transformDecision({
      Verleend: [
        'verleend met borden',
        'verleend zonder bebording',
        'verleend zonder borden',
      ],
    }),
    subject1: description,
    date6: dateStart,
    date7: dateEnd,
    text6: location,
    text10: timeStart,
    text13: timeEnd,
    text9: kentekens,
  },
  async afterTransform(vergunning) {
    if (
      'dateEnd' in vergunning &&
      'dateStart' in vergunning &&
      !vergunning.dateEnd
    ) {
      vergunning.dateEnd = vergunning.dateStart;
    }

    vergunning.title = getCustomTitleForDecosZaakWithLicensePlates(vergunning);

    return vergunning;
  },
};

const EvenementMelding: DecosZaakTransformer<EvenementMelding> = {
  isActive: true,
  caseType: caseTypeVergunningen.EvenementMelding,
  title: 'Evenement melding',
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    dfunction: transformDecision({
      Toegestaan: [
        'Verleend',
        'Verleend (Bijzonder/Bewaren)',
        'Verleend zonder borden',
      ],
      'Niet toegestaan': ['Niet verleend'],
      '': ['Nog niet  bekend', 'Nog niet bekend'],
    }),
    date6: dateStart,
    date7: dateEnd,
    text6: location,
    text7: timeStart,
    text8: timeEnd,
  },
};

const EvenementVergunning: DecosZaakTransformer<EvenementVergunning> = {
  isActive: true,
  caseType: caseTypeVergunningen.EvenementVergunning,
  title: caseTypeVergunningen.EvenementVergunning,
  fetchWorkflowStatusDatesFor: [
    {
      status: 'In behandeling',
      decosActionCode: 'Evenement vergunning - Behandelen',
    },
  ],
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    dfunction: transformDecision({
      Verleend: ['Verleend (Bijzonder/Bewaren)', 'Verleend zonder borden'],
      '': ['Nog niet bekend', 'Nog niet  bekend'],
    }),
    subject1: description,
    date6: dateStart,
    date7: dateEnd,
    text6: location,
    text7: timeStart,
    text8: timeEnd,
  },
};

const Omzettingsvergunning: DecosZaakTransformer<Omzettingsvergunning> = {
  isActive: true,
  caseType: caseTypeVergunningen.Omzettingsvergunning,
  title: 'Vergunning voor kamerverhuur (omzettingsvergunning)',
  fetchWorkflowStatusDatesFor: [
    {
      status: 'In behandeling',
      decosActionCode: 'Omzettingsvergunning - Behandelen',
    },
  ],
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    dfunction: transformDecision({
      Verleend: ['Verleend zonder borden'],
      '': ['Nog niet bekend', 'Nog niet  bekend'],
    }),
    text6: location,
  },
};

const ERVV_TVM: DecosZaakTransformer<ERVV> = {
  isActive: true,
  caseType: caseTypeVergunningen.ERVV,
  title: 'e-RVV (Gratis verkeersontheffing voor elektrisch goederenvervoer)',
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    subject1: description,
    dfunction: transformDecision({
      '': ['Nog niet bekend', 'Nog niet  bekend'],
      Verleend: [
        'Verleend met borden',
        'Verleend met borden en Fietsenrekken verwijderen',
        'Verleend met Fietsenrekken verwijderen',
        'Verleend zonder bebording',
        'Verleend zonder borden',
      ],
    }),
    text6: location,
    date6: dateStart,
    date7: dateEnd,
    text10: timeStart,
    text13: timeEnd,
  },
};

const Flyeren: DecosZaakTransformer<Flyeren> = {
  isActive: true,
  caseType: caseTypeVergunningen.Flyeren,
  title: 'Verspreiden reclamemateriaal (sampling)',
  requirePayment: true,
  fetchWorkflowStatusDatesFor: [
    {
      status: 'In behandeling',
      decosActionCode: 'Flyeren-Sampling - Behandelen',
    },
  ],
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    date6: dateStart,
    date7: dateEnd,
    text6: location,
    text7: timeStart,
    text8: timeEnd,
  },
};

const AanbiedenDiensten: DecosZaakTransformer<AanbiedenDiensten> = {
  isActive: true,
  caseType: caseTypeVergunningen.AanbiedenDiensten,
  title: caseTypeVergunningen.AanbiedenDiensten,
  fetchWorkflowStatusDatesFor: [
    {
      status: 'In behandeling',
      decosActionCode: 'Aanbieden van diensten - Behandelen',
    },
  ],
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    subject1: 'category',
    firstname: 'stadsdeel',
    date6: dateStart,
    date7: dateEnd,
    text6: location,
  },
};

const Straatartiesten: DecosZaakTransformer<Straatartiesten> = {
  isActive: true,
  caseType: caseTypeVergunningen.Straatartiesten,
  title: caseTypeVergunningen.Straatartiesten,
  fetchWorkflowStatusDatesFor: [
    {
      status: 'In behandeling',
      decosActionCode: 'Straatartiesten - Behandelen',
    },
  ],
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    subject1: 'category',
    firstname: 'stadsdeel',
    date6: dateStart,
    date7: dateEnd,
    text6: location,
  },
};

const NachtwerkOntheffing: DecosZaakTransformer<Nachtwerkontheffing> = {
  isActive: true,
  caseType: caseTypeVergunningen.NachtwerkOntheffing,
  title: 'Geluidsontheffing werken in de openbare ruimte (nachtwerkontheffing)',
  fetchWorkflowStatusDatesFor: [
    {
      status: 'In behandeling',
      decosActionCode: 'Nachtwerkontheffing - Behandelen',
    },
  ],
  requirePayment: true,
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    dfunction: transformDecision({
      Verleend: ['Verleend met borden', 'Verleend zonder borden'],
    }),
    date6: dateStart,
    date7: dateEnd,
    text6: location,
    text7: timeStart,
    text10: timeEnd,
  },
};

const ZwaarVerkeer: DecosZaakTransformer<ZwaarVerkeer> = {
  isActive: true,
  caseType: caseTypeVergunningen.ZwaarVerkeer,
  title: 'Ontheffing zwaar verkeer',
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    dfunction: transformDecision({
      Afgewezen: ['Niet verleend'],
      Toegekend: ['Verleend'],
    }),
    date6: dateStart,
    date7: dateEnd,
    text49: kentekens,
    text17: {
      name: 'exemptionKind',
      transform: (text17Value) => {
        const exemptionKindTranslation: Record<string, string> = {
          'Jaarontheffing bijzonder':
            'Jaarontheffing hele zone voor bijzondere voertuigen',

          'Jaarontheffing gewicht':
            'Jaarontheffing hele zone met gewichtsverklaring',

          'Jaarontheffing gewicht bijzonder':
            'Jaarontheffing hele zone voor bijzondere voertuigen met gewichtsverklaring',

          'Jaarontheffing gewicht en ondeelbaar':
            'Jaarontheffing hele zone met gewichtsverklaring en verklaring ondeelbare lading',

          'Jaarontheffing ondeelbaar':
            'Jaarontheffing hele zone met verklaring ondeelbare lading',

          'Routeontheffing bijzonder boven 30 ton':
            'Routeontheffing bijzondere voertuig boven 30 ton',

          'Routeontheffing brede wegen boven 30 ton':
            'Routeontheffing breed opgezette wegen boven 30 ton',

          'Routeontheffing brede wegen tm 30 ton':
            'Routeontheffing breed opgezette wegen tot en met 30 ton',

          'Routeontheffing culturele instelling':
            'Routeontheffing pilot culturele instelling',

          'Routeontheffing ondeelbaar boven 30 ton':
            'Routeontheffing boven 30 ton met verklaring ondeelbare lading',

          'Zwaar verkeer': 'Ontheffing zwaar verkeer',

          Dagontheffing: 'Dagontheffing hele zone',

          Jaarontheffing: 'Jaarontheffing hele zone',
        };

        return exemptionKindTranslation[text17Value] ?? text17Value;
      },
    },
  },
  async afterTransform(vergunning, decosZaakSource) {
    vergunning.title = getCustomTitleForDecosZaakWithLicensePlates(vergunning);
    return vergunning;
  },
};

const Samenvoegingsvergunning: DecosZaakTransformer<Samenvoegingsvergunning> = {
  isActive: true,
  caseType: caseTypeVergunningen.Samenvoegingsvergunning,
  title: 'Vergunning voor samenvoegen van woonruimten',
  fetchWorkflowStatusDatesFor: [
    {
      status: 'In behandeling',
      decosActionCode: 'Samenvoegingsvergunning - Beoordelen en besluiten',
    },
  ],
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    text6: location,
  },
};

const Onttrekkingsvergunning: DecosZaakTransformer<Onttrekkingsvergunning> = {
  isActive: true,
  caseType: caseTypeVergunningen.Onttrekkingsvergunning,
  title: caseTypeVergunningen.Onttrekkingsvergunning,
  fetchWorkflowStatusDatesFor: [],
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    text6: location,
  },
};

const OnttrekkingsvergunningSloop: DecosZaakTransformer<OnttrekkingsvergunningSloop> =
  {
    isActive: true,
    caseType: caseTypeVergunningen.OnttrekkingsvergunningSloop,
    title: caseTypeVergunningen.OnttrekkingsvergunningSloop,
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        decosActionCode:
          'Onttrekkingsvergunning voor sloop - Beoordelen en besluiten',
      },
    ],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text6: location,
      dfunction: transformDecision({
        Ingetrokken: ['Ingetrokken aanvraag door gemeente'],
      }),
    },
  };

const VormenVanWoonruimte: DecosZaakTransformer<VormenVanWoonruimte> = {
  isActive: true,
  caseType: caseTypeVergunningen.VormenVanWoonruimte,
  title: 'Vergunning voor woningvorming',
  fetchWorkflowStatusDatesFor: [
    {
      status: 'In behandeling',
      decosActionCode: 'Woningvormingsvergunning - Beoordelen en besluiten',
    },
  ],
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    text6: location,
  },
};

const Splitsingsvergunning: DecosZaakTransformer<Splitsingsvergunning> = {
  isActive: true,
  caseType: caseTypeVergunningen.Splitsingsvergunning,
  title: caseTypeVergunningen.Splitsingsvergunning,
  fetchWorkflowStatusDatesFor: [
    {
      status: 'In behandeling',
      decosActionCode: 'Splitsingsvergunning - Behandelen',
    },
  ],
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    text6: location,
    dfunction: transformDecision({
      Ingetrokken: ['Ingetrokken aanvraag op eigen verzoek'],
    }),
  },
};

const VOBvergunning: DecosZaakTransformer<Ligplaatsvergunning> = {
  isActive: true,
  caseType: caseTypeVergunningen.VOB,
  title: 'Ligplaatsvergunning',
  fetchWorkflowStatusDatesFor: [
    {
      status: 'In behandeling',
      decosActionCode: 'VOB - Beoordelen en besluiten',
    },
  ],
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    text9: { name: 'requestKind' },
    text18: { name: 'reason' },
    text6: location,
    text10: { name: 'vesselKind' }, // soort vaartuig
    text14: { name: 'vesselName' }, // naam vaartuig
  },
};

const RVVHeleStad: DecosZaakTransformer<RVVHeleStad> = {
  isActive: !IS_PRODUCTION,
  caseType: caseTypeVergunningen.RVVHeleStad,
  title: 'RVV-verkeersontheffing',
  fetchWorkflowStatusDatesFor: [
    {
      status: 'In behandeling',
      decosActionCode: 'RVV - Hele stad - Behandelen',
    },
  ],
  requirePayment: true,
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    date6: dateStart,
    date7: dateEnd,
    text49: kentekens,
  },
  async afterTransform(vergunning, decosZaakSource) {
    vergunning.title = getCustomTitleForDecosZaakWithLicensePlates(vergunning);
    return vergunning;
  },
};

const RVVSloterweg: DecosZaakTransformer<RVVSloterweg> = {
  isActive: true,
  caseType: caseTypeVergunningen.RVVSloterweg,
  title: 'RVV ontheffing Sloterweg',
  fetchWorkflowStatusDatesFor: [],
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    dfunction: transformDecision({
      Ingetrokken: ['Ingetrokken door gemeente'],
    }),
    text8: 'requestType',
    text7: 'area',
    date6: dateStart,
    date7: dateEnd,
    text10: kentekens,
    text15: { ...kentekens, name: 'vorigeKentekens' },
    title: 'status',
  },
  async afterTransform(vergunning) {
    // TODO: find out if Sloterweg zaken are still not being processed on insertion into the database.

    vergunning.processed = true;

    if (!vergunning.decision) {
      // This decision (verleend) is not set by decos eventhough the actual permit is granted.
      // This is possibly some hack to have an overview of active permits in the Decos back-office.
      vergunning.decision = 'Verleend';
    }

    // Add zone to title
    const kentekens = vergunning.kentekens || vergunning.vorigeKentekens;
    if (vergunning.area && kentekens) {
      vergunning.title = `RVV ontheffing ${vergunning.area} (${kentekens})`;
    }

    return vergunning;
  },
};

const WerkEnVervoerOpStraat: DecosZaakTransformer<WerkzaamhedenEnVervoerOpStraat> =
  {
    isActive: true,
    caseType: caseTypeVergunningen.WVOS,
    title: 'Werkzaamheden en vervoer op straat',
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        decosActionCode: 'Werk en vervoer op straat - Behandelen',
      },
    ],
    requirePayment: true,
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text49: kentekens,
      text6: location,
    },
    additionalSelectFields: [
      'bol23',
      'bol22',
      'bol21',
      'bol18',
      'bol13',
      'bol20',
      'bol9',
      'bol52',
      'bol17',
      'bol12',
      'bol8',
      'bol16',
    ],
    isVerleend(zaak) {
      return (
        zaak.processed &&
        !!zaak.decision &&
        !zaak.decision.toLowerCase().includes('Niet Verleend')
      );
    },
    async afterTransform(vergunning, zaakSource) {
      const wvosActiviteiten: Record<WVOSActiviteit, DecosFieldNameSource[]> = {
        'Rijden of een voertuig neerzetten waar dat normaal niet mag': [
          'bol23',
          'bol22',
          'bol21',
        ],
        'Object(en) neerzetten': ['bol18'],
        'Parkeervakken reserveren': ['bol13', 'bol20'],
        'Een straat afzetten': ['bol9', 'bol52'],
        'Werkzaamheden verrichten in de nacht': ['bol17'],
        'Fietsen en/of fietsenrekken weg laten halen voor werkzaamheden': [
          'bol12',
        ],
        'Verhuizing tussen twee locaties binnen Amsterdam': ['bol8'],
        Filmen: ['bol16'],
      };

      vergunning.werkzaamheden = Object.entries(wvosActiviteiten)
        .filter(([, sourceAttr]) => {
          return sourceAttr.some((attr) => !!zaakSource.fields[attr]);
        })
        .map(([activiteit]) => activiteit as WVOSActiviteit);

      if (vergunning.werkzaamheden.length > 1 && vergunning.processed) {
        vergunning.decision = MA_DECISION_ZIE_BESLUIT;
      }

      vergunning.title =
        getCustomTitleForDecosZaakWithLicensePlates(vergunning);

      return vergunning;
    },
  };

export const decosCaseToZaakTransformers = {
  [AanbiedenDiensten.caseType]: AanbiedenDiensten,
  [EvenementMelding.caseType]: EvenementMelding,
  [EvenementVergunning.caseType]: EvenementVergunning,
  [Flyeren.caseType]: Flyeren,
  [NachtwerkOntheffing.caseType]: NachtwerkOntheffing,
  [Onttrekkingsvergunning.caseType]: Onttrekkingsvergunning,
  [OnttrekkingsvergunningSloop.caseType]: OnttrekkingsvergunningSloop,
  [RVVHeleStad.caseType]: RVVHeleStad,
  [RVVSloterweg.caseType]: RVVSloterweg,
  [Samenvoegingsvergunning.caseType]: Samenvoegingsvergunning,
  [Splitsingsvergunning.caseType]: Splitsingsvergunning,
  [Straatartiesten.caseType]: Straatartiesten,
  [TVMRVVObject.caseType]: TVMRVVObject,
  [VOBvergunning.caseType]: VOBvergunning,
  [VormenVanWoonruimte.caseType]: VormenVanWoonruimte,
  [WerkEnVervoerOpStraat.caseType]: WerkEnVervoerOpStraat,
  [ZwaarVerkeer.caseType]: ZwaarVerkeer,
  [ERVV_TVM.caseType]: ERVV_TVM,
  [Omzettingsvergunning.caseType]: Omzettingsvergunning,
} as const;

export const decosZaakTransformers = Object.values(decosCaseToZaakTransformers);
