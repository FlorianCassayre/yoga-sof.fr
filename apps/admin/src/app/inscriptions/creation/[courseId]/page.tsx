import { CourseUserRegistrationCreatePage } from '../../../../features/courseUserRegistration/CourseUserRegistrationCreatePage';

interface CourseUserRegistrationCreationPageProps {
  params: Promise<{ courseId: string }>;
}

const CourseUserRegistrationCreationPage = async ({
  params,
}: CourseUserRegistrationCreationPageProps) => {
  const { courseId } = await params;

  return <CourseUserRegistrationCreatePage courseId={Number(courseId)} />;
};

export default CourseUserRegistrationCreationPage;
