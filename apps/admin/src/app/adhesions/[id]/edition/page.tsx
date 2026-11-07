import { MembershipEditPage } from '../../../../features/membership/MembershipEditPage';

const AdhesionEditionPage = async (props: PageProps<'/adhesions/[id]/edition'>) => {
  const { id } = await props.params;

  return <MembershipEditPage id={id} />;
};

export default AdhesionEditionPage;
