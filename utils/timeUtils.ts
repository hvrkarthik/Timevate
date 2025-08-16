export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

export const getMotivationalGreeting = (): string => {
  const timeOfDay = getTimeOfDay();
  const greetings = {
    morning: ['Rise and shine!', 'Good morning, champion!', 'Start strong today!'],
    afternoon: ['Keep the momentum!', 'Afternoon power hour!', 'Stay focused!'],
    evening: ['Evening excellence!', 'Finish strong!', 'End on a high note!'],
    night: ['Night owl mode!', 'Late night productivity!', 'Burning the midnight oil!']
  };
  
  const options = greetings[timeOfDay];
  return options[Math.floor(Math.random() * options.length)];
};

export const calculateStreak = (dates: Date[]): number => {
  if (dates.length === 0) return 0;
  
  const sortedDates = dates
    .map(date => date.toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index)
    .sort()
    .reverse();
  
  let streak = 0;
  const today = new Date().toDateString();
  let currentDate = new Date();
  
  for (const dateString of sortedDates) {
    if (dateString === currentDate.toDateString()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};