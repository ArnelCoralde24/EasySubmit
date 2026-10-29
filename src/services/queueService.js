import { LocalNotifications } from '@capacitor/local-notifications';

const QUEUE_STORAGE_KEY = 'easysubmit_offline_queue';

export const triggerLocalNotification = async (title, body) => {
  try {
    await LocalNotifications.requestPermissions();
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Math.floor(Math.random() * 10000),
          schedule: { at: new Date(Date.now() + 100) },
          sound: null,
          attachments: null,
          actionTypeId: '',
          extra: null
        }
      ]
    });
  } catch (err) {
    console.warn('Notification error:', err);
  }
};

export const getOfflineQueue = () => {
  try {
    const saved = localStorage.getItem(QUEUE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const addToOfflineQueue = (submissionPayload) => {
  const queue = getOfflineQueue();
  queue.push({ id: Date.now(), ...submissionPayload });
  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
};

export const clearOfflineQueue = () => {
  localStorage.removeItem(QUEUE_STORAGE_KEY);
};