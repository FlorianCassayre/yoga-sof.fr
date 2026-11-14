import { z } from 'zod';

import { RegistrationCreatePage } from '../../../features/registration/RegistrationCreatePage';

const registrationPresetsSchema = z.object({
  courseId: z.coerce.number().int().positive().optional(),
  courseBundleId: z.coerce.number().int().positive().optional(),
  userId: z.string().uuid().optional(),
});

const RegistrationCreationPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const presets = registrationPresetsSchema.safeParse(await searchParams);
  const data = presets.success ? presets.data : undefined;

  return (
    <RegistrationCreatePage
      courseId={data?.courseId}
      courseBundleId={data?.courseBundleId}
      userId={data?.userId}
    />
  );
};

export default RegistrationCreationPage;
