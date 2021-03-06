import { Link, useHistory } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import { ReactComponent as Logo } from '../../assets/images/logo-amsterdam.svg';
import Linkd, { Button } from '../Button/Button';
import styles from './MyArea.module.scss';
import mainHeaderStyles from '../MainHeader/MainHeader.module.scss';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import { ChapterTitles } from '../../../universal/config/chapter';
import { usePhoneScreen } from '../../hooks';
import classnames from 'classnames';

interface MyAreaHeaderProps {
  showCloseButton?: boolean;
}

export default function MyAreaHeader({
  showCloseButton = true,
}: MyAreaHeaderProps) {
  const history = useHistory();
  const termReplace = useTermReplacement();
  return (
    <div className={styles.Header}>
      {!usePhoneScreen() && (
        <nav
          className={classnames(
            mainHeaderStyles.DirectSkipLinks,
            styles.DirectSkipLinks
          )}
        >
          <Linkd external={true} tabIndex={0} href="#skip-to-id-LegendPanel">
            Direct naar: <b>Legenda paneel</b>
          </Linkd>
        </nav>
      )}
      <Link
        className={styles.LogoLink}
        to={AppRoutes.ROOT}
        title="Terug naar home"
      >
        <Logo
          role="img"
          aria-label="Gemeente Amsterdam logo"
          className={styles.Logo}
        />
        <h1 className={styles.Title}>{termReplace(ChapterTitles.BUURT)}</h1>
      </Link>
      {showCloseButton && (
        <Button
          onClick={() => {
            history.push(AppRoutes.ROOT);
          }}
        >
          Kaart sluiten
        </Button>
      )}
    </div>
  );
}
