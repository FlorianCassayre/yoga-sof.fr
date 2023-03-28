import React, { useState } from 'react';
import { Cancel, Visibility, VisibilityOff } from '@mui/icons-material';
import { GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { useRouter } from 'next/router';
import { orderColumn, relativeTimestamp, userColumn } from './common';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { trpc } from '../../../common/trpc';
import { Coupon, CourseType } from '@prisma/client';
import {
  Box, Button,
  Dialog, DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import { CourseTypeNames } from '../../../common/course';
import { useSnackbar } from 'notistack';
import { displayCouponName } from '../../../common/display';
import { RouterOutput } from '../../../server/controllers/types';

interface CouponCodeProps {
  code: string;
}

const CouponCode: React.FC<CouponCodeProps> = ({ code }) => {
  const [visible, setVisible] = useState(false);

  return (
    <Stack direction="row" gap={1} alignItems="center">
      <Tooltip title={!visible ? 'Afficher' : 'Cacher'}>
        <IconButton size="small" onClick={() => setVisible(!visible)}>
          {!visible ? <Visibility /> : <VisibilityOff />}
        </IconButton>
      </Tooltip>
      {visible && (
        <Box sx={{ fontFamily: 'Monospace' }}>
          {code}
        </Box>
      )}
    </Stack>
  );
};

interface DisableCouponDialogProps {
  coupon: Coupon;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export const DisableCouponDialog: React.FC<DisableCouponDialogProps> = ({ coupon, open, setOpen, onConfirm }) => {
  const handleClose = () => {
    setOpen(false);
  };
  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>
        Confirmer la désactivation de la carte
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Souhaitez-vous vraiment désactiver la <strong>{displayCouponName(coupon, false)}</strong> ?
          Plus aucun utilisateur ne pourra s'en servir en tant que moyen de paiement.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose}>Ignorer</Button>
        <Button onClick={handleConfirm} autoFocus>
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CouponGridActions = ({ row: coupon }: GridRowParams<Coupon>): React.ReactElement[] => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [confirmDisableDialogOpen, setConfirmDisableDialogOpen] = useState(false);
  const trpcClient = trpc.useContext();
  const { mutate: mutateDisable, isLoading: isDisabling } = trpc.coupon.disable.useMutation({
    onSuccess: async () => {
      await Promise.all((
        [trpcClient.coupon.find, trpcClient.coupon.findAll, trpcClient.user.find, trpcClient.user.findUpdate, trpcClient.user.findAll]
      ).map(procedure => procedure.invalidate()));
      await enqueueSnackbar('La carte a été désactivée', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar(`Une erreur est survenue lors de la désactivation de la carte`, { variant: 'error' });
    },
  });

  return [
    ...(!coupon.disabled ? [
      <GridActionsCellItemTooltip icon={<Cancel />} onClick={() => setConfirmDisableDialogOpen(true)} disabled={isDisabling} label="Désactiver la carte" />
    ] : []),
    <DisableCouponDialog
      coupon={coupon}
      open={confirmDisableDialogOpen}
      setOpen={setConfirmDisableDialogOpen}
      onConfirm={() => mutateDisable({ id: coupon.id })}
    />,
  ];
};

interface CouponGridProps {
  userId?: number;
  collapsible?: boolean;
  collapsedSummary?: React.ReactNode;
}

export const CouponGrid: React.FunctionComponent<CouponGridProps> = ({ userId, collapsible, collapsedSummary }) => {
  const columns = [
    ...(userId === undefined ? [userColumn({ field: 'user', headerName: 'Propriétaire', flex: 1 })] : []),
    {
      field: 'courseType',
      headerName: 'Type de séance',
      minWidth: 150,
      flex: 1,
      valueFormatter: ({ value }: { value: CourseType }) => CourseTypeNames[value],
    },
    {
      field: 'quantity',
      headerName: 'Nombre de séances',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'price',
      headerName: `Prix d'achat`,
      flex: 1,
      minWidth: 100,
      valueFormatter: ({ value }: { value: number }) => value > 0 ? `${value} €` : 'Gratuit',
    },
    {
      field: 'code',
      headerName: 'Code',
      flex: 1,
      minWidth: 150,
      renderCell: ({ value }: GridRenderCellParams<Coupon['code']>) => value && (
        <CouponCode code={value} />
      ),
    },
    relativeTimestamp({
      field: 'createdAt',
      headerName: `Date d'émission`,
      flex: 1,
    }),
    orderColumn({
      field: 'order',
      headerName: 'Payée',
      valueGetter: ({ row }: { row: RouterOutput['coupon']['findAll'][0] }) => row.ordersPurchased.map(({ id }) => id)[0],
    }),
    {
      field: 'actions',
      type: 'actions',
      getActions: CouponGridActions,
    },
  ];

  return (
    <AsyncGrid columns={columns} procedure={trpc.coupon.findAll} input={{ includeDisabled: false, userId }} initialSort={{ field: 'createdAt', sort: 'desc' }} collapsible={collapsible} collapsedSummary={collapsedSummary} />
  );
};
