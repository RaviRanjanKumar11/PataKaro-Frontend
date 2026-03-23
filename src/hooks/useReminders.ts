import { useState, useEffect } from 'react';
import { Reminder } from '../types';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('smart_info_reminders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('smart_info_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const addReminder = (reminder: Omit<Reminder, 'id' | 'createdAt'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
    };
    setReminders((prev) => [newReminder, ...prev]);
  };

  const removeReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const clearReminders = () => {
    setReminders([]);
  };

  return { reminders, addReminder, removeReminder, clearReminders };
}
