import React from 'react';
import { DeepPartial, TextFieldElement } from 'react-hook-form-mui';
import { z } from 'zod';
import {
} from '../../../common/schemas';
import { Grid } from '@mui/material';
import { Person } from '@mui/icons-material';
import { CreateFormContent, UpdateFormContent } from '../form';
import { ParsedUrlQuery } from 'querystring';
import { User } from '@prisma/client';
import { userCreateSchema, userFindTransformSchema, userUpdateSchema } from '../../../common/schemas/user';
import { displayUserName } from '../../../common/display';
import { trpc } from '../../../common/trpc';

const UserFormFields = () => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <TextFieldElement name="name" label="Nom de l'utilisateur" fullWidth InputLabelProps={{ required: true }} />
    </Grid>
    <Grid item xs={12}>
      <TextFieldElement name="email" label="Adresse email de l'utilisateur" fullWidth />
    </Grid>
  </Grid>
);

const userFormDefaultValues: DeepPartial<z.infer<typeof userCreateSchema>> = {
  name: '',
  email: null,
};

const useProceduresToInvalidate = () => {
  const { userFind, userFindAll, userFindUpdate, courseRegistrationFindAll, courseRegistrationFindAllEvents, courseRegistrationFindAllActive } = trpc.useContext();
  return [userFind, userFindAll, userFindUpdate, courseRegistrationFindAll, courseRegistrationFindAllEvents, courseRegistrationFindAllActive];
};

const commonFormProps = {
  icon: <Person />,
  defaultValues: userFormDefaultValues,
  urlSuccessFor: (data: User) => `/administration/utilisateurs/${data.id}`,
  urlCancel: `/administration/utilisateurs`,
};

export const UserCreateForm = () => {
  return (
    <CreateFormContent
      {...commonFormProps}
      title="Création d'un compte utilisateur"
      schema={userCreateSchema}
      mutationProcedure={trpc.userCreate}
      successMessage={(data) => `L'utilisateur ${displayUserName(data)} a été créé.`}
      invalidate={useProceduresToInvalidate()}
    >
      <UserFormFields />
    </CreateFormContent>
  );
};

export const UserUpdateForm = ({ queryParams }: { queryParams: ParsedUrlQuery }) => {
  return (
    <UpdateFormContent
      {...commonFormProps}
      title="Modification d'un compte utilisateur"
      schema={userUpdateSchema}
      mutationProcedure={trpc.userUpdate}
      queryProcedure={trpc.userFindUpdate}
      querySchema={userFindTransformSchema}
      queryParams={queryParams}
      successMessage={(data) => `L'utilisateur ${displayUserName(data)} a été mis à jour.`}
      invalidate={useProceduresToInvalidate()}
    >
      <UserFormFields />
    </UpdateFormContent>
  );
};
