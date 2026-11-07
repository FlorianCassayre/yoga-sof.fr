import { z } from 'zod';

import { CourseUserRegistrationCreatePage } from '../../../features/courseUserRegistration/CourseUserRegistrationCreatePage';

const registrationPresetsSchema = z.object({
  courseId: z.coerce.number().int().positive().optional(),
  userId: z.string().uuid().optional(),
});

const CourseUserRegistrationCreationPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const presets = registrationPresetsSchema.safeParse(await searchParams);

  return (
    <CourseUserRegistrationCreatePage
      courseId={presets.success ? presets.data.courseId : undefined}
      userId={presets.success ? presets.data.userId : undefined}
    />
  );
};

export default CourseUserRegistrationCreationPage;
