import { FrontsiteContent } from '../components/layout/public/FrontsiteContent';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  Link as MuiLink, Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { FrontsiteCourseGrid } from '../components/grid/grids/FrontsiteCourseGrid';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { CalendarLinkButton } from '../components/CalendarLinkButton';
import { Session } from 'next-auth';
import { PickersDay, StaticDatePicker } from '@mui/x-date-pickers';
import { PickersDayProps } from '@mui/x-date-pickers/PickersDay/PickersDay';
import { trpc } from '../common/trpc';
import { isSameDay } from 'date-fns';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';
import { useSnackbar } from 'notistack';
import { Save } from '@mui/icons-material';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchemaBase } from '../common/schemas/user';
import { FrontsiteCouponGrid } from '../components/grid/grids/FrontsiteCouponGrid';
import { FrontsiteMembershipGrid } from '../components/grid/grids/FrontsiteMembershipGrid';

interface CalendarWidgetProps {
  userId: number;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ userId }) => {
  const { data, isLoading } = trpc.self.findAllRegisteredCourses.useQuery({ userId, future: null, userCanceled: false });
  const renderDay = (day: Date, selectedDays: Date[], pickersDayProps: PickersDayProps<Date>) => {
    const isSelected = data && data.some(({ course: { dateStart } }: any) => isSameDay(new Date(dateStart), day));
    const isDisabled = !isSameDay(day, new Date()) && day.getTime() < new Date().getTime();
    return (
      <PickersDay
        key={day.toString()}
        {...pickersDayProps}
        selected={isSelected}
        disabled={isDisabled}
        sx={{ bgcolor: isSelected && isDisabled ? '#9ec3e9 !important' : undefined }}
      />
    );
  };
  const [minDate, maxDate] = useMemo(() => {
    if (data && data.length > 0) {
      const times = data.map(({ course: { dateStart } }: any) => new Date(dateStart).getTime());
      return [new Date(Math.min(...times)), new Date(Math.max(...times))];
    } else {
      return [undefined, undefined];
    }
  }, [data]);
  return (
    <Grid container justifyContent="center" sx={{ mt: 2, mb: 3 }}>
      <Grid item>
        <Card variant="outlined">
          <StaticDatePicker
            displayStaticWrapperAs="desktop"
            views={['day']}
            value={null}
            readOnly
            loading={isLoading}
            onChange={() => {}}
            minDate={minDate}
            maxDate={maxDate}
            renderInput={(params) => <TextField {...params} />}
            renderDay={renderDay}
            showDaysOutsideCurrentMonth
          />
        </Card>
      </Grid>
    </Grid>
  )
};

interface UserDataFormProps {
  userId: number;
}

const UserDataForm: React.FC<UserDataFormProps> = ({ userId }) => {
  const trpcClient = trpc.useContext();
  const { data: initialData } = trpc.self.profile.useQuery({ userId });
  const { enqueueSnackbar } = useSnackbar();
  const reloadSession = () => {
    const event = new Event('visibilitychange');
    document.dispatchEvent(event);
  };
  const { mutate, isLoading: isUpdateLoading } = trpc.self.updateProfile.useMutation({
    onSuccess: async () => {
      await Promise.all((
        [trpcClient.self.managedUsers, trpcClient.self.profile]
      ).map(procedure => procedure.invalidate()));
      reloadSession();
      enqueueSnackbar('Vos données ont été mises à jour', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Une erreur est survenue lors de la mise à jour de vos données', { variant: 'error' });
    },
  });

  const sizeInput = { xs: 12, md: 4, lg: 5 };
  const sizeButton = { xs: 12, md: 4, lg: 2 };
  return initialData ? (
    <FormContainer
      defaultValues={initialData}
      onSuccess={({ name, email }) => mutate({ id: userId, name: name ?? '', email: email ?? null })}
      resolver={zodResolver(userSchemaBase)}
    >
      <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
        <Grid item {...sizeInput}>
          <TextFieldElement name="name" label="Nom complet" fullWidth disabled={isUpdateLoading} />
        </Grid>
        <Grid item {...sizeInput}>
          <TextFieldElement name="email" label="Adresse e-mail" fullWidth disabled={isUpdateLoading} />
        </Grid>
        <Grid item {...sizeButton} alignItems="stretch">
          <Button type="submit" variant="outlined" startIcon={<Save />} fullWidth disabled={isUpdateLoading} sx={{ height: '100%' }}>
            Sauvegarder
          </Button>
        </Grid>
      </Grid>
    </FormContainer>
  ) : (
    <Box textAlign="center" sx={{ my: 3 }}>
      <CircularProgress />
    </Box>
  );
};

interface UserTabPanelProps {
  userId: number;
  publicAccessToken: string;
}

const UserTabPanelContent: React.FC<UserTabPanelProps> = ({ userId, publicAccessToken }) => {

  return (
    <>
      <Typography variant="h5" component="div" sx={{ my: 2 }}>
        Séances
      </Typography>
      <Typography paragraph>
        Les séances à venir pour lesquelles vous êtes inscrit(e).
        Vous retrouverez également l'historique de vos inscriptions et participations.
      </Typography>
      <Stack direction="column" spacing={2}>
        <FrontsiteCourseGrid userId={userId} future={true} userCanceled={false} />
        <FrontsiteCourseGrid userId={userId} future={false} userCanceled={false} collapsible collapsedSummary="Séances passées" />
        <FrontsiteCourseGrid userId={userId} future={null} userCanceled={true} collapsible collapsedSummary="Séances désinscrites" />
      </Stack>
      <Typography variant="h5" component="div" sx={{ my: 2 }}>
        Cartes
      </Typography>
      <Typography paragraph>
        Si vous avez acheté des cartes de séances, leur solde s'affichera ci-dessous.
      </Typography>
      <FrontsiteCouponGrid userId={userId} />
      <Typography variant="h5" component="div" sx={{ my: 2 }}>
        Adhésions
      </Typography>
      <Typography paragraph>
        Vos adhésions à l'association Yoga Sof en tant que membre sont listées ci-dessous.
      </Typography>
      <FrontsiteMembershipGrid userId={userId} />
      <Typography variant="h5" component="div" sx={{ my: 2 }}>
        Données personnelles
      </Typography>
      Votre adresse email nous permet notamment de vous informer en cas d'annulation de séance.
      <UserDataForm userId={userId} />
      Vos données personnelles sont traitées conformément à notre <Link href="/confidentialite" passHref><MuiLink>politique de confidentialité</MuiLink></Link>,
      en particulier celles-ci ne sont utilisées que dans le but d'assurer l'inscription et l'organisation des séances de Yoga.
      <Typography variant="h5" component="div" sx={{ my: 2 }}>
        Calendrier personnel
      </Typography>
      Vous retrouverez sur ce calendrier toutes vos séances passées et futures.
      <CalendarWidget userId={userId} />
      <CalendarLinkButton publicAccessToken={publicAccessToken} />
    </>
  );
};

interface MesInscriptionsContentProps {
  session: Session;
}

const MesInscriptionsContent: React.FC<MesInscriptionsContentProps> = ({ session }) => {
  const [tab, setTab] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => setTab(newValue);

  const { data, isLoading } = trpc.self.managedUsers.useQuery();
  const managedUsersIncludingSelf = useMemo(() =>
    data ? [
      { id: session.userId, name: `${session.displayName ?? session.displayEmail} (vous)`, publicAccessToken: session.publicAccessToken },
      ...data.managedUsers,
    ] : undefined,
    [data, session]
  );

  return (
    <FrontsiteContent title="Mes inscriptions">
      Cette page liste l'ensemble de vos inscriptions aux séances de Yoga (ainsi que celles de vos proches le cas échéant).
      <br />
      Ces inscriptions se font au moyen de <Link href="/inscription" passHref><MuiLink>ce formulaire</MuiLink></Link>.
      {data && data.managedByUser && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Votre compte est actuellement relié à celui de <strong>{data.managedByUser.name}</strong>, ce qui lui offre la possibilité de gérer vos inscriptions à votre place.
        </Alert>
      )}
      <Box>
        {data && managedUsersIncludingSelf ? (
          <>
            {managedUsersIncludingSelf.length !== 1 && (
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
                <Tabs value={tab} onChange={handleTabChange}>
                  {managedUsersIncludingSelf.map(user => (
                    <Tab key={user.id} label={user.name} />
                  ))}
                </Tabs>
              </Box>
            )}
            {managedUsersIncludingSelf.filter((_, i) => i === tab).map(user => (
              <UserTabPanelContent key={user.id} userId={user.id} publicAccessToken={user.publicAccessToken} />
            ))}
          </>
        ) : isLoading ? (
          <Box textAlign="center" sx={{ my: 4 }}>
            <CircularProgress />
          </Box>
        ) : null}
      </Box>
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
