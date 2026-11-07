'use client';

import { PageLayout } from '../../components/page/PageLayout';
import { CardForm } from './CardForm';
import { CardIcon } from './CardIcon';

export const CardCreatePage = () => {
  return (
    <PageLayout icon={CardIcon} title="Nouvelle carte">
      <CardForm />
    </PageLayout>
  );
};
