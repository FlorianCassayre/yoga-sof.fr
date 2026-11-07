'use client';

import { formatMembershipPeriod, formatPrice, MEMBERSHIP_TYPE_LABELS } from '@yoga-sof/core';
import { Ban, Pencil } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Fragment, useState } from 'react';

import { RecordDetails } from '../../components/detail/RecordDetails';
import { RecordTimestamp } from '../../components/detail/RecordTimestamp';
import { ConfirmDialog } from '../../components/dialog/ConfirmDialog';
import type { PageActionGroup } from '../../components/page/PageAction';
import { PageLayout } from '../../components/page/PageLayout';
import { api } from '../../server/api';
import { isNotFoundError } from '../../server/isNotFoundError';
import { PersonLink } from '../user/PersonLink';
import { useHasPermission } from '../user/useHasPermission';
import { MembershipIcon } from './MembershipIcon';
import { MembershipTypeChip } from './type/MembershipTypeChip';

interface MembershipPageProps {
  id: number;
}

export const MembershipPage = ({ id }: MembershipPageProps) => {
  const membership = api.membership.get.useQuery({ id });
  const canManage = useHasPermission('manageData');
  const [canceling, setCanceling] = useState(false);

  if (membership.isPending) {
    return null;
  }

  if (isNotFoundError(membership.error)) {
    notFound();
  }

  if (!membership.data) {
    return null;
  }

  const row = membership.data;
  const actions: PageActionGroup[] | undefined = canManage
    ? [
        {
          children: [
            { label: 'Modifier', icon: Pencil, href: `/adhesions/${id}/edition` },
            ...(!row.canceled
              ? [{ label: "Annuler l'adhésion", icon: Ban, onClick: () => setCanceling(true) }]
              : []),
          ],
        },
      ]
    : undefined;

  return (
    <PageLayout icon={MembershipIcon} title="Adhésion" actions={actions}>
      <RecordDetails
        entries={[
          { label: 'Type', value: <MembershipTypeChip type={row.type} size="small" /> },
          {
            label: 'Bénéficiaires',
            value: row.beneficiaries.map((beneficiary, index) => (
              <Fragment key={beneficiary.id}>
                {index > 0 && ', '}
                <PersonLink person={{ userId: beneficiary.id, userName: beneficiary.name }} />
              </Fragment>
            )),
          },
          { label: 'Période', value: formatMembershipPeriod(row) },
          { label: 'Prix', value: formatPrice(row.price) },
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
          procedure={api.membership.cancel}
          input={{ id }}
          title="Annuler l'adhésion"
          message={`Voulez-vous vraiment annuler l'adhésion ${MEMBERSHIP_TYPE_LABELS[row.type].toLowerCase()} de ${row.beneficiaries.map((beneficiary) => beneficiary.name ?? '-').join(', ')} (${formatMembershipPeriod(row)}) ?`}
          confirmLabel="Annuler l'adhésion"
          successMessage="Adhésion annulée."
          onClose={() => setCanceling(false)}
        />
      )}
    </PageLayout>
  );
};
