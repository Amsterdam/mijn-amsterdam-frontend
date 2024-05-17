import { Themas } from '../../universal/config/thema';
import { MyNotification } from '../../universal/types';
import { ExternalUrls } from './app';

export const WelcomeNotification: MyNotification = {
  id: 'welcome01',
  thema: Themas.NOTIFICATIONS,
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
  thema: Themas.NOTIFICATIONS,
  datePublished: new Date(2022, 0, 20).toISOString(),
  title: 'Welkom op Mijn Amsterdam!',
  hideDatePublished: false,
  description: `
      <p>
        Welkom op Mijn Amsterdam; uw persoonlijke digitale pagina bij de
        gemeente Amsterdam. Hier ziet u op 1 centrale plek:
      </p>
      <ul>
        <li>welke gegevens de gemeente van u heeft vastgelegd. </li>
        <li>welke producten en diensten u hebt bij de gemeente Amsterdam. </li>
        <li>
          wat de status is en hoe u het kunt doorgeven als er iets niet klopt.
        </li>
      </ul>
      <p>
        <strong>Voor Weesp nog niet alles zichtbaar op Mijn Amsterdam</strong><br/>
        Voor Weespers is nog niet alle informatie via Mijn Amsterdam zichtbaar. In de aanloop van
        de fusie tussen gemeente Amsterdam en Weesp op 24 maart 2022 en de
        maanden erna komen er steeds meer producten en diensten bij.
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

export const WelcomeNotification2Commercial: MyNotification = {
  id: 'welcome02-commercial',
  thema: Themas.NOTIFICATIONS,
  datePublished: new Date(2022, 0, 20).toISOString(),
  title: 'Welkom op Mijn Amsterdam!',
  hideDatePublished: false,
  description: `<p>
        Welkom op Mijn Amsterdam; de persoonlijke digitale pagina voor burgers
        en ondernemers bij de gemeente Amsterdam. Hier ziet u op 1 centrale
        plek:
      </p>
      <ul>
        <li>welke gegevens de gemeente van u heeft vastgelegd. </li>
        <li>welke producten en diensten u hebt bij de gemeente Amsterdam. </li>
        <li>
          wat de status is en hoe u het kunt doorgeven als er iets niet klopt.
        </li>
      </ul>
      <p>
        <strong>Voor Weesp nog niet alles zichtbaar op Mijn Amsterdam</strong><br/>
        Voor ondernemers uit Weesp is nog niet alle informatie via Mijn Amsterdam zichtbaar. In
        de aanloop van de fusie tussen gemeente Amsterdam en Weesp op 24 maart
        2022 en de maanden erna komen er steeds meer producten en diensten bij.
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
