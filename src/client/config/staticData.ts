import { ExternalUrls } from '../../universal/config/app';
import { Chapters } from '../../universal/config/chapter';
import { MyNotification } from '../../universal/types/App.types';

export const WelcomeNotification: MyNotification = {
  id: 'welcome01',
  chapter: Chapters.NOTIFICATIONS,
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
