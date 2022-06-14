// eslint-disable

import { createContext, useContext, useEffect, useRef, useState } from 'react';

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  // Most of the complexity of this component is to enable fade in/out transitions with garbage collection
  const stateRef = useRef();
  const [notificationsMeta, setNotificationsMeta] = useState({ id: 0, notifications: [] });
  stateRef.current = notificationsMeta;
  const deleteNotification = id => {
    const { id: idCounter, notifications } = stateRef.current;
    const tasks = [];
    notifications.forEach(({ id: idOther }) => {
      if (id === idOther) {
        const timeToDisappear = 2 * 1000;
        tasks.push(setTimeout(() => {
          const { id: idCounterCurrent, notifications: notificationsCurrent } = stateRef.current;
          setNotificationsMeta({ id: idCounterCurrent, notifications: notificationsCurrent.filter(({ id: idOther1 }) => id !== idOther1) });
        }, timeToDisappear));
      }
    });
    setNotificationsMeta({
      id: idCounter,
      notifications: notifications
        .map(notification => (notification.id === id ? { ...notification, tasks: [...notification.tasks, ...tasks], hidden: true } : notification)),
    });
  };
  const notify = ({ title, body, variant, icon, delay = 5 }) => {
    const { id, notifications } = stateRef.current;
    const task = setTimeout(() => {
      deleteNotification(id);
    }, delay * 1000);
    const notification = { id, title, body, variant, icon, tasks: [task], mounted: false, hidden: false };
    setNotificationsMeta({ id: id + 1, notifications: [notification, ...notifications] });
  };
  useEffect(() => {
    // Cleanup
    notificationsMeta.notifications.forEach(({ tasks }) => {
      tasks.forEach(task => clearTimeout(task));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const { id, notifications } = notificationsMeta;
    if (notifications.some(({ mounted }) => !mounted)) {
      setNotificationsMeta({ id, notifications: notifications.map(notification => ({ ...notification, mounted: true })) });
    }
  }, [notificationsMeta]);
  const value = { notify, deleteNotification, notifications: stateRef.current.notifications }; // eslint-disable-line react/jsx-no-constructed-context-values
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotificationsContext = () => useContext(NotificationsContext);