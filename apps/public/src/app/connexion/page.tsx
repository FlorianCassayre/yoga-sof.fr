import { AuthPage } from '../../features/auth/AuthPage';

const ConnexionPage = async (props: PageProps<'/connexion'>) => {
  const { r } = await props.searchParams;
  const raw = Array.isArray(r) ? r[0] : r;

  return <AuthPage r={raw} />;
};

export default ConnexionPage;
