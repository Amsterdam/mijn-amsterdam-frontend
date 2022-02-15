import { defaultDateFormat } from '../../../../universal/helpers';
import { WpiRequestProcessLabels } from '../focus-types';

export const requestProcess: WpiRequestProcessLabels = {
  aanvraag: {
    notification: {
      title: (requestProcess) =>
        `${requestProcess.title}: Wij hebben uw aanvraag ontvangen`,
      description: (requestProcess) =>
        `Wij hebben uw aanvraag voor een Stadspas ontvangen op ${defaultDateFormat(
          requestProcess.dateStart
        )}.`,
    },
    description: (requestProcess) =>
      `U hebt op ${defaultDateFormat(
        requestProcess.datePublished
      )} een Stadspas aangevraagd.`,
  },
  inBehandeling: {
    notification: {
      title: (requestProcess) =>
        `${requestProcess.title}: Wij behandelen uw aanvraag`,
      description: (requestProcess) =>
        `Wij hebben uw aanvraag voor een Stadspas in behandeling genomen op ${defaultDateFormat(
          requestProcess.datePublished
        )}.`,
    },
    description: (product, statusStep) =>
      `
          <p>
            Het kan zijn dat u nog extra informatie moet opsturen. U ontvangt
            vóór ${statusStep?.dateDecisionExpected} ons besluit.
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
      title: (requestProcess) =>
        `${requestProcess.title}: Meer informatie nodig`,
      description: (requestProcess) =>
        'Er is meer informatie en tijd nodig om uw aanvraag voor een Stadspas te behandelen.',
    },
    description: (product, statusStep) =>
      `
          <p>
            Wij hebben meer informatie en tijd nodig om uw aanvraag te
            verwerken. Bekijk de brief voor meer details. U moet de extra
            informatie vóór ${statusStep?.dateUserFeedbackExpected} opsturen. Dan ontvangt u
            vóór ${statusStep?.dateDecisionExpected} ons besluit.
          </p>
          <p>
            Tip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk
            in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder
            wij verder kunnen met de behandeling van uw aanvraag.
          </p>
        `,
  },
  besluit: {
    notification: {
      title: (requestProcess) => {
        switch (requestProcess.decision) {
          case 'afwijzing':
            return `${requestProcess.title}: Uw aanvraag is afgewezen`;
          case 'toekenning':
            return `${requestProcess.title}: Uw aanvraag is toegekend`;
          case 'buitenbehandeling':
            return `${requestProcess.title}: Wij behandelen uw aanvraag niet meer`;
        }
        return '';
      },
      description: (requestProcess) => {
        switch (requestProcess.decision) {
          case 'afwijzing':
            return `U hebt geen recht op een Stadspas (besluit ${defaultDateFormat(
              requestProcess.datePublished
            )}).`;
          case 'toekenning':
            return `U hebt recht op een Stadspas (besluit ${defaultDateFormat(
              requestProcess.datePublished
            )}).`;
          case 'buitenbehandeling':
            return `${requestProcess.title}: Wij behandelen uw aanvraag niet meer`;
        }

        return `Bekijk de brief voor meer details.`;
      },
    },
    description: (requestProcess) => {
      switch (requestProcess.decision) {
        case 'afwijzing':
          return `U hebt geen recht op een Stadspas. Bekijk de brief voor meer details.`;
        case 'toekenning':
          return 'U hebt recht op een Stadspas. Bekijk de brief voor meer details.';
        case 'buitenbehandeling':
          return 'Wij behandelen uw aanvraag niet meer. Bekijk de brief voor meer details.';
      }
      return '';
    },
  },
};
