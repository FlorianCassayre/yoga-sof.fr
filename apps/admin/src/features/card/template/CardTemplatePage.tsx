'use client';

import { PageLayout } from '../../../components/page/PageLayout';
import { CardIcon } from '../CardIcon';
import { CardTemplateForm } from './CardTemplateForm';

export const CardTemplatePage = ({ id }: { id?: number }) => {
  return (
    <PageLayout icon={CardIcon} title={id == null ? 'Nouveau modèle' : 'Modifier le modèle'}>
      <CardTemplateForm id={id} />
    </PageLayout>
  );
};
