import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, TrendingUp, Award, Clock, Target } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTimeTracking } from '@/providers/TimeTrackingProvider';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const { timeData, microWins, getTimeSpentToday, getWeeklyStats } = useTimeTracking();
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  
  const progressAnim = useSharedValue(0);

  useEffect(() => {
    progressAnim.value = withTiming(1, { duration: 1000 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progressAnim.value,
    transform: [{ translateY: (1 - progressAnim.value) * 20 }],
  }));

  const todayData = getTimeSpentToday();
  const weeklyData = getWeeklyStats();
  const todayWins = microWins.filter(win => {
    const today = new Date().toDateString();
    return win.completedAt.toDateString() === today;
  });

  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getMotivationalMessage = () => {
    const winCount = todayWins.length;
    const timeSpent = todayData.totalActiveTime;
    
    if (winCount >= 5) {
      return "🔥 You're absolutely crushing it today! Keep the momentum going!";
    } else if (winCount >= 3) {
      return "💪 Great progress today! You're building powerful habits!";
    } else if (winCount >= 1) {
      return "🌟 Good start! Every small win counts towards your bigger goals!";
    } else if (timeSpent > 3600) {
      return "⏰ You've been active today! Consider adding some micro-wins to maximize your impact!";
    }
    return "🚀 Ready to make today count? Start with a quick challenge!";
  };

  return (
    <LinearGradient
      colors={['#9B59B6', '#8E44AD', '#7D3C98']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Your Journey</Text>
        <Text style={styles.subtitle}>Track your progress and celebrate wins</Text>
      </View>

      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.selectedPeriod
            ]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Text style={[
              styles.periodText,
              selectedPeriod === period.key && styles.selectedPeriodText
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.View style={[styles.content, animatedStyle]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Today's Summary</Text>
            <Text style={styles.motivationMessage}>{getMotivationalMessage()}</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Clock size={24} color="#FF6B35" strokeWidth={2} />
                <Text style={styles.statNumber}>{formatDuration(todayData.totalActiveTime)}</Text>
                <Text style={styles.statLabel}>Active Time</Text>
              </View>
              
              <View style={styles.statCard}>
                <Target size={24} color="#4A90E2" strokeWidth={2} />
                <Text style={styles.statNumber}>{todayWins.length}</Text>
                <Text style={styles.statLabel}>Micro-Wins</Text>
              </View>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Award size={24} color="#2ECC71" strokeWidth={2} />
                <Text style={styles.statNumber}>{todayData.sessions}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              
              <View style={styles.statCard}>
                <TrendingUp size={24} color="#E74C3C" strokeWidth={2} />
                <Text style={styles.statNumber}>
                  {todayData.totalActiveTime > 0 ? Math.round((todayWins.length / (todayData.totalActiveTime / 3600)) * 10) / 10 : 0}
                </Text>
                <Text style={styles.statLabel}>Wins/Hour</Text>
              </View>
            </View>
          </View>

          {todayWins.length > 0 && (
            <View style={styles.winsSection}>
              <Text style={styles.sectionTitle}>Today's Achievements</Text>
              {todayWins.map((win, index) => (
                <View key={win.id} style={styles.winCard}>
                  <View style={styles.winIcon}>
                    <Award size={20} color="#2ECC71" strokeWidth={2} />
                  </View>
                  <View style={styles.winContent}>
                    <Text style={styles.winTitle}>{win.title}</Text>
                    <Text style={styles.winTime}>
                      {win.completedAt.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>
                  <View style={styles.winDuration}>
                    <Text style={styles.winDurationText}>
                      {formatDuration(win.duration)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.weeklyOverview}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <View style={styles.weeklyCard}>
              <View style={styles.weeklyStats}>
                <View style={styles.weeklyStat}>
                  <Text style={styles.weeklyNumber}>{weeklyData.totalWins}</Text>
                  <Text style={styles.weeklyLabel}>Total Wins</Text>
                </View>
                <View style={styles.weeklyStat}>
                  <Text style={styles.weeklyNumber}>{formatDuration(weeklyData.totalTime)}</Text>
                  <Text style={styles.weeklyLabel}>Active Time</Text>
                </View>
                <View style={styles.weeklyStat}>
                  <Text style={styles.weeklyNumber}>{weeklyData.averageDaily}</Text>
                  <Text style={styles.weeklyLabel}>Avg Daily Wins</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.inspirationSection}>
            <Text style={styles.inspirationTitle}>💎 Time Wisdom</Text>
            <Text style={styles.inspirationText}>
              "Time is the most valuable thing we have, because it is the most irreversible. Make every second count towards your dreams."
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedPeriod: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  periodText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  selectedPeriodText: {
    opacity: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  motivationMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#7F8C8D',
    lineHeight: 24,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#2C3E50',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 16,
  },
  winsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 16,
    marginLeft: 4,
  },
  winCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  winIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  winContent: {
    flex: 1,
  },
  winTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  winTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#7F8C8D',
  },
  winDuration: {
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  winDurationText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#4A90E2',
  },
  weeklyOverview: {
    marginBottom: 20,
  },
  weeklyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weeklyStat: {
    alignItems: 'center',
  },
  weeklyNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  weeklyLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#7F8C8D',
    textAlign: 'center',
  },
  inspirationSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  inspirationTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  inspirationText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    lineHeight: 24,
    opacity: 0.9,
  },
});