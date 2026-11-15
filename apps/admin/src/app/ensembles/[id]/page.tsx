import { CourseSuperBundlePage } from '../../../features/courseSuperBundle/CourseSuperBundlePage';

const EnsemblePage = async (props: PageProps<'/ensembles/[id]'>) => {
  const { id } = await props.params;

  return <CourseSuperBundlePage id={Number(id)} />;
};

export default EnsemblePage;
