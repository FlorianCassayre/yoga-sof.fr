import { usePromiseEffect } from './usePromiseEffect';

export const usePromisesEffect = (createPromises, dependencies) => usePromiseEffect(() => Promise.all(createPromises()), dependencies);
