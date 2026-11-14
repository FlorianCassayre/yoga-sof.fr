import { Link } from '../../components/link/Link';
import { CourseBundleIcon } from './CourseBundleIcon';

interface CourseBundleLinkProps {
  bundle: {
    id: number;
    label: string;
  };
}

export const CourseBundleLink = ({ bundle }: CourseBundleLinkProps) => (
  <Link
    href={`/lots/${bundle.id}`}
    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, verticalAlign: 'middle' }}
  >
    <CourseBundleIcon size={16} />
    {bundle.label}
  </Link>
);
