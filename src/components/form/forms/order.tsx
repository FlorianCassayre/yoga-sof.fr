import React, { useState } from 'react';
import {
  AutocompleteElement,
  DatePickerElement,
  DeepPartial,
  TextFieldElement, useFieldArray,
  useFormContext
} from 'react-hook-form-mui';
import { z } from 'zod';
import {
  Box,
  Button,
  Dialog, DialogActions,
  DialogContent, DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import { InputPrice } from '../fields';
import { AddBox, Delete, Event, ShoppingCart } from '@mui/icons-material';
import { CreateFormContent } from '../form';
import { trpc } from '../../../common/trpc';
import { SelectUser } from '../fields/SelectUser';
import { transactionCreateSchema } from '../../../common/schemas/transaction';
import { SelectCourse } from '../fields/SelectCourse';
import { SelectCourseRegistration } from '../fields/SelectCourseRegistration';
import { Course, CourseRegistration, Transaction, User } from '@prisma/client';
import { displayCourseName, displayTransactionWithUserName } from '../../../common/display';
import { SelectTransaction } from '../fields/SelectTransaction';
import { SelectMembershipModel } from '../fields/SelectMembershipModel';
import { SelectCouponModel } from '../fields/SelectCouponModel';
import { grey } from '@mui/material/colors';
import { SelectTransactionType } from '../fields/SelectTransactionType';

interface BinaryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  labelA: string;
  labelB: string;
  onChooseA: () => void;
  onChooseB: () => void;
}

export const BinaryDialog: React.FC<BinaryDialogProps> = ({ open, setOpen, title, children, labelA, labelB, onChooseA, onChooseB }) => {
  const handleClose = () => {
    setOpen(false);
  };
  const handleChooseA = () => {
    onChooseA();
    handleClose();
  };
  const handleChooseB = () => {
    onChooseB();
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {children}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose} sx={{ color: grey[600] }}>Annuler</Button>
        <Button onClick={handleChooseA}>
          {labelA}
        </Button>
        <Button onClick={handleChooseB}>
          {labelB}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface SelectDependentCourseRegistrationProps {
  name: string;
  fromName: string;
  label: string;
  multiple?: boolean;
}

export const SelectDependentCourseRegistration: React.FC<SelectDependentCourseRegistrationProps> = ({ name, fromName, label, multiple }) => {
  const { watch } = useFormContext();
  // TODO useEffect
  const watchFrom = watch(fromName);

  return (
    <AutocompleteElement
      name={name}
      options={watchFrom ? watchFrom : []}
      multiple={multiple}
      label={label}
      autocompleteProps={{
        getOptionLabel: (option: (CourseRegistration & { course: Course }) | undefined) => option ? displayCourseName(option.course) : '...',
        renderOption: (props, option: (CourseRegistration & { course: Course }) | undefined) => option ? (
          <li {...props} key={option.id}>
            {displayCourseName(option.course)}
          </li>
        ) : '...',
      }}
    />
  );
};


interface CreateButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

const CreateButton: React.FC<CreateButtonProps> = ({ label, disabled, onClick }) => {
  return (
    <Box sx={{ p: 0, border: '1px dashed lightgrey', borderRadius: 1 }}>
      <Button disabled={disabled} onClick={() => onClick()} startIcon={<AddBox />} sx={{ width: '100%' }}>{label}</Button>
    </Box>
  );
};

interface OptionalFieldProps {
  children: React.ReactNode;
  onDelete: () => void;
}

const OptionalField: React.FC<OptionalFieldProps> = ({ children, onDelete }) => {

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Box>
        <Tooltip title="Supprimer">
          <IconButton>
            <Delete onClick={() => onDelete()} />
          </IconButton>
        </Tooltip>
      </Box>
    </Stack>
  );
};

const OrderFormFields: React.FC = () => {
  const { watch, setValue, control } = useFormContext();

  const watchUser = watch('user');

  const watchCourseRegistrations = watch('courseRegistrations');
  const watchNewCoupons = watch('newCoupons');
  const watchMemberships = watch('memberships');

  const watchTrialCourseRegistration = watch('trialCourseRegistration');
  const watchReplacementCourseRegistrations = watch('replacementCourseRegistrations');
  const watchTransaction = watch('transaction');
  const watchPayment = watch('payment');

  //

  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [membershipDialogOpen, setMembershipDialogOpen] = useState(false);
  const [couponUseDialogOpen, setCouponUseDialogOpen] = useState(false);

  const { fields: newCouponFields, append: addNewCoupon, remove: removeNewCoupon } = useFieldArray({ control, name: 'newCoupons' });
  const { fields: newMembershipFields, append: addNewMembership, remove: removeNewMembership } = useFieldArray({ control, name: 'newMemberships' });

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6" component="div">
          1. Utilisateur
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <SelectUser name="user" noMatchId />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" component="div">
          2. Achats
        </Typography>
      </Grid>
      {watchCourseRegistrations !== undefined && watchUser != null && (
        <Grid item xs={12}>
          <OptionalField onDelete={() => setValue('courseRegistrations', undefined)}>
            <SelectCourseRegistration name="courseRegistrations" userId={watchUser.id} multiple noMatchId />
          </OptionalField>
        </Grid>
      )}
      {newCouponFields.map((field, index) => (
        <Grid item xs={12} key={field.id}>
          <OptionalField onDelete={() => removeNewCoupon(index)}>
            <SelectCouponModel name={`newCoupons.${index}.couponModelId`} label="Nouvelle carte" />
          </OptionalField>
        </Grid>
      ))}
      {newMembershipFields.map((field, index) => (
        <Grid item xs={12} key={field.id}>
          <OptionalField onDelete={() => removeNewMembership(index)}>
            <SelectMembershipModel name={`newMemberships.${index}.membershipModelId`} label="Nouvelle cotisation" />
          </OptionalField>
        </Grid>
      ))}
      {watchCourseRegistrations === undefined && (
        <Grid item xs={12}>
          <CreateButton label="Ajouter des séances" disabled={watchUser === undefined} onClick={() => setValue('courseRegistrations', [])} />
        </Grid>
      )}
      <Grid item xs={12}>
        <CreateButton label="Ajouter une carte" disabled={watchUser === undefined} onClick={() => setCouponDialogOpen(true)} />
      </Grid>
      <Grid item xs={12}>
        <CreateButton label="Ajouter une cotisation" disabled={watchUser === undefined} onClick={() => setMembershipDialogOpen(true)} />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" component="div">
          3. Réductions
        </Typography>
      </Grid>
      {watchCourseRegistrations !== undefined && watchTrialCourseRegistration !== undefined && (
        <Grid item xs={12}>
          <OptionalField onDelete={() => setValue('trialCourseRegistration', undefined)}>
            <SelectDependentCourseRegistration name="trialCourseRegistration" fromName="courseRegistrations" label="Séance d'essai" />
          </OptionalField>
        </Grid>
      )}
      {watchCourseRegistrations !== undefined && watchReplacementCourseRegistrations !== undefined && watchUser != null && (
        <Grid item xs={12}>
          <OptionalField onDelete={() => setValue('replacementCourseRegistrations', undefined)}>
            <SelectCourseRegistration name="replacementCourseRegistrations" userId={watchUser.id} noMatchId multiple label="Séances à rattraper" />
          </OptionalField>
        </Grid>
      )}
      <Grid item xs={12}>
        <CreateButton label="Ajouter une carte" disabled={watchUser === undefined} onClick={() => setCouponUseDialogOpen(true)} />
      </Grid>
      {watchTrialCourseRegistration === undefined && (
        <Grid item xs={12}>
          <CreateButton label="Ajouter une séance d'essai" disabled={watchCourseRegistrations === undefined || watchCourseRegistrations.length === 0} onClick={() => setValue('trialCourseRegistration', null)} />
        </Grid>
      )}
      {watchReplacementCourseRegistrations === undefined && (
        <Grid item xs={12}>
          <CreateButton label="Ajouter des séances à rattraper" disabled={watchCourseRegistrations === undefined || watchCourseRegistrations.length === 0} onClick={() => setValue('replacementCourseRegistrations', [])} />
        </Grid>
      )}

      <Grid item xs={12}>
        <Typography variant="h6" component="div">
          4. Paiement
        </Typography>
      </Grid>
      {watchUser != null && (
        watchTransaction !== undefined ? (
          <Grid item xs={12}>
            <OptionalField onDelete={() => setValue('transaction', undefined)}>
              <SelectTransaction name="transaction" userId={watchUser.id} />
            </OptionalField>
          </Grid>
        ) : watchPayment !== undefined ? (
          <Grid item xs={12}>
            <OptionalField onDelete={() => setValue('payment', undefined)}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InputPrice name="amount" label="Montant en euros" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectTransactionType name="type" />
                </Grid>
                <Grid item xs={12}>
                  <DatePickerElement name="date" label="Date" inputProps={{ fullWidth: true }} />
                </Grid>
              </Grid>
            </OptionalField>
          </Grid>
        ) : null)}
      {watchTransaction === undefined && watchPayment === undefined && (
        <>
          <Grid item xs={12}>
            <CreateButton label="Lier à un ancien paiement" onClick={() => setValue('transaction', null)} />
          </Grid>
          <Grid item xs={12}>
            <CreateButton label="Créer un nouveau paiement" onClick={() => setValue('payment', {})} />
          </Grid>
        </>
      )}
      <Grid item xs={12}>
        <Typography variant="h6" component="div">
          5. Récapitulatif
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextFieldElement name="notes" label="Notes" fullWidth />
      </Grid>

      <BinaryDialog
        title="Ajout d'une carte" labelA="Lier une carte" labelB="Nouvelle carte"
        open={couponDialogOpen} setOpen={setCouponDialogOpen} onChooseA={() => {}} onChooseB={() => addNewCoupon({})}>
        Souhaitez lier une carte existante, ou bien en créer une nouvelle ?
      </BinaryDialog>
      <BinaryDialog
        title="Ajout d'une cotisation" labelA="Lier une cotisation" labelB="Nouvelle cotisation"
        open={membershipDialogOpen} setOpen={setMembershipDialogOpen} onChooseA={() => {}} onChooseB={() => addNewMembership({})}
      >
        Souhaitez lier une cotisation existante, ou bien en créer une nouvelle ?
      </BinaryDialog>
      <BinaryDialog
        title="Ajout d'une carte" labelA="Lier une carte existante" labelB="Lier une nouvelle carte"
        open={couponUseDialogOpen} setOpen={setCouponUseDialogOpen} onChooseA={() => {}} onChooseB={() => {}}>
        Souhaitez lier une carte existante, ou bien lier une nouvelle carte ?
      </BinaryDialog>
    </Grid>
  );
}

const orderFormDefaultValues: DeepPartial<z.infer<typeof transactionCreateSchema>> = {};

const useProceduresToInvalidate = () => {
  //const { order } = trpc.useContext();
  //return [order.find, order.findAll]; // TODO
  return [];
};

const commonFormProps = () => ({
  icon: <ShoppingCart />,
  defaultValues: orderFormDefaultValues as any, // TODO
  urlSuccessFor: (data: any) => `/administration/paiements`, // TODO
  urlCancel: `/administration/paiements`,
});

export const OrderCreateForm = () => {
  return (
    <CreateFormContent
      {...commonFormProps()}
      title="Création d'une commande"
      schema={transactionCreateSchema} // TODO
      mutationProcedure={trpc.transaction.create as any} // TODO
      successMessage={(data) => `La commande a été enregistrée.`}
      invalidate={useProceduresToInvalidate()}
    >
      <OrderFormFields />
    </CreateFormContent>
  );
};
