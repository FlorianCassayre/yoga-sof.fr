import Link from 'next/link';
import { Badge, Button } from 'react-bootstrap';
import { BsPencil, BsPerson, BsXOctagon } from 'react-icons/bs';
import { BREADCRUMB_EMAILS, ConfirmDialog, EMAIL_TYPES, formatTimestamp, PaginatedTable } from '../../components';
import { PrivateLayout } from '../../components/layout/admin';

export default function AdminEmails({ pathname }) {

  return (
    <PrivateLayout pathname={pathname} title="E-mails" breadcrumb={BREADCRUMB_EMAILS}>

      <p>
        Liste des e-mails envoyés par le système.
        Ce module est en lecture seule.
      </p>

      <PaginatedTable
        url="/api/emails"
        params={(page, limit) => ({
          page,
          limit,
          include: 'user'
        })}
        columns={[
          {
            title: '#',
            render: ({ id }) => id,
          },
          {
            title: 'Type d\'e-mail',
            render: ({ type }) => EMAIL_TYPES[type].title,
          },
          {
            title: 'Utilisateur',
            render: ({ user_id: userId, user: { name } }) => (
              <Link href={`/administration/utilisateurs/${userId}`} passHref>
                <a>
                  <BsPerson className="icon me-2" />
                  {name}
                </a>
              </Link>
            ),
          },
          {
            title: 'Adresse de destination',
            render: ({ destination_address }) => destination_address,
            props: {
              className: 'font-monospace',
            },
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
            render: ({ created_at: createdAt }) => formatTimestamp(createdAt),
          },
          {
            title: 'Date d\'envoi',
            render: ({ sent_at: sentAt }) => sentAt ? formatTimestamp(sentAt) : (
              <Badge bg="danger">Pas envoyé</Badge>
            ),
            props: {
              className: 'text-center',
            },
          },
        ]}
      />

    </PrivateLayout>
  )
}

AdminEmails.getInitialProps = ({ pathname })  => {
  return { pathname };
}
