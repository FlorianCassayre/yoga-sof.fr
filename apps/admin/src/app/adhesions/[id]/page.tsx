import { MembershipPage } from '../../../features/membership/MembershipPage';

const AdhesionPage = async (props: PageProps<'/adhesions/[id]'>) => {
  const { id } = await props.params;

  return <MembershipPage id={Number(id)} />;
};

export default AdhesionPage;
