import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Zap, TrendingUp, BookOpen, Dumbbell, Brain } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { timeImpactData } from '@/constants/timeImpactData';

const timeFrames = [
  { key: 'second', label: '1 Second', icon: Zap, color: '#FF6B35' },
  { key: 'minute', label: '1 Minute', icon: Clock, color: '#4A90E2' },
  { key: 'hour', label: '1 Hour', icon: TrendingUp, color: '#2ECC71' },
];

const categoryIcons = {
  health: Dumbbell,
  learning: Brain,
  productivity: TrendingUp,
  reading: BookOpen,
  exercise: Dumbbell,
};

export default function ImpactScreen() {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('second');
  const scaleAnim = useSharedValue(1);

  const handleTimeFrameSelect = (timeFrame: string) => {
    setSelectedTimeFrame(timeFrame);
    scaleAnim.value = withSpring(0.95, { duration: 100 }, () => {
      scaleAnim.value = withSpring(1, { duration: 100 });
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const currentData = timeImpactData[selectedTimeFrame as keyof typeof timeImpactData];

  return (
    <LinearGradient
      colors={['#2ECC71', '#27AE60', '#229954']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Time Impact</Text>
        <Text style={styles.subtitle}>Discover what you can achieve</Text>
      </View>

      <View style={styles.timeFrameSelector}>
        {timeFrames.map((frame) => {
          const IconComponent = frame.icon;
          const isSelected = selectedTimeFrame === frame.key;
          
          return (
            <TouchableOpacity
              key={frame.key}
              style={[
                styles.timeFrameButton,
                isSelected && styles.selectedTimeFrame
              ]}
              onPress={() => handleTimeFrameSelect(frame.key)}
            >
              <IconComponent 
                size={24} 
                color={isSelected ? '#FFFFFF' : frame.color} 
                strokeWidth={2} 
              />
              <Text style={[
                styles.timeFrameText,
                isSelected && styles.selectedTimeFrameText
              ]}>
                {frame.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Animated.View style={[styles.contentContainer, animatedStyle]}>
        <ScrollView 
          style={styles.impactList}
          showsVerticalScrollIndicator={false}
        >
          {currentData.map((item, index) => {
            const IconComponent = categoryIcons[item.category as keyof typeof categoryIcons] || Zap;
            
            return (
              <View key={index} style={styles.impactCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                    <IconComponent size={24} color={item.color} strokeWidth={2} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.impactTitle}>{item.title}</Text>
                    <Text style={styles.impactDescription}>{item.description}</Text>
                  </View>
                </View>
                
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{item.value}</Text>
                    <Text style={styles.statLabel}>Achievement</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{item.impact}</Text>
                    <Text style={styles.statLabel}>Impact Level</Text>
                  </View>
                </View>
              </View>
            );
          })}
          
          <View style={styles.motivationSection}>
            <Text style={styles.motivationTitle}>💡 Remember</Text>
            <Text style={styles.motivationText}>
              Small actions compound into extraordinary results. Every moment is an opportunity to move closer to your goals!
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
  timeFrameSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  timeFrameButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    gap: 8,
  },
  selectedTimeFrame: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  timeFrameText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2C3E50',
  },
  selectedTimeFrameText: {
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  },
  impactList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  impactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  impactTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  impactDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#7F8C8D',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E9ECEF',
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#7F8C8D',
  },
  motivationSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  motivationTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  motivationText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    lineHeight: 24,
    opacity: 0.9,
  },
});