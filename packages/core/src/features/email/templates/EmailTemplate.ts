import type { ReactElement } from 'react';

import type { DbTransaction } from '../../../db/db';
import type { EmailType } from '../type/EmailType';

export interface EmailAttachment {
  filename: string;
  file: Buffer;
}

export interface EmailTemplate<Props> {
  type: EmailType;
  subject: (props: Props) => string;
  body: (props: Props) => ReactElement;
  attachments?: (tx: DbTransaction, props: Props) => Promise<EmailAttachment[]>;
}
