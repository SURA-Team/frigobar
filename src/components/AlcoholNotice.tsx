import { TriangleAlert } from 'lucide-react';
import { AVISO_ALCOOL } from '../icons/tags';

export function AlcoholNotice() {
  return (
    <p className="aviso-alcool" role="note">
      <TriangleAlert size={16} aria-hidden="true" focusable="false" />
      <span>{AVISO_ALCOOL}</span>
    </p>
  );
}
