import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { Bell, ChevronRight, CircleHelp, Moon, Palette, Shield, Star, User, Vibrate, Volume2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Linking, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [clearDataModalVisible, setClearDataModalVisible] = useState(false);

  const showModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleClearDataConfirm = async () => {
    if (Platform.OS !== 'web') {
      try {
        await AsyncStorage.clear();
        setClearDataModalVisible(false);
        showModal('Success', 'All data has been cleared.');
      } catch (error) {
        setClearDataModalVisible(false);
        showModal('Error', 'Failed to clear data.');
      }
    }
  };

  const handleClearData = () => {
    setClearDataModalVisible(true);
  };

  const handleRateApp = async () => {
    if (Platform.OS !== 'web') {
      const appStoreUrl = Platform.OS === 'ios'
        ? 'https://apps.apple.com/app/idYOUR_APPLE_ID' // Replace with actual App Store ID
        : 'https://play.google.com/store/apps/details?id=com.timevate.app';
      try {
        await Linking.openURL(appStoreUrl);
      } catch (error) {
        showModal('Error', `Unable to open ${Platform.OS === 'ios' ? 'App Store' : 'Play Store'}`);
      }
    }
  };

  const settingSections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Notifications',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Hourly nudges and reminders',
          icon: Bell,
          type: 'toggle',
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          id: 'sounds',
          title: 'Sounds',
          subtitle: 'Audio feedback for actions',
          icon: Volume2,
          type: 'toggle',
          value: soundEnabled,
          onToggle: setSoundEnabled,
        },
        {
          id: 'haptic',
          title: 'Haptic Feedback',
          subtitle: 'Vibration for interactions',
          icon: Vibrate,
          type: 'toggle',
          value: hapticEnabled,
          onToggle: setHapticEnabled,
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          id: 'theme',
          title: 'Color Themes',
          subtitle: 'Customize your experience',
          icon: Palette,
          type: 'navigation',
          onPress: () => showModal('Color Themes', 'Theme customization is coming soon! Stay tuned for exciting new ways to personalize your Timevate experience.'),
        },
        {
          id: 'darkmode',
          title: 'Dark Mode',
          subtitle: 'Switch to dark theme',
          icon: Moon,
          type: 'toggle',
          value: darkModeEnabled,
          onToggle: () => showModal('Dark Mode', 'Dark mode is coming soon! Get ready for a sleek new look in our next update.'),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Profile Settings',
          subtitle: 'Manage your account',
          icon: User,
          type: 'navigation',
          onPress: () => showModal('Profile Settings', 'Profile settings are coming soon! You will soon be able to manage your account details.'),
        },
        {
          id: 'privacy',
          title: 'Privacy & Security',
          subtitle: 'Data protection settings',
          icon: Shield,
          type: 'navigation',
          onPress: () => showModal('Privacy & Security', 'Your data is stored locally on your device and is never shared with third parties.'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'rate',
          title: 'Rate Timevate',
          subtitle: 'Help us grow the community',
          icon: Star,
          type: 'action',
          onPress: handleRateApp,
        },
        {
          id: 'help',
          title: 'Help & FAQ',
          subtitle: 'Get support and answers',
          icon: CircleHelp,
          type: 'navigation',
          onPress: () => showModal('Help & FAQ', 'For support, please contact us at hvrkarthik@gmail.com'),
        },
      ],
    },
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
        {item.subtitle && <Text style={styles.settingSubtitle}>{item.subtitle}</Text>}
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
    <LinearGradient colors={['#6C5CE7', '#5F3DC4', '#5A2D82']} style={styles.container}>
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
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={clearDataModalVisible}
        onRequestClose={() => setClearDataModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Clear All Data</Text>
            <Text style={styles.modalMessage}>
              This will permanently delete all your progress, micro-wins, and settings. This action cannot be undone.
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setClearDataModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.destructiveButton]}
                onPress={handleClearDataConfirm}
              >
                <Text style={styles.modalButtonText}>Clear Data</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
  },
  cancelButton: {
    backgroundColor: '#9CA3AF',
  },
  destructiveButton: {
    backgroundColor: '#E74C3C',
    marginLeft: 16,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});