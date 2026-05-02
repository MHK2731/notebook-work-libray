const storageKey = 'studyPlannerSlots';
const pendingTimeouts = {};

export function loadSlots() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch (error) {
    console.warn('Could not read study planner slots:', error);
    return [];
  }
}

export function saveSlots(slots) {
  localStorage.setItem(storageKey, JSON.stringify(slots));
}

export function formatDateTime(value) {
  const date = new Date(value);
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

export function scheduleSlotNotification(slot, onNotify) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const time = new Date(slot.datetime).getTime();
  const now = Date.now();
  const delay = time - now;

  if (delay <= 0) {
    return;
  }

  clearScheduledNotification(slot.id);

  const timeoutId = setTimeout(() => {
    new Notification(`Study Reminder: ${slot.subject}`, {
      body: `${slot.title} at ${formatDateTime(slot.datetime)}`,
      icon: '/images/icon.png',
    });
    if (typeof onNotify === 'function') {
      onNotify(slot.id);
    }
  }, delay);

  pendingTimeouts[slot.id] = timeoutId;
}

export function clearScheduledNotification(slotId) {
  if (pendingTimeouts[slotId]) {
    clearTimeout(pendingTimeouts[slotId]);
    delete pendingTimeouts[slotId];
  }
}

export function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return Promise.reject(new Error('This browser does not support notifications.'));
  }
  return Notification.requestPermission();
}
