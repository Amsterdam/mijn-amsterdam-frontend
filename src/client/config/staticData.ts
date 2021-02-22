import { ExternalUrls } from './app';
import { Chapters } from '../../universal/config/chapter';
import { MyNotification } from '../../universal/types';

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
