'use client';

import { COURSE_TYPE_LABELS, formatPrice, getCardStatus } from '@yoga-sof/core';
import { Ban, Pencil } from 'lucide-react';
import { notFound } from 'next/navigation';
import { useState } from 'react';

import { RecordDetails } from '../../components/detail/RecordDetails';
import { RecordTimestamp } from '../../components/detail/RecordTimestamp';
import { ConfirmDialog } from '../../components/dialog/ConfirmDialog';
import { PageLayout } from '../../components/page/PageLayout';
import { api } from '../../server/api';
import { isNotFoundError } from '../../server/isNotFoundError';
import { PersonLink } from '../user/PersonLink';
import { CardIcon } from './CardIcon';
import { formatValidUntil } from './formatValidUntil';
import { CardStatusChip } from './status/CardStatusChip';

interface CardPageProps {
  id: number;
}

export const CardPage = ({ id }: CardPageProps) => {
  const card = api.card.get.useQuery({ id });
  const [canceling, setCanceling] = useState(false);

  if (card.isPending) {
    return null;
  }

  if (isNotFoundError(card.error)) {
    notFound();
  }

  if (!card.data) {
    return null;
  }

  const row = card.data;

  return (
    <PageLayout
      icon={CardIcon}
      title="Carte"
      actions={[
        {
          children: [
            { label: 'Modifier', icon: Pencil, href: `/cartes/${id}/edition` },
            ...(!row.canceled
              ? [{ label: 'Annuler la carte', icon: Ban, onClick: () => setCanceling(true) }]
              : []),
          ],
        },
      ]}
    >
      <RecordDetails
        entries={[
          {
            label: 'Titulaire',
            value: <PersonLink person={row} />,
          },
          { label: 'Type', value: COURSE_TYPE_LABELS[row.type] },
          {
            label: 'Statut',
            value: <CardStatusChip size="small" status={getCardStatus(row)} />,
          },
          { label: 'Prix', value: formatPrice(row.price) },
          { label: 'Séances restantes', value: `${row.remaining} / ${row.count}` },
          { label: "Valable jusqu'au", value: formatValidUntil(row.validUntil) },
          { label: 'Créée', value: <RecordTimestamp date={row.createdAt} /> },
          ...(row.canceled
            ? [
                { label: 'Annulée', value: <RecordTimestamp date={row.canceledAt} /> },
                {
                  label: 'Annulée par',
                  value: row.canceledBy ? (
                    <PersonLink person={{ userId: row.canceledBy, userName: row.canceledByName }} />
                  ) : (
                    '-'
                  ),
                },
              ]
            : []),
        ]}
      />
      {canceling && (
        <ConfirmDialog
          procedure={api.card.cancel}
          input={{ id }}
          title="Annuler la carte"
          message={`Voulez-vous vraiment annuler la carte de ${row.userName ?? '-'} (${COURSE_TYPE_LABELS[row.type]}, ${row.remaining} / ${row.count} séances restantes) ?`}
          confirmLabel="Annuler la carte"
          successMessage="Carte annulée."
          onClose={() => setCanceling(false)}
        />
      )}
    </PageLayout>
  );
};
