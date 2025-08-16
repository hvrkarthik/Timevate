import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';

let Notifications: any = null;

// Dynamically import notifications only on supported platforms
if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.warn('Notifications not available:', error);
  }
}

interface NotificationContextType {
  scheduleHourlyReminder: () => Promise<void>;
  scheduleMicroGoalReminder: (title: string, body: string, seconds: number) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    if (Platform.OS !== 'web' && Notifications) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return;
      }
    }
  };

  const scheduleHourlyReminder = async () => {
    if (!Notifications) return;
    
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ Time Check",
          body: "How are you using this precious hour? Make every second count with Timevate!",
          data: { type: 'hourly_reminder' },
        },
        trigger: {
          seconds: 3600,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Error scheduling hourly reminder:', error);
    }
  };

  const scheduleMicroGoalReminder = async (title: string, body: string, seconds: number) => {
    if (!Notifications) return;
    
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'micro_goal' },
        },
        trigger: {
          seconds,
        },
      });
    } catch (error) {
      console.error('Error scheduling micro goal reminder:', error);
    }
  };

  const cancelAllNotifications = async () => {
    if (!Notifications) return;
    
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      scheduleHourlyReminder,
      scheduleMicroGoalReminder,
      cancelAllNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}