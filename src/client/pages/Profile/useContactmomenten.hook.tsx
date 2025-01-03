// import { linkListItems, tableConfig } from './config';
import { contactMoment, format } from './formatDataPrivate';
import { isError, isLoading } from '../../../universal/helpers/api';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaMenuItems } from '../../hooks/useThemaMenuItems';

export function useContactmomenten() {
  const { SALESFORCE } = useAppStateGetter();
  const { items: myThemasMenuItems } = useThemaMenuItems();

  const items =
    (SALESFORCE.content &&
      SALESFORCE.content.map((contactMomentItem) =>
        format(
          contactMoment,
          contactMomentItem,
          SALESFORCE.content,
          myThemasMenuItems
        )
      )) ??
    [];

  return {
    isLoading: isLoading(SALESFORCE),
    isError: isError(SALESFORCE),
    items,
  };
}
