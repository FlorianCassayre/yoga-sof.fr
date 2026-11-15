import { Link } from '../../components/link/Link';
import { CourseSuperBundleIcon } from './CourseSuperBundleIcon';

interface CourseSuperBundleLinkProps {
  superBundle: {
    id: number;
    label: string;
  };
}

export const CourseSuperBundleLink = ({ superBundle }: CourseSuperBundleLinkProps) => (
  <Link
    href={`/ensembles/${superBundle.id}`}
    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, verticalAlign: 'middle' }}
  >
    <CourseSuperBundleIcon size={16} />
    {superBundle.label}
  </Link>
);
