import { useEffect, useRef } from 'react';
import { usePromiseReducer } from './usePromiseReducer';

export const usePromiseEffect = (createPromise, dependencies) => {
  const isFirstUpdate = useRef(true);

  const [state, { setStateInitiated, setStateSuccess, setStateFailure }] = usePromiseReducer(true);

  useEffect(() => {
    let didCancel = false;

    if (createPromise == null) {
      return;
    }

    if (!isFirstUpdate.current) {
      isFirstUpdate.current = false;
      setStateInitiated();
    }

    createPromise()
      .then((result) => !didCancel && setStateSuccess(result))
      .catch((error) => !didCancel && setStateFailure(error));

    return () => {
      didCancel = true;
    };
  }, dependencies);

  return state;
};
