import { MyNotification } from 'hooks/api/my-notifications-api.hook';
import { ExternalUrls } from './App.constants';
import { Chapters } from './Chapter.constants';

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

export const MaintenanceNotification: MyNotification = {
  id: 'maintenance01',
  chapter: Chapters.UPDATES,
  datePublished: new Date(2020, 5, 6).toISOString(),
  title: 'Onderhoud Mijn Amsterdam',
  description: `Vanwege onderhoud is een deel van Mijn Amsterdam nu niet zichtbaar.
    Het gaat om uw persoonsgegevens, de gegevens van uw paspoort of ID-kaart en uw adres op de kaart.
    Vanaf 13:00 uur ziet u al uw gegevens weer. Onze excuses voor het ongemak.`,
};
