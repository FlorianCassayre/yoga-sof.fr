'use client';

import { Euro } from 'lucide-react';

import { PageLayout } from '../../../components/page/PageLayout';
import { MembershipPriceForm } from './MembershipPriceForm';

export const MembershipPricePage = ({ id }: { id?: number }) => {
  return (
    <PageLayout icon={Euro} title={id == null ? 'Nouveau tarif' : 'Modifier le tarif'}>
      <MembershipPriceForm id={id} />
    </PageLayout>
  );
};
