import { Fragment, createContext, useCallback, useContext, useState } from 'react';

const RefreshContext = createContext();

export function RefreshProvider({ children }) {
  const [key, setKey] = useState(0);
  const value = useCallback(() => setKey(key + 1), [key, setKey]);
  return (
    <RefreshContext.Provider value={value}>
      <Fragment key={key}>{children}</Fragment>
    </RefreshContext.Provider>
  );
}

export const useRefreshContext = () => useContext(RefreshContext);
