import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

export const createPdf = (definition: TDocumentDefinitions): Promise<Buffer> => {
  const printer = new PdfPrinter(pdfFonts);
  const document = printer.createPdfKitDocument(definition);
  return new Promise((resolve) => {
    const buffers: Uint8Array[] = [];
    document.on('data', (d) => buffers.push(d));
    document.on('end', () => {
      const buffer = Buffer.concat(buffers);
      resolve(buffer);
    });
    document.end();
  });
};

const pdfFonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  },
};

export type PdfTemplate<T extends object> = (props: T) => TDocumentDefinitions;
