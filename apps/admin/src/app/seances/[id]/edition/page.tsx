import { CourseEditPage } from '../../../../features/course/CourseEditPage';

const SeanceEditionPage = async (props: PageProps<'/seances/[id]/edition'>) => {
  const { id } = await props.params;

  return <CourseEditPage id={id} />;
};

export default SeanceEditionPage;
