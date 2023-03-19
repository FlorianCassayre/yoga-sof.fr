import React, { useMemo, useState } from 'react';
import {
  AutocompleteElement, CheckboxElement,
  DatePickerElement,
  DeepPartial, SwitchElement,
  TextFieldElement, useFieldArray,
  useFormContext
} from 'react-hook-form-mui';
import { z } from 'zod';
import {
  Alert,
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
import { orderCreateSchema } from '../../../common/schemas/order';
import { useRouter } from 'next/router';
import { BackofficeContentLoading } from '../../layout/admin/BackofficeContentLoading';

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
  const { watch, setValue, control, getValues, formState } = useFormContext();

  const watchUser = watch('user');

  const watchCourseRegistrations = watch('purchases.courseRegistrations');
  const watchNewCoupons = watch('purchases.newCoupons');
  const watchMemberships = watch('purchases.newMemberships');

  const watchTrialCourseRegistration = watch('billing.trialCourseRegistration');
  const watchReplacementCourseRegistrations = watch('billing.replacementCourseRegistrations');
  const watchTransactionId = watch('billing.transactionId');
  const watchPayment = watch('newPayment');

  //

  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [membershipDialogOpen, setMembershipDialogOpen] = useState(false);
  const [couponUseDialogOpen, setCouponUseDialogOpen] = useState(false);

  const { fields: newCouponFields, append: addNewCoupon, remove: removeNewCoupon } = useFieldArray({ control, name: 'purchases.newCoupons' });
  const { fields: newMembershipFields, append: addNewMembership, remove: removeNewMembership } = useFieldArray({ control, name: 'purchases.newMemberships' });

  return (
    <Grid container spacing={2}>
      <span>{JSON.stringify(formState.errors)}</span>
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
          <OptionalField onDelete={() => setValue('purchases.courseRegistrations', undefined)}>
            <SelectCourseRegistration name="purchases.courseRegistrations" userId={watchUser.id} multiple noMatchId />
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
            <SelectMembershipModel name={`purchases.newMemberships.${index}.membershipModelId`} label="Nouvelle cotisation" />
          </OptionalField>
        </Grid>
      ))}
      {watchCourseRegistrations === undefined && (
        <Grid item xs={12}>
          <CreateButton label="Ajouter des séances" disabled={watchUser === undefined} onClick={() => setValue('purchases.courseRegistrations', [])} />
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
          <OptionalField onDelete={() => setValue('billing.trialCourseRegistration', undefined)}>
            <SelectDependentCourseRegistration name="billing.trialCourseRegistration" fromName="purchases.courseRegistrations" label="Séance d'essai" />
          </OptionalField>
        </Grid>
      )}
      {watchCourseRegistrations !== undefined && watchReplacementCourseRegistrations !== undefined && watchUser != null && (
        <Grid item xs={12}>
          <OptionalField onDelete={() => setValue('billing.replacementCourseRegistrations', undefined)}>
            <SelectCourseRegistration name="billing.replacementCourseRegistrations" userId={watchUser.id} noMatchId multiple label="Séances à rattraper" />
          </OptionalField>
        </Grid>
      )}
      <Grid item xs={12}>
        <CreateButton label="Ajouter une carte" disabled={watchUser === undefined} onClick={() => setCouponUseDialogOpen(true)} />
      </Grid>
      {watchTrialCourseRegistration === undefined && (
        <Grid item xs={12}>
          <CreateButton label="Ajouter une séance d'essai" disabled={watchCourseRegistrations === undefined || watchCourseRegistrations.length === 0} onClick={() => setValue('billing.trialCourseRegistration', null)} />
        </Grid>
      )}
      {watchReplacementCourseRegistrations === undefined && (
        <Grid item xs={12}>
          <CreateButton label="Ajouter des séances à rattraper" disabled={watchCourseRegistrations === undefined || watchCourseRegistrations.length === 0} onClick={() => setValue('billing.replacementCourseRegistrations', [])} />
        </Grid>
      )}

      <Grid item xs={12}>
        <Typography variant="h6" component="div">
          4. Paiement
        </Typography>
      </Grid>
      {watchUser != null && (
        watchTransactionId !== undefined ? (
          <>
            <Grid item xs={12}>
              <Alert severity="info">
                Lorsque la commande aura été créée l'ancien paiement disparaitra automatiquement de la liste.
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <OptionalField onDelete={() => setValue('billing.transactionId', undefined)}>
                <SelectTransaction name="billing.transactionId" userId={watchUser.id} />
              </OptionalField>
            </Grid>
          </>
        ) : watchPayment !== undefined ? (
          <Grid item xs={12}>
            <OptionalField onDelete={() => setValue('purchases.newPayment', undefined)}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InputPrice name="purchases.newPayment.amount" label="Montant en euros" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectTransactionType name="purchases.newPayment.type" />
                </Grid>
                <Grid item xs={12}>
                  <DatePickerElement name="purchases.newPayment.date" label="Date" inputProps={{ fullWidth: true }} />
                </Grid>
              </Grid>
            </OptionalField>
          </Grid>
        ) : null)}
      {watchTransactionId === undefined && watchPayment === undefined && (
        <>
          <Grid item xs={12}>
            <CreateButton label="Lier à un ancien paiement" onClick={() => setValue('billing.transactionId', null)} />
          </Grid>
          <Grid item xs={12}>
            <CreateButton label="Créer un nouveau paiement" onClick={() => setValue('purchases.newPayment', {})} />
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
      <Grid item xs={12}>
        <Alert severity="warning">
          Attention, le paiement ne correspond pas à ce qui est attendu.
          Si cela est volontaire, vous devez confirmer en cochant la case ci-dessous.
        </Alert>
      </Grid>
      <Grid item xs={12}>
        <CheckboxElement name="billing.force" label="Accepter le paiement malgré la disparité" />
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

const orderFormDefaultValues: DeepPartial<z.infer<typeof orderCreateSchema>> = {
  purchases: {},
  billing: {
    force: false,
  },
};

const useProceduresToInvalidate = () => {
  //const { order } = trpc.useContext();
  //return [order.find, order.findAll]; // TODO
  return [];
};

const commonFormProps = ({ user, transactionId }: { user?: User, transactionId?: number }) => ({
  icon: <ShoppingCart />,
  defaultValues: { ...orderFormDefaultValues, user, billing: { ...orderFormDefaultValues.billing, transactionId } },
  urlSuccessFor: (data: any) => `/administration/paiements`, // TODO
  urlCancel: `/administration/paiements`,
});

const querySchema = z.object({
  userId: z.preprocess(
    (a) => a ? parseInt(z.string().parse(a), 10) : undefined,
    z.number().int().min(0).optional()
  ),
  transactionId: z.preprocess(
    (a) => a ? parseInt(z.string().parse(a), 10) : undefined,
    z.number().int().min(0).optional()
  ),
});

export const OrderCreateForm: React.FC = () => {
  const router = useRouter();
  const queryInitialValues = useMemo(() => {
    const parsed = querySchema.safeParse(router.query);
    if (parsed.success) {
      const { userId, transactionId } = parsed.data;
      return {
        userId, transactionId,
      };
    } else {
      return {};
    }
  }, [router]);

  const userData = trpc.useQueries(t => queryInitialValues.userId !== undefined ? [t.user.find({ id: queryInitialValues.userId })] : ([] as any[]));

  return userData.length === 0 || (userData[0].data && !userData[0].isLoading) ? (
    <CreateFormContent
      {...commonFormProps({ user: userData[0].data as any, transactionId: queryInitialValues.transactionId })}
      title="Création d'une commande"
      schema={orderCreateSchema}
      mutationProcedure={trpc.transaction.create as any} // TODO
      successMessage={(data) => `La commande a été enregistrée.`}
      invalidate={useProceduresToInvalidate()}
    >
      <OrderFormFields />
    </CreateFormContent>
  ) : <BackofficeContentLoading />;
};
