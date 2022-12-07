import React from 'react';
import { DeepPartial, TextFieldElement } from 'react-hook-form-mui';
import { z } from 'zod';
import {
} from '../../../common/schemas';
import { Grid } from '@mui/material';
import { Person } from '@mui/icons-material';
import { CreateFormContent, UpdateFormContent } from '../form';
import { ParsedUrlQuery } from 'querystring';
import { QueryKey } from '../../../server/controllers';
import { User } from '@prisma/client';
import { userCreateSchema, userFindTransformSchema, userUpdateSchema } from '../../../common/schemas/user';
import { displayUserName } from '../../../common/display';

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

const commonFormProps = {
  icon: <Person />,
  defaultValues: userFormDefaultValues,
  urlSuccessFor: (data: User) => `/administration/utilisateurs/${data.id}`,
  urlCancel: `/administration/utilisateurs`,
  invalidate: ['user.find', 'user.findAll', 'user.findUpdate', 'courseRegistration.findAll', 'courseRegistration.findAllEvents', 'courseRegistration.findAllActive'] as QueryKey[],
};

export const UserCreateForm = () => {
  return (
    <CreateFormContent
      {...commonFormProps}
      title="Création d'un compte utilisateur"
      schema={userCreateSchema}
      mutation="user.create"
      successMessage={(data) => `L'utilisateur ${displayUserName(data)} a été créé.`}
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
      mutation="user.update"
      query="user.findUpdate"
      querySchema={userFindTransformSchema}
      queryParams={queryParams}
      successMessage={(data) => `L'utilisateur ${displayUserName(data)} a été mis à jour.`}
    >
      <UserFormFields />
    </UpdateFormContent>
  );
};
