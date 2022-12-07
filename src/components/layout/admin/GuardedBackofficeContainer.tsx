import React from 'react';
import { AuthGuard } from '../../AuthGuard';
import { UserType } from '../../../common/all';
import { BackofficeContainer } from './BackofficeContainer';

interface GuardedBackofficeContainerProps {
  children: React.ReactNode;
}

export const GuardedBackofficeContainer: React.FC<GuardedBackofficeContainerProps> = ({ children }) => {
  return (
    <AuthGuard allowedUserTypes={[UserType.Admin]}>
      <BackofficeContainer>
        {children}
      </BackofficeContainer>
    </AuthGuard>
  );
}
