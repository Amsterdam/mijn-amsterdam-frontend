import { AppRoutes, ExternalUrls } from '../../../universal/config';
import React, { useState } from 'react';

import { LinkList } from './MainFooter.constants';
import Linkd from '../Button/Button';
import { LinkdInline } from '../Button/Button';
import classnames from 'classnames';
import styles from './MainFooter.module.scss';
import { useDesktopScreen } from '../../hooks/media.hook';

interface PanelState {
  [panelId: string]: boolean;
}

export default function MainFooter() {
  const [panelStates, setPanelState] = useState<PanelState>({});
  function togglePanel(panelId: string) {
    const isOpen = !panelStates[panelId];
    setPanelState({
      ...panelStates,
      [panelId]: isOpen,
    });
  }

  const titleRole = useDesktopScreen() ? 'columnheader' : 'button';

  return (
    <footer className={styles.MainFooter} id="MainFooter">
      <div className={classnames(styles.TopBar, styles.InnerContainer)}>
        <div
          className={classnames(
            styles.Panel,
            styles.ContactPanel,
            panelStates.Contact && styles.PanelOpen
          )}
        >
          <h3 role={titleRole} onClick={() => togglePanel('Contact')}>
            Contact
          </h3>
          <p>
            Hebt u een vraag en kunt u het antwoord niet vinden op deze website?
            Neem dan contact met ons op.
          </p>
          <p>
            <strong>
              Bel:{' '}
              <LinkdInline external={true} href="tel:14020">
                14 020
              </LinkdInline>
            </strong>
            &nbsp;(verkort nummer)
            <br />
            Maandag t/m vrijdag: 08.00 – 18.00 uur.
          </p>
          <ul>
            <li>
              <Linkd external={true} href={ExternalUrls.CONTACT_FORM}>
                Of gebruik het contactformulier
              </Linkd>
            </li>
            <li>
              <Linkd external={true} href={ExternalUrls.CONTACT_GENERAL}>
                Meer contactgegevens en openingstijden
              </Linkd>
            </li>
          </ul>
        </div>
        <div
          className={classnames(
            styles.Panel,
            styles.FollowPanel,
            panelStates.Follow && styles.PanelOpen
          )}
        >
          <h3 role={titleRole} onClick={() => togglePanel('Follow')}>
            Volg de gemeente
          </h3>
          <ul>
            {LinkList.map(({ to, title }) => (
              <li key={title}>
                <Linkd external={true} key={title} href={to}>
                  {title}
                </Linkd>
              </li>
            ))}
          </ul>
        </div>
        <div
          className={classnames(
            styles.Panel,
            styles.TodoPanel,
            panelStates.Todo && styles.PanelOpen
          )}
        >
          <h3 role={titleRole} onClick={() => togglePanel('Todo')}>
            Uit in Amsterdam
          </h3>
          <p>
            Wat is er te doen in Amsterdam? Informatie over toerisme, cultuur,
            uitgaan, evenementen en meer vindt u op{' '}
            <Linkd external={true} icon="" href="https://www.iamsterdam.com">
              Iamsterdam.com
            </Linkd>
          </p>
        </div>
      </div>
      <div className={styles.BottomBar}>
        <div className={styles.InnerContainer}>
          <Linkd href={AppRoutes.PROCLAIMER}>Proclaimer</Linkd>
        </div>
      </div>
    </footer>
  );
}
