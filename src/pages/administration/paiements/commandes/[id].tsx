import React from 'react';
import { OrderCreateForm } from '../../../../components/form/forms/order';
import { BackofficeContent } from '../../../../components/layout/admin/BackofficeContent';
import { Groups, PersonAdd, ShoppingCart } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { MembershipModelCards } from '../../../../components/MembershipModelCards';
import { MembershipGrid } from '../../../../components/grid/grids/MembershipGrid';

export default function OrderView() {
  return (
    <BackofficeContent
      title="Commande"
      icon={<ShoppingCart />}
    >
      {null}
    </BackofficeContent>
  );
}
