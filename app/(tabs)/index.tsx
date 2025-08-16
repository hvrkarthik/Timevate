import { motivationalWords } from '@/constants/motivationalWords';
import { useTimeTracking } from '@/providers/TimeTrackingProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { Pause, Play, RotateCcw } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isActive, setIsActive] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const { startSession, stopSession } = useTimeTracking();
  
  const pulseAnim = useSharedValue(1);
  const fadeAnim = useSharedValue(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (isActive) {
        setCurrentWordIndex(prev => (prev + 1) % motivationalWords.length);
        
        // Pulse animation for the motivational word
        fadeAnim.value = withSequence(
          withTiming(0.7, { duration: 100 }),
          withTiming(1, { duration: 100 })
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      pulseAnim.value = withTiming(1.05, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      });
      setTimeout(() => {
        pulseAnim.value = withTiming(1, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        });
      }, 1000);
    }
  }, [currentTime, isActive]);

  const handleToggle = () => {
    if (isActive) {
      stopSession();
    } else {
      startSession();
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    stopSession();
    setCurrentWordIndex(0);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  return (
    <LinearGradient
      colors={['#FF6B35', '#F7931E', '#FFB347']}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.appTitle}>Timevate</Text>
            <Text style={styles.tagline}>Every Second Counts</Text>
          </View>

        <Animated.View style={[styles.clockContainer, pulseStyle]}>
          <View style={styles.clockInner}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            
            {isActive && (
              <Animated.View style={[styles.motivationContainer, fadeStyle]}>
                <Text style={styles.motivationText}>
                  {motivationalWords[currentWordIndex]}
                </Text>
              </Animated.View>
            )}
          </View>
        </Animated.View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {isActive ? '🔥 Motivation Mode Active' : '⏸️ Ready to Start'}
          </Text>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.resetButton]}
            onPress={handleReset}
          >
            <RotateCcw size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.playButton, isActive && styles.pauseButton]}
            onPress={handleToggle}
          >
            {isActive ? (
              <Pause size={32} color="#FFFFFF" strokeWidth={2} />
            ) : (
              <Play size={32} color="#FFFFFF" strokeWidth={2} />
            )}
          </TouchableOpacity>

          <View style={styles.placeholder} />
        </View>

          <View style={styles.quickStatsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Hours Today</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>86,400</Text>
              <Text style={styles.statLabel}>Seconds to Use</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40, // Ensure content is not cut off at the bottom
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  clockContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  clockInner: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: width * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  timeText: {
    fontSize: 42,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  motivationContainer: {
    position: 'absolute',
    bottom: 60,
    paddingHorizontal: 20,
  },
  motivationText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * 0.7,
    marginBottom: 30,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  resetButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  pauseButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.8)',
  },
  placeholder: {
    width: 50,
    height: 50,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    minHeight: 80,
  },
  statNumber: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 18,
  },
});