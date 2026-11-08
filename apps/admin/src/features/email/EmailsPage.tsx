'use client';

import { PageLayout } from '../../components/page/PageLayout';
import { EmailGrid } from './EmailGrid';
import { EmailIcon } from './EmailIcon';

export const EmailsPage = () => {
  return (
    <PageLayout icon={EmailIcon} title="E-mails">
      <EmailGrid />
    </PageLayout>
  );
};
