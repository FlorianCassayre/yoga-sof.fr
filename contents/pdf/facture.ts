import { PdfTemplate } from '../../src/server/pdf';
import { formatDateDDsMMsYYYY } from '../../src/common/date';
import { TransactionType } from '@prisma/client';
import { TransactionTypeNames } from '../../src/common/transaction';

interface FactureProps {
  id: number;
  date: Date;
  paid: boolean;
  transmitter: {
    organization: string;
    website: string;
    fullname: string;
    address: [string, string];
    phone: string;
    email: string;
  },
  receiver: {
    fullname: string;
    email: string;
  },
  items: {
    title: string;
    subtitle?: string;
    price: number;
    remark: string;
  }[];
  subtotal: number;
  total: number;
  transactionType: TransactionType | null;
  details: string[];
  insurance: string;
}

export const facturePdf: PdfTemplate<FactureProps> = (p) => ({
  content: [
    {
      columns: [
        {
          width: '*',
          columns: [[
            {
              fontSize: 24,
              bold: true,
              text: p.transmitter.organization,
              margin: [0, 0, 0, 5],
            },
            p.transmitter.website,
          ]],
        },
        {
          width: 'auto',
          alignment: 'right',
          columns: [[
            { text: `Facture n° ${p.id}`, bold: true, marginBottom: 5 },
            `Date d'émission : ${formatDateDDsMMsYYYY(p.date)}`,
          ]],
        }
      ],
      columnGap: 10,
    },
    {
      columns: [
        [
          'Émetteur :',
          {
            width: 'auto',
            table: {
              headerRows: 1,
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      p.transmitter.organization,
                      p.transmitter.fullname,
                      ...p.transmitter.address,
                      p.transmitter.phone,
                      p.transmitter.email,
                    ].map(s => ({ text: s, margin: [0, 1] })),
                    //fillColor: '#eee',
                    //border: [false, false, false, false],
                  }
                ]
              ],
            },
            marginTop: 5,
          },
        ],
        [
          'Adressée à :',
          {
            width: 'auto',
            table: {
              headerRows: 1,
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      p.receiver.fullname,
                      p.receiver.email,
                    ].map(s => ({ text: s, margin: [0, 1] })),
                    //fillColor: '#eee',
                    //border: [false, false, false, false],
                  }
                ]
              ],
            },
            marginTop: 5,
          },
        ],
      ],
      columnGap: 25,
      margin: [0, 25, 0, 25],
    },
    {
      layout: 'lightHorizontalLines',
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 'auto'],
        body: [
          [
            { text: 'Article', bold: true },
            { text: 'Validité', bold: true },
            { text: 'Prix', bold: true },
          ],
          ...p.items.map((i) => [
            {
              stack: [
                i.title,
                ...(i.subtitle ? [{ text: i.subtitle, color: 'gray', margin: [0, 5, 0, 0] }] : []),
              ],
              margin: [0, 5],
            },
            { text: i.remark, margin: [0, 5] },
            { text: `${i.price} €`, alignment: 'right', margin: [0, 5] },
          ]),
        ],
      },
    },
    {
      layout: 'lightHorizontalLines',
      table: {
        headerRows: 0,
        widths: ['*'],
        body: [[{ text: `Sous-total HT : ${p.subtotal} €`, alignment: 'right' }]],
      },
      margin: [0, 15, 0, 0],
    },
    {
      layout: 'lightHorizontalLines',
      table: {
        headerRows: 0,
        widths: ['*'],
        body: [[{ text: `Remise : ${p.subtotal - p.total} €`, alignment: 'right' }]],
      },
    },
    {
      layout: 'lightHorizontalLines',
      fillColor: '#eee',
      table: {
        headerRows: 1,
        widths: ['*'],
        body: [
          [{ text: ['Total HT : ', { text: `${p.total} €`, bold: true }], alignment: 'right' }]
        ],
      },
      margin: [0, 0, 0, 10],
    },
    {
      italic: true,
      alignment: 'right',
      text: 'TVA non applicable, article 293B du code général des impôts',
    },
    {
      columns: [[
        ...(p.paid ? [{ text: [{ text: 'Facture acquittée', bold: true, decoration: 'underline' } as any, ' ', `(voir date d'émission)`], marginBottom: 5 }] : []),
        ...(p.transactionType !== null ? [`Moyen de paiement : ${TransactionTypeNames[p.transactionType]}`] : []),
      ]],
      margin: [0, 15, 0, 0]
    },
    ...(p.details.length > 0 ? [{
      stack: p.details.map(d => ({ text: d, marginTop: 5 })),
      fontSize: 8,
      marginTop: 12,
    }] : []),
  ],
  ...(p.paid ? {
    watermark: {
      text: 'PAYÉE',
      color: 'red',
      opacity: 0.1,
      bold: true,
      fontSize: 120,
    },
  } : {}),
  info: {
    title: `Facture du ${formatDateDDsMMsYYYY(p.date)} adressée à ${p.receiver.fullname} - Yoga Sof`,
    author: p.transmitter.organization,
    creator: p.transmitter.organization,
    producer: p.transmitter.organization,
    creationDate: p.date,
  },
  permissions: {
    modifying: false,
    copying: false,
    annotating: false,
    fillingForms: false,
    contentAccessibility: true,
    documentAssembly: true
  },
  footer: (currentPage, pageCount) => ({
    margin: [40, 0],
    columns: [
      `${p.transmitter.organization} - ${p.insurance}`,
      { text: `${currentPage} / ${pageCount}`, alignment: 'right' },
    ],
  }),
  pageSize: 'A4',
  defaultStyle: {
    font: 'Helvetica'
  },
});
