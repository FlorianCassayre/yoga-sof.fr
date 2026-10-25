import { UserPage } from '../../../features/user/UserPage';

const UtilisateurPage = async (props: PageProps<'/utilisateurs/[id]'>) => {
  const { id } = await props.params;

  return <UserPage id={id} />;
};

export default UtilisateurPage;
