'use client';

import { Link } from '../../components/link/Link';

interface PersonLinkProps {
  person: { userId: string; userName: string | null };
}

export const PersonLink = ({ person }: PersonLinkProps) => (
  <Link href={`/utilisateurs/${person.userId}`}>{person.userName ?? '-'}</Link>
);
