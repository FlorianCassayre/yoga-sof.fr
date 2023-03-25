import React from 'react';
import { BackofficeContent } from '../../../../components/layout/admin/BackofficeContent';
import { ShoppingCart } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useSchemaQuery } from '../../../../components/hooks/useSchemaQuery';
import { trpc } from '../../../../common/trpc';
import { BackofficeContentLoading } from '../../../../components/layout/admin/BackofficeContentLoading';
import { BackofficeContentError } from '../../../../components/layout/admin/BackofficeContentError';
import { orderFindTransformSchema } from '../../../../common/schemas/order';
import { RouterOutput } from '../../../../server/controllers/types';

interface OrderViewContentProps {
  order: RouterOutput['order']['find'];
}

const OrderViewContent: React.FC<OrderViewContentProps> = ({ order }) => {

  return (
    <BackofficeContent
      title="Commande"
      icon={<ShoppingCart />}
    >
      {null}
    </BackofficeContent>
  );
};

export default function OrderView() {
  const router = useRouter();
  const { id } = router.query;
  const result = useSchemaQuery(trpc.order.find, { id }, orderFindTransformSchema);

  return result && result.data ? (
    <OrderViewContent order={result.data} />
  ) : result?.isLoading ? <BackofficeContentLoading /> : <BackofficeContentError error={result?.error} />;
}
