import { CourseSuperBundleEditPage } from '../../../../features/courseSuperBundle/CourseSuperBundleEditPage';

const EnsembleEditPage = async (props: PageProps<'/ensembles/[id]/edition'>) => {
  const { id } = await props.params;

  return <CourseSuperBundleEditPage id={Number(id)} />;
};

export default EnsembleEditPage;
