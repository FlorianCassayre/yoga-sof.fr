import { MembershipPricePage } from '../../../../../features/membership/price/MembershipPricePage';

const TarifEditionPage = async (props: PageProps<'/parametres/tarifs/[id]/edition'>) => {
  const { id } = await props.params;

  return <MembershipPricePage id={Number(id)} />;
};

export default TarifEditionPage;
