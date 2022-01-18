import { useEffect, useReducer, useState } from 'react';
import { isErrorCode } from '../components';

// Inspired by: https://www.robinwieruch.de/react-hooks-fetch-data/

const FETCH_INITIATED = 'FETCH_INITIATED';
const FETCH_SUCCESS = 'FETCH_SUCCESS';
const FETCH_FAILURE = 'FETCH_FAILURE';

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case FETCH_INITIATED:
      return {
        isLoading: true,
        isError: false,
        data: state.data,
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

export const useDataApi = (url, initialParams) => {
  const [params, setParams] = useState(initialParams);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: true,
    isError: false,
    data: null,
    error: null,
  });

  useEffect(() => {
    let didCancel = false;

    const fetchData = async () => {
      dispatch({ type: FETCH_INITIATED });

      try {
        const urlWithParams = params ? url + '?' + new URLSearchParams(params) : url;
        const json = await fetch(urlWithParams).then(response => {
          if(isErrorCode(response.status)) {
            return response.json().then(json => {
              throw new Error(json.error);
            });
          }
          return response.json();
        });

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
