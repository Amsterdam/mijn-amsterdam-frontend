import {
  AanbiedenDiensten as AanbiedenDienstenType,
  ERVV,
  EvenementMelding as EvenementMeldingType,
  EvenementVergunning as EvenementVergunningType,
  Flyeren as FlyerenType,
  Ligplaatsvergunning as LigplaatsvergunningType,
  Nachtwerkontheffing as NachtwerkontheffingType,
  Omzettingsvergunning as OmzettingsvergunningType,
  OnttrekkingsvergunningSloop as OnttrekkingsvergunningSloopType,
  Onttrekkingsvergunning as OnttrekkingsvergunningType,
  RVVHeleStad as RVVHeleStadType,
  RVVSloterweg as RVVSloterwegType,
  Samenvoegingsvergunning as SamenvoegingsvergunningType,
  Splitsingsvergunning as SplitsingsvergunningType,
  TVMRVVObject as TVMRVVObjectType,
  VormenVanWoonruimte as VormenVanWoonruimteType,
  WVOSActiviteit as WVOSActiviteitType,
  WerkzaamhedenEnVervoerOpStraat as WerkzaamhedenEnVervoerOpStraatType,
  ZwaarVerkeer as ZwaarVerkeerType,
} from './config-and-types';
import {
  caseNotificationLabelsDefault,
  caseNotificationLabelsExpirables,
  caseNotificationLabelsRevoke,
} from './vergunningen-notification-labels';
import { IS_PRODUCTION } from '../../../universal/config/env';
import { CaseTypeV2 } from '../../../universal/types/decos-zaken';
import {
  DecosZaakTransformer,
  DecosFieldNameSource,
} from '../decos/config-and-types';
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
} from '../decos/decos-field-transformers';
import {
  getCustomTitleForDecosZaakWithLicensePlates,
  getDecosZaakTransformersByCaseType,
  getStatusDate,
} from '../decos/decos-helpers';

export const TVMRVVObject: DecosZaakTransformer<TVMRVVObjectType> = {
  isActive: true,
  caseType: CaseTypeV2.TVMRVVObject,
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
  notificationLabels: caseNotificationLabelsExpirables,
};

export const EvenementMelding: DecosZaakTransformer<EvenementMeldingType> = {
  isActive: true,
  caseType: CaseTypeV2.EvenementMelding,
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
  notificationLabels: caseNotificationLabelsDefault,
};

export const EvenementVergunning: DecosZaakTransformer<EvenementVergunningType> =
  {
    isActive: true,
    caseType: CaseTypeV2.EvenementVergunning,
    title: CaseTypeV2.EvenementVergunning,
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      dfunction: transformDecision({
        Verleend: ['Verleend (Bijzonder/Bewaren)', 'Verleend zonder borden'],
        '': ['Nog niet bekend', 'Nog niet  bekend'],
      }),
      date6: dateStart,
      date7: dateEnd,
      text6: location,
      text7: timeStart,
      text8: timeEnd,
    },
    notificationLabels: caseNotificationLabelsDefault,
  };

export const Omzettingsvergunning: DecosZaakTransformer<OmzettingsvergunningType> =
  {
    isActive: true,
    caseType: CaseTypeV2.Omzettingsvergunning,
    title: 'VergunningV2 voor kamerverhuur (omzettingsvergunning)',
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        stepTitle: 'Omzettingsvergunning - Behandelen',
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
    notificationLabels: caseNotificationLabelsDefault,
  };

export const ERVV_TVM: DecosZaakTransformer<ERVV> = {
  isActive: true,
  caseType: CaseTypeV2.ERVV,
  title: 'e-RVV (Gratis verkeersontheffing voor elektrisch goederenvervoer)',
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
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
  notificationLabels: caseNotificationLabelsExpirables,
};

export const Flyeren: DecosZaakTransformer<FlyerenType> = {
  isActive: true,
  caseType: CaseTypeV2.Flyeren,
  title: 'Verspreiden reclamemateriaal (sampling)',
  requirePayment: true,
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    date6: dateStart,
    date7: dateEnd,
    text6: location,
    text7: timeStart,
    text8: timeEnd,
  },
  notificationLabels: caseNotificationLabelsDefault,
};

export const AanbiedenDiensten: DecosZaakTransformer<AanbiedenDienstenType> = {
  isActive: true,
  caseType: CaseTypeV2.AanbiedenDiensten,
  title: CaseTypeV2.AanbiedenDiensten,
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    date6: dateStart,
    date7: dateEnd,
    text6: location,
  },
  notificationLabels: caseNotificationLabelsDefault,
};

export const NachtwerkOntheffing: DecosZaakTransformer<NachtwerkontheffingType> =
  {
    isActive: true,
    caseType: CaseTypeV2.NachtwerkOntheffing,
    title:
      'Geluidsontheffing werken in de openbare ruimte (nachtwerkontheffing)',
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        stepTitle: 'Nachtwerkontheffing - Behandelen',
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
    notificationLabels: caseNotificationLabelsDefault,
  };

export const ZwaarVerkeer: DecosZaakTransformer<ZwaarVerkeerType> = {
  isActive: true,
  caseType: CaseTypeV2.ZwaarVerkeer,
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
  notificationLabels: caseNotificationLabelsDefault,
};

export const Samenvoegingsvergunning: DecosZaakTransformer<SamenvoegingsvergunningType> =
  {
    isActive: true,
    caseType: CaseTypeV2.Samenvoegingsvergunning,
    title: 'VergunningV2 voor samenvoegen van woonruimten',
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        stepTitle: 'Samenvoegingsvergunning - Beoordelen en besluiten',
      },
    ],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text6: location,
    },
    notificationLabels: caseNotificationLabelsDefault,
  };

export const Onttrekkingsvergunning: DecosZaakTransformer<OnttrekkingsvergunningType> =
  {
    isActive: true,
    caseType: CaseTypeV2.Onttrekkingsvergunning,
    title: CaseTypeV2.Onttrekkingsvergunning,
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        stepTitle:
          'Onttrekkingsvergunning voor ander gebruik - Beoordelen en besluiten',
      },
    ],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text6: location,
    },
    notificationLabels: caseNotificationLabelsDefault,
  };

export const OnttrekkingsvergunningSloop: DecosZaakTransformer<OnttrekkingsvergunningSloopType> =
  {
    isActive: true,
    caseType: CaseTypeV2.OnttrekkingsvergunningSloop,
    title: CaseTypeV2.OnttrekkingsvergunningSloop,
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        stepTitle:
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
    notificationLabels: caseNotificationLabelsDefault,
  };

export const VormenVanWoonruimte: DecosZaakTransformer<VormenVanWoonruimteType> =
  {
    isActive: true,
    caseType: CaseTypeV2.VormenVanWoonruimte,
    title: 'VergunningV2 voor woningvorming',
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        stepTitle: 'Woningvormingsvergunning - Beoordelen en besluiten',
      },
    ],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text6: location,
    },
    notificationLabels: caseNotificationLabelsDefault,
  };

export const Splitsingsvergunning: DecosZaakTransformer<SplitsingsvergunningType> =
  {
    isActive: true,
    caseType: CaseTypeV2.Splitsingsvergunning,
    title: CaseTypeV2.Splitsingsvergunning,
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        stepTitle: 'Splitsingsvergunning - Behandelen',
      },
    ],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text6: location,
      dfunction: transformDecision({
        Ingetrokken: ['Ingetrokken aanvraag op eigen verzoek'],
      }),
    },
    notificationLabels: caseNotificationLabelsDefault,
  };

export const VOBvergunning: DecosZaakTransformer<LigplaatsvergunningType> = {
  isActive: true,
  caseType: CaseTypeV2.VOB,
  title: 'Ligplaatsvergunning',
  fetchWorkflowStatusDatesFor: [
    { status: 'In behandeling', stepTitle: 'VOB - Beoordelen en besluiten' },
  ],
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    text9: { name: 'requestKind' },
    text18: { name: 'reason' },
    text6: location,
    text10: { name: 'vesselKind' }, // soort vaartuig
    text14: { name: 'vesselName' }, // naam vaartuig
  },
  notificationLabels: caseNotificationLabelsDefault,
};

export const RVVHeleStad: DecosZaakTransformer<RVVHeleStadType> = {
  isActive: !IS_PRODUCTION,
  caseType: CaseTypeV2.RVVHeleStad,
  title: 'RVV-verkeersontheffing',
  fetchWorkflowStatusDatesFor: [
    {
      status: 'In behandeling',
      stepTitle: 'Status bijwerken en notificatie verzenden - In behandeling',
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
  notificationLabels: caseNotificationLabelsExpirables,
};

export const RVVSloterweg: DecosZaakTransformer<RVVSloterwegType> = {
  isActive: true,
  caseType: CaseTypeV2.RVVSloterweg,
  title: 'RVV ontheffing Sloterweg',
  fetchWorkflowStatusDatesFor: [
    { status: 'In behandeling', stepTitle: 'RVV Sloterweg - Behandelen' },
  ],
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    dfunction: transformDecision({
      Ingetrokken: ['Ingetrokken door gemeente'],
    }),
    text8: {
      name: 'requestType',
    },
    text7: {
      name: 'area',
    },
    date6: dateStart,
    date7: dateEnd,
    text10: kentekens,
    text15: { ...kentekens, name: 'vorigeKentekens' },
  },
  async afterTransform(vergunning, decosZaakSource) {
    if (getStatusDate('Verleend', vergunning)) {
      vergunning.processed = true;
      // if the workflow verleend has run but there is no decision then its actually Verleend.
      // this decision (verleend) is not set by decos eventhough the actual permit is granted.
      // This is some hack to have an overview of active permits in the Decos back-office.
      if (!vergunning.decision) {
        vergunning.decision = 'Verleend';
      }
    }

    // Override processed
    if (
      !vergunning.processed &&
      (vergunning.dateDecision || vergunning.decision)
    ) {
      vergunning.processed = true;
    }

    // Add zone to title
    if (vergunning.caseType === CaseTypeV2.RVVSloterweg) {
      if (vergunning.area && vergunning.kentekens) {
        vergunning.title = `RVV ontheffing ${vergunning.area} (${vergunning.kentekens})`;
      }
    }

    return vergunning;
  },
  notificationLabels: caseNotificationLabelsRevoke,
};

export const WerkEnVervoerOpStraat: DecosZaakTransformer<WerkzaamhedenEnVervoerOpStraatType> =
  {
    isActive: !IS_PRODUCTION,
    caseType: CaseTypeV2.WVOS,
    title: 'Werkzaamheden en vervoer op straat',
    fetchWorkflowStatusDatesFor: [
      { status: 'In behandeling', stepTitle: 'Status - In behandeling' },
    ],
    requirePayment: true,
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      date6: dateStart,
      date7: dateEnd,
      text49: kentekens,
      text6: location,
    },
    async afterTransform(vergunning, zaakSource) {
      const wvosActiviteiten: Record<
        WVOSActiviteitType,
        DecosFieldNameSource[]
      > = {
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
        .map(([activiteit]) => activiteit as WVOSActiviteitType);

      if (vergunning.werkzaamheden.length > 1 && vergunning.processed) {
        vergunning.decision =
          'In het Besluit ziet u voor welke werkzaamheden u een ontheffing heeft gekregen.';
      }

      vergunning.title =
        getCustomTitleForDecosZaakWithLicensePlates(vergunning);

      return vergunning;
    },
    notificationLabels: caseNotificationLabelsDefault,
  };

export const decosZaakTransformers = [
  AanbiedenDiensten,
  EvenementMelding,
  EvenementVergunning,
  Flyeren,
  NachtwerkOntheffing,
  Onttrekkingsvergunning,
  OnttrekkingsvergunningSloop,
  RVVHeleStad,
  RVVSloterweg,
  Samenvoegingsvergunning,
  Splitsingsvergunning,
  TVMRVVObject,
  VOBvergunning,
  VormenVanWoonruimte,
  WerkEnVervoerOpStraat,
  ZwaarVerkeer,
];

export const decosCaseToZaakTransformers = getDecosZaakTransformersByCaseType(
  decosZaakTransformers
);
