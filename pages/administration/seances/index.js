import { format } from 'date-fns';
import { Badge, Button } from 'react-bootstrap';
import { BsEyeFill, BsPencil, BsPlusLg, BsXOctagon } from 'react-icons/bs';
import {
  BREADCRUMB_SESSIONS, ConfirmDialog, dateFormat,
  DynamicPaginatedTable,
  SESSIONS_TYPES,
  SessionsCards,
} from '../../../components';
import { PrivateLayout } from '../../../components/layout/admin';
import Link from 'next/link';

export default function AdminSeances({ pathname }) {

  const renderDate = ({ date_start: date }) => format(new Date(date), dateFormat);

  const renderTimePeriod = ({ date_start, date_end }) => (
    <>
      {format(new Date(date_start), 'HH\'h\'mm')}
      {' '}à{' '}
      {format(new Date(date_end), 'HH\'h\'mm')}
    </>
  );

  const renderSessionType = ({ type }) => SESSIONS_TYPES.find(({ id }) => id === type).title;

  return (
    <PrivateLayout pathname={pathname} title="Séances" breadcrumb={BREADCRUMB_SESSIONS}>

      <h2 className="h5">Modèles de séances</h2>

      <p>
        Il s'agit des horaires hebdomadaires de déroulement des séances qui seront affichées sur le site.
        Ces modèles servent ensuite à efficacement planifier un lot de séances (ci-dessous).
        Il reste possible de planifier des séances à d'autres dates et horaires que celles indiquées par les modèles.
      </p>

      <SessionsCards />

      <h2 className="h5">Planification de séances</h2>

      <p>
        Les utilisateurs ne peuvent seulement s'inscrire à des séances qui ont été planifiées.
        Ce tableau contient la liste des séances passées, présentes et futures.
        Le bouton permet de planifier de nouvelles séances.
        Il n'est pas possible de supprimer de séances, en revanche il est possible d'en annuler.
      </p>

      <Link href="/administration/seances/planning/creation" passHref>
        <Button variant="success" className="mb-2">
          <BsPlusLg className="icon me-2" />
          Planifier de nouvelles séances
        </Button>
      </Link>

      <DynamicPaginatedTable
        url="/api/sessions"
        params={(page, limit) => ({
          page,
          limit,
          include: ['registrations'],
        })}
        columns={[
          {
            title: '#',
            render: ({ id }) => id,
          },
          {
            title: 'Date',
            render: renderDate,
          },
          {
            title: 'Horaire',
            render: renderTimePeriod,
          },
          {
            title: 'Type de séance',
            render: renderSessionType,
          },
          {
            title: 'Prix',
            render: ({ price }) => price > 0 ? `${price} €` : 'Gratuit',
          },
          {
            title: 'Inscriptions / Places disponibles',
            render: ({ slots, registrations }) => (
              <>
                {registrations.filter(({ is_user_canceled }) => !is_user_canceled).length} / {slots}
              </>
            ),
          },
          {
            title: 'Statut',
            render: ({ is_canceled, date_start, date_end }) => {
              const now = new Date();
              const dateStart = new Date(date_start), dateEnd = new Date(date_end);
              return (
                is_canceled ? (
                  <Badge bg="danger">Annulée</Badge>
                ) : (now.getTime() < dateStart.getTime() ? (
                  <Badge bg="info">À venir</Badge>
                ) : now.getTime() <= dateEnd.getTime() ? (
                  <Badge bg="success">En cours</Badge>
                ) : (
                  <Badge bg="secondary">Passée</Badge>
                ))
              )
            },
            props: {
              className: 'text-center',
            },
          },
          {
            title: 'Notes',
            render: ({ notes }) => notes,
            props: {
              style: {
                whiteSpace: 'pre-wrap',
              },
            },
          },
          {
            title: 'Actions',
            render: obj => (
              <>
                <Link href={`/administration/seances/planning/${obj.id}`} passHref>
                  <Button size="sm" variant="secondary" className="m-1">
                    <BsEyeFill className="icon" />
                  </Button>
                </Link>
                <Link href={`/administration/seances/planning/${obj.id}/edition`} passHref>
                  <Button size="sm" className="m-1">
                    <BsPencil className="icon" />
                  </Button>
                </Link>
                <ConfirmDialog
                  title="Annuler la séance"
                  description={(
                    <>
                      Souhaitez-vous réellement annuler cette séance ?
                      <ul>
                        <li>{renderSessionType(obj)} le {renderDate(obj)} de {renderTimePeriod(obj)}</li>
                      </ul>
                      Les éventuelles personnes qui s'y sont inscrites seront notifiées.
                    </>
                  )}
                  confirmButton={(
                    <Button variant="danger" onClick={() => console.log('cancel')}>
                      <BsXOctagon className="icon me-2" />
                      Annuler la séance
                    </Button>
                  )}
                  triggerer={clickHandler => (
                    <Button size="sm" variant="danger" className="m-1" disabled={obj.is_canceled} onClick={clickHandler}>
                      <BsXOctagon className="icon" />
                    </Button>
                  )}
                />

              </>
            ),
            props: {
              className: 'text-center',
            },
          }
        ]}
      />

    </PrivateLayout>
  );
}

AdminSeances.getInitialProps = ({ pathname })  => {
  return { pathname };
}
