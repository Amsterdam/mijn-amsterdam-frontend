import { Heading } from '@amsterdam/design-system-react';
import classnames from 'classnames';
import { PropsWithChildren } from 'react';
import {
  DATASETS,
  getDatasetCategoryId,
} from '../../../../../universal/config';
import { usePhoneScreen } from '../../../../hooks/media.hook';
import styles from './GenericBase.module.scss';
import JsonString from './JsonString';

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
        <Heading className={styles.SuperTitle} size="level-4" level={4}>
          {supTitle}
        </Heading>
      )}
      {!!title && (
        <Heading
          size="level-3"
          level={3}
          className={classnames(styles.Title, isPhone && styles.IsPhone)}
        >
          {title}
        </Heading>
      )}
      {children}
    </div>
  );
}
