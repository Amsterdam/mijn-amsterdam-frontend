import React from 'react';
import styles from './MainFooter.module.scss';
import ButtonLink, {
  ButtonLinkExternal,
} from 'components/ButtonLink/ButtonLink';
import { ExternalUrls, AppRoutes } from 'App.constants';
import { LinkList } from './MainFooter.constants';
import classnames from 'classnames';

export default function MainFooter() {
  return (
    <footer className={styles.MainFooter}>
      <div className={classnames(styles.TopBar, styles.InnerContainer)}>
        <div className={styles.ContactPanel}>
          <h3>Contact</h3>
          <p>
            Hebt u een vraag en kunt u het antwoord niet vinden op deze website?
            Neem dan contact met ons op.
          </p>
          <p>
            <strong>
              Bel: <a href="tel:14020">14 020</a>
            </strong>
            &nbsp;(verkort nummer)
            <br />
            Maandag t/m vrijdag: 08.00 – 18.00 uur.
          </p>
          <ul>
            <li>
              <ButtonLinkExternal white={true} to={ExternalUrls.CONTACT_FORM}>
                Of gebruik het contactformulier
              </ButtonLinkExternal>
            </li>
            <li>
              <ButtonLinkExternal
                white={true}
                to={ExternalUrls.CONTACT_GENERAL}
              >
                Meer contactgegevens en openingstijden
              </ButtonLinkExternal>
            </li>
          </ul>
        </div>
        <div className={styles.FollowPanel}>
          <h3>Volg de gemeente</h3>
          <ul>
            {LinkList.map(({ to, label }) => (
              <li>
                <ButtonLinkExternal key={label} white={true} to={to}>
                  {label}
                </ButtonLinkExternal>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.TodoPanel}>
          <h3>Uit in Amsterdam</h3>
          <p>
            Wat is er te doen in Amsterdam? Informatie over toerisme, cultuur,
            uitgaan, evenementen en meer vindt u op{' '}
            <a href="https://www.iamsterdam.com">Iamsterdam.com</a>
          </p>
        </div>
      </div>
      <div className={styles.BottomBar}>
        <div className={styles.InnerContainer}>
          <ButtonLink to={AppRoutes.ABOUT}>Over mijn Amsterdam</ButtonLink>
          <ButtonLink to={AppRoutes.PRIVACY}>Privacy</ButtonLink>
        </div>
      </div>
    </footer>
  );
}
