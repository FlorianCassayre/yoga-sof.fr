import React from 'react';
import { AuthGuard } from '../../AuthGuard';
import { BackofficeContainer } from './BackofficeContainer';
import { Permissions } from '../../../common/role';

interface GuardedBackofficeContainerProps {
  children: React.ReactNode;
}

export const GuardedBackofficeContainer: React.FC<GuardedBackofficeContainerProps> = ({ children }) => {
  return (
    <AuthGuard allowedRoles={Permissions.ReadBackoffice}>
      <BackofficeContainer>
        {children}
      </BackofficeContainer>
    </AuthGuard>
  );
}
