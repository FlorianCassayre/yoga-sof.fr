import React, { useMemo } from 'react';
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
  Stepper, Typography
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  ArrowRight,
  Check,
  Face2TwoTone,
  Face3TwoTone,
  FaceTwoTone,
  Login
} from '@mui/icons-material';
import Link from 'next/link';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import { trpc } from '../lib/common/trpc';
import { CourseType } from '@prisma/client';
import { GridColumns } from '@mui/x-data-grid/models/colDef/gridColDef';
import { CourseTypeNames } from '../lib/common/newCourse';
import { GridRenderCellParams, GridValueFormatterParams } from '@mui/x-data-grid/models/params/gridCellParams';
import { formatDateDDsmmYYYY, formatTimeHHhMM, formatWeekday } from '../lib/common/newDate';
import { CheckboxElement, FormContainer, TextFieldElement, useFormContext } from 'react-hook-form-mui';
import { zodResolver } from '@hookform/resolvers/zod';
import { frontsiteCourseRegistrationSchema } from '../lib/common/newSchemas/frontsiteCourseRegistration';

const CourseSelectionGrid: React.FC<Pick<CourseRegistrationFormProps, 'courses' | 'userCourses'>> = ({ courses, userCourses }) => {
  const { watch, setValue } = useFormContext();
  const watchCourseIds = watch('courseIds') as number[];

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
      selectionModel={watchCourseIds}
      onSelectionModelChange={selected => setValue('courseIds', selected)}
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

interface CourseRegistrationFormStep2Props {}

const CourseRegistrationFormStep2: React.FC<CourseRegistrationFormStep2Props> = () => {

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" component="div" sx={{ mb: 2 }}>
            Récapitulatif de vos inscriptions
          </Typography>
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
          <Box>
            A compléter ou corriger. Votre adresse e-mail nous permet notamment de vous informer en cas d'annulation de séance.
          </Box>
        </Grid>
      </Grid>
      <CheckboxElement
        name="notify"
        label="Recevoir une confirmation par e-mail"
      />
      <CheckboxElement
        name="consent"
        label="J'ai pris connaissance du règlement intérieur, en outre je m'engage à me désinscrire dans les meilleurs délais si je ne peux plus assister à une ou plusieurs séances"
      />
    </>
  );
};

interface CourseRegistrationFormStepConfirmedProps {}

const CourseRegistrationFormStepConfirmed: React.FC<CourseRegistrationFormStep2Props> = () => {

  return (
    null
  );
};

const CourseRegistrationFormStepper: React.FC = () => {
  const stepNames = [`Sélection des séances`, `Confirmation`];
  const { watch } = useFormContext();
  const watchStep = watch('step') as number;

  return (
    <Stepper activeStep={1} sx={{ mb: 4 }}>
      {stepNames.map((stepName, i) => (
        <Step key={i} active={watchStep === i} completed={watchStep > i}>
          <StepLabel>{stepName}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

const CourseRegistrationFormNavigation: React.FC = () => {
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

  return (
    <Stack direction="row" sx={{ mt: 2, justifyContent: 'space-between' }}>
        <Button color="inherit" startIcon={<ArrowBack />} onClick={handlePrevious} sx={{ visibility: watchStep <= 0 || watchStep >= 2 ? 'hidden' : undefined }}>
          Étape précédente
        </Button>
        <Button variant="contained" type={watchStep === 1 ? 'submit' : undefined} startIcon={watchStep !== 1 ? <ArrowForward /> : <Check />} disabled={watchCourseIds.length === 0} onClick={handleNext} sx={{ visibility: watchStep >= 2 ? 'hidden' : undefined }}>
          {watchStep !== 1 ? `Étape suivante` : `Valider ces inscriptions`}
        </Button>
    </Stack>
  );
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
}

const CourseStepContent: React.FC<Pick<CourseRegistrationFormProps, 'courses' | 'userCourses'>> = ({ courses, userCourses }) => {
  const { watch } = useFormContext();
  const watchStep = watch('step') as number;
  return watchStep === 0 ? (
    <CourseRegistrationFormStep1 courses={courses} userCourses={userCourses} />
  ) : watchStep === 1 ? (
    <CourseRegistrationFormStep2 />
  ) : watchStep === 2 ? (
    <CourseRegistrationFormStepConfirmed />
  ) : null;
}

const CourseRegistrationForm: React.FC<CourseRegistrationFormProps> = ({ courses, userCourses }) => {
  return (
    <FormContainer
      onSuccess={() => {}}
      resolver={zodResolver(frontsiteCourseRegistrationSchema)}
      defaultValues={{ step: 0, courseIds: [], name: '', email: null, consent: false, notify: true }}
    >
      <CourseRegistrationFormStepper />
      <CourseStepContent courses={courses} userCourses={userCourses} />
      <CourseRegistrationFormNavigation />
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
        ) : isCoursesError || isUserCoursesError ? (
          <Box textAlign="center">
            <Alert severity="error">Une erreur est survenue, impossible de charger les données pour le moment.</Alert>
          </Box>
        ) : status === 'loading' || !coursesData || !userCoursesData ? (
          <Box textAlign="center">
            <CircularProgress sx={{ my: 3 }} />
          </Box>
        ) : (
          <CourseRegistrationForm courses={coursesData} userCourses={userCoursesData as any} />
        )}
      </CardContent>
    </Card>
  );
}
