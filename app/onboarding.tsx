import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Target, Zap, ChevronRight, Check } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const onboardingSteps = [
  {
    title: "Welcome to Timevate",
    subtitle: "Every Second Counts",
    description: "Transform your relationship with time and unlock your productivity potential.",
    icon: Clock,
    colors: ['#FF6B35', '#F7931E']
  },
  {
    title: "Live Motivation",
    subtitle: "Stay Inspired",
    description: "Get real-time motivational words to keep you focused and energized throughout your day.",
    icon: Zap,
    colors: ['#4A90E2', '#357ABD']
  },
  {
    title: "Micro-Wins",
    subtitle: "Small Steps, Big Results",
    description: "Complete quick challenges designed to build momentum and create positive habits.",
    icon: Target,
    colors: ['#2ECC71', '#27AE60']
  }
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useSharedValue(0);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      slideAnim.value = withTiming(1, { duration: 300 }, () => {
        setCurrentStep(prev => prev + 1);
        slideAnim.value = withTiming(0, { duration: 300 });
      });
    } else {
      router.replace('/(tabs)');
    }
  };

  const skip = () => {
    router.replace('/(tabs)');
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnim.value * width }],
    opacity: 1 - Math.abs(slideAnim.value),
  }));

  const currentStepData = onboardingSteps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <LinearGradient
      colors={currentStepData.colors}
      style={styles.container}
    >
      <TouchableOpacity style={styles.skipButton} onPress={skip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.content, animatedStyle]}>
        <View style={styles.iconContainer}>
          <IconComponent size={80} color="#FFFFFF" strokeWidth={2} />
        </View>

        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
        <Text style={styles.description}>{currentStepData.description}</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentStep && styles.activeDot
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
          {currentStep === onboardingSteps.length - 1 ? (
            <>
              <Check size={24} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.nextButtonText}>Get Started</Text>
            </>
          ) : (
            <>
              <Text style={styles.nextButtonText}>Next</Text>
              <ChevronRight size={24} color="#FFFFFF" strokeWidth={2} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  skipText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  nextButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nextButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});