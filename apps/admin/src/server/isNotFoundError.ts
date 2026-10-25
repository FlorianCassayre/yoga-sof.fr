export const isNotFoundError = (error: unknown): boolean => {
  const data = (error as { data?: { code?: string; serviceError?: boolean } } | null | undefined)
    ?.data;

  return data?.serviceError === true || data?.code === 'NOT_FOUND';
};
