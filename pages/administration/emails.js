import { Badge } from 'react-bootstrap';
import { BsMailbox } from 'react-icons/bs';
import { ContentLayout, PrivateLayout } from '../../components/layout/admin';
import { DynamicPaginatedTable, renderEmail, userLinkColumn } from '../../components/table';
import { BREADCRUMB_EMAILS } from '../../lib/client';
import { EMAIL_TYPES, displayDatetime } from '../../lib/common';

function AdminEmailsLayout() {
  return (
    <ContentLayout title="E-mails" icon={BsMailbox} breadcrumb={BREADCRUMB_EMAILS}>
      <p>Liste des e-mails envoyés par le système. Ce module est en lecture seule.</p>

      <DynamicPaginatedTable
        url="/api/emailMessages"
        params={(page, limit, { sort }) => ({
          page,
          limit,
          include: 'user',
          orderBy: sort ? { [sort.column]: sort.order ? '$asc' : '$desc' } : undefined,
        })}
        columns={[
          {
            title: `Type d'e-mail`,
            name: 'type',
            sortable: true,
            render: ({ type }) => EMAIL_TYPES[type].title,
          },
          userLinkColumn,
          {
            title: 'Adresse de destination',
            render: ({ destinationAddress }) => renderEmail(destinationAddress),
          },
          {
            title: 'Sujet',
            render: ({ subject }) => subject,
          },
          {
            title: 'Corps',
            render: ({ message }) => message,
            props: { style: { whiteSpace: 'pre-wrap' } },
          },
          {
            title: 'Date',
            name: 'createdAt',
            sortable: true,
            initialSortValue: false,
            render: ({ createdAt }) => displayDatetime(createdAt),
          },
          {
            title: `Date d'envoi`,
            name: 'sentAt',
            sortable: true,
            render: ({ sentAt }) => (sentAt ? displayDatetime(sentAt) : <Badge bg="danger">Non envoyé</Badge>),
            props: { className: 'text-center' },
          },
        ]}
        renderEmpty={() => 'Aucun e-mail n\'a été envoyé pour le moment.'}
      />
    </ContentLayout>
  );
}

export default function AdminEmails() {
  return (
    <PrivateLayout>
      <AdminEmailsLayout />
    </PrivateLayout>
  );
}
