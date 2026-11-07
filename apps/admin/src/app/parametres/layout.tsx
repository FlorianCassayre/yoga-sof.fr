import { roleService, withTransaction } from '@yoga-sof/core/server';
import { auth } from '@yoga-sof/ui/auth';
import { redirect } from 'next/navigation';

const ParametresLayout = async ({ children }: LayoutProps<'/parametres'>) => {
  const id = (await auth())?.user?.id;
  const allowed = id
    ? await withTransaction((tx) => roleService.hasPermission(id, 'manageSettings', tx), {
        readOnly: true,
      })
    : false;

  if (!allowed) {
    redirect('/');
  }

  return children;
};

export default ParametresLayout;
