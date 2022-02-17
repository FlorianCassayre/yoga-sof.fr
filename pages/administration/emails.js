import { Badge } from 'react-bootstrap';
import { BsMailbox } from 'react-icons/bs';
import { ContentLayout, PrivateLayout } from '../../components/layout/admin';
import { DynamicPaginatedTable, renderDatetime, renderEmail, userLinkColumn } from '../../components/table';
import { BREADCRUMB_EMAILS } from '../../lib/client';
import { EMAIL_TYPES } from '../../lib/common';

function AdminEmailsLayout() {
  return (
    <ContentLayout title="E-mails" icon={BsMailbox} breadcrumb={BREADCRUMB_EMAILS}>
      <p>Liste des e-mails envoyés par le système. Ce module est en lecture seule.</p>

      <DynamicPaginatedTable
        url="/api/emails"
        params={(page, limit) => ({
          page,
          limit,
          include: 'user',
        })}
        columns={[
          {
            title: "Type d'e-mail",
            render: ({ type }) => EMAIL_TYPES[type].title,
          },
          userLinkColumn,
          {
            title: 'Adresse de destination',
            render: ({ destination_address }) => renderEmail(destination_address),
          },
          {
            title: 'Sujet',
            render: ({ subject }) => subject,
          },
          {
            title: 'Corps',
            render: ({ message }) => message,
            props: {
              style: {
                whiteSpace: 'pre-wrap',
              },
            },
          },
          {
            title: 'Date',
            render: ({ created_at: createdAt }) => renderDatetime(createdAt),
          },
          {
            title: "Date d'envoi",
            render: ({ sent_at: sentAt }) => (sentAt ? renderDatetime(sentAt) : <Badge bg="danger">Non envoyé</Badge>),
            props: {
              className: 'text-center',
            },
          },
        ]}
        renderEmpty={() => `Aucun e-mail n'a été envoyé pour le moment.`}
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
