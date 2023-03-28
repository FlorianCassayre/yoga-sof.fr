import React, { useState } from 'react';
import {
  AccessibilityNew,
  Cancel,
  EscalatorWarning,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { orderColumn, relativeTimestamp, usersColumn } from './common';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { trpc } from '../../../common/trpc';
import { Membership, MembershipType } from '@prisma/client';
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
import { useSnackbar } from 'notistack';
import { displayMembershipName } from '../../../common/display';
import { formatDateDDsMMsYYYY } from '../../../common/date';
import { MembershipTypeNames } from '../../../common/membership';
import { grey } from '@mui/material/colors';
import { RouterOutput } from '../../../server/controllers/types';

interface MembershipCodeProps {
  code: string;
}

const MembershipCode: React.FC<MembershipCodeProps> = ({ code }) => {
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

interface DisableMembershipDialogProps {
  membership: Membership;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export const DisableMembershipDialog: React.FC<DisableMembershipDialogProps> = ({ membership, open, setOpen, onConfirm }) => {
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
        Confirmer l'annulation de l'adhésion
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Souhaitez-vous vraiment annuler <strong>l'{displayMembershipName(membership, false)}</strong> ?
          Les bénéficiaires de cette adhésion perdront ce statut pour cette période.
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

const MembershipGridActions = ({ row: membership }: GridRowParams<Membership>): React.ReactElement[] => {
  const { enqueueSnackbar } = useSnackbar();
  const [confirmDisableDialogOpen, setConfirmDisableDialogOpen] = useState(false);
  const trpcClient = trpc.useContext();
  const { mutate: mutateDisable, isLoading: isDisabling } = trpc.membership.disable.useMutation({
    onSuccess: async () => {
      await Promise.all((
        [trpcClient.membership.find, trpcClient.membership.findAll, trpcClient.user.find, trpcClient.user.findUpdate, trpcClient.user.findAll]
      ).map(procedure => procedure.invalidate()));
      await enqueueSnackbar(`L'adhésion a été annulée`, { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar(`Une erreur est survenue lors de l'annulation de l'adhésion`, { variant: 'error' });
    },
  });

  return [
    ...(!membership.disabled ? [
      <GridActionsCellItemTooltip icon={<Cancel />} onClick={() => setConfirmDisableDialogOpen(true)} disabled={isDisabling} label="Désactiver la carte" />
    ] : []),
    <DisableMembershipDialog
      membership={membership}
      open={confirmDisableDialogOpen}
      setOpen={setConfirmDisableDialogOpen}
      onConfirm={() => mutateDisable({ id: membership.id })}
    />,
  ];
};

interface MembershipGridProps {
  userId?: number;
  collapsible?: boolean;
  collapsedSummary?: React.ReactNode;
}

export const MembershipGrid: React.FunctionComponent<MembershipGridProps> = ({ userId, collapsible, collapsedSummary }) => {
  const columns = [
    {
      field: 'type',
      headerName: `Type d'adhésion`,
      minWidth: 150,
      flex: 1,
      renderCell: ({ value }: GridRenderCellParams<MembershipType>) => (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: grey[600] }}>
          {value === MembershipType.PERSON ? <AccessibilityNew /> : <EscalatorWarning />}
          <span style={{ color: grey[900] }}>
            {!!value && MembershipTypeNames[value]}
          </span>
        </Stack>
      ),
    },
    {
      field: 'date',
      headerName: 'Période',
      flex: 1,
      minWidth: 150,
      valueGetter: ({ row: { dateStart, dateEnd } }: { row: { dateStart: Date, dateEnd: Date } }) => [dateStart, dateEnd],
      valueFormatter: ({ value: [dateStart, dateEnd] }: { value: [Date, Date] }) => `${formatDateDDsMMsYYYY(dateStart)} au ${formatDateDDsMMsYYYY(dateEnd)}`,
    },
    usersColumn({ field: 'users', headerName: userId === undefined ? 'Bénéficiaires' : 'Autres bénéficiaires', flex: 1 }, { excludeUserId: userId }),
    {
      field: 'price',
      headerName: `Prix d'achat`,
      flex: 1,
      minWidth: 100,
      valueFormatter: ({ value }: { value: number }) => value > 0 ? `${value} €` : 'Gratuit',
    },
    relativeTimestamp({
      field: 'createdAt',
      headerName: `Date d'émission`,
      flex: 1,
    }),
    orderColumn({
      field: 'order',
      headerName: 'Payée',
      valueGetter: ({ row }: { row: RouterOutput['membership']['findAll'][0] }) => row.ordersPurchased.map(({ id }) => id)[0],
    }),
    {
      field: 'actions',
      type: 'actions',
      getActions: MembershipGridActions,
    },
  ];

  return (
    <AsyncGrid columns={columns} procedure={trpc.membership.findAll} input={{ includeDisabled: false, userId }} initialSort={{ field: 'createdAt', sort: 'desc' }} collapsible={collapsible} collapsedSummary={collapsedSummary} />
  );
};
