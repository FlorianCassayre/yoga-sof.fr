import React, { useEffect, useMemo, useState } from 'react';
import {
  AutocompleteElement, CheckboxElement,
  DatePickerElement,
  DeepPartial,
  TextFieldElement, useFieldArray,
  useFormContext
} from 'react-hook-form-mui';
import { z } from 'zod';
import {
  Alert,
  Box,
  Button, Card, CircularProgress,
  Dialog, DialogActions,
  DialogContent, DialogContentText,
  DialogTitle,
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
  Delete,
  Discount,
  Euro,
  Person,
  ShoppingCart
} from '@mui/icons-material';
import { CreateFormContent } from '../form';
import { trpc } from '../../../common/trpc';
import { SelectUser } from '../fields/SelectUser';
import { SelectCourseRegistration } from '../fields/SelectCourseRegistration';
import {
  Coupon,
  CouponModel,
  Course,
  CourseRegistration, Membership, MembershipModel, Transaction,
  User
} from '@prisma/client';
import {
  displayCouponModelName,
  displayCouponName,
  displayCourseName,
  displayMembershipModelName,
  displayMembershipModelNameWithoutPrice,
  displayMembershipName,
  displayUserName
} from '../../../common/display';
import { SelectTransaction } from '../fields/SelectTransaction';
import { SelectMembershipModel } from '../fields/SelectMembershipModel';
import { SelectCouponModel } from '../fields/SelectCouponModel';
import { grey } from '@mui/material/colors';
import { SelectTransactionType } from '../fields/SelectTransactionType';
import {
  orderCreateSchema,
  orderCreateStep1UserSchema,
  orderCreateStep2PurchasesSchema, orderCreateStep3Discounts, orderCreateStep4Payment
} from '../../../common/schemas/order';
import { useRouter } from 'next/router';
import { BackofficeContentLoading } from '../../layout/admin/BackofficeContentLoading';
import { SelectCoupon } from '../fields/SelectCoupon';
import { SelectMembership } from '../fields/SelectMembership';
import { InputYear } from '../fields/InputYear';
import PatchedAutocompleteElement from '../fields/PatchedAutocompleteElement';
import { PurchasesTable } from '../../PurchasesTable';

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

  const { watch, setValue, control, getValues, formState, trigger } = useFormContext();

  const watchValues = watch();

  const watchStep = watch('step');

  const watchUser = watch('user');

  const watchCourseRegistrations = watch('purchases.courseRegistrations');
  const watchNewCoupons = watch('purchases.newCoupons');
  const watchNewMemberships = watch('purchases.newMemberships');
  const watchExistingCoupons = watch('purchases.existingCoupons');
  const watchExistingMemberships = watch('purchases.existingMemberships');

  const watchTrialCourseRegistration = watch('billing.trialCourseRegistration');
  const watchReplacementCourseRegistrations = watch('billing.replacementCourseRegistrations');
  const watchTransaction = watch('billing.transaction');
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
    setValue('billing', { transaction: watchTransaction });
    setValue('notes', undefined);
  }, [watchUser]);

  const purchasedNewMembershipDefaultValue = { year: new Date().getFullYear() };

  const errors = formState.errors as any;

  const steps: { title: string, subtitle?: string, schema: z.Schema, error?: boolean, onBack?: () => void }[] = [
    {
      title: 'Utilisateur',
      schema: orderCreateStep1UserSchema,
      error: !!errors?.user || !!errors?.billing?.transaction,
    },
    {
      title: 'Achats',
      schema: orderCreateStep2PurchasesSchema,
      error: !!errors?.purchases,
    },
    {
      title: 'Réductions',
      schema: orderCreateStep3Discounts,
      error: !!errors?.billing?.newCoupons || !!errors?.billing?.existingCoupons || !!errors?.billing?.trialCourseRegistrationId || !!errors?.billing?.replacementCourseRegistrations,
    },
    {
      title: 'Paiement',
      schema: orderCreateStep4Payment,
      error: !!errors?.billing?.newPayment || !!errors?.billing?.force,
    },
  ];

  const orderPreview = useMemo(() => {
    if (watchStep !== steps.length - 1) {
      return;
    }
    const values = getValues() as any as (z.infer<typeof orderCreateStep3Discounts> & { user: User, billing: { transaction?: Transaction } });

    type PurchaseTableItem = Parameters<typeof PurchasesTable>[0]['rows'][0];

    const items: PurchaseTableItem[] = (values.purchases.existingMemberships?.map(m => {
      const membership = m as Membership;
      return {
        item: displayMembershipName(membership),
        price: membership.price,
      };
    }) ?? []).concat(values.purchases.newMemberships?.map(m => {
      const membershipModel = m.membershipModel as MembershipModel;
      return {
        item: displayMembershipModelNameWithoutPrice(membershipModel),
        price: membershipModel.price,
      };
    }) ?? []).concat(values.purchases.existingCoupons?.map(c => {
      const coupon = c as Coupon;
      return {
        item: displayCouponName(coupon),
        price: coupon.price,
      };
    }) ?? []).concat(values.purchases.newCoupons?.map(c => {
      const couponModel = c.couponModel as CouponModel;
      return {
        item: displayCouponModelName(couponModel),
        price: couponModel.price,
      };
    }) ?? []).concat(values.purchases.courseRegistrations?.map((courseRegistration) => {
      const { id, course } = courseRegistration as CourseRegistration & { course: Course };
      const existingCoupon = values.billing.existingCoupons?.filter(c => c.courseRegistrationIds.includes(id))[0];
      const newCoupon = values.billing.newCoupons?.filter(c => c.courseRegistrationIds.includes(id))[0];
      const replacement = values.billing.replacementCourseRegistrations?.filter(r => r.toCourseRegistrationId === id)[0];

      if (existingCoupon !== undefined) { // Existing coupon
        return {
          item: displayCourseName(course),
          discount: displayCouponName(existingCoupon.coupon as Coupon),
          oldPrice: course.price,
          price: 0,
        };
      } else if (values.purchases.newCoupons !== undefined && newCoupon !== undefined) { // New coupon
        return {
          item: displayCourseName(course),
          discount: displayCouponModelName(values.purchases.newCoupons[newCoupon.newCouponIndex].couponModel as CouponModel),
          oldPrice: course.price,
          price: 0,
        };
      } else if (replacement !== undefined) { // Replacement
        return {
          item: displayCourseName(course),
          discount: 'Remplacement de séance', // TODO
          oldPrice: course.price,
          price: 0,
        };
      } else if (values.billing.trialCourseRegistration !== undefined && values.billing.trialCourseRegistration?.courseRegistrationId === id) { // Trial
        return {
          item: displayCourseName(course),
          discount: `Séance d'essai`,
          oldPrice: course.price,
          price: values.billing.trialCourseRegistration.newPrice,
        };
      } else { // Normal purchase
        return {
          item: displayCourseName(course),
          price: course.price,
        };
      }
    }) ?? []);

    return {
      items,
      computedAmount: items.map(({ price }) => price).reduce((a, b) => a + b, 0),
    };
  }, [watchStep, getValues]);

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
    <Grid container spacing={2} justifyContent="center">
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
          {watchUser != null && watchTransaction !== undefined && (
            <>
              <Grid item xs={12}>
                <Alert severity="info">
                  Lorsque la commande aura été créée l'ancien paiement disparaitra automatiquement de la liste.
                </Alert>
              </Grid>
              <Grid item xs={12}>
                <OptionalField onDelete={() => setValue('billing.transaction', undefined)}>
                  <SelectTransaction name="billing.transaction" userId={watchUser.id} noMatchId />
                </OptionalField>
              </Grid>
            </>
          )}
          {watchTransaction === undefined && watchPayment === undefined && (
            <Grid item xs={12}>
              <CreateButton label="Lier à un ancien paiement" onClick={() => setValue('billing.transaction', null)} />
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
              <OptionalField onDelete={() => setValue('purchases.existingMemberships', undefined)}>
                <SelectMembership name="purchases.existingMemberships" userId={watchUser.id} noOrder label="Cotisations existantes" noMatchId multiple />
              </OptionalField>
            </Grid>
          )}
          {purchasedNewMembershipFields.map((field, index) => (
            <Grid item xs={12} key={field.id}>
              <OptionalField onDelete={() => removePurchasedNewMembership(index)}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8} lg={9} xl={10}>
                    <SelectMembershipModel name={`purchases.newMemberships.${index}.membershipModel`} label="Nouvelle cotisation" noMatchId />
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
            open={membershipDialogOpen} setOpen={setMembershipDialogOpen} onChooseA={() => setValue('purchases.existingMemberships', [])} onChooseB={() => addPurchasedNewMembership(purchasedNewMembershipDefaultValue)}
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
                        <SelectCoupon name={`billing.existingCoupons.${index}.coupon`} userId={watchUser.id} label="Carte existante" noMatchId />
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
                  <OptionalField onDelete={() => setValue('billing.trialCourseRegistration', undefined)}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <SelectDependentCourseRegistration name="billing.trialCourseRegistration.courseRegistrationId" fromName="purchases.courseRegistrations" label="Séance d'essai" />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <InputPrice name="billing.trialCourseRegistration.newPrice" label="Nouveau prix" />
                      </Grid>
                    </Grid>
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
                  <CreateButton label="Ajouter une séance d'essai" onClick={() => setValue('billing.trialCourseRegistration', {})} />
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
              Si toutes les données vous semblent correctes vous pouvez procéder à la validation et si applicable à l'encaissement de la part de l'utilisateur.
            </Typography>
          </Grid>
          {orderPreview && (
            <Grid item xs={12} lg={10} xl={8}>
              <Card variant="outlined" sx={{ borderBottom: 'none' }}>
                <PurchasesTable rows={orderPreview.items} totalToPay={orderPreview.computedAmount} small />
              </Card>
            </Grid>
          )}
          {watchUser != null && (
            watchTransaction !== undefined ? (
              <>
                <Grid item xs={12}>
                  <OptionalField onDelete={() => setValue('billing.transaction', undefined)}>
                    <SelectTransaction name="billing.transaction" userId={watchUser.id} noMatchId disabled />
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
          {watchTransaction === undefined && watchPayment === undefined && (
            <Grid item xs={12}>
              <CreateButton label="Créer un nouveau paiement" onClick={() => setValue('billing.newPayment', { date: new Date() })} />
            </Grid>
          )}
          <Grid item xs={12}>
            <CheckboxElement name="billing.force" label="Définir un autre prix pour cette commande" />
          </Grid>
          <Grid item xs={12}>
            <TextFieldElement name="notes" label="Notes" fullWidth />
          </Grid>

          {!!orderPreview && (
            <Grid item xs={12}>
              <Alert severity="info">
                En cliquant sur "créer" vous confirmez avoir reçu un paiement de <strong>{orderPreview.computedAmount} €</strong> de la part de <strong>{displayUserName(watchUser)}</strong>.
              </Alert>
            </Grid>
          )}
        </>
      )}

      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {watchStep > 0 ? (
          <Button key={`previous-${watchStep}`} variant="outlined" startIcon={<ArrowBack />} onClick={onPreviousStep}>
            Précédent
          </Button>
        ) : <Box />}
        {watchStep < steps.length ? (
          <Button key={`next-${watchStep}`} type={watchStep !== steps.length - 1 ? undefined : 'submit'} variant="contained" color={watchStep !== steps.length - 1 ? undefined : 'success'} endIcon={watchStep !== steps.length - 1 ? <ArrowForward /> : <AddBox />} onClick={watchStep !== steps.length - 1 ? onNextStep : undefined} disabled={!steps[watchStep].schema.safeParse(watchValues).success}>
            {watchStep !== steps.length - 1 ? `Suivant` : `Créer`}
          </Button>
        ) : <Box />}
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

const commonFormProps = ({ user, transaction }: { user?: User, transaction?: Transaction }) => ({
  icon: <ShoppingCart />,
  defaultValues: { ...orderFormDefaultValues, user, billing: { ...orderFormDefaultValues.billing, transaction } },
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
  const transactionData = trpc.useQueries(t => queryInitialValues.transactionId !== undefined ? [t.transaction.find({ id: queryInitialValues.transactionId })] : ([] as any[]));

  return (userData.length === 0 || (userData[0].data && !userData[0].isLoading)) && (transactionData.length === 0 || (transactionData[0].data && !transactionData[0].isLoading)) ? (
    <CreateFormContent
      {...commonFormProps({ ...(userData.length === 0 ? {} : { user: userData[0].data as any}), ...(transactionData.length === 0 ? {} : { user: transactionData[0].data as any}) })}
      title="Création d'une commande"
      schema={orderCreateSchema}
      mutationProcedure={trpc.order.create}
      successMessage={(data) => `La commande a été enregistrée.`}
      invalidate={invalidate}
      hiddenControls
    >
      <OrderFormFields />
    </CreateFormContent>
  ) : <BackofficeContentLoading />;
};
