import { Fragment, createContext, useContext, useState } from 'react';

const RefreshContext = createContext();

export function RefreshProvider({ children }) {
  const [key, setKey] = useState(0);
  const value = () => setKey(key + 1);
  return (
    <RefreshContext.Provider value={value}>
      <Fragment key={key}>
        {children}
      </Fragment>
    </RefreshContext.Provider>
  );
}

export const useRefreshContext = () => useContext(RefreshContext);
