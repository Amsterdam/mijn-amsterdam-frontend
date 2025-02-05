import { ReactNode } from 'react';

import { LinkList } from '@amsterdam/design-system-react';

import { AppRoutes } from '../../../universal/config/routes';
import { LinkProps } from '../../../universal/types';
import { ErrorAlert, LoadingContent } from '../../components';
import { BarConfig } from '../../components/LoadingContent/LoadingContent';
import {
  OverviewPageV2,
  PageContentCell,
  PageContentV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';

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
  backLink?: string;
  pageContentTop: ReactNode;
  pageContentTopSecondary?: ReactNode;
  pageContentMain: ReactNode;
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
  backLink = AppRoutes.HOME,
  pageContentTop,
  pageContentTopSecondary,
  linkListItems = [],
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
    <OverviewPageV2>
      <PageContentV2>
        <PageHeadingV2 backLink={backLink}>{title}</PageHeadingV2>

        <PageContentCell>{pageContentTop}</PageContentCell>
        {!!linkListItems.length && (
          <PageContentCell>
            <LinkList>
              {linkListItems.map(({ to, title }) => (
                <LinkList.Link key={to} rel="noreferrer" href={to}>
                  {title}
                </LinkList.Link>
              ))}
            </LinkList>
          </PageContentCell>
        )}
        {!!pageContentTopSecondary && (
          <Grid.Cell span="all">{pageContentTopSecondary}</Grid.Cell>
        )}
        {showError && (
          <PageContentCell>
            <ErrorAlert>
              {errorAlertContent || ERROR_ALERT_DEFAULT}
              {/* errorAlertContent could be an emty string, force to show an error. **/}
            </ErrorAlert>
          </PageContentCell>
        )}

        {isLoading && (
          <PageContentCell>
            <LoadingContent barConfig={loadingBarConfig} />
          </PageContentCell>
        )}

        {!isLoading && !isError && pageContentMain}
        {pageContentBottom}
      </PageContentV2>
    </OverviewPageV2>
  );
}
