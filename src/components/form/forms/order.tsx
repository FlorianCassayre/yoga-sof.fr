import React, { useEffect, useMemo, useState } from 'react';
import {
  AutocompleteElement, CheckboxElement,
  DatePickerElement, DeepPartial, SwitchElement,
  TextFieldElement, useFieldArray,
  useFormContext
} from 'react-hook-form-mui';
import { z } from 'zod';
import {
  Alert,
  Box,
  Button, Card,
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
import { CreateFormContent, UpdateFormContent } from '../form';
import { trpc } from '../../../common/trpc';
import { SelectUser } from '../fields/SelectUser';
import { SelectCourseRegistration } from '../fields/SelectCourseRegistration';
import {
  Coupon,
  CouponModel,
  Course,
  CourseRegistration, Membership, MembershipModel, TransactionType,
  User
} from '@prisma/client';
import {
  displayCouponModelName,
  displayCouponName,
  displayCourseName,
  displayMembershipModelNameWithoutPrice,
  displayMembershipName,
  displayUserName
} from '../../../common/display';
import { SelectMembershipModel } from '../fields/SelectMembershipModel';
import { SelectCouponModel } from '../fields/SelectCouponModel';
import { grey } from '@mui/material/colors';
import { SelectTransactionType } from '../fields/SelectTransactionType';
import {
  orderCreateSchema,
  orderCreateStep1UserSchema,
  orderCreateStep2PurchasesSchema,
  orderCreateStep3Discounts,
  orderCreateStep4Payment,
  orderFindTransformSchema,
  orderUpdateSchema
} from '../../../common/schemas/order';
import { useRouter } from 'next/router';
import { BackofficeContentLoading } from '../../layout/admin/BackofficeContentLoading';
import { SelectCoupon } from '../fields/SelectCoupon';
import { SelectMembership } from '../fields/SelectMembership';
import { InputYear } from '../fields/InputYear';
import PatchedAutocompleteElement from '../fields/PatchedAutocompleteElement';
import { PurchasesTable } from '../../PurchasesTable';
import { ParsedUrlQuery } from 'querystring';
import { FieldPathByValue } from 'react-hook-form/dist/types/path/eager';
import { DeepNullable, ValidateSubtype } from '../../../common/utils';
import { CreateButton } from '../../CreateButton';

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

type ArrayFieldPath = FieldPathByValue<CreateFieldValues, object[] | undefined | null>;
interface SelectDependentCouponModelProps<TFieldPath extends ArrayFieldPath> {
  name: string;
  fromName: TFieldPath;
  label: string;
  multiple?: boolean;
}

export const SelectDependentCouponModel = <TFieldPath extends ArrayFieldPath>({ name, fromName, label, multiple }: SelectDependentCouponModelProps<TFieldPath>) => {
  const { watch } = useFormContext<CreateFieldValues>();
  const watchFrom = watch(fromName);
  const options = useMemo(() => watchFrom ? watchFrom.map((option, index) => ({ id: index, ...option })) : [], [watchFrom]);
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

  const { watch, setValue, control, getValues, formState, trigger }
    = useFormContext<CreateFieldValues>();

  const watchValues = watch();

  const watchStep = watch('step');

  const watchUser = watch('user');

  const watchCourseRegistrations = watch('purchases.courseRegistrations');
  //const watchNewCoupons = watch('purchases.newCoupons');
  //const watchNewMemberships = watch('purchases.newMemberships');
  const watchExistingCoupons = watch('purchases.existingCoupons');
  const watchExistingMemberships = watch('purchases.existingMemberships');

  const watchTrialCourseRegistration = watch('billing.trialCourseRegistration');
  const watchReplacementCourseRegistrations = watch('billing.replacementCourseRegistrations');
  const watchPayment = watch('billing.newPayment');
  const watchBillingExistingCoupons = watch('billing.existingCoupons');
  const watchBillingNewCoupons = watch('billing.newCoupons');

  //

  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [membershipDialogOpen, setMembershipDialogOpen] = useState(false);
  const [couponUseDialogOpen, setCouponUseDialogOpen] = useState(false);

  const { fields: purchasedNewCouponFields, append: addPurchasedNewCoupon, remove: removePurchasedNewCoupon } = useFieldArray({ control, name: 'purchases.newCoupons' });
  const { fields: purchasedNewMembershipFields, append: addPurchasedNewMembership, remove: removePurchasedNewMembership } = useFieldArray({ control, name: 'purchases.newMemberships' });
  const { fields: billingNewCouponFields, append: addBillingNewCoupon, remove: removeBillingNewCoupon, update: updateBillingNewCoupon } = useFieldArray({ control, name: 'billing.newCoupons' });
  const { fields: billingExistingCouponFields, append: addBillingExistingCoupon, remove: removeBillingExistingCoupon, update: updateBillingExistingCoupon } = useFieldArray({ control, name: 'billing.existingCoupons' });
  const { fields: billingReplacementCourseRegistrationFields, append: addBillingReplacementCourseRegistration, remove: removeBillingReplacementCourseRegistration } = useFieldArray({ control, name: 'billing.replacementCourseRegistrations' });

  const today = new Date();
  const purchasedNewMembershipDefaultValue = { year: today.getFullYear() - (today.getMonth() < 9 - 1 ? 1 : 0) };

  const errors = formState.errors;

  const steps: { title: string, subtitle?: string, schema: z.Schema, error?: boolean, onBack?: () => void }[] = [
    {
      title: 'Utilisateur',
      schema: orderCreateStep1UserSchema,
      error: !!errors?.user,
    },
    {
      title: 'Achats',
      schema: orderCreateStep2PurchasesSchema,
      error: !!errors?.purchases,
    },
    {
      title: 'Réductions',
      schema: orderCreateStep3Discounts,
      error: !!errors?.billing?.newCoupons || !!errors?.billing?.existingCoupons || !!errors?.billing?.trialCourseRegistration || !!errors?.billing?.replacementCourseRegistrations,
    },
    {
      title: 'Paiement',
      schema: orderCreateStep4Payment,
      error: !!errors?.billing?.newPayment && !!errors?.notes,
    },
  ];

  const orderPreview = useMemo(() => {
    if (watchStep !== steps.length - 1) {
      return;
    }
    const values = getValues();

    type OrderedPurchaseTableItem = Parameters<typeof PurchasesTable>[0]['rows'][0] & { ordering: [number, number] };

    const
      orderMembershipsExisting = 0,
      orderMembershipsNew = 1,
      orderCouponsExisting = 2,
      orderCouponsNew = 3,
      orderCourseRegistrationPurchased = 4,
      orderCourseRegistrationUsedCouponExisting = 5,
      orderCourseRegistrationUsedCouponNew = 6,
      orderCourseRegistrationTrial = 7,
      orderCourseRegistrationReplacement = 8;

    const items: OrderedPurchaseTableItem[] = (values.purchases.existingMemberships?.map<OrderedPurchaseTableItem>(membership => {
      return {
        item: displayMembershipName(membership),
        price: membership.price,
        ordering: [orderMembershipsExisting, -membership.price],
      };
    }) ?? []).concat(values.purchases.newMemberships?.map(m => {
      const membershipModel = m.membershipModel!;
      return {
        item: `${displayMembershipModelNameWithoutPrice(membershipModel)} (nouvelle)`,
        price: membershipModel.price,
        ordering: [orderMembershipsNew, -membershipModel.price],
      };
    }) ?? []).concat(values.purchases.existingCoupons?.map(coupon => {
      return {
        item: `${displayCouponName(coupon)} (existante)`,
        price: coupon.price,
        ordering: [orderCouponsExisting, coupon.price],
      };
    }) ?? []).concat(values.purchases.newCoupons?.map(c => {
      const couponModel = c.couponModel!;
      return {
        item: `${displayCouponModelName(couponModel)} (nouvelle)`,
        price: couponModel.price,
        ordering: [orderCouponsNew, couponModel.price],
      };
    }) ?? []).concat(values.purchases.courseRegistrations?.map<OrderedPurchaseTableItem>((courseRegistration) => {
      const { id, course } = courseRegistration;
      const existingCoupon = values.billing.existingCoupons?.filter(c => c.courseRegistrationIds?.includes(id))[0];
      const newCoupon = values.billing.newCoupons?.filter(c => c.courseRegistrationIds?.includes(id))[0];
      const replacement = values.billing.replacementCourseRegistrations?.filter(r => r.toCourseRegistrationId === id)[0];
      const courseTime = course.dateStart.getTime();
      const item = displayCourseName(course);

      if (existingCoupon !== undefined) { // Existing coupon
        return {
          item,
          discount: `${displayCouponName(existingCoupon.coupon!)} (existante)`,
          oldPrice: course.price,
          price: 0,
          ordering: [orderCourseRegistrationUsedCouponExisting, courseTime],
        };
      } else if (values.purchases.newCoupons !== undefined && newCoupon !== undefined) { // New coupon
        return {
          item,
          discount: `${displayCouponModelName(values.purchases.newCoupons[newCoupon.newCouponIndex!].couponModel!)} (nouvelle)`,
          oldPrice: course.price,
          price: 0,
          ordering: [orderCourseRegistrationUsedCouponNew, courseTime],
        };
      } else if (replacement !== undefined) { // Replacement
        return {
          item,
          discount: 'Remplacement de séance', // TODO include name
          oldPrice: course.price,
          price: 0,
          ordering: [orderCourseRegistrationReplacement, courseTime],
        };
      } else if (values.billing.trialCourseRegistration !== undefined && values.billing.trialCourseRegistration?.courseRegistrationId === id) { // Trial
        return {
          item,
          discount: `Séance d'essai`,
          oldPrice: course.price,
          price: values.billing.trialCourseRegistration.newPrice!,
          ordering: [orderCourseRegistrationTrial, courseTime],
        };
      } else { // Normal purchase
        return {
          item,
          price: course.price,
          ordering: [orderCourseRegistrationPurchased, courseTime],
        };
      }
    }) ?? [])
      .sort(({ ordering: [a1, a2] }, { ordering: [b1, b2] }) => a1 !== b1 ? a1 - b1 : a2 - b2);

    return {
      items,
      computedAmount: items.map(({ price }) => price).reduce((a, b) => a + b, 0),
    };
  }, [watchStep, getValues]);

  // Synchronize dependent fields

  // Step 2
  useEffect(() => {
    if (!watchUser) {
      setValue('purchases.courseRegistrations', watchCourseRegistrations ? (watchCourseRegistrations.length > 0 ? [] : watchCourseRegistrations) : undefined);
      setValue('purchases.existingCoupons', watchExistingCoupons ? (watchExistingCoupons.length > 0 ? [] : watchExistingCoupons) : undefined);
      setValue('purchases.existingMemberships', watchExistingMemberships ? (watchExistingMemberships.length > 0 ? [] : watchExistingMemberships) : undefined);
    } else {
      if (watchCourseRegistrations) {
        const filteredCourseRegistrations = watchCourseRegistrations.filter(({ userId }) => watchUser.id === userId);
        if (filteredCourseRegistrations.length !== watchCourseRegistrations.length) {
          setValue('purchases.courseRegistrations', filteredCourseRegistrations);
        }
      }
      if (watchExistingCoupons) {
        const filteredExistingCoupons = watchExistingCoupons.filter(({ userId }) => watchUser.id === userId);
        if (filteredExistingCoupons.length !== watchExistingCoupons.length) {
          setValue('purchases.existingCoupons', filteredExistingCoupons);
        }
      }
      if (watchExistingMemberships) {
        const filteredExistingMemberships = watchExistingMemberships.filter(({ users }) => users.some(({ id }) => id === watchUser.id));
        if (filteredExistingMemberships.length !== watchExistingMemberships.length) {
          setValue('purchases.existingMemberships', filteredExistingMemberships);
        }
      }
    }
  }, [watchStep]);

  // Step 3
  useEffect(() => {
    if (!watchCourseRegistrations) {
      ([[watchBillingExistingCoupons, updateBillingExistingCoupon], [watchBillingNewCoupons, updateBillingNewCoupon]] as const).forEach(([watchBillingCoupons, updateBillingCoupons]) =>
        watchBillingCoupons?.forEach((o, i) => {
          const courseRegistrationIds = o.courseRegistrationIds;
          updateBillingCoupons(i, { ...o, courseRegistrationIds: courseRegistrationIds ? (courseRegistrationIds.length > 0 ? [] : courseRegistrationIds) : undefined });
        })
      );
    } else {
      ([[watchBillingExistingCoupons, updateBillingExistingCoupon], [watchBillingNewCoupons, updateBillingNewCoupon]] as const).forEach(([watchBillingCoupons, updateBillingCoupons]) =>
        watchBillingCoupons?.forEach((o, i) => {
          const courseRegistrations = o.courseRegistrationIds;
          if (courseRegistrations) {
            const filteredCourseRegistrations = courseRegistrations.filter(id => watchCourseRegistrations.some(c => c.id === id));
            if (filteredCourseRegistrations.length !== courseRegistrations.length) {
              updateBillingCoupons(i, { ...o, courseRegistrationIds: filteredCourseRegistrations });
            }
          }
        })
      );
    }
    if (watchTrialCourseRegistration && (!watchCourseRegistrations || !watchCourseRegistrations.some(c => c.id === watchTrialCourseRegistration.courseRegistrationId))) {
      setValue('billing.trialCourseRegistration.courseRegistrationId', undefined);
    }
    // TODO replacement
  }, [watchStep]); // Infinite loop with more dependencies... honestly fed up with this crap

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

  const renderForm = () => (
    <Grid container spacing={2} justifyContent="center">
      {watchStep === 0 && (
        <>
          <Grid item xs={12}>
            <StepTitle icon={<Person />}>
              1. Utilisateur
            </StepTitle>
            <Typography paragraph>
              Choisissez l'utilisateur qui bénéficiera des achats.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <SelectUser name="user" noMatchId />
          </Grid>
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
                        <SelectCoupon name={`billing.existingCoupons.${index}.coupon`} userId={watchUser.id} notEmpty label="Carte existante" noMatchId />
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
                        <SelectCourseRegistration name={`billing.replacementCourseRegistrations.${index}.fromCourseRegistrationId`} userId={watchUser.id} label="Séance à rattraper" notCanceled />
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
                Aucune réduction n'est applicable, vous pouvez directement passer à l'étape suivante.
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
            <Grid item xs={12} lg={10} xl={8} sx={{ mb: 2 }}>
              <Card variant="outlined" sx={{ borderBottom: 'none' }}>
                <PurchasesTable rows={orderPreview.items} totalToPay={orderPreview.computedAmount} small />
              </Card>
            </Grid>
          )}
          {watchUser != null && (
            watchPayment !== undefined ? (
              <Grid item xs={12}>
                <OptionalField onDelete={() => setValue('billing.newPayment', undefined)}>
                  <Grid container spacing={2}>
                    {watchPayment?.overrideAmount && (
                      <Grid item xs={12} sm={6}>
                        <InputPrice name="billing.newPayment.amount" label="Montant en euros" />
                      </Grid>
                    )}
                    <Grid item xs={12} sm={watchPayment?.overrideAmount ? 6 : undefined}>
                      <SelectTransactionType name="billing.newPayment.type" />
                    </Grid>
                    <Grid item xs={12}>
                      <CheckboxElement name="billing.newPayment.overrideAmount" label="Définir un autre montant pour le paiement" />
                    </Grid>
                  </Grid>
                </OptionalField>
              </Grid>
            ) : null)}
          {watchPayment === undefined && (
            <Grid item xs={12}>
              <CreateButton label="Créer un nouveau paiement" onClick={() => setValue('billing.newPayment', { overrideAmount: false })} />
            </Grid>
          )}
          <Grid item xs={12}>
            <DatePickerElement name="billing.date" label="Date" inputProps={{ fullWidth: true }} />
          </Grid>
          <Grid item xs={12}>
            <TextFieldElement name="notes" label="Notes" fullWidth />
          </Grid>
          <Grid item xs={12}>
            <SwitchElement name="notify" label="Notifier l'utilisateur avec une copie de la facture" />
          </Grid>

          {!!orderPreview && (watchPayment?.overrideAmount === undefined && orderPreview.computedAmount !== (watchPayment?.amount ?? 0)
           ? (
            <Grid item xs={12}>
              <Alert severity="warning">
                {orderPreview.computedAmount > 0 ? (
                  <>
                    Le montant des articles est de <strong>{orderPreview.computedAmount} €</strong> tandis que le paiement de l'utilisateur revient à <strong>{watchPayment?.amount ?? 0} €</strong>.
                    Pour indiquer que vous avez reçu de l'argent de la part de l'utilisateur, cliquez sur "créer un nouveau paiement".
                  </>
                ) : (
                  <>
                    Le montant des articles est de <strong>0 €</strong>, aucun paiement n'est attendu.
                    Pour supprimer le paiement, cliquez sur le bouton de suppression à droite.
                  </>
                )}
              </Alert>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">
                {orderPreview.computedAmount > 0 || (watchPayment?.overrideAmount && (watchPayment?.amount ?? 0) > 0) ? (
                  <>
                    En cliquant sur "créer" vous confirmez avoir reçu un paiement de <strong>{watchPayment?.overrideAmount ? (watchPayment?.amount ?? 0) : orderPreview.computedAmount} €</strong> de la part de <strong>{displayUserName(watchUser!)}</strong>.
                  </>
                ) : (
                  <>
                    En cliquant sur "créer" vous confirmez ne pas avoir reçu de paiement de la part de <strong>{displayUserName(watchUser!)}</strong>.
                  </>
                )}
              </Alert>
            </Grid>
          ))}
        </>
      )}

      <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
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

type CreateFieldValues = ValidateSubtype<
  DeepPartial<DeepNullable<z.infer<typeof orderCreateSchema>>>,
  {
    step: number,
    user?: User,
    notes?: string,
    notify: boolean,
    purchases: {
      courseRegistrations?: (CourseRegistration & { course: Course })[],
      newCoupons?: { couponModel?: CouponModel }[],
      existingCoupons?: Coupon[],
      newMemberships?: { membershipModel?: MembershipModel, year?: number }[],
      existingMemberships?: (Membership & { users: User[] })[],
    },
    billing: {
      newCoupons?: { newCouponIndex?: number, courseRegistrationIds?: number[] }[],
      existingCoupons?: { coupon?: Coupon, courseRegistrationIds?: number[] }[],
      trialCourseRegistration?: { courseRegistrationId?: number, newPrice?: number },
      replacementCourseRegistrations?: { fromCourseRegistrationId?: number, toCourseRegistrationId?: number }[],
      newPayment?: { amount?: number, overrideAmount?: boolean, type?: TransactionType },
      date?: Date,
    },
  }>;

const orderFormDefaultValues = (): CreateFieldValues => ({
  purchases: {},
  step: 0,
  billing: {
    date: new Date(),
  },
  notify: true,
});

const useProceduresToInvalidate = () => {
  const { order } = trpc.useContext();
  return [order.find, order.findAll, order.findUpdate];
};

const commonFormProps = ({ user }: { user?: User }) => {
  const defaultValues = orderFormDefaultValues();
  return {
    icon: <ShoppingCart />,
    defaultValues: { ...defaultValues, user, billing: { ...defaultValues.billing } },
    urlSuccessFor: (data: any) => `/administration/paiements`, // TODO
    urlCancel: `/administration/paiements`,
  };
};

const querySchema = z.object({
  userId: z.preprocess(
    (a) => a ? parseInt(z.string().parse(a), 10) : undefined,
    z.number().int().min(0).optional()
  ),
});

export const OrderCreateForm: React.FC = () => {
  const router = useRouter();
  const queryInitialValues = useMemo(() => {
    const parsed = querySchema.safeParse(router.query);
    if (parsed.success) {
      const { userId } = parsed.data;
      return { userId };
    } else {
      return {};
    }
  }, [router]);

  const invalidate = useProceduresToInvalidate();

  const userData = trpc.useQueries(t => queryInitialValues.userId !== undefined ? [t.user.find({ id: queryInitialValues.userId })] : ([] as any[]));

  return (userData.length === 0 || (userData[0].data && !userData[0].isLoading)) ? (
    <CreateFormContent
      {...commonFormProps({ ...(userData.length === 0 ? {} : { user: userData[0].data as any}) })}
      title="Création d'un paiement"
      schema={orderCreateSchema}
      mutationProcedure={trpc.order.create}
      successMessage={(data) => `Le paiement a été enregistrée.`}
      invalidate={invalidate}
      hiddenControls
    >
      <OrderFormFields />
    </CreateFormContent>
  ) : <BackofficeContentLoading />;
};

export const OrderUpdateForm = ({ queryData }: { queryData: ParsedUrlQuery }) => {
  return (
    <UpdateFormContent
      title="Modification d'un paiement"
      icon={<ShoppingCart />}
      schema={orderUpdateSchema}
      mutationProcedure={trpc.order.update}
      queryProcedure={trpc.order.findUpdate}
      querySchema={orderFindTransformSchema}
      queryParams={queryData}
      successMessage={() => 'Le paiement a été mise à jour'}
      defaultValues={{}}
      urlSuccessFor={({ id }) => `/administration/paiements/${id}`}
      urlCancel={`/administration/paiements`}
      invalidate={useProceduresToInvalidate()}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <DatePickerElement name="date" label="Date du paiement" inputProps={{ fullWidth: true }} />
        </Grid>
        <Grid item xs={12}>
          <TextFieldElement name="notes" label="Notes (visibles seulement par vous)" multiline rows={4} fullWidth />
        </Grid>
      </Grid>
    </UpdateFormContent>
  );
};
