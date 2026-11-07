import { CardPage } from '../../../features/card/CardPage';

const CartePage = async (props: PageProps<'/cartes/[id]'>) => {
  const { id } = await props.params;

  return <CardPage id={Number(id)} />;
};

export default CartePage;
