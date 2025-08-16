import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, ChevronRight, CircleHelp as HelpCircle, Moon, Palette, Shield, Star, User, Vibrate, Volume2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  const handleClearData = () => {
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Clear All Data',
        'This will permanently delete all your progress, micro-wins, and settings. This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Clear Data', 
            style: 'destructive',
            onPress: async () => {
              try {
                await AsyncStorage.clear();
                Alert.alert('Success', 'All data has been cleared.');
              } catch (error) {
                Alert.alert('Error', 'Failed to clear data.');
              }
            }
          }
        ]
      );
    }
  };

  const handleRateApp = () => {
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Rate Timevate',
        'Love using Timevate? Please rate us on the App Store to help others discover the power of motivated time management!',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Rate Now', onPress: () => console.log('Navigate to app store') }
        ]
      );
    }
  };

  const settingSections = [
    {
      title: 'Notifications',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Hourly nudges and reminders',
          icon: Bell,
          type: 'toggle' as const,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          id: 'sounds',
          title: 'Sounds',
          subtitle: 'Audio feedback for actions',
          icon: Volume2,
          type: 'toggle' as const,
          value: soundEnabled,
          onToggle: setSoundEnabled,
        },
        {
          id: 'haptic',
          title: 'Haptic Feedback',
          subtitle: 'Vibration for interactions',
          icon: Vibrate,
          type: 'toggle' as const,
          value: hapticEnabled,
          onToggle: setHapticEnabled,
        },
      ]
    },
    {
      title: 'Appearance',
      items: [
        {
          id: 'theme',
          title: 'Color Themes',
          subtitle: 'Customize your experience',
          icon: Palette,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Coming Soon', 'Theme customization will be available in the next update!'),
        },
        {
          id: 'darkmode',
          title: 'Dark Mode',
          subtitle: 'Switch to dark theme',
          icon: Moon,
          type: 'toggle' as const,
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled,
        },
      ]
    },
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Profile Settings',
          subtitle: 'Manage your account',
          icon: User,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Coming Soon', 'Profile settings will be available soon!'),
        },
        {
          id: 'privacy',
          title: 'Privacy & Security',
          subtitle: 'Data protection settings',
          icon: Shield,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Privacy', 'Your data is stored locally on your device and is never shared with third parties.'),
        },
      ]
    },
    {
      title: 'Support',
      items: [
        {
          id: 'rate',
          title: 'Rate Timevate',
          subtitle: 'Help us grow the community',
          icon: Star,
          type: 'action' as const,
          onPress: handleRateApp,
        },
        {
          id: 'help',
          title: 'Help & FAQ',
          subtitle: 'Get support and answers',
          icon: HelpCircle,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Help', 'For support, please contact us at hello@timevate.app'),
        },
      ]
    }
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
    >
      <View style={styles.settingIcon}>
        <item.icon size={24} color="#4A90E2" strokeWidth={2} />
      </View>
      
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      
      <View style={styles.settingAction}>
        {item.type === 'toggle' && item.onToggle ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#D1D5DB', true: '#FF6B35' }}
            thumbColor={item.value ? '#FFFFFF' : '#F3F4F6'}
          />
        ) : (
          <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#6C5CE7', '#5F3DC4', '#5A2D82']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your Timevate experience</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Timevate v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with ❤️ for productivity enthusiasts</Text>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#7F8C8D',
  },
  settingAction: {
    marginLeft: 16,
  },
  dangerButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  dangerButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.6,
  },
});