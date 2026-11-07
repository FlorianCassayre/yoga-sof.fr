'use client';

import { PageLayout } from '../../components/page/PageLayout';
import { CardEditForm } from './CardEditForm';
import { CardIcon } from './CardIcon';

interface CardEditPageProps {
  id: string;
}

export const CardEditPage = ({ id }: CardEditPageProps) => {
  return (
    <PageLayout icon={CardIcon} title="Modifier la carte">
      <CardEditForm id={Number(id)} />
    </PageLayout>
  );
};
