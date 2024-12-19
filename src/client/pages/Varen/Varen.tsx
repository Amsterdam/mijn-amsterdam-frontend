import { useAppStateGetter } from '../../hooks/useAppState';

export default function Varen() {
  const { VAREN } = useAppStateGetter();
  console.log(VAREN);
  return 'FAKE';
}
