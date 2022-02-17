import { useCallback } from 'react';
import { usePromiseReducer } from './usePromiseReducer';

export const usePromiseCallback = (createPromise, dependencies) => {
  const [state, { setStateInitiated, setStateSuccess, setStateFailure }] = usePromiseReducer(false);

  const callback = useCallback((...args) => {
    let didCancel = false;

    setStateInitiated();

    createPromise(...args)
      .then((result) => !didCancel && setStateSuccess(result))
      .catch((error) => !didCancel && setStateFailure(error));

    return () => {
      didCancel = true;
    };
  }, dependencies);

  return [state, callback];
};
