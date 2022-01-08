// Inspired by: https://www.thearmchaircritic.org/tech-journal/prevent-useeffects-callback-firing-during-initial-render

import { useEffect, useRef } from 'react';

export const useNonInitialEffect = (effect, deps) => {
  const initialRender = useRef(true);
  useEffect(() => {
    let effectReturns = () => {};
    if (initialRender.current) {
      initialRender.current = false;
    } else {
      effectReturns = effect();
    }
    if (effectReturns && typeof effectReturns === "function") {
      return effectReturns;
    }
  }, deps);
};
