import { Fragment, useState } from 'react';
import { Badge, Button, Col, Modal, Row } from 'react-bootstrap';
import { BsEyeFill, BsMailbox, BsXLg } from 'react-icons/bs';
import { ContentLayout, PrivateLayout } from '../../components/layout/admin';
import { DynamicPaginatedTable, renderEmail, userLinkColumn } from '../../components/table';
import { BREADCRUMB_EMAILS } from '../../lib/client';
import { EMAIL_TYPES, displayDatetime } from '../../lib/common';

const renderHtmlSafe = html => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(html, 'text/html');
  const renderNodeSafe = node => {
    if (node.nodeType === Node.DOCUMENT_NODE || node.nodeType === Node.ELEMENT_NODE) {
      let Tag = Fragment;
      const tagName = node.tagName?.toLowerCase();
      if (tagName === 'br') {
        Tag = function Br() {
          return <br />;
        };
      } else if (tagName === 'a') {
        Tag = function A({ children }) {
          return <abbr title={node.getAttributeNode('href')?.value}>{children}</abbr>;
        };
      } else if (tagName === 'strong') {
        Tag = function Strong({ children }) {
          return <strong>{children}</strong>;
        };
      } else if (tagName === 'em') {
        Tag = function Em({ children }) {
          return <em>{children}</em>;
        };
      } else if (tagName === 'ul') {
        Tag = function Ul({ children }) {
          return <ul>{children}</ul>;
        };
      } else if (tagName === 'li') {
        Tag = function Li({ children }) {
          return <li>{children}</li>;
        };
      }
      return (
        <Tag>
          {Array.from(node.childNodes).map((child, i) => (
            <Fragment key={i}>
              {renderNodeSafe(child)}
            </Fragment>
          ))}
        </Tag>
      );
    } else if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    } else {
      throw new Error();
    }
    // Else, ignore
  };
  return renderNodeSafe(dom);
};

function CodeField({ children }) {
  return (
    <pre className="p-2 border border-2 rounded mb-2" style={{ backgroundColor: '#eeeeee', whiteSpace: 'normal' }}>
      <code>
        {children}
      </code>
    </pre>
  );
}

function EmailMessageModal({
  emailMessage: {
    destinationAddress,
    subject,
    message,
    sentAt,
  },
}) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="secondary" size="sm" onClick={handleShow}>
        <BsEyeFill className="icon" />
      </Button>

      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>E-mail envoyé</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row xs={1} lg={2}>
            <Col>
              Destinataire :
              <CodeField>{destinationAddress}</CodeField>
            </Col>
            <Col>
              Date d'envoi :
              <CodeField>{sentAt ? displayDatetime(sentAt) : '(non envoyé)'}</CodeField>
            </Col>
          </Row>
          Objet :
          <CodeField>{subject}</CodeField>
          Contenu :
          <CodeField>{renderHtmlSafe(message)}</CodeField>
          <div className="text-center">
            <small className="text-muted">
              La mise en forme peut varier légèrement par rapport à ce que l'utilisateur a réellement reçu.
              <br />
              Par mesure de sécurité les liens ne sont pas cliquables.
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            <BsXLg className="icon me-2" />
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

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
            title: 'Détails',
            render: emailMessage => (
              <EmailMessageModal emailMessage={emailMessage} />
            ),
            props: { className: 'text-center' },
          },
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
            title: 'Longueur du corps',
            render: ({ message }) => `${message.length} octets`,
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
