import { Themas } from '../../../universal/config/thema';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { HLIRegeling } from '../../../server/services/hli/regelingen-types';
import { addLinkElementToProperty } from '../../components/Table/Table';
import { useAppStateGetter } from '../../hooks';
import { getThemaTitleWithAppState } from './helpers';

const displayPropsEerdereRegelingen = {
  title: 'Naam regeling',
  receiverName: 'Naam ontvanger',
  displayStatus: 'Status',
};

export default function HLIRegelingen() {
  const appState = useAppStateGetter();
  const { HLI } = appState;
  const eerdereRegelingen: HLIRegeling[] =
    HLI.content?.regelingen.filter((regeling) => !regeling.isActual) ?? [];
  const regelingen = addLinkElementToProperty<HLIRegeling>(
    eerdereRegelingen,
    'title'
  );
  return (
    <ListPagePaginated
      items={regelingen}
      backLinkTitle={getThemaTitleWithAppState(appState)}
      title="Eerdere en afgewezen regelingen"
      appRoute={AppRoutes['HLI/REGELINGEN_LIJST']}
      appRouteBack={AppRoutes['HLI']}
      displayProps={displayPropsEerdereRegelingen}
      thema={Themas.HLI}
      isLoading={isLoading(HLI)}
      isError={isError(HLI)}
    />
  );
}
