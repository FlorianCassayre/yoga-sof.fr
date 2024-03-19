import React, { Fragment, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack, Step,
  StepLabel,
  Stepper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
  Link as MuiLink, Radio, useTheme
} from '@mui/material';
import {
  Add,
  ArrowBack,
  ArrowForward,
  ArrowRight,
  Check, CheckCircle,
  Face2TwoTone,
  Face3TwoTone,
  FaceTwoTone,
  Login, Person, PersonAdd
} from '@mui/icons-material';
import Link from 'next/link';
import { DataGrid, gridClasses, GridColDef, GridRowParams, GridValueGetterParams } from '@mui/x-data-grid';
import { trpc } from '../common/trpc';
import { CourseType } from '@prisma/client';
import { CourseTypeNames } from '../common/course';
import { GridRenderCellParams, GridValueFormatterParams } from '@mui/x-data-grid/models/params/gridCellParams';
import { formatDateDDsmmYYYY, formatTimeHHhMM, formatWeekday } from '../common/date';
import { CheckboxElement, DeepPartial, FormContainer, TextFieldElement, useFormContext } from 'react-hook-form-mui';
import { zodResolver } from '@hookform/resolvers/zod';
import { frontsiteCourseRegistrationSchema } from '../common/schemas/frontsiteCourseRegistration';
// @ts-ignore
import { RegistrationNoticePersonalInformation, RegistrationNoticeRecap } from '../../contents/inscription.mdx';
import { useSnackbar } from 'notistack';
import { DirtyFormUnloadAlert } from './form/fields/DirtyFormUnloadAlert';
import { courses } from './contents/common/courses';
import { Session } from 'next-auth';
import { blue } from '@mui/material/colors';
import { userSchemaBase } from '../common/schemas/user';
import { DeepNullable, ValidateSubtype } from '../common/utils';
import { z } from 'zod';

const ErrorAlert: React.FC = () => (
  <Box textAlign="center">
    <Alert severity="error">Une erreur est survenue, impossible de charger les données pour le moment.</Alert>
  </Box>
);

interface UserCardProps {
  suptitle: string;
  title?: string;
  selected: boolean;
  onSelect: () => void;

}

const UserCard: React.FC<UserCardProps> = ({ suptitle, title, selected, onSelect }) => {
  return (
    <Card variant="outlined" onClick={onSelect} sx={{ height: '100%', backgroundColor: selected ? blue[50] : undefined, cursor: 'pointer', border: title || selected ? undefined : '1px dashed lightgrey' }}>
      <CardContent sx={{ height: '100%' }}>
        <Stack direction="column" justifyContent="space-between" sx={{ height: '100%' }}>
          <Box>
            <Typography textAlign="center" sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
              {suptitle}
            </Typography>
            {title ? (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" component="div">
                  {title}
                </Typography>
                <Person fontSize="large" color="action" sx={{ my: 2 }} />
              </Box>
            ) : (
              <Box sx={{ position: 'relative' }}>
                <Stack direction="column" spacing={1} sx={{ mb: 1, visibility: selected ? undefined : 'hidden' }}>
                  <TextFieldElement name="name" label="Nom complet" variant="standard" />
                  <TextFieldElement name="email" label="Adresse e-mail (facultatif)" helperText="(il doit s'agir de l'adresse du proche et non de la vôtre - laisser blanc si non applicable)" variant="standard" />
                </Stack>
                <Box sx={{ textAlign: 'center', position: 'absolute', top: 0, width: '100%', visibility: selected ? 'hidden' : undefined }}>
                  <Typography variant="h5" component="div" sx={{ visibility: 'hidden' }}>
                    {'.'}
                  </Typography>
                  <PersonAdd fontSize="large" color="action" sx={{ my: 2 }} />
                </Box>
              </Box>
            )}
          </Box>
          <Box textAlign="center">
            <Radio
              checked={selected}
              onChange={onSelect}
              sx={{ mb: -2 }}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

interface CourseRegistrationFormStep1UserSelectionProps {
  session: Session;
}

const CourseRegistrationFormStep1UserSelection: React.FC<CourseRegistrationFormStep1UserSelectionProps> = ({ session }) => {
  const { watch, setValue } = useFormContext<CourseRegistrationFieldValues>();
  const watchUserId = watch('userId');
  const { data: managedUsersData, isError: isManagedUsersError } = trpc.self.managedUsers.useQuery();
  const cardProps = (userIdValue: number | null) => ({
    selected: watchUserId === userIdValue,
    onSelect: () => setValue('userId', userIdValue),
  });
  const itemsProps = { item: true, xs: 12, sm: 6, md: 4 };
  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        Sélectionnez la personne bénéficiaire des séances de Yoga ; il peut s'agit de vous-même ou bien d'un proche :
      </Box>
      {managedUsersData ? (
        <Grid container spacing={2} alignItems="stretch">
          <Grid {...itemsProps}>
            <UserCard
              suptitle="Vous-même"
              title={session.displayName ?? session.displayEmail ?? '?'}
              {...cardProps(session.userId)}
            />
          </Grid>
          {managedUsersData.managedUsers.map(user => (
            <Grid key={user.id} {...itemsProps}>
              <UserCard
                suptitle="Un proche déjà enregistré"
                title={user.name}
                {...cardProps(user.id)}
              />
            </Grid>
          ))}
          <Grid {...itemsProps}>
            <UserCard
              suptitle="Un nouveau proche"
              {...cardProps(null)}
            />
          </Grid>
        </Grid>
      ) : isManagedUsersError ? (
        <ErrorAlert />
      ) : (
        <Box textAlign="center">
          <CircularProgress sx={{ my: 3 }} />
        </Box>
      )}
    </Box>
  );
}

const CourseSelectionGrid: React.FC<Pick<CourseRegistrationFormProps, 'courses' | 'userCourses'>> = ({ courses, userCourses }) => {
  const theme = useTheme();
  const { watch, setValue } = useFormContext<CourseRegistrationFieldValues>();
  const watchCourseIds = watch('courseIds');
  const alreadyRegisteredCourseSet = useMemo(() => new Set<number>(userCourses.map(({ course: { id } }) => id)), [userCourses]);

  const rowsPerPageOptions = [10];
  type CourseItem = (typeof courses)[0];
  const columns: GridColDef<CourseItem>[] = [
    {
      field: 'date',
      headerName: 'Date et horaire',
      minWidth: 330,
      flex: 2,
      valueGetter: ({ row: { dateStart } }: GridValueGetterParams<CourseItem>) => dateStart,
      renderCell: ({ row: { dateStart, dateEnd } }: GridRenderCellParams<CourseItem>) =>
        [formatWeekday(dateStart), formatDateDDsmmYYYY(dateStart), 'de', formatTimeHHhMM(dateStart), 'à', formatTimeHHhMM(dateEnd)].join(' '),
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'type',
      headerName: 'Type de séance',
      minWidth: 120,
      flex: 1,
      valueGetter: ({ value }: GridValueFormatterParams<CourseType>) => CourseTypeNames[value],
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'slots',
      headerName: 'Places restantes / disponibles',
      minWidth: 220,
      flex: 1,
      valueGetter: ({ row: { slots, registrations } }: GridValueGetterParams<CourseItem>) => slots - registrations,
      renderCell: ({ row: { slots, registrations } }: GridRenderCellParams<CourseItem>) => (
        <Box sx={{ fontWeight: 'bold' }}>
          <Box display="inline" sx={{ color: registrations >= slots ? 'error.main' : slots - registrations <= 1 ? 'warning.main' : 'success.main' }}>{slots - registrations}</Box>
          <Box display="inline" sx={{ mx: 1 }}>/</Box>
          <Box display="inline">{slots}</Box>
        </Box>
      ),
      headerAlign: 'center',
      align: 'center',
    }
  ];
  return (
    <DataGrid
      rows={courses}
      columns={columns}
      initialState={{
        sorting: { sortModel: [{ field: 'date', sort: 'asc' }] },
        pagination: { paginationModel: { pageSize: rowsPerPageOptions[0] } },
      }}
      pageSizeOptions={rowsPerPageOptions}
      sortingOrder={['asc', 'desc']}
      checkboxSelection
      rowSelectionModel={[...watchCourseIds, ...Array.from(alreadyRegisteredCourseSet)]}
      onRowSelectionModelChange={selected => setValue('courseIds', selected.map(id => typeof id === 'string' ? parseInt(id) : id).filter(id => !alreadyRegisteredCourseSet.has(id)))}
      isRowSelectable={({ row }: GridRowParams<(typeof courses)[0]>) => !alreadyRegisteredCourseSet.has(row.id) && row.registrations < row.slots}
      localeText={{
        footerRowSelected: () => {
          const actualCount = watchCourseIds.length;
          return actualCount === 0 ? '' : `${actualCount} séance${actualCount > 1 ? 's' : ''} sélectionnée${actualCount > 1 ? 's' : ''}`;
        },
      }}
      autoHeight
      disableColumnMenu
      disableColumnSelector
      sx={{
        [theme.breakpoints.only('xs')]: {
          mx: -2,
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          // Scroll
          '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
            width: '0.4em',
          },
          '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
          },
          '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover': {
            background: '#555',
        },
        // TODO factor out this code
        [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]: {
          outline: "none"
        },
        [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]: {
          outline: "none"
        },
        '& .MuiDataGrid-columnSeparator': {
          display: 'none',
        },
        // Disable select all
        '& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer': {
          display: 'none'
        },
        },
      }}
    />
  );
};

const CourseRegistrationFormStep2CoursesSelection: React.FC<CourseRegistrationFormProps & { isLoading: boolean, isError: boolean }> = ({ courses, userCourses, session, isLoading, isError }) => {
  const { watch } = useFormContext<CourseRegistrationFieldValues>();
  const watchUserId = watch('userId');
  const watchName = watch('name');
  return isError ? (
    <ErrorAlert />
  ) : isLoading || !courses || !userCourses ? (
    <Box textAlign="center">
      <CircularProgress sx={{ my: 3 }} />
    </Box>
  ) : (
    <Box>
      <Box sx={{ mb: 2 }}>
        Sélectionnez les séances pour lesquelles vous souhaitez{' '}
        {watchUserId === session.userId ? 'vous inscrire' : <>inscrire <strong>{watchName}</strong></>}
        {' '}:
      </Box>
      <CourseSelectionGrid courses={courses} userCourses={userCourses} />
    </Box>
  );
};

const CourseRegistrationFormStep3Confirmation: React.FC<Pick<CourseRegistrationFormProps, 'courses' | 'session'>> = ({ courses, session }) => {
  const { watch } = useFormContext<CourseRegistrationFieldValues>();
  const watchSelectedCourseIds = watch('courseIds');
  const watchUserId = watch('userId');
  const coursesById = useMemo(() => Object.fromEntries(courses.map(course => [course.id, course])), [courses]);
  const selectedCourses = useMemo(() => watchSelectedCourseIds.map(id => coursesById[id]), [watchSelectedCourseIds, coursesById]);
  const selectedCoursesByTypesSorted = useMemo(() => {
    const typesSorted =
      Array.from(new Set<CourseType>(selectedCourses.map(({ type }) => type)))
      .sort((a, b) => CourseTypeNames[a] < CourseTypeNames[b] ? -1 : 1);
    const typesMap = Object.fromEntries(typesSorted.map<[CourseType, CourseRegistrationFormProps['courses']]>(type => [type, []]));
    selectedCourses.forEach(course => typesMap[course.type].push(course));
    return typesSorted.map(type => [type, typesMap[type].sort((a, b) => a.dateStart < b.dateStart ? -1 : 1)] as const);
  }, [selectedCourses]);
  const self = watchUserId === session.userId;

  return (
    <>
      <Grid container spacing={4} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" component="div" sx={{ mb: 2 }}>
            Récapitulatif des inscriptions
          </Typography>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                      Type de séance
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                      Date et horaire
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                      Prix
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedCoursesByTypesSorted.map(([type, courses]) => (
                    <Fragment key={type}>
                      {courses.map((course, i) => (
                        <TableRow key={course.id}>
                          {i === 0 && (
                            <TableCell rowSpan={courses.length} sx={{ textAlign: 'center' }}>
                              {CourseTypeNames[course.type]}
                            </TableCell>
                          )}
                          <TableCell>
                            {[formatWeekday(course.dateStart), formatDateDDsmmYYYY(course.dateStart), 'de', formatTimeHHhMM(course.dateStart), 'à', formatTimeHHhMM(course.dateEnd)].join(' ')}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right' }}>
                            {`${course.price} €`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </Fragment>
                  ))}
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell colSpan={2} sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {`${selectedCourses.length} séance${selectedCourses.length > 1 ? 's' : ''} au total`}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                      {selectedCourses.map(({ price }) => price).reduce((a, b) => a + b, 0)}
                      {' €'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          <RegistrationNoticeRecap />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" component="div" sx={{ mb: 2 }}>
            {self ? (
              <>
                Vos informations personnelles
              </>
            ) : (
              <>
                Informations personnelles du proche
              </>
            )}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <TextFieldElement variant="standard" name="name" label="Nom complet" fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextFieldElement variant="standard" name="email" label="Adresse e-mail" fullWidth />
            </Grid>
          </Grid>
          <RegistrationNoticePersonalInformation self={self} />
        </Grid>
      </Grid>
      <Grid container sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <CheckboxElement
            name="notify"
            label={`Recevoir une copie ${self ? 'de mes' : 'des'} inscriptions par e-mail${self ? '' : ' (le proche recevra également une copie si une adresse est renseignée)'}`}
          />
        </Grid>
        <Grid item xs={12}>
          <CheckboxElement
            name="consent"
            label={`J'ai pris connaissance du règlement intérieur, en outre je m'engage à ${self ? 'me désinscrire' : 'désinscrire le proche'} dans les meilleurs délais si ${self ? 'je ne peux' : 'il ou elle ne peut'} plus assister à une ou plusieurs séances`}
          />
        </Grid>
      </Grid>
    </>
  );
};

interface CourseRegistrationFormStepConfirmedProps {}

const CourseRegistrationFormStep3Confirmed: React.FC<CourseRegistrationFormStepConfirmedProps> = () => {
  return (
    <>
      <Box textAlign="center" sx={{ mb: 2 }}>
        <CheckCircle fontSize="large" color="success" />
      </Box>
      <Box textAlign="center" sx={{ mb: 4 }}>
        <Box>
          Vos inscriptions ont bien été prises en compte et nous vous en remercions.
        </Box>
        <Box>
          Vous pouvez dès à présent les retrouver sur
          {' '}
          <Link href="/mes-inscriptions" passHref legacyBehavior>
            <MuiLink>votre page personnelle</MuiLink>
          </Link>
          .
        </Box>
        <Box>
          En cas de question, n'hésitez pas à
          {' '}
          <Link href="/a-propos" passHref legacyBehavior>
            <MuiLink>nous contacter</MuiLink>
          </Link>
          {' '}
          !
        </Box>
      </Box>
    </>
  );
};

const CourseRegistrationFormStepper: React.FC<{ done: boolean }> = ({ done }) => {
  const stepNames = [`Choix du bénéficiaire`, `Sélection des séances`, `Confirmation`];
  const { watch } = useFormContext<CourseRegistrationFieldValues>();
  const watchStep = watch('step');

  return (
    <Stepper activeStep={1} sx={{ mb: 4 }}>
      {stepNames.map((stepName, i) => (
        <Step key={i} active={watchStep === i && !done} completed={watchStep > i || done}>
          <StepLabel>{stepName}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

interface CourseRegistrationFormNavigationProps {
  isLoading: boolean;
  done: boolean;
}

const CourseRegistrationFormNavigation: React.FC<CourseRegistrationFormNavigationProps> = ({ isLoading, done }) => {
  const { watch, setValue } = useFormContext<CourseRegistrationFieldValues>();
  const watchStep = watch('step');
  const watchUserId = watch('userId');
  const watchName = watch('name');
  const watchEmail = watch('email');
  const watchCourseIds = watch('courseIds');
  const handleNext = () => {
    if (watchStep !== 2) {
      setValue('step', watchStep + 1);
    }
  };
  const handlePrevious = () => {
    setValue('step', watchStep - 1);
  };

  return !done ? (
    <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'space-between' }}>
      {/* The `key` attributes here are important, otherwise React considers a click as a submit action */}
        <Button
          key={`back-${watchStep}`}
          variant="outlined"
          color="inherit"
          startIcon={<ArrowBack />}
          onClick={handlePrevious}
          disabled={isLoading}
          sx={{ visibility: watchStep <= 0 || watchStep >= 3 ? 'hidden' : undefined }}
        >
          Étape précédente
        </Button>
        <Button
          key={`next-${watchStep}`}
          variant="contained"
          type={watchStep === 2 ? 'submit' : undefined}
          startIcon={watchStep !== 2 ? <ArrowForward /> : <Check />}
          disabled={
            (watchStep === 0 && (watchUserId === undefined || (watchUserId === null && !userSchemaBase.safeParse({ name: watchName, email: watchEmail }).success)))
            || (watchStep === 1 && watchCourseIds.length === 0)
            || isLoading
          }
          onClick={handleNext}
          sx={{ visibility: watchStep >= 3 ? 'hidden' : undefined }}
        >
          {watchStep !== 2 ? `Étape suivante` : `Valider ces inscriptions`}
        </Button>
    </Stack>
  ) : null;
};

interface CourseRegistrationFormProps {
  session: Session;
  courses: { id: number, type: CourseType, slots: number, price: number, dateStart: Date, dateEnd: Date, registrations: number }[];
  userCourses: {
    id: number,
    isUserCanceled: boolean,
    createdAt: Date,
    canceledAt: Date | null,
    course: {
      id: number,
      type: CourseType,
      dateStart: Date,
      dateEnd: Date,
      isCanceled: boolean,
    },
  }[];
}

const CourseStepContent: React.FC<Pick<CourseRegistrationFormProps, 'session' | 'courses'> & { done: boolean }> = ({ session, courses, done }) => {
  const { watch, setValue } = useFormContext<CourseRegistrationFieldValues>();
  const watchStep = watch('step');
  const watchUserId = watch('userId');
  // In case no user is selected, we just preload the current user
  const { data: selectedUserCoursesData, isLoading: isSelectedUserCoursesLoading, isError: isSelectedUserCoursesError } =
    trpc.self.findAllRegisteredCourses.useQuery({ userId: watchUserId ?? session.userId, userCanceled: false, future: true }, {
      enabled: watchUserId != null,
    });
  const { data: selectedUserProfileData, isLoading: isSelectedUserProfileLoading, isError: isSelectedUserProfileError } =
    trpc.self.profile.useQuery({ userId: watchUserId ?? session.userId }, {
      enabled: watchUserId != null,
    });
  useEffect(() => {
    if (watchStep === 0) {
      if (watchUserId !== null) {
        setValue('name', '');
        setValue('email', '');
      }
      setValue('courseIds', []);
    } else if (watchStep === 1) {
      if (watchUserId !== null && selectedUserProfileData) {
        setValue('name', selectedUserProfileData.name);
        setValue('email', selectedUserProfileData.email);
      }
    }
  }, [watchStep, selectedUserProfileData, setValue]);
  return watchStep === 0 && !done ? (
    <CourseRegistrationFormStep1UserSelection session={session} />
  ) : watchStep === 1 && !done ? (
    <CourseRegistrationFormStep2CoursesSelection
      courses={courses}
      userCourses={watchUserId != null ? selectedUserCoursesData! : []}
      session={session}
      isLoading={watchUserId != null && (isSelectedUserCoursesLoading || isSelectedUserProfileLoading)}
      isError={isSelectedUserCoursesError || isSelectedUserProfileError}
    />
  ) : watchStep === 2 && !done ? (
    <CourseRegistrationFormStep3Confirmation courses={courses} session={session} />
  ) : done ? (
    <CourseRegistrationFormStep3Confirmed />
  ) : null;
}

type CourseRegistrationFieldValues = ValidateSubtype<
  DeepPartial<DeepNullable<z.infer<typeof frontsiteCourseRegistrationSchema>>>,
  {
    step: number,
    userId?: number | null,
    courseIds: number[],
    name: string | null,
    email: string | null,
    consent: boolean,
    notify: boolean,
  }
>;

const CourseRegistrationForm: React.FC<Pick<CourseRegistrationFormProps, 'courses' | 'session'>> = ({ session, courses }) => {
  const trpcClient = trpc.useContext();
  const { enqueueSnackbar } = useSnackbar();
  const reloadSession = () => {
    const event = new Event('visibilitychange');
    document.dispatchEvent(event);
  };
  const { mutate: submitRegister, isLoading: isSubmitRegisterLoading, isSuccess: isSubmitRegisterSuccess } = trpc.self.register.useMutation({
    onSuccess: async () => {
      await Promise.all(([trpcClient.self.managedUsers, trpcClient.self.findAllRegisteredCourses, trpcClient.self.profile, trpcClient.public.findAllModels, trpcClient.public.findAllFutureCourses]).map(procedure => procedure.invalidate()));
      reloadSession();
      enqueueSnackbar(`Vos inscriptions ont bien été prises en compte`, { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar(`Une erreur est survenue au moment de soumettre vos inscriptions`, { variant: 'error' });
    },
  });
  return (
    <FormContainer
      onSuccess={data => submitRegister(data as any)}
      resolver={zodResolver(frontsiteCourseRegistrationSchema)}
      defaultValues={{ step: 0, userId: undefined, courseIds: [], name: '', email: '', consent: false, notify: true } satisfies CourseRegistrationFieldValues}
    >
      {/*<DirtyFormUnloadAlert condition={isSubmitRegisterLoading} disabled={isSubmitRegisterSuccess} message="Vous n'avez pas confirmé vos inscriptions, souhaitez-vous vraiment quitter la page ?" />*/}
      <CourseRegistrationFormStepper done={isSubmitRegisterSuccess} />
      <CourseStepContent session={session} courses={courses} done={isSubmitRegisterSuccess} />
      <CourseRegistrationFormNavigation isLoading={isSubmitRegisterLoading} done={isSubmitRegisterSuccess} />
    </FormContainer>
  );
};

interface CourseRegistrationFormWidgetProps {}

export const CourseRegistrationFormWidget: React.FC<CourseRegistrationFormWidgetProps> = () => {
  const theme = useTheme();
  const { status, data: session } = useSession();
  const isAuthenticated = useMemo(() => status === 'authenticated', [status]);
  const { data: coursesData, isError: isCoursesError } = trpc.public.findAllFutureCourses.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  return (
    <Card variant="outlined" sx={{ [theme.breakpoints.only('xs')]: { mx: -2, borderRadius: 0, borderLeft: 'none', borderRight: 'none' } }}>
      <CardContent>
        {status === 'unauthenticated' ? (
          <Box textAlign="center" sx={{ py: 2 }}>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Face3TwoTone color="disabled" fontSize="large" />
              <FaceTwoTone color="disabled" fontSize="large" />
              <Face2TwoTone color="disabled" fontSize="large" />
            </Stack>
            <Link href="/connexion" passHref legacyBehavior>
              <Button variant="outlined" startIcon={<Login />} sx={{ my: 2 }}>
                Créer un compte ou me connecter
              </Button>
            </Link>
            <Box sx={{ color: 'text.disabled' }}>
              (vous devez être connecté pour vous inscrire à des séances)
            </Box>
          </Box>
        ) : isCoursesError ? (
          <ErrorAlert />
        ) : status === 'loading' || !coursesData || !session ? (
          <Box textAlign="center">
            <CircularProgress sx={{ my: 3 }} />
          </Box>
        ) : (
          <CourseRegistrationForm session={session} courses={coursesData} />
        )}
      </CardContent>
    </Card>
  );
}
