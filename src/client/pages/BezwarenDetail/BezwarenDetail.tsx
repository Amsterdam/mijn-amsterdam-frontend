import { useParams } from 'react-router-dom';
import { useAppStateGetter } from '../../hooks';

export const BezwarenDetail = () => {
  const { BEZWAREN } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();

  console.log(id, BEZWAREN.content);

  return <></>;
};
