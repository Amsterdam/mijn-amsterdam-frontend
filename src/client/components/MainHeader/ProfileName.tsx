import classnames from 'classnames';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import type { KVKData } from '../../../server/services/kvk';
import { AppRoutes, FeatureToggle } from '../../../universal/config';
import { getFullName } from '../../../universal/helpers';
import { BRPData } from '../../../universal/types';
import { IconProfile } from '../../assets/icons';
import { useAppStateReady } from '../../hooks';
import LoadingContent from '../LoadingContent/LoadingContent';
import styles from './ProfileName.module.scss';
import { PageMenu } from '@amsterdam/design-system-react';
import { MARouterLink } from '../MaRouterLink/MaRouterLink';

interface CommercialProfileNameProps {
  company?: KVKData;
  href: string;
}

function CommercialProfileName({ company, href }: CommercialProfileNameProps) {
  const label = company?.onderneming.handelsnaam || 'Mijn onderneming';
  return <PageMenu.Link href={href}>{label}</PageMenu.Link>;
}

interface PrivateProfileNameProps {
  href: string;
  person?: BRPData['persoon'];
}

function PrivateProfileName({ person, href }: PrivateProfileNameProps) {
  const label = person?.opgemaakteNaam
    ? person.opgemaakteNaam
    : person?.voornamen
      ? getFullName(person)
      : 'Mijn gegevens';
  return <MARouterLink href={href}>{label}</MARouterLink>;
}

interface ProfileNameProps {
  person?: BRPData['persoon'] | null;
  company?: KVKData | null;
  profileAttribute?: string;
  profileType: ProfileType;
}

export function ProfileName({
  person,
  company,
  profileAttribute,
  profileType,
}: ProfileNameProps) {
  const history = useHistory();
  const isAppStateReady = useAppStateReady();

  const [appStateFirstLoad, setAppStateFirstLoad] = useState<undefined | true>(
    undefined
  );

  useEffect(() => {
    if (isAppStateReady) {
      setAppStateFirstLoad(true);
    }
  }, [isAppStateReady]);

  const content = useMemo(() => {
    let nameContent: undefined | string | ReactNode;

    switch (true) {
      case profileType === 'private':
        nameContent = (
          <PrivateProfileName person={person!} href={AppRoutes.BRP} />
        );
        break;
      case FeatureToggle.kvkActive && profileType === 'commercial':
        nameContent = (
          <CommercialProfileName company={company!} href={AppRoutes.KVK} />
        );
        break;
      case !!profileAttribute:
        nameContent = (
          <span
            className={classnames(
              styles.ProfileLink,
              styles['ProfileLink--private'],
              styles['ProfileLink--private-attributes'],
              styles['ProfileLink--active']
            )}
          >
            <IconProfile className={styles.IconProfile} /> {profileAttribute}
          </span>
        );
        break;
    }
    return nameContent;
  }, [person, company, history, profileAttribute, profileType]);

  return (
    <>
      {appStateFirstLoad === true ? (
        <>{content}</>
      ) : (
        <LoadingContent
          barConfig={[['15rem', '1rem', '0']]}
          className={styles.ProfileLinkLoader}
        />
      )}
    </>
  );
}
