import styles from './ViewerContainer.module.scss';
import classnames from 'classnames';

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
      data-testid="container"
      style={{ left: mapOffset?.left ?? '0' }}
    >
      <div
        className={classnames(styles.Item, styles.TopLeft)}
        data-testid="topLeft"
      >
        {topLeft}
      </div>
      <div
        className={classnames(styles.Item, styles.TopRight)}
        data-testid="topRight"
      >
        {topRight}
      </div>
      <div
        className={classnames(styles.Item, styles.BottomLeft)}
        data-testid="bottomLeft"
      >
        {bottomLeft}
      </div>
      <div
        className={classnames(styles.Item, styles.BottomRight)}
        data-testid="bottomRight"
      >
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
