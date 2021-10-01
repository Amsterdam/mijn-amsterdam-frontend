import { PropsWithChildren } from 'react';
import {
  DATASETS,
  getDatasetCategoryId,
} from '../../../../../universal/config';
import JsonString from './JsonString';
import { usePhoneScreen } from '../../../../hooks/media.hook';
import styles from './GenericBase.module.scss';
import classnames from 'classnames';
import Heading from '../../../Heading/Heading';

type GenericBaseProps = PropsWithChildren<{
  title?: string;
  supTitle?: string;
}>;

interface GenericContentProps {
  panelItem: any;
  datasetId: string;
}

export function GenericContent({ datasetId, panelItem }: GenericContentProps) {
  const datasetCategoryId = getDatasetCategoryId(datasetId);
  const category = datasetCategoryId ? DATASETS[datasetCategoryId] : undefined;
  const dataset = category ? category.datasets[datasetId] : undefined;
  return (
    <GenericBase
      title={dataset?.title || datasetId}
      supTitle={category?.title || datasetCategoryId || 'Unknown category'}
    >
      <JsonString data={panelItem} />
    </GenericBase>
  );
}

export default function GenericBase({
  title,
  supTitle,
  children,
}: GenericBaseProps) {
  const isPhone = usePhoneScreen();
  return (
    <div className={styles.GenericBase}>
      {!!supTitle && (
        <Heading className={styles.SuperTitle} as="h4">
          {supTitle}
        </Heading>
      )}
      {!!title && (
        <Heading
          as="h3"
          className={classnames(styles.Title, isPhone && styles.IsPhone)}
        >
          {title}
        </Heading>
      )}
      {children}
    </div>
  );
}
