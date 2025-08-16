import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform } from 'react-native';
import { Timer, CircleCheck as CheckCircle, Play, Pause } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTimeTracking } from '@/providers/TimeTrackingProvider';
import { microChallenges } from '@/constants/microChallenges';

interface Challenge {
  id: string;
  title: string;
  duration: number;
  description: string;
  category: string;
}

export default function ChallengesScreen() {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const { addMicroWin } = useTimeTracking();
  
  const progressAnim = useSharedValue(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleChallengeComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (activeChallenge) {
      const progress = activeChallenge.duration - timeLeft;
      const percentage = progress / activeChallenge.duration;
      progressAnim.value = withTiming(percentage, { duration: 200 });
    }
  }, [timeLeft, activeChallenge]);

  const handleStartChallenge = (challenge: Challenge) => {
    setActiveChallenge(challenge);
    setTimeLeft(challenge.duration);
    setIsRunning(true);
  };

  const handlePauseResume = () => {
    setIsRunning(!isRunning);
  };

  const handleChallengeComplete = () => {
    if (activeChallenge) {
      addMicroWin({
        id: Date.now().toString(),
        title: activeChallenge.title,
        duration: activeChallenge.duration,
        completedAt: new Date(),
        category: activeChallenge.category,
      });
      
      if (Platform.OS !== 'web') {
        Alert.alert(
          '🎉 Challenge Complete!',
          `Great job completing "${activeChallenge.title}"! Every second counts!`,
          [{ text: 'Awesome!', onPress: handleReset }]
        );
      } else {
        handleReset();
      }
    }
  };

  const handleReset = () => {
    setActiveChallenge(null);
    setTimeLeft(0);
    setIsRunning(false);
    progressAnim.value = 0;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  const groupedChallenges = microChallenges.reduce((acc, challenge) => {
    if (!acc[challenge.category]) {
      acc[challenge.category] = [];
    }
    acc[challenge.category].push(challenge);
    return acc;
  }, {} as Record<string, Challenge[]>);

  return (
    <LinearGradient
      colors={['#4A90E2', '#357ABD', '#2E86AB']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Micro-Wins</Text>
        <Text style={styles.subtitle}>Quick challenges to boost your day</Text>
      </View>

      {activeChallenge ? (
        <View style={styles.activeChallenge}>
          <View style={styles.challengeCard}>
            <Text style={styles.challengeTitle}>{activeChallenge.title}</Text>
            <Text style={styles.challengeDescription}>{activeChallenge.description}</Text>
            
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View style={[styles.progressBarFill, progressStyle]} />
              </View>
            </View>

            <View style={styles.challengeControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleReset}
              >
                <Text style={styles.controlButtonText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.controlButton, styles.primaryButton]}
                onPress={handlePauseResume}
              >
                {isRunning ? (
                  <Pause size={20} color="#FFFFFF" strokeWidth={2} />
                ) : (
                  <Play size={20} color="#FFFFFF" strokeWidth={2} />
                )}
                <Text style={styles.controlButtonText}>
                  {isRunning ? 'Pause' : 'Resume'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <ScrollView 
          style={styles.challengesList}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(groupedChallenges).map(([category, challenges]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              
              {challenges.map((challenge) => (
                <TouchableOpacity
                  key={challenge.id}
                  style={styles.challengeItem}
                  onPress={() => handleStartChallenge(challenge)}
                >
                  <View style={styles.challengeInfo}>
                    <Text style={styles.challengeItemTitle}>{challenge.title}</Text>
                    <Text style={styles.challengeItemDescription}>{challenge.description}</Text>
                    
                    <View style={styles.challengeMeta}>
                      <Timer size={16} color="#4A90E2" strokeWidth={2} />
                      <Text style={styles.durationText}>{formatTime(challenge.duration)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.startButton}>
                    <Play size={20} color="#4A90E2" strokeWidth={2} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
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
    paddingBottom: 30,
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
  activeChallenge: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  challengeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  challengeTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  challengeDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  timerContainer: {
    marginBottom: 20,
  },
  timerText: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    color: '#4A90E2',
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 30,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E8F4FD',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  challengeControls: {
    flexDirection: 'row',
    gap: 16,
  },
  controlButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#E8F4FD',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
  },
  controlButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  challengesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 16,
    marginLeft: 4,
  },
  challengeItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeItemTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  challengeItemDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#7F8C8D',
    marginBottom: 8,
    lineHeight: 20,
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4A90E2',
  },
  startButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
});