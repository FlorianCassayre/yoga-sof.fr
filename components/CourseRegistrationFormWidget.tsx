import React, { Fragment, useMemo } from 'react';
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
  Link as MuiLink,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  ArrowRight,
  Check, CheckCircle,
  Face2TwoTone,
  Face3TwoTone,
  FaceTwoTone,
  Login
} from '@mui/icons-material';
import Link from 'next/link';
import { DataGrid, gridClasses, GridRowParams } from '@mui/x-data-grid';
import { trpc } from '../lib/common/trpc';
import { CourseType } from '@prisma/client';
import { GridColumns } from '@mui/x-data-grid/models/colDef/gridColDef';
import { CourseTypeNames } from '../lib/common/course';
import { GridRenderCellParams, GridValueFormatterParams } from '@mui/x-data-grid/models/params/gridCellParams';
import { formatDateDDsmmYYYY, formatTimeHHhMM, formatWeekday } from '../lib/common/date';
import { CheckboxElement, FormContainer, TextFieldElement, useFormContext } from 'react-hook-form-mui';
import { zodResolver } from '@hookform/resolvers/zod';
import { frontsiteCourseRegistrationSchema } from '../lib/common/newSchemas/frontsiteCourseRegistration';
// @ts-ignore
import { RegistrationNoticePersonalInformation, RegistrationNoticeRecap } from '../contents/inscription.mdx';
import { useSnackbar } from 'notistack';

const CourseSelectionGrid: React.FC<Pick<CourseRegistrationFormProps, 'courses' | 'userCourses'>> = ({ courses, userCourses }) => {
  const { watch, setValue } = useFormContext();
  const watchCourseIds = watch('courseIds') as number[];
  const alreadyRegisteredCourseSet = useMemo(() => new Set<number>(userCourses.map(({ course: { id } }) => id)), [userCourses]);

  const rowsPerPageOptions = [10];
  const columns: GridColumns<(typeof courses)[0]> = [
    {
      field: 'type',
      headerName: 'Type de séance',
      minWidth: 140,
      flex: 1,
      valueFormatter: ({ value }: GridValueFormatterParams<CourseType>) => CourseTypeNames[value],
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'date',
      headerName: 'Date et horaire',
      minWidth: 350,
      flex: 2,
      renderCell: ({ row: { dateStart, dateEnd } }: GridRenderCellParams<{ dateStart: Date, dateEnd: Date }>) =>
        [formatWeekday(dateStart), formatDateDDsmmYYYY(dateStart), 'de', formatTimeHHhMM(dateStart), 'à', formatTimeHHhMM(dateEnd)].join(' '),
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'slots',
      headerName: 'Places restantes / disponibles',
      minWidth: 250,
      flex: 1,
      renderCell: ({ row: { slots, registrations } }: GridRenderCellParams<{ slots: number, registrations: number }>) => (
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
      pageSize={rowsPerPageOptions[0]}
      rowsPerPageOptions={rowsPerPageOptions}
      checkboxSelection
      selectionModel={[...watchCourseIds, ...Array.from(alreadyRegisteredCourseSet)]}
      onSelectionModelChange={selected => setValue('courseIds', selected.map(id => parseInt(id as any)).filter(id => !alreadyRegisteredCourseSet.has(id)))}
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
      }}
    />
  );
};

const CourseRegistrationFormStep1: React.FC<Pick<CourseRegistrationFormProps, 'courses' | 'userCourses'>> = ({ courses, userCourses }) => {

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        Sélectionnez les séances pour lesquelles vous souhaitez vous inscrire :
      </Box>
      <CourseSelectionGrid courses={courses} userCourses={userCourses} />
    </Box>
  );
};

const CourseRegistrationFormStep2: React.FC<Pick<CourseRegistrationFormProps, 'courses'>> = ({ courses }) => {
  const { watch, setValue } = useFormContext();
  const watchSelectedCourseIds = watch('courseIds') as number[];
  const coursesById = useMemo(() => Object.fromEntries(courses.map(course => [course.id, course])), [courses]);
  const selectedCourses = useMemo(() => watchSelectedCourseIds.map(id => coursesById[id]), [watchSelectedCourseIds, coursesById]);
  const selectedCoursesByTypesSorted = useMemo(() => {
    const typesSorted =
      Array.from(new Set<CourseType>(selectedCourses.map(({ type }) => type)))
      .sort((a, b) => CourseTypeNames[a] < CourseTypeNames[b] ? -1 : 1);
    const typesMap = Object.fromEntries(typesSorted.map(type => [type, [] as CourseRegistrationFormProps['courses']]));
    selectedCourses.forEach(course => typesMap[course.type].push(course));
    return typesSorted.map(type => [type as CourseType, typesMap[type].sort((a, b) => a.dateStart < b.dateStart ? -1 : 1)] as const);
  }, [selectedCourses]);

  return (
    <>
      <Grid container spacing={4} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" component="div" sx={{ mb: 2 }}>
            Récapitulatif de vos inscriptions
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
                        <TableRow>
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
            Vos informations personnelles
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <TextFieldElement variant="standard" name="name" label="Nom complet" fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextFieldElement variant="standard" name="email" label="Adresse e-mail (facultatif)" fullWidth />
            </Grid>
          </Grid>
          <RegistrationNoticePersonalInformation />
        </Grid>
      </Grid>
      <Grid container sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <CheckboxElement
            name="notify"
            label="Recevoir une copie de mes inscriptions par e-mail"
          />
        </Grid>
        <Grid item xs={12}>
          <CheckboxElement
            name="consent"
            label="J'ai pris connaissance du règlement intérieur, en outre je m'engage à me désinscrire dans les meilleurs délais (sans frais) si je ne peux plus assister à une ou plusieurs séances"
          />
        </Grid>
      </Grid>
    </>
  );
};

interface CourseRegistrationFormStepConfirmedProps {}

const CourseRegistrationFormStepConfirmed: React.FC<CourseRegistrationFormStepConfirmedProps> = () => {
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
          <Link href="/mes-inscriptions" passHref>
            <MuiLink>votre page personnelle</MuiLink>
          </Link>
          .
        </Box>
        <Box>
          En cas de question, n'hésitez pas à
          {' '}
          <Link href="/a-propos" passHref>
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
  const stepNames = [`Sélection des séances`, `Confirmation`];
  const { watch } = useFormContext();
  const watchStep = watch('step') as number;

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
  const { watch, setValue } = useFormContext();
  const watchStep = watch('step') as number;
  const watchCourseIds = watch('courseIds') as number[];
  const handleNext = () => {
    if (watchStep !== 1) {
      setValue('step', watchStep + 1);
    }
  };
  const handlePrevious = () => {
    setValue('step', watchStep - 1);
  };

  return !done ? (
    <Stack direction="row" sx={{ mt: 2, justifyContent: 'space-between' }}>
      {/* The `key` attributes here are important, otherwise React considers a click as a submit action */}
        <Button key={`back-${watchStep}`} variant="outlined" color="inherit" startIcon={<ArrowBack />} onClick={handlePrevious} disabled={isLoading} sx={{ visibility: watchStep <= 0 || watchStep >= 2 ? 'hidden' : undefined }}>
          Étape précédente
        </Button>
        <Button key={`next-${watchStep}`} variant="contained" type={watchStep === 1 ? 'submit' : undefined} startIcon={watchStep !== 1 ? <ArrowForward /> : <Check />} disabled={watchCourseIds.length === 0 || isLoading} onClick={handleNext} sx={{ visibility: watchStep >= 2 ? 'hidden' : undefined }}>
          {watchStep !== 1 ? `Étape suivante` : `Valider ces inscriptions`}
        </Button>
    </Stack>
  ) : null;
};

interface CourseRegistrationFormProps {
  courses: { id: number, type: CourseType, slots: number, price: number, dateStart: Date, dateEnd: Date, registrations: number }[];
  userCourses: {
    id: number,
    isUserCanceled: boolean,
    createdAt: Date,
    canceledAt: Date,
    course: {
      id: number,
      type: CourseType,
      dateStart: Date,
      dateEnd: Date,
      isCanceled: boolean,
    },
  }[];
  userProfile: {
    name: string | null;
    email: string | null;
  };
}

const CourseStepContent: React.FC<Pick<CourseRegistrationFormProps, 'courses' | 'userCourses'> & { done: boolean }> = ({ courses, userCourses, done }) => {
  const { watch } = useFormContext();
  const watchStep = watch('step') as number;
  return watchStep === 0 && !done ? (
    <CourseRegistrationFormStep1 courses={courses} userCourses={userCourses} />
  ) : watchStep === 1 && !done ? (
    <CourseRegistrationFormStep2 courses={courses} />
  ) : done ? (
    <CourseRegistrationFormStepConfirmed />
  ) : null;
}

const CourseRegistrationForm: React.FC<CourseRegistrationFormProps> = ({ courses, userCourses, userProfile }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { mutate: submitRegister, isLoading: isSubmitRegisterLoading, isSuccess: isSubmitRegisterSuccess } = trpc.useMutation('self.register', {
    onError: () => {
      enqueueSnackbar(`Une erreur est survenue au moment de soumettre vos inscriptions`, { variant: 'error' });
    },
  });
  return (
    <FormContainer
      onSuccess={data => submitRegister(data as any)}
      resolver={zodResolver(frontsiteCourseRegistrationSchema)}
      defaultValues={{ step: 0, courseIds: [], name: userProfile.name ?? '', email: userProfile.email ?? '', consent: false, notify: true }}
    >
      <CourseRegistrationFormStepper done={isSubmitRegisterSuccess} />
      <CourseStepContent courses={courses} userCourses={userCourses} done={isSubmitRegisterSuccess} />
      <CourseRegistrationFormNavigation isLoading={isSubmitRegisterLoading} done={isSubmitRegisterSuccess} />
    </FormContainer>
  );
};

interface CourseRegistrationFormWidgetProps {}

export const CourseRegistrationFormWidget: React.FC<CourseRegistrationFormWidgetProps> = () => {
  const { status } = useSession();
  const isAuthenticated = useMemo(() => status === 'authenticated', [status]);
  const { data: coursesData, isError: isCoursesError } = trpc.useQuery(['public.findAllFutureCourses'], {
    enabled: isAuthenticated,
  });
  const { data: userCoursesData, isError: isUserCoursesError } = trpc.useQuery(['self.findAllRegisteredCourses', { userCanceled: false, future: true }], {
    enabled: isAuthenticated,
  });
  const { data: userProfileData, isError: isUserProfileError } = trpc.useQuery(['self.profile'], {
    enabled: isAuthenticated,
  });

  return (
    <Card variant="outlined">
      <CardContent>
        {status === 'unauthenticated' ? (
          <Box textAlign="center" sx={{ py: 2 }}>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Face3TwoTone color="disabled" fontSize="large" />
              <FaceTwoTone color="disabled" fontSize="large" />
              <Face2TwoTone color="disabled" fontSize="large" />
            </Stack>
            <Link href="/connexion" passHref>
              <Button variant="outlined" startIcon={<Login />} sx={{ my: 2 }}>
                Créer un compte ou me connecter
              </Button>
            </Link>
            <Box sx={{ color: 'text.disabled' }}>
              (vous devez être connecté pour vous inscrire à des séances)
            </Box>
          </Box>
        ) : isCoursesError || isUserCoursesError || isUserProfileError ? (
          <Box textAlign="center">
            <Alert severity="error">Une erreur est survenue, impossible de charger les données pour le moment.</Alert>
          </Box>
        ) : status === 'loading' || !coursesData || !userCoursesData || !userProfileData ? (
          <Box textAlign="center">
            <CircularProgress sx={{ my: 3 }} />
          </Box>
        ) : (
          <CourseRegistrationForm courses={coursesData} userCourses={userCoursesData as any} userProfile={userProfileData} />
        )}
      </CardContent>
    </Card>
  );
}
