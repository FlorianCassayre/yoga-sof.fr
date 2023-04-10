import React from 'react';
import { DeepPartial, TextFieldElement, useFormContext } from 'react-hook-form-mui';
import { z } from 'zod';
import {
} from '../../../common/schemas';
import { Grid, IconButton, Tooltip, Typography } from '@mui/material';
import { Merge, People, Person, SwapHoriz } from '@mui/icons-material';
import { CreateFormContent, UpdateFormContent } from '../form';
import { ParsedUrlQuery } from 'querystring';
import { User } from '@prisma/client';
import {
  userCreateSchema,
  userFindTransformSchema,
  usersMergeSchema,
  userUpdateSchema,
} from '../../../common/schemas/user';
import { displayUserName } from '../../../common/display';
import { trpc } from '../../../common/trpc';
import { SelectUser } from '../fields/SelectUser';

const UserFormFields = () => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <TextFieldElement name="name" label="Nom de l'utilisateur" fullWidth InputLabelProps={{ required: true }} />
    </Grid>
    <Grid item xs={12}>
      <TextFieldElement name="email" label="Adresse email de l'utilisateur" fullWidth />
    </Grid>
    <Grid item xs={12}>
      <SelectUser name="managedByUserId" label="Compte tuteur" />
    </Grid>
  </Grid>
);

const userFormDefaultValues: DeepPartial<z.infer<typeof userCreateSchema>> = {
  name: '',
  email: null,
  managedByUserId: null,
};

const useProceduresToInvalidate = () => {
  const { user, courseRegistration } = trpc.useContext();
  return [user.find, user.findAll, user.findUpdate, courseRegistration.findAll, courseRegistration.findAllEvents, courseRegistration.findAllActive];
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
      mutationProcedure={trpc.user.create}
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
      mutationProcedure={trpc.user.update}
      queryProcedure={trpc.user.findUpdate}
      querySchema={userFindTransformSchema}
      queryParams={queryParams}
      successMessage={(data) => `L'utilisateur ${displayUserName(data)} a été mis à jour.`}
      invalidate={useProceduresToInvalidate()}
    >
      <UserFormFields />
    </UpdateFormContent>
  );
};

const UserMergeFields = ({ title, path }: { title: string, path: string }) => {
  const { watch } = useFormContext();
  const userId = watch(`${path}.userId`);
  const result = trpc.useQueries(t => userId !== undefined ? [t.user.find] : []);
  const r = result.length > 0 ? result[0] : null;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <SelectUser name={`${path}.userId`} label={title} />
      </Grid>
      <Grid item xs={12} />
      {/*<Grid item xs={12} md={6}>
        <TextFieldElement name={`${path}.user.name`} label="Nom" fullWidth InputProps={{ readOnly: true }} />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextFieldElement name={`${path}.user.custom`} label="Nom d'affichage" fullWidth InputProps={{ readOnly: true }} />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextFieldElement name={`${path}.user.email`} label="E-mail" fullWidth InputProps={{ readOnly: true }}/>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextFieldElement name={`${path}.user.customEmail`} label="E-mail d'affichage" fullWidth InputProps={{ readOnly: true }}/>
      </Grid>*/}
    </Grid>
  );
};

const UsersMergeFields = () => {
  const form = useFormContext();
  const handleSwap = () => {
    const values = form.getValues();
    console.log(values);
    if (values.users) {
      form.setValue('users', [values.users[1], values.users[0]]);
    }
  };
  return (
    <Grid container spacing={2}>
      {[`Utilisateur principal`, `Utilisateur à fusionner`].map((title, index) => (
        <Grid key={index} item xs={12} md={6}>
          <UserMergeFields path={`users.${index}`} title={title}/>
        </Grid>
      ))}
      <Grid item xs={12} sx={{ textAlign: 'center' }}>
        <Tooltip title="Échanger">
          <IconButton onClick={handleSwap}>
            <SwapHoriz/>
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  );
};

export const UsersMergeForm = () => {
  return (
    <CreateFormContent
      title="Fusion de comptes utilisateurs"
      schema={usersMergeSchema}
      mutationProcedure={trpc.user.merge}
      successMessage={(data) => `Les utilisateurs ont été fusionnés.`}
      invalidate={useProceduresToInvalidate()}
      icon={<People />}
      defaultValues={{}}
      urlSuccessFor={(data: User) => `/administration/utilisateurs/${data.id}`}
      urlCancel={`/administration/utilisateurs`}
      buttonLabel="Fusionner"
      buttonIcon={<Merge/>}
      buttonColor={undefined}
    >
      <UsersMergeFields />
    </CreateFormContent>
  );
};
