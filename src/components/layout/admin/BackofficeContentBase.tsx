import React from 'react';
import { HeadMeta } from '../HeadMeta';

interface BackofficeContentBaseProps {
  title: string;
  children: React.ReactNode;
}

export const BackofficeContentBase: React.FC<BackofficeContentBaseProps> = ({ title, children }) => {
  return (
    <>
      <HeadMeta title={`${title} · Yoga Sof`} />
      {children}
    </>
  );
}
