'use client';

import { Mail } from 'lucide-react';

import { Link } from '../../components/link/Link';

interface EmailLinkProps {
  email: { id: number; subject: string };
}

export const EmailLink = ({ email: { id, subject } }: EmailLinkProps) => (
  <Link href={`/emails/${id}`} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
    <Mail size={16} />
    {subject}
  </Link>
);
