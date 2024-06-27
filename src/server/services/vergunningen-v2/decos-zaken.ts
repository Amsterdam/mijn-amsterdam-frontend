import { parseISO } from 'date-fns';
import { IS_PRODUCTION } from '../../../universal/config';

import {
  CaseTypeV2,
  DecosCaseType,
} from '../../../universal/types/vergunningen';
import {
  AanbiedenDiensten as AanbiedenDienstenType,
  BZB as BZBType,
  BZP as BZPType,
  DecosFieldNameSource,
  DecosFieldTransformer,
  DecosFieldTransformerObject,
  DecosZaakTypeTransformer,
  ERVV,
  EigenParkeerplaatsOpheffen as EigenParkeerplaatsOpheffenType,
  EigenParkeerplaatsRequestType,
  EigenParkeerplaats as EigenParkeerplaatsType,
  EvenementMelding as EvenementMeldingType,
  EvenementVergunning as EvenementVergunningType,
  ExploitatieHorecabedrijf as ExploitatieHorecabedrijfType,
  Flyeren as FlyerenType,
  GPK as GPKType,
  GPP as GPPType,
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
  TouringcarDagontheffing as TouringcarDagontheffingType,
  TouringcarJaarontheffing as TouringcarJaarontheffingType,
  VakantieverhuurVergunningaanvraag as VakantieverhuurVergunningaanvraagType,
  VergunningV2,
  VormenVanWoonruimte as VormenVanWoonruimteType,
  WVOSActiviteit as WVOSActiviteitType,
  WerkzaamhedenEnVervoerOpStraat as WerkzaamhedenEnVervoerOpStraatType,
  ZwaarVerkeer as ZwaarVerkeerType,
} from './config-and-types';
import {
  getCustomTitleForVergunningWithLicensePlates,
  transformBoolean,
  transformKenteken,
} from './helpers';

const decision: DecosFieldTransformer = {
  name: 'decision',
  transform: (decision: string, options) => {
    const decisionTranslations =
      options?.zaakTypeTransformer?.decisionTranslations;

    if (decisionTranslations) {
      const maDecision = Object.entries(decisionTranslations).find(
        ([maDecision, decosDecisions]) => {
          return decosDecisions.includes(decision);
        }
      )?.[0];
      return maDecision ?? decision;
    }
    return decision;
  },
};

// A list of common readable api attributes
const status = 'status';
const caseType = 'caseType';
const identifier = 'identifier';
const processed = 'processed';
const dateDecision = 'dateDecision';
const dateRequest = 'dateRequest';
const dateStart = 'dateStart';
const dateEnd = 'dateEnd';
const location = 'location';
const timeStart = 'timeStart';
const timeEnd = 'timeEnd';
const destination = 'destination';
const description = 'description';

// 1 or multiple kenteken(s)
const kentekens = {
  name: 'kentekens' as keyof VergunningV2, // TODO: Can this be typed stricter without casting?
  transform: transformKenteken,
};

// The set of field transforms that applies to every case.
// { $api_attribute_name_source: $api_attribute_name_mijn_amsterdam }
export const SELECT_FIELDS_TRANSFORM_BASE: Partial<DecosFieldTransformerObject> =
  {
    title: status,
    text45: caseType,
    dfunction: decision,
    mark: identifier,
    processed: processed,
    date5: dateDecision,
    document_date: dateRequest,
    date6: dateStart,
    date7: dateEnd,
  };

export const TVMRVVObject: DecosZaakTypeTransformer<TVMRVVObjectType> = {
  isActive: true,
  caseType: CaseTypeV2.TVMRVVObject,
  title: 'Tijdelijke verkeersmaatregel (TVM-RVV-Object)',
  requirePayment: true,
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    subject1: description,
    date6: dateStart,
    date7: dateEnd,
    text6: location,
    text10: timeStart,
    text13: timeEnd,
    text9: kentekens,
  },
  addToSelectFieldsBase: ['text9'],
  decisionTranslations: {
    Verleend: [
      'verleend met borden',
      'verleend zonder bebording',
      'verleend zonder borden',
    ],
  },
  async afterTransform(vergunning) {
    if (
      'dateEnd' in vergunning &&
      'dateStart' in vergunning &&
      !vergunning.dateEnd
    ) {
      vergunning.dateEnd = vergunning.dateStart;
    }

    vergunning.title = getCustomTitleForVergunningWithLicensePlates(vergunning);

    return vergunning;
  },
};

export const VakantieverhuurVergunningaanvraag: DecosZaakTypeTransformer<VakantieverhuurVergunningaanvraagType> =
  {
    isActive: true,
    caseType: CaseTypeV2.VakantieverhuurVergunningaanvraag,
    title: 'VergunningV2 vakantieverhuur',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text6: location,
    },
    async afterTransform(vergunning) {
      /**
       * Vakantieverhuur vergunningen worden na betaling direct verleend en per mail toegekend zonder dat de juiste status in Decos wordt gezet.
       * Later, na controle, wordt mogelijk de vergunning weer ingetrokken.
       */
      if (vergunning.decision) {
        vergunning.decision = vergunning.decision
          .toLowerCase()
          .includes('ingetrokken')
          ? 'Ingetrokken'
          : 'Verleend';
      }

      // Vakantieverhuur vergunningen worden direct verleend (en dus voor Mijn Amsterdam afgehandeld)
      vergunning.status = 'Afgehandeld';

      // The validity of this case runs from april 1st until the next. set the end date to the next april the 1st
      if ('dateEnd' in vergunning && vergunning.dateRequest) {
        vergunning.dateEnd = new Date(
          parseISO(vergunning.dateRequest).getFullYear() + 1,
          4,
          1
        ).toISOString();
      }

      return vergunning;
    },
  };

export const GPP: DecosZaakTypeTransformer<GPPType> = {
  isActive: true,
  caseType: CaseTypeV2.GPP,
  title: 'Vaste parkeerplaats voor gehandicapten (GPP)',
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    text7: kentekens,
    text8: location,
  },
  async afterTransform(vergunning, decosZaakSource, options) {
    vergunning.title = getCustomTitleForVergunningWithLicensePlates(vergunning);
    return vergunning;
  },
  decisionTranslations: {
    Ingetrokken: ['Ingetrokken i.v.m. overlijden of verhuizing'],
    '': ['Nog niet bekend'],
  },
};

export const GPK: DecosZaakTypeTransformer<GPKType> = {
  isActive: true,
  caseType: CaseTypeV2.GPK,
  title: 'Europese gehandicaptenparkeerkaart (GPK)',
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    date7: dateEnd,
    num3: { name: 'cardNumber' },
    text7: { name: 'cardType' },
  },
  decisionTranslations: {
    Ingetrokken: [
      'Ingetrokken i.v.m. overlijden of verhuizing',
      'Ingetrokken verleende GPK wegens overlijden',
    ],
    '': ['Nog niet bekend'],
    'Verleend Bestuurder, niet verleend Passagier': [
      'Verleend Bestuurder met GPP (niet verleend passagier)',
      // Decos cuts of the field at 50 chars, we sadly have to anticipate on this
      'Verleend Bestuurder met GPP (niet verleend passagi',
    ],
    Verleend: ['Verleend met GPP', 'Verleend vervangend GPK'],
    'Verleend Passagier, niet verleend Bestuurder': [
      'Verleend Passagier met GPP (niet verleend Bestuurder)',
      // Decos cuts of the field at 50 chars, we sadly have to anticipate on this
      'Verleend Passagier met GPP (niet verleend Bestuurd',
    ],
  },
};

export const EvenementMelding: DecosZaakTypeTransformer<EvenementMeldingType> =
  {
    isActive: true,
    caseType: CaseTypeV2.EvenementMelding,
    title: 'Evenement melding',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      date6: dateStart,
      date7: dateEnd,
      text6: location,
      text7: timeStart,
      text8: timeEnd,
    },
    decisionTranslations: {
      Toegestaan: [
        'Verleend',
        'Verleend (Bijzonder/Bewaren)',
        'Verleend zonder borden',
      ],
      'Niet toegestaan': ['Niet verleend'],
      '': ['Nog niet  bekend', 'Nog niet bekend'],
    },
  };

export const EvenementVergunning: DecosZaakTypeTransformer<EvenementVergunningType> =
  {
    isActive: true,
    caseType: CaseTypeV2.EvenementVergunning,
    title: CaseTypeV2.EvenementVergunning,
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      date6: dateStart,
      date7: dateEnd,
      text6: location,
      text7: timeStart,
      text8: timeEnd,
    },
    decisionTranslations: {
      Verleend: ['Verleend (Bijzonder/Bewaren)', 'Verleend zonder borden'],
      '': ['Nog niet bekend', 'Nog niet  bekend'],
    },
  };

export const Omzettingsvergunning: DecosZaakTypeTransformer<OmzettingsvergunningType> =
  {
    isActive: true,
    caseType: CaseTypeV2.Omzettingsvergunning,
    title: 'VergunningV2 voor kamerverhuur (omzettingsvergunning)',
    dateInBehandelingWorkflowStepTitle: 'Omzettingsvergunning - Behandelen',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text6: location,
    },
    decisionTranslations: {
      Verleend: ['Verleend zonder borden'],
      '': ['Nog niet bekend', 'Nog niet  bekend'],
    },
  };

export const ERVV_TVM: DecosZaakTypeTransformer<ERVV> = {
  isActive: true,
  caseType: CaseTypeV2.Omzettingsvergunning,
  title: 'e-RVV (Gratis verkeersontheffing voor elektrisch goederenvervoer)',
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    text6: location,
    date6: dateStart,
    date7: dateEnd,
    text10: timeStart,
    text13: timeEnd,
  },
  decisionTranslations: {
    '': ['Nog niet bekend', 'Nog niet  bekend'],
    Verleend: [
      'Verleend met borden',
      'Verleend met borden en Fietsenrekken verwijderen',
      'Verleend met Fietsenrekken verwijderen',
      'Verleend zonder bebording',
      'Verleend zonder borden',
    ],
  },
};

export const BZP: DecosZaakTypeTransformer<BZPType> = {
  isActive: true,
  caseType: CaseTypeV2.BZP,
  title: CaseTypeV2.BZP,
  requirePayment: true,
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    date6: dateStart,
    date7: dateEnd,
    text8: kentekens,
  },
  async afterTransform(vergunning, decosZaakSource, options) {
    vergunning.title = getCustomTitleForVergunningWithLicensePlates(vergunning);
    return vergunning;
  },
};

export const BZB: DecosZaakTypeTransformer<BZBType> = {
  isActive: true,
  caseType: CaseTypeV2.BZB,
  title: CaseTypeV2.BZB,
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    date6: dateStart,
    date7: dateEnd,
    company: { name: 'companyName' },
    num6: { name: 'numberOfPermits' },
  },
};

export const Flyeren: DecosZaakTypeTransformer<FlyerenType> = {
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
};

export const AanbiedenDiensten: DecosZaakTypeTransformer<AanbiedenDienstenType> =
  {
    isActive: true,
    caseType: CaseTypeV2.AanbiedenDiensten,
    title: CaseTypeV2.AanbiedenDiensten,
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      date6: dateStart,
      date7: dateEnd,
      text6: location,
    },
  };

export const NachtwerkOntheffing: DecosZaakTypeTransformer<NachtwerkontheffingType> =
  {
    isActive: true,
    caseType: CaseTypeV2.NachtwerkOntheffing,
    title:
      'Geluidsontheffing werken in de openbare ruimte (nachtwerkontheffing)',
    dateInBehandelingWorkflowStepTitle: 'Nachtwerkontheffing - Behandelen',
    requirePayment: true,
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      date6: dateStart,
      date7: dateEnd,
      text6: location,
      text7: timeStart,
      text10: timeEnd,
    },
    decisionTranslations: {
      Verleend: ['Verleend met borden', 'Verleend zonder borden'],
    },
  };

export const ZwaarVerkeer: DecosZaakTypeTransformer<ZwaarVerkeerType> = {
  isActive: true,
  caseType: CaseTypeV2.ZwaarVerkeer,
  decisionTranslations: {
    Afgewezen: ['Niet verleend'],
    Toegekend: ['Verleend'],
  },
  title: 'Ontheffing zwaar verkeer',
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
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
  addToSelectFieldsBase: ['text49'], // kenteken,
  async afterTransform(vergunning, decosZaakSource, options) {
    vergunning.title = getCustomTitleForVergunningWithLicensePlates(vergunning);
    return vergunning;
  },
};

export const Samenvoegingsvergunning: DecosZaakTypeTransformer<SamenvoegingsvergunningType> =
  {
    isActive: true,
    caseType: CaseTypeV2.Samenvoegingsvergunning,
    title: 'VergunningV2 voor samenvoegen van woonruimten',
    dateInBehandelingWorkflowStepTitle:
      'Samenvoegingsvergunning - Beoordelen en besluiten',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text6: location,
    },
  };

export const Onttrekkingsvergunning: DecosZaakTypeTransformer<OnttrekkingsvergunningType> =
  {
    isActive: true,
    caseType: CaseTypeV2.Onttrekkingsvergunning,
    title: CaseTypeV2.Onttrekkingsvergunning,
    dateInBehandelingWorkflowStepTitle:
      'Onttrekkingsvergunning voor ander gebruik - Beoordelen en besluiten',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text6: location,
    },
  };

export const OnttrekkingsvergunningSloop: DecosZaakTypeTransformer<OnttrekkingsvergunningSloopType> =
  {
    isActive: true,
    caseType: CaseTypeV2.OnttrekkingsvergunningSloop,
    title: CaseTypeV2.OnttrekkingsvergunningSloop,
    dateInBehandelingWorkflowStepTitle:
      'Onttrekkingsvergunning voor sloop - Beoordelen en besluiten',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text6: location,
    },
  };

export const VormenVanWoonruimte: DecosZaakTypeTransformer<VormenVanWoonruimteType> =
  {
    isActive: true,
    caseType: CaseTypeV2.VormenVanWoonruimte,
    title: 'VergunningV2 voor woningvorming',
    dateInBehandelingWorkflowStepTitle:
      'Woningvormingsvergunning - Beoordelen en besluiten',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text6: location,
    },
  };

export const Splitsingsvergunning: DecosZaakTypeTransformer<SplitsingsvergunningType> =
  {
    isActive: true,
    caseType: CaseTypeV2.Splitsingsvergunning,
    title: CaseTypeV2.Splitsingsvergunning,
    dateInBehandelingWorkflowStepTitle: 'Splitsingsvergunning - Behandelen',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text6: location,
    },
  };

export const VOBvergunning: DecosZaakTypeTransformer<LigplaatsvergunningType> =
  {
    isActive: true,
    caseType: CaseTypeV2.VOB,
    title: 'Ligplaatsvergunning',
    dateInBehandelingWorkflowStepTitle: 'VOB - Beoordelen en besluiten',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text9: { name: 'requestKind' },
      text18: { name: 'reason' },
      text6: location,
      text10: { name: 'vesselKind' }, // soort vaartuig
      text14: { name: 'vesselName' }, // naam vaartuig
    },
  };

export const ExploitatieHorecabedrijf: DecosZaakTypeTransformer<ExploitatieHorecabedrijfType> =
  {
    isActive: true,
    caseType: CaseTypeV2.ExploitatieHorecabedrijf,
    title: CaseTypeV2.ExploitatieHorecabedrijf,
    dateInBehandelingWorkflowStepTitle:
      'Horeca vergunning exploitatie Horecabedrijf - In behandeling nemen',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      date2: dateEnd,
      date6: dateStart,
      text6: location,
    },
  };

export const RVVHeleStad: DecosZaakTypeTransformer<RVVHeleStadType> = {
  isActive: !IS_PRODUCTION,
  caseType: CaseTypeV2.RVVHeleStad,
  title: 'RVV-verkeersontheffing',
  dateInBehandelingWorkflowStepTitle:
    'Status bijwerken en notificatie verzenden - In behandeling',
  requirePayment: true,
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    date6: dateStart,
    date7: dateEnd,
    text49: kentekens,
  },
  addToSelectFieldsBase: ['text49'], // Kenteken,
  async afterTransform(vergunning, decosZaakSource, options) {
    vergunning.title = getCustomTitleForVergunningWithLicensePlates(vergunning);
    return vergunning;
  },
};

export const RVVSloterweg: DecosZaakTypeTransformer<RVVSloterwegType> = {
  isActive: true,
  caseType: CaseTypeV2.RVVSloterweg,
  title: 'RVV ontheffing Sloterweg',
  dateInBehandelingWorkflowStepTitle: 'RVV Sloterweg - Behandelen',
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
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
  addToSelectFieldsBase: ['text10'], // Kenteken
  decisionTranslations: {
    Ingetrokken: ['Ingetrokken door gemeente'],
  },
  async afterTransform(vergunning, zaakSource, options) {
    const dateVerleend =
      await options?.fetchDecosWorkflowDate?.('Status naar actief');

    if (dateVerleend) {
      vergunning['processed'] = true;
      // if the workflow verleend has run but there is no decision then its actually Verleend.
      // this decision (verleend) is not set by decos eventhough the actual permit is granted
      if (!vergunning.decision) {
        vergunning.decision = 'Verleend';
      }
    }

    // Override processed
    if (
      !vergunning.processed &&
      (vergunning.dateDecision || vergunning.decision)
    ) {
      vergunning['processed'] = true;
    }

    // Add zone to title
    if (vergunning.caseType === CaseTypeV2.RVVSloterweg) {
      if (vergunning.area && vergunning.kentekens) {
        vergunning.title = `RVV ontheffing ${vergunning.area} (${vergunning.kentekens})`;
      }
    }

    return vergunning;
  },
};

export const EigenParkeerplaats: DecosZaakTypeTransformer<EigenParkeerplaatsType> =
  {
    isActive: true,
    caseType: CaseTypeV2.EigenParkeerplaats,
    title: CaseTypeV2.EigenParkeerplaats,
    dateInBehandelingWorkflowStepTitle:
      'Status bijwerken en notificatie verzenden - In behandeling',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      date6: dateStart,
      date8: dateEnd,
      text13: kentekens,
      text14: { ...kentekens, name: 'vorigeKentekens' },
    },
    addToSelectFieldsBase: ['text13'], // Kenteken
    requirePayment: true,
    hasValidSourceData: (decosZaak) => {
      const dateNotBefore = new Date('2023-08-08');
      const dateRequest = parseISO(decosZaak.fields.document_date);

      return dateRequest >= dateNotBefore;
    },
    async afterTransform(vergunning, zaakSource) {
      vergunning.title =
        getCustomTitleForVergunningWithLicensePlates(vergunning);

      const locations: (typeof vergunning)['locations'] = [];

      if (zaakSource.fields.text25) {
        locations.push({
          type: zaakSource.fields.text17,
          street: zaakSource.fields.tex25,
          houseNumber: `${zaakSource.fields.num14 ?? ''}`,
          fiscalNumber: zaakSource.fields.text18,
          url: zaakSource.fields.text19,
        });
      }

      if (zaakSource.fields.streetLocation2) {
        locations.push({
          type: zaakSource.fields.text20,
          street: zaakSource.fields.text15,
          houseNumber: `${zaakSource.fields.num15 ?? ''}`,
          fiscalNumber: zaakSource.fields.text21,
          url: zaakSource.fields.text22,
        });
      }

      vergunning.locations = locations;

      const requestTypes: Record<string, EigenParkeerplaatsRequestType> = {
        bol9: 'Nieuwe aanvraag',
        bol8: 'Autodeelbedrijf',
        bol10: 'Kentekenwijziging',
        bol11: 'Verhuizing',
        bol7: 'Verlenging',
      };

      vergunning.requestTypes = Object.entries(requestTypes)
        .map(([decosFieldNameSource, targetValue]) => {
          return zaakSource.fields[decosFieldNameSource]
            ? targetValue
            : undefined;
        })
        .filter(
          (
            requestType: EigenParkeerplaatsRequestType | undefined
          ): requestType is EigenParkeerplaatsRequestType =>
            typeof requestType !== 'undefined'
        );

      return vergunning;
    },
  };

export const EigenParkeerplaatsOpheffen: DecosZaakTypeTransformer<EigenParkeerplaatsOpheffenType> =
  {
    isActive: true,
    caseType: CaseTypeV2.EigenParkeerplaatsOpheffen,
    title: CaseTypeV2.EigenParkeerplaatsOpheffen,
    dateInBehandelingWorkflowStepTitle:
      'Status bijwerken en notificatie verzenden - In behandeling',
    requirePayment: true,
    hasValidSourceData: EigenParkeerplaats.hasValidSourceData,
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      bol8: 'isCarsharingpermit',
      date8: 'dateEnd',
    },
    async afterTransform(vergunning, zaakSource) {
      vergunning.location = {
        street: zaakSource.fields.text25,
        houseNumber: zaakSource.fields.num14,
        type: zaakSource.fields.text17,
        url: zaakSource.fields.tex19,
        fiscalNumber: zaakSource.fields.tex18,
      };
      return vergunning;
    },
  };

export const TouringcarDagontheffing: DecosZaakTypeTransformer<TouringcarDagontheffingType> =
  {
    isActive: true,
    caseType: CaseTypeV2.TouringcarDagontheffing,
    title: CaseTypeV2.TouringcarDagontheffing,
    dateInBehandelingWorkflowStepTitle: 'Status naar in behandeling',
    requirePayment: true,
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      date6: dateStart,
      date7: dateEnd,
      text14: timeStart,
      text15: timeEnd,
      text10: kentekens,
      text7: destination,
    },
    addToSelectFieldsBase: ['text10'], // kentekens
    async afterTransform(vergunning) {
      vergunning.title =
        getCustomTitleForVergunningWithLicensePlates(vergunning);
      return vergunning;
    },
  };

export const TouringcarJaarontheffing: DecosZaakTypeTransformer<TouringcarJaarontheffingType> =
  {
    isActive: true,
    caseType: CaseTypeV2.TouringcarJaarontheffing,
    title: CaseTypeV2.TouringcarJaarontheffing,
    dateInBehandelingWorkflowStepTitle: 'Status naar In Behandeling',
    requirePayment: true,
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      date6: dateStart,
      date7: dateEnd,
      text39: kentekens,
      text7: destination,
      bol8: { name: 'routetest', transform: transformBoolean },
    },
    addToSelectFieldsBase: ['text39'], // Kenteken
    async afterTransform(vergunning) {
      if ('routetest' in vergunning && vergunning.routetest) {
        vergunning.title = 'Touringcar jaarontheffing met routetoets';
      }
      return vergunning;
    },
  };

export const WerkEnVervoerOpStraat: DecosZaakTypeTransformer<WerkzaamhedenEnVervoerOpStraatType> =
  {
    isActive: !IS_PRODUCTION,
    caseType: CaseTypeV2.WVOS,
    title: 'Werkzaamheden en vervoer op straat',
    dateInBehandelingWorkflowStepTitle: 'Status - In behandeling',
    requirePayment: true,
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      date6: dateStart,
      date7: dateEnd,
      text49: kentekens,
      text6: location,
    },
    addToSelectFieldsBase: ['text49'], // Kenteken
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

      if (vergunning.werkzaamheden.length > 1 && vergunning.decision) {
        vergunning.decision = 'Zie besluit';
      }

      vergunning.title =
        getCustomTitleForVergunningWithLicensePlates(vergunning);

      return vergunning;
    },
  };

const zaakTransformerEntries = Object.values({
  VakantieverhuurVergunningaanvraag,
  GPK,
  GPP,
  TVMRVVObject,
  EvenementMelding,
  EvenementVergunning,
  BZP,
  BZB,
  Flyeren,
  AanbiedenDiensten,
  NachtwerkOntheffing,
  ZwaarVerkeer,
  Samenvoegingsvergunning,
  Onttrekkingsvergunning,
  OnttrekkingsvergunningSloop,
  VormenVanWoonruimte,
  Splitsingsvergunning,
  VOBvergunning,
  ExploitatieHorecabedrijf,
  RVVHeleStad,
  RVVSloterweg,
  EigenParkeerplaats,
  EigenParkeerplaatsOpheffen,
  TouringcarDagontheffing,
  TouringcarJaarontheffing,
  WerkEnVervoerOpStraat,
}).map((zaakTransformer) => {
  return [zaakTransformer.caseType, zaakTransformer] as const;
});

export const decosZaakTransformers = Object.fromEntries(
  zaakTransformerEntries
) as Record<DecosCaseType, DecosZaakTypeTransformer>;
