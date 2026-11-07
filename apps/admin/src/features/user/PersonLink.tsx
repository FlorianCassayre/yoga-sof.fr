import { User } from 'lucide-react';

import { Link } from '../../components/link/Link';

interface PersonLinkProps {
  person: { userId: string; userName: string | null };
}

export const PersonLink = ({ person }: PersonLinkProps) => (
  <Link
    href={`/utilisateurs/${person.userId}`}
    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, verticalAlign: 'middle' }}
  >
    <User size={16} />
    {person.userName ?? '-'}
  </Link>
);
