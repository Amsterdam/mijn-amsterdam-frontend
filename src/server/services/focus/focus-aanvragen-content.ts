import { DocumentTitles } from './focus-types';
import { StepTitle, RequestStatus, LabelData } from './focus-types';
import { AppRoutes } from '../../../universal/config/routing';
import { generatePath } from 'react-router-dom';
import { defaultDateFormat } from '../../../universal/helpers';

export const stepLabels: Record<StepTitle, RequestStatus> = {
  aanvraag: 'Aanvraag',
  inBehandeling: 'In behandeling',
  herstelTermijn: 'Informatie nodig',
  beslissing: 'Besluit',
  bezwaar: 'Bezwaar',
};

// NOTE: MUST Keep in this order
export const processSteps: StepTitle[] = [
  'aanvraag',
  'inBehandeling',
  'herstelTermijn',
  'beslissing',
];

export const stepStatusLabels = stepLabels;

// NOTE: Possibly deprecated because it seems document titles actually contain meaningful names in the latest api response.
export const titleTranslations: DocumentTitles = {
  'LO: Aanvraag': 'Aanvraag bijstandsuitkering',
  'LO: Besluit': 'Besluit aanvraag bijstandsuitkering',
  'LO: In behandeling': 'Uw aanvraag is in behandeling genomen',
  'LO: Herstel': 'Verzoek om aanvullende informatie van u',
  Levensonderhoud: 'Bijstandsuitkering',
};

export const FocusExternalUrls = {
  BijstandsUitkeringAanvragenRechten:
    'https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?caseid=%7bF00E2134-0317-4981-BAE6-A4802403C2C5%7d',
  BijstandsUitkeringAanvragenPlichten:
    'https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?productid=%7b42A997C5-4FCA-4BC2-BF8A-95DFF6BE7121%7d',
  BijstandsUitkeringAanvragen:
    'https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?productid=%7BEC85F0ED-0D9E-46F3-8B2E-E80403D3D5EA%7D#case_%7BB7EF73CD-8A99-4F60-AB6D-02CB9A6BAF6F%7D',
  BetaalDataUitkering:
    'https://www.amsterdam.nl/veelgevraagd/?caseid=%7BEB3CC77D-89D3-40B9-8A28-779FE8E48ACE%7D',
  StadsPas: 'https://www.amsterdam.nl/stadspas',
};

/**
 * A library of messages and titles with which we construct the information shown to the client */
export const contentLabels: LabelData = {
  Participatiewet: {
    Bijstandsuitkering: {
      link: (product) => ({
        to: generatePath(AppRoutes['INKOMEN/BIJSTANDSUITKERING'], {
          id: product.id,
        }),
        title: 'Meer informatie',
      }),
      aanvraag: {
        notification: {
          title: (product) =>
            `${product.title}: Wij hebben uw aanvraag ontvangen`,
          description: (product) =>
            `Wij hebben uw aanvraag voor een bijstandsuitkering ontvangen op ${defaultDateFormat(
              product.dateStart
            )}.`,
        },
        status: stepLabels.aanvraag,
        description: (product) =>
          `
          <p>U hebt op ${defaultDateFormat(
            product.dateStart
          )} een bijstandsuitkering aangevraagd.</p>
          <p>
            <a
              href=${FocusExternalUrls.BijstandsUitkeringAanvragen}
              rel="external noopener noreferrer"
            >
              Wat kunt u van ons verwachten?
            </a>
          </p>
        `,
      },
      inBehandeling: {
        notification: {
          title: (product) => `${product.title}: Wij behandelen uw aanvraag`,
          description: (product) =>
            `Wij hebben uw aanvraag voor een bijstandsuitkering in behandeling genomen op ${defaultDateFormat(
              product.datePublished
            )}.`,
        },
        status: stepLabels.inBehandeling,
        description: (product, customData) =>
          `
          <p>
            Wij gaan nu bekijken of u recht hebt op bijstand. Het kan zijn dat u
            nog extra informatie moet opsturen. U ontvangt vóór ${customData.decisionDeadline1} ons besluit.
          </p>
          <p>
            Lees meer over uw
            <br />
            <a
              href=${FocusExternalUrls.BijstandsUitkeringAanvragenRechten}
              rel="external noopener noreferrer"
            >
              rechten
            </a> en <a
              href=${FocusExternalUrls.BijstandsUitkeringAanvragenPlichten}
              rel="external noopener noreferrer"
            >
              plichten
            </a>
          </p>
        `,
      },
      herstelTermijn: {
        notification: {
          title: (product) => `${product.title}: Meer informatie nodig`,
          description: (product) =>
            'Er is meer informatie en tijd nodig om uw aanvraag voor een bijstandsuitkering te behandelen.',
        },
        status: stepLabels.herstelTermijn,
        description: (product, customData) =>
          `
          <p>
            Wij hebben meer informatie en tijd nodig om uw aanvraag te
            verwerken. Bekijk de brief voor meer details. U moet de extra
            informatie vóór ${customData.userActionDeadline} opsturen. Dan ontvangt u
            vóór ${customData.decisionDeadline2} ons besluit.
          </p>
          <p>
            Tip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk
            in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder
            wij verder kunnen met de behandeling van uw aanvraag.
          </p>
        `,
      },
      beslissing: {
        afwijzing: {
          notification: {
            title: (product) => `${product.title}: Uw aanvraag is afgewezen`,
            description: (product) =>
              `U hebt geen recht op een bijstandsuitkering (besluit ${defaultDateFormat(
                product.datePublished
              )}).`,
          },
          status: stepLabels.beslissing,
          description: (product) =>
            'U hebt geen recht op een bijstandsuitkering. Bekijk de brief voor meer details.',
        },
        toekenning: {
          notification: {
            title: (product) => `${product.title}: Uw aanvraag is toegekend`,
            description: (product) =>
              `U hebt recht op een bijstandsuitkering (besluit ${defaultDateFormat(
                product.datePublished
              )}).`,
          },
          status: stepLabels.beslissing,
          description: (product) =>
            `
            <p>
              U hebt recht op een bijstandsuitkering. Bekijk de brief voor meer
              details.
            </p>
            <p>
              <a
                href=${FocusExternalUrls.BetaalDataUitkering}
                rel="external noopener noreferrer"
              >
                Bekijk hier de betaaldata van de uitkering
              </a>
            </p>
          `,
        },
        buitenbehandeling: {
          notification: {
            title: (product) =>
              `${product.title}: Wij behandelen uw aanvraag niet meer`,
            description: (product) => `Bekijk de brief voor meer details.`,
          },
          status: stepLabels.beslissing,
          description: (product) =>
            'Wij behandelen uw aanvraag niet meer. Bekijk de brief voor meer details.',
        },
      },
    },
  },
  Minimafonds: {
    Stadspas: {
      link: (product) => ({
        to: generatePath(AppRoutes['INKOMEN/STADSPAS/AANVRAAG'], {
          id: product.id,
        }),
        title: 'Meer informatie',
      }),
      aanvraag: {
        notification: {
          title: (product) =>
            `${product.title}: Wij hebben uw aanvraag ontvangen`,
          description: (product) =>
            `Wij hebben uw aanvraag voor een Stadspas ontvangen op ${defaultDateFormat(
              product.dateStart
            )}.`,
        },
        status: stepLabels.aanvraag,
        description: (product) =>
          `U hebt op ${defaultDateFormat(
            product.datePublished
          )} een Stadspas aangevraagd.`,
      },
      inBehandeling: {
        notification: {
          title: (product) => `${product.title}: Wij behandelen uw aanvraag`,
          description: (product) =>
            `Wij hebben uw aanvraag voor een Stadspas in behandeling genomen op ${defaultDateFormat(
              product.datePublished
            )}.`,
        },
        status: stepLabels.inBehandeling,
        description: (product, customData) =>
          `
          <p>
            Het kan zijn dat u nog extra informatie moet opsturen. U ontvangt
            vóór ${customData.decisionDeadline1} ons besluit.
          </p>
          <p>
            <strong>
              Let op: Deze statusinformatie betreft alleen uw aanvraag voor een
              Stadspas.
            </strong>
            <br />
            Uw eventuele andere Hulp bij Laag Inkomen producten worden via post
            en/of telefoon afgehandeld.
          </p>
        `,
      },
      herstelTermijn: {
        notification: {
          title: (product) => `${product.title}: Meer informatie nodig`,
          description: (product) =>
            'Er is meer informatie en tijd nodig om uw aanvraag voor een Stadspas te behandelen.',
        },
        status: stepLabels.herstelTermijn,
        description: (product, customData) =>
          `
          <p>
            Wij hebben meer informatie en tijd nodig om uw aanvraag te
            verwerken. Bekijk de brief voor meer details. U moet de extra
            informatie vóór ${customData.userActionDeadline} opsturen. Dan ontvangt u
            vóór ${customData.decisionDeadline2} ons besluit.
          </p>
          <p>
            Tip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk
            in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder
            wij verder kunnen met de behandeling van uw aanvraag.
          </p>
        `,
      },
      beslissing: {
        afwijzing: {
          notification: {
            title: (product) => `${product.title}: Uw aanvraag is afgewezen`,
            description: (product) =>
              `U hebt geen recht op een Stadspas (besluit ${defaultDateFormat(
                product.datePublished
              )}).`,
          },
          status: stepLabels.beslissing,
          description: (product) =>
            'U hebt geen recht op een Stadspas. Bekijk de brief voor meer details.',
        },
        toekenning: {
          notification: {
            title: (product) => `${product.title}: Uw aanvraag is toegekend`,
            description: (product) =>
              'U hebt recht op een Stadspas. Bekijk de brief voor meer details.',
          },
          status: stepLabels.beslissing,
          description: (product) =>
            `
            <p>
              U hebt recht op een Stadspas. Bekijk de brief voor meer details.
            </p>
            <p>
              <a href="${FocusExternalUrls.StadsPas}" rel="external noopener noreferrer">
                Meer informatie over de Stadspas
              </a>
            </p>
          `,
        },
        buitenbehandeling: {
          notification: {
            title: (product) =>
              `${product.title}: Wij behandelen uw aanvraag niet meer`,
            description: (product) => `Bekijk de brief voor meer details.`,
          },
          status: stepLabels.beslissing,
          description: (product) =>
            'Wij behandelen uw aanvraag niet meer. Bekijk de brief voor meer details.',
        },
      },
    },
  },
};
