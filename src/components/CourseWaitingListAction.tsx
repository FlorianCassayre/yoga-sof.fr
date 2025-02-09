import React, { useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { trpc } from '../common/trpc';
import { GridActionsCellItemTooltip } from './GridActionsCellItemTooltip';
import { NotificationAdd, NotificationsActive } from '@mui/icons-material';

interface CourseWaitingListActionsProps {
  userId: number;
  courseId: number;
}

export const CourseWaitingListAction: React.FC<CourseWaitingListActionsProps> = ({ userId, courseId }) => {
  const { enqueueSnackbar } = useSnackbar();
  const trpcClient = trpc.useContext();
  const { isFetching: isSubscriptionsFetching, data: subscriptions } = trpc.self.findAllWaitingListSubscriptions.useQuery({ userId });
  const invalidateSubscriptions = () => trpcClient.self.findAllWaitingListSubscriptions.invalidate();
  const { isLoading: isSubscribeLoading, mutate: subscribe } = trpc.self.subscribeWaitingList.useMutation({
    onSuccess: () => {
      enqueueSnackbar(`Vous serez notifié(e) si une place se libère pour cette séance`, { variant: 'success' });
      return invalidateSubscriptions();
    },
    onError: () => enqueueSnackbar(`Impossible de vous inscrire sur la liste d'attente pour cette séance`, { variant: 'error' })
  });
  const { isLoading: isUnsubscribeLoading, mutate: unsubscribe } = trpc.self.unsubscribeWaitingList.useMutation({
    onSuccess: () => {
      enqueueSnackbar(`Vous ne serez plus notifié(e) si une place se libère pour cette séance`, { variant: 'success' });
      return invalidateSubscriptions();
    },
    onError: () => enqueueSnackbar(`Impossible de vous désinscrire de la liste d'attente pour cette séance`, { variant: 'error' })
  });
  const isApplicable = true;
  const isSubscribed = useMemo(() => !!subscriptions && subscriptions.some(({ id }) => id === courseId), [subscriptions, courseId]);
  const isLoading = isSubscriptionsFetching || isSubscribeLoading || isUnsubscribeLoading;
  return !isApplicable || !subscriptions ? null : !isSubscribed ? (
    <GridActionsCellItemTooltip
      icon={<NotificationAdd />}
      label="M'envoyer un e-mail si une place se libère"
      disabled={isLoading}
      onClick={() => subscribe({ userId, courseId })}
    />
  ) : (
    <GridActionsCellItemTooltip
      icon={<NotificationsActive />}
      label="Me retirer de la liste d'attente"
      color="success"
      disabled={isLoading}
      onClick={() => unsubscribe({ userId, courseId })}
    />
  );
};
