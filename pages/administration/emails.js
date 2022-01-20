import { Badge } from 'react-bootstrap';
import {
  BREADCRUMB_EMAILS,
  EMAIL_TYPES,
  formatTimestamp,
  DynamicPaginatedTable,
  userLinkColumn, idColumn, renderEmail, renderDatetime,
} from '../../components';
import { ContentLayout, PrivateLayout } from '../../components/layout/admin';

function AdminEmailsLayout({ pathname }) {
  return (
    <ContentLayout pathname={pathname} title="E-mails" breadcrumb={BREADCRUMB_EMAILS}>

      <p>
        Liste des e-mails envoyés par le système.
        Ce module est en lecture seule.
      </p>

      <DynamicPaginatedTable
        url="/api/emails"
        params={(page, limit) => ({
          page,
          limit,
          include: 'user'
        })}
        columns={[
          {
            title: 'Type d\'e-mail',
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
            }
          },
          {
            title: 'Date',
            render: ({ created_at: createdAt }) => renderDatetime(createdAt),
          },
          {
            title: 'Date d\'envoi',
            render: ({ sent_at: sentAt }) => sentAt ? renderDatetime(sentAt) : (
              <Badge bg="danger">Non envoyé</Badge>
            ),
            props: {
              className: 'text-center',
            },
          },
        ]}
      />

    </ContentLayout>
  );
}

export default function AdminEmails({ pathname }) {

  return (
    <PrivateLayout pathname={pathname}>

      <AdminEmailsLayout pathname={pathname} />

    </PrivateLayout>
  );
}

AdminEmails.getInitialProps = ({ pathname })  => {
  return { pathname };
}
