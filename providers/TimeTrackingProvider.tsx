import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MicroWin {
  id: string;
  title: string;
  duration: number;
  completedAt: Date;
  category: string;
}

interface TimeSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
}

interface TimeData {
  totalActiveTime: number;
  sessions: number;
  lastActive: Date | null;
}

interface TimeTrackingContextType {
  timeData: TimeData;
  microWins: MicroWin[];
  currentSession: TimeSession | null;
  startSession: () => void;
  stopSession: () => void;
  addMicroWin: (win: MicroWin) => void;
  getTimeSpentToday: () => TimeData;
  getWeeklyStats: () => {
    totalWins: number;
    totalTime: number;
    averageDaily: number;
  };
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TIME_DATA: 'timevate_time_data',
  MICRO_WINS: 'timevate_micro_wins',
  CURRENT_SESSION: 'timevate_current_session',
};

export function TimeTrackingProvider({ children }: { children: ReactNode }) {
  const [timeData, setTimeData] = useState<TimeData>({
    totalActiveTime: 0,
    sessions: 0,
    lastActive: null,
  });
  const [microWins, setMicroWins] = useState<MicroWin[]>([]);
  const [currentSession, setCurrentSession] = useState<TimeSession | null>(null);

  useEffect(() => {
    loadStoredData();
  }, []);

  useEffect(() => {
    saveData();
  }, [timeData, microWins, currentSession]);

  const loadStoredData = async () => {
    try {
      const [storedTimeData, storedWins, storedSession] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TIME_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.MICRO_WINS),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_SESSION),
      ]);

      if (storedTimeData) {
        const parsed = JSON.parse(storedTimeData);
        setTimeData({
          ...parsed,
          lastActive: parsed.lastActive ? new Date(parsed.lastActive) : null,
        });
      }

      if (storedWins) {
        const parsed = JSON.parse(storedWins);
        setMicroWins(parsed.map((win: any) => ({
          ...win,
          completedAt: new Date(win.completedAt),
        })));
      }

      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        if (parsed && parsed.startTime) {
          setCurrentSession({
            ...parsed,
            startTime: new Date(parsed.startTime),
            endTime: parsed.endTime ? new Date(parsed.endTime) : undefined,
          });
        }
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  const saveData = async () => {
    try {
      // Save data sequentially to avoid race conditions
      await AsyncStorage.setItem(STORAGE_KEYS.TIME_DATA, JSON.stringify(timeData));
      await AsyncStorage.setItem(STORAGE_KEYS.MICRO_WINS, JSON.stringify(microWins));
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(currentSession));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const startSession = () => {
    const newSession: TimeSession = {
      id: Date.now().toString(),
      startTime: new Date(),
      duration: 0,
    };
    setCurrentSession(newSession);
  };

  const stopSession = () => {
    if (currentSession) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 1000);
      
      setTimeData(prev => ({
        totalActiveTime: prev.totalActiveTime + duration,
        sessions: prev.sessions + 1,
        lastActive: endTime,
      }));

      setCurrentSession(null);
    }
  };

  const addMicroWin = (win: MicroWin) => {
    setMicroWins(prev => [win, ...prev]);
  };

  const getTimeSpentToday = (): TimeData => {
    const today = new Date().toDateString();
    const todayWins = microWins.filter(win => 
      win.completedAt.toDateString() === today
    );
    
    const todayTime = todayWins.reduce((total, win) => total + win.duration, 0);
    
    return {
      totalActiveTime: todayTime + (timeData.lastActive?.toDateString() === today ? timeData.totalActiveTime : 0),
      sessions: todayWins.length,
      lastActive: timeData.lastActive?.toDateString() === today ? timeData.lastActive : null,
    };
  };

  const getWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyWins = microWins.filter(win => win.completedAt >= weekAgo);
    const totalTime = weeklyWins.reduce((total, win) => total + win.duration, 0);
    
    return {
      totalWins: weeklyWins.length,
      totalTime,
      averageDaily: Math.round(weeklyWins.length / 7),
    };
  };

  return (
    <TimeTrackingContext.Provider value={{
      timeData,
      microWins,
      currentSession,
      startSession,
      stopSession,
      addMicroWin,
      getTimeSpentToday,
      getWeeklyStats,
    }}>
      {children}
    </TimeTrackingContext.Provider>
  );
}

export function useTimeTracking() {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
  }
  return context;
}