const DAY_MS = 24 * 60 * 60 * 1000;

export const membershipSeasonPeriod = ({
  year,
  month,
}: {
  year: number;
  month: number;
}): { startsAt: string; endsAt: string } => {
  const startsAt = new Date(Date.UTC(year, month - 1, 1));
  const endsAt = new Date(Date.UTC(year + 1, month - 1, 1) - DAY_MS);

  return {
    startsAt: startsAt.toISOString().slice(0, 10),
    endsAt: endsAt.toISOString().slice(0, 10),
  };
};
