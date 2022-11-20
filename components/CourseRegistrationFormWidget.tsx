import React from 'react';
import { useSession } from 'next-auth/react';
import { Box, Button, Card, CardContent, CircularProgress, Stack } from '@mui/material';
import { Face2TwoTone, Face3TwoTone, Face4TwoTone, FaceTwoTone, Login } from '@mui/icons-material';
import Link from 'next/link';

interface CourseRegistrationFormStep1Props {}

const CourseRegistrationFormStep1: React.FC<CourseRegistrationFormStep2Props> = () => {

  return (
    <Box>
      <Box>
        Sélectionnez les séances pour lesquelles vous souhaitez vous inscrire :
      </Box>
    </Box>
  );
};

interface CourseRegistrationFormStep2Props {}

const CourseRegistrationFormStep2: React.FC<CourseRegistrationFormStep2Props> = () => {

  return (
    null
  );
};

interface CourseRegistrationFormProps {}

const CourseRegistrationForm: React.FC<CourseRegistrationFormProps> = () => {

  return (
    null
  );
};

interface CourseRegistrationFormWidgetProps {}

export const CourseRegistrationFormWidget: React.FC<CourseRegistrationFormWidgetProps> = () => {
  const { status } = useSession();

  return (
    <Card variant="outlined">
      <CardContent>
        {status === 'loading' ? (
          <Box textAlign="center">
            <CircularProgress sx={{ my: 3 }} />
          </Box>
        ) : status === 'unauthenticated' ? (
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
        ) : (
          <CourseRegistrationForm />
        )}
      </CardContent>
    </Card>
  );
}
