export interface MicroWin {
  id: string;
  title: string;
  duration: number;
  completedAt: Date;
  category: string;
}

export interface TimeSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
}

export interface TimeData {
  totalActiveTime: number;
  sessions: number;
  lastActive: Date | null;
}

export interface Challenge {
  id: string;
  title: string;
  duration: number;
  description: string;
  category: string;
}

export interface TimeImpactItem {
  title: string;
  description: string;
  value: string;
  impact: string;
  category: string;
  color: string;
}

export interface NotificationSettings {
  hourlyReminders: boolean;
  microGoalReminders: boolean;
  dailyReports: boolean;
  motivationalQuotes: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  notifications: NotificationSettings;
}