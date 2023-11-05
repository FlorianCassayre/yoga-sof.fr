import React from 'react';
import { Add, ArrowDownward, ArrowUpward, Delete, PictureAsPdf, Print } from '@mui/icons-material';
import { BackofficeContent } from '../../../components/layout/admin/BackofficeContent';
import { Alert, Box, Button, Card, Grid, IconButton, Stack } from '@mui/material';
import { trpc } from '../../../common/trpc';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DatePickerElement,
  DeepPartial,
  FormContainer,
  SwitchElement,
  TextFieldElement,
  useFieldArray
} from 'react-hook-form-mui';
import { freeInvoiceSchema } from '../../../common/schemas/invoice';
import { PdfContainer } from '../../../components/layout/mixed/PdfContainer';
import { deserializeBuffer, SerializedBuffer } from '../../../common/serialize';
import { z } from 'zod';
import { InputId } from '../../../components/form/fields/InputId';
import { InputPrice } from '../../../components/form/fields';
import { SelectTransactionType } from '../../../components/form/fields/SelectTransactionType';
import { CreateButton } from '../../../components/CreateButton';

interface InvoiceFormFieldsProps {
  disabled: boolean;
}

const InvoiceFormFields: React.FC<InvoiceFormFieldsProps> = ({ disabled }) => {
  const { fields, append, remove, swap } = useFieldArray({ name: 'items' });
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <InputId name="id" label="Numéro de facture" disabled={disabled} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <DatePickerElement name="date" label="Date" disabled={disabled} inputProps={{ fullWidth: true }} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextFieldElement name="receiver.fullname" label="Nom du client" disabled={disabled} fullWidth />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextFieldElement name="receiver.email" label="Adresse email du client" disabled={disabled} fullWidth />
      </Grid>
      {fields.map((field, index) => (
        <Grid key={field.id} item xs={12}>
          <Card variant="outlined" sx={{ p: 2, backgroundColor: 'inherit' }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextFieldElement name={`items.${index}.title`} label="Intitulé de l'article" disabled={disabled} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextFieldElement name={`items.${index}.subtitle`} label="Détails de l'article (facultatif)" disabled={disabled} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <InputPrice name={`items.${index}.price`} label="Prix de l'article" disabled={disabled} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextFieldElement name={`items.${index}.remark`} label="Conditions de l'article (facultatif)" disabled={disabled} fullWidth />
                  </Grid>
                </Grid>
              </Box>
              <Stack direction="column">
                <IconButton disabled={disabled || index === 0} onClick={() => swap(index, index - 1)}>
                  <ArrowUpward />
                </IconButton>
                <IconButton disabled={disabled} onClick={() => remove(index)}>
                  <Delete />
                </IconButton>
                <IconButton disabled={disabled || index === fields.length - 1} onClick={() => swap(index, index + 1)}>
                  <ArrowDownward />
                </IconButton>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      ))}
      <Grid item xs={12}>
        <CreateButton label="Ajouter une ligne" disabled={disabled} onClick={() => append({})} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <SelectTransactionType name="transactionType" disabled={disabled} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <InputPrice name="discount" label="Réduction" disabled={disabled} />
      </Grid>
      <Grid item xs={12}>
        <SwitchElement name="paid" label="Payée" disabled={disabled} />
      </Grid>
      <Grid item xs={12} textAlign="right">
        <Button type="submit" variant="contained" disabled={disabled} startIcon={<Print />}>
          Générer la facture
        </Button>
      </Grid>
    </Grid>
  );
};

interface PdfFrameProps {
  isError: boolean;
  data: SerializedBuffer | undefined;
}

const PdfFrame: React.FC<PdfFrameProps> = ({ isError, data }) => {
  return (
    <Card variant="outlined">
      <PdfContainer pdf={data !== undefined ? deserializeBuffer(data) : undefined} isError={isError} />
    </Card>
  );
};

const defaultValuesFor = (): DeepPartial<z.infer<typeof freeInvoiceSchema>> => ({
  date: new Date(),
  paid: false,
  items: [],
  discount: 0,
});

export default function InvoiceGenerator() {
  const { mutate: generatePdf, data: pdfData, isLoading: isPdfLoading, isError: isPdfError, data } = trpc.pdf.freeInvoice.useMutation();
  return (
    <BackofficeContent
      title="Facture libre"
      icon={<PictureAsPdf />}
    >
      <Stack direction="column" spacing={2}>
        <Alert severity="warning">
          Ce formulaire vous permet de générer une facture avec des champs libres.
          Les factures générées à partir de ce formulaire ne seront pas suivies par l'application, vous pouvez simplement télécharger le document PDF.
          Veuillez remarquer en outre que ces factures utilisent <strong>une autre numérotation</strong> (préfixe "P") que celles générées automatiquement, et dont vous avez l'entière responsabilité.
        </Alert>
        <FormContainer
          defaultValues={defaultValuesFor()}
          onSuccess={(fields) => generatePdf(fields as any)}
          resolver={zodResolver(freeInvoiceSchema)}
        >
          <InvoiceFormFields disabled={isPdfLoading} />
        </FormContainer>
        {pdfData !== undefined && (
          <PdfFrame isError={isPdfError} data={pdfData} />
        )}
      </Stack>
    </BackofficeContent>
  );
}
