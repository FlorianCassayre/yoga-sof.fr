import { CourseBundlePage } from '../../../features/courseBundle/CourseBundlePage';

const LotPage = async (props: PageProps<'/lots/[id]'>) => {
  const { id } = await props.params;

  return <CourseBundlePage id={Number(id)} />;
};

export default LotPage;
