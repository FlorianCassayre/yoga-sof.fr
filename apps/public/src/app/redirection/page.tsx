import { roleService, withTransaction } from '@yoga-sof/core/server';
import { auth } from '@yoga-sof/ui/auth';
import { redirect } from 'next/navigation';

import {
  adminRedirectRoot,
  isAdminRedirectTarget,
  resolveRedirectTarget,
} from '../../features/auth/redirectTarget';

const RedirectionPage = async (props: PageProps<'/redirection'>) => {
  const { r } = await props.searchParams;
  const raw = Array.isArray(r) ? r[0] : r;
  const target = resolveRedirectTarget(raw);

  const id = (await auth())?.user?.id;

  if (id && !isAdminRedirectTarget(target)) {
    const role = await withTransaction((tx) => roleService.getUserRole(id, tx), {
      readOnly: true,
    });

    if (role) {
      redirect(adminRedirectRoot());
    }
  }

  return redirect(target);
};

export default RedirectionPage;
