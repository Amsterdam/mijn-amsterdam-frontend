import { AppRoutes } from 'App.constants';
import { defaultDateFormat } from 'helpers/App';
import { LinkProps } from '../App.types';
import { Chapter, Chapters } from '../App.constants';
import Inkomen from 'pages/Inkomen/Inkomen';
import { differenceInCalendarDays, parse, addMonths } from 'date-fns';

type StepName = 'aanvraag' | 'inBehandeling' | 'herstelTermijn' | 'beslissing';
type DecisionName = 'afwijzing' | 'intrekking' | 'buitenBehandeling';
type DecisionType = 'Toekenning' | 'Afwijzing';
type ProductName = 'Participatiewet' | 'Bijzondere Bijstand' | 'Minimafonds';

interface Article {
  title: string;
  subtitle: string;
  description: string;
  status: string;
}

interface ProductType {
  aanvraag: Article;
  inBehandeling: Article;
  herstelTermijn: Article;
  beslissing: Article & {
    afwijzing?: Article;
    intrekking?: Article;
    buitenBehandeling?: Article; // NOTE: not implemented yet
  };
}

interface LabelData {
  Participatiewet: ProductType;
  'Bijzondere Bijstand': ProductType;
  Minimafonds: ProductType;
}

interface Document {
  $ref: string;
  id: number;
  isBulk: boolean;
  isDms: boolean;
  omschrijving: string;
}

interface Step {
  document: Document[];
  datum: string;
}

interface FocusProduct {
  _id: string;
  _meest_recent: StepName;
  soortProduct: ProductName;
  typeBesluit: DecisionType;
  naam: string;
  processtappen: {
    aanvraag: Step;
    inBehandeling: Step;
    herstelTermijn: Step;
    beslissing: Step;
  };
}

type FocusApiResponse = FocusProduct[];

export const Labels: LabelData = {
  Participatiewet: {
    aanvraag: {
      title: 'Aanvraag {title}',
      subtitle: 'Wij hebben uw aanvraag voor een bijstandsuitkering ontvangen.',
      description:
        'U hebt op {datePublished} een bijstandsuitkering aangevraagd.',
      status: 'Wij verwerken uw aanvraag',
    },
    inBehandeling: {
      title: '{title} in behandeling',
      subtitle:
        'Wij hebben uw aanvraag voor een bijstandsuitkering in behandeling genomen op {datePublished}.',
      description:
        'Wij gaan nu bekijken of u recht hebt op bijstand. Het kan zijn dat u nog extra informatie moet opsturen.\nU ontvangt vóór {deadline} ons besluit.',
      status: 'Wij behandelen uw aanvraag',
    },
    herstelTermijn: {
      title: 'Meer informatie nodig over {title}',
      subtitle:
        'Er is meer informatie en tijd nodig om uw aanvraag voor een bijstandsuitkering te behandelen.',
      description:
        'Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken. Bekijk de brief voor meer details.\nU moet de extra informatie vóór {user-deadline} opsturen. Dan ontvangt u vóór {herstertermijn-deadline} ons besluit.\n\nTip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder wij verder kunnen met de behandeling van uw aanvraag.',
      status: 'Neem actie',
    },
    beslissing: {
      afwijzing: {
        title: 'Besluit {title}',
        subtitle:
          'U heeft geen recht op een bijstandsuitkering (besluit: {datePublished}).',
        description:
          'U heeft geen recht op een bijstandsuitkering. De reden voor afwijzing is {besluit-reden}. Bekijk de brief voor meer details.',
        status: 'Afgewezen',
      },
      intrekking: {
        title: 'Besluit {title}',
        subtitle:
          'U hebt op {datePublished} uw aanvraag voor een bijstandsuitkering ingetrokken.',
        description:
          'U hebt uw aanvraag voor een bijstandsuitkering op {datePublished} ingetrokken. Bekijk de brief voor meer details.',
        status: 'Ingetrokken',
      },
      buitenBehandeling: {
        title: 'Besluit {title}',
        subtitle:
          'Wij hebben op {datePublished} uw aanvraag voor een bijstandsuitkering buiten behandeling gesteld.',
        description:
          'U hebt de extra informatie niet op tijd ingeleverd. Daarom stoppen wij met het verwerken van uw aanvraag. Bekijk de brief voor meer details.',
        status: 'Buiten behandeling gesteld',
      },
      title: 'Besluit {title}',
      subtitle:
        'U heeft recht op een bijstandsuitkering (besluit: {datePublished}).',
      description:
        'U heeft recht op een bijstandsuitkering. Bekijk de brief voor meer details.',
      status: 'Afgerond',
    },
  },
  'Bijzondere Bijstand': {
    aanvraag: {
      title: 'Aanvraag {title}',
      subtitle:
        'Wij hebben uw aanvraag voor bijzondere bijstand ontvangen op {datePublished}.',
      description:
        'U hebt op {datePublished} een bijzondere bijstandsuitkering aangevraagd.',
      status: 'Wij verwerken uw aanvraag',
    },
    inBehandeling: {
      title: '{title} in behandeling',
      subtitle:
        'Wij hebben uw aanvraag voor bijzondere bijstand in behandeling genomen op {datePublished}.',
      description:
        'Wij gaan nu bekijken of u recht hebt op bijzondere bijstand. Het kan zijn dat u nog extra informatie moet opsturen.\nU ontvangt vóór {deadline} ons besluit.',
      status: 'Wij behandelen uw aanvraag',
    },
    herstelTermijn: {
      title: 'Meer informatie nodig - {title}',
      subtitle:
        'Er is meer informatie en tijd nodig om uw aanvraag voor bijzondere bijstand te behandelen.',
      description:
        'Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken. Bekijk de brief voor meer details.\nU moet de extra informatie vóór {user-deadline} opsturen. Dan ontvangt u vóór {herstertermijn-deadline} ons besluit.\n\nTip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder wij verder kunnen met de behandeling van uw aanvraag.',
      status: 'Neem actie',
    },
    beslissing: {
      afwijzing: {
        title: 'Besluit {title}',
        subtitle:
          'U heeft geen recht op bijzondere bijstand (besluit: {datePublished}).',
        description:
          'U heeft geen recht op bijzondere bijstand. De reden voor afwijzing is {besluit-reden}. Bekijk de brief voor meer details.',
        status: 'Afgewezen',
      },
      title: 'Besluit {title}',
      subtitle:
        'U heeft recht op bijzondere bijstand (besluit: {datePublished}).',
      description:
        'U heeft recht op bijzondere bijstand. Bekijk de brief voor meer details.',
      status: 'Afgerond',
    },
  },
  Minimafonds: {
    aanvraag: {
      title: 'Aanvraag {title}',
      subtitle:
        'Wij hebben uw aanvraag voor een Stadspas ontvangen op {datePublished}.',
      description: 'U hebt op {datePublished} een Stadspas aangevraagd.',
      status: 'Wij verwerken uw aanvraag',
    },
    inBehandeling: {
      title: '{title} in behandeling',
      subtitle:
        'Wij hebben uw aanvraag voor een Stadspas in behandeling genomen op {datePublished}.',
      description:
        'Het kan zijn dat u nog extra informatie moet opsturen.\nU ontvangt vóór {deadline} ons besluit.\nLet op: Deze status informatie betreft alleen uw aanvraag voor een Stadspas; uw eventuele andere Hulp bij Laag Inkomen producten worden via post en/of telefoon afgehandeld.',
      status: 'Wij behandelen uw aanvraag',
    },
    herstelTermijn: {
      title: 'Meer informatie nodig {title}',
      subtitle:
        'Er is meer informatie en tijd nodig om uw aanvraag voor een Stadspas te behandelen.',
      description:
        'Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken. Bekijk de brief voor meer details.\nU moet de extra informatie vóór {user-deadline} opsturen. Dan ontvangt u vóór {herstertermijn-deadline} ons besluit.\n\nTip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder wij verder kunnen met de behandeling van uw aanvraag.',
      status: 'Neem actie',
    },
    beslissing: {
      afwijzing: {
        title: 'Besluit {title}',
        subtitle:
          'U heeft geen recht op een Stadspas (besluit: {datePublished}).',
        description:
          'U heeft geen recht op een Stadspas. De reden voor afwijzing is {besluit-reden}. Bekijk de brief voor meer details.',
        status: 'Afgewezen',
      },
      title: 'Besluit',
      subtitle: 'U heeft recht op een Stadspas (besluit: {datePublished}).',
      description:
        'U heeft recht op een Stadspas. Bekijk de brief voor meer details.',
      status: 'Afgerond',
    },
  },
};

export interface FocusItem {
  id: string;
  datePublished: string;
  title: string;
  subtitle: string;
  description: string;
  status: string;
  inProgress: boolean;
  chapter: Chapter;
  link: LinkProps;
}

const HISTORIC_DAYS_THRESHOLD = 28;

function isInProgess(
  decisionType: DecisionType,
  steps: FocusProduct['processtappen'],
  latestStep: StepName
) {
  const noDecision = !decisionType;

  let aMonthHasPasedSinceDecision = false;

  if (steps.beslissing) {
    aMonthHasPasedSinceDecision =
      addMonths(steps.beslissing.datum, 1) > new Date();
  }

  return noDecision || aMonthHasPasedSinceDecision;
}

function translateTitle(title: string) {
  switch (title) {
    case 'Levensonderhoud':
      return 'Bijstandsuitkering';
  }
  return title;
}

function replaceWith(text: string, data: any) {
  const matches = text.match(/[^{\}]+(?=})/g);
  if (Array.isArray(matches)) {
    return matches.reduce((text, key) => {
      return text.replace(`{${key}}`, data[key] || '');
    }, text);
  }
  return text;
}

function formatFocusProduct(product: FocusProduct): FocusItem {
  const {
    _meest_recent: latestStep,
    soortProduct: productType,
    typeBesluit: decisionType,
    processtappen: steps,
    naam: title,
    _id: id,
  } = product;

  const stepData = steps[latestStep];
  const stepLabels = Labels[productType][latestStep];

  const sourceData = {
    title: translateTitle(title),
    datePublished: defaultDateFormat(stepData.datum),
    decisionType,
  };

  return {
    id,
    chapter: Chapters.INKOMEN,
    datePublished: stepData.datum,
    title: replaceWith(stepLabels.title, sourceData),
    subtitle: replaceWith(stepLabels.subtitle, sourceData),
    description: replaceWith(stepLabels.description, sourceData),
    status: decisionType,
    inProgress: isInProgess(decisionType, steps, latestStep),
    link: {
      title: 'Meer informatie',
      to: `${AppRoutes.INKOMEN}/${id}`,
    },
  };
}

export default function formatFocusApiResponse(
  products: FocusApiResponse
): FocusItem[] {
  return products.map(product => formatFocusProduct(product));
}
