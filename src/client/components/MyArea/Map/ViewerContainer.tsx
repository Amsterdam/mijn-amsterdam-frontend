import classnames from 'classnames';

import styles from './ViewerContainer.module.scss';

type Props = {
  topLeft?: React.ReactNode;
  topRight?: React.ReactNode;
  bottomLeft?: React.ReactNode;
  bottomRight?: React.ReactNode;
  metaData?: Array<string>;
  mapOffset?: any;
};

const ViewerContainer: React.FC<Props> = ({
  bottomLeft,
  topLeft,
  topRight,
  bottomRight,
  metaData,
  mapOffset,
  ...otherProps
}) => {
  return (
    <div
      {...otherProps}
      className={styles.Wrapper}
      style={{ left: mapOffset?.left ?? '0' }}
    >
      <div className={classnames(styles.Item, styles.TopLeft)}>{topLeft}</div>
      <div className={classnames(styles.Item, styles.TopRight)}>{topRight}</div>
      <div className={classnames(styles.Item, styles.BottomLeft)}>
        {bottomLeft}
      </div>
      <div className={classnames(styles.Item, styles.BottomRight)}>
        {bottomRight}
        {metaData && (
          <div>
            {metaData.map(
              (string) =>
                string && (
                  <div key={string}>
                    <span>{string}</span>
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewerContainer;
