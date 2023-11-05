import { PdfContainer } from '../../../../components/layout/mixed/PdfContainer';
import { trpc } from '../../../../common/trpc';
import { deserializeBuffer } from '../../../../common/serialize';
import { useSchemaQuery } from '../../../../components/hooks/useSchemaQuery';
import React from 'react';
import { orderFindTransformSchema } from '../../../../common/schemas/order';
import { useRouter } from 'next/router';

export default function Facture() {
  const router = useRouter();
  const { id } = router.query;
  const result = useSchemaQuery(trpc.pdf.orderInvoice, { id }, orderFindTransformSchema);
  return result ? (
    <PdfContainer pdf={result.data !== undefined ? deserializeBuffer(result.data) : undefined} isError={result.isError} />
  ) : null;
}
