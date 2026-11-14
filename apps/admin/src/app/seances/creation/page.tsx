import { z } from 'zod';

import { CourseBatchCreatePage } from '../../../features/course/CourseBatchCreatePage';

const seanceCreationPresetsSchema = z.object({
  bundleId: z.coerce.number().int().positive().optional(),
});

const SeanceCreationPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const presets = seanceCreationPresetsSchema.safeParse(await searchParams);

  return <CourseBatchCreatePage bundleId={presets.success ? presets.data.bundleId : undefined} />;
};

export default SeanceCreationPage;
