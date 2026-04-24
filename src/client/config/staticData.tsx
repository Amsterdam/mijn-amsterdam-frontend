import { MIJN_AMSTERDAM } from '../../universal/config/app.ts';
import type { MyNotification } from '../../universal/types/App.types.ts';
import { themaId } from '../pages/MyNotifications/MyNotifications-config.ts';

const year = 2022;
const day = 20;
const month = 0;

const UITLEG_PAGE = '/uitleg';

export const WelcomeNotification: MyNotification = {
  id: 'welcome01',
  themaID: themaId,
  themaTitle: MIJN_AMSTERDAM,
  datePublished: new Date(year, month, day).toISOString(),
  title: 'Welkom op Mijn Amsterdam!',
  hideDatePublished: true,
  description: `
      <p>
       Welkom op Mijn Amsterdam: dit is uw persoonlijke online portaal bij de gemeente Amsterdam. Hier ziet u op 1 centrale plek welke gegevens de gemeente van u heeft vastgelegd. U ziet hier ook wat u bij de gemeente heeft aangevraagd, hoe het met uw aanvraag staat en hoe u kunt doorgeven als er iets niet klopt.
      </p>
     `,
  customLink: {
    callback: () => {
      window.location.href = UITLEG_PAGE;
    },
    title: 'Dit kunt u zien in Mijn Amsterdam.',
  },
};
