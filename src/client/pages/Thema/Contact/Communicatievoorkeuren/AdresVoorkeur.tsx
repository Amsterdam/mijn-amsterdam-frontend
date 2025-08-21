import type { CommunicatieMedium } from '../../../../../server/services/contact/contact.types';
import { MaButtonInline } from '../../../../components/MaLink/MaLink';

type AdresValueProps = {
  medium: CommunicatieMedium;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

export function AdresValue({ medium, onClick }: AdresValueProps) {
  return (
    <>
      {medium.value ? medium.value : <em>nog niet opgegeven</em>}{' '}
      <MaButtonInline onClick={onClick}>Wijzigen</MaButtonInline>
    </>
  );
}
