import { api } from '../../server/api';

export const useCurrentUser = () => {
  const { data } = api.user.me.useQuery();

  return data ?? null;
};
