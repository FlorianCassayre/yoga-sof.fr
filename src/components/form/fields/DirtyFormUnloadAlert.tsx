import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFormState } from 'react-hook-form-mui';

interface DirtyFormUnloadAlertProps {
  message: string;
  condition?: boolean; // An additional condition that can be used at will
  disabled?: boolean;
}

export const DirtyFormUnloadAlert: React.FunctionComponent<DirtyFormUnloadAlertProps> = ({ message, condition, disabled }) => {
  const router = useRouter();
  const { isDirty: isFormDirty } = useFormState();

  const isDirty = !disabled && (isFormDirty || !!condition);

  // From: https://github.com/vercel/next.js/issues/2694#issuecomment-732990201
  useEffect(() => {
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      return (e.returnValue = message);
    };
    const handleBrowseAway = () => {
      if (!isDirty) return;
      if (window.confirm(message)) return;
      router.events.emit('routeChangeError');
      if (router.asPath !== window.location.pathname) {
        window.history.pushState('', '', router.asPath)
      }
      throw 'abort'; // Abort router change
    };
    window.addEventListener('beforeunload', handleWindowClose);
    router.events.on('routeChangeStart', handleBrowseAway);
    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
      router.events.off('routeChangeStart', handleBrowseAway);
    };
  }, [router, isDirty]);

  return null;
};
