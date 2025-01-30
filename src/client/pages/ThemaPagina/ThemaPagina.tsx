import { ReactElement, ReactNode } from 'react';

import { Grid, Icon, LinkList, Screen } from '@amsterdam/design-system-react';
import { ExternalLinkIcon } from '@amsterdam/design-system-react-icons';

import { AppRoutes } from '../../../universal/config/routes';
import { LinkProps } from '../../../universal/types';
import {
  ErrorAlert,
  LoadingContent,
  OverviewPage,
  PageHeading,
  ThemaIcon,
} from '../../components';
import { BarConfig } from '../../components/LoadingContent/LoadingContent';
import { MaButtonLink } from '../../components/MaLink/MaLink';

const LOADING_BAR_CONFIG_DEFAULT: BarConfig = [
  ['20rem', '4rem', '4rem'],
  ['40rem', '2rem', '4rem'],
  ['40rem', '2rem', '8rem'],
  ['30rem', '4rem', '4rem'],
  ['40rem', '2rem', '4rem'],
  ['40rem', '2rem', '4rem'],
];

const ERROR_ALERT_DEFAULT = 'We kunnen op dit moment niet alle gegevens tonen.';

interface ThemaPaginaProps {
  title: string;
  backLink?: LinkProps;
  icon?: ReactElement;
  pageContentTop: ReactNode;
  pageContentMain: ReactNode;
  linkListItems?: LinkProps[];
  buttonItems?: LinkProps[];
  pageContentBottom?: ReactNode;
  errorAlertContent?: ReactNode;
  loadingBarConfig?: BarConfig;
  isError: boolean;
  isPartialError?: boolean;
  isLoading: boolean;
}

export default function ThemaPagina({
  title,
  backLink = {
    to: AppRoutes.HOME,
    title: 'Home',
  },
  icon = <ThemaIcon />,
  pageContentTop,
  linkListItems = [],
  buttonItems = [],
  pageContentMain,
  pageContentBottom,
  errorAlertContent,
  loadingBarConfig = LOADING_BAR_CONFIG_DEFAULT,
  isError,
  isPartialError,
  isLoading,
}: ThemaPaginaProps) {
  const showError = (!isError && isPartialError) || isError;
  return (
    <OverviewPage>
      <PageHeading backLink={backLink} icon={icon}>
        {title}
      </PageHeading>
      <Screen>
        <Grid>
          <Grid.Cell span="all">{pageContentTop}</Grid.Cell>
          {!!linkListItems.length && (
            <Grid.Cell span="all">
              <LinkList>
                {linkListItems.map(({ to, title }) => (
                  <LinkList.Link key={to} rel="noreferrer" href={to}>
                    {title}
                  </LinkList.Link>
                ))}
              </LinkList>
            </Grid.Cell>
          )}

          {!!buttonItems.length && (
            <Grid.Cell span="all">
              {buttonItems.map(({ to, title }) => (
                <Grid.Cell key={to} span="all">
                  <br />
                  <MaButtonLink key={to} href={to}>
                    {title}
                    <Icon svg={ExternalLinkIcon} size="level-5" />
                  </MaButtonLink>
                </Grid.Cell>
              ))}
            </Grid.Cell>
          )}

          {showError && (
            <Grid.Cell span="all">
              <ErrorAlert>
                {errorAlertContent || ERROR_ALERT_DEFAULT}
                {/* errorAlertContent could be an emty string, force to show an error. **/}
              </ErrorAlert>
            </Grid.Cell>
          )}

          {isLoading && (
            <Grid.Cell span="all">
              <LoadingContent barConfig={loadingBarConfig} />
            </Grid.Cell>
          )}

          {!isLoading && !isError && pageContentMain}
          {pageContentBottom}
        </Grid>
      </Screen>
    </OverviewPage>
  );
}
