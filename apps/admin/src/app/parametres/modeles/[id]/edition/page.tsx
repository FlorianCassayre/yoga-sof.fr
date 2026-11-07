import { CardTemplatePage } from '../../../../../features/card/template/CardTemplatePage';

const ModeleEditionPage = async (props: PageProps<'/parametres/modeles/[id]/edition'>) => {
  const { id } = await props.params;

  return <CardTemplatePage id={Number(id)} />;
};

export default ModeleEditionPage;
