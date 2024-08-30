import { Themas } from '../../universal/config/thema';
import { MyNotification } from '../../universal/types';
import { ExternalUrls } from './app';

export const WelcomeNotification: MyNotification = {
  id: 'welcome01',
  thema: Themas.NOTIFICATIONS,
  datePublished: new Date(2022, 0, 20).toISOString(),
  title: 'Welkom op Mijn Amsterdam!',
  hideDatePublished: true,
  description: `
      <p>
        De persoonlijke digitale pagina voor burgers
        en ondernemers bij de gemeente Amsterdam. Hier ziet u op 1 centrale
        plek:
      </p>
      <ul>
        <li>welke gegevens de gemeente van u heeft vastgelegd; </li>
        <li>hoe het met uw aanvraag staat; </li>
        <li>
          hoe u wijzigingen kunt doorgeven als er iets niet klopt;
        </li>
        <li> informatie over uw buurt op een overzichtelijke <MaRouterLink href={AppRoutes.BUURT}>kaart</MaRouterLink>.</li>
      </ul>
      <p>
      <a href="/uitleg">Hier</a> kunt u zien welke gegevens op dit moment getoond kunnen worden. Mijn Amsterdam wordt nog verder ontwikkeld en er komt steeds meer informatie bij.
      </p>
    `,
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
