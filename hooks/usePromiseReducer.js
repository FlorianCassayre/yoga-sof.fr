import { useReducer } from 'react';

const PROMISE_INITIATED = 'PROMISE_INITIATED';
const PROMISE_SUCCESS = 'PROMISE_SUCCESS';
const PROMISE_FAILURE = 'PROMISE_FAILURE';

const initialState = {
  isLoading: false,
  isError: false,
  data: null,
  error: null,
};

const promiseReducer = (state, action) => {
  switch (action.type) {
    case PROMISE_INITIATED:
      return {
        isLoading: true,
        isError: false,
        data: state.data,
        error: null,
      };
    case PROMISE_SUCCESS:
      return {
        isLoading: false,
        isError: false,
        data: action.data,
        error: null,
      };
    case PROMISE_FAILURE:
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

const setStateInitiated = () => (dispatch) => dispatch({ type: PROMISE_INITIATED });
const setStateSuccess = (data) => (dispatch) => dispatch({ type: PROMISE_SUCCESS, data });
const setStateFailure = (error) => (dispatch) => dispatch({ type: PROMISE_FAILURE, error });

export const usePromiseReducer = (isInitiallyLoading) => {
  const [state, dispatch] = useReducer(promiseReducer, { ...initialState, isLoading: isInitiallyLoading });

  return [
    state,
    {
      setStateInitiated: () => setStateInitiated()(dispatch),
      setStateSuccess: (data) => setStateSuccess(data)(dispatch),
      setStateFailure: (error) => setStateFailure(error)(dispatch),
    },
  ];
};
