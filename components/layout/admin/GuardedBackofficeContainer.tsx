import React from 'react';
import { NewAuthGuard } from '../../NewAuthGuard';
import { UserType } from '../../../lib/common/all';
import { BackofficeContainer } from './BackofficeContainer';

interface GuardedBackofficeContainerProps {
  children: React.ReactNode;
}

export const GuardedBackofficeContainer: React.FC<GuardedBackofficeContainerProps> = ({ children }) => {
  return (
    <NewAuthGuard allowedUserTypes={[UserType.Admin]}>
      <BackofficeContainer>
        {children}
      </BackofficeContainer>
    </NewAuthGuard>
  );
}
