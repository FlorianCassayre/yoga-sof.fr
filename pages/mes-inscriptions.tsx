import { FrontsiteContent } from '../components/layout/public/FrontsiteContent';
import Link from 'next/link';
import { Box, CircularProgress, Link as MuiLink, TextField, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { FrontsiteCourseGrid } from '../components/grid/grids/FrontsiteCourseGrid';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { CalendarLinkButton } from '../components/CalendarLinkButton';
import { Session } from 'next-auth';
import { PickersDay, StaticDatePicker } from '@mui/x-date-pickers';
import { PickersDayProps } from '@mui/x-date-pickers/PickersDay/PickersDay';
import { trpc } from '../lib/common/trpc';
import { isSameDay } from 'date-fns';

const CalendarWidget = () => {
  const { data, isLoading } = trpc.useQuery(['self.findAllRegisteredCourses', { future: null }]);
  const renderDay = (day: Date, selectedDays: Date[], pickersDayProps: PickersDayProps<Date>) => {
    const isSelected = data && data.some(({ course: { dateStart } }: any) => isSameDay(new Date(dateStart), day));
    return (
      <PickersDay
        key={day.toString()}
        {...pickersDayProps}
        selected={isSelected}
        disabled={!isSameDay(day, new Date()) && day.getTime() < new Date().getTime()}
      />
    );
  };
  return (
      <StaticDatePicker
        displayStaticWrapperAs="desktop"
        value={null}
        readOnly
        loading={isLoading}
        onChange={() => {}}
        renderInput={(params) => <TextField {...params} />}
        renderDay={renderDay}
        showDaysOutsideCurrentMonth
      />
  )
};

const UserDataForm: React.FC = () => {

  return (
    null
  );
};

interface MesInscriptionsContentProps {
  session: Session;
}

const MesInscriptionsContent: React.FC<MesInscriptionsContentProps> = ({ session }) => {

  return (
    <FrontsiteContent title="Mes inscriptions">
      Cette page liste l'ensemble de vos inscriptions aux séances de Yoga.
      Ces inscriptions se font au moyen de <Link href="/inscription" passHref><MuiLink>ce formulaire</MuiLink></Link>.
      <Typography variant="h5" component="div" sx={{ my: 2 }}>
        Séances à venir
      </Typography>
      <FrontsiteCourseGrid future={true} />
      <Typography variant="h5" component="div" sx={{ my: 2 }}>
        Séances passées
      </Typography>
      <FrontsiteCourseGrid future={false} />
      <Typography variant="h5" component="div" sx={{ my: 2 }}>
        Désinscriptions
      </Typography>
      <Typography variant="h5" component="div" sx={{ my: 2 }}>
        Données personnelles
      </Typography>
      Votre adresse email nous permet notamment de vous informer en cas d'annulation de séance.
      <UserDataForm />
      Vos données personnelles sont traitées conformément à notre <Link href="/confidentialite" passHref><MuiLink>politique de confidentialité</MuiLink></Link>,
      en particulier celles-ci ne sont utilisées que dans le but d'assurer l'inscription et l'organisation des séances de Yoga.
      <Typography variant="h5" component="div" sx={{ my: 2 }}>
        Calendrier personnel
      </Typography>
      <CalendarWidget />
      <CalendarLinkButton session={session} />
    </FrontsiteContent>
  )
};

const MesInscriptionsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/connexion');
    }
  });

  if (status === 'loading') {
    return ( // TODO skeleton
      <Box display="flex" alignItems="center" justifyContent="center">
        <CircularProgress sx={{ mt: 10 }} />
      </Box>
    )
  } else if (session === null) {
    return null;
  } else {
    return (
      <MesInscriptionsContent session={session} />
    );
  }
};

export default MesInscriptionsPage;
