import { CoursePage } from '../../../features/course/CoursePage';

const SeancePage = async (props: PageProps<'/seances/[id]'>) => {
  const { id } = await props.params;

  return <CoursePage id={id} />;
};

export default SeancePage;
