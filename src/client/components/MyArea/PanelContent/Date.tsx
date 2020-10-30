import React from 'react';
import { defaultDateFormat } from '../../../../universal/helpers';
import InfoDetail from '../../InfoDetail/InfoDetail';

interface DateProps {
  date: string;
  label?: string;
}

export default function Date({ date, label = 'Datum' }: DateProps) {
  return <InfoDetail label={label} value={defaultDateFormat(date)} />;
}
