import { CourseBundleEditPage } from '../../../../features/courseBundle/CourseBundleEditPage';

const LotEditionPage = async (props: PageProps<'/lots/[id]/edition'>) => {
  const { id } = await props.params;

  return <CourseBundleEditPage id={Number(id)} />;
};

export default LotEditionPage;
