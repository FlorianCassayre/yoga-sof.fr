import React from 'react';
import { DeepPartial, SwitchElement } from 'react-hook-form-mui';
import { z } from 'zod';
import {
  couponModelCreateSchema,
  couponModelGetTransformSchema,
  couponModelUpdateSchema
} from '../../../common/schemas/couponModel';
import { Grid } from '@mui/material';
import { InputPrice, SelectCourseType } from '../fields';
import { Event } from '@mui/icons-material';
import { CreateFormContent, UpdateFormContent } from '../form';
import { CouponModel } from '@prisma/client';
import { ParsedUrlQuery } from 'querystring';
import { trpc } from '../../../common/trpc';
import { InputCourseQuantitySlots } from '../fields/InputCourseNumber';

const CouponModelFormFields = () => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <SelectCourseType name="courseType" />
    </Grid>
    <Grid item xs={12}>
      <InputCourseQuantitySlots name="quantity" />
    </Grid>
    <Grid item xs={12}>
      <InputPrice name="price" label="Prix de la carte en euros" />
    </Grid>
  </Grid>
);

const couponModelFormDefaultValues: DeepPartial<z.infer<typeof couponModelCreateSchema>> = {};

const useProceduresToInvalidate = () => {
  const { couponModel } = trpc.useContext();
  return [couponModel.find, couponModel.findAll];
};

const commonFormProps = {
  icon: <Event />,
  defaultValues: couponModelFormDefaultValues,
  urlSuccessFor: (data: CouponModel) => `/administration/cartes`,
  urlCancel: `/administration/cartes`,
};

export const CouponModelCreateForm = () => {
  return (
    <CreateFormContent
      {...commonFormProps}
      title="Création d'un type de carte"
      schema={couponModelCreateSchema}
      mutationProcedure={trpc.couponModel.create}
      successMessage={(data) => `Le modèle a été créé.`}
      invalidate={useProceduresToInvalidate()}
    >
      <CouponModelFormFields />
    </CreateFormContent>
  );
};

export const CouponModelUpdateForm = ({ queryData }: { queryData: ParsedUrlQuery }) => {
  return (
    <UpdateFormContent
      {...commonFormProps}
      title="Modification d'un type de carte"
      schema={couponModelUpdateSchema}
      mutationProcedure={trpc.couponModel.update}
      queryProcedure={trpc.couponModel.find}
      querySchema={couponModelGetTransformSchema}
      queryParams={queryData}
      successMessage={(data) => `Le modèle a été mis à jour.`}
      invalidate={useProceduresToInvalidate()}
    >
      <CouponModelFormFields />
    </UpdateFormContent>
  );
};
