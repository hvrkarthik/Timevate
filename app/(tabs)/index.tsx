import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming, cancelAnimation } from 'react-native-reanimated';
import { Pause, Play, RotateCcw } from 'lucide-react-native';

import { motivationalWords as MOTIVATION_SOURCE } from '@/constants/motivationalWords';
import { useTimeTracking } from '@/providers/TimeTrackingProvider';

// ------ Types ------
type MaybePromise = void | Promise<void>;

// ------ Component ------
export default function HomeScreen() {
  // Responsive sizing
  const { width } = useWindowDimensions();
  const circleSize = Math.min(width * 0.8, 420);
  const circleRadius = circleSize / 2;

  // Time + session state
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [isActive, setIsActive] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>('active');

  // Defensive: ensure we always have at least one word to show
  const words = useMemo<string[]>(
    () => Array.isArray(MOTIVATION_SOURCE) && MOTIVATION_SOURCE.length > 0
      ? MOTIVATION_SOURCE
      : ['Keep going', 'You’ve got this', 'Stay focused', 'Small steps add up'],
    []
  );
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Provider
  const { startSession, stopSession } = useTimeTracking();

  // Animations
  const pulse = useSharedValue(1);
  const fade = useSharedValue(1);

  const tickerRef = useRef<NodeJS.Timer | null>(null);

  // AppState handling — pause timers in background (good for Play policies and battery)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      setAppState(next);
    });
    return () => sub.remove();
  }, []);

  // 1-second ticker that only runs when active AND app is foregrounded
  useEffect(() => {
    // Clear any existing
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }

    const shouldRun = isActive && appState === 'active';
    if (!shouldRun) return; // not running in background or when inactive

    tickerRef.current = setInterval(() => {
      setCurrentTime(new Date());

      // advance word index safely
      setCurrentWordIndex((prev) => (prev + 1) % words.length);

      // fade "pulse" on the word
      fade.value = withSequence(
        withTiming(0.7, { duration: 120 }),
        withTiming(1, { duration: 120 })
      );

      // soft pulse on the clock
      cancelAnimation(pulse);
      pulse.value = withSequence(
        withTiming(1.05, { duration: 240, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 240, easing: Easing.inOut(Easing.ease) })
      );
    }, 1000);

    return () => {
      if (tickerRef.current) {
        clearInterval(tickerRef.current);
        tickerRef.current = null;
      }
    };
  }, [isActive, appState, words.length, fade, pulse]);

  // Cleanup animations on unmount just in case
  useEffect(() => {
    return () => {
      cancelAnimation(pulse);
      cancelAnimation(fade);
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, [pulse, fade]);

  // Actions
  const handleToggle = useCallback(async () => {
    try {
      const action: MaybePromise = isActive ? stopSession() : startSession();
      await action;
      setIsActive((v) => !v);
    } catch (e) {
      // Don’t crash the app on release if provider throws
      console.warn('[Timevate] Session toggle failed:', e);
    }
  }, [isActive, startSession, stopSession]);

  const handleReset = useCallback(async () => {
    try {
      if (isActive) {
        await stopSession();
      }
    } catch (e) {
      console.warn('[Timevate] Stop session failed on reset:', e);
    } finally {
      setIsActive(false);
      setCurrentWordIndex(0);
      // reset animations to baseline
      cancelAnimation(pulse);
      cancelAnimation(fade);
      pulse.value = 1;
      fade.value = 1;
    }
  }, [isActive, stopSession, pulse, fade]);

  // Helpers
  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
  }));

  return (
    <LinearGradient
      colors={['#FF6B35', '#F7931E', '#FFB347']}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        // Ensure scroll is stable even with large fonts
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.appTitle}>Timevate</Text>
            <Text style={styles.tagline}>Every Second Counts</Text>
          </View>

          <Animated.View style={[styles.clockContainer, { width: circleSize, height: circleSize }, pulseStyle]}>
            <View style={[
              styles.clockInner,
              {
                borderRadius: circleRadius,
              }
            ]}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

              {isActive ? (
                <Animated.View style={[styles.motivationContainer, fadeStyle]}>
                  <Text style={styles.motivationText} numberOfLines={2}>
                    {words[currentWordIndex] ?? words[0]}
                  </Text>
                </Animated.View>
              ) : null}
            </View>
          </Animated.View>

          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              {isActive ? '🔥 Motivation Mode Active' : '⏸️ Ready to Start'}
            </Text>
          </View>

          <View style={[styles.controlsContainer, { width: Math.min(width * 0.7, 420) }]}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Reset session"
              style={[styles.controlButton, styles.resetButton]}
              onPress={handleReset}
            >
              <RotateCcw size={24} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={isActive ? 'Pause session' : 'Start session'}
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

// ------ Styles ------
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
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
    // If custom fonts are not loaded, fall back to system font gracefully
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  clockInner: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
