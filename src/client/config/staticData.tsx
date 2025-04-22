import { ExternalUrls } from './app';
import { ThemaIDs } from '../../universal/config/thema';
import { MyNotification } from '../../universal/types/App.types';

const year = 2022;
const day = 20;
const month = 0;
export const WelcomeNotification: MyNotification = {
  id: 'welcome01',
  themaID: ThemaIDs.NOTIFICATIONS,
  themaTitle: 'Mijn Amsterdam',
  datePublished: new Date(year, month, day).toISOString(),
  title: 'Welkom op Mijn Amsterdam!',
  hideDatePublished: true,
  description: `
      <p>
        De persoonlijke digitale pagina voor burgers en ondernemers bij de
        gemeente Amsterdam. Hier ziet u op 1 centrale plek:
      </p>
      <ul>
        <li>welke gegevens de gemeente van u heeft vastgelegd; </li>
        <li>hoe het met uw aanvraag staat; </li>
        <li>hoe u wijzigingen kunt doorgeven als er iets niet klopt;</li>
        <li>
          informatie over uw buurt op een overzichtelijke
          <a href=/buurt>kaart</a>.
        </li>
      </ul>
      <p>
        <a href=/uitleg>Hier</a> kunt u
        zien welke gegevens op dit moment getoond kunnen worden. Mijn Amsterdam
        wordt nog verder ontwikkeld en er komt steeds meer informatie bij.
      </p>`,
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
