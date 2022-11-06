import React from 'react';
import { RichLink } from './RichLink';
import { displayUserName } from '../../lib/common/newDisplay';
import { Person } from '@mui/icons-material';

interface UserLinkProps {
  user: Parameters<typeof displayUserName>[0];
}

export const UserLink: React.FC<UserLinkProps> = ({ user }) => {
  return (
    <RichLink url={{ pathname: '/administration/utilisateurs/[id]', query: { id: user.id } }} icon={<Person />}>
      {displayUserName(user)}
    </RichLink>
  );
};
