import { ApiUrls } from 'App.constants';
import paginatedApiHook from './paginated-api.hook';
import { differenceInCalendarDays } from 'date-fns';

export const Labels = {
  Participatiewet: {
    about: 'Bijstandsuitkering',
    aanvraag: {
      label: 'Aanvraag Bijstandsuitkering',
      title: 'Wij hebben uw aanvraag voor een bijstandsuitkering ontvangen.',
      cardContent: ' ',
      content:
        'U hebt op __registration-date__ een bijstandsuitkering aangevraagd.',
      summary: 'Wij verwerken uw aanvraag',
    },
    inBehandeling: {
      label: 'In behandeling',
      title:
        'Wij hebben uw aanvraag voor een bijstandsuitkering in behandeling genomen op __modified-date__.',
      cardContent: ' ',
      content:
        'Wij gaan nu bekijken of u recht hebt op bijstand. Het kan zijn dat u nog extra informatie moet opsturen.\nU ontvangt vóór __deadline__ ons besluit.',
      summary: 'Wij behandelen uw aanvraag',
    },
    herstelTermijn: {
      label: 'Meer informatie nodig',
      title:
        'Er is meer informatie en tijd nodig om uw aanvraag voor een bijstandsuitkering te behandelen.',
      cardContent: ' ',
      content:
        'Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken. Bekijk de brief voor meer details.\nU moet de extra informatie vóór __user-deadline__ opsturen. Dan ontvangt u vóór __herstertermijn-deadline__ ons besluit.\n\nTip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder wij verder kunnen met de behandeling van uw aanvraag.',
      summary: 'Neem actie',
    },
    beslissing: {
      afwijzing: {
        label: 'Besluit',
        title:
          'U heeft geen recht op een bijstandsuitkering (besluit: __modified-date__).',
        cardContent: ' ',
        content:
          'U heeft geen recht op een bijstandsuitkering. De reden voor afwijzing is __besluit-reden__. Bekijk de brief voor meer details.',
        summary: 'Afgewezen',
      },
      intrekking: {
        label: 'Besluit',
        title:
          'U hebt op __modified-date__ uw aanvraag voor een bijstandsuitkering ingetrokken.',
        cardContent: ' ',
        content:
          'U hebt uw aanvraag voor een bijstandsuitkering op __modified-date__ ingetrokken. Bekijk de brief voor meer details.',
        summary: 'Ingetrokken',
      },
      buiten_behandeling: {
        label: 'Besluit',
        title:
          'Wij hebben op __modified-date__ uw aanvraag voor een bijstandsuitkering buiten behandeling gesteld.',
        cardContent: ' ',
        content:
          'U hebt de extra informatie niet op tijd ingeleverd. Daarom stoppen wij met het verwerken van uw aanvraag. Bekijk de brief voor meer details.',
        summary: 'Buiten behandeling gesteld',
      },
      label: 'Besluit',
      title:
        'U heeft recht op een bijstandsuitkering (besluit: __modified-date__).',
      cardContent: ' ',
      content:
        'U heeft recht op een bijstandsuitkering. Bekijk de brief voor meer details.',
      summary: 'Afgerond',
    },
  },
  'Bijzondere Bijstand': {
    about: 'Bijzondere bijstand',
    aanvraag: {
      label: 'Aanvraag',
      title:
        'Wij hebben uw aanvraag voor bijzondere bijstand ontvangen op __registration-date__.',
      cardContent: ' ',
      content:
        'U hebt op __registration-date__ een bijzondere bijstandsuitkering aangevraagd.',
      summary: 'Wij verwerken uw aanvraag',
    },
    inBehandeling: {
      label: 'In behandeling',
      title:
        'Wij hebben uw aanvraag voor bijzondere bijstand in behandeling genomen op __modified-date__.',
      cardContent: ' ',
      content:
        'Wij gaan nu bekijken of u recht hebt op bijzondere bijstand. Het kan zijn dat u nog extra informatie moet opsturen.\nU ontvangt vóór __deadline__ ons besluit.',
      summary: 'Wij behandelen uw aanvraag',
    },
    herstelTermijn: {
      label: 'Meer informatie nodig',
      title:
        'Er is meer informatie en tijd nodig om uw aanvraag voor bijzondere bijstand te behandelen.',
      cardContent: ' ',
      content:
        'Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken. Bekijk de brief voor meer details.\nU moet de extra informatie vóór __user-deadline__ opsturen. Dan ontvangt u vóór __herstertermijn-deadline__ ons besluit.\n\nTip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder wij verder kunnen met de behandeling van uw aanvraag.',
      summary: 'Neem actie',
    },
    beslissing: {
      afwijzing: {
        label: 'Besluit',
        title:
          'U heeft geen recht op bijzondere bijstand (besluit: __modified-date__).',
        cardContent: ' ',
        content:
          'U heeft geen recht op bijzondere bijstand. De reden voor afwijzing is __besluit-reden__. Bekijk de brief voor meer details.',
        summary: 'Afgewezen',
      },
      label: 'Besluit',
      title:
        'U heeft recht op bijzondere bijstand (besluit: __modified-date__).',
      cardContent: ' ',
      content:
        'U heeft recht op bijzondere bijstand. Bekijk de brief voor meer details.',
      summary: 'Afgerond',
    },
  },
  Minimafonds: {
    about: 'Stadspas',
    aanvraag: {
      label: 'Aanvraag',
      title:
        'Wij hebben uw aanvraag voor een Stadspas ontvangen op __registration-date__.',
      cardContent: ' ',
      content: 'U hebt op __registration-date__ een Stadspas aangevraagd.',
      summary: 'Wij verwerken uw aanvraag',
    },
    inBehandeling: {
      label: 'In behandeling',
      title:
        'Wij hebben uw aanvraag voor een Stadspas in behandeling genomen op __modified-date__.',
      cardContent: ' ',
      content:
        'Het kan zijn dat u nog extra informatie moet opsturen.\nU ontvangt vóór __deadline__ ons besluit.\nLet op: Deze status informatie betreft alleen uw aanvraag voor een Stadspas; uw eventuele andere Hulp bij Laag Inkomen producten worden via post en/of telefoon afgehandeld.',
      summary: 'Wij behandelen uw aanvraag',
    },
    herstelTermijn: {
      label: 'Meer informatie nodig',
      title:
        'Er is meer informatie en tijd nodig om uw aanvraag voor een Stadspas te behandelen.',
      cardContent: ' ',
      content:
        'Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken. Bekijk de brief voor meer details.\nU moet de extra informatie vóór __user-deadline__ opsturen. Dan ontvangt u vóór __herstertermijn-deadline__ ons besluit.\n\nTip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder wij verder kunnen met de behandeling van uw aanvraag.',
      summary: 'Neem actie',
    },
    beslissing: {
      afwijzing: {
        label: 'Besluit',
        title:
          'U heeft geen recht op een Stadspas (besluit: __modified-date__).',
        cardContent: ' ',
        content:
          'U heeft geen recht op een Stadspas. De reden voor afwijzing is __besluit-reden__. Bekijk de brief voor meer details.',
        summary: 'Afgewezen',
      },
      label: 'Besluit',
      title: 'U heeft recht op een Stadspas (besluit: __modified-date__).',
      cardContent: ' ',
      content:
        'U heeft recht op een Stadspas. Bekijk de brief voor meer details.',
      summary: 'Afgerond',
    },
  },
};

// TEST Data is too old to render current cases
const DATE_NOW = '2016-11-03';

export default (offset, limit) => {
  const api = paginatedApiHook(ApiUrls.FOCUS, offset, limit);
  // NOTE: Temporary take data from focus api
  const isActual = item => {
    return (
      differenceInCalendarDays(DATE_NOW, item.processtappen.aanvraag.datum) <
      item.dienstverleningstermijn
    );
  };

  const items = !(api.data && api.data.items)
    ? Object.values(api.data)
        .filter(
          item =>
            !!(
              item &&
              item.processtappen &&
              item.processtappen.inBehandeling
            ) && isActual(item)
        )
        .map(item => {
          const latestType = item._meest_recent;
          const dateModified = item.processtappen[latestType].datum;
          return {
            chapter: 'INKOMEN',
            dateModified,
            title: `${Labels[item.soortProduct].about} - ${item.naam}`,
            to: '/inkomen',
          };
        })
    : [];
  return { ...api, data: { items } };
};
