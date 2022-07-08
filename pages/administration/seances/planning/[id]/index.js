import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, ButtonGroup } from 'react-bootstrap';
import {
  BsCalendarEvent,
  BsCheck2Square, BsCheckSquare,
  BsInfoCircle,
  BsPencil,
  BsPlusLg, BsQuestionSquare,
  BsXLg,
  BsXOctagon,
  BsXSquare,
} from 'react-icons/bs';
import Link from 'next/link';
import { CancelCourseConfirmDialog, CourseStatusBadge } from '../../../../../components';
import { ContentLayout, PrivateLayout } from '../../../../../components/layout/admin';
import {
  StaticPaginatedTable,
  adaptColumn,
  bundleLinkColumn,
  cancelRegistrationColumn,
  userLinkColumn,
} from '../../../../../components/table';
import { displayCourseName, displayDatetime } from '../../../../../lib/common';
import { usePromiseCallback, usePromiseEffect } from '../../../../../hooks';
import { breadcrumbForCoursePlanning } from '../../../../../lib/client';
import { getCourse, postCourseRegistrationAttended } from '../../../../../lib/client/api';

function CourseViewLayout({ id }) {
  const { isLoading, isError, data, error } = usePromiseEffect(() => getCourse(id, { include: ['registrations.user', 'bundle'] }), []);

  const registrationDateColumn = {
    title: `Date d'inscription`,
    render: ({ createdAt }) => displayDatetime(createdAt),
  };

  const sortedRegistrations = useMemo(() => data && data.registrations.slice().sort(({ createdAt: t1 }, { createdAt: t2 }) => new Date(t2).getTime() - new Date(t1).getTime()), [data]);
  const [notCanceledRegistrations, canceledRegistrations] = useMemo(
    () => (sortedRegistrations ? [sortedRegistrations.filter(({ isUserCanceled }) => !isUserCanceled), sortedRegistrations.filter(({ isUserCanceled }) => isUserCanceled)] : []),
    [sortedRegistrations],
  );

  const isFuture = data && !data.isCanceled && new Date().getTime() < new Date(data.dateEnd).getTime();

  const [isCheckingAttendance, setCheckingAttendance] = useState(false);
  const [attendanceKey, setAttendanceKey] = useState(0);
  const [{
    isLoading: isSubmitAttendanceLoading,
    data: submitAttendanceResult,
  }, submitAttendanceDispatcher] = usePromiseCallback((registrationId, attendanceData) => postCourseRegistrationAttended(registrationId, attendanceData), []);
  useEffect(() => {
    // Manual update of local data, generally unsafe but should be fine in this case
    if (submitAttendanceResult) {
      data.registrations.forEach(obj => {
        if (obj.id === submitAttendanceResult.id) {
          // eslint-disable-next-line
          obj.attended = submitAttendanceResult.attended;
        }
      });
    }
    setAttendanceKey(attendanceKey + 1);
    // eslint-disable-next-line
  }, [submitAttendanceResult]);

  const attendanceStates = [
    { value: true, variant: 'success', icon: BsCheckSquare, name: 'Présent' },
    { value: null, variant: 'secondary', icon: BsQuestionSquare, name: 'Non renseigné' },
    { value: false, variant: 'danger', icon: BsXSquare, name: 'Absent' },
  ];

  const tomorrowMidnight = () => {
    const date = new Date();
    date.setHours(24, 0, 0, 0);
    return date;
  };

  return (
    <ContentLayout
      title={
        data && (
          <>
            {displayCourseName(data)}
            <CourseStatusBadge course={data} className="ms-2" />
          </>
        )
      }
      icon={BsCalendarEvent}
      headTitle={data && displayCourseName(data)}
      breadcrumb={data && breadcrumbForCoursePlanning(data)}
      isLoading={isLoading}
      isError={isError}
      error={error}
    >
      <div className="mb-3">
        {data && !data.isCanceled && data.registrations.filter(({ isUserCanceled }) => !isUserCanceled).length > 0 && (!isCheckingAttendance ? (
          <Button variant="info" className="me-2" onClick={() => setCheckingAttendance(true)}>
            <BsCheck2Square className="icon me-2" />
            Faire l'appel
          </Button>
        ) : (
          <Button variant="secondary" className="me-2" onClick={() => setCheckingAttendance(false)}>
            <BsXLg className="icon me-2" />
            Ne plus faire l'appel
          </Button>
        ))}

        <Link href={`/administration/seances/planning/${id}/edition`} passHref>
          <Button className="me-2">
            <BsPencil className="icon me-2" />
            Modifier mes notes
          </Button>
        </Link>
        {isFuture && (
          <CancelCourseConfirmDialog
            course={data}
            triggerer={clickHandler => ( // eslint-disable-line react/no-unstable-nested-components
              <Button variant="outline-danger" onClick={clickHandler}>
                <BsXOctagon className="icon me-2" />
                Annuler cette séance
              </Button>
            )}
          />
        )}
      </div>

      <div className="mb-4">
        <BsInfoCircle className="icon me-2" />
        {data && data.bundleId !== null ? (
          <>
            Cette séance fait partie du lot suivant :
            <span className="me-2" />
            {bundleLinkColumn.render(data)}
          </>
        ) : (
          <>
            Cette séance ne fait partie d'aucun lot, les utilisateurs peuvent s'y inscrire librement.
          </>
        )}
      </div>

      {data && data.cancelationReason && (
        <>
          <h2 className="h5">Motif de l'annulation</h2>
          <p>{data.cancelationReason}</p>
        </>
      )}

      {data && data.notes && (
        <>
          <h2 className="h5">Notes</h2>
          <p>{data.notes}</p>
        </>
      )}

      <h2 className="h5">
        Participants
        <Badge bg="secondary" className="ms-2">
          {data && notCanceledRegistrations.length}
          {' '}
          /
          {' '}
          {data && data.slots}
        </Badge>
      </h2>

      <p>Liste des utilisateurs actuellement inscrits à cette séance (n'ayant pas annulé).</p>

      <StaticPaginatedTable
        rows={data && notCanceledRegistrations}
        columns={[
          userLinkColumn,
          ...(isCheckingAttendance ? [{
            title: 'Présence',
            render: obj => {
              const { id: registrationId, attended } = obj;

              const onChange = value => {
                submitAttendanceDispatcher(registrationId, { attended: value });
              };
              return (
                <ButtonGroup key={attendanceKey}>
                  {attendanceStates.map(({ value, variant, icon: Icon }) => (
                    <Button
                      key={`${value}`}
                      variant={attended === value && !isSubmitAttendanceLoading ? variant : `outline-${variant}`}
                      size="sm"
                      onClick={() => onChange(value)}
                      disabled={isSubmitAttendanceLoading}
                    >
                      <Icon className="icon" />
                    </Button>
                  ))}
                </ButtonGroup>
              );
            },
            props: { className: 'text-center' },
          }] : data && new Date(data.dateStart) <= tomorrowMidnight() ? [{
            title: 'Présence',
            render: ({ attended }) => {
              const { variant, icon: Icon, name } = attendanceStates.filter(({ value }) => value === attended)[0];
              return (
                <Badge bg={variant}>
                  <Icon className="icon me-2" />
                  {name}
                </Badge>
              );
            },
            props: { className: 'text-center' },
          }] : []),
          registrationDateColumn,
          adaptColumn(registration => ({ ...registration, course: data }))(cancelRegistrationColumn),
        ]}
        renderEmpty={() => 'Personne ne participe pour le moment.'}
      />

      {isFuture && (
        <div className="text-center">
          <Link href={{ pathname: '/administration/inscriptions/creation', query: { courseId: data && data.id } }} passHref>
            <Button variant="success">
              <BsPlusLg className="icon me-2" />
              Inscrire un utilisateur
            </Button>
          </Link>
        </div>
      )}

      <h2 className="h5">Annulations</h2>

      <p>Historique des annulations pour cette séance.</p>

      <StaticPaginatedTable
        rows={data && canceledRegistrations}
        columns={[
          userLinkColumn,
          registrationDateColumn,
          {
            title: `Date d'annulation`,
            render: ({ canceledAt }) => displayDatetime(canceledAt),
          },
        ]}
        renderEmpty={() => `Aucun utilisateur n'a annulé.`}
      />
    </ContentLayout>
  );
}

export default function CourseView() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateLayout>
      <CourseViewLayout id={id} />
    </PrivateLayout>
  );
}
