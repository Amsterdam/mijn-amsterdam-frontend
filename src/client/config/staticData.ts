import { Chapters } from '../../universal/config/chapter';
import { MyNotification } from '../../universal/types';
import { ExternalUrls } from './app';

export const WelcomeNotification: MyNotification = {
  id: 'welcome01',
  chapter: Chapters.NOTIFICATIONS,
  datePublished: new Date(2019, 10, 11).toISOString(),
  title: 'Welkom op Mijn Amsterdam!',
  hideDatePublished: true,
  description:
    'Mijn Amsterdam is nog volop in ontwikkeling. Er komt steeds meer informatie bij.',
  customLink: {
    callback: () => {
      const usabilla = (window as any).usabilla_live;
      if (usabilla) {
        usabilla('click');
      } else {
        window.location.href = ExternalUrls.CONTACT_FORM;
      }
    },
    title: 'Laat ons weten wat u ervan vindt',
  },
};

export const WelcomeNotification2: MyNotification = {
  id: 'welcome02',
  chapter: Chapters.NOTIFICATIONS,
  datePublished: new Date(2022, 1, 20).toISOString(),
  title:
    'Welkom op Mijn Amsterdam; uw persoonlijke digitale pagina bij de gemeente Amsterdam.',
  hideDatePublished: true,
  description: `Welkom op Mijn Amsterdam; uw persoonlijke digitale pagina bij de gemeente 
Amsterdam. Hier ziet u op 1 centrale plek:

• welke gegevens de gemeente van u heeft vastgelegd. 
• welke producten en diensten u hebt bij de gemeente Amsterdam. 
• wat de status is en hoe u het kunt doorgeven als er iets niet klopt.

Voor Weesp nog niet alles zichtbaar op Mijn Amsterdam
Voor Weespers is nog niet alle informatie via Mijn Amsterdam zichtbaar. In de aanloop 
van de fusie tussen gemeente Amsterdam en Weesp op 24 maart 2022 en de maanden 
erna komen er steeds meer producten en diensten bij.`,
  customLink: {
    callback: () => {
      const usabilla = (window as any).usabilla_live;
      if (usabilla) {
        usabilla('click');
      } else {
        window.location.href = ExternalUrls.CONTACT_FORM;
      }
    },
    title: 'Laat ons weten wat u ervan vindt',
  },
};

export const WelcomeNotification2Commercial: MyNotification = {
  id: 'welcome02-commercial',
  chapter: Chapters.NOTIFICATIONS,
  datePublished: new Date(2022, 1, 20).toISOString(),
  title:
    'Welkom op Mijn Amsterdam; uw persoonlijke digitale pagina bij de gemeente Amsterdam.',
  hideDatePublished: true,
  description: `Welkom op Mijn Amsterdam; de persoonlijke digitale pagina voor burgers en 
ondernemers bij de gemeente Amsterdam. Hier ziet u op 1 centrale plek:

• welke gegevens de gemeente van u heeft vastgelegd. 
• welke producten en diensten u hebt bij de gemeente Amsterdam. 
• wat de status is en hoe u het kunt doorgeven als er iets niet klopt. 

Voor Weesp nog niet alles zichtbaar op Mijn Amsterdam
Voor ondernemers uit Weesp is nog niet alle informatie via Mijn Amsterdam zichtbaar. 
In de aanloop van de fusie tussen gemeente Amsterdam en Weesp op 24 maart 2022 en 
de maanden erna komen er steeds meer producten en diensten bij.`,
  customLink: {
    callback: () => {
      const usabilla = (window as any).usabilla_live;
      if (usabilla) {
        usabilla('click');
      } else {
        window.location.href = ExternalUrls.CONTACT_FORM;
      }
    },
    title: 'Laat ons weten wat u ervan vindt',
  },
};
