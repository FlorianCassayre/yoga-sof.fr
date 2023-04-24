import React from 'react';
import { DeepPartial, TextFieldElement, useFormContext } from 'react-hook-form-mui';
import { z } from 'zod';
import {
} from '../../../common/schemas';
import { Alert, CircularProgress, Grid, IconButton, TextField, Tooltip } from '@mui/material';
import { Merge, People, Person, SwapHoriz, Visibility } from '@mui/icons-material';
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
import { UserInformationTableCard } from '../../UserInformationTableCard';
import Link from 'next/link';

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

const UserMergePreview = ({ userId }: { userId: number }) => {
  const { data, isLoading } = trpc.user.find.useQuery({ id: userId });

  return data ? (
    <Grid container spacing={2} key={userId}>
      <Grid item xs={12}>
        <UserInformationTableCard user={data as any} />
      </Grid>
    </Grid>
  ) : isLoading ? (
    <CircularProgress />
  ) : <></>;
};

const UserMergeFields = ({ title, path }: { title: string, path: string }) => {
  const { watch } = useFormContext();

  const values = watch();
  const userId = values[path];

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <SelectUser name={path} label={title} />
      </Grid>
      {userId != undefined && (
        <Grid item xs={12}>
          <UserMergePreview userId={userId} />
        </Grid>
      )}
      {userId != undefined && (
        <Grid item xs={12} textAlign="center">
          <Link href={{ pathname: '/administration/utilisateurs/[id]', query: { id: userId } }} passHref legacyBehavior>
            <Tooltip title="Voir l'utilisateur">
              <IconButton>
                <Visibility />
              </IconButton>
            </Tooltip>
          </Link>
        </Grid>
      )}
    </Grid>
  );
};

const UsersMergeFields = () => {
  const form = useFormContext();
  const handleSwap = () => {
    const values = form.getValues();
    form.setValue('mainUserId', values['secondaryUserId']);
    form.setValue('secondaryUserId', values['mainUserId']);
  };
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Alert severity="info">
          Sélectionnez les deux utilisateurs à fusionner.
          L'utilisateur de droite sera supprimé, et les données liées à ce compte seront rattachées à l'utilisateur de gauche.
          Il subsiste toutefois une exception : si les deux utilisateurs ont chacun une adresse e-mail vérifiée, alors l'utilisateur de droite sera conservé mais désactivé.
        </Alert>
      </Grid>
      {[{ path: 'mainUserId', title: `Utilisateur principal` }, { path: 'secondaryUserId', title: `Utilisateur à fusionner` }].map(({ path, title }) => (
        <Grid key={path} item xs={12} md={6}>
          <UserMergeFields path={path} title={title}/>
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
      defaultValues={{ mainUserId: undefined, secondaryUserId: undefined }}
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
