import type { CommunicatieMedium } from '../../../../../server/services/contact/contact.types';
import { MaButtonInline } from '../../../../components/MaLink/MaLink';

type SMSValueProps = {
  medium: CommunicatieMedium;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

export function SMSValue({ medium, onClick }: SMSValueProps) {
  return (
    <>
      {medium.value ? medium.value : <em>nog niet opgegeven</em>}{' '}
      <MaButtonInline onClick={onClick}>
        {medium.isActive && medium.value ? 'Wijzigen' : 'Instellen'}
      </MaButtonInline>
    </>
  );
}
