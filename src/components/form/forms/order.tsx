import React, { useEffect, useMemo, useState } from 'react';
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
  DialogTitle, Divider,
  Grid,
  IconButton,
  Stack, Step, StepLabel, Stepper,
  Tooltip,
  Typography, useMediaQuery, useTheme
} from '@mui/material';
import { InputPrice } from '../fields';
import {
  AddBox,
  ArrowBack,
  ArrowForward,
  Calculate,
  Delete,
  Discount,
  Euro,
  Event,
  Person,
  ShoppingCart
} from '@mui/icons-material';
import { CreateFormContent } from '../form';
import { trpc } from '../../../common/trpc';
import { SelectUser } from '../fields/SelectUser';
import { SelectCourseRegistration } from '../fields/SelectCourseRegistration';
import { CouponModel, Course, CourseModel, CourseRegistration, Transaction, User } from '@prisma/client';
import {
  displayCouponModelName,
  displayCourseName,
} from '../../../common/display';
import { SelectTransaction } from '../fields/SelectTransaction';
import { SelectMembershipModel } from '../fields/SelectMembershipModel';
import { SelectCouponModel } from '../fields/SelectCouponModel';
import { grey } from '@mui/material/colors';
import { SelectTransactionType } from '../fields/SelectTransactionType';
import { orderCreateSchema } from '../../../common/schemas/order';
import { useRouter } from 'next/router';
import { BackofficeContentLoading } from '../../layout/admin/BackofficeContentLoading';
import { SelectCoupon } from '../fields/SelectCoupon';
import { SelectMembership } from '../fields/SelectMembership';
import { InputYear } from '../fields/InputYear';
import PatchedAutocompleteElement from '../fields/PatchedAutocompleteElement';

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
      matchId
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

interface SelectDependentCouponModelProps {
  name: string;
  fromName: string;
  label: string;
  multiple?: boolean;
}

export const SelectDependentCouponModel: React.FC<SelectDependentCouponModelProps> = ({ name, fromName, label, multiple }) => {
  const { watch } = useFormContext();
  const watchFrom = watch(fromName);
  const options = useMemo(() => watchFrom ? (watchFrom as any[]).map((option, index) => ({ id: index, ...option })) : [], [watchFrom]);
  return (
    <PatchedAutocompleteElement
      name={name}
      options={options}
      multiple={multiple}
      label={label}
      matchId
      autocompleteProps={{
        getOptionLabel: (option: { id: number, couponModel?: CouponModel } | undefined) => option?.couponModel ? displayCouponModelName(option.couponModel) : '...',
        renderOption: (props, option: { id: number, couponModel?: CouponModel } | undefined) => option ? (
          <li {...props} key={option.id}>
            {option.couponModel ? displayCouponModelName(option.couponModel) : '...'}
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
          <IconButton onClick={() => onDelete()}>
            <Delete />
          </IconButton>
        </Tooltip>
      </Box>
    </Stack>
  );
};

interface StepTitleProps {
  icon: React.ReactNode;
  children: React.ReactNode;
}

const StepTitle: React.FC<StepTitleProps> = ({ icon, children }) => (
  <Typography variant="h6" component="div">
    <Stack direction="row" alignItems="center" spacing={1}>
      {icon}
      <span>
        {children}
      </span>
    </Stack>
  </Typography>
);

const OrderFormFields: React.FC = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));

  const { watch, setValue, control, getValues, formState } = useFormContext();

  const watchStep = watch('step');

  const watchUser = watch('user');

  const watchCourseRegistrations = watch('purchases.courseRegistrations');
  const watchNewCoupons = watch('purchases.newCoupons');
  const watchNewMemberships = watch('purchases.newMemberships');
  const watchExistingCoupons = watch('purchases.existingCoupons');
  const watchExistingMemberships = watch('purchases.existingMembershipIds');

  const watchTrialCourseRegistration = watch('billing.trialCourseRegistrationId');
  //const watchReplacementCourseRegistrations = watch('billing.replacementCourseRegistrations');
  const watchTransactionId = watch('billing.transactionId');
  const watchPayment = watch('billing.newPayment');

  //

  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [membershipDialogOpen, setMembershipDialogOpen] = useState(false);
  const [couponUseDialogOpen, setCouponUseDialogOpen] = useState(false);

  const { fields: purchasedNewCouponFields, append: addPurchasedNewCoupon, remove: removePurchasedNewCoupon } = useFieldArray({ control, name: 'purchases.newCoupons' });
  const { fields: purchasedNewMembershipFields, append: addPurchasedNewMembership, remove: removePurchasedNewMembership } = useFieldArray({ control, name: 'purchases.newMemberships' });
  const { fields: billingNewCouponFields, append: addBillingNewCoupon, remove: removeBillingNewCoupon } = useFieldArray({ control, name: 'billing.newCoupons' });
  const { fields: billingExistingCouponFields, append: addBillingExistingCoupon, remove: removeBillingExistingCoupon } = useFieldArray({ control, name: 'billing.existingCoupons' });
  const { fields: billingReplacementCourseRegistrationFields, append: addBillingReplacementCourseRegistration, remove: removeBillingReplacementCourseRegistration } = useFieldArray({ control, name: 'billing.replacementCourseRegistrations' });

  useEffect(() => {
    setValue('purchases', {});
    setValue('billing', { transactionId: watchTransactionId });
    setValue('notes', undefined);
  }, [watchUser]);

  const purchasedNewMembershipDefaultValue = { year: new Date().getFullYear() };

  const errors = formState.errors as any;

  const steps: { title: string, subtitle?: string, next?: boolean, error?: boolean, onBack?: () => void }[] = [
    {
      title: 'Utilisateur',
      next: !!watchUser,
      error: !!errors?.user || !!errors?.billing?.transactionId,
    },
    {
      title: 'Achats',
      next:
        (watchCourseRegistrations && watchCourseRegistrations.length > 0)
        || (watchNewCoupons && watchNewCoupons.length > 0)
        || (watchExistingCoupons && watchExistingCoupons.length > 0)
        || (watchNewMemberships && watchNewMemberships.length > 0)
        || (watchExistingMemberships && watchExistingMemberships.length > 0),
      error: !!errors?.purchases,
    },
    {
      title: 'Réductions',
      next: true,
      error: !!errors?.billing?.newCoupons || !!errors?.billing?.existingCoupons || !!errors?.billing?.trialCourseRegistrationId || !!errors?.billing?.replacementCourseRegistrations,
    },
    {
      title: 'Paiement',
      error: !!errors?.billing?.newPayment || !!errors?.billing?.force,
    },
  ];

  const resetScroll = () => {
    window.scrollTo(0, 0);
  };
  const onNextStep = () => {
    setValue('step', watchStep + 1);
    resetScroll();
  };
  const onPreviousStep = () => {
    setValue('step', watchStep - 1);
    resetScroll();
  };
  const onChangeStep = (step: number) => {
    setValue('step', step);
    resetScroll();
  }

  const renderForm = () => (
    <Grid container spacing={2}>
      {watchStep === 0 && (
        <>
          <Grid item xs={12}>
            <StepTitle icon={<Person />}>
              1. Utilisateur
            </StepTitle>
            <Typography paragraph>
              Choisissez l'utilisateur qui bénéficiera de la commande.
              Optionnellement vous pouvez indiquer un ancien paiement (celui-ci doit alors correspondre à l'utilisateur).
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <SelectUser name="user" noMatchId />
          </Grid>
          {watchUser != null && watchTransactionId !== undefined && (
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
          )}
          {watchTransactionId === undefined && watchPayment === undefined && (
            <Grid item xs={12}>
              <CreateButton label="Lier à un ancien paiement" onClick={() => setValue('billing.transactionId', null)} />
            </Grid>
          )}
        </>
      )}

      {watchStep === 1 && (
        <>
          <Grid item xs={12}>
            <StepTitle icon={<ShoppingCart />}>
              2. Achats
            </StepTitle>
            <Typography paragraph>
              Choisissez au moins un article à acheter pour cet utilisateur.
              Seules les séances pour lesquelles l'utilisateur est inscrit sont disponibles.
            </Typography>
          </Grid>
          {watchCourseRegistrations !== undefined && watchUser != null && (
            <Grid item xs={12}>
              <OptionalField onDelete={() => setValue('purchases.courseRegistrations', undefined)}>
                <SelectCourseRegistration name="purchases.courseRegistrations" userId={watchUser.id} noOrder multiple noMatchId />
              </OptionalField>
            </Grid>
          )}
          {watchExistingCoupons !== undefined && watchUser != null && (
            <Grid item xs={12}>
              <OptionalField onDelete={() => setValue('purchases.existingCoupons', undefined)}>
                <SelectCoupon name="purchases.existingCoupons" userId={watchUser.id} noOrder label="Cartes existantes" noMatchId multiple />
              </OptionalField>
            </Grid>
          )}
          {purchasedNewCouponFields.map((field, index) => (
            <Grid item xs={12} key={field.id}>
              <OptionalField onDelete={() => removePurchasedNewCoupon(index)}>
                <SelectCouponModel name={`purchases.newCoupons.${index}.couponModel`} label="Nouvelle carte" noMatchId />
              </OptionalField>
            </Grid>
          ))}
          {watchExistingMemberships !== undefined && watchUser != null && (
            <Grid item xs={12}>
              <OptionalField onDelete={() => setValue('purchases.existingMembershipIds', undefined)}>
                <SelectMembership name="purchases.existingMembershipIds" userId={watchUser.id} noOrder label="Cotisations existantes" multiple />
              </OptionalField>
            </Grid>
          )}
          {purchasedNewMembershipFields.map((field, index) => (
            <Grid item xs={12} key={field.id}>
              <OptionalField onDelete={() => removePurchasedNewMembership(index)}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8} lg={9} xl={10}>
                    <SelectMembershipModel name={`purchases.newMemberships.${index}.membershipModelId`} label="Nouvelle cotisation" />
                  </Grid>
                  <Grid item xs={12} sm={4} lg={3} xl={2}>
                    <InputYear name={`purchases.newMemberships.${index}.year`} label="Année de début de validité" />
                  </Grid>
                </Grid>
              </OptionalField>
            </Grid>
          ))}
          {watchCourseRegistrations === undefined && (
            <Grid item xs={12}>
              <CreateButton label="Ajouter des séances" disabled={watchUser === undefined} onClick={() => setValue('purchases.courseRegistrations', [])} />
            </Grid>
          )}
          <Grid item xs={12}>
            <CreateButton label="Ajouter une carte" disabled={watchUser === undefined} onClick={() => watchExistingCoupons === undefined ? setCouponDialogOpen(true) : addPurchasedNewCoupon({})} />
          </Grid>
          <BinaryDialog
            title="Ajout d'une carte" labelA="Lier une carte" labelB="Nouvelle carte"
            open={couponDialogOpen} setOpen={setCouponDialogOpen} onChooseA={() => setValue('purchases.existingCoupons', [])} onChooseB={() => addPurchasedNewCoupon({})}>
            Souhaitez lier une carte existante, ou bien en créer une nouvelle ?
          </BinaryDialog>
          <Grid item xs={12}>
            <CreateButton label="Ajouter une cotisation" disabled={watchUser === undefined} onClick={() => watchExistingMemberships === undefined ? setMembershipDialogOpen(true) : addPurchasedNewMembership(purchasedNewMembershipDefaultValue)} />
          </Grid>
          <BinaryDialog
            title="Ajout d'une cotisation" labelA="Lier une cotisation" labelB="Nouvelle cotisation"
            open={membershipDialogOpen} setOpen={setMembershipDialogOpen} onChooseA={() => setValue('purchases.existingMembershipIds', [])} onChooseB={() => addPurchasedNewMembership(purchasedNewMembershipDefaultValue)}
          >
            Souhaitez lier une cotisation existante, ou bien en créer une nouvelle ?
          </BinaryDialog>
        </>
      )}

      {watchStep === 2 && (
        <>
          <Grid item xs={12}>
            <StepTitle icon={<Discount />}>
              3. Réductions
            </StepTitle>
            <Typography paragraph>
              Dans le cas où l'utilisateur peut bénéficier de réductions partielles ou complètes (carte de séances, séance d'essai ou rattrapage de séance), il faut les renseigner ici.
            </Typography>
          </Grid>
          {watchCourseRegistrations !== undefined && watchUser != null && (
            <>
              {billingExistingCouponFields.map((field, index) => (
                <Grid item xs={12} key={field.id}>
                  <OptionalField onDelete={() => removeBillingExistingCoupon(index)}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <SelectCoupon name={`billing.existingCoupons.${index}.couponId`} userId={watchUser.id} label="Carte existante" />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <SelectDependentCourseRegistration name={`billing.existingCoupons.${index}.courseRegistrationIds`} fromName="purchases.courseRegistrations" multiple label="Séances" />
                      </Grid>
                    </Grid>
                  </OptionalField>
                </Grid>
              ))}
              {billingNewCouponFields.map((field, index) => (
                <Grid item xs={12} key={field.id}>
                  <OptionalField onDelete={() => removeBillingNewCoupon(index)}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <SelectDependentCouponModel name={`billing.newCoupons.${index}.newCouponIndex`} fromName="purchases.newCoupons" label="Nouvelle carte" />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <SelectDependentCourseRegistration name={`billing.newCoupons.${index}.courseRegistrationIds`} fromName="purchases.courseRegistrations" multiple label="Séances" />
                      </Grid>
                    </Grid>
                  </OptionalField>
                </Grid>
              ))}
              {watchTrialCourseRegistration !== undefined && (
                <Grid item xs={12}>
                  <OptionalField onDelete={() => setValue('billing.trialCourseRegistrationId', undefined)}>
                    <SelectDependentCourseRegistration name="billing.trialCourseRegistrationId" fromName="purchases.courseRegistrations" label="Séance d'essai" />
                  </OptionalField>
                </Grid>
              )}
              {billingReplacementCourseRegistrationFields.map((field, index) => (
                <Grid item xs={12} key={field.id}>
                  <OptionalField onDelete={() => removeBillingReplacementCourseRegistration(index)}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <SelectCourseRegistration name={`billing.replacementCourseRegistrations.${index}.fromCourseRegistrationId`} userId={watchUser.id} label="Séance à rattraper" />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <SelectDependentCourseRegistration name={`billing.replacementCourseRegistrations.${index}.toCourseRegistrationId`} fromName="purchases.courseRegistrations" label="Séance de rattrapage" />
                      </Grid>
                    </Grid>
                  </OptionalField>
                </Grid>
              ))}
            </>
          )}
          {!(watchCourseRegistrations === undefined || watchCourseRegistrations.length === 0) ? (
            <>
              <Grid item xs={12}>
                <CreateButton label="Ajouter une carte" onClick={() => setCouponUseDialogOpen(true)} />
              </Grid>
              <BinaryDialog
                title="Ajout d'une carte" labelA="Lier une carte existante" labelB="Lier une nouvelle carte"
                open={couponUseDialogOpen} setOpen={setCouponUseDialogOpen} onChooseA={() => addBillingExistingCoupon({})} onChooseB={() => addBillingNewCoupon({})}>
                Souhaitez lier une carte existante, ou bien lier une nouvelle carte ?
              </BinaryDialog>
              {watchTrialCourseRegistration === undefined && (
                <Grid item xs={12}>
                  <CreateButton label="Ajouter une séance d'essai" onClick={() => setValue('billing.trialCourseRegistrationId', null)} />
                </Grid>
              )}
              <Grid item xs={12}>
                <CreateButton label="Ajouter des séances à rattraper" onClick={() => addBillingReplacementCourseRegistration({})} />
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">
                Aucune réduction n'est applicable, vous pouvez passer à l'étape suivante.
              </Alert>
            </Grid>
          )}
        </>
      )}

      {watchStep === 3 && (
        <>
          <Grid item xs={12}>
            <StepTitle icon={<Euro />}>
              5. Paiement
            </StepTitle>
            <Typography paragraph>
              Si toutes les données sont correctes vous pouvez procéder à la validation et si applicable à l'encaissement de la part de l'utilisateur.
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

          {watchUser != null && (
            watchTransactionId !== undefined ? (
              <>
                <Grid item xs={12}>
                  <OptionalField onDelete={() => setValue('billing.transactionId', undefined)}>
                    <SelectTransaction name="billing.transactionId" userId={watchUser.id} disabled />
                  </OptionalField>
                </Grid>
              </>
            ) : watchPayment !== undefined ? (
              <Grid item xs={12}>
                <OptionalField onDelete={() => setValue('billing.newPayment', undefined)}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <InputPrice name="billing.newPayment.amount" label="Montant en euros" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <SelectTransactionType name="billing.newPayment.type" />
                    </Grid>
                    <Grid item xs={12}>
                      <DatePickerElement name="billing.newPayment.date" label="Date" inputProps={{ fullWidth: true }} />
                    </Grid>
                  </Grid>
                </OptionalField>
              </Grid>
            ) : null)}
          {watchTransactionId === undefined && watchPayment === undefined && (
            <Grid item xs={12}>
              <CreateButton label="Créer un nouveau paiement" onClick={() => setValue('billing.newPayment', { date: new Date() })} />
            </Grid>
          )}
        </>
      )}

      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {watchStep > 0 ? (
          <Button variant="outlined" size="large" startIcon={<ArrowBack />} onClick={onPreviousStep}>
            Précédent
          </Button>
        ) : <Box />}
        {watchStep < steps.length - 1 ? (
          <Button variant="contained" size="large" endIcon={<ArrowForward />} onClick={onNextStep} disabled={!steps[watchStep].next}>
            Suivant
          </Button>
        ) : <Box />}
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
    </Grid>
  );

  return (
    <>
      <Box sx={{ mt: 1, mb: 3 }}>
        <Stepper activeStep={watchStep} alternativeLabel>
          {steps.map(({ title, error }, index) => (
            <Step key={index} completed={watchStep > index}>
              <StepLabel error={error}>{(!isSmall || watchStep === index) ? title : null}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      {renderForm()}
    </>
  );
}

const orderFormDefaultValues: DeepPartial<z.infer<typeof orderCreateSchema>> = {
  purchases: {},
  billing: {
    force: false,
  },
  step: 0,
};

const useProceduresToInvalidate = () => {
  const { order } = trpc.useContext();
  return [order.find, order.findAll];
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

  const invalidate = useProceduresToInvalidate();

  const userData = trpc.useQueries(t => queryInitialValues.userId !== undefined ? [t.user.find({ id: queryInitialValues.userId })] : ([] as any[]));

  return userData.length === 0 || (userData[0].data && !userData[0].isLoading) ? (
    <CreateFormContent
      {...commonFormProps(userData.length === 0 ? {} : { user: userData[0].data as any, transactionId: queryInitialValues.transactionId })}
      title="Création d'une commande"
      schema={orderCreateSchema}
      mutationProcedure={trpc.order.create}
      successMessage={(data) => `La commande a été enregistrée.`}
      invalidate={invalidate}
    >
      <OrderFormFields />
    </CreateFormContent>
  ) : <BackofficeContentLoading />;
};
