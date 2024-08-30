import { Grid, LinkList, Screen } from '@amsterdam/design-system-react';
import {
  ErrorAlert,
  LoadingContent,
  OverviewPage,
  PageHeading,
  ThemaIcon,
} from '../../components';
import { useHistory } from 'react-router-dom';

import { ReactElement, ReactNode } from 'react';
import { AppRoutes } from '../../../universal/config/routes';
import { LinkProps } from '../../../universal/types';
import { BarConfig } from '../../components/LoadingContent/LoadingContent';

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
  pageContentTables: ReactNode;
  linkListItems: LinkProps[];
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
  pageContentTables,
  pageContentBottom,
  errorAlertContent,
  loadingBarConfig = LOADING_BAR_CONFIG_DEFAULT,
  isError,
  isPartialError,
  isLoading,
}: ThemaPaginaProps) {
  const showError = (!isError && isPartialError) || isError;
  const history = useHistory();
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

          {!isLoading && !isError && pageContentTables}
          {pageContentBottom}
        </Grid>
      </Screen>
    </OverviewPage>
  );
}
