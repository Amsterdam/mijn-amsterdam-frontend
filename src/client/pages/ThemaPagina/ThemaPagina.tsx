import { Grid, LinkList, Screen } from '@amsterdam/design-system-react';
import {
  ErrorAlert,
  LoadingContent,
  OverviewPage,
  PageHeading,
  ThemaIcon,
} from '../../components';

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
  errorAlertContent = 'We kunnen op dit moment niet alle gegevens tonen.',
  loadingBarConfig = LOADING_BAR_CONFIG_DEFAULT,
  isError,
  isLoading,
}: ThemaPaginaProps) {
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

          {isError && (
            <Grid.Cell span="all">
              <ErrorAlert>{errorAlertContent}</ErrorAlert>
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
