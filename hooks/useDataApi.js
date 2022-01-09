import { useEffect, useReducer, useState } from 'react';

// Inspired by: https://www.robinwieruch.de/react-hooks-fetch-data/

const FETCH_INIT = 'FETCH_INIT';
const FETCH_SUCCESS = 'FETCH_SUCCESS';
const FETCH_FAILURE = 'FETCH_FAILURE';

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case FETCH_INIT:
      return {
        isLoading: true,
        isError: false,
        data: null,
        error: null,
      };
    case FETCH_SUCCESS:
      return {
        isLoading: false,
        isError: false,
        data: action.payload,
        error: null,
      };
    case FETCH_FAILURE:
      return {
        isLoading: false,
        isError: true,
        data: null,
        error: action.error,
      };
    default:
      throw new Error();
  }
};

export const useDataApi = (url, initialParams, initialData = null) => {
  const [params, setParams] = useState(initialParams);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: true,
    isError: false,
    data: initialData,
    error: null,
  });

  useEffect(() => {
    let didCancel = false;

    const fetchData = async () => {
      dispatch({ type: FETCH_INIT });
      try {
        const urlWithParams = params ? url + '?' + new URLSearchParams(params) : url;
        const json = await fetch(urlWithParams).then(result => result.json());

        if (!didCancel) {
          dispatch({ type: FETCH_SUCCESS, payload: json });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: FETCH_FAILURE, error });
        }
      }
    };

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [params]);

  return [state, setParams];
};
