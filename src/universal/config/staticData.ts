import { Chapters } from './chapter';
import { ExternalUrls } from './app';
import { MyNotification } from '../../client/hooks/api/my-notifications-api.hook';

export const WelcomeNotification: MyNotification = {
  id: 'welcome01',
  chapter: Chapters.UPDATES,
  datePublished: new Date(2019, 10, 11).toISOString(),
  title: 'Welkom op Mijn Amsterdam!',
  description:
    'Deze website is nog volop in ontwikkeling. Gaandeweg komt meer informatie voor u beschikbaar.',
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
