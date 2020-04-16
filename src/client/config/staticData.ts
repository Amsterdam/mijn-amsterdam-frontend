import { ExternalUrls } from '../../universal/config/app';
import { Chapters } from '../../universal/config/chapter';
import { MyNotification } from '../../universal/types/App.types';

export const WelcomeNotification: MyNotification = {
  id: 'welcome01',
  chapter: Chapters.NOTIFICATIONS,
  datePublished: new Date(2019, 10, 11).toISOString(),
  title: 'Welkom op Mijn Amsterdam!',
  hideDatePublished: false,
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

export const MaintenanceNotification01: MyNotification = {
  id: 'maintenance01',
  chapter: Chapters.UPDATES,
  datePublished: new Date().toISOString(),
  title: 'Onderhoud Mijn Amsterdam',
  description: `Vanwege onderhoud is een deel van Mijn Amsterdam op 6 juni 2020 niet zichtbaar.
    Het gaat om uw persoonsgegevens, de gegevens van uw paspoort of ID-kaart en uw adres op de kaart.
    Onze excuses voor het ongemak.`,
};

export const MaintenanceNotification02: MyNotification = {
  id: 'maintenance02',
  chapter: Chapters.UPDATES,
  datePublished: new Date().toISOString(),
  title: 'Onderhoud Mijn Amsterdam',
  description: `Vanwege onderhoud is een deel van Mijn Amsterdam op 8 juni 2020 niet zichtbaar.
    Het gaat om uw ontheffing(en) voor, en overtredingen in de milieuzone.
    Onze excuses voor het ongemak.`,
};
