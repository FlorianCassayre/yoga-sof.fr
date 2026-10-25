import { redirect } from 'next/navigation';

import { resolveRedirectTarget } from '../../features/auth/redirectTarget';

const RedirectionPage = async (props: PageProps<'/redirection'>) => {
  const { r } = await props.searchParams;
  const raw = Array.isArray(r) ? r[0] : r;

  return redirect(resolveRedirectTarget(raw));
};

export default RedirectionPage;
