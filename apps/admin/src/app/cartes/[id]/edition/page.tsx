import { CardEditPage } from '../../../../features/card/CardEditPage';

const CarteEditionPage = async (props: PageProps<'/cartes/[id]/edition'>) => {
  const { id } = await props.params;

  return <CardEditPage id={id} />;
};

export default CarteEditionPage;
